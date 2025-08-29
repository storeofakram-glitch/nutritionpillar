"use client";

import { useEffect } from 'react';
import { analytics } from '@/lib/firebase';

export default function FirebaseProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // This effect will run on the client side, after the component mounts.
    // It resolves the 'analytics' promise and initializes it if supported.
    analytics.then(instance => {
      if (instance) {
        console.log("Firebase Analytics initialized");
      }
    });
  }, []);

  return <>{children}</>;
}
