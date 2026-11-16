import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { Media } from "../Media.jsx";
import { rich } from "../rich.jsx";
import { openProject, useFinePointer, useMedia } from "../../hooks.js";
import { filters, groups, items } from "../../data/content.jsx";

const nn = (n) => String(n).padStart(2, "0");

function Row({ item, n, active, onActive }) {
  const open = item.blocks.length > 0;
  return (
    <motion.li layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
      <button
        type="button"
        className={"row" + (active ? " is-active" : "") + (open ? "" : " row--brief")}
        data-row={item.id}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") onActive(item.id);
        }}
        onFocus={() => onActive(item.id)}
        onClick={() => open && openProject(item.id)}
      >
        <span className="row__n" aria-hidden="true">
          {nn(n)}
        </span>
        <span className="row__thumb" aria-hidden="true">
          <Media media={item.cover} still />
        </span>
        <span className="row__title">
          {item.title}
          <span className="row__tags">
            {item.tags.map((t) => (
              <span key={t} className="tick">
                {t}
              </span>
            ))}
          </span>
        </span>
        <span className="row__line">{rich(item.line)}</span>
        <span className="row__when">{item.when}</span>
        <span className="row__go" aria-hidden="true">
          {open ? "→" : "—"}
        </span>
      </button>
    </motion.li>
  );
}

// S4: the index, with the filters that were exported but never used, a stage that
// follows the pointer on desktop, and self-contained rows on a phone.
export default function Work() {
  // The stage is part of the desktop layout; only the parallax needs a fine pointer.
  const wide = useMedia("(min-width: 1000px)");
  const fine = useFinePointer();
  const [tag, setTag] = useState(null);
  const [active, setActive] = useState(items[0].id);

  const shown = useMemo(() => items.filter((it) => !tag || it.tags.includes(tag)), [tag]);

  useEffect(() => {
    if (!shown.some((it) => it.id === active)) setActive(shown[0]?.id);
  }, [shown, active]);

  const current = items.find((it) => it.id === active) || shown[0] || items[0];

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 220, damping: 26 });
  const sy = useSpring(my, { stiffness: 220, damping: 26 });

  return (
    <section className="work" id="work" aria-labelledby="work-h">
      <header className="work__head">
        <h2 className="t-display-l" id="work-h">
          The work
        </h2>
        <p className="micro work__count">
          {nn(shown.length)} of {nn(items.length)} entries
        </p>
      </header>

      <div className="work__filters" role="group" aria-label="Filter by discipline">
        <button type="button" className="chip" aria-pressed={tag === null} onClick={() => setTag(null)}>
          All<span className="chip__n">{items.length}</span>
        </button>
        {filters.map((f) => {
          const n = items.filter((it) => it.tags.includes(f)).length;
          if (!n) return null;
          return (
            <button key={f} type="button" className="chip" aria-pressed={tag === f} onClick={() => setTag(tag === f ? null : f)}>
              {f}
              <span className="chip__n">{n}</span>
            </button>
          );
        })}
      </div>

      <div
        className="work__body"
        onPointerMove={(e) => {
          if (!fine) return;
          const r = e.currentTarget.getBoundingClientRect();
          mx.set(((e.clientX - r.left) / r.width - 0.5) * 16);
          my.set(((e.clientY - r.top) / r.height - 0.5) * 12);
        }}
        onPointerLeave={() => {
          mx.set(0);
          my.set(0);
        }}
      >
        <div
          className="work__list"
          onKeyDown={(e) => {
            if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
            const rows = [...e.currentTarget.querySelectorAll(".row")];
            const at = rows.indexOf(document.activeElement);
            if (at < 0) return;
            e.preventDefault();
            rows[(at + (e.key === "ArrowDown" ? 1 : rows.length - 1)) % rows.length].focus();
          }}
        >
          {groups.map((g) => {
            const rows = shown.filter((it) => it.group === g.id);
            if (!rows.length) return null;
            return (
              <div className="grp" key={g.id}>
                <h3 className="grp__h">
                  {g.title}
                  <span className="grp__n">{nn(rows.length)}</span>
                </h3>
                <ul className="rows">
                  <AnimatePresence initial={false} mode="popLayout">
                    {rows.map((it) => (
                      <Row
                        key={it.id}
                        item={it}
                        n={items.indexOf(it) + 1}
                        active={wide && current.id === it.id}
                        onActive={setActive}
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
            );
          })}
        </div>

        {wide && (
          <aside className="stage" aria-hidden="true">
            <motion.div className="stage__plate" style={{ x: sx, y: sy }}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.id}
                  className="stage__media"
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Media media={current.cover} eager />
                </motion.div>
              </AnimatePresence>
              {current.stamp && (
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={current.id}
                    className="stamp stamp--over"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: 0.06 }}
                  >
                    {current.stamp.map((l) => (
                      <span key={l}>{l}</span>
                    ))}
                  </motion.span>
                </AnimatePresence>
              )}
            </motion.div>
            <div className="stage__body">
              <p className="micro stage__n">{nn(items.indexOf(current) + 1)} · {current.when}</p>
              <h3 className="stage__title">{current.title}</h3>
              <dl className="stage__specs">
                {current.specs.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="stage__go">{current.blocks.length ? "Open the full write-up →" : current.detail}</p>
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}
