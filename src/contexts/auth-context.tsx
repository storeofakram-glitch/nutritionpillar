
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
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
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Any authenticated user is considered an admin
        setIsAdmin(true);
        const token = await user.getIdToken();
        // Set a cookie for server-side auth
        document.cookie = `firebaseIdToken=${token}; path=/; max-age=3600`;
      } else {
        setIsAdmin(false);
        // Clear the cookie on logout
        document.cookie = 'firebaseIdToken=; path=/; max-age=-1';
      }
      
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Skeleton className="h-screen w-screen" />
        </div>
    )
  }

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
