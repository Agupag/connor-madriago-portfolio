// Tiny inline markup for content strings: ==highlight== and [label](url).
export function rich(text) {
  if (typeof text !== "string") return text;
  const out = [];
  const re = /==(.+?)==|\[(.+?)\]\((.+?)\)/g;
  let last = 0;
  let m;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<mark key={k++}>{m[1]}</mark>);
    else
      out.push(
        <a key={k++} href={m[3]} target={m[3].startsWith("http") ? "_blank" : undefined} rel="noreferrer">
          {m[2]}
        </a>
      );
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
