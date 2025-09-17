
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, type User, type Auth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<Auth | null>(null);

  useEffect(() => {
    if (firebaseApp) {
      setAuth(getAuth(firebaseApp));
    }
  }, []);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('=== AUTH DEBUG: onAuthStateChanged triggered ===');
      console.log('User exists:', !!user);
      
      setUser(user);
      setIsAdmin(!!user); // For this app, any authenticated user is an admin
      
      if (user) {
        console.log('User ID:', user.uid);
        console.log('User email:', user.email);
        user.getIdToken().then(token => {
            console.log('Auth token exists:', !!token);
        });
      }
      
      setLoading(false); // Auth state determined, set loading to false.
      console.log('Auth loading state set to false.');
      console.log('============================================');
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error("Auth not initialized");
    await setPersistence(auth, browserSessionPersistence);
    await signInWithEmailAndPassword(auth, email, password);
  };

  const handleSignOut = async () => {
    if (!auth) throw new Error("Auth not initialized");
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signIn, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
