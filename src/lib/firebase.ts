// src/lib/firebase.ts

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration pulled from environment variables.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// This function checks if all the necessary Firebase config values are present.
function isFirebaseConfigValid(config: typeof firebaseConfig): boolean {
    return Object.values(config).every(value => value);
}

// Initialize Firebase App
let app: FirebaseApp;
let db;
let auth;
let analytics;

if (typeof window !== 'undefined') {
    if (getApps().length === 0) {
        if (isFirebaseConfigValid(firebaseConfig)) {
            app = initializeApp(firebaseConfig);
        } else {
            console.error("Firebase config is missing one or more required values. App cannot be initialized.");
            // We create a dummy app to prevent the app from crashing.
            // Firebase services will not work.
            app = initializeApp({ apiKey: "dummy-key-to-avoid-crash" });
        }
    } else {
        app = getApp();
    }

    db = getFirestore(app);
    auth = getAuth(app);
    
    isSupported().then(yes => {
      if (yes) {
        analytics = getAnalytics(app);
      }
    });
}

export { app as firebaseApp, db, auth, analytics };
