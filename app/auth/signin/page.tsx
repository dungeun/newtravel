'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import LoginForm from '@/components/forms/LoginForm';
import { auth } from '@/firebase/config';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useState } from 'react';

// useSearchParams를 사용하는 컴포넌트
function SignInContent() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/';
  const { data: session, status } = useSession();

  // 이미 로그인된 경우 리디렉션
  useEffect(() => {
    if (status === 'authenticated') {
      if (session.user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [status, session, router]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Firebase Google 로그인 구현
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // 세션 상태 업데이트를 위해 NextAuth 세션 생성
      await signIn('credentials', {
        redirect: false,
        email: result.user.email,
        // Firebase 인증이 이미 완료되었으므로 특별한 토큰 사용
        password: 'firebase-google-auth',
        firebaseUid: result.user.uid
      });
      
      // 리디렉션
      router.push(callbackUrl);
    } catch (error: any) {
      console.error('Google 로그인 오류:', error);
      setError('Google 로그인 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'));
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center">로딩 중...</div>;
  }

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      
      <LoginForm callbackUrl={callbackUrl} />
      
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
            로그인 상태 유지
          </label>
        </div>

        <div className="text-sm">
          <Link href="/auth/reset-password" className="font-medium text-indigo-600 hover:text-indigo-500">
            비밀번호 찾기
          </Link>
        </div>
      </div>
      
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
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-75"
      >
        <FcGoogle className="h-5 w-5" />
        {isLoading ? 'Google 로그인 중...' : 'Google 계정으로 로그인'}
      </button>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          로그인
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          계정이 없으신가요?{' '}
          <Link href="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            회원가입
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">로딩 중...</div>}>
          <SignInContent />
        </Suspense>
      </div>
    </div>
  );
} 