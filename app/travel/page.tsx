'use client';

export default function TravelPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">여행 상품</h1>
      <p>여행 상품 페이지입니다. 현재 빌드 테스트 중입니다.</p>
    </div>
  );
}

// 정적 페이지 재검증 설정
export const revalidate = 60; // 60초마다 재검증
