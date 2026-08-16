# BOOK 1 — Master Agent

You are the **Book 1 book-master**. Your scope is `data/en/ch*.magium` — **12 files, 11 chapters,
~211,000 words of prose**. Do not touch `b2ch*` or `b3ch*`; those belong to other masters who may be
running concurrently.

---

## Read this before anything else: what Book 1 actually is

Book 1 received three overhaul passes, committed as `35755a6`, `07d7e09`, and `40cd620`. Those commit
messages describe substantial structural work, and that work is real — but **it covered a fraction of
the book.** Across 211,000 words, the three passes added **503 lines**.

Measured coverage, as a percentage of non-blank prose lines rewritten since `7ec9ba0`:

| file | words | scenes | choices | choices/scene | prose rewritten | state |
|---|---:|---:|---:|---:|---:|---|
| `ch1` | 4,242 | 12 | 21 | 1.75 | 16% | worked |
| `ch2` | 8,834 | 36 | 66 | 1.83 | 13% | worked |
| `ch3` | 25,708 | 91 | 206 | **2.26** | **1.4%** | **barely opened** |
| `ch4` | 13,357 | 30 | 54 | 1.80 | 26% | worked |
| `ch5` | 12,367 | 30 | 51 | 1.70 | 9% | partly worked |
| `ch6` | 31,007 | 72 | 141 | 1.96 | 11% | partly worked |
| `ch7` | 32,753 | 94 | 153 | 1.63 | **4.0%** | **mostly unfixed** |
| `ch8` | 16,683 | 51 | 81 | 1.59 | **1.5%** | **barely opened** |
| `ch9` | 16,340 | 65 | 103 | 1.58 | **1.9%** | **barely opened** |
| `ch10` | 20,991 | 68 | 113 | 1.66 | **0.0%** | **never opened** |
| `ch11a` | 16,805 | 50 | 73 | 1.46 | **0.9%** | **barely opened** |
| `ch11b` | 11,795 | 34 | 55 | 1.62 | **0.2%** | **one word changed** |

**Six of twelve files are effectively untouched.** `ch10` was never opened at all. `ch11b` received a
single word (`zip code` → `district`). `ch3` carries Book 1's highest choice density — 206 choices at
2.26 per scene — and received 16 lines.

**Therefore: this is not a QA pass.** For six files you are running the first real overhaul. For the
rest you are deepening genuine but partial work. Your unit prompts state which mode applies.

### The one thing the prior passes did establish

The committed Book 1 prose contains the **voice reference** for the whole project — the four
calibration passages in Master Contract §7 are all drawn from it, and all four come from the chapters
that *were* worked (`ch1`, `ch2`, `ch6`, `ch9`). Use them as the target register. The gap between
those passages and, say, `ch10` is the gap you are closing.

### A caution about the fix plans

`docs/fix6-humor-replacement-plan.md` and `docs/fix10-ch7-pacing-plan.md` are detailed, worked fix
specifications for Book 1. **They were only partially applied.** Treat them as a to-do list with
unknown completion state, not as a record of finished work. Verify each item against the current file
before assuming it was done — several were not.

---

## Book 1 shape

| | |
|---|---|
| Chapters | 11 (ch1–ch11) |
| Files | 12 |
| Branching chapter | ch11 (a/b) |
| Prose words | ~211,000 |
| Scenes | 633 |
| Choices | 1,117 |
| Writer units | 8 |

---

## Priority order

Dispatch everything, but weight your review attention by prior coverage. If you wave-split, run the
untouched files first — they have the most defects and their findings will sharpen the ledger for the
rest.

**Tier 1 — first real pass (highest yield):** `ch10`, `ch3`, `ch11a`, `ch11b`, `ch8`, `ch9`
**Tier 2 — substantially unfixed despite a written plan:** `ch7`
**Tier 3 — deepen partial work:** `ch5`, `ch6`
**Tier 4 — QA the worked chapters:** `ch1`, `ch2`, `ch4`

---

## Book 1 specific hazards

### `ch3` — the density outlier

206 choices across 91 scenes (2.26/scene) is the highest in Book 1 and among the highest in the
project. It is also 1.4% rewritten. Sweep S1 will therefore do heavy work here, and the prose writer
following it inherits a large echo-line reconciliation. Expect this unit to report the most fixes.

### `ch7` — the documented failure that was not fixed

`docs/fix10-ch7-pacing-plan.md` analyses `ch7` in full: 94 scenes, eight narrative acts stacked with no
decompression, four named pile-up points, and eight specific numbered additions (3A–3C, 4A–4B, 5A–5C).
Roughly five were applied. The plan's own diagnosis still stands: this is the worst pacing failure in
the project, and the Diane reunion — the chapter's emotional climax — still arrives after the reader
has processed a knifepoint standoff, an orphanage reveal, a character introduction, a duel, a man
being incinerated, a sage debate, and a dragon fight.

Instruct that unit to work the plan item by item and report which were already present.

### `ch11a` / `ch11b` — the trilogy's most-read outcome

`ch11a` sets `v_ch11_romance_rose`, `v_ch11_saved_rose`, and `v_ch11_saved_slave`. Between them these
are read in **28 files across all three books** — `v_ch11_saved_rose` alone reaches 26 downstream
files. This is the single largest echo surface in the project, and both files are ~1% rewritten.

**Anything you change about what these outcomes mean emotionally propagates into Books 2 and 3, which
are being rewritten concurrently by other masters.** You may not edit their files. Every such change
must be escalated to the operator as a `CROSS-FILE` item naming the affected books.

### `ch10` — never opened

68 scenes, 21,000 words, zero prior attention. Assume every one of the eight patterns is present and
unaddressed. This unit should produce the largest fix list in the book.

### Prior-pass artifacts to look for

The earlier work was done in haste and may have left seams. Specifically check:

- **Stale echo lines.** Pass 2 and 3 changed choice labels in `ch6` (five labels across `Ch6-Travel`,
  `Ch6-Flirt`, `Ch6-Passion`). Verify each target scene's echo line and NPC reaction match.
- **`Ch6-Eiden-leaves`** had two `#if` blocks added, taking its paragraph entries from 1 to 4. That was
  a deliberate authorial change made outside the current rules. It is committed and is now the
  baseline — do not attempt to revert it, and note that writers are forbidden from doing anything
  similar (Master Contract §3).
- **Half-applied plans.** Both fix-plan documents list items that may or may not be present.

---

## Sweep instructions specific to Book 1

**S1 — clown choices.** 1,117 choices. Start with `ch3` (206 choices, 2.26/scene, barely touched), then
`ch6` (141), `ch10` (113), `ch9` (103).

```sh
for f in data/en/ch*.magium; do
  s=$(grep -c '^ID: ' "$f"); c=$(grep -c '^choice(' "$f")
  echo "$f scenes=$s choices=$c ratio=$(echo "scale=2;$c/$s"|bc)"
done
```

`docs/fix6-humor-replacement-plan.md` lists 20 specific edit locations across `ch6`, `ch7`, `ch9`, and
`ch11a` with exact before/after text. **Verify which are already applied** — the `ch6` ones largely
are, the `ch7`/`ch9`/`ch11a` ones largely are not — then finish the list.

**S2 — slang.** One `zip code` was fixed in `ch11b`. The rest of the book was never swept.

```sh
grep -rn -E '\b(zip code|okay|percent|percentage|statistics|efficiency|process|meeting|schedule|budget|priority|resource|update|feedback|option|market|customer|energy levels|status)\b' data/en/ch*.magium
```

**S3 — deus ex machina.** `ch6`'s dragon fight was fixed properly and is the reference implementation —
read `Ch6-Win-fight` and `Ch6-Eiden-leaves` to see the shape. Then audit every other Eiden appearance
in the book, particularly in `ch4` (his introduction and the deal) and `ch10`, which was never checked.

---

## Dispatch

Eight units, listed in the injected table below. For each:

1. Read `docs/prompts/build/<unit-id>.prompt.md`.
2. Append the ledger slice under `## Continuity contract (authoritative)`.
3. Dispatch all eight in a **single message** for concurrency.

Pass built prompts verbatim.

---

## Success criteria for your run

- `node docs/prompts/verify.js --book 1 --strict` prints `VERDICT: ACCEPT`.
- Zero structural violations — in particular zero `CONDITIONAL_BLOCK_CHANGED`.
- Zero lock/scope violations: `b2ch*`, `b3ch*`, `data/fr/`, and code untouched.
- Every choice-label change confirmed against sweep S1's sanctioned list, with its echo line updated.
- `main_setup.js` boots.
- **Every item in both fix-plan documents is either applied or explicitly recorded as rejected with a
  reason.** No item left in unknown state.
- The six barely-opened files (`ch3`, `ch8`, `ch9`, `ch10`, `ch11a`, `ch11b`) show substantive fix
  lists. A thin report on any of them means the unit did not engage.
- Any change to the meaning of `v_ch11_romance_rose`, `v_ch11_saved_rose`, or `v_ch11_saved_slave` is
  escalated to the operator for the Book 2 and Book 3 masters.
- Net word drift within ±10%.
- Nothing committed.
