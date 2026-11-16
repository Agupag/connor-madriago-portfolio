import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "motion/react";

const KEY = "calibrated";

// S1: a 420 ms calibration sweep on the first load of a session.
// Never blocks paint, never runs on a sheet, skipped under reduced motion.
export default function Calibration() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(() => {
    if (reduce) return false;
    try {
      return sessionStorage.getItem(KEY) !== "1";
    } catch {
      return true;
    }
  });
  const [count, setCount] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    if (!show) return;
    const finish = () => {
      if (done.current) return;
      done.current = true;
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {}
      setShow(false);
    };
    const controls = animate(0, 100, {
      duration: 0.42,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: setCount,
      onComplete: finish,
    });
    const t = setTimeout(finish, 620);
    return () => {
      controls.stop();
      clearTimeout(t);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div className="cal" aria-hidden="true">
      <span className="cal__edge cal__edge--t" />
      <span className="cal__edge cal__edge--b" />
      <span className="cal__edge cal__edge--l" />
      <span className="cal__edge cal__edge--r" />
      <span className="cal__read">
        <span className="cal__count">{String(Math.round(count)).padStart(2, "0")}</span>
        <span className="cal__label">calibrating</span>
      </span>
    </div>
  );
}
