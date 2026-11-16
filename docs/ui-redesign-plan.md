# Bench Signal

**A design and UI overview of the Connor Madriago portfolio, and a plan for a full redesign.**

Status: **proposal — nothing in this document has been implemented.**
Branch: `ui-redesign-plan`. This work is deliberately kept off `main`.

---

## 0. The short version

The site today is a well-made engineering document: print-stock paper, blueline ink, red-pen callouts, highlighter on the numbers that matter. Its content is unusually strong — measured results, required-versus-measured tables, honest "problems and fixes" sections — and that is the thing an employer should remember.

What it is not yet is a **showreel**. The motion is incidental (200–350 ms fades and one shared-element morph), the index hides its best media behind a desktop hover, and on a phone the first screen is a list of text.

This plan keeps the evidence and rebuilds the frame around it as an **instrument**: a dark, calibrated surface where the portfolio's own measurements drive the typography, the ambient signal field, and the transitions. Every project page becomes a chapter in that instrument; every animation either shows state or shows hierarchy. Nothing decorative, nothing invented.

Six phases, roughly 12–18 working days, each one shippable. Five decisions for the owner at the end (§12).

---

## 1. Inventory: what is actually in the repository

### 1.1 The experience as built

One document with two states, driven by a hash route (`src/hooks.js` → `useRoute`, pattern `#/p/<id>`).

| Surface | Route | Behaviour |
|---|---|---|
| Index | `#/` | Name, two-paragraph header, 11 rows in 3 groups, sticky preview pane (desktop only) |
| Project sheet | `#/p/<id>` | Full-window dialog (`role="dialog"`, `aria-modal`), accordion-free long read, 9 of 11 items |
| Contact | in-page `#contact` footer | Email, LinkedIn, GitHub, Resume, "Blueprint view" toggle |

Interaction map, with the file that owns each piece:

| Element | What it does | Where |
|---|---|---|
| Index row | Hover/focus swaps the preview pane; click opens the sheet | `components/Cover.jsx` |
| Preview pane | Media + specs + "Open the full write-up", shared-element `layoutId` into the sheet hero | `components/Cover.jsx` |
| Sheet bar | Back, "i of n", Email, Previous, Next, scroll progress | `components/Sheet.jsx` |
| Sheet body | Renders the block model: figures, text, check tables, specs, code, cols, stack, sketch, widget, model, embed | `components/Sheet.jsx` |
| Figure | Numbered balloons + leader lines drawn on first view, hover pairing, enlarge lightbox | `components/Media.jsx` |
| 3D viewer | three.js, line-drawing or shaded, drag to orbit, pinned notes | `components/ModelViewer.jsx` |
| Widgets | Thruster mixer, crossing sim, run timeline, move checker, confidence chart | `components/Widgets.jsx` |
| Theme | Print (default) ↔ Blueprint, persisted in `localStorage` | `App.jsx`, `styles.css` |

**Content** (`src/data/content.jsx`, 873 lines): 11 entries, 6 projects, 4 team/lab entries, 1 software entry. 9 have full sheets; `baja` and `masa` are index-only with generated "plate" covers. All copy is hand-authored JSX with `==highlight==` and `[label](url)` inline syntax.

**Media** (`public/assets`): 30 stills plus 240 px thumbnails, 5 clips, 3 GLB models, 2 type families, one resume PDF. Plus `public/gridnode/` — a 2.5 MB built copy of a teammate's browser app, embedded on demand.

### 1.2 The design system as built

| Token | Value | Role |
|---|---|---|
| `--paper` | `#eceee9` | Ground |
| `--paper-deep` | `#dfe3dc` | Raised plate |
| `--ink` | `#1e2875` | Type, rules |
| `--graphite` | `#555b6e` | Secondary type |
| `--red` | `#c4261a` | Annotation, pen |
| `--hi` | `#ffe25a` | Highlighter |

Type: **Archivo** variable (width axis 62–125%, weight 100–900) for everything structural; **Routed Gothic** and **Routed Gothic Wide** as the hand-lettered technical voice; `ui-monospace` for code. Grid: 7/5 split on the index, 3/9 on the sheet, fluid gutter `clamp(16px, 4vw, 56px)`, sheet max width 1400 px.

Motion as built: `MotionConfig reducedMotion="user"` with one spring (stiffness 260, damping 30); `layoutId` morph from preview to sheet hero; `AnimatePresence` for preview swaps; leader lines and balloons drawn in on first view with a 120 ms stagger; CSS transitions for hover and row state.

**Structural problem to fix before adding anything.** `src/styles.css` is one 731-line file that grew by appending: the last 300 lines are headed "polish", "critique fixes" and "review changes", and they re-declare earlier selectors. Two examples that already disagree with each other: `.preview__frame` is `aspect-ratio: 4/3` at line 143 and `16/10` at line 590; `.project__side .facts` is `position: sticky` and then reset to `static` with a second wrapper (`.project__side-in`) added to compensate. A redesign that introduces a second visual mode cannot be layered onto that cascade safely.

### 1.3 Performance baseline (measured today)

| Asset group | Size | Notes |
|---|---|---|
| Images | 7.3 MB | Single-resolution JPG/PNG, no `srcset`; `gap-vehicle-circuit.png` alone is 0.8 MB |
| 3D models | 7.0 MB | `dj-enclosure.glb` 3.6 MB, `rov.glb` 1.9 MB, `dj-deck-front.glb` 1.4 MB — no Draco/meshopt |
| Video | 1.5 MB | 5 clips, `preload="metadata"`, play only in view ✔ |
| GridNode embed | 2.5 MB | One 2.4 MB JS bundle; already click-to-load ✔ |

What is already right and should be preserved: `three` and the widgets are code-split and lazy (`Sheet.jsx`), the 3D viewer waits until 300 px from the viewport (`useNear`), videos pause off-screen, fonts are preloaded, `base: "./"` keeps GitHub Pages working, and the noscript fallback is real.

What is missing: responsive images, modern formats, mesh compression, a font subset for the TTF hand faces, and any measured budget.

### 1.4 Accessibility baseline

Already good: `inert` on hidden layers, focus returned to the originating row on sheet close, dialog semantics with `aria-labelledby`, 3 px focus-visible outline, 44 px targets under 560 px, arrow-key navigation in both the index and between projects, `prefers-reduced-motion` honoured in CSS *and* in `MotionConfig`, video given controls under reduced motion, real `<table>`/`<caption>` semantics for the check tables, alt text on every image.

Gaps: no skip link; the canvas and 3D viewer have labels but no text alternative; the desktop preview pane carries information (specs, results) that touch users never see; there is no way to pause ambient motion; `prefers-contrast` and `forced-colors` are unhandled.

### 1.5 Constraints the redesign must live within

- **Static hosting.** GitHub Pages, relative `base`, hash routing, one deploy script to `gh-pages`. No server, no analytics, no forms backend.
- **The stack is already sufficient.** React 19, Vite 8, `motion` 14 and `three` 0.187 are present. The motion work needs no new runtime dependency; a canvas field is ~120 lines of plain code.
- **Content is the interface.** The block model in `content.jsx` is the contract. New layout must consume the same blocks, or extend the model additively — never rewrite the copy.
- **This branch is a proposal.** Nothing merges to `main` without an explicit request.

---

## 2. Design read

### What must survive

1. **Evidence first.** "Asked for 200 mm in 2 min / tested: 400 mm in about 10 s" is more persuasive than any animation. The required-versus-measured tables, the "Problems and fixes" sections written in the red pen voice, and the "About these numbers" caveats are the site's spine.
2. **The annotation grammar.** Balloons, leaders, dimension tags and highlighter are a real visual language, not decoration. They should be re-cut, not replaced.
3. **One-screen efficiency.** An employer can scan all 11 items without scrolling. That is a genuine advantage over endless-scroll portfolios.
4. **Restraint in copy.** No adjectives doing work that numbers should do. The redesign must not add hype.

### Eight findings

| # | Finding | Evidence | Consequence |
|---|---|---|---|
| F1 | **On a phone, the first screen is a list of text.** | `Cover.jsx` renders the preview pane only when `wide` (≥1000 px). At 405 px the hero is a name, three sentences, and rows. | Links are opened on phones. The first 3 seconds show no craft. |
| F2 | **Motion is incidental, not scored.** | Durations 0.2–0.35 s, one spring, no load sequence, no transition between projects; the only authored motion is the leader-line draw. | It reads as a tasteful document, not an animation portfolio. |
| F3 | **The index hides its best media behind hover.** | Preview appears on pointer-enter/focus only. | Six project hero assets are never seen by touch users; the index has no visual rhythm. |
| F4 | **One screen leaves no room for a point of view.** | `.cover` fits hero + 11 rows + preview; the critique pass shrank the H1 to `clamp(2.1rem, 3.9vw, 3.6rem)`. | The most valuable pixels say "inventory", not "look at this". |
| F5 | **Filters exist and are unused.** | `filters` (Mechanical, Electronics, Software, Research, Teaching) is exported from `content.jsx` and never imported; every item carries `tags`. | Recruiters cannot filter for software or teaching work. Free win. |
| F6 | **3D is documentation, not signature.** | Models render as paper line drawings, `interactive={false}` on covers, hint text only. | The most technically impressive asset produces no memorable moment. |
| F7 | **The CSS is an append-only cascade.** | 731 lines; "polish", "critique fixes", "review changes" blocks re-declare earlier selectors. | Adding a second visual mode here will fight the cascade. |
| F8 | **The theme switch is buried and mislabelled.** | "Blueprint view" sits inside the contact block at the page foot with `aria-pressed`. | A distinctive feature nobody finds. |

### What the redesign has to prove

To an employer skimming on a phone: **craft** (this person controls type, space and time), **range** (mechanical, electronics, software, research), **rigour** (claims are measured and sourced), **personality** (someone I want on the team). Today's site proves 2 and 3 strongly, 1 weakly, and 4 not at all.

---

## 3. The direction: Bench Signal

> The portfolio behaves like the instrument it describes.

Everything on this site is already a measurement: 400 mm crossed in ~10 s, ground drop from 1,001 mV to 12 mV, 1,592 of 1,592 frames tracked, 39.7 tok/s median, 5.56 N per thruster, 0.033 m of overshoot. Those numbers are the material. Bench Signal turns the page into the bench: a dark instrument field, hairline rules, tabular data, and a signal trace that responds to reading speed instead of looping for its own sake.

Three rules govern every decision:

1. **Every motion carries information** — a state change, a hierarchy change, or a cause-and-effect. If it can be removed without losing meaning, it is removed.
2. **One ambient animation only.** The signal field runs; everything else is triggered by scroll, pointer, focus or route change. No competing loops.
3. **The numbers are the ornament.** Type is set from real data pulled out of `content.jsx`. No invented stats, no decorative "50+ projects" counters.

**What it is not:** not a scroll-scrubbed 3D site, not a custom-cursor that fights the native one, not a 3-second loader, not dark-for-dark's-sake. **Print mode ships as a first-class twin**, with the current paper-and-ink palette refined rather than replaced, so the redesign is a change of instrument, not a loss of the identity that already works.

Why this beats the obvious alternatives: a "big-type minimal" portfolio is everywhere; a "3D blob" portfolio signals nothing about engineering. An instrument signals exactly what the content is about, and it gives the animation work a *reason* that survives an interviewer's question: "why does it move like that?"

---

## 4. Design system v2

### 4.1 Colour

Three modes, one token contract. Signal is the default; Print is the daylight twin; Blueprint survives as a hidden third (kept, because it already works and costs nothing).

| Token | Signal (default) | Print | Role |
|---|---|---|---|
| `--c-void` | `#0b0d0e` | `#eceee9` | Ground |
| `--c-panel` | `#121617` | `#dfe3dc` | Raised plate / console |
| `--c-text` | `#f2f4ef` | `#1e2875` | Primary type |
| `--c-mute` | `#8d9895` | `#555b6e` | Secondary type |
| `--c-line` | `#24302e` | `#c3c9c2` | Hairlines |
| `--c-signal` | `#d6ff3f` | `#1e2875` | Primary accent, active state, "ours" column |
| `--c-alert` | `#ff6b47` | `#c4261a` | Annotations, "problems and fixes" |
| `--c-hi` | `#d6ff3f` | `#ffe25a` | Highlighter |
| `--c-paper` | `#f2f4ef` | `#eceee9` | Inverted text (never pure white) |

Notes: `#d6ff3f` on `#0b0d0e` measures above 14:1. `--c-alert` is for large text, rules and UI only; small annotation text uses `#ff8a6d` to stay above 4.5:1. Blueprint keeps its existing blue/yellow pair. Every mode is a token swap — no component knows which mode is active.

### 4.2 Type

Families unchanged (no new loading cost): **Archivo** variable for display and text, **Routed Gothic** for the hand voice, `ui-monospace` for data. The width axis becomes an animation property — the one thing this font can do that a static face cannot.

| Step | Size | Line | Tracking | Use |
|---|---|---|---|---|
| `display-xl` | `clamp(3.2rem, 11.5vw, 9.5rem)` | 0.86 | −0.045em | Name, email |
| `display-l` | `clamp(2.4rem, 6.5vw, 5rem)` | 0.9 | −0.035em | Section titles |
| `title` | `clamp(1.7rem, 3.2vw, 2.7rem)` | 0.98 | −0.02em | Project titles |
| `heading` | `clamp(1.2rem, 1.75vw, 1.5rem)` | 1.2 | 0 | Sheet h2 |
| `body` | `1.0625rem` | 1.55 | 0 | Copy (unchanged, it measures well) |
| `small` | `0.9375rem` | 1.45 | 0 | Captions, facts |
| `micro` | `0.75rem` | 1.2 | 0.08em, uppercase | Labels, counters, ticks |

Two composition rules: display type is set in a mask that reveals line by line (§6, M3); technical labels are always `micro` + monospace + tabular numerals so data aligns in columns without tables.

### 4.3 Grid, space, lines

12 columns at ≥1280 px (40 px gutter, 1560 px max), 8 at 768–1279 (24 px), 4 at <768 (16 px). Sheet body measure stays 62–66 ch. Space scale: 4, 8, 12, 20, 32, 52, 84, 136. Lines are 1 px everywhere (the 1.5 px of the print mode is a mode token). Radii: 2 px on inputs, 999 px on interactive pills, 0 everywhere else — no floating cards.

Surfaces: **ground** (void), **plate** (a full-bleed media panel), **console** (a widget or data frame with a micro label tab and a hairline border). Everything else is type on ground.

### 4.4 Motion tokens

| Token | Value | Use |
|---|---|---|
| `--dur-1` | 120 ms | Hover, focus, chip state |
| `--dur-2` | 220 ms | Small enter/exit |
| `--dur-3` | 380 ms | Panel, sheet, mode swap |
| `--dur-4` | 620 ms | Scene / title reveal |
| `--dur-5` | 1200 ms | Ambient wave only |
| `--ease-out` | `cubic-bezier(.16, 1, .3, 1)` | Entrances |
| `--ease-in-out` | `cubic-bezier(.65, 0, .35, 1)` | Moves between states |
| spring UI | stiffness 220, damping 26 | Pointer-follow, ticks |
| spring scene | stiffness 140, damping 18 | Large surfaces |
| stagger | 40 ms base / 24 ms dense, cap 320 ms | Lists, rows, letters |

---

## 5. Composition, section by section

### 5.1 Home — a scroll that reads as a showreel

The one-screen index goes. It is replaced by a **short scroll (5 sections, ~3.5 viewports on desktop)** where the index is still complete and still scannable, but arrives after a first impression that can carry the design.

```
DESKTOP ≥1280
┌──────────────────────────────────────────────────────────┐
│ C. MADRIAGO        work    about    resume    [FREEZE] ●  │  sticky bar, 56px
├──────────────────────────────────────────────────────────┤
│  ~  ~ ~   ~  ~    (signal field, faint, behind type)     │
│  CONNOR                                                  │  display-xl, 3 mask lines
│  MADRIAGO                          2029 · U-M            │
│  ME student. I build robots and the                      │  body, 46ch
│  electronics and code that run them.                     │
│  [ Open to summer 2027 ]   [ Resume ↗ ]  [ Email ]       │  status chip + actions
├──────────────────────────────────────────────────────────┤
│ 400 mm       ~10 s      1,001→12 mV     39.7 tok/s        │  proof strip, count-up
│ gap crossed  to cross   ground drop    local model        │
├──────────────────────────────────────────────────────────┤
│ THE WORK  ● mechanical ● electronics ● software ● research│  filter chips (live)
│ 01 Gap-crossing vehicle    2026    ┌──────────────────┐   │
│ 02 DJ controller           2026    │                  │   │  stage plate follows
│ 03 Underwater ROV         2026    │   media of row   │   │  the pointer
│ ...                                └──────────────────┘   │
├──────────────────────────────────────────────────────────┤
│ SIGNATURE CASE — full-bleed media, stamp, "read it →"    │
├──────────────────────────────────────────────────────────┤
│ PRACTICE — education, honours, labs, teaching, tools     │
├──────────────────────────────────────────────────────────┤
│ madriago@umich.edu  (display-xl, copy on click)          │
│ linkedin · github · resume · [PRINT/SIGNAL] · colophon    │
└──────────────────────────────────────────────────────────┘

MOBILE 405
┌───────────────────────────┐
│ C. MADRIAGO   resume  ●   │  one sticky row, 52px
├───────────────────────────┤
│ CONNOR                    │  display-xl, ~58px
│ MADRIAGO                  │
│ ME student at U-M. I      │
│ build robots and the      │
│ electronics and code.     │
│ [ Open to summer 2027 ]   │
│ [ Resume ] [ Email ]      │
│ ┌───────────────────────┐ │  one hero plate (16:10), autoplay
│ │  hero media (poster)  │ │  muted video, tap to open case
│ └───────────────────────┘ │
├───────────────────────────┤
│ 400 mm       ~10 s        │  proof 2×2
│ 1,001→12 mV  39.7 tok/s   │
├───────────────────────────┤
│ THE WORK                  │
│ [All][Mech][Elec][SW][Res]│  chips scroll horizontally
│ 01 ┌────┐ Gap-crossing …  │  92px thumb every row
│    └────┘ 2026            │
│ 02 ┌────┐ DJ controller   │
│ …                         │
├───────────────────────────┤
│ madriago@umich.edu        │  display-l, wraps
└───────────────────────────┘
```

**S1 · Calibration** *(optional, 420 ms, once per session)* — a hairline sweeps each edge, a `00 → 100` counter ticks in `micro`, then the field resolves. Content is already painted underneath; the overlay never blocks paint, is skipped for `prefers-reduced-motion`, is skipped on repeat visits (`sessionStorage`), and never appears on a project sheet.

**S2 · Hero** — name as three masked lines (CONNOR / MADRIAGO / and a `micro` line: "Mechanical engineering · University of Michigan · Class of 2029"). One positioning line from `me.say`, verbatim. Status chip from `me.note` ("Open to summer 2027 internships"). Actions: Resume (PDF), Email. Signal field behind at 18% opacity.
*Mobile:* two-line name at ~58 px, one hero plate below the actions — a real visual before any scrolling.

**S3 · Proof strip** — four counters, each pulled from existing copy: `400 mm` (gap crossed), `~10 s` (crossing time), `1,001 → 12 mV` (ground drop), `39.7 tok/s` (local model). Labels in `micro`. Source strings stay in `content.jsx` (see §11, P0) so they cannot drift from the project pages.

**S4 · The work** — the index, now with a stage. Rows carry number, title, one-line, year, discipline ticks. Desktop: the stage plate follows the pointer with a spring lag and crossfades media. The whole list is keyboard-navigable with arrows; focus moves the stage. Mobile: every row gets a 92 px thumb (already implemented at <1000 px — keep it), and the stage becomes the hero plate above, which changes on tap-and-hold? No: on mobile the plate is the *featured* case only; rows are self-contained.
**Filters** (finally) from the unused `filters` array, driven by `tags`: chips with counts, `layout` animations on reflow, "All" reset, no URL state (keeps hash routing untouched).

**S5 · Signature case** — one full-bleed panel for `gap-vehicle` (the strongest evidence story): media, two-line stamp, "Read the case →". This is the scroll's emotional beat and the place where the field is allowed to brighten.

**S6 · Practice** — the about material that currently hides in two header paragraphs: education and honours (`me.meta`), labs (Oldham, Z Lab), teaching (XV, FRC), teams (Baja, MASA), tools (`me.tools`). Two-column editorial on desktop, stacked on mobile. **Copy is sourced from existing content, not invented** — anything new needs owner sign-off.

**S7 · Contact + colophon** — email at `display-xl` with click-to-copy, then LinkedIn, GitHub, Resume, the mode switch (Signals / Print), the freeze control, and a colophon line ("React, Vite, Motion, three.js — set in Archivo and Routed Gothic"). The colophon is a quiet signal to other engineers that this was built, not bought.

### 5.2 Project sheet

The overlay model, the block renderer, the facts rail and the TOC all stay — they are good. What changes is the frame around them and the choreography into them.

```
┌──────────────────────────────────────────────────────────┐
│ ← all work   Gap-crossing vehicle  ·  01/09   ←  →   ●   │  bar; title fades in
│ ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔  progress, 2px       │
├──────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐  │  hero: full-bleed plate
│  │            hero media / 3D model                   │  │  (breaks the 9-col grid)
│  │  ┌ 400 mm · about 10 s ┐                           │  │  stamp bottom-left
│  └────────────────────────────────────────────────────┘  │
│  Gap-crossing vehicle                                    │  title over the plate edge
│  An eight-wheeled vehicle that pushes its own …          │
├──────────────┬───────────────────────────────────────────┤
│ WHEN         │  01 · The brief                           │  chapter rule + micro label
│ Jun–Aug 2026 │  …text 62ch…                              │
│ WHERE        │                                           │
│ ME 2500J …   │  [figure, break-out to full width]        │
│ MY PART      │  ① ② ③ leaders draw on entry              │
│ …            │                                           │
│ ── chapters  │  02 · Required against measured           │
│ 01 ✓         │  ┌─────────┬────────┬──────────┐          │  rows tick in
│ 02 ●         │  │ Gap     │ 200 mm │ 400 mm   │          │  "ours" in --c-signal
│ 03           │  └─────────┴────────┴──────────┘          │
│ 04           │                                           │
│              │  ┌ CONSOLE ──────────────┐                │  widget frame
│              │  │ cross the gap          │                │  logic unchanged
│              │  └────────────────────────┘                │
│              │                                           │
│              │  NEXT →  DJ controller                      │  full-width plate
└──────────────┴───────────────────────────────────────────┘
```

Changes: figures **break out** of the text column to the full sheet width (images are the argument); the facts rail keeps its sticky behaviour with one wrapper instead of two; chapters get numbers and a tick rail; the widget frame becomes a labelled console; the "Next" card gets the next project's hero media, not a plain text block.

### 5.3 About — new route `#/about`

The current site asks an employer to reconstruct a career from project pages. One route, four sections, all sourced from existing copy: **Practice** (how the work is made, including the existing AI-agent disclosure — a credibility asset), **Education & honours**, **Labs & teams**, **Teaching**. No new claims; this is arrangement, not authorship.

### 5.4 Edge states

`prefers-reduced-motion` (static plot, final counters, 1-frame transitions), no-WebGL (existing fallback image, keep), `forced-colors` (field hidden, borders to `CanvasText`), print stylesheet (sheet → clean pages, field hidden, URLs expanded), unknown hash (`#/p/nope`) → index with a `micro` note instead of a blank state.

### 5.5 At 405 px specifically

Since the preview is being reviewed at 405 px, the mobile plan is not an afterthought: one sticky bar (52 px) with the name, Resume and the freeze dot; a two-line 58 px name; a real hero plate above the fold; a 2×2 proof grid; horizontally scrolling filter chips; rows that are self-contained (thumb + title + line + year, no hover); sheet title over its hero; facts as a 2-column definition grid; chapters as inline numbered h2s with a hairline; the email allowed to wrap at `display-l`.

---

## 6. The motion system

Thirteen motions, each with a job, a trigger, a spec and a reduced-motion replacement. Nothing else moves.

| # | Motion | Trigger | Spec | Reduced motion |
|---|---|---|---|---|
| M1 | **Calibration** | First load, once/session | 420 ms: hairlines sweep L→R, counter `00→100`, overlay fades `--dur-3` | Skipped |
| M2 | **Signal field** | Always (ambient) | Canvas, 2 traces + grid; amplitude ← scroll velocity, damped; ≤2 ms/frame; pauses when hidden | Frozen static plot |
| M3 | **Masked type reveal** | Section enters | `clip-path` inset 100→0, y 24→0, `--dur-4` `--ease-out`, 60 ms line stagger | Final state, no clip |
| M4 | **Number tick** | Proof strip in view | 900 ms count to final, tabular numerals, width reserved (no CLS) | Final number |
| M5 | **Stage follows pointer** | Row hover, fine pointer ≥1000 px | Plate translates with spring UI lag; media crossfade `--dur-2`; scale 0.96→1 | Crossfade only, on focus too |
| M6 | **Index → sheet** | Open a project | Existing `layoutId` morph kept; background field crossfades; 1 px calibration line sweeps top→bottom 320 ms; title letters in at 12 ms stagger | `layoutId` off, 1-frame cut |
| M7 | **Chapter rail** | Scroll in sheet | Active tick moves with spring UI; progress line `scaleX` (already exists, keep) | No spring, instant |
| M8 | **Figure entrance** | Figure 30% in view, once | Frame y 16→0, clip reveal; leaders draw 500 ms; balloons pop at +80 ms each | Static figure |
| M9 | **Table tick-in** | Table in view, once | Rows y 8→0, `--dur-3`, 40 ms stagger; hairlines draw L→R | Static |
| M10 | **Channel change** | ← / → between projects | Out: x −8%, opacity 0, 180 ms. In: x +6%→0, 320 ms. Ghost of outgoing hero at 12% for 240 ms | Instant swap |
| M11 | **Copy email** | Click | Label morphs to "Copied" with a tick, reverts at 1.6 s | Same (no animation, just text) |
| M12 | **Freeze** | User control | Pauses M2 and every ambient loop; persists per session | Always available |
| M13 | **Model idle** | Sheet hero in view | Existing slow rotation; pointer adds ±3° parallax; stops on drag and on touch | Static render |

Choreography for the three journeys that matter:

- **First load:** field resolves → name line 1 (0 ms) → line 2 (60 ms) → positioning line (120 ms) → actions (180 ms) → proof strip only when scrolled to. Total ≤ 800 ms.
- **Index → sheet:** plate lifts (120 ms) → bar slides in (0 ms) → hero lands (layout morph) → title letters (40 ms after) → body sections only as they enter. Outgoing index is not animated.
- **Project → project:** bar title swaps instantly, hero ghosts out, new hero fades and its title letters in. ≤ 420 ms total.

Hard rules: ≤2 concurrent sequences; only `transform`, `opacity`, `clip-path`, `filter`, `scale`; no animated layout properties; no scroll hijacking (native scroll, `useScroll` for transforms only); no animation in the first paint path.

**Reduced motion is a designed state, not an absence.** `MotionConfig reducedMotion="user"` stays; the field becomes a still plot with one hairline and the final numbers; every reveal renders in its final position; the sheet opens with a cut. Verified by toggling the OS setting, not by assuming.

---

## 7. Interaction patterns

| Pattern | Desktop | Touch | Keyboard | Screen reader |
|---|---|---|---|---|
| Index row | Hover moves stage | Tap opens; thumb visible | ↑/↓ move focus (stage follows focus), Enter opens | `button` with title, year, one-line |
| Filters | Chips with counts | Chips, horizontal scroll | Tab, Space toggles | `aria-pressed` per chip, live count |
| Stage plate | Follows pointer | Not present (hero plate instead) | Follows focus | `aria-hidden` (duplicate of row) |
| Figure callouts | Hover pairs balloon ↔ note | Tap a balloon to highlight its note | Notes are a real `<ol>` | Numbered list, `aria-describedby` links |
| 3D model | Drag orbit, idle rotation | One-finger orbit, `touch-action: pan-y` | Not focusable; poster + caption instead | Alt text + table of pinned notes |
| Widgets | Pointer + sliders | Same, 44 px targets | Native inputs first | Labelled controls, live readouts polite |
| Sheet nav | ← / → / Esc | Bar buttons | Same + focus trap | `dialog` semantics, title announced |
| Field | Pointer nudges amplitude | Off (perf) | — | `aria-hidden`, text alternative in colophon |
| Freeze | Button in bar | Button in bar | Reachable, `aria-pressed` | Announced |

**The cursor is not replaced.** Desktop gets a thin crosshair overlay and a `micro` coordinate readout that appears only over figures (paired with the existing balloon grammar) — the native cursor stays visible and functional. Off on touch, off for `prefers-reduced-motion`, never a hit-target.

---

## 8. Accessibility plan

Target **WCAG 2.2 AA**, verified with keyboard only and with a screen reader, not assumed.

Add: skip link → main; text alternative for the field and 3D (`<p class="sr-only">` + a data table of the numbers shown); a pause control for ambient motion (2.2.2); parity for hover-only content (the stage must never be the only place specs appear — they stay on the sheet and in the row's accessible name on touch); visible focus in every mode (signal-on-void needs its own ring colour); `prefers-contrast: more` (drops the field, strengthens hairlines); `forced-colors` for the canvas; `prefers-reduced-transparency` for the sheet bar; no flashing above 3 Hz; parallax capped at 10% viewport; 200% zoom and 320 px width without horizontal scroll; headings in order; `lang` unchanged.

Contrast to verify at P0: body on both grounds ≥ 7:1, `micro` labels ≥ 4.5:1, `--c-alert` small text variant `#ff8a6d`, focus ring ≥ 3:1 against both its neighbours.

---

## 9. Responsive and device matrix

| Breakpoint | Layout | Motion |
|---|---|---|
| < 560 | single column, 16 px gutter, sticky bar 52 px, horizontal chips | M2 one trace; M5 off; M6 simplified |
| 560–767 | same, wider measure | same |
| 768–999 | 8 columns, hero plate full width | M5 off (no hover guarantee) |
| 1000–1279 | 12 columns, stage appears on fine pointer | full |
| ≥ 1280 | 12 columns, 1560 px max, hero at `display-xl` | full |
| ≥ 1600 | wider gutters, same measure | full |

Test list: 405×860 (this preview), 390×844, 768×1024, 1024×768, 1440×900, 1920×1080; iOS Safari, Android Chrome, Firefox, Safari; touch and fine pointer; reduced motion on and off; 200% zoom; 4× CPU throttle.

---

## 10. Performance budgets

Measured at P0, enforced at P5.

| Budget | Target |
|---|---|
| LCP (p75, Slow 4G, mid phone) | ≤ 1.8 s — hero is type, field is canvas after paint |
| CLS | ≤ 0.02 |
| INP | ≤ 200 ms |
| Long tasks during any transition | ≤ 50 ms |
| Canvas frame cost | ≤ 2 ms at DPR 1.5, ≤ 600 points, paused when hidden |
| Home JS (gzip, before interaction) | ≤ 200 KB |
| Transfer before first interaction (home) | ≤ 600 KB |
| Each GLB after meshopt/Draco | ≤ 700 KB |
| Any single still | ≤ 180 KB (AVIF/WebP) |

Work required: responsive image variants 480/960/1440 with `srcset`/`sizes`; AVIF/WebP; convert the diagram PNGs (`gap-vehicle-circuit.png` 0.8 MB, `dj-pcb-hub-angle.png` 0.7 MB) to WebP under 120 KB; mesh-optimise the three GLBs (7.0 MB → target 1.6 MB total); subset the two TTF hand faces to WOFF2 Latin; keep `three`, widgets and the GridNode iframe out of the home route (already true — protect it with a size check in CI or a P5 audit).

---

## 11. Implementation plan

All work stays on `ui-redesign-plan`. No merge, no deploy to `gh-pages`, until asked.

| Phase | Work | Files | Acceptance |
|---|---|---|---|
| **P0 · Foundation** (1–2 d) | Split CSS into `@layer` files (tokens, base, layout, components, modes, utilities); adopt the token contract; add motion tokens; extract the four proof numbers into `data/highlights.jsx`; image + model pipeline; capture baselines | `src/styles/*`, `src/data/highlights.jsx`, `scripts/optimise-assets.mjs` (dev-only) | Zero visual change; Lighthouse + asset numbers recorded; `npm run build` clean |
| **P1 · Hero, field, type** (2–3 d) | Signal mode, hero, calibration, proof strip, mode switch in the bar, freeze control | `components/Home/*`, `components/SignalField.jsx`, `App.jsx` | Home renders in both modes; field ≤ 2 ms/frame; reduced motion static; no layout shift |
| **P2 · Index** (2–3 d) | Rows with numbers and discipline ticks, stage plate, filters, keyboard model, mobile rows | `components/Index/*`, `data/content.jsx` (read-only) | All 11 items reachable, filter counts correct, arrows + Enter, stage follows focus |
| **P3 · Sheet** (3–4 d) | Bar with fading title, chapter numbering + rail, figure breakout, table tick-in, console frame, next card with media | `components/Sheet.jsx`, `Media.jsx`, `styles/*` | Deep links still work; Esc/←/→ preserved; focus returns to the originating row; chapter rail accurate |
| **P4 · Widgets & 3D** (2–3 d) | Console treatment, drag affordances, model parallax, optimised meshes, poster fallbacks | `components/Widgets.jsx`, `ModelViewer.jsx` | All 5 widgets behave identically to today; models load ≤ 700 KB; no-WebGL fallback intact |
| **P5 · About, contact, audit** (2–3 d) | `#/about`, closing section, colophon, print stylesheet, a11y + perf pass, real device pass | `components/About.jsx`, `App.jsx`, `styles/*` | Keyboard-only run, screen-reader pass, Lighthouse ≥ 95 perf / 100 a11y on home, reduced-motion matrix complete |

Definition of done for the redesign: every project's claims unchanged and still sourced; every interaction reachable by keyboard; both modes complete; mobile first screen shows a real visual; home ≤ 600 KB before interaction; nothing on `main`.

---

## 12. Risks and open decisions

| Risk | Mitigation |
|---|---|
| An employer gives it 20 seconds on a phone | Hero plate above the fold at 405 px; no intro longer than 420 ms; Resume reachable from the sticky bar |
| Motion fatigue — "designer showing off" | One ambient loop; ≤2 concurrent sequences; every motion in §6 has a stated job |
| Dark mode reads as generic tech | Print mode is a first-class twin; typography and annotation grammar carry the identity, not the palette |
| Low-end Android GPU | DPR cap 1.5, 600 points, pause off-screen, field off under 560 px if a device profile says so, measured at P5 |
| Font width-axis animation unsupported | Fall back to weight + tracking; no content depends on it |
| Content drift between proof strip and project pages | Numbers live in one module, referenced by both |
| Scope creep into rewriting copy | Copy is out of scope; only arrangement changes |

Decisions needed (recommendations in bold):

1. **Accent.** Phosphor lime `#d6ff3f` on near-black — **recommended** — or a warmer amber primary with lime reserved for data?
2. **Default mode.** **Signal (dark)** with Print one click away, or Print default with Signal as the flourish?
3. **Home structure.** **Replace the one-screen index with the 5-section scroll** (index still complete and scannable), or keep one screen and put the redesign's weight entirely into the sheet?
4. **Calibration intro.** **420 ms, once per session**, or no intro at all?
5. **About route.** Approve an `#/about` page assembled only from existing facts, or keep the header paragraphs as the only biography?

If no answer comes back, I build the bolded options.

---

## Appendix A · Content inventory and redesign treatment

| # | Item | Group | Media | Interactive | Treatment |
|---|---|---|---|---|---|
| 1 | Gap-crossing vehicle | Project | 6 stills, 1 clip, annotated hero | `crossing` widget, check table | Signature case on home; hero plate + chapter rail |
| 2 | DJ controller | Project | 2 GLBs, 2 PCB renders, 6 stills | check table | 3D promoted to full-bleed hero; enclosure idle rotation |
| 3 | Underwater ROV | Project | 1 GLB, 4 stills, 3 clips | `mixer` widget, check, specs | Model hero with pinned notes; console mixer |
| 4 | Microrobot tracking | Project | 1 annotated still, 1 clip | `confidence` widget | Chart as console; annotation grammar showcase |
| 5 | Drone swarm | Project | 2 stills | `swarm` widget, specs | Packet-diagram sequence |
| 6 | GridNode | Project | 3 stills + embedded app | click-to-load iframe | Lazy console frame; sketch retained |
| 7 | FRC 2915 | Team | 2 stills | check table | Compact chapter, season table |
| 8 | Baja | Team | Plate cover | — | Index-only, thumb from plate |
| 9 | MASA | Team | Plate cover | — | Index-only |
| 10 | Atombot | Team | — | — | Text-first, NDA note kept prominent |
| 11 | Local models & agents | Software | 1 still | `models`, `timeline`, `movecheck` widgets, code | Widget-heavy: console cluster, code block restyled |

## Appendix B · File-level change map

| File | Change |
|---|---|
| `src/styles.css` → `src/styles/*.css` | Split into `@layer` tokens / base / layout / components / modes / utilities; delete the appended override blocks |
| `src/App.jsx` | Home becomes a scroll; mode + freeze controls; `#/about` route |
| `src/components/Cover.jsx` | Split into `Home/` sections; index becomes its own component |
| `src/components/Sheet.jsx` | Bar title fade, chapter numbers, break-out figures, next card |
| `src/components/Media.jsx` | Responsive `srcset`, WebP/AVIF, callout styling, crosshair readout |
| `src/components/Widgets.jsx`, `ModelViewer.jsx` | Console framing, optimised assets, interaction affordances — logic unchanged |
| `src/data/content.jsx` | Read-only except additive tags if filters need them |
| `src/data/highlights.jsx` | New: the four proof figures, single source |
| `src/hooks.js` | Add `usePointer`, `useFinePointer`, `useFreeze`, `useMode` |
| `index.html` | Theme colour, preload the hero image, keep the noscript block |
| `README.md` | Document the modes, the motion tokens and the asset pipeline |

---

*Prepared on `ui-redesign-plan`. Nothing here is implemented yet.*
