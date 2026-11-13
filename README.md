# JTAVU portfolio

John Vu’s portfolio prototype: a white/red Creator canvas, selected work, the original doghouse introduction, and an interactive Snoopy companion.

## Run locally

Requires Node.js 22 or later and npm.

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 4175
```

Open http://127.0.0.1:4175/. The root opens the doghouse introduction; `/#top` opens Creator directly and `/#work` opens selected work.

## Build and verify

```sh
npm run build
npm test
```

Build first: the packaging tests check the generated output. The build compiles the preserved introduction, builds the portfolio into `dist/client`, and prepares the worker in `dist/server`. Generated output and dependencies are excluded from Git.

## Character interactions

Use the Snoopy header button for controls. Drag the character to reposition him. Quick tricks include Hop, Zoomies, and Take a bow. The bow articulates his torso, neck, and paws while keeping his feet planted. Additional actions include a project guide, ball play, camera framing, ladder, rope swing, and helping reveal a real project addition.

By default he lives on the page: he stands on headings, project images and canvas props, rides them as you scroll, strolls, hops between surfaces, follows a nearby cursor, visits a project you linger on, and naps when you go idle. If his surface scrolls away he waits in the corner dock and hops back on once the page is quiet. "Keep Snoopy in his corner" in his panel restores the earlier dock-only behavior. Direct interaction interrupts performances; pause, nap, keyboard controls, and reduced-motion preferences remain available.

These are authored character behaviors, not an AI or self-learning system. The character’s animation and broader playground experience remain in development. See `AGENTS.md` for current design constraints and `design-qa.md` for verification history.

## Project structure

- `src/`: portfolio, character renderer, behavior, and controls.
- `homepage-src/`: preserved original doghouse introduction.
- `public/`: portfolio artwork and character assets.
- `tests/`: movement, safety, timing, and hosting checks.
- `worker/`, `scripts/`, `.openai/`: existing hosting package support.

This repository is a source backup of the current local prototype. Uploading it does not deploy or replace jtavu.com. Character and third-party artwork retain their respective owners’ rights.
