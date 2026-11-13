import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Media } from "./Media.jsx";
import { rich } from "./rich.jsx";
import { openProject, useMedia } from "../hooks.js";
import { me, groups, filters, items } from "../data/content.jsx";

function Preview({ item }) {
  return (
    <div className="preview">
      <button
        className="preview__open"
        type="button"
        tabIndex={-1}
        onClick={() => item.blocks.length && openProject(item.id)}
        aria-label={`Open ${item.title}`}
      >
        <motion.div className="preview__frame" layoutId={"cover-" + item.id}>
          <AnimatePresence initial={false}>
            <motion.div
              key={item.id}
              className="preview__media"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <Media media={item.cover} eager />
            </motion.div>
          </AnimatePresence>
          {item.stamp && (
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={item.id}
                className="dim preview__stamp"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.12 }}
              >
                {item.stamp.map((l, i) => (
                  <span key={i}>{l}</span>
                ))}
              </motion.span>
            </AnimatePresence>
          )}
        </motion.div>
      </button>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={item.id}
          className="preview__body"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <h3>{item.title}</h3>
          <dl className="preview__specs">
            {item.specs.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          {item.blocks.length ? (
            <button className="btn" type="button" onClick={() => openProject(item.id)}>
              Open the full write-up
            </button>
          ) : (
            <p className="preview__detail">{item.detail}</p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

let hoverTimer;

function Row({ item, active, onActive, wide }) {
  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
    >
      <button
        type="button"
        className={"row" + (active ? " is-active" : "")}
        onPointerEnter={(e) => {
          if (e.pointerType !== "mouse") return;
          clearTimeout(hoverTimer);
          hoverTimer = setTimeout(() => onActive(item.id), 60);
        }}
        onPointerLeave={() => clearTimeout(hoverTimer)}
        onFocus={() => onActive(item.id)}
        onClick={() => item.blocks.length && openProject(item.id)}
        data-row={item.id}
        data-brief={item.blocks.length ? undefined : ""}
      >
        {!wide && (
          <motion.span className="row__thumb" layoutId={"cover-" + item.id}>
            <Media media={item.cover} still />
          </motion.span>
        )}
        <span className="row__title">{item.title}</span>
        <span className="row__line">
          {rich(item.line)}
          {!wide && item.detail && <span className="row__detail">{item.detail}</span>}
        </span>
        <span className="row__when">{item.when}</span>
      </button>
    </motion.li>
  );
}

export default function Cover({ hidden }) {
  const wide = useMedia("(min-width: 1000px)");
  const still = useMedia("(prefers-reduced-motion: reduce)");
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState(items[0].id);
  const [touched, setTouched] = useState(false);
  const shown = items.filter((it) => filter === "All" || it.tags.includes(filter));
  const current = shown.find((it) => it.id === active) || shown[0];
  const timer = useRef(null);

  // Until someone points at the list, step through it so the page shows what is here.
  useEffect(() => {
    if (touched || still || !wide || hidden) return;
    timer.current = setInterval(() => {
      setActive((id) => {
        const i = shown.findIndex((it) => it.id === id);
        return shown[(i + 1) % shown.length].id;
      });
    }, 4200);
    return () => clearInterval(timer.current);
  }, [touched, still, wide, hidden, shown.length, filter]);

  const pick = (id) => {
    setTouched(true);
    setActive(id);
  };

  return (
    <main className="cover sheet" id="top" inert={hidden || undefined}>
      <div className="cover__top">
        <div className="cover__who">
          <h1>{me.name}</h1>
          <p className="cover__say">{me.say}</p>
        </div>
        <div className="cover__aside">
          <p className="cover__meta">{me.meta}</p>
          <p className="cover__tools">{me.tools}</p>
        </div>
      </div>

      <div className="cover__main">
        <div
          className="cover__list"
          onPointerMove={() => !touched && setTouched(true)}
          onKeyDown={(e) => {
            if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
            const rows = [...e.currentTarget.querySelectorAll(".row")];
            const at = rows.indexOf(document.activeElement);
            if (at < 0) return;
            e.preventDefault();
            rows[(at + (e.key === "ArrowDown" ? 1 : rows.length - 1)) % rows.length].focus();
          }}
        >
          <div className="filters" role="group" aria-label="Filter by kind of work">
            {["All", ...filters].map((f) => (
              <button
                key={f}
                type="button"
                className={"filters__b" + (filter === f ? " is-on" : "")}
                aria-pressed={filter === f}
                onClick={() => {
                  setFilter(f);
                  setTouched(true);
                }}
              >
                {f}
                {filter === f && <motion.span layoutId="filter-mark" className="filters__mark" />}
              </button>
            ))}
          </div>

          {wide && <p className="cover__hint">Hover a row to preview it. Click to open the full write-up.</p>}
          {groups.map((g) => {
            const rows = shown.filter((it) => it.group === g.id);
            if (!rows.length) return null;
            return (
              <section key={g.id} aria-labelledby={"g-" + g.id}>
                <h2 className="group" id={"g-" + g.id}>
                  {g.title}
                </h2>
                <ul className="rows">
                  <AnimatePresence initial={false} mode="popLayout">
                    {rows.map((it) => (
                      <Row key={it.id} item={it} wide={wide} active={wide && current && current.id === it.id} onActive={pick} />
                    ))}
                  </AnimatePresence>
                </ul>
              </section>
            );
          })}
        </div>

        {wide && current && (
          <aside className="cover__preview" aria-label="Preview of the highlighted item" onPointerEnter={() => setTouched(true)}>
            <Preview item={current} />
          </aside>
        )}
      </div>
    </main>
  );
}
