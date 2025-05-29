'use client';

import Link from 'next/link';

export default function Error() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">500</h2>
          <p className="mt-2 text-center text-sm text-gray-600">서버 오류가 발생했습니다.</p>
        </div>
        <div>
          <Link
            href="/"
            className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
