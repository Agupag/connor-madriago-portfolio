import { useRef } from "react";
import { setFrozen, useCopy, useFrozen } from "../../hooks.js";
import { me } from "../../data/content.jsx";

const address = (me.links.find(([k]) => k === "Email") || [])[1] || "";
const mailto = (me.links.find(([k]) => k === "Email") || [])[2] || "";
const others = me.links.filter(([k]) => k !== "Email");

const MODES = [
  ["signal", "Signal"],
  ["print", "Print"],
  ["blueprint", "Blueprint"],
];

// S7: the email at display size with click-to-copy, the mode switch, the freeze
// control and a colophon.
export default function Contact({ mode, setMode }) {
  const [status, copy] = useCopy(address);
  const frozen = useFrozen();
  const addr = useRef(null);

  // If the frame blocks the clipboard, select the address so one keystroke copies it.
  const onCopy = async () => {
    const ok = await copy();
    if (ok || !addr.current) return;
    const range = document.createRange();
    range.selectNodeContents(addr.current);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  };

  return (
    <footer className="contact" id="contact">
      <div className="contact__top">
        <h2 className="micro">Contact</h2>
        <p className="micro contact__note">Click the address to copy it.</p>
      </div>

      <button type="button" className="contact__mail" onClick={onCopy} aria-label={`Copy ${address} to the clipboard`}>
        <span className={"contact__addr" + (status === "copied" ? " is-copied" : "")} ref={addr}>
          {status === "copied" ? "Copied" : address}
        </span>
        <span className="contact__tick" aria-hidden="true">
          {status === "copied" ? "✓" : "⧉"}
        </span>
      </button>
      <p className="contact__status" aria-live="polite">
        {status === "manual" ? "Selected. Press ⌘C or Ctrl+C to copy." : ""}
      </p>

      <div className="contact__grid">
        <ul className="contact__links">
          <li>
            <span className="micro">Write</span>
            <a href={mailto}>{address}</a>
          </li>
          {others.map(([k, label, href]) => (
            <li key={k}>
              <span className="micro">{k}</span>
              <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                {label}
                {href.startsWith("http") && <span aria-hidden="true"> ↗</span>}
              </a>
            </li>
          ))}
        </ul>

        <div className="contact__controls">
          <div className="contact__modes" role="group" aria-label="Colour mode">
            <span className="micro">View</span>
            {MODES.map(([id, label]) => (
              <button key={id} type="button" className="chip" aria-pressed={mode === id} onClick={() => setMode(id)}>
                {label}
              </button>
            ))}
          </div>
          <div className="contact__freeze" role="group" aria-label="Ambient motion">
            <span className="micro">Motion</span>
            <button type="button" className="chip" aria-pressed={frozen} onClick={() => setFrozen(!frozen)}>
              {frozen ? "Frozen" : "Running"}
            </button>
          </div>
          <p className="contact__colophon">
            React, Vite, Motion and three.js. Set in Archivo and Routed Gothic. The plot behind the hero is drawn on a canvas,
            and it is the only thing on the page that moves on its own.
          </p>
        </div>
      </div>
    </footer>
  );
}
