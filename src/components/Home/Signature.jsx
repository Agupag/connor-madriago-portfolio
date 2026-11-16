import { openProject } from "../../hooks.js";
import { rich } from "../rich.jsx";
import Reveal from "../Reveal.jsx";
import { items } from "../../data/content.jsx";

// S5: the scroll's emotional beat — one full-bleed plate for the strongest
// evidence story, with the project's own stamp and line.
const caseItem = items.find((it) => it.id === "gap-vehicle") || items[0];
const poster = {
  img: "assets/img/gap-vehicle-demo-poster.jpg",
  alt: "The prototype reaching across two lab tables.",
};

export default function Signature() {
  return (
    <Reveal as="section" className="sig" aria-labelledby="sig-h">
      <div className="sig__plate">
        <img src={poster.img} alt={poster.alt} loading="lazy" />
        <span className="stamp stamp--sig">
          {caseItem.stamp.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </span>
      </div>
      <div className="sig__body">
        <p className="micro sig__kicker">Signature case · {caseItem.when}</p>
        <h2 className="t-title" id="sig-h">
          {caseItem.title}
        </h2>
        <p className="sig__line">{rich(caseItem.line)}</p>
        <button type="button" className="pill pill--signal" onClick={() => openProject(caseItem.id)}>
          Read the case<span aria-hidden="true"> →</span>
        </button>
      </div>
    </Reveal>
  );
}
