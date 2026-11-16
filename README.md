# Connor Madriago: project portfolio

Source for my engineering portfolio: https://agupag.github.io/connor-madriago-portfolio/

A single-page React app. The index lists every project on one screen; each project opens as a sheet with annotated figures,
short write-ups, interactive widgets and 3D models.

## Stack

- React 19 and Vite 8
- `motion` for transitions, three.js for the 3D viewers
- Plain CSS in one file, no framework
- Fonts: Archivo and Routed Gothic, both under the SIL Open Font License (licences in `public/assets/fonts`)

## Layout

| Path | What it is |
|---|---|
| `src/data/content.jsx` | All site content: one entry per project, with its sheet blocks |
| `src/data/sketches.jsx` | Inline SVG diagrams |
| `src/data/tracker-run.json` | Per-frame data for the tracker confidence chart |
| `src/App.jsx` | Header, index, footer and the project sheet overlay |
| `src/components/Cover.jsx` | The index: filters, rows and the preview pane |
| `src/components/Sheet.jsx` | Renders a project sheet from its blocks |
| `src/components/Media.jsx` | Images, loop videos, annotated figures and the enlarge view |
| `src/components/ModelViewer.jsx` | three.js viewer for the GLB models |
| `src/components/Widgets.jsx` | The interactive widgets |
| `src/styles.css` | All styles, including the blueprint theme |
| `public/assets/` | Images, videos, 3D models, fonts and the resume PDF |
| `public/gridnode/` | A built copy of GridNode OS, the browser model a teammate wrote for our GridNode competition project. It is not my code |
| `scripts/deploy.sh` | Builds the site and publishes it |

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
