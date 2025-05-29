'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

// UI Components
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Separator } from '../../../components/ui/separator/index';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../../components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '../../../components/ui/alert';

// Types
import { Order, OrderStatus } from '../../../types/order';

// Utility functions
const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: currency || 'KRW'
  }).format(amount);
};

// 주문 상태별 색상 정의 (Tailwind CSS 클래스)
const getStatusText = (status: string): string => {
  return statusLabels[status] || status;
};


// Status labels and colors
const statusLabels: Record<string, string> = {
  'pending': '주문 접수',
  'confirmed': '주문 확인',
  'paid': '결제 완료',
  'processing': '처리 중',
  'ready': '출발 준비',
  'completed': '완료',
  'cancelled': '취소',
  'refunded': '환불',
};

// Status badge styles for Tailwind CSS
const getStatusBadgeStyle = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
    case 'processing':
    case 'ready':
      return 'bg-blue-100 text-blue-800';
    case 'paid':
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
    case 'refunded':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// 주문 진행 단계 정의
const orderSteps = [
  { status: 'pending', label: '주문 접수' },
  { status: 'confirmed', label: '주문 확인' },
  { status: 'processing', label: '처리 중' },
  { status: 'ready', label: '출발 준비' },
  { status: 'completed', label: '완료' },
];

// 주문 상태에 따른 스타일 클래스 반환
const getStatusColor = (status: string | undefined): string => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'confirmed':
    case 'processing':
    case 'ready':
      return 'info';
    case 'completed':
      return 'success';
    case 'cancelled':
    case 'refunded':
      return 'error';
    default:
      return 'default';
  }
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const orderId = params.id as string;

  useEffect(() => {
    if (user?.id && orderId) {
      fetchOrderDetail();
    }
  }, [user, orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // API 엔드포인트 호출
      const response = await fetch(`/api/mypage/orders/${orderId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('주문을 찾을 수 없습니다.');
        }
        throw new Error('주문 상세 정보를 불러오는 데 실패했습니다.');
      }
      
      const data = await response.json();
      setOrder(data.order);
    } catch (err: any) {
      console.error('주문 상세 조회 오류:', err);
      setError(err.message || '주문 상세 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 금액 포맷팅 함수
  const formatCurrency = (amount: number, currency: string = 'KRW') => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // 주문 진행 상태 단계 계산
  const getActiveStep = (status: OrderStatus) => {
    if (status === 'cancelled' || status === 'refunded') {
      return -1; // 취소 또는 환불된 주문은 진행 단계 표시 안함
    }
    
    const stepIndex = orderSteps.findIndex(step => step.status === status);
    return stepIndex >= 0 ? stepIndex : 0;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-12 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start mb-4">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
        <button 
          className="flex items-center text-blue-600 hover:text-blue-800 mt-4"
          onClick={() => router.push('/mypage')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          주문 목록으로 돌아가기
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-6 text-center">
        <h3 className="text-lg font-semibold mb-3">
          주문 정보를 찾을 수 없습니다.
        </h3>
        <button 
          className="flex items-center text-blue-600 hover:text-blue-800 mt-4 mx-auto"
          onClick={() => router.push('/mypage')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          주문 목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Button 
        variant="outline" 
        onClick={() => router.push('/mypage')}
        className="mb-4 flex items-center"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        주문 목록으로 돌아가기
      </Button>

      <h1 className="text-2xl font-semibold mb-1">
        주문 상세 정보
      </h1>
      <p className="text-sm text-gray-500 mb-4">
        주문번호: {order.orderNumber} | 주문일자: {formatDate(order.createdAt)}
      </p>

      {/* 주문 상태 표시 */}
      <div className="mb-6">
        <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium ${getStatusBadgeStyle(order.status)}`}>
          {statusLabels[order.status] || order.status}
        </span>
      </div>

      {/* 주문 진행 상태 */}
      {order.status !== 'cancelled' && order.status !== 'refunded' && (
        <div className="p-6 mb-6 bg-gray-50 rounded-lg">
          <div className="relative flex justify-between">
            {orderSteps.map((step, index) => {
              const isActive = getActiveStep(order.status) >= index;
              const isCompleted = getActiveStep(order.status) > index;
              return (
                <div key={step.status} className="flex flex-col items-center z-10">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isCompleted ? 'bg-green-500' : isActive ? 'bg-blue-500' : 'bg-gray-200'} text-white mb-2`}>
                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : <span>{index + 1}</span>}
                  </div>
                  <span className={`text-xs ${isActive ? 'font-medium' : 'text-gray-500'}`}>{step.label}</span>
                </div>
              );
            })}
            {/* Progress line */}
            <div className="absolute top-4 left-0 h-0.5 bg-gray-200 w-full -z-10"></div>
            <div 
              className="absolute top-4 left-0 h-0.5 bg-green-500 -z-10 transition-all duration-300"
              style={{ width: `${Math.min(100, (getActiveStep(order.status) / (orderSteps.length - 1)) * 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 주문 상품 정보 */}
      <h2 className="text-lg font-semibold mt-8 mb-3">
        주문 상품
      </h2>
      <div className="rounded-md border mb-6 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>상품명</TableHead>
              <TableHead className="text-center">인원</TableHead>
              <TableHead className="text-right">가격</TableHead>
              <TableHead className="text-right">소계</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="font-medium">{item.productTitle}</div>
                  <div className="text-sm text-gray-500">
                    {item.travelDate?.startDate && formatDate(item.travelDate.startDate)}
                    {item.travelDate?.endDate && ` ~ ${formatDate(item.travelDate.endDate)}`}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col gap-1">
                    {item.quantity.adult > 0 && (
                      <div className="text-sm">성인 {item.quantity.adult}명</div>
                    )}
                    {item.quantity.child > 0 && (
                      <div className="text-sm">아동 {item.quantity.child}명</div>
                    )}
                    {item.quantity.infant > 0 && (
                      <div className="text-sm">유아 {item.quantity.infant}명</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end gap-1">
                    {item.quantity.adult > 0 && (
                      <div className="text-sm">
                        성인: {formatCurrency(item.price.adult, item.price.currency)}
                      </div>
                    )}
                    {item.quantity.child > 0 && (
                      <div className="text-sm">
                        아동: {formatCurrency(item.price.child, item.price.currency)}
                      </div>
                    )}
                    {item.quantity.infant > 0 && (
                      <div className="text-sm">
                        유아: {formatCurrency(item.price.infant, item.price.currency)}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="font-semibold">
                    {formatCurrency(item.subtotal, order.currency)}
                  </div>
                  {item.discount && (
                    <div className="text-sm text-red-500">
                      할인: {item.discount.type === 'percentage' 
                        ? `${item.discount.value}%` 
                        : formatCurrency(item.discount.value, order.currency)}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {/* 합계 행 */}
            <TableRow>
              <TableCell colSpan={3} className="text-right font-medium">
                총 결제금액
              </TableCell>
              <TableCell className="text-right">
                <div className="text-lg font-bold text-blue-600">
                  {formatCurrency(order.totalAmount, order.currency)}
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* 결제 정보 및 주문자 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* 결제 정보 */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            결제 정보
          </h2>
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-5 text-sm text-gray-500">결제 방법</div>
                <div className="col-span-7 text-sm">
                  {order.payment?.method === 'credit_card' ? '신용카드' : 
                   order.payment?.method === 'bank_transfer' ? '계좌이체' : 
                   order.payment?.method === 'kakao_pay' ? '카카오페이' : 
                   order.payment?.method === 'naver_pay' ? '네이버페이' : 
                   order.payment?.method}
                </div>
                
                <div className="col-span-5 text-sm text-gray-500">결제 상태</div>
                <div className="col-span-7">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${order.payment?.status ? getStatusColor(order.payment.status) : 'bg-gray-100 text-gray-800'}`}>
                    {order.payment?.status === 'completed' ? '결제완료' :
                     order.payment?.status === 'pending' ? '결제대기' :
                     order.payment?.status === 'failed' ? '결제실패' :
                     order.payment?.status === 'refunded' ? '환불완료' :
                     order.payment?.status === 'partially_refunded' ? '부분환불' :
                     order.payment?.status}
                  </span>
                </div>
                
                <div className="col-span-5 text-sm text-gray-500">결제 금액</div>
                <div className="col-span-7 text-sm">
                  {formatCurrency(order.totalAmount, order.currency)}
                </div>
                
                {order.payment?.paidAt && (
                  <>
                    <div className="col-span-5 text-sm text-gray-500">결제 일시</div>
                    <div className="col-span-7 text-sm">
                      {formatDate(order.payment.paidAt)}
                    </div>
                  </>
                )}
                
                {order.payment?.transactionId && (
                  <>
                    <div className="col-span-5 text-sm text-gray-500">거래 번호</div>
                    <div className="col-span-7 text-sm">
                      {order.payment.transactionId}
                    </div>
                  </>
                )}
                
                {order.payment?.refundInfo && (
                  <>
                    <div className="col-span-12">
                      <Separator className="my-2" />
                      <h3 className="text-sm font-medium mb-2">환불 정보</h3>
                    </div>
                    <div className="col-span-5 text-sm text-gray-500">환불 금액</div>
                    <div className="col-span-7 text-sm">
                      {formatCurrency(order.payment.refundInfo.amount, order.currency)}
                    </div>
                    <div className="col-span-5 text-sm text-gray-500">환불 사유</div>
                    <div className="col-span-7 text-sm">
                      {order.payment.refundInfo.reason}
                    </div>
                    <div className="col-span-5 text-sm text-gray-500">환불 일시</div>
                    <div className="col-span-7 text-sm">
                      {formatDate(order.payment.refundInfo.date)}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 주문자 정보 */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            주문자 정보
          </h2>
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-4 text-sm text-gray-500">이름</div>
                <div className="col-span-8 text-sm">{order.customer.name}</div>
                
                <div className="col-span-4 text-sm text-gray-500">이메일</div>
                <div className="col-span-8 text-sm">{order.customer.email}</div>
                
                <div className="col-span-4 text-sm text-gray-500">연락처</div>
                <div className="col-span-8 text-sm">{order.customer.phone}</div>
                
                {order.customer.address && (
                  <>
                    <div className="col-span-4 text-sm text-gray-500">주소</div>
                    <div className="col-span-8 text-sm">
                      {order.customer.address.postalCode && `(${order.customer.address.postalCode}) `}
                      {order.customer.address.street && `${order.customer.address.street}, `}
                      {order.customer.address.city && `${order.customer.address.city}, `}
                      {order.customer.address.state && `${order.customer.address.state}, `}
                      {order.customer.address.country && order.customer.address.country}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 특별 요청 사항 */}
      {order.specialRequests && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">
            특별 요청 사항
          </h2>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm">
                {order.specialRequests}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 주문 상태 변경 이력 */}
      {order.history && Array.isArray(order.history) && order.history.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">
            주문 상태 변경 이력
          </h2>
          <Card>
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>일시</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>비고</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.history.map((historyItem, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(historyItem.timestamp)}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeStyle(historyItem.status)}`}>
                            {statusLabels[historyItem.status] || historyItem.status}
                          </span>
                        </TableCell>
                        <TableCell>{historyItem.note || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
