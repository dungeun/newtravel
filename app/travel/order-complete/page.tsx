'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { CheckCircle, Home, ArrowRight } from 'lucide-react';

export default function OrderCompletePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { clearCart } = useCart();
  const [orderNumber, setOrderNumber] = useState('');
  
  // 주문 번호 생성 함수
  const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `${year}${month}${day}-${random}`;
  };
  
  useEffect(() => {
    // 로그인 상태 확인
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    // 주문 번호 생성
    setOrderNumber(generateOrderNumber());
    
    // 장바구니 비우기
    clearCart();
    
    // 브라우저 뒤로가기 방지
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', () => {
      window.history.pushState(null, '', window.location.href);
    });
    
    return () => {
      window.removeEventListener('popstate', () => {});
    };
  }, [session, router, clearCart]);
  
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">주문이 완료되었습니다!</h1>
        <p className="text-gray-600">
          주문해주셔서 감사합니다. 주문 확인 이메일이 곧 발송될 예정입니다.
        </p>
      </div>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="mb-6 border-b pb-4">
            <h2 className="mb-2 text-xl font-semibold">주문 정보</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500">주문 번호</p>
                <p className="font-medium">{orderNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">주문 일자</p>
                <p className="font-medium">{new Date().toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="mb-4 text-lg font-medium">결제 정보</h3>
            <div className="rounded-md bg-gray-50 p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">결제 상태</p>
                  <p className="font-medium text-green-600">결제 완료</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">결제 방법</p>
                  <p className="font-medium">신용카드 / 계좌이체</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4 bg-gray-50 p-6 sm:flex-row sm:justify-between sm:space-y-0">
          <div className="text-sm text-gray-600">
            문의사항이 있으시면 고객센터(1234-5678)로 연락해주세요.
          </div>
          <div>
            <Link href="/travel/mypage/orders" className="text-sm font-medium text-blue-600 hover:underline">
              주문 상세 보기
            </Link>
          </div>
        </CardFooter>
      </Card>
      
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
        <Button variant="outline" asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            홈으로 이동
          </Link>
        </Button>
        <Button asChild>
          <Link href="/travel/free_travel">
            여행 상품 더 보기
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
