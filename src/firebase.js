import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAI, GoogleAIBackend } from "firebase/ai";

const required = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID"
];


const missing = required.filter((key) => !import.meta.env[key]);
export const firebaseReady = missing.length === 0;
export let firebaseApp = null;
export let ai = null;
export let firebaseSetupError = null;

if (firebaseReady) {
  try {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    firebaseApp = initializeApp(firebaseConfig);

    // Local development only: Firebase prints a debug token in the browser console.
    // Register that token in Firebase Console > App Check > Apps > Manage debug tokens.
    const siteKey = import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY;
    if (!siteKey) {
      throw new Error(
        "Missing VITE_RECAPTCHA_V3_SITE_KEY. Register a reCAPTCHA v3 provider for your Web app in Firebase App Check and add its site key to .env. For localhost testing, set the debug token flag below before initializing App Check."
      );
    }

    // For local development, the debug token overrides real attestation.
    // Firebase prints a token in the browser console; register it in App Check.
    if (import.meta.env.DEV) {
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }

    initializeAppCheck(firebaseApp, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true
    });
    ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });
  } catch (error) {
    firebaseSetupError = error;
    console.error("Firebase initialization failed:", error);
  }
} else {
  firebaseSetupError = new Error(`Missing Firebase settings: ${missing.join(", ")}`);
}
