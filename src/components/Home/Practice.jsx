import { openProject } from "../../hooks.js";
import { rich } from "../rich.jsx";
import Reveal from "../Reveal.jsx";
import { me, items } from "../../data/content.jsx";

// S6: the about material that was hiding in two header paragraphs.
// Arrangement only — every line below is existing copy.
const rows = items
  .filter((it) => it.group === "teams" || it.tags.includes("Teaching"))
  .sort((a, b) => (a.group === "teams" ? 0 : 1) - (b.group === "teams" ? 0 : 1));

export default function Practice() {
  return (
    <section className="practice" id="practice" aria-labelledby="practice-h">
      <Reveal className="practice__head">
        <h2 className="t-display-l" id="practice-h">
          Practice
        </h2>
        <p className="micro practice__kicker">How the work gets made</p>
      </Reveal>

      <div className="practice__grid">
        <Reveal className="practice__col" delay={60}>
          <h3 className="micro practice__label">Education and honours</h3>
          <p className="practice__meta">{me.meta}</p>
          <h3 className="micro practice__label">Tools</h3>
          <p className="practice__tools">{me.tools}</p>
        </Reveal>

        <Reveal className="practice__col" delay={120}>
          <h3 className="micro practice__label">Labs, teams and teaching</h3>
          <ul className="practice__rows">
            {rows.map((it) => {
              const open = it.blocks.length > 0;
              return (
                <li key={it.id}>
                  <button
                    type="button"
                    className="practice__row"
                    onClick={() => open && openProject(it.id)}
                    aria-disabled={open ? undefined : true}
                  >
                    <span className="practice__row-title">{it.title}</span>
                    <span className="practice__row-when">{it.when}</span>
                    <span className="practice__row-line">{rich(it.line)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
