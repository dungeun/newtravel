'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import SignupForm from '@/components/forms/SignupForm';
import { FcGoogle } from 'react-icons/fc';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '@/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signIn } from 'next-auth/react';

export default function SignupPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // 이미 로그인된 경우 홈으로 리디렉션
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Firestore에서 사용자 정보 확인
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      // 사용자 정보가 없는 경우 생성
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName,
          email: user.email,
          image: user.photoURL,
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      // NextAuth로 세션 생성
      await signIn('credentials', {
        redirect: false,
        email: user.email,
        password: 'firebase-google-auth',
        firebaseUid: user.uid
      });

      // 홈페이지로 리디렉션
      router.push('/');
    } catch (error) {
      console.error('Google 회원가입 오류:', error);
    }
  };

  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center">로딩 중...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          회원가입
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          이미 계정이 있으신가요?{' '}
          <Link href="/auth/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
            로그인
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignupForm />
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">또는</span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <FcGoogle className="h-5 w-5" />
            Google 계정으로 회원가입
          </button>
        </div>
      </div>
    </div>
  );
} 