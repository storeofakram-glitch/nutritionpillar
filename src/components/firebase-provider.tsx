
"use client";

import { useEffect } from 'react';
import { analytics } from '@/lib/firebase';

export default function FirebaseProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // This effect will run on the client side, after the component mounts.
    // It checks if the analytics instance was successfully initialized.
    if (analytics) {
      console.log("Firebase Analytics initialized");
    }
  }, []);

  return <>{children}</>;
}
