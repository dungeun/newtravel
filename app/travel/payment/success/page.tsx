'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Home, FileText, AlertCircle } from 'lucide-react';
import { clearAllCheckoutData } from '@/lib/checkout/checkoutSync';

interface PaymentResult {
  orderId: string;
  orderNumber: string;
  paymentMethod: string;
  amount: number;
  status: string;
  receiptUrl?: string;
}

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  
  useEffect(() => {
    const confirmPayment = async () => {
      try {
        setIsLoading(true);
        
        // URL 파라미터 가져오기
        const paymentKey = searchParams.get('paymentKey');
        const orderId = searchParams.get('orderId');
        const amount = searchParams.get('amount');
        const paymentId = searchParams.get('paymentId');
        const provider = searchParams.get('provider') || 'toss';
        
        if (!orderId) {
          throw new Error('주문 정보가 없습니다.');
        }
        
        // Toss Payments 결제 확인
        if (provider === 'toss' && paymentKey && orderId && amount) {
          const response = await axios.get(`/api/payments/toss?paymentKey=${paymentKey}&orderId=${orderId}&amount=${amount}`);
          
          if (response.data.success) {
            const paymentData = response.data.payment;
            setPaymentResult({
              orderId: orderId,
              orderNumber: paymentData.orderId,
              paymentMethod: paymentData.method === '카드' ? 'card' : paymentData.method,
              amount: paymentData.totalAmount,
              status: paymentData.status,
              receiptUrl: paymentData.receipt?.url,
            });
          } else {
            throw new Error(response.data.error || '결제 확인 중 오류가 발생했습니다.');
          }
        }
        // KakaoPay 결제 확인
        else if (provider === 'kakao' && paymentId && orderId) {
          const pgToken = searchParams.get('pg_token');
          const tid = searchParams.get('tid');
          
          if (!pgToken || !tid) {
            throw new Error('결제 정보가 없습니다.');
          }
          
          const response = await axios.get(`/api/payments/kakao?pg_token=${pgToken}&paymentId=${paymentId}&tid=${tid}`);
          
          if (response.data.success) {
            const paymentData = response.data.payment;
            setPaymentResult({
              orderId: orderId,
              orderNumber: paymentData.partner_order_id,
              paymentMethod: 'kakaopay',
              amount: paymentData.amount.total,
              status: paymentData.status,
            });
          } else {
            throw new Error(response.data.error || '결제 확인 중 오류가 발생했습니다.');
          }
        }
        // 테스트 모드 (실제 결제 없이 테스트)
        else {
          // 테스트용 데이터 생성
          setPaymentResult({
            orderId: orderId,
            orderNumber: orderId,
            paymentMethod: 'card',
            amount: parseInt(amount || '100000', 10),
            status: 'DONE',
          });
        }
        
        // 체크아웃 데이터 정리
        clearAllCheckoutData();
      } catch (error: any) {
        console.error('결제 확인 오류:', error);
        setError(error.message || '결제 확인 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    confirmPayment();
    
    // 결제 성공 시 5초 후 자동으로 주문 상세 페이지로 이동
    let redirectTimer: NodeJS.Timeout;
    
    if (paymentResult && !error) {
      redirectTimer = setTimeout(() => {
        router.push(`/travel/orders/${paymentResult.orderId}`);
      }, 5000);
    }
    
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [router, searchParams, paymentResult?.orderId]);
  
  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-12">
        <Card className="mx-auto max-w-lg shadow-md">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-6 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            <h1 className="mb-2 text-xl font-semibold text-gray-800">결제 확인 중...</h1>
            <p className="text-gray-600">
              결제 정보를 확인하고 있습니다. 잠시만 기다려주세요.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // 오류 상태 표시
  if (error) {
    return (
      <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-12">
        <Card className="mx-auto max-w-lg border-red-200 shadow-md">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            
            <h1 className="mb-2 text-2xl font-bold text-gray-800">결제 확인 오류</h1>
            <p className="mb-6 text-gray-600">
              {error}
            </p>
            
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Button variant="outline" asChild>
                <Link href="/" className="flex items-center">
                  <Home className="mr-2 h-4 w-4" />
                  홈으로
                </Link>
              </Button>
              <Button asChild>
                <Link href="/travel/checkout" className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  체크아웃으로 돌아가기
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // 결제 성공 상태 표시
  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="mx-auto max-w-lg border-green-200 shadow-md">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="mb-2 text-2xl font-bold text-gray-800">결제가 완료되었습니다!</h1>
          <p className="mb-6 text-gray-600">
            주문이 성공적으로 접수되었습니다. 감사합니다.
          </p>
          
          {paymentResult && (
            <div className="mb-6 w-full rounded-md bg-gray-50 p-4 text-left">
              <div className="mb-2 grid grid-cols-2 gap-2">
                <span className="text-sm text-gray-500">주문번호</span>
                <span className="font-medium">{paymentResult.orderNumber}</span>
              </div>
              <div className="mb-2 grid grid-cols-2 gap-2">
                <span className="text-sm text-gray-500">결제 방법</span>
                <span className="font-medium">
                  {paymentResult.paymentMethod === 'card' && '신용/체크카드'}
                  {paymentResult.paymentMethod === 'kakaopay' && '카카오페이'}
                  {paymentResult.paymentMethod === 'tosspay' && '토스페이'}
                  {paymentResult.paymentMethod === 'bank' && '무통장 입금'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-sm text-gray-500">결제 금액</span>
                <span className="font-medium">{paymentResult.amount.toLocaleString()}원</span>
              </div>
              
              {paymentResult.receiptUrl && (
                <div className="mt-4 text-center">
                  <Button variant="outline" asChild size="sm">
                    <a href={paymentResult.receiptUrl} target="_blank" rel="noopener noreferrer">
                      결제 영수증 보기
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
          
          <p className="mb-8 text-sm text-gray-500">
            주문 상세 페이지로 잠시 후 자동 이동합니다. 이동하지 않을 경우 아래 버튼을 클릭해주세요.
          </p>
          
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Button variant="outline" asChild>
              <Link href="/travel" className="flex items-center">
                <Home className="mr-2 h-4 w-4" />
                홈으로
              </Link>
            </Button>
            {paymentResult && (
              <Button asChild>
                <Link href={`/travel/orders/${paymentResult.orderId}`} className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  주문 상세 보기
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Payment success pages should not be cached
export const dynamic = 'force-dynamic';
export const revalidate = 0; // No caching for payment success pages
