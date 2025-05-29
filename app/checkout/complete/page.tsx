'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface OrderData {
  id: string;
  customerName: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: any;
  status: string;
}

export default function CompletePage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrderDetails() {
      if (!orderId) {
        setError('주문 정보를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      try {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          setOrder({
            id: orderSnap.id,
            ...orderSnap.data(),
          } as OrderData);
        } else {
          setError('주문 정보를 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('주문 정보 조회 오류:', err);
        setError('주문 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchOrderDetails();
  }, [orderId]);

  // 결제 방법 한글명 변환
  const getPaymentMethodName = (method: string) => {
    switch(method) {
      case 'card': return '신용/체크카드';
      case 'bank': return '계좌이체';
      case 'kakaopay': return '카카오페이';
      case 'naverpay': return '네이버페이';
      case 'tosspay': return '토스페이';
      default: return '기타 결제수단';
    }
  };

  // 주문 날짜 포맷팅
  const formatOrderDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-20 px-4 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-teal-500 border-t-transparent animate-spin mb-4"></div>
        <p className="text-lg text-gray-600">주문 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-20 px-4">
        <div className="max-w-lg mx-auto bg-white p-8 rounded-lg border border-gray-200 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">오류가 발생했습니다</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg border border-gray-200">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-4">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold mb-2">결제가 완료되었습니다</h1>
          <p className="text-gray-600">
            {order?.customerName}님, 주문해주셔서 감사합니다.
          </p>
        </div>

        <div className="border-t border-b border-gray-200 py-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">주문 정보</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">주문 번호</span>
              <span className="font-medium">{order?.id}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">주문 일시</span>
              <span>{formatOrderDate(order?.createdAt)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">결제 수단</span>
              <span>{getPaymentMethodName(order?.paymentMethod || '')}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">결제 상태</span>
              <span className="text-green-600 font-medium">결제 완료</span>
            </div>
            
            <div className="flex justify-between pt-3 border-t border-gray-200">
              <span className="font-semibold">총 결제 금액</span>
              <span className="text-xl font-bold text-teal-600">
                {order?.totalAmount?.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-8">
          <p>• 예약 확정 이메일이 곧 발송될 예정입니다.</p>
          <p>• 예약 내역은 마이페이지에서 확인하실 수 있습니다.</p>
          <p>• 문의사항은 고객센터(1234-5678)로 연락해주세요.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/mypage/bookings">
            <Button variant="outline" className="w-full">
              예약 내역 확인
            </Button>
          </Link>
          <Link href="/">
            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
