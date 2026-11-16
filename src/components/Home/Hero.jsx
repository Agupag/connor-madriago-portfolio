import { Media } from "../Media.jsx";
import { openProject } from "../../hooks.js";
import { me, items } from "../../data/content.jsx";

const emailHref = (me.links.find(([k]) => k === "Email") || [])[2] || "";
const featured = items[0];

// S2: the name as three masked lines, one positioning line verbatim, the status
// chip, and the two actions. On a phone the same block carries a real hero plate.
export default function Hero() {
  const [first, ...rest] = me.name.split(" ");
  return (
    <section className="hero" aria-labelledby="hero-name">
      <div className="hero__type">
        <p className="micro hero__kicker">Mechanical engineering · University of Michigan · Class of 2029</p>

        <h1 className="hero__name" id="hero-name">
          <span className="line">
            <span className="line__in" style={{ "--d": "0ms" }}>
              {first}
            </span>
          </span>{" "}
          <span className="line">
            <span className="line__in" style={{ "--d": "70ms" }}>
              {rest.join(" ")}
            </span>
          </span>
        </h1>

        <p className="hero__say">{me.say}</p>

        <div className="hero__actions">
          <a className="pill pill--signal" href={me.resume} target="_blank" rel="noreferrer">
            Resume<span aria-hidden="true"> ↗</span>
          </a>
          <a className="pill" href={emailHref}>
            Email
          </a>
          <a className="chip chip--note" href="#work" onClick={(e) => { e.preventDefault(); document.getElementById("work")?.scrollIntoView({ behavior: "smooth" }); }}>
            <span className="chip__dot" aria-hidden="true" />
            {me.note}
          </a>
        </div>

        <div className="hero__plate">
          <button type="button" className="plate-btn" onClick={() => openProject(featured.id)} aria-label={`Open ${featured.title}`}>
            <Media media={featured.cover} eager />
            <span className="stamp stamp--over">
              {featured.stamp.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </span>
          </button>
        </div>
      </div>

      <aside className="hero__meta" aria-label="At a glance">
        <dl>
          <div>
            <dt>Class</dt>
            <dd>2029</dd>
          </div>
          <div>
            <dt>School</dt>
            <dd>University of Michigan</dd>
          </div>
          <div>
            <dt>Honours</dt>
            <dd>Dean&rsquo;s List and University Honors, Winter 2026</dd>
          </div>
          <div>
            <dt>Program</dt>
            <dd>Michigan Research and Discovery Scholars</dd>
          </div>
        </dl>
      </aside>
    </section>
  );
}
