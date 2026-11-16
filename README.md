# Connor Madriago: project portfolio

Source for my engineering portfolio: https://agupag.github.io/connor-madriago-portfolio/

A single-page React app. The home page is a short scroll — name, results, the full index with filters, one
signature case, practice and contact — and each project opens as a sheet with annotated figures, short
write-ups, interactive widgets and 3D models. The visual layer is **Bench Signal**: a dark instrument surface
where the portfolio's own measurements drive the typography, the ambient signal field and the transitions.

## Stack

- React 19 and Vite 8
- `motion` for transitions, three.js for the 3D viewers
- Plain CSS, split into `@layer` files under `src/styles/`
- Fonts: Archivo and Routed Gothic, both under the SIL Open Font License (licences in `public/assets/fonts`)

## Layout

| Path | What it is |
|---|---|
| `src/data/content.jsx` | All site content: one entry per project, with its sheet blocks |
| `src/data/sketches.jsx` | Inline SVG diagrams |
| `src/data/highlights.jsx` | The four proof figures on the home page, each traced to the project copy that states it |
| `src/data/tracker-run.json` | Per-frame data for the tracker confidence chart |
| `src/App.jsx` | Route, colour mode, the sheet overlay and the skip link |
| `src/components/Cover.jsx` | The home page: field, calibration, hero, proof, work, signature case, practice, contact |
| `src/components/Home/` | One file per home section (`Bar`, `Hero`, `Proof`, `Work`, `Signature`, `Practice`, `Contact`) |
| `src/components/SignalField.jsx` | The canvas plot behind the hero — the only ambient animation |
| `src/components/Calibration.jsx` | The 420 ms first-load sweep |
| `src/components/Reveal.jsx` | Reveals a section once, when it comes into view |
| `src/components/Sheet.jsx` | Renders a project sheet from its blocks |
| `src/components/Media.jsx` | Images, loop videos, annotated figures and the enlarge view |
| `src/components/ModelViewer.jsx` | three.js viewer for the GLB models |
| `src/components/Widgets.jsx` | The interactive widgets |
| `src/styles/tokens.css` | Colour, type, space and motion tokens for the three modes |
| `src/styles/base.css` | Reset, type scale, controls, the reveal |
| `src/styles/home.css` | Bar, hero, proof strip, index, stage, signature case, practice, contact |
| `src/styles/sheet.css` | The sheet frame, figures and their callouts, tables |
| `src/styles/widgets.css` | Widget internals |
| `src/styles/modes.css` | Per-mode image handling, contrast, forced colours and print |
| `public/assets/` | Images, videos, 3D models, fonts and the resume PDF |
| `public/gridnode/` | A built copy of GridNode OS, the browser model a teammate wrote for our GridNode competition project. It is not my code |
| `scripts/deploy.sh` | Builds the site and publishes it |
| `docs/ui-redesign-plan.md` | The design plan this branch implements |

## Colour modes

Three modes, one token contract (`src/styles/tokens.css`); no component knows which one is on.

| Mode | Where | Notes |
|---|---|---|
| `signal` | Default | Dark calibrated surface, lime accent (`#d6ff3f`). |
| `print` | Bar button and the contact block | The original paper-and-ink palette, kept as a first-class twin. |
| `blueprint` | Contact block | The old blueprint theme, kept because it works. |

The choice is stored in `localStorage` under `bench-view` and applied as `data-theme` on `<html>`.

## Motion

Thirteen motions, each with a job: the calibration sweep, the signal field, masked type reveals, proof
counters, a stage that follows the pointer, the index-to-sheet transition, the chapter rail, figure and table
entrances, project-to-project changes, click-to-copy feedback, a freeze control and the model's idle turn.

Durations live in the token file as `--dur-1` to `--dur-5` (120 / 220 / 380 / 620 / 1200 ms) with two easing
curves. `MotionConfig reducedMotion="user"` is set in `App.jsx`, CSS reveals are wrapped in
`prefers-reduced-motion: no-preference`, and the canvas draws a single static plot when motion is reduced or
the reader presses **Freeze** in the bar (kept per session).

## Content model

Each entry in `items` (in `src/data/content.jsx`) has an `id` (the URL is `#/p/<id>`), an index `line`, preview `cover`,
`specs` and `stamp`, and a sheet made of a `lede`, side-column `facts`, a `hero` block and a list of `blocks`.
Block types: `figure`, `text`, `check`, `specs`, `code`, `cols`, `stack`, `sketch`, `widget`, `model` and `embed`.
Text can use `==highlight==` and `[label](url)`. An entry with no blocks shows on the index but does not open.

Figure callouts are numbered balloons placed in percentages of the image: `{ b: [x, y], t: [x, y], text }`, where `b` is the
balloon and `t` is the point it marks.

## Run it

```bash
npm install
```

```bash
npm run dev
```

## Publish

```bash
scripts/deploy.sh
```

The script builds `dist/`, pushes it to the `gh-pages` branch (which GitHub Pages serves) and waits until the new build is live.
Pushing `main` alone does not change the live site.
