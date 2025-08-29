
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
let app: FirebaseApp;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

export const firebaseApp = app;
export const db = getFirestore(app);

export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);
