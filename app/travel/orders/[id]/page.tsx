'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Users, CreditCard } from 'lucide-react';

interface OrderDetails {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  total: number;
  ordererInfo: {
    name: string;
    email: string;
    phone: string;
  };
  travelers: Array<{
    id: string;
    name: string;
    birthdate: string;
    gender: string;
  }>;
  items: Array<{
    id: string;
    title: string;
    price: number;
    quantity: number;
    options?: {
      adult: number;
      child: number;
      infant: number;
    };
    dates?: {
      startDate: string;
      endDate: string;
    };
  }>;
  specialRequests?: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // 실제 API 연동 대신 모의 데이터 생성
    const fetchOrderDetails = () => {
      setIsLoading(true);
      
      try {
        // 모의 주문 데이터 생성
        const mockOrder: OrderDetails = {
          orderId: params.id as string,
          orderNumber: params.id as string,
          orderDate: new Date().toISOString(),
          status: 'confirmed',
          paymentMethod: '신용/체크카드',
          paymentStatus: 'paid',
          total: Math.floor(Math.random() * 500000) + 100000,
          ordererInfo: {
            name: '홍길동',
            email: 'hong@example.com',
            phone: '010-1234-5678',
          },
          travelers: [
            {
              id: '1',
              name: '홍길동',
              birthdate: '1990-01-01',
              gender: '남성',
            },
            {
              id: '2',
              name: '김철수',
              birthdate: '1992-05-15',
              gender: '남성',
            },
          ],
          items: [
            {
              id: '1',
              title: '제주도 3박 4일 패키지',
              price: 250000,
              quantity: 1,
              options: {
                adult: 2,
                child: 0,
                infant: 0,
              },
              dates: {
                startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toISOString(),
              },
            },
          ],
          specialRequests: '호텔 체크인 시 늦을 수 있습니다. 오후 6시 이후 도착 예정입니다.',
        };
        
        // 모의 API 지연 시뮬레이션
        setTimeout(() => {
          setOrder(mockOrder);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('주문 정보 조회 오류:', error);
        setError('주문 정보를 불러오는 중 오류가 발생했습니다.');
        setIsLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [params.id]);
  
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
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-12">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          </div>
          <h2 className="text-xl font-semibold">주문 정보를 불러오는 중입니다...</h2>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-center">
          <h2 className="mb-2 text-xl font-semibold text-red-800">오류 발생</h2>
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={() => router.push('/travel')} 
            className="mt-4"
            variant="outline"
          >
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-center">
          <h2 className="mb-2 text-xl font-semibold text-yellow-800">주문 정보를 찾을 수 없습니다</h2>
          <p className="text-yellow-600">요청하신 주문 정보를 찾을 수 없습니다. 주문 번호를 확인해주세요.</p>
          <Button 
            onClick={() => router.push('/travel')} 
            className="mt-4"
            variant="outline"
          >
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/travel/mypage" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            마이페이지로 돌아가기
          </Link>
        </Button>
        
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">주문 상세 정보</h1>
            <p className="text-gray-500">주문번호: {order.orderNumber}</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
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
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* 주문 상품 정보 */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold">주문 상품</h2>
              
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="rounded-md border p-4">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row">
                      <h3 className="font-medium">{item.title}</h3>
                      <span className="font-medium">{(item.price * item.quantity).toLocaleString()}원</span>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-gray-500 sm:grid-cols-2">
                      {item.options && (
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4" />
                          {item.options.adult > 0 && `성인 ${item.options.adult}명`}
                          {item.options.child > 0 && `, 아동 ${item.options.child}명`}
                          {item.options.infant > 0 && `, 유아 ${item.options.infant}명`}
                        </div>
                      )}
                      
                      {item.dates && (
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          {formatDate(item.dates.startDate)} ~ {formatDate(item.dates.endDate)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* 여행자 정보 */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold">여행자 정보</h2>
              
              <div className="space-y-4">
                {order.travelers.map((traveler) => (
                  <div key={traveler.id} className="rounded-md border p-4">
                    <h3 className="font-medium">{traveler.name}</h3>
                    <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-gray-500 sm:grid-cols-2">
                      <div>생년월일: {traveler.birthdate}</div>
                      <div>성별: {traveler.gender}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* 특별 요청사항 */}
          {order.specialRequests && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-semibold">특별 요청사항</h2>
                <p className="text-gray-700">{order.specialRequests}</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div>
          {/* 주문 요약 */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold">주문 요약</h2>
              
              <div className="space-y-4">
                <div className="rounded-md bg-gray-50 p-4">
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">주문일시</span>
                    <p>{formatDate(order.orderDate)}</p>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">결제 방법</span>
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <p>{order.paymentMethod}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">총 결제 금액</span>
                    <p className="text-lg font-bold text-blue-600">{order.total.toLocaleString()}원</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* 주문자 정보 */}
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold">주문자 정보</h2>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">이름</span>
                  <p>{order.ordererInfo.name}</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500">이메일</span>
                  <p>{order.ordererInfo.email}</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500">연락처</span>
                  <p>{order.ordererInfo.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
