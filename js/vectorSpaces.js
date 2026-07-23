// Render all static KaTeX math on the page once things are loaded
window.addEventListener("load", () => {
  renderMathInElement(document.body, {
    delimiters: [
      { left: "\\[", right: "\\]", display: true },
      { left: "\\(", right: "\\)", display: false },
    ],
  });
  updateSpan();
  updateCoords();
});

const canvas = document.getElementById("spanCanvas");
const ctx = canvas.getContext("2d");
const SCALE = 30; // px per unit
const ORIGIN = { x: canvas.width / 2, y: canvas.height / 2 };

// Convert a math-space point (x right, y up) to canvas pixel coordinates
function toPixel(x, y) {
  return { x: ORIGIN.x + x * SCALE, y: ORIGIN.y - y * SCALE };
}

function drawGrid() {
  ctx.strokeStyle = "#ffffff22";
  ctx.lineWidth = 1;
  const unitsX = Math.ceil(canvas.width / 2 / SCALE);
  const unitsY = Math.ceil(canvas.height / 2 / SCALE);
  for (let i = -unitsX; i <= unitsX; i++) {
    const p1 = toPixel(i, -unitsY);
    const p2 = toPixel(i, unitsY);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
  for (let j = -unitsY; j <= unitsY; j++) {
    const p1 = toPixel(-unitsX, j);
    const p2 = toPixel(unitsX, j);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
  // axes
  ctx.strokeStyle = "#f8f9fa66";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, ORIGIN.y);
  ctx.lineTo(canvas.width, ORIGIN.y);
  ctx.moveTo(ORIGIN.x, 0);
  ctx.lineTo(ORIGIN.x, canvas.height);
  ctx.stroke();
}

function drawArrow(from, to, color, label) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();

  // arrowhead
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const headLen = 10;
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(
    to.x - headLen * Math.cos(angle - Math.PI / 6),
    to.y - headLen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    to.x - headLen * Math.cos(angle + Math.PI / 6),
    to.y - headLen * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();

  ctx.font = "16px 'Cabin Sketch', sans-serif";
  ctx.fillText(label, to.x + 6, to.y - 6);
}

function getVectors() {
  const a = parseFloat(document.getElementById("va").value) || 0;
  const b = parseFloat(document.getElementById("vb").value) || 0;
  const c = parseFloat(document.getElementById("vc").value) || 0;
  const d = parseFloat(document.getElementById("vd").value) || 0;
  return { v1: { x: a, y: c }, v2: { x: b, y: d }, a, b, c, d };
}

function updateSpan() {
  const { v1, v2, a, b, c, d } = getVectors();
  const det = a * d - b * c;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  const independent = Math.abs(det) > 1e-9;

  if (independent) {
    // shade the parallelogram spanned by v1 and v2
    const p0 = toPixel(0, 0);
    const p1 = toPixel(v1.x, v1.y);
    const p2 = toPixel(v1.x + v2.x, v1.y + v2.y);
    const p3 = toPixel(v2.x, v2.y);
    ctx.fillStyle = "#cbb4ff33";
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();
    ctx.fill();
  } else {
    // dependent: span collapses to a line through the origin (or just the origin if both are 0)
    const dirVec = Math.hypot(v1.x, v1.y) > 1e-9 ? v1 : v2;
    if (Math.hypot(dirVec.x, dirVec.y) > 1e-9) {
      const t = 400;
      const len = Math.hypot(dirVec.x, dirVec.y);
      const ux = dirVec.x / len;
      const uy = dirVec.y / len;
      const p1 = toPixel(-ux * t, -uy * t);
      const p2 = toPixel(ux * t, uy * t);
      ctx.strokeStyle = "#cbb4ff88";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  const origin = toPixel(0, 0);
  drawArrow(origin, toPixel(v1.x, v1.y), "#cbb4ff", "v\u2081");
  drawArrow(origin, toPixel(v2.x, v2.y), "#7ec4ff", "v\u2082");

  const readout = document.getElementById("spanReadout");
  readout.innerHTML = `
    \\( \\det(M) = (${a})(${d}) - (${b})(${c}) = ${det.toFixed(2)} \\)<br/>
    <span class="status-line ${
      independent ? "status-independent" : "status-dependent"
    }">
      ${
        independent
          ? "Linearly independent \u2014 span is all of \u211d\u00b2 (shaded parallelogram area = |det| = " +
            Math.abs(det).toFixed(2) +
            ")"
          : "Linearly dependent \u2014 span collapses to a line through the origin (area = 0)"
      }
    </span>
  `;
  renderMathInElement(readout, {
    delimiters: [{ left: "\\(", right: "\\)", display: false }],
  });

  updateCoords();
}

function updateCoords() {
  const { v1, v2, a, b, c, d } = getVectors();
  const det = a * d - b * c;
  const tx = parseFloat(document.getElementById("tx").value) || 0;
  const ty = parseFloat(document.getElementById("ty").value) || 0;
  const readout = document.getElementById("coordReadout");

  if (Math.abs(det) < 1e-9) {
    readout.innerHTML = `\\{ v_1, v_2 \\}\\) isn't a basis (determinant is 0), so \\(t\\) can't always be written uniquely in this basis.`;
  } else {
    // Solve M [c1, c2]^T = t using the inverse of M = [[a,b],[c,d]]
    const invDet = 1 / det;
    const c1 = invDet * (d * tx - b * ty);
    const c2 = invDet * (-c * tx + a * ty);
    readout.innerHTML = `
      \\( c_1 = ${c1.toFixed(2)}, \\quad c_2 = ${c2.toFixed(2)} \\)<br/>
      Check: \\( ${c1.toFixed(2)} \\cdot v_1 + ${c2.toFixed(
      2
    )} \\cdot v_2 = (${(c1 * a + c2 * b).toFixed(2)}, ${(
      c1 * c + c2 * d
    ).toFixed(2)}) \\)
    `;
  }
  renderMathInElement(readout, {
    delimiters: [{ left: "\\(", right: "\\)", display: false }],
  });
}

["va", "vb", "vc", "vd"].forEach((id) =>
  document.getElementById(id).addEventListener("input", updateSpan)
);
["tx", "ty"].forEach((id) =>
  document.getElementById(id).addEventListener("input", updateCoords)
);
