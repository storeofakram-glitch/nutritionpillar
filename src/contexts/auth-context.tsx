
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      
      const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',');
      if (user && user.email && adminEmails.includes(user.email)) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const signIn = async (email: string, password: string) => {
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',');
    if (!adminEmails.includes(email)) {
        throw new Error("You are not authorized to access this page.");
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  // While loading, show a blank page or a loader
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
