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
          <button type="button" className={"w-key" + (heave === 1 ? " is-on" : "")} onPointerDown={() => setHeave(1)} onPointerUp={() => setHeave(0)} onPointerLeave={() => setHeave(0)} onKeyDown={(e) => (e.key === " " || e.key === "Enter") && setHeave(1)} onKeyUp={() => setHeave(0)}>
            Heave up
          </button>
          <button type="button" className={"w-key" + (heave === 2 ? " is-on" : "")} onPointerDown={() => setHeave(2)} onPointerUp={() => setHeave(0)} onPointerLeave={() => setHeave(0)} onKeyDown={(e) => (e.key === " " || e.key === "Enter") && setHeave(2)} onKeyUp={() => setHeave(0)}>
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
        <p className="w-say" aria-live={playing ? "off" : "polite"}>{step}</p>
        <dl className="w-stats">
          <div><dt>Servo angle</dt><dd>{Math.round(4 + (65 * ext) / E)}° of 69°</dd></div>
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
  ["Food", 956, "Most of the run. What went wrong, below, explains why."],
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
  surface: { field: null, label: "", make: () => ({ move: "surface" }) },
  get: { field: "count", label: "How many", max: 128, ok: [1, 64], make: (v) => ({ move: "get", item: "oak_log", count: v }) },
  command: { field: null, label: "", bad: true, make: () => ({ move: "command", text: "/give @s diamond 64" }) },
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
  else if (m.ok && (val < m.ok[0] || val > m.ok[1])) why = `Rejected: ${m.field} must be ${m.ok[0]} to ${m.ok[1]}. The model gets one chance to repair its reply.`;
  else if (m.world) {
    const hit = WORLD.find(([k]) => flags[k]);
    if (hit) why = "Valid reply, but " + hit[2];
  }
  return (
    <div className="w w-move">
      <div className="w-move__in">
        <div className="w-row" role="group" aria-label="Move the model replies with">
          {Object.keys(MOVES).map((k) => (
            <button key={k} type="button" className={"w-key" + (move === k ? " is-on" : "") + (MOVES[k].bad ? " w-key--bad" : "")} aria-pressed={move === k} onClick={() => { setMove(k); setVal(MOVES[k].ok ? Math.round((MOVES[k].ok[0] + MOVES[k].ok[1]) / 2) : 0); }}>
              {MOVES[k].bad ? "command (not allowed)" : k}
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
          {why || "Accepted. The move is queued."}
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

/* ------------------------------------------------------------------ */
/* Drone swarm: one command, from the flight stick to the flight       */
/* controller, using the packet formats in the class repository        */

const THROTTLE_NOTES = [
  [1499, "lowest"],
  [1600, "lifting off"],
  [1700, "flying"],
  [1999, "flying too fast"],
  [2000, "crashing"],
];

export function SwarmLink() {
  const [active, setActive] = useState(2);
  const [pr, setPr] = useState({ roll: 1500, pitch: 1500 });
  const [yaw, setYaw] = useState(1500);
  const [thr, setThr] = useState(1000);
  const [armed, setArmed] = useState(true);
  const [kill, setKill] = useState(false);
  const pad = useRef(null);

  const aim = (e) => {
    const r = pad.current.getBoundingClientRect();
    const cl = (v) => Math.max(-1, Math.min(1, v));
    const x = cl(((e.clientX - r.left) / r.width - 0.5) * 2);
    const y = cl(-((e.clientY - r.top) / r.height - 0.5) * 2);
    setPr({ roll: Math.round(1500 + x * 500), pitch: Math.round(1500 + y * 500) });
  };
  const arm = armed ? 1600 : 1500;
  const ks = kill ? 1700 : 1000;
  // Channel order in ArduinoMSP.ino: pitch, roll, throttle, yaw, nav hold, arm, unused, kill.
  const ch = [pr.pitch, pr.roll, thr, yaw, 1500, arm, 1500, ks];
  const payload = ch.flatMap((v) => [v & 255, v >> 8]);
  const head = [0x24, 0x4d, 0x3c, 16, 200];
  const sum = [16, 200, ...payload].reduce((a, b) => a ^ b, 0);
  const H = (b) => b.toString(16).padStart(2, "0").toUpperCase();
  const udp = `MAN|192.168.4.2|${yaw}|${pr.roll}|${pr.pitch}|${thr}|${ks}|${arm}|1500|`;
  const note = THROTTLE_NOTES.find(([max]) => thr <= max)[1];
  const names = ["pitch", "roll", "throttle", "yaw", "nav hold", "arm", "unused", "kill"];

  return (
    <div className="w w-swarm">
      <div className="w-swarm__slots" role="group" aria-label="Base station drone slots">
        {Array.from({ length: 8 }, (_, i) => (
          <button key={i} type="button" className={"w-slot" + (active === i ? " is-on" : "")} aria-pressed={active === i} onClick={() => setActive(i)}>
            <svg viewBox="-20 -20 40 40" aria-hidden="true">
              <path d="M-11 -11 L11 11 M-11 11 L11 -11" />
              {[[-11, -11], [11, -11], [-11, 11], [11, 11]].map(([x, y]) => <circle key={x + "" + y} cx={x} cy={y} r="6" />)}
              <rect x="-5" y="-5" width="10" height="10" rx="2" />
            </svg>
            <span>{i + 1}</span>
          </button>
        ))}
      </div>
      <p className="w-small">Eight slots in the base station. Pick the drone the stick flies. The others get centred sticks and an arm value of 1500, so they stay disarmed.</p>

      <div className="w-swarm__body">
        <div className="w-swarm__in">
          <svg
            ref={pad}
            viewBox="-110 -110 220 220"
            className="w-stick"
            tabIndex={0}
            role="application"
            aria-label="Roll and pitch stick. Drag it."
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); aim(e); }}
            onPointerMove={(e) => e.buttons && aim(e)}
            onPointerUp={() => setPr({ roll: 1500, pitch: 1500 })}
            onPointerCancel={() => setPr({ roll: 1500, pitch: 1500 })}
          >
            <rect className="w-line" x="-100" y="-100" width="200" height="200" rx="14" />
            <path className="w-dash" d="M-100 0 H100 M0 -100 V100" />
            <text className="w-label" x="-94" y="-86">pitch {pr.pitch}</text>
            <text className="w-label" x="94" y="94" textAnchor="end">roll {pr.roll}</text>
            <circle className="w-knob" cx={((pr.roll - 1500) / 500) * 80} cy={(-(pr.pitch - 1500) / 500) * 80} r="20" />
          </svg>
          <label className="w-slider">
            <span>Throttle {thr}: {note}</span>
            <input type="range" min="1000" max="2000" step="10" value={thr} onChange={(e) => setThr(+e.target.value)} />
          </label>
          <label className="w-slider">
            <span>Yaw {yaw}</span>
            <input type="range" min="1000" max="2000" step="10" value={yaw} onChange={(e) => setYaw(+e.target.value)} onPointerUp={() => setYaw(1500)} />
          </label>
          <div className="w-row">
            <button type="button" className={"w-key" + (armed ? " is-on" : "")} aria-pressed={armed} onClick={() => setArmed(!armed)}>
              {armed ? "Armed" : "Disarmed"}
            </button>
            <button type="button" className={"w-key w-key--kill" + (kill ? " is-on" : "")} aria-pressed={kill} onClick={() => setKill(!kill)}>
              Kill switch
            </button>
          </div>
        </div>

        <ol className="w-hops">
          <li>
            <h4>Laptop to drone {active + 1}, over WiFi</h4>
            <p className="w-small">A UDP text packet to port 2390, through the class's ESP8266 access point.</p>
            <pre>{udp}</pre>
          </li>
          <li>
            <h4>Arduino to flight controller, over serial</h4>
            <p className="w-small">The Arduino Nano 33 IoT on the drone rebuilds it as an MSP_SET_RAW_RC frame at 9600 baud.</p>
            <div className="w-frame">
              {head.map((b, i) => <span key={"h" + i} className="w-frame__h">{H(b)}</span>)}
              {ch.map((v, i) => (
                <span key={"c" + i} className={"w-frame__ch" + (v !== 1500 && v !== 1000 ? " is-on" : "")} title={names[i]}>
                  <b>{H(v & 255)} {H(v >> 8)}</b>
                  <i>{names[i]}</i>
                </span>
              ))}
              <span className="w-frame__h" title="checksum">{H(sum)}</span>
            </div>
            <p className="w-small">Header $M&lt;, 16 data bytes, command 200, eight channels low byte first, XOR checksum.</p>
          </li>
          <li>
            <h4>What INAV does with it</h4>
            <p className="w-say" aria-live="polite">
              {kill
                ? "Kill switch on. Channel 8 reads 1700, and the base station stops reading the stick."
                : !armed
                ? "Disarmed. The arm channel reads 1500, outside the arm range, so the motors stay off."
                : `Armed. Throttle ${thr}: the base station's own comment for this range says "${note}".`}
            </p>
          </li>
        </ol>
      </div>
    </div>
  );
}

widgets.swarm = SwarmLink;

/* ------------------------------------------------------------------ */
/* Local models: what I ran, when, and how fast it generated           */

const MODELS = [
  { date: "Mar 31", name: "Qwen3-Coder-Next", how: "MLX, LM Studio", tps: 62, range: "50 to 74 tok/s", note: "First model I used for coding work. Time to first token about 1 s." },
  { date: "Apr 11", name: "Gemma 4 26B-A4B", how: "Q8_0 GGUF, LM Studio", tps: 62.8, range: "62.8 tok/s median", note: "Prompts up to 35k tokens." },
  { date: "Apr 20", name: "Qwen3.6 35B-A3B", how: "Q8_0 in LM Studio, UD-Q6_K on llama.cpp", tps: 64, range: "60 to 69 tok/s", note: "Same day I built llama.cpp from source with Metal and wrote launch scripts for a 262k context. Mixture of experts: 35B parameters, about 3B active per token." },
  { date: "Jun 7", name: "Qwen3.6 27B (dense)", how: "MLX 8-bit, LM Studio", tps: 15.4, range: "about 15 tok/s", note: "48 to 92 s before the first token. The 35B mixture-of-experts model was about 4 times faster on the same machine, which is why I stayed with A3B models." },
  { date: "Jun 7", name: "Llama 3.3 70B", how: "Q8_0 GGUF, LM Studio", tps: 6.7, range: "6.7 tok/s", note: "A dense 70B fits in 128 GB at Q8, but it is too slow for agent loops." },
  { date: "Oct 20", name: "Qwen3.8 Flash Next", how: "UD-IQ4_XS, about 94 GB, LM Studio", tps: 34, range: "30 to 36 tok/s", note: "262k context, prompts up to 117k tokens. Too big to sit beside a second model in LM Studio, which unloaded one mid-answer when the other was called." },
  { date: "Nov 4", name: "Qwen3.8 Flash Next + MTP", how: "IQ3_S with a Q4_0 MTP head, Hermes on llama.cpp", tps: 39.7, best: 71.9, range: "39.7 tok/s median, 71.9 best", note: "Measured over 3,839 generations in the server log. Prompt processing 369 tok/s median. 56.5% of drafted tokens accepted, 2.84 tokens per step." },
];

export function ModelLog() {
  const [sel, setSel] = useState(MODELS.length - 1);
  const max = 75;
  return (
    <div className="w w-models">
      <div className="w-models__axis" aria-hidden="true">
        {[0, 25, 50, 75].map((v) => (
          <span key={v} style={{ left: (v / max) * 100 + "%" }}>{v}</span>
        ))}
      </div>
      <ul className="w-models__list">
        {MODELS.map((m, i) => (
          <li key={m.name}>
            <button
              type="button"
              className={"w-models__row" + (sel === i ? " is-on" : "")}
              aria-pressed={sel === i}
              onClick={() => setSel(i)}
              onPointerEnter={(e) => e.pointerType === "mouse" && setSel(i)}
              onFocus={() => setSel(i)}
            >
              <span className="w-models__date">{m.date}</span>
              <span className="w-models__name">{m.name}</span>
              <span className="w-models__track">
                <span className="w-models__bar" style={{ width: (m.tps / max) * 100 + "%" }} />
                {m.best && <span className="w-models__best" style={{ left: (m.best / max) * 100 + "%" }} title="best" />}
              </span>
              <span className="w-models__tps">{m.tps}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="w-models__detail" aria-live="polite">
        <h4>{MODELS[sel].name}</h4>
        <p className="w-run__time">{MODELS[sel].range}</p>
        <p className="w-small">{MODELS[sel].how}</p>
        <p>{MODELS[sel].note}</p>
      </div>
    </div>
  );
}

widgets.models = ModelLog;
