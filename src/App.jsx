import { useEffect, useState } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig } from "motion/react";
import Cover from "./components/Cover.jsx";
import Sheet from "./components/Sheet.jsx";
import { useRoute } from "./hooks.js";
import { me, items } from "./data/content.jsx";

function Header({ redlines, setRedlines, theme, setTheme }) {
  return (
    <header className="top">
      <div className="sheet top__row">
        <a className="top__name" href="#/">
          {me.name}
        </a>
        <button
          type="button"
          className="textb top__opt"
          onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
        >
          Contact
        </button>
        <button type="button" className="textb top__opt" aria-pressed={theme === "blueprint"} onClick={() => setTheme(theme === "blueprint" ? "print" : "blueprint")}>
          Blueprint {theme === "blueprint" ? "on" : "off"}
        </button>
        <button type="button" className="pen top__opt" aria-pressed={redlines} onClick={() => setRedlines(!redlines)}>
          {redlines ? "Hide redlines" : "Show redlines"}
        </button>
        <a className="btn" href={me.resume}>
          Resume (PDF)
        </a>
      </div>
    </header>
  );
}

function Footer({ hidden }) {
  return (
    <footer className="close" id="contact" inert={hidden || undefined}>
      <div className="sheet close__grid">
        <div>
          <h2>Contact</h2>
          <p className="close__note">{me.note}</p>
        </div>
        <ul className="close__links">
          {me.links.map(([k, label, href]) => (
            <li key={k}>
              <span>{k}</span>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

export default function App() {
  const id = useRoute();
  const item = items.find((it) => it.id === id && it.blocks.length) || null;
  const sheets = items.filter((it) => it.blocks.length);
  const [redlines, setRedlines] = useState(true);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") === "blueprint" ? "blueprint" : "print";
    } catch {
      return "print";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle("no-redlines", !redlines);
  }, [redlines]);

  useEffect(() => {
    document.title = item ? `${item.title} · ${me.name}` : `${me.name}, mechanical engineering projects`;
  }, [item]);

  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 260, damping: 30 }}>
      <LayoutGroup>
        <Header redlines={redlines} setRedlines={setRedlines} theme={theme} setTheme={setTheme} />
        <Cover hidden={!!item} />
        <Footer hidden={!!item} />
        <AnimatePresence>{item && <Sheet key="sheet" item={item} items={sheets} />}</AnimatePresence>
      </LayoutGroup>
    </MotionConfig>
  );
}
