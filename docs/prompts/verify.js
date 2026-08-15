#!/usr/bin/env node
/**
 * docs/prompts/verify.js
 *
 * Semantic verification of writer output. Book-masters MUST run this after every
 * writer returns — it is the acceptance gate, not the writer's own report.
 *
 * Why semantic and not `diff`: scripts/fingerprint.js emits JSON in which
 *   - `paragraphs` is an array flushed at #if / } boundaries, so its LENGTH
 *     changes if and only if a conditional block was added, removed, or re-nested.
 *     Rewriting prose inside an existing block is fingerprint-neutral.
 *   - `choices[].text` is the choice label.
 * A raw text diff cannot distinguish "sanctioned label rewrite" from
 * "writer silently mutated the game graph". This can.
 *
 * Usage:
 *   node docs/prompts/verify.js --book 2
 *   node docs/prompts/verify.js --unit b3-u10
 *   node docs/prompts/verify.js --book 3 --json
 *   node docs/prompts/verify.js --all
 *
 * Exit 0 = accept. Exit 1 = reject; do not accept the writer's work.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const REPO = path.resolve(__dirname, "..", "..");
const UNITS_DIR = path.join(__dirname, "units");
const DATA_REL = "data/en";
const TMP = path.join(require("os").tmpdir(), "magium-verify");

const argv = process.argv.slice(2);
const arg = (k) => { const i = argv.indexOf(k); return i < 0 ? null : argv[i + 1]; };
const has = (k) => argv.includes(k);

const BOOK = arg("--book");
const UNIT = arg("--unit");
const BASE = arg("--base") || "HEAD";
const AS_JSON = has("--json");
const STRICT = has("--strict");
const DRIFT_LIMIT = Number(arg("--drift") || 20); // percent, per file

const sh = (c) => execSync(c, { cwd: REPO, encoding: "utf8", maxBuffer: 1 << 28 });
const shq = (c) => { try { return sh(c); } catch { return null; } };

const STRUCTURAL = /^(ID:|TEXT:|#if|\}|set\(|achievement\(|choice\()/;
const words = (text) =>
    text.split("\n").filter((l) => !STRUCTURAL.test(l.trimStart()))
        .join(" ").split(/\s+/).filter(Boolean).length;

/* ------------------------------------------------------------- unit loading */

function loadUnits() {
    if (!fs.existsSync(UNITS_DIR)) return [];
    return fs.readdirSync(UNITS_DIR).filter((f) => f.endsWith(".md")).map((f) => {
        const raw = fs.readFileSync(path.join(UNITS_DIR, f), "utf8");
        const m = raw.match(/^---\n([\s\S]*?)\n---/);
        if (!m) return null;
        const meta = {};
        for (const line of m[1].split("\n")) {
            const kv = line.match(/^([a-z]+):\s*(.*)$/);
            if (kv) meta[kv[1]] = kv[2].trim();
        }
        meta.files = (meta.files || "").split(",").map((s) => s.trim()).filter(Boolean);
        return meta;
    }).filter(Boolean);
}

function scope(units) {
    if (UNIT) {
        const u = units.find((x) => x.unit === UNIT);
        if (!u) die(`unknown unit '${UNIT}'`);
        return { label: `unit ${UNIT}`, files: u.files, unit: u };
    }
    if (BOOK) {
        const fl = units.filter((u) => String(u.book) === String(BOOK))
                        .flatMap((u) => u.files).sort();
        if (!fl.length) die(`no units for book ${BOOK}`);
        return { label: `book ${BOOK}`, files: fl };
    }
    return { label: "all managed files", files: units.flatMap((u) => u.files).sort() };
}

function die(m) { console.error("verify: " + m); process.exit(2); }

/* ------------------------------------------------------------ fingerprinting */

function fingerprint(absFile) {
    const out = shq(`node scripts/fingerprint.js ${JSON.stringify(absFile)}`);
    if (out === null) return null;
    try { return JSON.parse(out); } catch { return null; }
}

function baselineFingerprint(rel) {
    fs.mkdirSync(TMP, { recursive: true });
    const tmp = path.join(TMP, path.basename(rel));
    const src = shq(`git show ${BASE}:${rel}`);
    if (src === null) return { missing: true };
    fs.writeFileSync(tmp, src);
    return { fp: fingerprint(tmp), words: words(src) };
}

const sig = (v) => JSON.stringify(v ?? null);

/** Classify every structural delta between two fingerprints. */
function classify(before, after) {
    const violations = [];
    const sanctioned = [];

    const ids = new Set([...Object.keys(before), ...Object.keys(after)]);
    for (const id of ids) {
        const A = before[id], B = after[id];
        if (!A) { violations.push({ id, kind: "SCENE_ADDED" }); continue; }
        if (!B) { violations.push({ id, kind: "SCENE_REMOVED" }); continue; }

        if (A.paragraphs.length !== B.paragraphs.length) {
            violations.push({
                id, kind: "CONDITIONAL_BLOCK_CHANGED",
                detail: `paragraph entries ${A.paragraphs.length} -> ${B.paragraphs.length} ` +
                        `(an #if block was added, removed, or re-nested)`,
            });
        } else {
            for (let i = 0; i < A.paragraphs.length; i++) {
                if (sig(A.paragraphs[i].conditions) !== sig(B.paragraphs[i].conditions)) {
                    violations.push({
                        id, kind: "PARAGRAPH_CONDITION_CHANGED",
                        detail: `entry ${i}: ${sig(A.paragraphs[i].conditions)} -> ${sig(B.paragraphs[i].conditions)}`,
                    });
                }
            }
        }

        if (sig(A.setVariables) !== sig(B.setVariables))
            violations.push({ id, kind: "SCENE_SETVARS_CHANGED" });
        if (sig(A.achievements) !== sig(B.achievements))
            violations.push({ id, kind: "ACHIEVEMENTS_CHANGED" });

        if (A.choices.length !== B.choices.length) {
            violations.push({
                id, kind: "CHOICE_COUNT_CHANGED",
                detail: `${A.choices.length} -> ${B.choices.length}`,
            });
        } else {
            for (let i = 0; i < A.choices.length; i++) {
                const a = A.choices[i], b = B.choices[i];
                for (const k of ["target", "setVariables", "special", "conditions"]) {
                    if (sig(a[k]) !== sig(b[k])) {
                        violations.push({
                            id, kind: "CHOICE_WIRING_CHANGED",
                            detail: `choice[${i}].${k}: ${sig(a[k])} -> ${sig(b[k])}`,
                        });
                    }
                }
                if (a.text !== b.text) {
                    sanctioned.push({ id, index: i, before: a.text, after: b.text });
                }
            }
        }
    }
    return { violations, sanctioned };
}

/* --------------------------------------------------------------- lock check */

function lockCheck(expected, managedAll, managedThisBook) {
    const out = [];
    const info = [];
    const status = sh("git status --porcelain").trimEnd();
    const lines = status ? status.split("\n") : [];
    const rel = (f) => `${DATA_REL}/${f}`;
    const expectedSet = new Set(expected.map(rel));
    const allSet = new Set(managedAll.map(rel));
    const bookSet = new Set(managedThisBook.map(rel));

    for (const line of lines) {
        const code = line.slice(0, 2);
        const p = line.slice(3).trim().replace(/^"|"$/g, "");

        if (p.startsWith("data/fr/")) { out.push({ kind: "FORBIDDEN_LOCALE", detail: p }); continue; }
        if (/^data\/en\/ch\d/.test(p)) { out.push({ kind: "BOOK1_MODIFIED", detail: p }); continue; }
        if (p.startsWith("src/") || p.startsWith("scripts/") || p.startsWith("templates/") ||
            p.startsWith("public/") || p === "package.json") {
            out.push({ kind: "CODE_MODIFIED", detail: p }); continue;
        }
        if (!p.startsWith(DATA_REL + "/")) continue;

        if (code.includes("?")) { out.push({ kind: "FILE_CREATED", detail: p }); continue; }
        if (code.includes("D")) { out.push({ kind: "FILE_DELETED", detail: p }); continue; }

        if (expectedSet.has(p)) continue;                     // in scope — fine

        if (!allSet.has(p)) {                                 // owned by nobody — genuine breach
            out.push({ kind: "OUT_OF_LOCK_WRITE", detail: p });
        } else if (!bookSet.has(p)) {                         // the other book's master, running concurrently
            info.push({ kind: "CONCURRENT_OTHER_BOOK", detail: p });
        } else if (STRICT) {                                  // sibling unit in this book
            out.push({ kind: "OUT_OF_LOCK_WRITE", detail: p });
        } else {
            info.push({ kind: "CONCURRENT_SIBLING_UNIT", detail: p });
        }
    }
    return { violations: out, info };
}

/* -------------------------------------------------------------------- main */

function main() {
    const units = loadUnits();
    if (!units.length) die("no units found; run build.js first");
    const S = scope(units);

    const report = { scope: S.label, base: BASE, files: [], lock: [], totals: {} };
    let hardFail = false;

    for (const f of S.files) {
        const rel = `${DATA_REL}/${f}`;
        const abs = path.join(REPO, rel);
        const row = { file: f, status: "OK", violations: [], sanctioned: [], drift: null };

        if (!fs.existsSync(abs)) {
            row.status = "MISSING"; row.violations.push({ kind: "FILE_MISSING" });
            hardFail = true; report.files.push(row); continue;
        }

        const nowText = fs.readFileSync(abs, "utf8");
        const nowFp = fingerprint(abs);
        if (!nowFp) {
            row.status = "PARSE_FAIL"; row.violations.push({ kind: "PARSE_FAIL" });
            hardFail = true; report.files.push(row); continue;
        }

        const base = baselineFingerprint(rel);
        if (base.missing || !base.fp) {
            row.status = "NO_BASELINE"; report.files.push(row); continue;
        }

        const { violations, sanctioned } = classify(base.fp, nowFp);
        const wNow = words(nowText), wBefore = base.words;
        const drift = wBefore ? +(((wNow - wBefore) / wBefore) * 100).toFixed(1) : 0;

        row.violations = violations;
        row.sanctioned = sanctioned;
        row.drift = drift;
        row.words = { before: wBefore, after: wNow };

        if (violations.length) { row.status = "STRUCTURAL_VIOLATION"; hardFail = true; }
        else if (Math.abs(drift) > DRIFT_LIMIT) { row.status = "DRIFT_WARN"; }
        else if (sanctioned.length) { row.status = "LABELS_CHANGED"; }
        else if (wNow !== wBefore) { row.status = "PROSE_ONLY"; }
        else { row.status = "UNCHANGED"; }

        report.files.push(row);
    }

    const thisBook = UNIT
        ? units.filter((u) => String(u.book) === String(S.unit.book)).flatMap((u) => u.files)
        : BOOK ? units.filter((u) => String(u.book) === String(BOOK)).flatMap((u) => u.files)
        : units.flatMap((u) => u.files);
    const lc = lockCheck(S.files, units.flatMap((u) => u.files), thisBook);
    report.lock = lc.violations;
    report.concurrent = lc.info;
    if (report.lock.length) hardFail = true;

    const boot = shq(`node -e 'require("./src/main_setup.js");process.exit(0)'`) !== null;
    report.boot = boot;
    if (!boot) hardFail = true;

    const tw = report.files.reduce((a, r) => a + ((r.words?.after || 0) - (r.words?.before || 0)), 0);
    const bw = report.files.reduce((a, r) => a + (r.words?.before || 0), 0);
    report.totals = {
        files: report.files.length,
        wordsBefore: bw,
        wordsAfter: bw + tw,
        driftPct: bw ? +((tw / bw) * 100).toFixed(1) : 0,
        labelChanges: report.files.reduce((a, r) => a + r.sanctioned.length, 0),
        violations: report.files.reduce((a, r) => a + r.violations.length, 0) + report.lock.length,
    };
    report.verdict = hardFail ? "REJECT" : "ACCEPT";

    if (AS_JSON) {
        console.log(JSON.stringify(report, null, 2));
        process.exit(hardFail ? 1 : 0);
    }

    /* ---- human output ---- */
    const P = (s) => console.log(s);
    P(`\nVERIFY — ${report.scope}   (baseline: ${BASE})\n`);
    P("file                  status                 drift    labels  violations");
    P("-".repeat(72));
    for (const r of report.files) {
        P([
            r.file.replace(".magium", "").padEnd(21),
            r.status.padEnd(22),
            (r.drift === null ? "-" : `${r.drift > 0 ? "+" : ""}${r.drift}%`).padStart(7),
            String(r.sanctioned.length).padStart(8),
            String(r.violations.length).padStart(11),
        ].join(""));
    }
    P("-".repeat(72));

    const withV = report.files.filter((r) => r.violations.length);
    if (withV.length) {
        P("\nSTRUCTURAL VIOLATIONS — writer must fix or be re-dispatched:\n");
        for (const r of withV) {
            P(`  ${r.file}`);
            for (const v of r.violations) {
                P(`    ✗ [${v.kind}] ${v.id || ""} ${v.detail || ""}`.replace(/\s+$/, ""));
            }
        }
        P("\n  CONDITIONAL_BLOCK_CHANGED means an #if block was added/removed/re-nested.");
        P("  That mutates the game graph. Writers are forbidden from doing it.");
    }

    if (report.lock.length) {
        P("\nFILE-LOCK / SCOPE VIOLATIONS:\n");
        for (const v of report.lock) P(`    ✗ [${v.kind}] ${v.detail}`);
    }

    if (report.concurrent && report.concurrent.length) {
        P(`\nCONCURRENT ACTIVITY (informational — not counted as violations):`);
        const byKind = {};
        for (const v of report.concurrent) (byKind[v.kind] ||= []).push(v.detail);
        for (const [k, list] of Object.entries(byKind)) {
            P(`    · ${k}: ${list.length} file(s)`);
            if (list.length <= 6) list.forEach((d) => P(`        ${d}`));
        }
        P(`    These files are owned by other units/books still in flight.`);
        P(`    Re-run with --strict once all writers have returned to treat`);
        P(`    same-book sibling writes as violations.`);
    }

    const labelled = report.files.filter((r) => r.sanctioned.length);
    if (labelled.length) {
        P("\nCHOICE LABEL CHANGES — confirm each was sanctioned by sweep S1,");
        P("and confirm the echo line in the target scene was updated to match:\n");
        for (const r of labelled) {
            for (const s of r.sanctioned) {
                P(`  ${r.file} :: ${s.id} [${s.index}]`);
                P(`      -  ${String(s.before).slice(0, 88)}`);
                P(`      +  ${String(s.after).slice(0, 88)}`);
            }
        }
    }

    const drifted = report.files.filter((r) => r.status === "DRIFT_WARN");
    if (drifted.length) {
        P(`\nWORD DRIFT > ${DRIFT_LIMIT}% — check for padding or over-deletion:`);
        for (const r of drifted) P(`    ! ${r.file}  ${r.words.before} -> ${r.words.after} (${r.drift > 0 ? "+" : ""}${r.drift}%)`);
    }

    const t = report.totals;
    P(`\napp boots: ${report.boot ? "OK" : "FAILED"}`);
    P(`totals: ${t.files} files · ${t.wordsBefore.toLocaleString()} -> ${t.wordsAfter.toLocaleString()} words ` +
      `(${t.driftPct > 0 ? "+" : ""}${t.driftPct}%) · ${t.labelChanges} label changes · ${t.violations} violations`);
    P(`\nVERDICT: ${report.verdict}\n`);
    process.exit(hardFail ? 1 : 0);
}

main();
