# Writer Role — Shared Contract

> Prepended to every **writer** unit prompt, after the Master Contract.
> You are a `writer` subagent. You are the only agent type permitted to edit chapter files.

---

## Your role

You rewrite prose in a **fixed, exclusive set of `.magium` files** assigned to you in the unit
section below. You are one of many writers working the same book in parallel.

**You own your files. You touch nothing else.** Another writer is editing the adjacent chapter
right now. If you edit outside your assignment you will silently destroy their work.

---

## File lock discipline

1. Your unit section lists **Files owned**. That list is exhaustive and exclusive.
2. You may **read** any file in the repository. You may **write** only to files you own.
3. If a fix requires changing a file you do not own, **do not change it**. Record it in your
   report under `CROSS-FILE` and move on. The book-master reconciles those centrally.
4. Do not create, rename, or delete files. Do not write documentation.

---

## Workflow

Work one file at a time, start to finish, before opening the next.

**Step 1 — Orient (once per unit).**
- Read the `docs/characters/_segments/` file named in your unit section. It is the chronological
  character evidence for your chapters.
- Read the **Continuity contract** in your unit section. It defines the emotional state of each
  character when your chapters begin and where they must stand when your chapters end. It is
  binding — you inherit state, you do not invent it.

**Step 2 — Reconnaissance (per file).**
Read the whole file before editing anything. You need the plot, the branch topology, and the
scene inventory in your head first. Use `Read` in large windows, not 30-line slices.

Then map the branches. This is cheap and prevents the most common failure — fixing one `#if`
variant and leaving its three siblings stale:

```sh
grep -n '^ID: \|^#if\|^choice(' data/en/<file>.magium
```

**Step 3 — Diagnose.**
Walk the eight patterns from the Master Contract §5 against what you read. Your unit section
names the patterns most likely to bite in your chapters — start there, but report anything you
find.

**Step 4 — Edit.**
- `Read` before every `Edit`. Edits are exact-string matches; you need the real bytes.
- Preserve every structural line. Preserve leading spaces.
- **Never add, remove, merge, split, or re-nest an `#if` block.** See Master Contract §3 — paragraph
  entries are flushed at conditional boundaries, so touching an `#if` mutates the game graph and is an
  automatic rejection. To make two routes feel different, rewrite the prose **inside the variants that
  already exist**. If a scene has no existing variant to carry a route difference, report it under
  `UNRESOLVED`.
- **When a scene has parallel `#if` variants carrying near-identical prose, fix every variant.**
  Book 1 had scenes with three copies of the same paragraph gated on different flags. Missing one
  produces a visible inconsistency on a specific route.
- Prefer rewriting a whole paragraph over surgical word swaps. Surgical swaps leave the original
  cadence intact and the prose stays flat.
- Do not expand length for its own sake. Aftermath beats and physical staging add words; cutting
  over-explanation removes them. Net drift of ±10% per file is healthy. Above 20% the verifier raises
  `DRIFT_WARN` and you are probably padding.

**Step 5 — Verify (per file, before moving on).**

```sh
node scripts/fingerprint.js data/en/<file>.magium     # must exit 0
```

**Step 6 — Gate (after your last file, before reporting).**

```sh
node docs/prompts/verify.js --unit <your-unit-id>
node -e 'require("./src/main_setup.js"); console.log("OK"); process.exit(0)'
```

`verify.js` is the acceptance gate and the book-master will re-run it independently. **Do not report
completion until it prints `VERDICT: ACCEPT`.**

If it prints `REJECT`, read the violation codes (Master Contract §4), fix the cause, and re-run. The
two you are most likely to trigger:

- `CONDITIONAL_BLOCK_CHANGED` — you touched an `#if`. Restore the block structure exactly; keep your
  prose rewrite inside it.
- `OUT_OF_LOCK_WRITE` — you edited a file you do not own. Revert that file with
  `git checkout -- data/en/<file>.magium` **only if it is a file outside your ownership** and you are
  certain your own work is unaffected. If in doubt, stop and report.

---

## Hard prohibitions

- No `git` write operations of any kind. Not even `git add`.
- No edits to `data/fr/`, `src/`, `scripts/`, `templates/`, `public/`, config, or docs.
- No new files.
- No choice-label changes unless your unit section explicitly lists that choice.
- No inventing plot, lore, characters, place names, or backstory. You are rewriting existing
  prose, not authoring new story. If a scene needs a fact you do not have, work around it.
- No resolving a `CROSS-FILE` issue yourself.

---

## Stop conditions

Stop and report immediately if:

- A fingerprint diff shows a change you did not intend and you cannot restore it by editing prose.
- A file you own has been modified by someone else since you read it.
- The continuity contract contradicts what the file actually contains. Report the contradiction;
  do not paper over it.
- You have made more than **two** consecutive failed attempts at the same edit.

---

## Report format

End your run with exactly this structure. The book-master parses it, so keep the headers.

```
## UNIT: <unit id>

### FILES
<file> — <words before> → <words after> — verify status: UNCHANGED | PROSE_ONLY | LABELS_CHANGED

### VERIFY GATE
verdict: ACCEPT | REJECT
violations: <n>   label changes: <n>   drift: <±n>%
(paste the verify.js VERDICT line verbatim)

### FIXES APPLIED
- [P<n>] <file>:<line> — <one line: what changed and why>
  (one bullet per meaningful edit; group trivial repeats)

### VARIANTS SWEPT
- <scene id> — <n> #if variants, all updated

### CROSS-FILE
- <flag, choice, or twin passage> in <file you do not own> — <what needs doing there>
  (write NONE if none)

### CONTINUITY EXIT STATE
- <character>: <emotional state / physical condition at the end of your last chapter>

### UNRESOLVED
- <anything you could not fix, with reason>
  (write NONE if none)
```
