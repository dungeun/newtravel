import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-800 to-teal-950">
      <div className="m-4 flex w-full max-w-[1200px] overflow-hidden rounded-[32px] bg-white shadow-2xl">
        {/* 왼쪽 로그인 섹션 */}
        <div className="flex w-1/2 flex-col p-12">
          {/* 로고 및 타이틀 */}
          <div className="mb-16">
            <h1 className="mb-2 font-serif text-3xl">Travel Voyanix</h1>
            <p className="text-sm text-gray-600">Explore More. Experience Life.</p>
          </div>

          {/* 로그인/회원가입 버튼 */}
          <div className="mb-12 flex gap-4">
            <button
              onClick={handleLogin}
              className="rounded-full bg-black px-8 py-3 text-sm font-medium text-white"
            >
              Sign Up
            </button>
            <button
              onClick={handleLogin}
              className="rounded-full border border-gray-300 px-8 py-3 text-sm font-medium"
            >
              Log In
            </button>
          </div>

          {/* Begin Your Adventure 섹션 */}
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Begin Your Adventure</h2>
            <p className="mb-6 text-sm text-gray-600">Sign Up with Open account</p>
          </div>

          {/* 소셜 로그인 버튼 */}
          <div className="space-y-4">
            <button
              onClick={handleLogin}
              className="flex w-full items-center justify-center rounded-full border border-gray-200 px-6 py-3 text-sm font-medium transition-colors hover:bg-gray-50"
            >
              <Image src="/icons/google.svg" alt="Google" width={20} height={20} className="mr-3" />
              Continue with Google
            </button>
            <button
              onClick={handleLogin}
              className="flex w-full items-center justify-center rounded-full border border-gray-200 px-6 py-3 text-sm font-medium transition-colors hover:bg-gray-50"
            >
              <Image src="/icons/kakao.svg" alt="Kakao" width={20} height={20} className="mr-3" />
              Continue with Kakao
            </button>
          </div>
        </div>

        {/* 오른쪽 이미지 섹션 */}
        <div className="relative w-1/2">
          <div className="absolute right-8 top-8 max-w-xs rounded-2xl bg-white/90 p-4 shadow-lg backdrop-blur-sm">
            <div className="mb-2 flex items-start gap-2">
              <h3 className="text-lg font-semibold">Travel the World, Your Way!</h3>
              <span className="text-red-500">❤️</span>
            </div>
            <p className="text-sm text-gray-600">
              Explore destinations at your pace, with personalized journeys & unforgettable
              experiences.
            </p>
            <div className="mt-2">
              <span className="text-sm text-gray-400">→</span>
            </div>
          </div>

          <Image
            src="/images/travel-beach.jpg"
            alt="Tropical beach with seaplane"
            layout="fill"
            objectFit="cover"
            className="rounded-l-[32px]"
          />

          <div className="absolute bottom-8 right-8 text-right text-white">
            <h3 className="mb-2 text-2xl font-semibold">
              Explore the World,
              <br />
              Beyond Boundaries!
            </h3>
            <button
              onClick={handleLogin}
              className="mt-4 rounded-full bg-white px-6 py-2 text-sm font-medium text-black"
            >
              Start your adventure today!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
