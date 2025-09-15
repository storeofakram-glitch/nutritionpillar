// src/lib/firebase-admin.ts
import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

if (!getApps().length) {
  initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined,
  });
}

export const adminAuth = getAuth(getApp());
