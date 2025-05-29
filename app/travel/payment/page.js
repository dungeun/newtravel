"use client";

import { paymentConfig } from './route-config';
import { useState } from 'react';

export default function PaymentPage() {
  const [selectedMethod, setSelectedMethod] = useState('');
  
  const handleSubmit = (e) => {
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
            {paymentConfig.paymentMethods.map((method) => (
              <div key={method} className="flex items-center">
                <input
                  id={method}
                  name="paymentMethod"
                  type="radio"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  checked={selectedMethod === method}
                  onChange={() => setSelectedMethod(method)}
                />
                <label htmlFor={method} className="ml-2 block text-sm text-gray-700">
                  {method === 'kakao' ? '카카오페이' : 
                   method === 'card' ? '신용/체크카드' : '무통장입금'}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={!selectedMethod}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                      ${selectedMethod 
                        ? 'bg-indigo-600 hover:bg-indigo-700' 
                        : 'bg-gray-400 cursor-not-allowed'}`}
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
