'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, RefreshCw, Home } from 'lucide-react';
import { clearAllCheckoutData } from '@/lib/checkout/checkoutSync';

// 라우팅 설정
export const dynamic = 'force-dynamic'; // Force dynamic rendering for payment pages
export const revalidate = 0; // No caching for payment pages

interface PaymentError {
  code: string;
  message: string;
  orderId?: string;
  provider?: string;
}

export default function PaymentFailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentError, setPaymentError] = useState<PaymentError | null>(null);
  
  useEffect(() => {
    const getPaymentError = async () => {
      try {
        setIsLoading(true);
        
        // URL 파라미터 가져오기
        const code = searchParams.get('code') || '';
        const message = searchParams.get('message') || '';
        const orderId = searchParams.get('orderId') || undefined;
        const provider = searchParams.get('provider') || 'toss';
        
        // 토스페이먼츠 오류 처리
        if (provider === 'toss') {
          const errorCode = code || 'PAYMENT_ERROR';
          let errorMessage = message ? decodeURIComponent(message) : '결제 처리 중 오류가 발생했습니다.';
          
          // 오류 코드에 따른 메시지 상세화
          if (errorCode === 'PAY_PROCESS_CANCELED') {
            errorMessage = '결제가 취소되었습니다.';
          } else if (errorCode === 'PAY_PROCESS_ABORTED') {
            errorMessage = '결제 처리 중 중단되었습니다.';
          } else if (errorCode === 'INVALID_CARD_COMPANY') {
            errorMessage = '유효하지 않은 카드사입니다.';
          } else if (errorCode === 'INVALID_CARD_NUMBER') {
            errorMessage = '카드 번호가 유효하지 않습니다.';
          } else if (errorCode === 'INSUFFICIENT_BALANCE') {
            errorMessage = '잔액이 부족합니다.';
          }
          
          setPaymentError({
            code: errorCode,
            message: errorMessage,
            orderId,
            provider
          });
        }
        // 카카오페이 오류 처리
        else if (provider === 'kakao') {
          const errorCode = code || 'PAYMENT_ERROR';
          let errorMessage = message ? decodeURIComponent(message) : '결제 처리 중 오류가 발생했습니다.';
          
          setPaymentError({
            code: errorCode,
            message: errorMessage,
            orderId,
            provider
          });
        }
        // 기본 오류 처리
        else {
          setPaymentError({
            code: code || 'PAYMENT_ERROR',
            message: message ? decodeURIComponent(message) : '결제 처리 중 오류가 발생했습니다.',
            orderId,
            provider
          });
        }
        
        // 오류 발생 시 체크아웃 데이터 유지 (다시 시도할 수 있도록)
      } catch (error) {
        console.error('결제 오류 처리 중 오류:', error);
        setPaymentError({
          code: 'UNKNOWN_ERROR',
          message: '알 수 없는 오류가 발생했습니다.'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    getPaymentError();
  }, [searchParams]);
  
  // 결제 다시 시도
  const handleRetry = () => {
    router.push('/travel/checkout');
  };
  
  // 장바구니로 돌아가기
  const handleBackToCart = () => {
    // 체크아웃 데이터 정리
    clearAllCheckoutData();
    router.push('/travel/cart');
  };
  
  // 홈으로 돌아가기
  const handleBackToHome = () => {
    // 체크아웃 데이터 정리
    clearAllCheckoutData();
    router.push('/travel');
  };
  
  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-12">
        <Card className="mx-auto max-w-lg shadow-md">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-6 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            <h1 className="mb-2 text-xl font-semibold text-gray-800">오류 정보 불러오는 중...</h1>
            <p className="text-gray-600">
              결제 오류 정보를 불러오고 있습니다. 잠시만 기다려주세요.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="mx-auto max-w-lg border-red-200 shadow-md">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          
          <h1 className="mb-2 text-2xl font-bold text-gray-800">결제에 실패했습니다</h1>
          <p className="mb-6 text-gray-600">
            결제 처리 중 문제가 발생했습니다. 다시 시도해주세요.
          </p>
          
          {paymentError && (
            <div className="mb-6 w-full rounded-md bg-gray-50 p-4 text-left">
              <div className="mb-2 grid grid-cols-1 gap-2">
                <span className="text-sm text-gray-500">오류 코드</span>
                <span className="font-medium">{paymentError.code}</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <span className="text-sm text-gray-500">오류 메시지</span>
                <span className="font-medium">{paymentError.message}</span>
              </div>
              {paymentError.orderId && (
                <div className="mt-2 grid grid-cols-1 gap-2">
                  <span className="text-sm text-gray-500">주문번호</span>
                  <span className="font-medium">{paymentError.orderId}</span>
                </div>
              )}
            </div>
          )}
          
          <div className="mb-6 w-full rounded-md bg-yellow-50 p-4 text-left">
            <h3 className="mb-2 font-medium text-yellow-800">다음 사항을 확인해보세요:</h3>
            <ul className="ml-4 list-disc text-sm text-gray-700">
              {paymentError?.code === 'INVALID_CARD_NUMBER' || paymentError?.code === 'INVALID_CARD_COMPANY' ? (
                <li className="mb-1 font-medium text-red-600">카드 정보가 올바르지 않습니다. 다시 확인해주세요.</li>
              ) : (
                <li className="mb-1">카드 정보가 올바르게 입력되었는지 확인해주세요.</li>
              )}
              
              {paymentError?.code === 'INSUFFICIENT_BALANCE' ? (
                <li className="mb-1 font-medium text-red-600">카드의 잔액이 부족합니다. 다른 결제 수단을 사용해주세요.</li>
              ) : (
                <li className="mb-1">카드의 잔액이 충분한지 확인해주세요.</li>
              )}
              
              <li className="mb-1">결제 한도를 초과하지 않았는지 확인해주세요.</li>
              
              {paymentError?.code === 'PAY_PROCESS_CANCELED' ? (
                <li className="mb-1 font-medium">결제가 사용자에 의해 취소되었습니다.</li>
              ) : (
                <li>인터넷 연결이 안정적인지 확인해주세요.</li>
              )}
            </ul>
          </div>
          
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Button variant="outline" onClick={handleBackToHome} className="flex items-center">
              <Home className="mr-2 h-4 w-4" />
              홈으로
            </Button>
            <Button variant="outline" onClick={handleBackToCart} className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              장바구니로 돌아가기
            </Button>
            <Button onClick={handleRetry} className="flex items-center">
              <RefreshCw className="mr-2 h-4 w-4" />
              결제 다시 시도
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
