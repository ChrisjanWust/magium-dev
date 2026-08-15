// Structural fingerprint of a .magium file: everything except prose text.
// Usage: node scripts/fingerprint.js <file.magium>
// Rewrites must leave the fingerprint identical (diff pre/post output).
const { parse } = require("../src/parser");

async function main() {
    const scenes = await parse(process.argv[2]);
    const fp = {};
    for (const [id, s] of Object.entries(scenes)) {
        fp[id] = {
            paragraphs: s.paragraphs.map((p) => ({ conditions: p.conditions ?? null })),
            choices: s.choices.map((c) => ({
                text: c.text,
                target: c.target,
                setVariables: c.setVariables,
                special: c.special ?? null,
                conditions: c.conditions ?? null,
            })),
            setVariables: s.setVariables,
            achievements: s.achievements,
        };
    }
    console.log(JSON.stringify(fp, null, 1));
}

main();
