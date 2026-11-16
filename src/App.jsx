import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig } from "motion/react";
import Bar from "./components/Home/Bar.jsx";
import Cover from "./components/Cover.jsx";
import Sheet from "./components/Sheet.jsx";
import { useRoute } from "./hooks.js";
import { me, items } from "./data/content.jsx";

const MODES = ["signal", "print", "blueprint"];
// A new key on purpose: older sessions stored "print" automatically, and that
// should not decide what the redesign looks like for a returning visitor.
const STORE = "bench-view";

function readMode() {
  try {
    const saved = localStorage.getItem(STORE);
    if (MODES.includes(saved)) return saved;
  } catch {}
  // Signal is the default instrument; print is one click away.
  return "signal";
}

export default function App() {
  const id = useRoute();
  const item = items.find((it) => it.id === id && it.blocks.length) || null;
  const lastId = useRef(null);
  if (item) lastId.current = item.id;
  const sheets = items.filter((it) => it.blocks.length);

  const [mode, setMode] = useState(readMode);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    try {
      localStorage.setItem(STORE, mode);
    } catch {}
  }, [mode]);

  useEffect(() => {
    document.title = item ? `${item.title} · ${me.name}` : `${me.name}, mechanical engineering projects`;
  }, [item]);

  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 220, damping: 26 }}>
      <LayoutGroup>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {!item && <Bar mode={mode} setMode={setMode} />}
        <Cover hidden={!!item} mode={mode} setMode={(m) => MODES.includes(m) && setMode(m)} />
        <AnimatePresence
          onExitComplete={() =>
            document.querySelector(`[data-row="${lastId.current}"]`)?.focus({ preventScroll: true })
          }
        >
          {item && <Sheet key="sheet" item={item} items={sheets} />}
        </AnimatePresence>
      </LayoutGroup>
    </MotionConfig>
  );
}
