export const topics = {
  momentum: {
    title: "Collision lab (1D Momentum)",
    presets: [
      { label: "Head-on stick", values: { m1: 3, v1: 5, m2: 5, v2: -2 } },
      { label: "Chase & stick", values: { m1: 6, v1: 6, m2: 2, v2: 2 } }
    ],
    controls: [
      { id: "m1", label: "Mass A", min: 1, max: 10, step: 1, value: 3, unit: "kg" },
      { id: "v1", label: "Velocity A", min: -8, max: 8, step: 1, value: 5, unit: "m/s" },
      { id: "m2", label: "Mass B", min: 1, max: 10, step: 1, value: 5, unit: "kg" },
      { id: "v2", label: "Velocity B", min: -8, max: 8, step: 1, value: -1, unit: "m/s" }
    ]
  },
  projectile: {
    title: "Projectile motion (g = 9.8 m/s²)",
    presets: [
      { label: "45° Max range", values: { speed: 20, angle: 45, h1: 0, h2: 15, v2: 0 } },
      { label: "Vertical up (Ball 1)", values: { speed: 18, angle: 90, h1: 0, h2: 20, v2: 0 } }
    ],
    controls: [
      { id: "speed", label: "Initial speed (Ball 1)", min: 5, max: 30, step: 1, value: 20, unit: "m/s" },
      { id: "angle", label: "Launch angle (Ball 1)", min: 10, max: 90, step: 1, value: 45, unit: "°" },
      { id: "h1", label: "Release height 1", min: 0, max: 25, step: 1, value: 0, unit: "m" },
      { id: "h2", label: "Drop height 2 (Ball 2)", min: 0, max: 30, step: 1, value: 15, unit: "m" },
      { id: "v2", label: "Initial vel 2 (+up / -down)", min: -15, max: 15, step: 1, value: 0, unit: "m/s" }
    ]
  },
  newton: {
    title: "Newton's second law (Fnet = ma)",
    presets: [
      { label: "Force too small (friction)", values: { force: 8, mass: 5, friction: 12 } },
      { label: "Steady acceleration", values: { force: 25, mass: 5, friction: 5 } }
    ],
    controls: [
      { id: "force", label: "Applied force", min: 0, max: 60, step: 1, value: 20, unit: "N" },
      { id: "mass", label: "Mass", min: 1, max: 20, step: 1, value: 5, unit: "kg" },
      { id: "friction", label: "Max friction force", min: 0, max: 30, step: 1, value: 5, unit: "N" }
    ]
  },
  workEnergy: {
    title: "Work, Energy & Power",
    controls: [
      { id: "force", label: "Applied force (F)", min: 0, max: 60, step: 1, value: 30, unit: "N" },
      { id: "friction", label: "Friction force (f)", min: 0, max: 30, step: 1, value: 6, unit: "N" },
      { id: "distance", label: "Distance / height (Δx)", min: 2, max: 20, step: 1, value: 10, unit: "m" },
      { id: "mass", label: "Mass (m)", min: 1, max: 15, step: 1, value: 4, unit: "kg" },
      { id: "angle", label: "Slope angle (θ - Incline)", min: 10, max: 60, step: 1, value: 30, unit: "°" }
    ]
  },
  doppler: {
    title: "Doppler Effect Lab",
    controls: [
      { id: "freq", label: "Source frequency (fs)", min: 100, max: 800, step: 10, value: 400, unit: "Hz" },
      { id: "vs", label: "Source speed (vs)", min: 0, max: 60, step: 2, value: 20, unit: "m/s" },
      { id: "vl", label: "Listener speed (vl)", min: 0, max: 50, step: 2, value: 0, unit: "m/s" },
      { id: "vSound", label: "Wave speed (v)", min: 300, max: 360, step: 2, value: 340, unit: "m/s" }
    ]
  },
  electrostatics: {
    title: "Electrostatics (Coulomb's Law)",
    controls: [
      { id: "q1", label: "Charge Q1", min: -9, max: 9, step: 1, value: 4, unit: "µC" },
      { id: "q2", label: "Charge Q2", min: -9, max: 9, step: 1, value: -3, unit: "µC" },
      { id: "r", label: "Distance r", min: 1, max: 10, step: 1, value: 3, unit: "m" }
    ]
  },
  circuits: {
    title: "Electric Circuits (EMF & Internal r)",
    controls: [
      { id: "emf", label: "EMF (ε)", min: 3, max: 24, step: 1, value: 12, unit: "V" },
      { id: "rInt", label: "Internal resistance (r)", min: 0, max: 5, step: 0.5, value: 1, unit: "Ω" },
      { id: "rExt", label: "Resistor value (R)", min: 1, max: 20, step: 1, value: 6, unit: "Ω" }
    ]
  },
  photoelectric: {
    title: "Photoelectric Effect (E = hf)",
    controls: [
      { id: "freq", label: "Frequency (f)", min: 2, max: 20, step: 0.5, value: 10, unit: "×10¹⁴ Hz" },
      { id: "w0", label: "Work function (W0)", min: 1, max: 8, step: 0.5, value: 3, unit: "×10⁻¹⁹ J" },
      { id: "intensity", label: "Intensity", min: 10, max: 100, step: 10, value: 50, unit: "%" }
    ]
  }
};

export function calculate(topic, values, extra = {}) {
  const g = 9.8;

  if (topic === "momentum") {
    const p1 = values.m1 * values.v1;
    const p2 = values.m2 * values.v2;
    const totalP = p1 + p2;
    const finalV = totalP / (values.m1 + values.m2);
    return {
      raw: { p1, p2, totalP, finalV },
      metrics: [
        ["Initial momentum A", `${p1.toFixed(1)} kg·m/s`],
        ["Initial momentum B", `${p2.toFixed(1)} kg·m/s`],
        ["Total momentum", `${totalP.toFixed(1)} kg·m/s`],
        ["Shared velocity*", `${finalV.toFixed(2)} m/s`]
      ],
      context: `1D momentum collision. mA=${values.m1} kg, uA=${values.v1} m/s, mB=${values.m2} kg, uB=${values.v2} m/s. Total momentum=${totalP.toFixed(2)} kg·m/s, shared velocity=${finalV.toFixed(2)} m/s.`
    };
  }

  if (topic === "projectile") {
    const rad = (values.angle * Math.PI) / 180;
    const vx = values.speed * Math.cos(rad);
    const vy = values.speed * Math.sin(rad);
    const disc = vy * vy + 2 * g * values.h1;
    const flightTime = (vy + Math.sqrt(disc)) / g;
    const maxHeight = values.h1 + (vy * vy) / (2 * g);
    const range = vx * flightTime;
    const tFall2 = Math.sqrt((2 * Math.max(0, values.h2)) / g);
    return {
      raw: { vx, vy, flightTime, maxHeight, range, tFall2 },
      metrics: [
        ["vx / vy (Ball 1)", `${vx.toFixed(1)} / ${vy.toFixed(1)} m/s`],
        ["Max height (Ball 1)", `${maxHeight.toFixed(2)} m`],
        ["Flight time (Ball 1)", `${flightTime.toFixed(2)} s`],
        ["Horizontal range", `${range.toFixed(2)} m`],
        ["Free-fall time (Ball 2)", `${tFall2.toFixed(2)} s`]
      ],
      context: `Projectile motion with g=9.8 m/s². Ball 1: speed=${values.speed} m/s, angle=${values.angle}°, h1=${values.h1} m, max height=${maxHeight.toFixed(2)} m, flight time=${flightTime.toFixed(2)} s, range=${range.toFixed(2)} m. Ball 2 drop from h2=${values.h2} m, v2=${values.v2} m/s.`
    };
  }

  if (topic === "newton") {
    const moving = values.force > values.friction;
    const netForce = moving ? values.force - values.friction : 0;
    const acceleration = netForce / values.mass;
    return {
      raw: { moving, netForce, acceleration },
      metrics: [
        ["Applied force", `${values.force.toFixed(1)} N`],
        ["Friction force", `${values.friction.toFixed(1)} N`],
        ["Net force (Fnet)", `${netForce.toFixed(1)} N`],
        ["Acceleration", `${acceleration.toFixed(2)} m/s²`]
      ],
      context: moving
        ? `Newton's second law: F_applied=${values.force} N, f=${values.friction} N, Fnet=${netForce.toFixed(1)} N, mass=${values.mass} kg, a=${acceleration.toFixed(2)} m/s².`
        : `Force too small: Applied force (${values.force} N) does not overcome friction (${values.friction} N), so Fnet = 0 N and acceleration = 0 m/s² (block stays at rest).`
    };
  }

  if (topic === "workEnergy") {
    const mode = extra.workSection || "horizontal";
    const rad = ((values.angle || 30) * Math.PI) / 180;

    let drivingForce = 0;
    let netForce = 0;
    let netWork = 0;
    let frictionWork = 0;
    let modeLabel = "Horizontal Track";

    if (mode === "horizontal") {
      modeLabel = "Horizontal Track";
      drivingForce = values.force;
      netForce = Math.max(0, drivingForce - values.friction);
      frictionWork = Math.min(drivingForce, values.friction) * values.distance;
      netWork = netForce * values.distance;
    } else if (mode === "curved") {
      modeLabel = "Curved Track (GPE ↔ KE)";
      const gpe = values.mass * g * values.distance;
      frictionWork = values.friction * values.distance;
      netWork = Math.max(0, gpe - frictionWork);
      netForce = netWork / values.distance;
    } else if (mode === "incline") {
      modeLabel = `Inclined Slope (${values.angle}°)`;
      const fgParallel = values.mass * g * Math.sin(rad);
      drivingForce = fgParallel;
      netForce = Math.max(0, fgParallel - values.friction);
      frictionWork = Math.min(fgParallel, values.friction) * values.distance;
      netWork = netForce * values.distance;
    }

    const acceleration = netForce / values.mass;
    const finalSpeed = Math.sqrt((2 * netWork) / values.mass);
    const travelTime = acceleration > 0 ? Math.sqrt((2 * values.distance) / acceleration) : 0;
    const power = travelTime > 0 ? netWork / travelTime : 0;

    return {
      raw: {
        mode,
        drivingForce,
        netForce,
        acceleration,
        netWork,
        frictionWork,
        power,
        finalSpeed,
        travelTime
      },
      metrics: [
        ["Mode", modeLabel],
        ["Net Force / Accel", `${netForce.toFixed(1)} N · ${acceleration.toFixed(2)} m/s²`],
        ["Work by Friction", `${frictionWork.toFixed(1)} J`],
        ["Net Work / Power", `${netWork.toFixed(1)} J · ${power.toFixed(1)} W`]
      ],
      context: `Work-Energy-Power (${modeLabel}): F_drive=${drivingForce.toFixed(1)} N, friction f=${values.friction} N, Fnet=${netForce.toFixed(1)} N, a=${acceleration.toFixed(2)} m/s², Δx=${values.distance} m, m=${values.mass} kg, W_net=${netWork.toFixed(1)} J, v_final=${finalSpeed.toFixed(2)} m/s, power=${power.toFixed(1)} W.`
    };
  }

  if (topic === "doppler") {
    const v = values.vSound;
    const vs = Math.min(values.vs, v - 10);
    const vl = values.vl;
    const fApproach = values.freq * (v / (v - vs));
    const fRecede = values.freq * (v / (v + vs));

    return {
      raw: { fApproach, fRecede },
      metrics: [
        ["Approaching freq", `${fApproach.toFixed(1)} Hz`],
        ["Receding freq", `${fRecede.toFixed(1)} Hz`],
        ["Source freq (fs)", `${values.freq.toFixed(0)} Hz`]
      ],
      context: `Doppler effect: fs=${values.freq} Hz, vs=${vs} m/s, vl=${vl} m/s, v=${v} m/s, f_approach=${fApproach.toFixed(1)} Hz, f_recede=${fRecede.toFixed(1)} Hz.`
    };
  }

  if (topic === "electrostatics") {
    const k = 8.99e9;
    const force = (k * Math.abs(values.q1 * 1e-6 * (values.q2 * 1e-6))) / (values.r * values.r);
    const nature = values.q1 * values.q2 < 0 ? "Attractive" : "Repulsive";
    return {
      raw: { force, showField: Boolean(extra.showField) },
      metrics: [
        ["Force magnitude", `${force.toFixed(2)} N`],
        ["Interaction", nature],
        ["Separation r", `${values.r} m`],
        ["Electric field", extra.showField ? "Shown" : "Hidden"]
      ],
      context: `Electrostatics: Q1=${values.q1} µC, Q2=${values.q2} µC, r=${values.r} m, F=${force.toFixed(2)} N (${nature}), electricField=${extra.showField ? "shown" : "hidden"}.`
    };
  }

  if (topic === "circuits") {
    const count = Math.max(1, extra.resistorCount || 1);
    const connection = extra.connection === "parallel" ? "parallel" : "series";
    const rNetwork = connection === "parallel"
      ? values.rExt / count
      : values.rExt * count;
    const totalR = rNetwork + values.rInt;
    const current = values.emf / totalR;
    const lostVolts = current * values.rInt;
    const terminalV = values.emf - lostVolts;

    return {
      raw: { current, terminalV, lostVolts, rNetwork, count, connection },
      metrics: [
        ["Connection & count", `${connection} (${count})`],
        ["Equivalent R_ext", `${rNetwork.toFixed(2)} Ω`],
        ["Current (I)", `${current.toFixed(2)} A`],
        ["Terminal V / Lost Ir", `${terminalV.toFixed(1)} V / ${lostVolts.toFixed(1)} V`]
      ],
      context: `Circuits: ${count} resistor(s) of ${values.rExt} Ω in ${connection} (R_ext=${rNetwork.toFixed(2)} Ω), EMF=${values.emf} V, r=${values.rInt} Ω, I=${current.toFixed(2)} A, terminal V=${terminalV.toFixed(2)} V, lost volts=${lostVolts.toFixed(2)} V.`
    };
  }

  const h = 6.63e-34;
  const photonE19 = (h * values.freq * 1e14) * 1e19;
  const ekMax19 = Math.max(0, photonE19 - values.w0);
  const emitted = photonE19 > values.w0;
  return {
    raw: { photonE19, ekMax19, emitted },
    metrics: [
      ["Photon E (hf)", `${photonE19.toFixed(2)} ×10⁻¹⁹ J`],
      ["Max Ek (hf - W0)", `${ekMax19.toFixed(2)} ×10⁻¹⁹ J`],
      ["Emission", emitted ? "Electrons emitted" : "Below threshold"]
    ],
    context: `Photoelectric: f=${values.freq}×10¹⁴ Hz, W0=${values.w0}×10⁻¹⁹ J, intensity=${values.intensity}%, E=${photonE19.toFixed(2)}×10⁻¹⁹ J, Ek(max)=${ekMax19.toFixed(2)}×10⁻¹⁹ J.`
  };
}