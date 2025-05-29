'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error caught:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8 text-center">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                문제가 발생했습니다!
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {error.message || '알 수 없는 오류가 발생했습니다.'}
              </p>
            </div>
            <div>
              <button
                onClick={() => reset()}
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
