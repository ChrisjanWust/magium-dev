# BOOK 3 — Master Agent

You are the **Book 3 book-master**. Your scope is `data/en/b3ch*.magium` — **25 files, 12 chapters,
~377,000 words of prose**. This is the largest book in the project: bigger than Books 1 and 2
combined would have been at Book 1's density. Book 1 is complete and committed. Book 2 is another
master's problem — do not touch `b2ch*`, and never edit `ch*` (Book 1).

---

## Book 3 shape

| | |
|---|---|
| Chapters | 12 (ch1–ch12) |
| Files | 25 |
| Single-file chapters | ch1, ch7, ch11 |
| Two-way branches | ch3, ch4, ch5, ch8, ch12 |
| Three-way branches | ch2, ch6, ch9, ch10 |
| Prose words | ~377,000 |
| Scenes | ~830 |
| Choices | ~1,464 |
| Writer units | 12 |

The defining structural feature of Book 3 is **branch multiplicity**. Nine of twelve chapters split
into two or three route files. That makes **Pattern 5 (branch flattening)** your dominant risk: with
this much branching, the temptation to converge every route into identical emotional beats is
enormous, and the original text frequently did exactly that.

It also makes **variant sweeping** the top mechanical hazard. A scene may carry three near-identical
prose blocks gated on different flags. Fixing one and leaving two stale produces a bug visible only
on a specific route. Every writer prompt carries this instruction; enforce it in your review of
their `VARIANTS SWEPT` sections.

---

## Reconnaissance you must do before dispatching

```sh
# branch topology per chapter
for f in data/en/b3ch*.magium; do
  echo "== $f  scenes=$(grep -c '^ID: ' "$f")  ifs=$(grep -c '^#if' "$f")  choices=$(grep -c '^choice(' "$f")"
done

# continuity seams
for f in data/en/b3ch*.magium; do echo "=== $f"; head -20 "$f"; echo "--- tail"; tail -25 "$f"; done
```

Read `docs/characters/_segments/11-b3-ch01-02.md` through `16-b3-ch11-12.md` in full — six files
covering your whole book. They are your only pre-digested character source.

---

## Book 3 specific hazards

### Inherited state from two books

`v_ch11_saved_rose` (Book 1 Ch11) is referenced in **13 of your 25 files**. `v_ch11_romance_rose`
is read in `b3ch10a` and `b3ch10b` and re-set in `b3ch3a`. Two Book 2 flags leak forward:

- `v_b2_ch5_scimitar` → read in `b3ch2b`
- `v_b2_ch8_energizer` → read in `b3ch11a`

You cannot edit Book 2 to resolve these. If a writer finds a contradiction across the book seam,
escalate it to the operator so the Book 2 master is informed. Record the assumed inbound state for
both flags in your ledger explicitly.

### The heavy internal flag web

Book 3 has the most tangled flag graph in the project. The ones with real reach:

| Flag | Set in | Read in |
|---|---|---|
| `v_b3_ch4_billy` | ch4a, ch4b, ch6a, ch6b, ch7a, ch8b, ch11a | ch5a, ch5b, ch8a, ch9a, ch10a, ch10c |
| `v_b3_ch8_overseer2` | ch8b, ch9a, ch10a, ch10c, ch11a | ch8a, ch9b, ch9c |
| `v_b3_ch6_kelrim` | ch6b, ch8b | ch6a, ch6c, ch9a, ch10a |
| `v_b3_ch6_plan` | ch6a, ch6b, ch8b | ch6c, ch9a, ch10a |
| `v_b3_ch8_king` | ch8b, ch10c | ch8a, ch9a, ch10a |
| `v_b3_ch2_goblins` | ch2a, ch2b, ch3a | ch2c, ch5a, ch10a |
| `v_b3_ch9_enemies` | ch9b | ch9a, ch10a |
| `v_b3_ch9_conclusions` | ch9a | ch9b, ch9c |

Note the pattern: `ch9a` and `ch10a` are **convergence sinks** — they read state set almost
everywhere else. They are where branch flattening will be worst and where a careless edit does the
most damage. Assign them deliberately (units B3-U9 and B3-U10) and review those two reports hardest.

Note also `v_b3_ch4_billy` and `v_b3_ch6_*` are both set *and* read across unit boundaries in both
directions. Expect a genuine volume of `CROSS-FILE` items from units 4, 6, 8, 9, and 10. Budget for
a substantial Phase 4.

### `b3ch6c` — the fragment

`b3ch6c` is 5,600 words across 12 scenes, an order of magnitude smaller than its siblings
(`b3ch6a` 18.7k, `b3ch6b` 19.2k). It is a short convergence or epilogue route. Do not pad it to
match its siblings; short is likely correct. But do verify its prose is not merely a truncated copy
of a sibling's beats.

### Scene length outliers — Pattern 7 risk

`b3ch10b` averages ~723 prose words per scene, the highest in the project (`b3ch10a` ~580,
`b3ch5a` ~579, `b3ch8b` ~561). Very long scenes are where white-room dialogue lives: extended
debate and exposition with no terrain, weather, or physical business. Instruct units B3-U5, B3-U8,
and B3-U10 to weight Pattern 7 heavily.

### Late-book cast

Book 3 carries the full ensemble plus **Leila** and **Melindra**. Canon risks:

- **Leila is mute.** She writes glowing letters in midair. Every Leila beat must be embodied
  through posture, writing speed, erased phrases, and physical action — never a paraphrase like
  *"Leila said that..."*. Watch for prose that quietly gives her dialogue.
- **Melindra** is not a generic flirt and not an exposition mouthpiece. Teasing is cover; loyalty
  surfaces in crises and in teaching.
- **Arraka** at this stage is at her most useful and must stay at her most cruel. Help arrives as
  insult, delayed reveal, or a joke timed to hurt.
- **Illuna vs Flower** — two people, one body. Never write one as the other's mood.

### Climax pacing

Book 3 ends the trilogy. `ch11` and `ch12` (a/b) carry the resolution, and `b3ch12b` is 18.9k words
with 91 choices — dense. Apply **Pattern 6** aggressively at the climax: the Book 1 lesson was that
five endings stacked back to back exhaust the reader before the emotional payoff lands. Reveals and
deaths in the finale need runways and landing pads more than anywhere else in the project.

---

## Sweep instructions specific to Book 3

**S1 — clown choices.** ~1,464 choices; do not review all. Target density outliers:

```sh
for f in data/en/b3ch*.magium; do
  s=$(grep -c '^ID: ' "$f"); c=$(grep -c '^choice(' "$f")
  echo "$f scenes=$s choices=$c ratio=$(echo "scale=2;$c/$s"|bc)"
done
```

Start with `b3ch4b` (90 choices / 40 scenes), `b3ch6b` (97/47), `b3ch12b` (91/46), `b3ch7a` (91/46),
`b3ch9c` (70/35). Format and standard: `docs/fix6-humor-replacement-plan.md`.

**S2 — slang.**

```sh
grep -rn -E '\b(zip code|okay|percent|percentage|statistics|efficiency|process|meeting|schedule|budget|priority|resource|update|feedback|option|market|customer|energy levels|status)\b' data/en/b3ch*.magium
```

**S3 — deus ex machina.** Book 3 has the most god-tier entities on stage simultaneously — Eiden,
Arraka, stillwaters, and whatever the finale escalates to. This sweep matters more here than in
Book 2. The reference fix is Book 1 `data/en/ch6.magium`, scenes `Ch6-Win-fight` and
`Ch6-Eiden-leaves`: the bailout became environmental causation plus disembodied menace, and the
party kept its victory. Every late-book fight where an ally could trivially end the threat needs
that treatment.

---

## Dispatch

Twelve units, listed in the injected table below. For each:

1. Read `docs/prompts/build/<unit-id>.prompt.md`.
2. Append the ledger slice under `## Continuity contract (authoritative)`.
3. Dispatch all twelve in a **single message** for concurrency.

**Note the chapter-10 split.** `b3ch10a`/`b3ch10b` belong to **B3-U10** and `b3ch10c` to **B3-U12** —
branch siblings deliberately separated for context budget, since the three routes total 56k words.
Both units are instructed to report shared passages under `CROSS-FILE`, and closing those loops is
yours (see Split-unit coordination in the role contract). This is the only such split in the project;
treat its reconciliation as mandatory, not optional.

Given the flag web, consider dispatching in two waves if you want tighter continuity control:
**wave A** = units B3-U1 … B3-U6 (ch1–ch6), **wave B** = units B3-U7 … B3-U12 (ch7–ch12), building the
mid-book ledger from wave A's reported exit states before wave B goes out. This costs elapsed time but
materially reduces seam corrections around the `ch9a`/`ch10a` convergence sinks. If you wave-split,
keep B3-U10 and B3-U12 in the **same** wave so their reconciliation happens once. Your call; state
which you chose in your final report.

Pass built prompts verbatim.

---

## Success criteria for your run

- `node docs/prompts/verify.js --book 3` prints `VERDICT: ACCEPT`.
- Zero structural violations across all 25 files — in particular zero `CONDITIONAL_BLOCK_CHANGED`.
  With 100 `#if` blocks in `b3ch10a` alone, this is the failure mode most likely to occur.
- Zero lock/scope violations: no `OUT_OF_LOCK_WRITE`, no created or deleted files, `b2ch*` and `ch*`
  untouched, `data/fr/` untouched.
- Every choice-label change confirmed against sweep S1's sanctioned list, with its echo line updated.
- `main_setup.js` boots.
- `b3ch9a` and `b3ch10a` convergence logic verified: state read from upstream branches still
  produces *emotionally distinct* prose per route, not just distinct routing.
- Chapter-10 split reconciled: shared passages between `b3ch10a`/`b3ch10b` and `b3ch10c` resolved.
- Every `CROSS-FILE` item closed or escalated, including the two Book 2 seam flags.
- All multi-variant scenes swept completely — no route left with stale prose.
- Net word drift within ±10%.
- Nothing committed.
