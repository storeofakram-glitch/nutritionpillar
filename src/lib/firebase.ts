
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyABOooJEwHAMnqjRxAkyYqtgLgAT3NXEl4",
  authDomain: "fitness-pillar-store.firebaseapp.com",
  projectId: "fitness-pillar-store",
  storageBucket: "fitness-pillar-store.firebasestorage.app",
  messagingSenderId: "580338302966",
  appId: "1:580338302966:web:7586fffbc1b08ab5f211d7",
  measurementId: "G-B5DPZBS8E2"
};

// Initialize Firebase
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);

// Initialize Analytics only on the client side
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app as firebaseApp, db, analytics };
