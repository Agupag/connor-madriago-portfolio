import { useEffect, useRef } from "react";
import { useFrozen } from "../hooks.js";

// The one ambient animation on the site: two traces measured against a grid.
// Scroll speed drives the amplitude, and it decays back to a slow breath.
// Frozen, reduced-motion, hidden tab: the plot is drawn once and left alone.
export default function SignalField({ className = "" }) {
  const canvas = useRef(null);
  const frozen = useFrozen();

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let t = 0;
    let amp = 0.22;
    let kick = 0;
    let lastY = window.scrollY;
    let raf = 0;

    const traces = [
      { color: "rgba(214,255,63,0.5)", speed: 1, phase: 0, gain: 1 },
      { color: "rgba(214,255,63,0.18)", speed: 0.62, phase: 2.1, gain: 0.62 },
    ];
    const N = 150;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const box = el.getBoundingClientRect();
      w = box.width;
      h = box.height;
      el.width = Math.max(1, Math.round(w * dpr));
      el.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Calibrated grid: 96 px cells, one brightness step only.
      const step = 96;
      ctx.beginPath();
      ctx.strokeStyle = "rgba(242,244,239,0.055)";
      ctx.lineWidth = 1;
      for (let x = Math.round(w / step / 2) * step; x < w; x += step) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, h);
      }
      for (let y = Math.round(h / step / 2) * step; y < h; y += step) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(w, y + 0.5);
      }
      ctx.stroke();

      const baseY = h * 0.66;
      ctx.beginPath();
      ctx.strokeStyle = "rgba(214,255,63,0.16)";
      ctx.moveTo(0, baseY + 0.5);
      ctx.lineTo(w, baseY + 0.5);
      ctx.stroke();

      for (const tr of traces) {
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const p = i / N;
          const envelope = Math.sin(Math.PI * p) ** 1.4;
          const wave =
            Math.sin(p * 8.4 + t * 0.9 * tr.speed + tr.phase) * 0.62 +
            Math.sin(p * 21.7 - t * 1.5 * tr.speed + tr.phase) * 0.26 +
            Math.sin(p * 44.3 + t * 2.4 * tr.speed) * 0.12;
          const y = baseY + wave * amp * envelope * tr.gain * h * 0.2;
          if (i === 0) ctx.moveTo(0, y);
          else ctx.lineTo(p * w, y);
        }
        ctx.strokeStyle = tr.color;
        ctx.lineWidth = 1.35;
        ctx.stroke();
      }
    };

    const step = () => {
      t += 0.012;
      kick *= 0.94;
      amp += (0.1 + kick - amp) * 0.06;
      draw();
      raf = requestAnimationFrame(step);
    };

    const onScroll = () => {
      const y = window.scrollY;
      kick = Math.min(0.75, Math.abs(y - lastY) / 42);
      lastY = y;
    };

    resize();
    if (still || frozen) {
      amp = 0.26;
      draw();
    } else {
      draw();
      raf = requestAnimationFrame(step);
    }

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(el);
    const visibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !still && !frozen) raf = requestAnimationFrame(step);
    };
    if (!still && !frozen) window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", visibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [frozen]);

  return (
    <div className={"field " + className} aria-hidden="true">
      <canvas ref={canvas} className="field__canvas" />
      <div className="field__fade" />
    </div>
  );
}
