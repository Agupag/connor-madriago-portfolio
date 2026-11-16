// The four proof figures on the home page, in one place.
// Each number is stated in a project's own copy, so the strip cannot drift from the pages.

const int = (v) => Math.round(v).toLocaleString("en-US");

export const proofs = [
  {
    id: "gap",
    href: "gap-vehicle",
    label: "Gap crossed",
    note: "asked for 200 mm",
    to: 400,
    format: (v) => `${int(v)} mm`,
  },
  {
    id: "time",
    href: "gap-vehicle",
    label: "Time to cross it",
    note: "requirement was 2 min",
    to: 10,
    format: (v) => `~${Math.round(v)} s`,
  },
  {
    id: "ground",
    href: "dj",
    label: "Worst ground drop",
    note: "down from 1,001 mV",
    to: 12,
    format: (v) => `${int(v)} mV`,
  },
  {
    id: "tokens",
    href: "local-ai",
    label: "Local model",
    note: "262k context, on a laptop",
    to: 39.7,
    format: (v) => `${v.toFixed(1)} tok/s`,
  },
];
