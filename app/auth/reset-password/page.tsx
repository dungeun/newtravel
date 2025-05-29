'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import ResetPasswordForm from '@/components/forms/ResetPasswordForm';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // 이미 로그인된 경우 홈으로 리디렉션
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center">로딩 중...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          비밀번호 재설정
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          가입한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <ResetPasswordForm />
          
          <div className="mt-6">
            <p className="text-center text-sm text-gray-600">
              <Link href="/auth/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
                로그인 페이지로 돌아가기
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 