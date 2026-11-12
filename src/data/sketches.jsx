// Hand-drawn style diagrams that are easier to keep as code than as image files.

function GridNodeSketch() {
  const demand =
    "M60,238 L110,240 L160,228 L200,176 L230,128 L262,156 L300,204 L340,218 L380,194 L420,136 L452,92 L482,116 L520,184 L560,228 L600,238";
  return (
    <svg
      viewBox="0 0 640 330"
      role="img"
      aria-label="Sketch of a charging station's power over one day. Car charging rises and falls well below the grid connection limit, and batch computing fills the unused space between them."
      style={{ display: "block", width: "100%", height: "auto" }}
    >
      <defs>
        <pattern id="hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="9" stroke="#1e2875" strokeWidth="1.6" />
        </pattern>
      </defs>
      <path d={demand + " L600,72 L60,72 Z"} fill="url(#hatch)" opacity="0.55" />
      <path d={demand} fill="none" stroke="#1e2875" strokeWidth="2.4" strokeLinejoin="round" />
      <line x1="60" y1="72" x2="600" y2="72" stroke="#1e2875" strokeWidth="1.6" strokeDasharray="7 5" />
      <path d="M60,40 L60,262 L612,262" fill="none" stroke="#1e2875" strokeWidth="1.6" />
      <g fontFamily="Archivo, sans-serif" fontSize="13" fill="#555b6e">
        <text x="60" y="282">midnight</text>
        <text x="318" y="282" textAnchor="middle">noon</text>
        <text x="600" y="282" textAnchor="end">midnight</text>
        <text x="68" y="62" fill="#1e2875">Grid connection limit</text>
        <text x="318" y="252" textAnchor="middle" fill="#1e2875">Car charging</text>
        <text transform="translate(44,236) rotate(-90)">Station power</text>
      </g>
      <g fontFamily="'Routed Gothic', sans-serif" fontSize="16" fill="#c4261a">
        <line x1="318" y1="150" x2="330" y2="298" stroke="#c4261a" strokeWidth="1.6" />
        <circle cx="318" cy="150" r="3.5" />
        <text x="330" y="316" textAnchor="middle">Batch AI jobs run in the unused capacity.</text>
        <line x1="452" y1="82" x2="468" y2="38" stroke="#c4261a" strokeWidth="1.6" />
        <circle cx="452" cy="82" r="3.5" />
        <text x="632" y="30" textAnchor="end">Chargers busy: computing yields first.</text>
      </g>
    </svg>
  );
}

export const sketches = { gridnode: GridNodeSketch };
