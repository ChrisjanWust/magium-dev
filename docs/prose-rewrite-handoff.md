# Magium prose rewrite handoff

## Purpose

This document is the source of truth for resuming the English story-prose overhaul.

The goal is to raise `data/en/*.magium` to professional adventure-fiction quality without changing the game graph, route logic, lore, character continuity, or outcomes.

## Current state

- The repository contains **54** English `.magium` story files. An earlier scratch report says 56; that count is wrong.
- All 54 files have received a Gemini 3.7 Flash High rewrite pass.
- The working tree contains 32,694 inserted and 32,147 deleted story lines.
- All rewrites are **uncommitted**.
- All 54 current files parse successfully.
- A fresh comparison against `HEAD` confirms that all 54 structural fingerprints still match.
- `data/fr/` has not been changed.
- `docs/characters/` and `scripts/fingerprint.js` are untracked but required for this project.
- `.opencode/` is also untracked and unrelated. Do not edit, delete, or stage it as part of this work.

The bulk rewrite is complete, but the final editorial audit is not. Do not describe the prose as fully polished until the remaining QA below has been completed.

## Safety rules

1. Do not run `git reset --hard`, `git checkout -- data/en`, `git clean`, or any equivalent destructive command.
2. Do not overwrite another agent's or the user's uncommitted work.
3. Do not commit unless the user explicitly asks.
4. Never modify a `.magium` structural line during prose editing.
5. Re-run the structural fingerprint comparison after every story-file edit.
6. Do not change `data/fr/` unless the user explicitly starts a French-localization project.

## Required files

### Project guidance

- `CLAUDE.md` — architecture, commands, and repository rules.
- `ReadME.md` — project and story-format background.

### Story corpus

- `data/en/*.magium` — all 54 rewritten English story files.
- `data/fr/*.magium` — old French prose; intentionally untouched.

### Parser and validation

- `src/parser.js` — actual parser used by the application.
- `scripts/fingerprint.js` — emits the non-prose structure of a `.magium` file.

### Character sources

- `docs/characters/README.md` — profile index and short voice summaries.
- `docs/characters/_schema.md` — how the profiles and extraction notes were built.
- `docs/characters/_roster.md` — canonical character roster.
- `docs/characters/barry.md`
- `docs/characters/daren.md`
- `docs/characters/kate.md`
- `docs/characters/rose.md`
- `docs/characters/hadrik.md`
- `docs/characters/flower.md`
- `docs/characters/illuna.md`
- `docs/characters/arraka.md`
- `docs/characters/eiden.md`
- `docs/characters/leila.md`
- `docs/characters/melindra.md`

### Chronological character evidence

Read the segment covering a chapter before editing that chapter:

- `docs/characters/_segments/01-b1-ch01-03.md`
- `docs/characters/_segments/02-b1-ch04-06.md`
- `docs/characters/_segments/03-b1-ch07.md`
- `docs/characters/_segments/04-b1-ch08-10.md`
- `docs/characters/_segments/05-b1-ch11.md`
- `docs/characters/_segments/06-b2-ch01-03.md`
- `docs/characters/_segments/07-b2-ch04-05.md`
- `docs/characters/_segments/08-b2-ch06-08.md`
- `docs/characters/_segments/09-b2-ch09-10.md`
- `docs/characters/_segments/10-b2-ch11.md`
- `docs/characters/_segments/11-b3-ch01-02.md`
- `docs/characters/_segments/12-b3-ch03-04.md`
- `docs/characters/_segments/13-b3-ch05-06.md`
- `docs/characters/_segments/14-b3-ch07-08.md`
- `docs/characters/_segments/15-b3-ch09-10.md`
- `docs/characters/_segments/16-b3-ch11-12.md`

### Original prose-issues report

The detailed report that motivated the rewrite is currently outside the repository:

`/Users/chrisjan/Library/Application Support/Cursor/User/globalStorage/buenon.scratchpads/scratchpads/5029ea8c18bf0984157d07a7685077d7/scratch.md`

It covers:

- Repetitive prose templates
- Mid-battle conversations
- Bloodless or consequence-free fights
- Deflated suspense
- Overexplained plans and reveals
- Filter words and labeled emotion
- Register breaks and continuity errors
- Flat travel
- Disembodied character descriptions
- The underwritten Rose romance

The full work history and exact per-chapter prompts are in the Cursor chat:

`e7bd2b37-8023-4402-b2db-d5e98d4eda34`

## Canonical character direction

### Barry

- First-person protagonist, age twenty-eight.
- Ordinary-looking, with a weak aura and no innate magic at the story's opening.
- Uses a stat booster, notebook, dagger, and crossbow.
- Sarcastic, tactless, analytical, curious, and trap-first.
- Treats magic as theory, loopholes, wording, and preparation.
- Protects people first and jokes after.
- Show analysis through what catches his eye and what he does, not through constant `I notice`, `I realize`, or `I figure`.

### Kate

- Tall, slim ice mage with long black hair, fair skin, dark eyes, and a green cloak.
- Guarded, debt-keeping, pragmatic, and lethal toward future threats.
- Concern presents as irritation; fear and guilt present as coldness or snark.
- Conjures ice. A physical knife is appropriate only in no-magic or collared contexts.
- Barry/Kate attraction should remain an undercurrent, never an imposed route outcome.

### Rose

- Mid-twenties, long auburn hair, light-brown eyes, auburn dress.
- Competent herbalist and local guide, not a helpless damsel.
- Gathers plants, identifies dangers, improves camp food, prepares salves and restorative draughts, and translates local survival rules.
- Naive about the wider magical world, but practical and perceptive in her own domain.
- Warm by default; decisive once she makes a choice.
- Barry/Rose tension should build through work, proximity, touch, glances, and things unsaid.

### Daren

- Bald, dark-skinned, tall white mage in heavy plate, with an X-shaped forehead scar.
- Healer, leader, idealist, and protector.
- Healing manifests as white light.
- His sword absorbs and returns elements and can sever a mage's link to magic.
- Talks like a legend, then often undercuts himself.

### Hadrik

- Northern giant traveling in a four-foot dwarf form.
- Black beard to the chest, leather armor, enormous retained strength.
- Fighting, honor, ale, and friendship are central to him.
- Drinking is joy, ritual, and social glue—not trauma medication.
- Humor brackets danger but should not interrupt lethal exchanges.

### Flower and Illuna

- Separate people sharing one body.
- Flower: warm, cheerful, long red hair, fire magic, flies with fire jets.
- Illuna: precise, dry, suspicious, mission-first; control shows through bright-blue eyes and a colder face.
- Do not write one as merely the other's mood.

### Leila

- Mute lessathi fighter who writes glowing letters in midair.
- Embody her through posture, expression, writing speed, erased phrases, and physical action.
- She minimizes herself socially but moves instantly once she has a read.

### Arraka

- Amulet-bound banshee, unless a scene explicitly frees her.
- Cruel, ancient, funny, and genuinely useful when help also serves a flex, grudge, or lesson.
- She may monologue during violence because she is often in no danger.

### Eiden

- Stillwater who withholds answers, keeps deals, and treats danger as spectacle.
- He may speak conversationally during apparent combat because only the other side is fighting for its life.
- The horror is the asymmetry.

### Melindra

- Stillwater air mage.
- Teasing and outwardly independent; loyalty appears in crises and teaching.
- Do not turn her into a generic flirt or exposition voice.

## `.magium` editing contract

Never change, add, remove, or reorder:

- `ID: ...`
- `TEXT:`
- The blank line immediately after `TEXT:`
- `choice(...)`, including its quoted label
- `#if(...)`
- Closing `}`
- `set(...)`
- `achievement(...)`

Only prose lines may be edited.

Additional rules:

- Never start prose with a reserved structural token.
- Keep first-person present tense.
- Choice-echo dialogue must exactly match the associated `choice()` label.
- Preserve differences between conditional variants.
- Keep identical variants identical.
- Plain text only: no Markdown or asterisks.

## Structural verification

Temporary `/tmp/fp_*_before.json` files from the original run are not a reliable handoff dependency. Recreate baselines from `HEAD`.

Run this from the repository root:

```sh
tmp=$(mktemp -d)
failed=0

for file in data/en/*.magium; do
    name=${file##*/}
    git show "HEAD:$file" > "$tmp/$name"
    node scripts/fingerprint.js "$tmp/$name" > "$tmp/$name.before.json"
    node scripts/fingerprint.js "$file" > "$tmp/$name.after.json"

    if ! diff -q "$tmp/$name.before.json" "$tmp/$name.after.json" >/dev/null; then
        echo "STRUCTURE DIFF: $file"
        failed=1
    fi
done

rm -rf "$tmp"
test "$failed" -eq 0
```

Expected result: no `STRUCTURE DIFF` lines and exit code zero.

This comparison was freshly reproduced while writing this handoff and passes for all 54 files.

Parser smoke test:

```sh
for file in data/en/*.magium; do
    node scripts/fingerprint.js "$file" >/dev/null || exit 1
done
```

## Canonical rewrite prompt

Use this as the base for any chapter that needs another pass:

```text
You are rewriting the prose of `data/en/<FILE>.magium` in the Magium repo at
/Users/chrisjan/cj/repos/magium-dev, IN PLACE, to professional fiction quality.
This is fan-fiction prose editing for a fantasy adventure game.

PREPARATION

1. Read docs/characters/README.md.
2. Read the chronological segment covering this chapter.
3. Read the complete profiles of every character appearing in the chapter.
4. Capture the file's structural fingerprint.
5. Read the entire story file before editing.

FORMAT

- Never modify ID, TEXT, choice, #if, }, set, or achievement lines.
- Keep the blank line after TEXT.
- Rewrite prose only.
- Plain text only: no Markdown and no asterisks.
- Preserve choice-echo dialogue exactly.
- Preserve all route differences.
- Use first-person present tense.

PLOT FIDELITY

- Preserve every event, action, outcome, reveal, and required fact.
- Preserve their order and character presence.
- Preserve lore and tactical information, but integrate it into lived scenes.
- Do not invent events.
- Do not escalate injuries.
- Improve sensory texture, not plot.

PROSE

1. No leisurely conversations while characters fight for their lives.
   Use grunts, commands, warnings, and clipped sentences.
   Commanders may bark brief orders.
   Eiden or a freed Arraka may monologue when they are in no danger.

2. Show emotion through body, voice, action, and micro-gesture.
   Remove narrator filters such as I notice, I realize, and I figure where they
   merely mediate an observation.

3. Make combat physical. Heat, impact, fatigue, injury, and aftermath matter.
   Do not add injuries absent from the original.

4. Avoid:
   - all of a sudden
   - begins to / starts to
   - I can't help but
   - which means that
   - in other words
   - needless to say
   - pauses for a bit
   - seems to / appears to
   - uneventful

5. Villains do not announce names, titles, or rankings during combat.
   Convey reputation through action, witnesses, or narration.

6. Let danger breathe before the counter arrives.
   Reduce advance trap prediction to one line of unease.

7. Trust the reader.
   Do not explain events or jokes after showing them.
   Do not recap a scene unless the recap introduces necessary new information.

8. Use direct verbs.

9. Keep characters physically present throughout scenes.

10. Preserve Barry's sarcastic, tactless, analytical, trap-first voice.
    Show deductions through what he attends to and does.

11. Avoid repetitive AI phrasing, repeated metaphors, purple prose, and modern
    computing jargon. Mana is canon; overclocking, sub-routines, hard caps,
    repulsor fields, and feedback loops usually are not.

12. Preserve magic-system details and character profiles exactly.

13. Give travel Varathian sensory texture without inventing events.

14. Maintain Barry/Kate and Barry/Rose subtext without forcing route outcomes.

15. Use clean, accessible fantasy-adventure prose.

16. Add length only for genuine physical, emotional, atmospheric, or suspense
    value. Overexplained scenes should become shorter.

VERIFICATION

- Compare structural fingerprints; diff must be empty.
- Confirm no asterisks.
- Scan banned phrases and accidental past-tense action verbs.
- Report scenes rewritten and any chapter-specific decisions.
```

## Gold-standard scenes

Use scene IDs rather than line numbers because lines continue to move.

### Hadrik and Felran

- File: `data/en/ch7.magium`
- Scene: `Ch7-Dwarf-vs-fire`
- Standard demonstrated: reputation through witnesses, danger held for a beat, Kate kept visible behind Hadrik, physical aftermath, comedy after combat.

### Barry and Rose

- File: `data/en/ch11a.magium`
- Scenes around: `Ch11a-Feelings2`, `Ch11a-Racing2`, `Ch11a-Romance`
- Standard demonstrated: sensory intimacy, Rose in control, non-transactional desire, no tea-of-infertility interruption, Rose gone before morning as required by continuity.

### Varathian travel and Rose's competence

- File: `data/en/ch6.magium`
- Recurring travel variants around `Ch6-Secure`, `Ch6-Travel`, and related conditional blocks.
- Standard demonstrated: strange landscape, Rose working while walking, Kate refusing help, Barry/Rose attraction, Barry/Kate undercurrent.

### Kate's introduction

- File: `data/en/ch2.magium`
- Scenes: `Ch2-Intro`, `Ch2-Banshee`
- Standard demonstrated: banshee lore embedded in Barry's trauma and Kate's emotion shown through her failing mask.

## Known corrections already applied

- Stronghold size normalized to roughly 400,000 square feet in `ch9`.
- Accidental Wilhelm/Wilbert uses fixed; deliberate Wilbert taunts in `b2ch4a` retained.
- Rose's intimate scene made non-transactional.
- The tea-of-infertility line removed from the intimate moment.
- Felran self-announcements replaced with bystander identification.
- Kate's eyes normalized to dark after agents introduced gray-eye variants.
- Modern slips such as repulsor fields, sub-routines, hard caps, ancient code, and overclocking were patched where found.
- Markdown asterisks introduced by agents were removed corpus-wide.
- Several agent-added injury escalations were reverted.
- Hadrik's drinking was corrected where an agent falsely reframed it as trauma coping.
- `b3ch10a` reduced from 45 uses of `okay` to zero.
- `b3ch12a` converted Barry's biography recital at Kate into a two-sided conversation.
- `b3ch6b` received the approved terse-command treatment for its battle chatter.

## Remaining QA — do this next

### 1. Audit narrator filters

A fresh broad scan finds **92** occurrences of:

```sh
rg -n "I notice|I realize|I figure" data/en/*.magium
```

They appear across 29 files. Not all are defects:

- Some are dialogue.
- Some describe a genuine realization rather than filtering a visible fact.
- Some are historical recollections.
- Some are locked choice labels or choice-echo lines.

But many are still narrator mediation and need case-by-case editing. `ch4` alone has nine repeated copies of:

`I figured my calculations must have been wrong.`

Do not mechanically replace all 92. Read the scene and distinguish cognition from filtering.

### 2. Audit remaining stock constructions

Run:

```sh
rg -n -i \
  "all of a sudden|begins to |starts to |I can't help but|which means that|in other words|needless to say|pauses for a bit|seems to |appears to |uneventful" \
  data/en/*.magium
```

Known structural or choice-echo exceptions:

- `b3ch3b.magium`: `all of a sudden` remains in a choice label and its required echoed dialogue.
- `b2ch7.magium`: `seems to` remains in a choice label and its required echoed dialogue.
- `b3ch1.magium`: `Uneventful` remains only in a scene ID and choice targets.

Known editable residues found while creating this handoff:

- `b3ch10c.magium`: `"In other words, nothing immediate," Daren concludes.`
- `b3ch6c.magium`: `"Seems to me you could use one."`

Fix editable prose residues, then re-run fingerprints.

### 3. Audit modern technical diction

Run:

```sh
rg -n -i \
  "overclocked|sub-routine|feedback loop|repulsor field|hard cap|ancient code" \
  data/en/*.magium
```

Current likely residues are `feedback loop` in:

- `b2ch7.magium`
- `b3ch3b.magium`
- `b3ch4a.magium`

The setting includes sophisticated lessathi machinery, so evaluate rather than blindly delete. Prefer `resonance`, `rebound`, `recursive current`, or `interference cycle` where appropriate.

### 4. Audit invented or escalated details

Agents occasionally added:

- Blood where the original had only vomiting
- New implications about motives
- New physical injuries
- New character attributes
- New technical terminology

Compare suspicious passages against:

```sh
git show HEAD:data/en/<FILE>.magium
```

Keep improved staging; remove new plot, new injury, or new characterization.

### 5. Audit character consistency

Cross-check against `docs/characters/`.

Pay special attention to:

- Kate's eye color, weapon use, and route-dependent scar
- Flower versus Illuna attribution
- Rose's competence and living/dead route status
- Leila's mute communication
- Hadrik's attitude toward drinking, honor, and helpless opponents
- Daren's healing limits and sword abilities
- Barry's current access to magic and the stat device in each chapter

### 6. Audit repeated AI prose

Search for overused generated phrases and images, including:

- Pulse hammering
- Cold knot
- Razor-sharp
- Dead flat
- Siege engine
- Cathedral bell
- Breath catches
- Bloodless knuckles
- Air thickens
- World snaps

Do not remove a good phrase merely because it repeats once. Remove clustering that makes chapters sound generated from the same template.

### 7. Review route variants

For each chapter:

1. Compare conditional variants.
2. Confirm route-specific facts remain distinct.
3. Confirm repeated common prose is identical where appropriate.
4. Confirm choice-echo dialogue still matches the immutable choice label.
5. Confirm living/dead character routes never bleed into each other.

### 8. Runtime and lint checks

After editorial QA:

```sh
npx eslint .
```

Then run:

```sh
npm run start:server
```

Smoke-test:

- Beginning a new game
- Following several choices through Book 1
- Loading saves or checkpoints if available
- Conditional routes with Rose alive/dead
- Transition between split chapter files
- Achievements and stat checks

Do not start a duplicate server if one is already running.

## Completion criteria

The task is actually finished when:

- All 54 fingerprints match `HEAD`.
- All 54 files parse.
- Final filter-word and stock-phrase audit is complete.
- Editable stock phrases are removed.
- Structural/choice-label exceptions are documented.
- Character and magic continuity have been reviewed.
- No agent-invented plot or injuries remain.
- No Markdown artifacts remain.
- No obvious generated-prose template dominates the corpus.
- ESLint passes.
- The server starts and representative story routes render.
- The user has reviewed representative scenes from each book.

Do not commit or translate the French corpus without explicit user instruction.
