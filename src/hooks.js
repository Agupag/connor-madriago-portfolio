import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

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
