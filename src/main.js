import "./style.css";
import { firebaseReady, firebaseSetupError } from "./firebase.js";
import { askPhysics, prepareHybridModel } from "./ai.js";
import { topics, calculate } from "./physics.js";
import { drawTopicLab } from "./labVisuals.js";
import "katex/dist/katex.min.css";
import renderMathInElement from "katex/dist/contrib/auto-render";

let activeTopic = "momentum";
let values = Object.fromEntries(topics.momentum.controls.map((c) => [c.id, c.value]));
let simTime = 0;
let isPlaying = true;
let lastTimestamp = null;

// Topic-specific interactive states
let resistorCount = 1;
let circuitConnection = "series";
let workSection = "horizontal";
let showElectricField = false;

const $ = (selector) => document.querySelector(selector);
const canvas = $("#sim-canvas");
const ctx = canvas.getContext("2d");

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatBasicText(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
}

export function renderPhysicsMath(containerElement) {
  if (!containerElement) return;

  renderMathInElement(containerElement, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "\\[", right: "\\]", display: true },
      { left: "$", right: "$", display: false },
      { left: "\\(", right: "\\)", display: false }
    ],
    ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
    throwOnError: false
  });
}

function getExtraState() {
  return {
    resistorCount,
    connection: circuitConnection,
    workSection,
    showField: showElectricField
  };
}

function startPlaying(resetClock = false) {
  if (resetClock) simTime = 0;
  isPlaying = true;
  const playBtn = $("#toggle-play-btn");
  if (playBtn) playBtn.textContent = "Pause";
}

function renderTopicActions() {
  const container = $("#topic-actions");
  if (!container) return;

  if (activeTopic === "circuits") {
    container.innerHTML = `
      <button type="button" id="add-resistor-btn" class="action-btn">+ Add Resistor (${resistorCount})</button>
      <button type="button" id="toggle-conn-btn" class="action-btn">${circuitConnection === "series" ? "Series → Parallel" : "Parallel → Series"}</button>
    `;
    $("#add-resistor-btn")?.addEventListener("click", () => {
      resistorCount = resistorCount >= 4 ? 1 : resistorCount + 1;
      renderTopicActions();
      startPlaying(false);
    });
    $("#toggle-conn-btn")?.addEventListener("click", () => {
      circuitConnection = circuitConnection === "series" ? "parallel" : "series";
      renderTopicActions();
      startPlaying(false);
    });
    return;
  }

  if (activeTopic === "workEnergy") {
    const labels = {
      horizontal: "1/3: Horizontal Track → Switch to Curved",
      curved: "2/3: Curved Slope → Switch to Triangular Incline",
      incline: "3/3: Triangular Incline → Switch to Horizontal"
    };
    container.innerHTML = `
      <button type="button" id="work-section-btn" class="action-btn">
        ${labels[workSection] || labels.horizontal}
      </button>
    `;
    $("#work-section-btn")?.addEventListener("click", () => {
      if (workSection === "horizontal") workSection = "curved";
      else if (workSection === "curved") workSection = "incline";
      else workSection = "horizontal";
      renderControls();
      startPlaying(true);
    });
    return;
  }

  if (activeTopic === "electrostatics") {
    container.innerHTML = `
      <button type="button" id="toggle-field-btn" class="action-btn">
        ${showElectricField ? "Hide Electric Field" : "Show Electric Field"}
      </button>
    `;
    $("#toggle-field-btn")?.addEventListener("click", () => {
      showElectricField = !showElectricField;
      renderTopicActions();
      startPlaying(false);
    });
    return;
  }

  container.innerHTML = "";
}

function renderPresets() {
  const container = $("#presets");
  if (!container) return;
  const presets = topics[activeTopic].presets || [];
  container.innerHTML = presets.map((p, idx) =>
    `<button type="button" class="preset-btn" data-preset="${idx}">${p.label}</button>`
  ).join("");

  container.querySelectorAll(".preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = presets[Number(btn.dataset.preset)];
      values = { ...values, ...preset.values };
      renderControls();
      startPlaying(true);
    });
  });
}

function renderControls() {
  const config = topics[activeTopic];
  $("#sim-title").textContent = config.title;
  renderTopicActions();
  renderPresets();

  const visibleControls = config.controls.filter((c) => {
    if (activeTopic === "workEnergy" && c.id === "angle") {
      return workSection === "incline";
    }
    return true;
  });

  $("#controls").innerHTML = visibleControls.map((c) => `
    <label class="control">
      <span>${c.label}<strong id="${c.id}-value">${values[c.id]} ${c.unit}</strong></span>
      <input type="range" id="${c.id}" min="${c.min}" max="${c.max}" step="${c.step}" value="${values[c.id]}">
    </label>`).join("");

  visibleControls.forEach((c) => {
    $(`#${c.id}`).addEventListener("input", (event) => {
      values[c.id] = Number(event.target.value);
      $(`#${c.id}-value`).textContent = `${values[c.id]} ${c.unit}`;
      startPlaying(true);
    });
  });

  startPlaying(false);
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#111d2d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#27364a";
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 38) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 38) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }
}

function renderSimulation() {
  const extra = getExtraState();
  const result = calculate(activeTopic, values, extra);

  $("#readouts").innerHTML = result.metrics.map(([label, value]) =>
    `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`
  ).join("") + (activeTopic === "momentum" ? '<small class="muted">*Assumes the objects stick together after collision.</small>' : "");

  drawGrid();

  if (activeTopic === "momentum") {
    const p1 = values.m1 * values.v1;
    const p2 = values.m2 * values.v2;
    const vShared = (p1 + p2) / (values.m1 + values.m2);

    const rA = 16 + values.m1 * 1.5;
    const rB = 16 + values.m2 * 1.5;

    const pxPerSec = 28;
    const xA0 = Math.max(90, rA + 30);
    const xB0 = Math.min(canvas.width - 90, canvas.width - rB - 140);

    const initialGapPx = Math.max(0, (xB0 - rB) - (xA0 + rA));
    const relSpeedPx = (values.v1 - values.v2) * pxPerSec;

    const willCollide = relSpeedPx > 0;
    const tColl = willCollide ? initialGapPx / relSpeedPx : Infinity;

    let xA, xB, vADraw, vBDraw, statusLabel;

    if (!willCollide || simTime < tColl) {
      xA = xA0 + values.v1 * pxPerSec * simTime;
      xB = xB0 + values.v2 * pxPerSec * simTime;
      vADraw = values.v1;
      vBDraw = values.v2;
      statusLabel = willCollide
        ? `Approaching · t = ${simTime.toFixed(2)}s (impact at ${tColl.toFixed(2)}s)`
        : `No catch-up collision · t = ${simTime.toFixed(2)}s`;
    } else {
      const xAColl = xA0 + values.v1 * pxPerSec * tColl;
      const xBColl = xB0 + values.v2 * pxPerSec * tColl;
      const dtAfter = simTime - tColl;
      const dxAfter = vShared * pxPerSec * dtAfter;

      xA = xAColl + dxAfter;
      xB = xBColl + dxAfter;
      vADraw = vShared;
      vBDraw = vShared;
      statusLabel = `Stuck together · v' = ${vShared.toFixed(2)} m/s · t = ${simTime.toFixed(2)}s`;
    }

    drawBall(xA, 155, rA, "#5eead4", `A · ${values.m1}kg`);
    drawBall(xB, 155, rB, "#8b9cff", `B · ${values.m2}kg`);
    drawArrow(xA, 95, vADraw * 12, "#5eead4");
    drawArrow(xB, 95, vBDraw * 12, "#8b9cff");
    drawText(statusLabel, 24, 28);
  } else if (activeTopic === "projectile") {
    const g = 9.8;
    const rad = (values.angle * Math.PI) / 180;
    const vx = values.speed * Math.cos(rad);
    const vy = values.speed * Math.sin(rad);
    const groundY = 255;
    const pxPerMeter = 7;

    ctx.strokeStyle = "#8290a5";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(30, groundY); ctx.lineTo(canvas.width - 30, groundY); ctx.stroke();

    const x1 = 60 + vx * simTime * pxPerMeter;
    const y1Meters = Math.max(0, values.h1 + vy * simTime - 0.5 * g * simTime * simTime);
    const y1 = groundY - y1Meters * pxPerMeter;
    drawBall(x1, y1, 8, "#f59e0b", "Ball 1");

    const x2 = 540;
    const y2Meters = Math.max(0, values.h2 + values.v2 * simTime - 0.5 * g * simTime * simTime);
    const y2 = groundY - y2Meters * pxPerMeter;
    drawBall(x2, y2, 8, "#22c55e", "Ball 2");
    drawText(`t = ${simTime.toFixed(2)}s · y1 = ${y1Meters.toFixed(1)}m · y2 = ${y2Meters.toFixed(1)}m`, 24, 28);
  } else if (activeTopic === "newton") {
    const moving = values.force > values.friction;
    const netF = moving ? values.force - values.friction : 0;
    const a = netF / values.mass;
    const x = 90 + Math.min(540, 0.5 * a * simTime * simTime * 25);
    drawBall(x, 155, 22, "#8b9cff", `${values.mass} kg`);
    drawArrow(x + 26, 155, Math.min(220, values.force * 4), "#5eead4");
    drawText(
      moving ? `Moving: a = ${a.toFixed(2)} m/s² (t = ${simTime.toFixed(2)}s)` : "Force too small: friction balances force, object stays at rest",
      24,
      32
    );
  } else {
    drawTopicLab(ctx, canvas, {
      topic: activeTopic,
      values,
      calc: result,
      simTime,
      extra
    });
  }
}

function stepAnimation(timestamp) {
  if (lastTimestamp !== null && isPlaying) {
    const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
    simTime += dt;
  }
  lastTimestamp = timestamp;
  renderSimulation();
  requestAnimationFrame(stepAnimation);
}

function drawBall(x, y, radius, color, label) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#e8eef8"; ctx.font = "14px system-ui"; ctx.textAlign = "center";
  if (label) ctx.fillText(label, x, y + radius + 22);
}

function drawArrow(x, y, dx, color) {
  if (Math.abs(dx) < 1) return;
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y); ctx.stroke();
  const direction = Math.sign(dx);
  ctx.beginPath(); ctx.moveTo(x + dx, y); ctx.lineTo(x + dx - direction * 12, y - 7); ctx.lineTo(x + dx - direction * 12, y + 7); ctx.closePath(); ctx.fill();
}

function drawText(text, x, y) {
  ctx.fillStyle = "#a9b7ca"; ctx.font = "14px system-ui"; ctx.textAlign = "left"; ctx.fillText(text, x, y);
}

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    activeTopic = button.dataset.topic;
    values = Object.fromEntries(topics[activeTopic].controls.map((c) => [c.id, c.value]));
    simTime = 0;
    renderControls();
  });
});

$("#toggle-play-btn")?.addEventListener("click", (event) => {
  isPlaying = !isPlaying;
  event.target.textContent = isPlaying ? "Pause" : "Play";
});

$("#reset-sim-btn")?.addEventListener("click", () => {
  startPlaying(true);
});

$("#download-model-btn").addEventListener("click", async () => {
  const button = $("#download-model-btn");
  const status = $("#inference-status");
  const progress = $("#download-status");
  const answer = $("#answer");

  if (!firebaseReady || firebaseSetupError) {
    answer.textContent = "Configure Firebase first. Add your Firebase Web App settings and App Check configuration to .env.";
    status.textContent = "Firebase setup required";
    return;
  }

  button.disabled = true;
  button.textContent = "Preparing model…";
  status.textContent = "Downloading / preparing on-device model";
  progress.textContent = "Starting…";
  answer.textContent = "Chrome is preparing the local model. The first download may take several minutes. Keep this tab open.";

  try {
    const ready = await prepareHybridModel((percent) => {
      progress.textContent = `Download progress: ${percent}%`;
    });
    if (ready) {
      status.textContent = "ON-DEVICE MODEL READY";
      progress.textContent = "Ready for local inference";
      answer.textContent = "The on-device model has finished initialising. Ask a physics question to test it. The app will still retain Firebase cloud fallback.";
    } else {
      status.textContent = "ON-DEVICE MODEL UNAVAILABLE";
      progress.textContent = "Cloud fallback remains enabled";
      answer.textContent = "Chrome could not prepare the on-device model on this device or browser. You can still test Firebase cloud inference. Use supported desktop Chrome and check the model requirements.";
    }
  } catch (error) {
    console.error(error);
    status.textContent = "Model preparation failed";
    progress.textContent = "";
    answer.textContent = `Could not prepare the on-device model: ${error.message}`;
  } finally {
    button.disabled = false;
    button.textContent = "Prepare on-device model again";
  }
});

$("#ask-btn").addEventListener("click", async () => {
  const button = $("#ask-btn");
  const question = $("#question").value.trim();
  const answer = $("#answer");
  const status = $("#inference-status");
  const progress = $("#download-status");
  if (!question) {
    answer.textContent = "Type a physics question first.";
    return;
  }
  button.disabled = true;
  button.textContent = "Thinking…";
  answer.textContent = "Preparing the AI model and generating an explanation…";
  status.textContent = "Preparing hybrid inference";
  progress.textContent = "";
  try {
    const context = calculate(activeTopic, values, getExtraState()).context;
    const result = await askPhysics(question, context, (percent) => {
      progress.textContent = `On-device model: ${percent}%`;
    });
    answer.innerHTML = formatBasicText(result.text);
    renderPhysicsMath(answer);
    status.textContent = result.source === "ON_DEVICE"
      ? "Inference: ON-DEVICE"
      : result.source === "IN_CLOUD" ? "Inference: FIREBASE CLOUD" : "Inference completed; source unavailable";
    progress.textContent = "";
  } catch (error) {
    console.error(error);
    answer.textContent = `AI request failed: ${error.message}`;
    status.textContent = "Inference failed";
    progress.textContent = "";
  } finally {
    button.disabled = false;
    button.innerHTML = 'Ask AI Scientist <span>→</span>';
  }
});

if (firebaseReady && !firebaseSetupError) {
  $("#firebase-status").textContent = "Firebase configured";
  $("#firebase-status").classList.add("configured");
} else {
  $("#firebase-status").textContent = "Firebase setup required";
  $("#firebase-status").classList.add("warning");
}

renderControls();
requestAnimationFrame(stepAnimation);