// Redline callouts: each figure's numbered notes list carries the coordinates
// (percent of the image) of its balloon and the feature it points to.
// The list is the single source; this script draws the balloons and leaders.
(function () {
  var NS = "http://www.w3.org/2000/svg";

  function pair(s) {
    var p = String(s || "").split(",").map(Number);
    return p.length === 2 && p.every(isFinite) ? p : null;
  }

  function build(fig) {
    var frame = fig.querySelector(".fig__frame");
    var items = fig.querySelectorAll(".notes > li");
    if (!frame) return;

    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "leaders");
    svg.setAttribute("aria-hidden", "true");
    frame.appendChild(svg);

    var segs = [];
    var order = 0;

    // extra straight segments, e.g. a dimension line: "x1,y1,x2,y2;..."
    (frame.getAttribute("data-lines") || "").split(";").forEach(function (s) {
      var p = s.split(",").map(Number);
      if (p.length === 4 && p.every(isFinite)) segs.push({ a: [p[0], p[1]], b: [p[2], p[3]], i: order });
    });
    if (segs.length) order++;
    frame.querySelectorAll(".dim").forEach(function (d) { d.style.setProperty("--i", order); });
    if (frame.querySelector(".dim")) order++;

    items.forEach(function (li, n) {
      var b = pair(li.getAttribute("data-b"));
      var t = pair(li.getAttribute("data-t"));
      if (!b) return;
      var i = order++;
      if (t) {
        segs.push({ a: t, b: b, i: i });
        var dot = document.createElement("span");
        dot.className = "pt";
        dot.style.left = t[0] + "%";
        dot.style.top = t[1] + "%";
        dot.style.setProperty("--i", i);
        frame.appendChild(dot);
      }
      var bal = document.createElement("span");
      bal.className = "balloon";
      bal.setAttribute("aria-hidden", "true");
      bal.textContent = n + 1;
      bal.style.left = b[0] + "%";
      bal.style.top = b[1] + "%";
      bal.style.setProperty("--i", i);
      frame.appendChild(bal);
    });

    var lines = segs.map(function (s) {
      var ln = document.createElementNS(NS, "line");
      ln.setAttribute("pathLength", "1");
      ln.style.setProperty("--i", s.i);
      svg.appendChild(ln);
      return ln;
    });

    function place() {
      var w = frame.clientWidth, h = frame.clientHeight;
      segs.forEach(function (s, k) {
        lines[k].setAttribute("x1", (s.a[0] * w) / 100);
        lines[k].setAttribute("y1", (s.a[1] * h) / 100);
        lines[k].setAttribute("x2", (s.b[0] * w) / 100);
        lines[k].setAttribute("y2", (s.b[1] * h) / 100);
      });
    }
    place();
    if ("ResizeObserver" in window) new ResizeObserver(place).observe(frame);
    else window.addEventListener("resize", place);
  }

  document.querySelectorAll("figure.fig").forEach(build);

  // Start the one-time drawing only once a frame is actually painted,
  // so a tab opened in the background shows the finished marks.
  requestAnimationFrame(function () {
    document.querySelectorAll("figure.draw").forEach(function (f) {
      f.classList.add("go");
      // Whatever happens to the animation clock, the marks end up visible.
      setTimeout(function () { f.classList.remove("go"); }, 2600);
    });
  });

  var pen = document.querySelector("[data-redlines-toggle]");
  if (pen) {
    pen.addEventListener("click", function () {
      var off = document.documentElement.classList.toggle("no-redlines");
      pen.setAttribute("aria-pressed", String(!off));
      pen.textContent = off ? "Show redlines" : "Hide redlines";
    });
  }
})();
