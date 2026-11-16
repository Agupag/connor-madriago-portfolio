import { useFrozen, setFrozen } from "../../hooks.js";
import { me } from "../../data/content.jsx";

const emailHref = (me.links.find(([k]) => k === "Email") || [])[2] || "";

export function jumpTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
}

export default function Bar({ mode, setMode }) {
  const frozen = useFrozen();
  return (
    <header className="bar">
      <div className="bar__in">
        <a className="bar__name" href="#/">
          C.&nbsp;Madriago
        </a>
        <nav className="bar__nav" aria-label="Sections">
          <button type="button" className="bar__link" onClick={() => jumpTo("work")}>
            work
          </button>
          <button type="button" className="bar__link" onClick={() => jumpTo("practice")}>
            about
          </button>
          <a className="bar__link bar__link--resume" href={me.resume} target="_blank" rel="noreferrer">
            resume<span className="bar__ext" aria-hidden="true"> ↗</span>
          </a>
          <a className="bar__link" href={emailHref}>
            email
          </a>
        </nav>
        <div className="bar__tools">
          <button
            type="button"
            className="bar__freeze"
            aria-pressed={frozen}
            onClick={() => setFrozen(!frozen)}
            title={frozen ? "Ambient motion is paused" : "Pause ambient motion"}
          >
            <span className={"bar__pulse" + (frozen ? " is-off" : "")} aria-hidden="true" />
            <span className="bar__freeze-label">{frozen ? "Frozen" : "Live"}</span>
          </button>
          <button
            type="button"
            className="bar__mode"
            onClick={() => setMode(mode === "signal" ? "print" : "signal")}
            aria-label={mode === "signal" ? "Switch to the print view" : "Switch to the signal view"}
          >
            {mode === "signal" ? "Print" : "Signal"}
          </button>
        </div>
      </div>
    </header>
  );
}
