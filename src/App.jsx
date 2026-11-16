import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig } from "motion/react";
import Cover from "./components/Cover.jsx";
import Sheet from "./components/Sheet.jsx";
import { useRoute } from "./hooks.js";
import { me, items } from "./data/content.jsx";

const email = me.links.find(([k]) => k === "Email");
const emailHref = email ? email[2] : "";

function Header({ onIndex }) {
  const [titleOnScreen, setTitleOnScreen] = useState(false);
  // On the index, the name in the bar stays hidden while the page's own H1 is showing.
  useEffect(() => {
    if (!onIndex) return;
    const h1 = document.querySelector(".cover h1");
    if (!h1) return;
    const io = new IntersectionObserver(([e]) => setTitleOnScreen(e.isIntersecting));
    io.observe(h1);
    return () => io.disconnect();
  }, [onIndex]);
  const hideName = onIndex && titleOnScreen;
  return (
    <header className="top">
      <div className="sheet top__row">
        <a className="top__name" href="#/" style={hideName ? { visibility: "hidden" } : undefined}>
          {me.name}
        </a>
        <button
          type="button"
          className="textb top__opt"
          onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
        >
          Contact
        </button>
        <a className="textb top__link" href={emailHref}>
          Email
        </a>
        <a className="btn top__resume" href={me.resume}>
          Resume<span className="top__pdf"> (PDF)</span>
        </a>
      </div>
    </header>
  );
}

function Footer({ hidden, theme, setTheme }) {
  return (
    <footer className="close" id="contact" inert={hidden || undefined}>
      <div className="sheet close__grid">
        <div>
          <h2>Contact</h2>
          <button
            type="button"
            className="close__theme"
            aria-pressed={theme === "blueprint"}
            onClick={() => setTheme(theme === "blueprint" ? "print" : "blueprint")}
          >
            Blueprint view
          </button>
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
  const lastId = useRef(null);
  if (item) lastId.current = item.id;
  const sheets = items.filter((it) => it.blocks.length);
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
    document.title = item ? `${item.title} · ${me.name}` : `${me.name}, mechanical engineering projects`;
  }, [item]);

  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 260, damping: 30 }}>
      <LayoutGroup>
        <Header onIndex={!item} />
        <Cover hidden={!!item} />
        <Footer hidden={!!item} theme={theme} setTheme={setTheme} />
        <AnimatePresence
          onExitComplete={() =>
            document.querySelector(`[data-row="${lastId.current}"]`)?.focus({ preventScroll: true })
          }
        >
          {item && <Sheet key="sheet" item={item} items={sheets} />}</AnimatePresence>
      </LayoutGroup>
    </MotionConfig>
  );
}
