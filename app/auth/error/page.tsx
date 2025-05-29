'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

// 에러 메시지 분석을 위한 컴포넌트
function ErrorMessage() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>('인증 과정에서 오류가 발생했습니다.');

  useEffect(() => {
    const error = searchParams?.get('error');

    if (error) {
      switch (error) {
        case 'Signin':
          setErrorMessage('로그인 중 오류가 발생했습니다. 이메일과 비밀번호를 확인해주세요.');
          break;
        case 'OAuthSignin':
          setErrorMessage('소셜 로그인 중 오류가 발생했습니다.');
          break;
        case 'OAuthCallback':
          setErrorMessage('소셜 로그인 콜백 처리 중 오류가 발생했습니다.');
          break;
        case 'OAuthCreateAccount':
          setErrorMessage('소셜 계정으로 사용자 계정을 생성하는 중 오류가 발생했습니다.');
          break;
        case 'EmailCreateAccount':
          setErrorMessage('이메일 계정을 생성하는 중 오류가 발생했습니다.');
          break;
        case 'Callback':
          setErrorMessage('인증 콜백 처리 중 오류가 발생했습니다.');
          break;
        case 'OAuthAccountNotLinked':
          setErrorMessage('이미 다른 방식으로 가입된 계정입니다. 기존 계정으로 로그인 해주세요.');
          break;
        case 'EmailSignin':
          setErrorMessage('이메일 인증 중 오류가 발생했습니다.');
          break;
        case 'CredentialsSignin':
          setErrorMessage('이메일 또는 비밀번호가 일치하지 않습니다.');
          break;
        case 'default':
          setErrorMessage('인증 과정에서 오류가 발생했습니다.');
          break;
      }
    }
  }, [searchParams]);

  return errorMessage;
}

export default function AuthErrorPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-red-500">
          <AlertCircle size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          인증 오류
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="text-sm text-red-700">
              <Suspense fallback={"인증 과정에서 오류가 발생했습니다."}>
                <ErrorMessage />
              </Suspense>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <Link
              href="/auth/signin"
              className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              로그인 페이지로 이동
            </Link>
            
            <Link
              href="/"
              className="flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              홈으로 이동
            </Link>
          </div>
          
          <p className="mt-6 text-center text-sm text-gray-600">
            문제가 계속될 경우 고객 지원에 문의해주세요.
          </p>
        </div>
      </div>
    </div>
  );
} 