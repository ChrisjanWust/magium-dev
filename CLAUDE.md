# CLAUDE.md

## Project

MagiumJS is a fan recreation of the Magium choose-your-own-adventure books. It is an Express app rendering EJS templates, shipped both as a standalone Node server and as an Electron desktop app.

## Commands

```sh
npm install
npm run start:server     # Node server with nodemon (port 3000, or pass a port as argv)
npm run start:electron   # Electron app
npm run package          # electron-forge package
npm run make             # electron-forge make
npx eslint .             # lint (flat config in eslint.config.mjs, prettier-compatible)
```

## Architecture

- `main_node.js` / `main_electron.js` — entry points; both delegate to `src/main_setup.js`.
- `src/main_setup.js` — loads all story/locale data at startup, sets up the Express app and routes.
- `src/parser.js` — line-based parser for the custom `.magium` story format (scenes with `ID`, `TEXT`, choices, `set(...)` variable assignments, stat checks, achievements, and `&&`/`||` conditions).
- `src/renderers.js` — one render function per page (scene, menu, saves, achievements, stats, settings...), rendering the EJS templates in `templates/`.
- `src/utils.js` — locale helpers.
- `data/<locale>/` — story content: `*.magium` chapter files (books 1–3) and `achievementsN.json`; `data/locales.json` lists available locales (`en`, `fr`). UI strings live in `data/<locale>/ui.json`.
- `templates/` — EJS views; `public/` — static images, scripts, styles.
- Game state (progress, stats, saves) is stored client-side in cookies; the server is stateless.

## Guidelines

- Make only the requested changes; ask before assuming scope or behavior.
- Reuse existing implementations and follow nearby conventions (CommonJS requires, one renderer per page, etc.).
- Prefer the shortest clear, idiomatic solution; no defensive code or error handling unless requested.
- Comments only for sharp edges.
- Story content edits go in `data/`, not code. Keep `en` and `fr` structurally in sync when changing content format.
