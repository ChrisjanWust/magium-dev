#!/usr/bin/env node
/**
 * docs/prompts/build.js
 *
 * Composes agent prompts from shared + specific markdown fragments and injects
 * live metrics computed from data/en/*.magium.
 *
 *   book-master prompt = _master.md + _bookmaster-core.md + book<N>-master.md + <unit table>
 *   writer prompt      = _master.md + _writer-core.md + <unit data> + units/<id>.md
 *
 * Metrics are computed at build time so the prompts can never drift from the corpus.
 *
 * Usage:
 *   node docs/prompts/build.js            # build everything into docs/prompts/build/
 *   node docs/prompts/build.js --check    # verify only, exit 1 on problems, write nothing
 */

const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..", "..");
const PROMPTS = __dirname;
const UNITS_DIR = path.join(PROMPTS, "units");
const OUT_DIR = path.join(PROMPTS, "build");
const DATA_DIR = path.join(REPO, "data", "en");

const CHECK_ONLY = process.argv.includes("--check");

const STRUCTURAL = /^(ID:|TEXT:|#if|\}|set\(|achievement\(|choice\()/;

/* Flags that are engine/stat plumbing rather than story state. Excluded from
 * the coupling report so it stays signal, not noise. */
const PLUMBING = new Set([
    "v_current_scene", "v_checkpoint_rich", "v_chapter_save_counter",
    "v_next_chapter_crash", "v_is_dead", "v_available_points",
    "v_available_points_aux", "v_strength", "v_toughness", "v_agility",
    "v_reflexes", "v_hearing", "v_perception", "v_ancient_languages",
    "v_combat_technique", "v_premonition", "v_bluff", "v_magical_sense",
    "v_aura_hardening", "v_magical_power", "v_magical_knowledge",
]);

const problems = [];
const fail = (m) => problems.push(m);

/* ------------------------------------------------------------------ corpus */

function analyseCorpus() {
    const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".magium"));
    const stats = {};
    const setIn = {};
    const readIn = {};

    for (const f of files) {
        const text = fs.readFileSync(path.join(DATA_DIR, f), "utf8");
        const lines = text.split("\n");

        const prose = lines.filter((l) => !STRUCTURAL.test(l.trimStart()));
        const scenes = lines.filter((l) => l.startsWith("ID: ")).length;
        const choices = lines.filter((l) => l.trimStart().startsWith("choice(")).length;
        const words = prose.join(" ").split(/\s+/).filter(Boolean).length;

        stats[f] = {
            words, scenes, choices,
            lines: lines.length,
            ifs: lines.filter((l) => l.trimStart().startsWith("#if")).length,
            wordsPerScene: scenes ? Math.round(words / scenes) : 0,
            choicesPerScene: scenes ? +(choices / scenes).toFixed(2) : 0,
        };

        for (const v of text.match(/\bv_[a-z0-9_]+/gi) || []) {
            if (PLUMBING.has(v)) continue;
            (readIn[v] ||= new Set()).add(f);
        }
        for (const line of lines) {
            const s = line.trimStart();
            if (!s.startsWith("set(") && !s.startsWith("choice(")) continue;
            for (const v of s.match(/\bv_[a-z0-9_]+(?=\s*=)/gi) || []) {
                if (PLUMBING.has(v)) continue;
                (setIn[v] ||= new Set()).add(f);
            }
        }
    }
    return { files, stats, setIn, readIn };
}

/* ------------------------------------------------------------- frontmatter */

function parseUnit(file) {
    const raw = fs.readFileSync(path.join(UNITS_DIR, file), "utf8");
    const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!m) {
        fail(`units/${file}: missing or malformed front matter`);
        return null;
    }
    const meta = {};
    for (const line of m[1].split("\n")) {
        const kv = line.match(/^([a-z]+):\s*(.*)$/);
        if (kv) meta[kv[1]] = kv[2].trim();
    }
    for (const key of ["unit", "book", "files"]) {
        if (!meta[key]) fail(`units/${file}: front matter missing '${key}'`);
    }
    meta.files = (meta.files || "").split(",").map((s) => s.trim()).filter(Boolean);
    meta.patterns = (meta.patterns || "").split(",").map((s) => s.trim()).filter(Boolean);
    meta.segments = (meta.segment || "").split(",").map((s) => s.trim()).filter(Boolean);
    return { meta, body: m[2].trimStart(), source: `units/${file}` };
}

/* ------------------------------------------------------- injected sections */

function unitDataBlock(unit, corpus) {
    const { stats, setIn, readIn } = corpus;
    const owned = new Set(unit.meta.files);

    const rows = unit.meta.files.map((f) => {
        const s = stats[f];
        if (!s) { fail(`${unit.source}: '${f}' not found in data/en/`); return null; }
        return `| \`${f}\` | ${s.words.toLocaleString()} | ${s.scenes} | ${s.choices} | ${s.wordsPerScene} | ${s.choicesPerScene} | ${s.ifs} |`;
    }).filter(Boolean);

    const total = unit.meta.files.reduce((a, f) => a + (stats[f]?.words || 0), 0);

    /* project-wide averages, for calibration */
    const all = Object.values(stats);
    const avgWPS = Math.round(all.reduce((a, s) => a + s.wordsPerScene, 0) / all.length);
    const avgCPS = +(all.reduce((a, s) => a + s.choicesPerScene, 0) / all.length).toFixed(2);

    /* outbound: flags this unit sets that files outside the unit read */
    const outbound = [];
    /* inbound: flags this unit reads that are set outside the unit */
    const inbound = [];

    for (const [flag, setters] of Object.entries(setIn)) {
        const readers = readIn[flag] || new Set();
        if ([...setters].some((f) => owned.has(f))) {
            const ext = [...readers].filter((f) => !owned.has(f));
            if (ext.length) outbound.push([flag, ext]);
        }
    }
    for (const [flag, readers] of Object.entries(readIn)) {
        if (![...readers].some((f) => owned.has(f))) continue;
        const setters = setIn[flag];
        if (!setters) continue;
        const ext = [...setters].filter((f) => !owned.has(f));
        if (ext.length && ![...setters].some((f) => owned.has(f))) inbound.push([flag, ext]);
    }

    const short = (f) => f.replace(".magium", "");
    const fmt = (list) =>
        list.length
            ? list
                  .sort((a, b) => b[1].length - a[1].length)
                  .map(([flag, fs_]) => `| \`${flag}\` | ${fs_.map(short).map((s) => `\`${s}\``).join(", ")} |`)
                  .join("\n")
            : "| _none_ | |";

    return `## Your unit data (generated — do not edit by hand)

**Unit:** \`${unit.meta.unit}\` · **Book:** ${unit.meta.book} · **Chapters:** ${unit.meta.chapters || "—"}
**Total prose in your unit:** ~${total.toLocaleString()} words across ${unit.meta.files.length} file(s)
**Priority patterns:** ${unit.meta.patterns.join(", ") || "—"}
**Segment doc to read first:** ${unit.meta.segments.map((s) => `\`${s}\``).join(", ") || "—"}

### Files you own — exclusive write access

| file | words | scenes | choices | words/scene | choices/scene | #if blocks |
|---|---:|---:|---:|---:|---:|---:|
${rows.join("\n")}

Project averages for calibration: **${avgWPS} words/scene**, **${avgCPS} choices/scene**.
A file far above words/scene is a Pattern 7 (white-room) suspect.
A file far above choices/scene is a Pattern 3 / Pattern 5 suspect.

### Inbound flags — state you inherit but do not set

Prose gated on these must read correctly for **every** value. Your continuity contract is
authoritative on what each value means.

| flag | set in |
|---|---|
${fmt(inbound)}

### Outbound flags — state you author for others

Other writers depend on these. Record what each value means **emotionally** (not just mechanically)
in your \`CONTINUITY EXIT STATE\` report.

| flag | read in |
|---|---|
${fmt(outbound)}

> Files listed above that you do **not** own are read-only to you. If a fix requires editing one,
> report it under \`CROSS-FILE\` — never edit it.
`;
}

function unitTableBlock(book, units, corpus) {
    const mine = units
        .filter((u) => String(u.meta.book) === String(book))
        .sort((a, b) => a.meta.unit.localeCompare(b.meta.unit, undefined, { numeric: true }));

    const rows = mine.map((u) => {
        const words = u.meta.files.reduce((a, f) => a + (corpus.stats[f]?.words || 0), 0);
        return `| \`${u.meta.unit}\` | ${u.meta.chapters || "—"} | ${u.meta.files.map((f) => `\`${f.replace(".magium", "")}\``).join(", ")} | ${words.toLocaleString()} | ${u.meta.patterns.join(", ")} | \`build/${u.meta.unit}.prompt.md\` |`;
    });

    const total = mine.reduce(
        (a, u) => a + u.meta.files.reduce((b, f) => b + (corpus.stats[f]?.words || 0), 0), 0);
    const nFiles = mine.reduce((a, u) => a + u.meta.files.length, 0);

    return `## Unit dispatch table (generated — do not edit by hand)

| unit | chapters | files owned | words | priority patterns | prompt to pass |
|---|---|---|---:|---|---|
${rows.join("\n")}

**${mine.length} units · ${nFiles} files · ~${total.toLocaleString()} words.**

Units are **file-disjoint by construction** — every file appears in exactly one unit, so all units
may run concurrently. Verified at build time.
`;
}

/* ----------------------------------------------------------------- compose */

const read = (f) => {
    const p = path.join(PROMPTS, f);
    if (!fs.existsSync(p)) { fail(`missing fragment: ${f}`); return ""; }
    return fs.readFileSync(p, "utf8").trimEnd();
};

function banner(kind, id) {
    return `<!-- GENERATED by docs/prompts/build.js — do not edit this file.
     Edit the fragments in docs/prompts/ and rebuild.
     kind: ${kind}   id: ${id}   built: ${new Date().toISOString()} -->`;
}

function main() {
    const corpus = analyseCorpus();

    const unitFiles = fs.existsSync(UNITS_DIR)
        ? fs.readdirSync(UNITS_DIR).filter((f) => f.endsWith(".md")).sort()
        : [];
    if (!unitFiles.length) fail("no unit files found in docs/prompts/units/");

    const units = unitFiles.map(parseUnit).filter(Boolean);

    /* --- integrity: every story file owned exactly once, no overlaps --- */
    const owner = {};
    for (const u of units) {
        for (const f of u.meta.files) {
            if (owner[f]) fail(`FILE LOCK CONFLICT: '${f}' owned by both ${owner[f]} and ${u.meta.unit}`);
            owner[f] = u.meta.unit;
        }
    }
    const inScope = corpus.files.filter((f) => /^b[23]ch/.test(f));
    for (const f of inScope) {
        if (!owner[f]) fail(`UNASSIGNED: '${f}' is in scope but no unit owns it`);
    }
    for (const f of Object.keys(owner)) {
        if (!corpus.stats[f]) fail(`GHOST: unit owns '${f}' which does not exist`);
        if (/^ch/.test(f)) fail(`OUT OF SCOPE: '${f}' is Book 1 (committed) and must not be assigned`);
    }

    const master = read("_master.md");
    const writerCore = read("_writer-core.md");
    const bmCore = read("_bookmaster-core.md");

    const outputs = [];

    for (const u of units) {
        outputs.push({
            name: `${u.meta.unit}.prompt.md`,
            body: [
                banner("writer", u.meta.unit),
                master,
                writerCore,
                unitDataBlock(u, corpus),
                u.body,
            ].join("\n\n---\n\n") + "\n",
        });
    }

    for (const book of ["2", "3"]) {
        const specific = read(`book${book}-master.md`);
        if (!specific) continue;
        outputs.push({
            name: `book${book}-master.prompt.md`,
            body: [
                banner("book-master", `book${book}`),
                master,
                bmCore,
                specific,
                unitTableBlock(book, units, corpus),
            ].join("\n\n---\n\n") + "\n",
        });
    }

    if (problems.length) {
        console.error("BUILD FAILED\n");
        problems.forEach((p) => console.error("  ✗ " + p));
        process.exit(1);
    }

    if (CHECK_ONLY) {
        console.log(`check OK — ${units.length} units, ${Object.keys(owner).length} files owned, no conflicts`);
        return;
    }

    fs.mkdirSync(OUT_DIR, { recursive: true });
    for (const o of outputs) {
        fs.writeFileSync(path.join(OUT_DIR, o.name), o.body);
    }

    /* manifest */
    const manifest = outputs
        .map((o) => {
            const kb = (Buffer.byteLength(o.body) / 1024).toFixed(1);
            return `  ${o.name.padEnd(30)} ${kb.padStart(7)} KB`;
        })
        .join("\n");

    const b2 = units.filter((u) => String(u.meta.book) === "2").length;
    const b3 = units.filter((u) => String(u.meta.book) === "3").length;

    console.log(`Built ${outputs.length} prompts -> docs/prompts/build/\n`);
    console.log(manifest);
    console.log(`\nBook 2: ${b2} writer units   Book 3: ${b3} writer units`);
    console.log(`Files under management: ${Object.keys(owner).length} (all of data/en/b[23]ch*.magium)`);
    console.log(`\nAcceptance gate (book-masters run this per unit and per book):`);
    console.log(`  node docs/prompts/verify.js --unit <unit-id>`);
    console.log(`  node docs/prompts/verify.js --book <2|3>`);
    console.log(`\nOperator: launch book-masters with`);
    console.log(`  docs/prompts/build/book2-master.prompt.md`);
    console.log(`  docs/prompts/build/book3-master.prompt.md`);
}

main();
