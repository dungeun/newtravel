'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { useOrder } from '@/hooks/useOrder';

export default function PaymentProcessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orderInfo } = useOrder();
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('결제를 준비하는 중입니다...');
  
  useEffect(() => {
    const paymentMethod = searchParams.get('method') || orderInfo.paymentMethod || 'card';
    const amount = orderInfo.total || parseInt(searchParams.get('amount') || '0', 10);
    const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;
    
    // 결제 진행 상태 시뮬레이션
    const simulatePaymentProcess = () => {
      // 결제 진행 상태 업데이트
      const updateProgress = (newProgress: number, message: string) => {
        setProgress(newProgress);
        setStatusMessage(message);
      };
      
      // 결제 성공 확률 (90% 성공, 10% 실패)
      const isSuccess = Math.random() < 0.9;
      
      // 결제 진행 시뮬레이션
      setTimeout(() => updateProgress(20, '결제 정보를 확인하는 중입니다...'), 800);
      setTimeout(() => updateProgress(40, '결제를 처리하는 중입니다...'), 1800);
      setTimeout(() => updateProgress(60, '결제 승인 요청 중입니다...'), 2800);
      setTimeout(() => updateProgress(80, '결제 승인 결과를 확인하는 중입니다...'), 3800);
      
      // 결제 완료 후 리다이렉트
      setTimeout(() => {
        if (isSuccess) {
          // 결제 성공 시
          updateProgress(100, '결제가 완료되었습니다. 잠시 후 결과 페이지로 이동합니다.');
          setTimeout(() => {
            router.push(`/travel/payment/success?orderNumber=${orderNumber}&method=${paymentMethod}&amount=${amount}`);
          }, 1000);
        } else {
          // 결제 실패 시
          updateProgress(90, '결제 처리 중 오류가 발생했습니다.');
          setTimeout(() => {
            const errorCode = 'PAY_REJECTED';
            const errorMessage = encodeURIComponent('카드사에서 결제가 거부되었습니다. 다른 결제 수단을 이용해주세요.');
            router.push(`/travel/payment/fail?code=${errorCode}&message=${errorMessage}`);
          }, 1000);
        }
      }, 4800);
    };
    
    // 결제 프로세스 시작
    simulatePaymentProcess();
    
    // 페이지 이탈 방지
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const message = '결제가 진행 중입니다. 페이지를 떠나면 결제가 취소될 수 있습니다.';
      e.preventDefault();
      e.returnValue = message;
      return message;
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [router, searchParams, orderInfo]);
  
  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="mx-auto max-w-md shadow-md">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <h1 className="mb-6 text-2xl font-bold text-gray-800">결제 처리 중</h1>
          
          <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div 
              className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <p className="text-gray-600">{statusMessage}</p>
          
          <div className="mt-8 flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          </div>
          
          <p className="mt-6 text-sm text-gray-500">
            결제 처리 중에는 페이지를 닫거나 새로고침하지 마세요.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
