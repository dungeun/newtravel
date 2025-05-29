'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { CalendarIcon, PackageIcon, AlertCircleIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  options?: {
    adult: number;
    child: number;
    infant: number;
  };
  dates?: {
    startDate: Timestamp;
    endDate: Timestamp;
  };
}

interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
  createdAt: Timestamp;
}

export default function OrderList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchOrders() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const fetchedOrders: Order[] = [];

        querySnapshot.forEach((doc) => {
          fetchedOrders.push({
            id: doc.id,
            ...doc.data(),
          } as Order);
        });

        setOrders(fetchedOrders);
      } catch (error) {
        console.error('주문 내역 조회 오류:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user?.uid]);

  // 주문 취소 처리
  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('정말 예약을 취소하시겠습니까?')) {
      return;
    }

    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'cancelled',
      });

      // 주문 목록 업데이트
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: 'cancelled' } : order
      ));

      // 매출 데이터도 취소 상태로 업데이트
      const salesRef = collection(db, 'sales');
      const salesQuery = query(salesRef, where('orderId', '==', orderId));
      const salesSnapshot = await getDocs(salesQuery);
      
      if (!salesSnapshot.empty) {
        const saleDoc = salesSnapshot.docs[0];
        await updateDoc(doc(db, 'sales', saleDoc.id), {
          status: 'cancelled',
        });
      }

      toast({
        title: '예약이 취소되었습니다',
        description: '예약 취소가 완료되었습니다.',
      });
    } catch (error) {
      console.error('예약 취소 오류:', error);
      toast({
        title: '예약 취소 오류',
        description: '예약 취소 중 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    }
  };

  // 주문 상태에 따른 배지 색상
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 주문 상태 한글 변환
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '예약 완료';
      case 'cancelled':
        return '예약 취소';
      case 'pending':
        return '처리 중';
      default:
        return '알 수 없음';
    }
  };

  // 결제 방법 한글 변환
  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'card':
        return '신용/체크카드';
      case 'bank':
        return '계좌이체';
      case 'kakaopay':
        return '카카오페이';
      case 'naverpay':
        return '네이버페이';
      case 'tosspay':
        return '토스페이';
      default:
        return '기타 결제';
    }
  };

  // 날짜 포맷팅
  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return '';
    try {
      // Firebase Timestamp 객체 처리
      if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
        const date = timestamp.toDate();
        return date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
      
      // 일반 Date 객체나 문자열 처리
      const date = new Date(timestamp as any);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('날짜 변환 오류:', error);
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center py-10">
        <div className="flex justify-center mb-4">
          <PackageIcon className="w-16 h-16 text-gray-300" />
        </div>
        <h3 className="text-xl font-semibold mb-2">예약 내역이 없습니다</h3>
        <p className="text-gray-600 mb-6">
          아직 예약한 여행 상품이 없습니다. 다양한 여행 상품을 둘러보세요.
        </p>
        <Link href="/travel/free_travel">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white">
            여행 상품 둘러보기
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6">예약 내역</h2>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* 주문 헤더 */}
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-500">주문번호:</span>
                    <span className="font-medium">{order.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="mt-2 sm:mt-0">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* 주문 상품 */}
            <div className="p-4">
              {order.items.map((item, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <div className="flex flex-col sm:flex-row justify-between">
                    <div>
                      <h3 className="font-medium mb-1">{item.title}</h3>
                      <div className="text-sm text-gray-600">
                        {item.options && (
                          <p>
                            성인 {item.options.adult}명
                            {item.options.child > 0 && `, 아동 ${item.options.child}명`}
                            {item.options.infant > 0 && `, 유아 ${item.options.infant}명`}
                          </p>
                        )}
                        {item.dates && (
                          <p className="flex items-center gap-1 mt-1">
                            <CalendarIcon className="w-3 h-3" />
                            {formatDate(item.dates.startDate)} ~ {formatDate(item.dates.endDate)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-0 text-right">
                      <p className="font-medium">{item.price.toLocaleString()}원</p>
                      <p className="text-sm text-gray-500">{item.quantity}개</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 주문 요약 */}
            <div className="bg-gray-50 p-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">
                    결제 방법: {getPaymentMethodText(order.paymentMethod)}
                  </p>
                  <p className="font-medium mt-1">
                    총 결제 금액: <span className="text-teal-600">{order.totalAmount.toLocaleString()}원</span>
                  </p>
                </div>
                
                {order.status === 'completed' && (
                  <Button 
                    variant="outline" 
                    className="mt-3 sm:mt-0 border-red-500 text-red-500 hover:bg-red-50"
                    onClick={() => handleCancelOrder(order.id)}
                  >
                    예약 취소
                  </Button>
                )}
                
                {order.status === 'cancelled' && (
                  <div className="flex items-center mt-3 sm:mt-0 text-gray-500">
                    <AlertCircleIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm">취소된 예약</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
