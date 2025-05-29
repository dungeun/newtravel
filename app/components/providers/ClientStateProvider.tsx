'use client';

import React, { PropsWithChildren, useEffect } from 'react';
import { useUserStore } from '@/lib/store/userStore';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * ClientStateProvider handles client-side state management
 * and synchronizes Firebase auth state with Zustand store
 */
export default function ClientStateProvider({ children }: PropsWithChildren) {
  const { setUser, setLoading } = useUserStore();
  
  // Sync Firebase auth state with Zustand store
  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setUser(firebaseUser);
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [setUser, setLoading]);
  
  return <>{children}</>;
} 