'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, CreditCard, ChevronRight } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed';
  total: number;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    dates?: {
      startDate: string;
      endDate: string;
    };
  }>;
}

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // 실제 API 연동 대신 모의 데이터 생성
    const fetchOrders = () => {
      setIsLoading(true);
      
      try {
        // 모의 주문 데이터 생성
        const mockOrders: Order[] = [
          {
            id: 'ORD-12345678',
            orderNumber: 'ORD-12345678',
            orderDate: new Date().toISOString(),
            status: 'confirmed',
            paymentStatus: 'paid',
            total: 250000,
            items: [
              {
                id: '1',
                title: '제주도 3박 4일 패키지',
                quantity: 1,
                dates: {
                  startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                  endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toISOString(),
                },
              },
            ],
          },
          {
            id: 'ORD-87654321',
            orderNumber: 'ORD-87654321',
            orderDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            paymentStatus: 'paid',
            total: 350000,
            items: [
              {
                id: '2',
                title: '부산 2박 3일 패키지',
                quantity: 1,
                dates: {
                  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                  endDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
                },
              },
            ],
          },
          {
            id: 'ORD-11223344',
            orderNumber: 'ORD-11223344',
            orderDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'cancelled',
            paymentStatus: 'failed',
            total: 150000,
            items: [
              {
                id: '3',
                title: '강원도 스키 패키지',
                quantity: 1,
                dates: {
                  startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
                  endDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
                },
              },
            ],
          },
        ];
        
        // 모의 API 지연 시뮬레이션
        setTimeout(() => {
          setOrders(mockOrders);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('주문 목록 조회 오류:', error);
        setError('주문 목록을 불러오는 중 오류가 발생했습니다.');
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  // 주문 상태에 따른 배지 색상
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'completed':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };
  
  // 결제 상태에 따른 배지 색상
  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'outline';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };
  
  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          </div>
          <p className="text-gray-600">주문 내역을 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }
  
  if (orders.length === 0) {
    return (
      <div className="rounded-md border p-6 text-center">
        <h3 className="mb-2 text-lg font-medium">주문 내역이 없습니다</h3>
        <p className="mb-4 text-gray-500">아직 주문 내역이 없습니다. 여행 상품을 둘러보고 예약해보세요.</p>
        <Button asChild>
          <Link href="/travel">여행 상품 보기</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">주문 내역</h2>
      
      {orders.map((order) => (
        <Card key={order.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="border-b p-4">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm text-gray-500">주문번호: {order.orderNumber}</p>
                  <p className="text-sm text-gray-500">주문일시: {formatDate(order.orderDate)}</p>
                </div>
                
                <div className="flex gap-2">
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {order.status === 'pending' && '처리 중'}
                    {order.status === 'confirmed' && '예약 확정'}
                    {order.status === 'completed' && '여행 완료'}
                    {order.status === 'cancelled' && '취소됨'}
                  </Badge>
                  
                  <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)}>
                    {order.paymentStatus === 'paid' && '결제 완료'}
                    {order.paymentStatus === 'pending' && '결제 대기'}
                    {order.paymentStatus === 'failed' && '결제 실패'}
                  </Badge>
                </div>
              </div>
            </div>
            
            {order.items.map((item) => (
              <div key={item.id} className="border-b p-4 last:border-b-0">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    
                    {item.dates && (
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Calendar className="mr-2 h-4 w-4" />
                        {formatDate(item.dates.startDate)} ~ {formatDate(item.dates.endDate)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">{order.total.toLocaleString()}원</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <CreditCard className="mr-1 h-3 w-3" />
                        {order.paymentStatus === 'paid' ? '결제 완료' : '결제 필요'}
                      </div>
                    </div>
                    
                    <Button asChild variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
                      <Link href={`/travel/orders/${order.id}`}>
                        <ChevronRight className="h-5 w-5" />
                        <span className="sr-only">상세 보기</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
