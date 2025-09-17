// src/lib/firebase.ts

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

function isFirebaseConfigValid(config: typeof firebaseConfig): boolean {
    return Object.values(config).every(value => value);
}

let app: FirebaseApp;
if (getApps().length === 0) {
    if (isFirebaseConfigValid(firebaseConfig)) {
        app = initializeApp(firebaseConfig);
    } else {
        console.error("Firebase config is missing one or more required values. App cannot be initialized.");
        // Create a dummy app to avoid crashing, services will not work
        app = initializeApp({ apiKey: "dummy-key-to-avoid-crash" });
    }
} else {
    app = getApp();
}

const db = getFirestore(app);
const auth = getAuth(app);
let analytics;

if (typeof window !== 'undefined') {
  isSupported().then(yes => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}

// This function can be called from server components to get the db instance
function getDb() {
    return db;
}

export { app as firebaseApp, db, auth, analytics, getDb };
