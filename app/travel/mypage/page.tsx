'use client';

export default function MyPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">마이페이지</h1>
      <p>마이페이지입니다. 현재 빌드 테스트 중입니다.</p>
    </div>
  );
}

// Disable static generation for dynamic routes
export const dynamic = 'force-dynamic';
// Disable revalidation for dynamic routes
export const revalidate = 0;
