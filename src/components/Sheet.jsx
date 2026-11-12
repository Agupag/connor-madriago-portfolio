import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { motion, useScroll } from "motion/react";
import { Figure } from "./Media.jsx";
import { rich } from "./rich.jsx";
import { openProject, useMedia } from "../hooks.js";
import { sketches } from "../data/sketches.jsx";

const ModelViewer = lazy(() => import("./ModelViewer.jsx"));
const Widget = lazy(() => import("./Widgets.jsx").then((m) => ({ default: ({ id }) => { const W = m.widgets[id]; return <W />; } })));

function Text({ block }) {
  return (
    <div className={"say" + (block.wrong ? " say--wrong" : "")}>
      {block.title && <h3>{block.title}</h3>}
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

function Check({ block }) {
  return (
    <table className="check">
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
        {block.rows.map(([name, asked, got, state]) => (
          <tr key={name}>
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
      {block.title && <h3>{block.title}</h3>}
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
    <figure className="fig">
      <div className="fig__frame fig__frame--embed" style={{ aspectRatio: block.ratio || "16 / 10" }}>
        {on && wide ? (
          <iframe src={block.src} title={block.title} sandbox="allow-scripts allow-same-origin" />
        ) : (
          <>
            <img src={block.poster} alt={block.alt || ""} loading="lazy" />
            {wide ? (
              <button type="button" className="btn embed__go" onClick={() => setOn(true)}>
                {block.cta}
              </button>
            ) : (
              <a className="btn embed__go" href={block.src} target="_blank" rel="noreferrer">
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
          {block.title && <h3>{block.title}</h3>}
          <pre tabIndex={0}>
            <code>{block.code}</code>
          </pre>
          {block.note && <p className="code__note">{rich(block.note)}</p>}
        </div>
      );
    case "cols":
      return (
        <div className={"cols" + (block.wide ? " cols--wide-" + block.wide : "")}>
          {block.items.map((b, i) => (
            <Block key={i} block={b} num={num} />
          ))}
        </div>
      );
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
        <figure className="fig fig--widget">
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
        <figure className="fig">
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
  const closeBtn = useRef(null);
  const i = items.findIndex((it) => it.id === item.id);
  const prev = items[(i - 1 + items.length) % items.length];
  const next = items[(i + 1) % items.length];
  const num = numberFigures(item);
  const body = useRef(null);
  const [sections, setSections] = useState([]);
  const { scrollYProgress } = useScroll({ container: scroller });

  // Section list for the side column, read from the headings actually on the page.
  useEffect(() => {
    const hs = [...(body.current?.querySelectorAll("h3, caption") || [])];
    setSections(hs.map((h, k) => ({ k, label: h.textContent })));
  }, [item.id]);
  const jump = (k) => {
    const hs = body.current?.querySelectorAll("h3, caption");
    hs?.[k]?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="layer__bar">
        <motion.div className="layer__progress" style={{ scaleX: scrollYProgress }} />
        <div className="sheet layer__bar-in">
          <button ref={closeBtn} type="button" className="pen" onClick={() => openProject(null)}>
            Back to all work
          </button>
          <span className="layer__where">
            {i + 1} of {items.length}
          </span>
          <button type="button" className="textb" onClick={() => openProject(prev.id)}>
            Previous
          </button>
          <button type="button" className="textb" onClick={() => openProject(next.id)}>
            Next
          </button>
        </div>
      </div>

      <article className="sheet project" key={item.id}>
        <motion.header
          className="project__head"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
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
                <dt>{k}</dt>
                <dd>{rich(v)}</dd>
              </div>
            ))}
          </dl>
          {sections.length > 2 && (
            <nav className="toc" aria-label="On this page">
              <h2>On this page</h2>
              <ul>
                {sections.map((s) => (
                  <li key={s.k}>
                    <button type="button" onClick={() => jump(s.k)}>
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
          {item.hero && (
            <motion.div layoutId={"cover-" + item.id} className="project__hero">
              <Block block={item.hero} num={num} />
            </motion.div>
          )}
          {item.blocks.map((b, k) => (
            <Block key={k} block={b} num={num} />
          ))}

          <button type="button" className="nextup" onClick={() => openProject(next.id)}>
            <span>Next</span>
            <strong>{next.title}</strong>
            <em>{rich(next.line)}</em>
          </button>
        </div>
      </article>
    </motion.div>
  );
}
