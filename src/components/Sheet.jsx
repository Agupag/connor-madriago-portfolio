import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { Figure, Media } from "./Media.jsx";
import { rich } from "./rich.jsx";
import { openProject, useInView, useMedia } from "../hooks.js";
import { sketches } from "../data/sketches.jsx";
import { me } from "../data/content.jsx";

const emailHref = (me.links.find(([k]) => k === "Email") || [])[2];
const nn = (n) => String(n).padStart(2, "0");

const ModelViewer = lazy(() => import("./ModelViewer.jsx"));
const Widget = lazy(() =>
  import("./Widgets.jsx").then((m) => ({
    default: ({ id }) => {
      const W = m.widgets[id];
      return <W />;
    },
  }))
);

function Text({ block }) {
  return (
    <div className={"say" + (block.wrong ? " say--wrong" : "")}>
      {block.title && <h2>{block.title}</h2>}
      {block.body.map((b, i) =>
        typeof b === "string" ? (
          <p key={i}>{rich(b)}</p>
        ) : (
          <ul key={i}>
            {b.list.map((li, j) => (
              <li key={j}>{rich(li)}</li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}

// Rows tick in once, in reading order.
function Check({ block }) {
  const ref = useRef(null);
  const seen = useInView(ref, { amount: 0.25, once: true });
  return (
    <table className={"check" + (seen ? " is-seen" : "")} ref={ref}>
      {block.caption && <caption>{block.caption}</caption>}
      <thead>
        <tr>
          {block.head.map((h) => (
            <th key={h} scope="col">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {block.rows.map(([name, asked, got, state], i) => (
          <tr key={name} style={{ "--i": i }}>
            <th scope="row">{name}</th>
            <td>{asked}</td>
            <td className={state === "miss" ? "miss" : "got"}>{state === "ok" ? <mark>{got}</mark> : got}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Specs({ block }) {
  return (
    <div className="specs">
      {block.title && <h2>{block.title}</h2>}
      <dl>
        {block.rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{rich(v)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// A separate web app shown in a frame. It only loads when asked for,
// and on narrow screens it opens in its own tab instead.
function Embed({ block, n }) {
  const wide = useMedia("(min-width: 900px)");
  const [on, setOn] = useState(false);
  return (
    <figure className="fig fig--embed" data-kind="Embedded app">
      <div className="fig__frame fig__frame--embed" style={{ aspectRatio: block.ratio || "16 / 10" }}>
        {on && wide ? (
          <iframe src={block.src} title={block.title} sandbox="allow-scripts allow-same-origin" />
        ) : (
          <>
            <img src={block.poster} alt={block.alt || ""} loading="lazy" />
            {wide ? (
              <button type="button" className="pill pill--signal embed__go" onClick={() => setOn(true)}>
                {block.cta}
              </button>
            ) : (
              <a className="pill pill--signal embed__go" href={block.src} target="_blank" rel="noreferrer">
                {block.cta}
              </a>
            )}
          </>
        )}
      </div>
      <figcaption>
        <b>Fig. {n}. </b>
        {rich(block.caption)}
      </figcaption>
    </figure>
  );
}

function Block({ block, num }) {
  switch (block.type) {
    case "figure":
      return <Figure {...block} n={num.get(block)} />;
    case "text":
      return <Text block={block} />;
    case "check":
      return <Check block={block} />;
    case "specs":
      return <Specs block={block} />;
    case "code":
      return (
        <div className="code">
          {block.title && <h2>{block.title}</h2>}
          <pre tabIndex={0}>
            <code>{block.code}</code>
          </pre>
          {block.note && <p className="code__note">{rich(block.note)}</p>}
        </div>
      );
    case "cols": {
      const prose = (b) => b.type === "text" || (b.type === "stack" && b.items.every((x) => x.type === "text"));
      if (block.items.every(prose))
        return (
          <div className="prose-col">
            {block.items.map((b, i) => (
              <Block key={i} block={b} num={num} />
            ))}
          </div>
        );
      return (
        <div className={"cols" + (block.wide ? " cols--wide-" + block.wide : "")}>
          {block.items.map((b, i) => (
            <Block key={i} block={b} num={num} />
          ))}
        </div>
      );
    }
    case "stack":
      return (
        <div className="stack">
          {block.items.map((b, i) => (
            <Block key={i} block={b} num={num} />
          ))}
        </div>
      );
    case "sketch": {
      const S = sketches[block.id];
      return (
        <figure className="fig fig--bare">
          <div className="fig__frame">
            <S />
          </div>
          <figcaption>
            <b>Fig. {num.get(block)}. </b>
            {block.caption}
          </figcaption>
        </figure>
      );
    }
    case "widget":
      return (
        <figure className="fig fig--widget" data-kind="Console">
          <div className="fig__frame">
            <Suspense fallback={<div className="model__wait">Loading</div>}>
              <Widget id={block.id} />
            </Suspense>
          </div>
          <figcaption>
            <b>Fig. {num.get(block)}. </b>
            {rich(block.caption)}
          </figcaption>
        </figure>
      );
    case "model":
      return (
        <figure className="fig fig--model" data-kind="3D model">
          <div className="fig__frame fig__frame--model">
            <Suspense fallback={<div className="model__wait">Loading the 3D model</div>}>
              <ModelViewer {...block} look={block.look} />
            </Suspense>
          </div>
          {block.notes?.length > 0 && (
            <ol className="notes">
              {block.notes.map((n, i) => (
                <li key={i}>{n.text}</li>
              ))}
            </ol>
          )}
          <figcaption>
            <b>Fig. {num.get(block)}. </b>
            {block.caption}
          </figcaption>
        </figure>
      );
    case "embed":
      return <Embed block={block} n={num.get(block)} />;
    default:
      return null;
  }
}

// Figures are numbered in reading order within a sheet.
function numberFigures(item) {
  const num = new Map();
  let n = 0;
  const walk = (b) => {
    if (["figure", "sketch", "model", "embed", "widget"].includes(b.type)) {
      if (b.caption) num.set(b, ++n);
    } else if (b.items) b.items.forEach(walk);
  };
  if (item.hero) walk(item.hero);
  item.blocks.forEach(walk);
  return num;
}

export default function Sheet({ item, items }) {
  const scroller = useRef(null);
  const body = useRef(null);
  const i = items.findIndex((it) => it.id === item.id);
  const prev = items[(i - 1 + items.length) % items.length];
  const next = items[(i + 1) % items.length];
  const num = numberFigures(item);
  const { scrollYProgress, scrollY } = useScroll({ container: scroller });
  const [sections, setSections] = useState([]);
  const [here, setHere] = useState(0);
  const [barTitle, setBarTitle] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => setBarTitle(v > 150));

  // Chapter list, read from the headings actually on the page.
  useEffect(() => {
    const hs = [...(body.current?.querySelectorAll("h2") || [])];
    setSections(hs.map((h, k) => ({ k, label: h.textContent })));
  }, [item.id]);

  // Highlight the chapter currently being read.
  useEffect(() => {
    const root = scroller.current;
    const hs = [...(body.current?.querySelectorAll("h2") || [])];
    if (!root || !hs.length) return;
    const onScroll = () => {
      const top = root.getBoundingClientRect().top + 160;
      let k = 0;
      hs.forEach((h, n) => {
        if (h.getBoundingClientRect().top < top) k = n;
      });
      setHere(k);
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => root.removeEventListener("scroll", onScroll);
  }, [item.id, sections.length]);

  const jump = (k) => {
    body.current?.querySelectorAll("h2")[k]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    scroller.current?.scrollTo(0, 0);
    document.getElementById("sheet-h")?.focus({ preventScroll: true });
  }, [item.id]);

  useEffect(() => {
    const key = (e) => {
      if (e.key === "Escape") openProject(null);
      if (e.target.closest?.("input, textarea, pre, video, iframe")) return;
      if (e.key === "ArrowRight") openProject(next.id);
      if (e.key === "ArrowLeft") openProject(prev.id);
    };
    window.addEventListener("keydown", key);
    document.documentElement.classList.add("is-locked");
    return () => {
      window.removeEventListener("keydown", key);
      document.documentElement.classList.remove("is-locked");
    };
  }, [next.id, prev.id]);

  return (
    <motion.div
      className="layer"
      ref={scroller}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-h"
      initial={{ opacity: 0, x: 22 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="layer__bar">
        <motion.div className="layer__progress" style={{ scaleX: scrollYProgress }} />
        <div className="layer__bar-in">
          <button type="button" className="bar__back" onClick={() => openProject(null)}>
            <span aria-hidden="true">←</span> all work
          </button>
          <span className={"layer__title" + (barTitle ? " is-on" : "")} aria-hidden={!barTitle}>
            {item.title}
          </span>
          <span className="layer__where micro">
            {nn(i + 1)} / {nn(items.length)}
          </span>
          <a className="bar__link" href={emailHref}>
            email
          </a>
          <button type="button" className="bar__link" onClick={() => openProject(prev.id)} title={`Previous: ${prev.title}`}>
            prev
          </button>
          <button type="button" className="bar__link" onClick={() => openProject(next.id)} title={`Next: ${next.title}`}>
            next
          </button>
        </div>
      </div>

      <article className="sheet project" key={item.id}>
        {item.hero && (
          <motion.div
            className="project__hero"
            initial={{ opacity: 0, scale: 1.015 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
          >
            <Block block={item.hero} num={num} />
          </motion.div>
        )}

        <motion.header
          className="project__head"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="micro project__kicker">
            {item.when} · {item.tags.join(" · ")}
          </p>
          <h1 id="sheet-h" tabIndex={-1}>
            {item.title}
          </h1>
          <p className="project__out">{rich(item.lede)}</p>
        </motion.header>

        <aside className="project__side">
          <div className="project__side-in">
            <dl className="facts">
              {item.facts.map(([k, v]) => (
                <div key={k}>
                  <dt className="micro">{k}</dt>
                  <dd>{rich(v)}</dd>
                </div>
              ))}
            </dl>
            {sections.length > 1 && (
              <nav className="toc" aria-label="Sections on this page">
                <p className="toc__label micro">Chapters</p>
                <ul>
                  {sections.map((s) => (
                    <li key={s.k} className={here === s.k ? "is-here" : ""}>
                      <button
                        type="button"
                        aria-current={here === s.k ? "location" : undefined}
                        onClick={() => jump(s.k)}
                      >
                        <span className="toc__n">{nn(s.k + 1)}</span>
                        {s.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </aside>

        <div className="project__body" ref={body}>
          {item.blocks.map((b, k) => (
            <Block key={k} block={b} num={num} />
          ))}

          <button type="button" className="nextup" onClick={() => openProject(next.id)}>
            <span className="nextup__plate" aria-hidden="true">
              <Media media={next.cover} />
            </span>
            <span className="nextup__body">
              <span className="micro">Next · {nn(((i + 1) % items.length) + 1)}</span>
              <strong>{next.title}</strong>
              <em>{rich(next.line)}</em>
            </span>
            <span className="nextup__go" aria-hidden="true">
              →
            </span>
          </button>
        </div>
      </article>
    </motion.div>
  );
}
