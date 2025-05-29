"use client";

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
// import ReviewList from './components/reviews/ReviewList';
import ReviewForm from './components/reviews/ReviewForm';

// Wrapper component to handle Suspense boundary
function ProductPageContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id') || '1'; // 기본값으로 '1' 사용
  const [showReviewForm, setShowReviewForm] = useState(false);

  // 상품 정보 가져오기 (예시)
  const product = {
    id: productId,
    name: '여행 상품 이름',
    description: '여행 상품에 대한 상세 설명이 여기에 들어갑니다.',
    price: 100000,
    rating: 4.5,
    reviewCount: 128,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 상품 상세 정보 섹션 */}
      <section className="mb-12">
        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {product.rating} ({product.reviewCount}개 리뷰)
            </span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">상품 설명</h2>
          <p className="text-gray-700">{product.description}</p>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-2xl font-bold text-indigo-600">
              {product.price.toLocaleString()}원
            </p>
          </div>
        </div>
      </section>

      {/* 리뷰 섹션 */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">리뷰</h2>
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            리뷰 작성하기
          </button>
        </div>

        {/* 리뷰 목록 */}
        <div className="space-y-6">
          {/* <ReviewList productId={productId} /> */}
          <p className="text-gray-500">리뷰가 아직 없습니다.</p>
        </div>

        {/* 리뷰 작성 폼 모달 */}
        {showReviewForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">리뷰 작성</h3>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <ReviewForm
                productId={productId}
                onSuccess={() => {
                  setShowReviewForm(false);
                  // 리뷰 목록 새로고침 로직 추가 가능
                }}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-12 bg-gray-200 rounded w-1/3 mb-6"></div>
        </div>
      </div>
    }>
      <ProductPageContent />
    </Suspense>
  );
}

        {showReviewForm && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">리뷰 작성</h3>
            <ReviewForm productId={productId} onSuccess={() => setShowReviewForm(false)} />
          </div>
        )}
      </section>
    </div>
  );
}

// This is a dynamic route that should not be statically generated
export const dynamic = 'force-dynamic';
// Disable any caching for this page
export const fetchCache = 'force-no-store';
