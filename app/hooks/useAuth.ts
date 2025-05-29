'use client';

import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getUserRole } from '../firebase/auth';
import { firebaseAuth } from '../firebase/auth';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';

// Firebase User 정보를 확장한 타입
export interface UserInfo extends Partial<User> {
  id?: string;
  role?: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

interface AuthHook {
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<UserCredential>;
  signup: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
}

export function useAuth(): AuthHook {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    // NextAuth 세션이 있으면 해당 정보 사용
    if (session?.user) {
      // 세션 사용자 정보를 UserInfo 타입으로 변환
      const nextAuthUser: UserInfo = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        role: session.user.role || 'user'
      };
      
      setUser(nextAuthUser);
      setLoading(false);
      return;
    }

    // 세션이 없으면 Firebase Auth 사용
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        try {
          // Firestore에서 사용자 역할 정보 가져오기
          const userDoc = await getDoc(doc(db, 'users', authUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              ...authUser,
              role: userData.role || 'user',
            } as UserInfo);
          } else {
            setUser({
              ...authUser,
              role: 'user',
            } as UserInfo);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser({
            ...authUser,
            role: 'user',
          } as UserInfo);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [session]);

  // 로그인 함수
  const login = async (email: string, password: string): Promise<UserCredential> => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 함수
  const signup = async (email: string, password: string): Promise<UserCredential> => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃 함수
  const logout = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout
  };
} 