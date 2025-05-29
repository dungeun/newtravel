'use client';

import { useRouter } from 'next/navigation';

export default function MyPage() {
  const router = useRouter();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">마이페이지</h1>
      <p>마이페이지입니다. 현재 빌드 테스트 중입니다.</p>
    </div>
  );
}

// 정적 페이지 재검증 설정
export const revalidate = 60; // 60초마다 재검증
