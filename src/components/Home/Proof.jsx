import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "motion/react";
import { useInView } from "../../hooks.js";
import { proofs } from "../../data/highlights.jsx";

function Cell({ proof, reduce }) {
  const ref = useRef(null);
  const seen = useInView(ref, { amount: 0.15, once: true });
  const [value, setValue] = useState(reduce ? proof.to : 0);

  useEffect(() => {
    if (!seen || reduce) return;
    const controls = animate(0, proof.to, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: setValue,
    });
    return () => controls.stop();
  }, [seen, reduce, proof.to]);

  return (
    <li className="proof__cell" ref={ref}>
      <a className="proof__link" href={`#/p/${proof.href}`}>
        <span className="proof__num">{proof.format(value)}</span>
        <span className="proof__label">{proof.label}</span>
        <span className="proof__note">{proof.note}</span>
      </a>
    </li>
  );
}

// S3: four counters, each pulled from the project copy that states it.
export default function Proof() {
  const reduce = useReducedMotion();
  return (
    <section className="proof" aria-label="Results, measured">
      <p className="micro proof__head">
        Measured <span className="proof__rule" aria-hidden="true" />
      </p>
      <ul className="proof__grid">
        {proofs.map((p) => (
          <Cell key={p.id} proof={p} reduce={reduce} />
        ))}
      </ul>
    </section>
  );
}
