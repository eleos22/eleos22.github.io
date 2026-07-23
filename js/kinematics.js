const g = 9.8;
const canvas = document.getElementById("trajCanvas");
const ctx = canvas.getContext("2d");
const PAD = 30;
const groundY = canvas.height - PAD;
const originX = PAD;

const v0Slider = document.getElementById("v0");
const angleSlider = document.getElementById("angle");
const v0Val = document.getElementById("v0Val");
const angleVal = document.getElementById("angleVal");
const readout = document.getElementById("phReadout");
const launchBtn = document.getElementById("launchBtn");

let animId = null;

function physics(v0, angleDeg) {
  const theta = (angleDeg * Math.PI) / 180;
  const tFlight = (2 * v0 * Math.sin(theta)) / g;
  const R = (v0 * v0 * Math.sin(2 * theta)) / g;
  const H = (v0 * v0 * Math.sin(theta) * Math.sin(theta)) / (2 * g);
  return { theta, tFlight, R, H };
}

// Picks a "nice" round tick spacing (1, 2, 5, 10, 20, 50...) so labels don't crowd
function niceStep(maxValue, targetTicks) {
  const rawStep = maxValue / targetTicks;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / magnitude;
  if (residual > 5) return 10 * magnitude;
  if (residual > 2) return 5 * magnitude;
  if (residual > 1) return 2 * magnitude;
  return magnitude;
}

function drawAxes(scale) {
  const v0Max = parseFloat(v0Slider.max);
  const angleMax = parseFloat(angleSlider.max);
  const rMax = (v0Max * v0Max) / g;
  const hMax =
    (v0Max * v0Max * Math.sin((angleMax * Math.PI) / 180) ** 2) / (2 * g);
  const xStep = niceStep(rMax, 6);
  const yStep = niceStep(hMax, 4);

  ctx.strokeStyle = "#f8f9fa66";
  ctx.lineWidth = 1.5;
  ctx.font = "11px 'Cabin Sketch', sans-serif";
  ctx.fillStyle = "#f8f9fa";

  // x-axis
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(canvas.width, groundY);
  ctx.stroke();

  ctx.textAlign = "center";
  for (let xVal = 0; xVal <= rMax + 0.01; xVal += xStep) {
    const px = originX + xVal * scale;
    if (px > canvas.width) break;
    ctx.beginPath();
    ctx.moveTo(px, groundY - 4);
    ctx.lineTo(px, groundY + 4);
    ctx.stroke();
    ctx.fillText(xVal.toFixed(0), px, groundY + 16);
  }
  ctx.fillText("x (m)", canvas.width - 25, groundY + 16);

  // y-axis
  ctx.beginPath();
  ctx.moveTo(originX, groundY);
  ctx.lineTo(originX, PAD);
  ctx.stroke();

  ctx.textAlign = "right";
  for (let yVal = yStep; yVal <= hMax + 0.01; yVal += yStep) {
    const py = groundY - yVal * scale;
    if (py < PAD) break;
    ctx.beginPath();
    ctx.moveTo(originX - 4, py);
    ctx.lineTo(originX + 4, py);
    ctx.stroke();
    ctx.fillText(yVal.toFixed(0), originX - 8, py + 4);
  }
  ctx.textAlign = "left";
  ctx.fillText("y (m)", originX + 6, PAD + 2);
}

function xyAt(t, v0, theta) {
  return {
    x: v0 * Math.cos(theta) * t,
    y: v0 * Math.sin(theta) * t - 0.5 * g * t * t,
  };
}

// Fixed scale, computed once from the sliders' max possible range/height —
// so a slower launch actually draws a visibly smaller arc, not a rescaled one.
const usableW = canvas.width - 2 * PAD;
const usableH = canvas.height - 2 * PAD;
const V0_MAX = parseFloat(v0Slider.max);
const ANGLE_MAX = parseFloat(angleSlider.max);
const R_MAX = (V0_MAX * V0_MAX) / g; // max range occurs at 45°, sin(90°) = 1
const H_MAX =
  (V0_MAX * V0_MAX * Math.sin((ANGLE_MAX * Math.PI) / 180) ** 2) / (2 * g);
const FIXED_SCALE = Math.min(usableW / R_MAX, usableH / H_MAX);

function getScale() {
  return FIXED_SCALE;
}

function toPixel(x, y, scale) {
  return { px: originX + x * scale, py: groundY - y * scale };
}

function drawScene(v0, angleDeg, ballT) {
  const { theta, tFlight, R, H } = physics(v0, angleDeg);
  const scale = getScale();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // x-y Axes
  drawAxes(scale);

  // trajectory path
  ctx.strokeStyle = "#ffcb77";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const t = (tFlight * i) / steps;
    const { x, y } = xyAt(t, v0, theta);
    const { px, py } = toPixel(x, y, scale);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // launch + landing markers
  ctx.fillStyle = "#f8f9fa";
  const start = toPixel(0, 0, scale);
  const end = toPixel(R, 0, scale);
  ctx.beginPath();
  ctx.arc(start.px, start.py, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(end.px, end.py, 4, 0, Math.PI * 2);
  ctx.fill();

  // moving ball, if animating
  if (ballT !== undefined) {
    const { x, y } = xyAt(ballT, v0, theta);
    const { px, py } = toPixel(x, y, scale);
    ctx.fillStyle = "#ffcb77";
    ctx.beginPath();
    ctx.arc(px, py, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  return { theta, tFlight, R, H };
}

function updateReadout(v0, angleDeg, theta, tFlight, R, H) {
  readout.innerHTML = `
    \\( x(t) = ${v0.toFixed(1)}\\cos(${angleDeg}^\\circ)\\, t = ${(
      v0 * Math.cos(theta)
    ).toFixed(2)}\\,t \\)<br/>
    \\( y(t) = ${v0.toFixed(1)}\\sin(${angleDeg}^\\circ)\\, t - 4.9t^2 = ${(
      v0 * Math.sin(theta)
    ).toFixed(2)}\\,t - 4.9t^2 \\)<br/>
    Time of flight: \\( t_{\\text{flight}} = ${tFlight.toFixed(2)} \\) s
    &nbsp;&middot;&nbsp;
    Range: \\( R = ${R.toFixed(2)} \\) m
    &nbsp;&middot;&nbsp;
    Max height: \\( H = ${H.toFixed(2)} \\) m
  `;
  renderMathInElement(readout, {
    delimiters: [{ left: "\\(", right: "\\)", display: false }],
  });
}

function refresh() {
  const v0 = parseFloat(v0Slider.value);
  const angleDeg = parseFloat(angleSlider.value);
  v0Val.textContent = v0;
  angleVal.textContent = angleDeg;
  const { theta, tFlight, R, H } = drawScene(v0, angleDeg);
  updateReadout(v0, angleDeg, theta, tFlight, R, H);
}

function launch() {
  if (animId) cancelAnimationFrame(animId);
  const v0 = parseFloat(v0Slider.value);
  const angleDeg = parseFloat(angleSlider.value);
  const { tFlight } = physics(v0, angleDeg);

  const animDurationMs = 1800; // fixed on-screen duration regardless of physical time
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const frac = Math.min(elapsed / animDurationMs, 1);
    const ballT = frac * tFlight;
    const { theta, R, H } = drawScene(v0, angleDeg, ballT);
    updateReadout(v0, angleDeg, theta, tFlight, R, H);
    if (frac < 1) {
      animId = requestAnimationFrame(step);
    } else {
      animId = null;
    }
  }
  animId = requestAnimationFrame(step);
}

v0Slider.addEventListener("input", refresh);
angleSlider.addEventListener("input", refresh);
launchBtn.addEventListener("click", launch);

window.addEventListener("load", () => {
  renderMathInElement(document.body, {
    delimiters: [
      { left: "\\[", right: "\\]", display: true },
      { left: "\\(", right: "\\)", display: false },
    ],
  });
  refresh();
});
