import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "../hooks.js";
import run from "../data/tracker-run.json";

/* ------------------------------------------------------------------ */
/* ROV: joystick to thrusters, using the mixing rules in the firmware  */

const hex = (v) => [v & 255, v >> 8].map((b) => b.toString(16).padStart(2, "0").toUpperCase());

function Thruster({ x, y, rot = 0, state, label, lx, ly }) {
  return (
    <g>
      <g transform={`rotate(${rot} ${x} ${y})`}>
        <rect x={x - 9} y={y - 19} width="18" height="38" rx="5" className={"w-thr w-thr--" + state} />
        {state > 0 && (
          <path
            className="w-arrow"
            d={state === 1 ? `M${x} ${y + 12} V${y - 30} m-6 8 l6 -8 l6 8` : `M${x} ${y - 12} V${y + 30} m-6 -8 l6 8 l6 -8`}
          />
        )}
      </g>
      <text x={lx} y={ly} className="w-label">
        {label}
      </text>
    </g>
  );
}

export function ThrusterMixer() {
  const [stick, setStick] = useState({ x: 0, y: 0 });
  const [heave, setHeave] = useState(0);
  const [tilt, setTilt] = useState(90);
  const pad = useRef(null);

  const aim = (e) => {
    const r = pad.current.getBoundingClientRect();
    let x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    let y = -((e.clientY - r.top) / r.height - 0.5) * 2;
    const m = Math.hypot(x, y);
    if (m > 1) {
      x /= m;
      y /= m;
    }
    setStick({ x: Math.round(x * 127), y: Math.round(y * 127) });
  };
  const keys = (e) => {
    const k = { ArrowUp: [0, 110], ArrowDown: [0, -110], ArrowLeft: [-110, 0], ArrowRight: [110, 0] }[e.key];
    if (!k) return;
    e.preventDefault();
    e.stopPropagation();
    setStick((s) => ({ x: k[0] || s.x, y: k[1] || s.y }));
  };

  const D = 20;
  const fwd = stick.y > D, rev = stick.y < -D, right = stick.x > D, left = stick.x < -D;
  let rl = 0, rr = 0, f = 0, name = "Centre. All thrusters off.";
  if (fwd) {
    f = 1; rl = left ? 0 : 1; rr = right ? 0 : 1;
    name = right ? "Forward right. Right rear thruster drops out." : left ? "Forward left. Left rear thruster drops out." : "Forward. All three horizontal thrusters.";
  } else if (rev) {
    f = 2; rl = left ? 0 : 2; rr = right ? 0 : 2;
    name = right ? "Reverse right." : left ? "Reverse left." : "Reverse. All three in reverse.";
  } else if (right) {
    rl = 1; rr = 2; name = "Turn right in place. Rear pair in opposite directions.";
  } else if (left) {
    rl = 2; rr = 1; name = "Turn left in place. Rear pair in opposite directions.";
  }
  const words = [0xffff, 0, tilt, 90, heave, rl, rr, f];
  const fields = ["start", "crc", "servo 1", "servo 2", "m1 vertical", "m2 rear left", "m3 rear right", "m4 front"];

  return (
    <div className="w w-mixer">
      <div className="w-mixer__pad">
        <svg
          ref={pad}
          viewBox="-110 -110 220 220"
          className="w-stick"
          tabIndex={0}
          role="application"
          aria-label="Joystick. Drag, or use the arrow keys."
          onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); aim(e); }}
          onPointerMove={(e) => e.buttons && aim(e)}
          onPointerUp={() => setStick({ x: 0, y: 0 })}
          onPointerCancel={() => setStick({ x: 0, y: 0 })}
          onKeyDown={keys}
          onKeyUp={() => setStick({ x: 0, y: 0 })}
        >
          <polygon className="w-line" points="-41,-100 41,-100 100,-41 100,41 41,100 -41,100 -100,41 -100,-41" />
          <circle className="w-dash" r={(D / 127) * 100} />
          <path className="w-dash" d="M-100 0 H100 M0 -100 V100" />
          <line className="w-arrow" x1="0" y1="0" x2={(stick.x / 127) * 78} y2={(-stick.y / 127) * 78} />
          <circle className="w-knob" cx={(stick.x / 127) * 78} cy={(-stick.y / 127) * 78} r="24" />
        </svg>
        <div className="w-row">
          <button type="button" className={"w-key" + (heave === 1 ? " is-on" : "")} onPointerDown={() => setHeave(1)} onPointerUp={() => setHeave(0)} onPointerLeave={() => setHeave(0)} onKeyDown={(e) => e.key === " " && setHeave(1)} onKeyUp={() => setHeave(0)}>
            Heave up
          </button>
          <button type="button" className={"w-key" + (heave === 2 ? " is-on" : "")} onPointerDown={() => setHeave(2)} onPointerUp={() => setHeave(0)} onPointerLeave={() => setHeave(0)} onKeyDown={(e) => e.key === " " && setHeave(2)} onKeyUp={() => setHeave(0)}>
            Heave down
          </button>
        </div>
        <label className="w-slider">
          <span>Camera tilt {tilt}°</span>
          <input type="range" min="0" max="180" value={tilt} onChange={(e) => setTilt(+e.target.value)} />
        </label>
      </div>

      <svg viewBox="0 0 240 280" className="w-rov" role="img" aria-label={"Top view of the ROV. " + name}>
        <rect className="w-line" x="52" y="34" width="136" height="212" rx="10" />
        <text x="120" y="20" className="w-label" textAnchor="middle">front</text>
        <Thruster x={120} y={62} state={f} label="m4" lx={136} ly={66} />
        <Thruster x={62} y={222} rot={-45} state={rl} label="m2" lx={22} ly={258} />
        <Thruster x={178} y={222} rot={45} state={rr} label="m3" lx={200} ly={258} />
        <circle cx="120" cy="146" r="17" className={"w-thr w-thr--" + heave} />
        <text x="120" y="151" className="w-label" textAnchor="middle">{heave === 1 ? "up" : heave === 2 ? "down" : "m1"}</text>
      </svg>

      <div className="w-mixer__out">
        <p className="w-say" aria-live="polite">{name}</p>
        <p className="w-small">The 16-byte control packet, sent back inside the radio acknowledgement:</p>
        <div className="w-bytes">
          {words.map((v, i) => (
            <span key={i} className={i > 3 && v ? "is-on" : ""}>
              <b>{hex(v).join(" ")}</b>
              <i>{fields[i]}</i>
            </span>
          ))}
        </div>
        <p className="w-small">0 is off, 1 is forward, 2 is reverse. Stick deadband is ±20 counts of 128.</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Vehicle: the crossing sequence, as a schematic you can scrub        */

const ease = (p) => p * p * (3 - 2 * p);
const span = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const EDGE = 700;

function apex(ax, ay, bx, by, l1, l2) {
  const d = Math.hypot(bx - ax, by - ay);
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const mx = ax + (a * (bx - ax)) / d, my = ay + (a * (by - ay)) / d;
  const s = bx > ax ? 1 : -1;
  return [mx + (s * h * (by - ay)) / d, my - (s * h * (bx - ax)) / d];
}

export function CrossingSim() {
  const [t, setT] = useState(0);
  const [gap, setGap] = useState(300);
  const [playing, setPlaying] = useState(false);
  const box = useRef(null);
  const seen = useInView(box, { amount: 0.6, once: true });
  const started = useRef(false);

  useEffect(() => {
    if (seen && !started.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      started.current = true;
      setPlaying(true);
    }
  }, [seen]);

  useEffect(() => {
    if (!playing) return;
    let raf, last = performance.now();
    const step = (now) => {
      const dt = (now - last) / 9000;
      last = now;
      setT((v) => {
        if (v + dt >= 1) {
          setPlaying(false);
          return 1;
        }
        return v + dt;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const E = gap + 110;
  const ext = E * (ease(span(t, 0.12, 0.34)) - ease(span(t, 0.86, 1)));
  const xc = 540 + (gap + 320) * ease(span(t, 0.4, 0.8));
  const xf = xc + 140 + ext, xr = xc - 140 - ext;
  const sensorX = xc + 99;
  const overGap = sensorX > EDGE && sensorX < EDGE + gap;
  const onTable = (x) => x <= EDGE || x >= EDGE + gap;
  const [fa, fb] = [apex(xc + 70, 330, xf, 352, 270, 330), apex(xc - 70, 330, xr, 352, 270, 330)];
  const steps = [
    [0.12, "Reset. Arms held retracted for 2 s."],
    [0.34, "Extend. The servos swing 65° and push both wheel modules out."],
    [0.4, "Arduino A sends G. Arduino B starts all eight motors."],
    [0.8, overGap ? "Driving. The sensor reads more than 20 cm: over the gap." : "Driving. The sensor reads table underneath."],
    [0.86, "Table again under the sensor. Arduino A sends S and the motors stop."],
    [1.01, t >= 1 ? "Retracted and across." : "Retract. The rear module is pulled over the gap."],
  ];
  const step = steps.find(([end]) => t < end)[1];
  const wheel = (x) => <circle key={x} cx={x} cy={387.5} r="32.5" className={"w-wheel" + (onTable(x) ? "" : " is-air")} />;

  return (
    <div className="w w-cross" ref={box}>
      <svg viewBox="0 40 2000 600" role="img" aria-label={"Side view of the vehicle crossing a " + gap + " millimetre gap. " + step}>
        <path className="w-table" d={`M-20 420 H${EDGE} V450 H-20 Z M${EDGE + gap} 420 H2020 V450 H${EDGE + gap} Z`} />
        <path className="w-dash" d={`M120 450 V620 M${EDGE - 60} 450 V620 M${EDGE + gap + 60} 450 V620 M1900 450 V620 M0 620 H2000`} />
        <path className="w-dimline" d={`M${EDGE} 500 H${EDGE + gap} M${EDGE} 480 V520 M${EDGE + gap} 480 V520`} />
        <text x={EDGE + gap / 2} y="560" textAnchor="middle" className="w-dimtext">{gap} mm</text>

        <line className="w-slide" x1={xr} y1="372" x2={xf} y2="372" />
        <path className="w-arm" d={`M${xc + 70} 330 L${fa[0]} ${fa[1]} L${xf} 352 M${xc - 70} 330 L${fb[0]} ${fb[1]} L${xr} 352`} />
        <rect className="w-body" x={xc - 100} y="330" width="200" height="46" rx="8" />
        <rect className="w-body" x={xf - 45} y="352" width="90" height="14" rx="4" />
        <rect className="w-body" x={xr - 45} y="352" width="90" height="14" rx="4" />
        {[xr, xc - 60, xc + 60, xf].map(wheel)}
        <path className={"w-beam" + (overGap ? " is-far" : "")} d={`M${sensorX} 378 V${overGap ? 612 : 418}`} />
        <rect className="w-sensor" x={sensorX - 9} y="366" width="18" height="12" />
      </svg>

      <div className="w-cross__read">
        <p className="w-say" aria-live="polite">{step}</p>
        <dl className="w-stats">
          <div><dt>Servo angle</dt><dd>{Math.round(4 + (65 * ext) / E)}°</dd></div>
          <div><dt>Sensor</dt><dd>{overGap ? "over 20 cm" : "about 4 cm"}</dd></div>
          <div><dt>Wheels on a table</dt><dd>{[xr, xc - 60, xc + 60, xf].filter(onTable).length * 2} of 8</dd></div>
        </dl>
      </div>

      <div className="w-controls">
        <button type="button" className="btn" onClick={() => { if (t >= 1) setT(0); setPlaying(!playing); }}>
          {playing ? "Pause" : t >= 1 ? "Play again" : "Play"}
        </button>
        <label className="w-slider w-slider--grow">
          <span>Step through</span>
          <input type="range" min="0" max="1000" value={Math.round(t * 1000)} onChange={(e) => { setPlaying(false); setT(e.target.value / 1000); }} />
        </label>
        <label className="w-slider">
          <span>Gap {gap} mm</span>
          <input type="range" min="200" max="400" step="10" value={gap} onChange={(e) => setGap(+e.target.value)} />
        </label>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Autopilot: where the 22 minutes went                                */

const GOALS = [
  ["Stone pickaxe", 72, ""],
  ["16 torches", 10, ""],
  ["Iron pickaxe", 79, ""],
  ["Food", 956, "Most of the run. Hunting at night dropped health from 20 to 1.5 in 75 seconds, then the bot stood still for four minutes because the hunger bar sat just under the level where health regenerates."],
  ["3 diamonds", 84, ""],
  ["Shield", 132, "Last goal in the queue. The run ended with no deaths and no requests for help."],
];
const mmss = (s) => (s >= 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s} s`);

export function RunTimeline() {
  const [sel, setSel] = useState(3);
  const total = GOALS.reduce((a, g) => a + g[1], 0);
  return (
    <div className="w w-run">
      <div className="w-run__bar" role="group" aria-label="Time spent on each goal">
        {GOALS.map(([name, s], i) => (
          <button
            key={name}
            type="button"
            className={"w-run__seg" + (sel === i ? " is-on" : "")}
            style={{ flexGrow: s }}
            aria-pressed={sel === i}
            onClick={() => setSel(i)}
            onPointerEnter={(e) => e.pointerType === "mouse" && setSel(i)}
            onFocus={() => setSel(i)}
          >
            <span>{i + 1}</span>
          </button>
        ))}
      </div>
      <div className="w-run__axis"><span>0</span><span>{mmss(total)}</span></div>
      <div className="w-run__detail" aria-live="polite">
        <h4>{sel + 1}. {GOALS[sel][0]}</h4>
        <p className="w-run__time">{mmss(GOALS[sel][1])}, {Math.round((GOALS[sel][1] / total) * 100)}% of the run</p>
        {GOALS[sel][2] && <p>{GOALS[sel][2]}</p>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Autopilot: what the model is allowed to say                         */

const MOVES = {
  goto: { field: "radius", label: "Search radius, blocks", max: 800, ok: [0, 512], make: (v) => ({ move: "goto", x: 120, z: -40, radius: v }) },
  walk: { field: "blocks", label: "Distance, blocks", max: 400, ok: [8, 256], make: (v) => ({ move: "walk", dir: "north", blocks: v }) },
  explore: { field: "seconds", label: "Time, seconds", max: 300, ok: [15, 180], make: (v) => ({ move: "explore", seconds: v }) },
  dig: { field: "cells", label: "Cells to dig", max: 200, ok: [1, 75], make: (v) => ({ move: "dig", cells: v }), world: true },
  place: { field: "blocks", label: "Blocks to place", max: 100, ok: [1, 32], make: (v) => ({ move: "place", block: "cobblestone", blocks: v }), world: true },
  command: { field: null, label: "", make: () => ({ move: "command", text: "/give @s diamond 64" }) },
};
const WORLD = [
  ["feet", "Under the player's feet", "the game refuses to dig or build under the player's feet."],
  ["lava", "Next to lava", "the game refuses any move that touches lava."],
  ["built", "A block the player built", "the game refuses to break what the player built."],
];

export function MoveCheck() {
  const [move, setMove] = useState("walk");
  const [val, setVal] = useState(64);
  const [flags, setFlags] = useState({});
  const m = MOVES[move];
  let why = "";
  if (move === "command") why = "Rejected: not one of the known moves. Raw commands are never passed through.";
  else if (val < m.ok[0] || val > m.ok[1]) why = `Rejected: ${m.field} must be ${m.ok[0]} to ${m.ok[1]}. The model gets one chance to repair its reply.`;
  else if (m.world) {
    const hit = WORLD.find(([k]) => flags[k]);
    if (hit) why = "Valid reply, but " + hit[2];
  }
  return (
    <div className="w w-move">
      <div className="w-move__in">
        <div className="w-row" role="group" aria-label="Move the model replies with">
          {Object.keys(MOVES).map((k) => (
            <button key={k} type="button" className={"w-key" + (move === k ? " is-on" : "")} aria-pressed={move === k} onClick={() => { setMove(k); setVal(MOVES[k].ok ? Math.round((MOVES[k].ok[0] + MOVES[k].ok[1]) / 2) : 0); }}>
              {k}
            </button>
          ))}
        </div>
        {m.field && (
          <label className="w-slider">
            <span>{m.label}: {val}</span>
            <input type="range" min="0" max={m.max} value={val} onChange={(e) => setVal(+e.target.value)} />
          </label>
        )}
        {m.world && (
          <div className="w-checks">
            {WORLD.map(([k, label]) => (
              <label key={k}>
                <input type="checkbox" checked={!!flags[k]} onChange={(e) => setFlags({ ...flags, [k]: e.target.checked })} /> {label}
              </label>
            ))}
          </div>
        )}
      </div>
      <div className="w-move__out">
        <pre>{JSON.stringify(m.make(val))}</pre>
        <p className={"w-verdict" + (why ? " is-no" : "")} aria-live="polite">
          {why || <mark>Accepted. The move is queued.</mark>}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tracker: match confidence over one real run                         */

export function ConfidenceChart() {
  const [i, setI] = useState(null);
  const W = 800, H = 230, L = 44, R = 12, T = 14, B = 44;
  const x = (k) => L + (k / (run.n - 1)) * (W - L - R);
  const y = (c) => T + ((1 - c) / 0.4) * (H - T - B);
  const path = useMemo(() => "M" + run.conf.map((c, k) => `${x(k).toFixed(1)} ${y(c).toFixed(1)}`).join("L"), []);
  const ticks = useMemo(() => run.rec.map((k) => `M${x(k).toFixed(1)} ${H - B + 8}v10`).join(""), []);
  const rec = useMemo(() => new Set(run.rec), []);
  const pick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const k = Math.round((((e.clientX - r.left) / r.width) * W - L) / (W - L - R) * (run.n - 1));
    setI(Math.min(run.n - 1, Math.max(0, k)));
  };
  const k = i ?? 0;
  return (
    <div className="w w-conf">
      <svg viewBox={`0 0 ${W} ${H}`} onPointerMove={pick} onPointerDown={pick} role="img" aria-label="Match confidence for each of 1,592 frames, staying between 0.64 and 1.0, with recovered frames marked underneath.">
        {[1, 0.8, 0.6].map((c) => (
          <g key={c}>
            <line className="w-grid" x1={L} x2={W - R} y1={y(c)} y2={y(c)} />
            <text className="w-label" x={L - 8} y={y(c) + 4} textAnchor="end">{c.toFixed(1)}</text>
          </g>
        ))}
        <path className="w-trace" d={path} />
        <path className="w-rec" d={ticks} />
        <text className="w-label" x={L} y={H - 6}>frame 1</text>
        <text className="w-label" x={W - R} y={H - 6} textAnchor="end">frame {run.n.toLocaleString()}</text>
        <text className="w-label w-label--red" x={(W + L) / 2} y={H - 6} textAnchor="middle">red marks: frames recovered after a weak match</text>
        {i != null && (
          <g>
            <line className="w-cursor" x1={x(k)} x2={x(k)} y1={T} y2={H - B + 18} />
            <circle className="w-dot" cx={x(k)} cy={y(run.conf[k])} r="4.5" />
          </g>
        )}
      </svg>
      <dl className="w-stats" aria-live="polite">
        <div><dt>Frame</dt><dd>{i == null ? "move over the chart" : (k + 1).toLocaleString()}</dd></div>
        <div><dt>Confidence</dt><dd>{i == null ? "" : run.conf[k].toFixed(3)}</dd></div>
        <div><dt>Status</dt><dd>{i == null ? "" : rec.has(k) ? "recovered" : "clean match"}</dd></div>
        <div><dt>Beam length off by</dt><dd>{i == null ? "" : run.err[k].toFixed(1) + " µm"}</dd></div>
      </dl>
    </div>
  );
}

export const widgets = { mixer: ThrusterMixer, crossing: CrossingSim, timeline: RunTimeline, movecheck: MoveCheck, confidence: ConfidenceChart };
