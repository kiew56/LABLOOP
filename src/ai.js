import { getGenerativeModel, InferenceMode } from "firebase/ai";
import { ai, firebaseReady } from "./firebase.js";

const CLOUD_MODEL = "gemini-3.5-flash-lite";

let deviceModelInstance = null;
let cloudModelInstance = null;
let deviceInitialization = null;

function getDeviceModel() {
  if (!firebaseReady || !ai) {
    throw new Error(
      "Firebase is not configured. Copy .env.example to .env and add your Firebase Web App settings."
    );
  }
  if (!deviceModelInstance) {
    deviceModelInstance = getGenerativeModel(ai, {
      mode: InferenceMode.PREFER_ON_DEVICE,
      inCloudParams: { model: CLOUD_MODEL }
    });
  }
  return deviceModelInstance;
}

function getCloudModel() {
  if (!firebaseReady || !ai) {
    throw new Error(
      "Firebase is not configured. Copy .env.example to .env and add your Firebase Web App settings."
    );
  }
  if (!cloudModelInstance) {
    cloudModelInstance = getGenerativeModel(ai, {
      mode: InferenceMode.PREFER_IN_CLOUD,
      inCloudParams: { model: CLOUD_MODEL }
    });
  }
  return cloudModelInstance;
}

export async function prepareHybridModel(onProgress = () => {}) {
  const model = getDeviceModel();
  if (!deviceInitialization) {
    deviceInitialization = model
      .initializeDeviceModel((progress) => {
        onProgress(Math.round(progress * 100));
      })
      .then(() => true)
      .catch((error) => {
        console.info(
          "On-device model could not be prepared; cloud fallback may still work.",
          error
        );
        deviceInitialization = null;
        return false;
      });
  }
  return await deviceInitialization;
}

export async function askPhysics(question, context = "", onProgress = () => {}) {
  const cleanQuestion = question.trim();
  if (!cleanQuestion) {
    throw new Error("Enter a question first.");
  }

  const wantsCloud =
    cleanQuestion.length > 140 || /practice|question|exam|test/i.test(cleanQuestion);

  let model;
  if (wantsCloud) {
    model = getCloudModel();
  } else {
    model = getDeviceModel();
    await prepareHybridModel(onProgress);
  }

  const prompt = `
You are LABLOOP's AI Physics Scientist, a Physical Sciences tutor.
Use ONLY the simulation values and results given below. Never invent simulation measurements or redo math differently from the given results.
Explain clearly in simple English using proper physics terms, equations, and SI units, and end with one short takeaway.
Wrap all math expressions and equations in $ ... $ (inline) or $$ ... $$ (display) LaTeX delimiters.
If a value needed to answer is missing, tell the learner which slider to adjust.

Current simulation:
${context || "No simulation data supplied."}

Student question:
${cleanQuestion}
`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  const source = result.response.inferenceSource || "UNKNOWN";

  return { text: responseText, source };
}