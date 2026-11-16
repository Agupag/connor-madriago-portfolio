import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

// Hash routing: "#/p/<id>" opens a project sheet, anything else is the index.
function readRoute() {
  const m = window.location.hash.match(/^#\/p\/([\w-]+)/);
  return m ? m[1] : null;
}
function subscribeRoute(cb) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}
export function useRoute() {
  return useSyncExternalStore(subscribeRoute, readRoute, () => null);
}
export function openProject(id) {
  window.location.hash = id ? `#/p/${id}` : "#/";
}

export function useMedia(query) {
  const [on, setOn] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const f = () => setOn(mq.matches);
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, [query]);
  return on;
}

// A pointer the design can lean on: a mouse or trackpad, on a wide screen.
export function useFinePointer() {
  return useMedia("(hover: hover) and (pointer: fine) and (min-width: 1000px)");
}

// Pixel size of an element, kept current.
export function useSize(ref) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

// True while the element is on screen (optionally latching once seen).
export function useInView(ref, { amount = 0.4, once = false, root = null } = {}) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          if (once) io.disconnect();
        } else if (!once) setSeen(false);
      },
      { threshold: amount, root }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, amount, once, root]);
  return seen;
}

export function useLatest(value) {
  const r = useRef(value);
  r.current = value;
  return r;
}

/* ---------- ambient motion can be stopped by the reader ---------- */

let frozen = false;
try {
  frozen = sessionStorage.getItem("frozen") === "1";
} catch {}
const frozenListeners = new Set();
function subscribeFrozen(cb) {
  frozenListeners.add(cb);
  return () => frozenListeners.delete(cb);
}
export function setFrozen(v) {
  frozen = !!v;
  try {
    sessionStorage.setItem("frozen", frozen ? "1" : "0");
  } catch {}
  frozenListeners.forEach((cb) => cb());
}
export function useFrozen() {
  return useSyncExternalStore(subscribeFrozen, () => frozen, () => false);
}

/* ---------- copy to clipboard, with the label change handled by the caller ---------- */

export function useCopy(text) {
  const [status, setStatus] = useState("idle");
  const timer = useRef(0);

  const copy = useCallback(async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      // Clipboard permission can be refused inside a frame; fall back to a selection copy.
      try {
        const el = document.createElement("textarea");
        el.value = text;
        el.setAttribute("readonly", "");
        el.style.cssText = "position:fixed;left:-9999px;opacity:0";
        document.body.appendChild(el);
        el.select();
        ok = document.execCommand("copy");
        document.body.removeChild(el);
      } catch {}
    }
    setStatus(ok ? "copied" : "manual");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2600);
    return ok;
  }, [text]);

  useEffect(() => () => clearTimeout(timer.current), []);
  return [status, copy];
}
