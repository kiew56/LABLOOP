export function drawTopicLab(ctx, canvas, { topic, values, calc, simTime, extra = {} }) {
  const w = canvas.width;
  const h = canvas.height;

  if (topic === "doppler") {
    drawDopplerStage(ctx, w, h, values, calc, simTime);
    return;
  }

  if (topic === "circuits") {
    drawCircuitStage(ctx, w, h, values, calc, simTime);
    return;
  }

  if (topic === "electrostatics") {
    drawElectrostaticsStage(ctx, w, h, values, calc, simTime, Boolean(extra.showField));
    return;
  }

  if (topic === "photoelectric") {
    drawPhotoelectricStage(ctx, w, h, values, calc, simTime);
    return;
  }

  if (extra.workSection === "curved") {
    drawCurvedSlopeStage(ctx, w, h, values, calc, simTime);
  } else if (extra.workSection === "incline") {
    drawTriangularInclineStage(ctx, w, h, values, calc, simTime);
  } else {
    drawHorizontalWorkStage(ctx, w, h, values, calc, simTime);
  }
}

function drawDopplerStage(ctx, w, h, values, calc, simTime) {
  const sourceX = 180 + ((simTime * values.vs * 1.6) % (w - 300));
  const cy = h * 0.56;

  for (let i = 0; i < 7; i++) {
    const age = (simTime * 1.6 + i * 0.24) % 1.6;
    const radius = age * 95;
    const emitX = sourceX - age * values.vs * 0.7;
    ctx.strokeStyle = i % 2 === 0 ? "rgba(94, 234, 212, 0.55)" : "rgba(139, 156, 255, 0.45)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(emitX, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "#5eead4";
  ctx.beginPath();
  ctx.arc(sourceX, cy, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e8eef8";
  ctx.font = "12px 'DM Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("Source", sourceX, cy + 26);

  const listenerX = w - 105;
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.arc(listenerX, cy, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillText("Listener", listenerX, cy + 26);

  ctx.textAlign = "left";
  ctx.fillStyle = "#cbd5e1";
  ctx.fillText(`f_approach = ${calc.raw.fApproach.toFixed(1)} Hz · f_recede = ${calc.raw.fRecede.toFixed(1)} Hz`, 24, 30);
}

function drawCircuitStage(ctx, w, h, values, calc, simTime) {
  const left = 110;
  const right = w - 130;
  const top = 62;
  const bot = h - 46;
  const hgt = bot - top;

  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(left, top, right - left, hgt);

  // Battery symbol on left
  ctx.fillStyle = "#172438";
  ctx.fillRect(left - 28, top + hgt * 0.35, 56, 46);
  ctx.strokeStyle = "#5eead4";
  ctx.strokeRect(left - 28, top + hgt * 0.35, 56, 46);

  // Draw active resistors in series or parallel branches
  const count = calc.raw.count;
  if (calc.raw.connection === "parallel" && count > 1) {
    const branchBaseX = right;
    for (let i = 0; i < count; i++) {
      const bx = branchBaseX + i * 26;
      ctx.strokeStyle = "#8b9cff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(branchBaseX, top + 20);
      ctx.lineTo(bx, top + 20);
      ctx.lineTo(bx, bot - 20);
      ctx.lineTo(branchBaseX, bot - 20);
      ctx.stroke();

      ctx.fillStyle = "#1e293b";
      ctx.fillRect(bx - 10, (top + bot) / 2 - 14, 20, 28);
      ctx.strokeRect(bx - 10, (top + bot) / 2 - 14, 20, 28);
    }
  } else {
    for (let i = 0; i < count; i++) {
      const ry = top + 24 + ((i + 0.5) * (hgt - 48)) / count;
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(right - 14, ry - 11, 28, 22);
      ctx.strokeStyle = "#8b9cff";
      ctx.strokeRect(right - 14, ry - 11, 28, 22);
    }
  }

  ctx.fillStyle = "#eaf0f8";
  ctx.font = "12px 'DM Mono', monospace";
  ctx.textAlign = "left";
  ctx.fillText(
    `${calc.raw.connection.toUpperCase()} (${count} × ${values.rExt}Ω) · R_ext=${calc.raw.rNetwork.toFixed(2)}Ω · I=${calc.raw.current.toFixed(2)}A · V=${calc.raw.terminalV.toFixed(1)}V`,
    24,
    30
  );

  // Animated current dots
  const perimeter = 2 * ((right - left) + hgt);
  const speed = Math.max(18, calc.raw.current * 55);
  const topLen = right - left;
  const rightLen = hgt;
  const botLen = right - left;

  for (let d = 0; d < 12; d++) {
    const dist = (simTime * speed + (d * perimeter) / 12) % perimeter;
    let px = left;
    let py = top;
    if (dist < topLen) {
      px = left + dist;
      py = top;
    } else if (dist < topLen + rightLen) {
      px = right;
      py = top + (dist - topLen);
    } else if (dist < topLen + rightLen + botLen) {
      px = right - (dist - topLen - rightLen);
      py = bot;
    } else {
      px = left;
      py = bot - (dist - topLen - rightLen - botLen);
    }
    ctx.fillStyle = "#5eead4";
    ctx.beginPath();
    ctx.arc(px, py, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFieldArrow(ctx, x, y, angle, color = "#5eead4") {
  const size = 7;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(size, 0);
  ctx.lineTo(-size, -size * 0.65);
  ctx.lineTo(-size, size * 0.65);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawElectrostaticsStage(ctx, w, h, values, calc, simTime, showField) {
  const cy = h * 0.56;
  const spread = 110 + values.r * 22;
  const x1 = w / 2 - spread / 2;
  const x2 = w / 2 + spread / 2;
  const sameSign = values.q1 * values.q2 > 0;
  const oppositeSign = values.q1 * values.q2 < 0;

  if (showField) {
    ctx.strokeStyle = "rgba(139, 156, 255, 0.65)";
    ctx.lineWidth = 1.5;

    if (oppositeSign) {
      for (let k = -3; k <= 3; k++) {
        const bow = k * 28;
        ctx.beginPath();
        ctx.moveTo(x1, cy);
        ctx.bezierCurveTo(x1 + spread * 0.25, cy - bow, x2 - spread * 0.25, cy - bow, x2, cy);
        ctx.stroke();

        const midX = (x1 + x2) / 2;
        const midY = cy - bow * 0.75;
        const dir = values.q1 > 0 ? 0 : Math.PI;
        drawFieldArrow(ctx, midX, midY, dir, "#5eead4");
      }
    } else if (sameSign) {
      for (let k = -3; k <= 3; k++) {
        const bend = k * 24;
        ctx.beginPath();
        ctx.moveTo(x1, cy);
        ctx.quadraticCurveTo(x1 + spread * 0.35, cy - bend, x1 + spread * 0.45, cy - bend * 1.4);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x2, cy);
        ctx.quadraticCurveTo(x2 - spread * 0.35, cy - bend, x2 - spread * 0.45, cy - bend * 1.4);
        ctx.stroke();

        const dir1 = values.q1 > 0 ? -bend * 0.02 : Math.PI - bend * 0.02;
        const dir2 = values.q2 > 0 ? Math.PI + bend * 0.02 : bend * 0.02;
        drawFieldArrow(ctx, x1 + 42, cy - bend * 0.6, dir1, "#5eead4");
        drawFieldArrow(ctx, x2 - 42, cy - bend * 0.6, dir2, "#5eead4");
      }
    }

    for (let a = 0; a < 8; a++) {
      const ang = (a * Math.PI) / 4;
      const r1 = values.q1 >= 0 ? 1 : -1;
      const r2 = values.q2 >= 0 ? 1 : -1;

      ctx.beginPath();
      ctx.moveTo(x1 + Math.cos(ang) * 22, cy + Math.sin(ang) * 22);
      ctx.lineTo(x1 + Math.cos(ang) * 58, cy + Math.sin(ang) * 58);
      ctx.stroke();
      drawFieldArrow(ctx, x1 + Math.cos(ang) * 44, cy + Math.sin(ang) * 44, r1 > 0 ? ang : ang + Math.PI, "#5eead4");

      ctx.beginPath();
      ctx.moveTo(x2 + Math.cos(ang) * 22, cy + Math.sin(ang) * 22);
      ctx.lineTo(x2 + Math.cos(ang) * 58, cy + Math.sin(ang) * 58);
      ctx.stroke();
      drawFieldArrow(ctx, x2 + Math.cos(ang) * 44, cy + Math.sin(ang) * 44, r2 > 0 ? ang : ang + Math.PI, "#5eead4");
    }
  }

  ctx.fillStyle = values.q1 >= 0 ? "#ef4444" : "#3b82f6";
  ctx.beginPath();
  ctx.arc(x1, cy, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = values.q2 >= 0 ? "#ef4444" : "#3b82f6";
  ctx.beginPath();
  ctx.arc(x2, cy, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f8fafc";
  ctx.font = "12px 'DM Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(`Q1 ${values.q1 >= 0 ? "+" : ""}${values.q1}µC`, x1, cy + 4);
  ctx.fillText(`Q2 ${values.q2 >= 0 ? "+" : ""}${values.q2}µC`, x2, cy + 4);

  const attract = values.q1 * values.q2 < 0;
  const pulse = Math.sin(simTime * 4) * 5;
  ctx.strokeStyle = attract ? "#5eead4" : "#f59e0b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1 + 24, cy - 32);
  ctx.lineTo(x1 + 24 + (attract ? 28 + pulse : -20 - pulse), cy - 32);
  ctx.stroke();

  ctx.fillStyle = "#e2e8f0";
  ctx.fillText(
    `${calc.raw.force.toFixed(2)} N (${attract ? "Attract" : "Repel"})${showField ? " · Electric Field Shown" : ""}`,
    w / 2,
    28
  );
}

function drawPhotoelectricStage(ctx, w, h, values, calc, simTime) {
  const plateX = w * 0.45;
  const top = 36;
  const hgt = h - 64;

  ctx.fillStyle = "#475569";
  ctx.fillRect(plateX, top, 14, hgt);

  const photonCount = Math.max(2, Math.round(values.intensity / 20));
  for (let i = 0; i < photonCount; i++) {
    const progress = (simTime * 1.2 + i * 0.22) % 1;
    const px = 45 + progress * (plateX - 55);
    const py = top + 24 + ((i * 36) % Math.max(36, hgt - 36));
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px - 8, py - 4);
    ctx.lineTo(px, py + 4);
    ctx.lineTo(px + 8, py - 4);
    ctx.stroke();
  }

  if (calc.raw.emitted) {
    for (let e = 0; e < photonCount; e++) {
      const progress = (simTime * 1.4 + e * 0.25) % 1;
      const ex = plateX + 20 + progress * (w - plateX - 55);
      const ey = top + 28 + ((e * 34) % Math.max(36, hgt - 36));
      ctx.fillStyle = "#5eead4";
      ctx.beginPath();
      ctx.arc(ex, ey, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = "#f87171";
    ctx.font = "12px 'DM Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("hf ≤ W0: No electrons emitted", plateX + 28, h * 0.5);
  }
}

function drawHorizontalWorkStage(ctx, w, h, values, calc, simTime) {
  const trackY = h - 65;
  const startX = 60;
  const maxTravelPx = w - 160;

  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(36, trackY);
  ctx.lineTo(w - 36, trackY);
  ctx.stroke();

  const a = calc.raw.acceleration;
  const distMeters = Math.min(values.distance, 0.5 * a * simTime * simTime);
  const progress = values.distance > 0 ? distMeters / values.distance : 0;
  const bx = startX + progress * maxTravelPx;

  ctx.fillStyle = "#5eead4";
  ctx.fillRect(bx, trackY - 32, 38, 32);

  if (values.force > 0) {
    const fLen = Math.min(90, values.force * 1.4);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bx + 38, trackY - 16);
    ctx.lineTo(bx + 38 + fLen, trackY - 16);
    ctx.stroke();
  }

  if (values.friction > 0) {
    const frLen = Math.min(70, values.friction * 1.4);
    ctx.strokeStyle = "#f87171";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bx, trackY - 8);
    ctx.lineTo(bx - frLen, trackY - 8);
    ctx.stroke();
  }

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "12px 'DM Mono', monospace";
  ctx.textAlign = "left";
  const status = a <= 0
    ? "Stationary (F ≤ f)"
    : progress >= 1
      ? `Finished Δx=${values.distance}m · v=${calc.raw.finalSpeed.toFixed(2)}m/s`
      : `Moving · a=${a.toFixed(2)}m/s² · s=${distMeters.toFixed(1)}m`;

  ctx.fillText(`Horizontal Track · ${status} · Wnet=${calc.raw.netWork.toFixed(1)}J`, 24, 30);
}

function drawCurvedSlopeStage(ctx, w, h, values, calc, simTime) {
  const trackYAt = (t) => {
    const dip = Math.sin(t * Math.PI);
    const rise = Math.pow(Math.max(0, t - 0.55), 1.6) * 140;
    return 72 + dip * (h - 135) - rise;
  };

  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 70; i++) {
    const t = i / 70;
    const sx = 64 + t * (w - 128);
    const sy = trackYAt(t);
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.stroke();

  const gpe = values.mass * 9.8 * values.distance;
  const maxReachRatio = gpe > 0 ? Math.max(0, Math.min(1, calc.raw.netWork / gpe)) : 0;
  const maxU = maxReachRatio > 0 ? 0.5 + 0.5 * maxReachRatio : 0;

  const a = calc.raw.acceleration;
  const distMeters = Math.min(values.distance, 0.5 * a * simTime * simTime);
  const rawProgress = values.distance > 0 ? distMeters / values.distance : 0;
  const u = rawProgress * maxU;

  const px = 64 + u * (w - 128);
  const py = trackYAt(u);

  ctx.fillStyle = "#5eead4";
  ctx.beginPath();
  ctx.arc(px, py - 11, 11, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "12px 'DM Mono', monospace";
  ctx.textAlign = "left";
  ctx.fillText(
    `Curved Slope · GPE=${gpe.toFixed(1)}J · W_friction=${calc.raw.frictionWork.toFixed(1)}J · v_max=${calc.raw.finalSpeed.toFixed(2)}m/s`,
    24,
    30
  );
}

function drawTriangularInclineStage(ctx, w, h, values, calc, simTime) {
  const rad = ((values.angle || 30) * Math.PI) / 180;
  const baseY = h - 42;
  const leftX = 95;
  const maxBaseW = 360;
  const maxHeightH = 195;

  let triW = maxBaseW;
  let triH = triW * Math.tan(rad);
  if (triH > maxHeightH) {
    triH = maxHeightH;
    triW = triH / Math.tan(rad);
  }

  const topX = leftX;
  const topY = baseY - triH;
  const rightX = leftX + triW;
  const rightY = baseY;

  ctx.fillStyle = "rgba(148, 163, 184, 0.14)";
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(leftX, baseY);
  ctx.lineTo(topX, topY);
  ctx.lineTo(rightX, rightY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeRect(leftX, baseY - 14, 14, 14);
  ctx.beginPath();
  ctx.arc(rightX, rightY, 28, Math.PI, Math.PI + rad);
  ctx.stroke();
  ctx.fillStyle = "#cbd5e1";
  ctx.font = "12px 'DM Mono', monospace";
  ctx.fillText(`${values.angle}°`, rightX - 54, rightY - 8);

  const a = calc.raw.acceleration;
  const distMeters = Math.min(values.distance, 0.5 * a * simTime * simTime);
  const progress = values.distance > 0 ? distMeters / values.distance : 0;

  const hypLen = Math.hypot(triW, triH);
  const boxW = 34;
  const boxH = 24;
  const travelPx = progress * Math.max(0, hypLen - boxW);

  const bx = topX + (travelPx + boxW / 2) * Math.cos(rad);
  const by = topY + (travelPx + boxW / 2) * Math.sin(rad);

  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(rad);

  ctx.fillStyle = "#5eead4";
  ctx.fillRect(-boxW / 2, -boxH, boxW, boxH);

  const fgParLen = Math.min(75, calc.raw.drivingForce * 1.1);
  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(boxW / 2, -boxH / 2);
  ctx.lineTo(boxW / 2 + fgParLen, -boxH / 2);
  ctx.stroke();

  if (values.friction > 0) {
    const frLen = Math.min(65, values.friction * 1.1);
    ctx.strokeStyle = "#f87171";
    ctx.beginPath();
    ctx.moveTo(-boxW / 2, -boxH / 2);
    ctx.lineTo(-boxW / 2 - frLen, -boxH / 2);
    ctx.stroke();
  }
  ctx.restore();

  const blockCenterX = bx + (boxH / 2) * Math.sin(rad);
  const blockCenterY = by - (boxH / 2) * Math.cos(rad);
  ctx.strokeStyle = "#8b9cff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(blockCenterX, blockCenterY);
  ctx.lineTo(blockCenterX, blockCenterY + 38);
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#cbd5e1";
  const status = a <= 0
    ? "Static (Fg∥ ≤ f)"
    : `a=${a.toFixed(2)}m/s² · v=${calc.raw.finalSpeed.toFixed(2)}m/s`;
  ctx.fillText(
    `Triangular Incline · Fg∥=${calc.raw.drivingForce.toFixed(1)}N · f=${values.friction}N · ${status}`,
    24,
    28
  );
}