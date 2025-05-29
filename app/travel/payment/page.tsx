"use client";

import { useState } from 'react';

// 결제 수단 목록
const paymentMethods = ['kakao', 'card', 'bank_transfer'];

export default function PaymentPage() {
  const [selectedMethod, setSelectedMethod] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 결제 처리 로직
    alert(`${selectedMethod} 결제를 시도합니다.`);
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">결제하기</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-lg font-medium mb-3">결제 수단 선택</h2>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <div key={method} className="flex items-center">
                <input
                  type="radio"
                  id={method}
                  name="paymentMethod"
                  value={method}
                  checked={selectedMethod === method}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor={method} className="ml-2 block text-sm text-gray-700">
                  {method === 'kakao' ? '카카오페이' : 
                   method === 'card' ? '신용/체크카드' : '무통장 입금'}
                  }
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={!selectedMethod}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            결제하기
          </button>
        </div>
      </form>
    </div>
  );
}

// Next.js 13+ App Router에서의 라우트 설정
export const dynamic = 'force-dynamic';
export const revalidate = 0; // 캐시 없음
