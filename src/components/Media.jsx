import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useInView, useMedia, useSize } from "../hooks.js";
import { sketches } from "../data/sketches.jsx";

const ModelViewer = lazy(() => import("./ModelViewer.jsx"));

// A muted clip that plays while it is on screen and pauses when it leaves.
export function LoopVideo({ src, poster, alt, className, eager = false }) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.35 });
  const still = useMedia("(prefers-reduced-motion: reduce)");
  useEffect(() => {
    const v = ref.current;
    if (!v || still) return;
    if (inView) v.play().catch(() => {});
    else v.pause();
  }, [inView, still]);
  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      controls={still}
      preload={eager ? "auto" : "metadata"}
      aria-label={alt}
    />
  );
}

export function Media({ media, eager, className, still = false }) {
  if (!media) return null;
  if (media.sketch) {
    const S = sketches[media.sketch];
    return (
      <div className={"sketchbox " + (className || "")}>
        <S />
      </div>
    );
  }
  if (media.plate)
    return (
      <div className={"plate " + (className || "")}>
        <strong>{media.plate[0]}</strong>
        <span>{media.plate[1]}</span>
      </div>
    );
  if (media.model && !still) {
    const poster = <img className={className} src={media.img} alt="" />;
    return (
      <Suspense fallback={poster}>
        <ModelViewer src={media.model} alt={media.alt} interactive={false} />
      </Suspense>
    );
  }
  if (media.video && still) return <img className={className} src={media.poster} alt="" loading="lazy" />;
  if (media.video)
    return <LoopVideo src={media.video} poster={media.poster} alt={media.alt} eager={eager} className={className} />;
  return (
    <img
      className={className}
      src={media.img}
      alt={media.alt || ""}
      width={media.w}
      height={media.h}
      loading={eager ? "eager" : "lazy"}
      style={media.pixel ? { imageRendering: "pixelated" } : undefined}
    />
  );
}

// Full-window view of one figure. Escape or a click closes it.
function Lightbox({ media, onClose }) {
  useEffect(() => {
    const key = (e) => {
      if (e.key !== "Escape") return;
      e.stopImmediatePropagation();
      onClose();
    };
    window.addEventListener("keydown", key, true);
    return () => window.removeEventListener("keydown", key, true);
  }, [onClose]);
  return createPortal(
    <div className="zoom" role="dialog" aria-modal="true" aria-label="Enlarged figure" onClick={onClose}>
      <img src={media.img} alt={media.alt || ""} />
      <button type="button" className="pen zoom__close" autoFocus>
        Close
      </button>
    </div>,
    document.body
  );
}

// A figure with numbered red callouts. `notes` carry balloon and target
// positions as percentages of the frame; hovering a note lights its balloon.
export function Figure({ media, notes = [], stamp, caption, bare = false, n }) {
  const frame = useRef(null);
  const { w, h } = useSize(frame);
  const seen = useInView(frame, { amount: 0.3, once: true });
  const [hot, setHot] = useState(null);
  const [zoom, setZoom] = useState(false);
  const canZoom = media.img && !media.pixel && !media.model;
  const px = ([x, y]) => [(x * w) / 100, (y * h) / 100];

  return (
    <figure className={"fig" + (bare ? " fig--bare" : "") + (seen ? " is-seen" : "")}>
      <div className="fig__frame" ref={frame}>
        <Media media={media} />
        {w > 0 && (
          <svg className="leaders" aria-hidden="true" width={w} height={h}>
            {notes.map((nt, i) => {
              if (!nt.t) return null;
              const [x1, y1] = px(nt.t);
              const [x2, y2] = px(nt.b);
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} pathLength="1" style={{ "--i": i }} className={hot === i ? "is-hot" : ""} />
              );
            })}
          </svg>
        )}
        {notes.map((nt, i) =>
          nt.t ? <span key={"p" + i} className="pt" style={{ left: nt.t[0] + "%", top: nt.t[1] + "%", "--i": i }} /> : null
        )}
        {notes.map((nt, i) => (
          <span
            key={"b" + i}
            className={"balloon" + (hot === i ? " is-hot" : "")}
            style={{ left: nt.b[0] + "%", top: nt.b[1] + "%", "--i": i }}
            onMouseEnter={() => setHot(i)}
            onMouseLeave={() => setHot(null)}
            aria-hidden="true"
          >
            {i + 1}
          </span>
        ))}
        {canZoom && (
          <button type="button" className="fig__zoom" onClick={() => setZoom(true)}>
            Enlarge
          </button>
        )}
        {zoom && <Lightbox media={media} onClose={() => setZoom(false)} />}
        {stamp && (
          <span className="dim" style={{ left: stamp.at[0] + "%", top: stamp.at[1] + "%", "--i": notes.length }}>
            {stamp.lines.map((l, i) => (
              <span key={i}>{l}</span>
            ))}
          </span>
        )}
      </div>
      {notes.length > 0 && (
        <ol className="notes">
          {notes.map((nt, i) => (
            <li
              key={i}
              className={hot === i ? "is-hot" : ""}
              onMouseEnter={() => setHot(i)}
              onMouseLeave={() => setHot(null)}
            >
              {nt.text}
            </li>
          ))}
        </ol>
      )}
      {caption && (
        <figcaption>
          {n != null && <b>Fig. {n}. </b>}
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
