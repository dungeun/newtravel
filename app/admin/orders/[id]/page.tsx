'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '../../../components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';

// Icons
import { 
  ArrowLeft,
  CreditCard,
  Mail,
  Edit,
  Printer,
  RefreshCw,
  Receipt,
  Truck,
  Info,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// 주문 상태별 색상 정의 (Tailwind CSS 클래스)
const statusColors: Record<string, string> = {
  'pending': 'bg-gray-200 text-gray-800',
  'confirmed': 'bg-blue-100 text-blue-800',
  'paid': 'bg-indigo-100 text-indigo-800',
  'processing': 'bg-yellow-100 text-yellow-800',
  'ready': 'bg-purple-100 text-purple-800',
  'completed': 'bg-green-100 text-green-800',
  'cancelled': 'bg-red-100 text-red-800',
  'refunded': 'bg-red-100 text-red-800'
};

// 주문 상태 한글 표시
const statusLabels: Record<string, string> = {
  'pending': '대기중',
  'confirmed': '확인됨',
  'paid': '결제완료',
  'processing': '처리중',
  'ready': '준비완료',
  'completed': '완료됨',
  'cancelled': '취소됨',
  'refunded': '환불됨'
};

// 결제 상태 한글 표시
const paymentStatusLabels: Record<string, string> = {
  'pending': '결제 대기중',
  'completed': '결제 완료',
  'failed': '결제 실패',
  'refunded': '환불 완료',
  'partially_refunded': '부분 환불'
};

// 결제 상태별 색상 정의
const paymentStatusColors: Record<string, string> = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'completed': 'bg-green-100 text-green-800',
  'failed': 'bg-red-100 text-red-800',
  'refunded': 'bg-red-100 text-red-800',
  'partially_refunded': 'bg-blue-100 text-blue-800'
};

// 날짜 포맷팅 함수
const formatDate = (dateValue: any): string => {
  if (!dateValue) return '-';
  
  try {
    // Firebase Timestamp 객체 처리
    if (dateValue && typeof dateValue === 'object' && 'toDate' in dateValue) {
      const date = dateValue.toDate();
      return format(date, 'yyyy.MM.dd HH:mm', { locale: ko });
    }
    
    // 일반 Date 객체나 문자열 처리
    const date = new Date(dateValue);
    return format(date, 'yyyy.MM.dd HH:mm', { locale: ko });
  } catch (error) {
    console.error('날짜 변환 오류:', error);
    return '-';
  }
};

// 금액 포맷팅 함수
const formatCurrency = (amount: number, currency: string = 'KRW'): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// OrderLineItems 컴포넌트 - 주문 상품 목록 표시
const OrderLineItems = ({ order }: { order: any }): JSX.Element => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <h3 className="text-lg font-semibold">주문 상품 정보</h3>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className="font-medium">상품명</TableCell>
                <TableCell className="text-center font-medium">옵션</TableCell>
                <TableCell className="text-center font-medium">여행 일정</TableCell>
                <TableCell className="text-right font-medium">단가</TableCell>
                <TableCell className="text-right font-medium">수량</TableCell>
                <TableCell className="text-right font-medium">금액</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items.map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="font-medium">{item.productTitle}</div>
                    {item.productId && (
                      <div className="text-xs text-gray-500">
                        상품 ID: {item.productId}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.quantity ? (
                      <div className="flex flex-wrap justify-center gap-1">
                        {item.quantity.adult > 0 && (
                          <Badge variant="outline" className="text-xs">
                            성인 {item.quantity.adult}명
                          </Badge>
                        )}
                        {item.quantity.child > 0 && (
                          <Badge variant="outline" className="text-xs">
                            아동 {item.quantity.child}명
                          </Badge>
                        )}
                        {item.quantity.infant > 0 && (
                          <Badge variant="outline" className="text-xs">
                            유아 {item.quantity.infant}명
                          </Badge>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.travelDate ? (
                      <div className="text-sm">
                        {formatDate(item.travelDate.startDate)} ~ {formatDate(item.travelDate.endDate)}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.price ? formatCurrency(item.price.adult, item.price.currency) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.quantity ? (
                      (item.quantity.adult || 0) + (item.quantity.child || 0) + (item.quantity.infant || 0)
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(item.subtotal, order.currency)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={5} className="text-right font-medium">
                  총 주문금액
                </TableCell>
                <TableCell className="text-right font-bold text-lg">
                  {formatCurrency(order.totalAmount, order.currency)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

// OrderCustomerInfo 컴포넌트 - 고객 정보 표시
const OrderCustomerInfo = ({ order }: { order: any }): JSX.Element => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <h3 className="text-lg font-semibold">고객 정보</h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="h-full">
            <CardHeader>
              <h4 className="text-base font-medium">주문자 정보</h4>
            </CardHeader>
            <Separator />
            <CardContent>
              <dl className="grid grid-cols-4 gap-2">
                <dt className="col-span-1 font-medium text-gray-600">고객명</dt>
                <dd className="col-span-3">{order.customer.name}</dd>
                
                <dt className="col-span-1 font-medium text-gray-600">이메일</dt>
                <dd className="col-span-3">{order.customer.email}</dd>
                
                <dt className="col-span-1 font-medium text-gray-600">전화번호</dt>
                <dd className="col-span-3">{order.customer.phone}</dd>
              </dl>
            </CardContent>
          </Card>
          
          <Card className="h-full">
            <CardHeader>
              <h4 className="text-base font-medium">특별 요청사항</h4>
            </CardHeader>
            <Separator />
            <CardContent>
              {order.specialRequests ? (
                <p>{order.specialRequests}</p>
              ) : (
                <p className="text-gray-500">특별 요청사항이 없습니다.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

// OrderStatusHistory 컴포넌트 - 주문 상태 이력 표시
const OrderStatusHistory = ({ order }: { order: any }): JSX.Element => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <h3 className="text-lg font-semibold">주문 상태 이력</h3>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className="font-medium">날짜</TableCell>
                <TableCell className="font-medium">상태</TableCell>
                <TableCell className="font-medium">메모</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* 주문 생성 이력 */}
              <TableRow>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>
                  <Badge className="bg-blue-100 text-blue-800">
                    주문 생성
                  </Badge>
                </TableCell>
                <TableCell>주문이 생성되었습니다.</TableCell>
              </TableRow>
              
              {/* 주문 상태 변경 이력 - 실제로는 API에서 이력 데이터를 받아와야 함 */}
              <TableRow>
                <TableCell>{formatDate(order.updatedAt)}</TableCell>
                <TableCell>
                  <Badge className={statusColors[order.status]}>
                    {statusLabels[order.status]}
                  </Badge>
                </TableCell>
                <TableCell>{order.notes || '-'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default function OrderDetailPage(): JSX.Element {
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNote, setStatusNote] = useState('');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  
  // 취소/환불 관련 상태
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState<number | string>('');
  const [refundType, setRefundType] = useState('full');
  const [actionLoading, setActionLoading] = useState(false);

  // URL 쿼리 파라미터 처리
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const action = searchParams.get('action');
    
    if (action === 'cancel') {
      setCancelDialogOpen(true);
    } else if (action === 'refund') {
      setRefundDialogOpen(true);
    }
    
    // 현재 URL에서 쿼리 파라미터 제거 (다이얼로그가 닫히면 다시 열리는 것을 방지)
    if (action) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, []);

  // 주문 정보 조회
  const fetchOrderDetail = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const orderId = params.id;
      const response = await fetch(`/api/admin/orders/${orderId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '주문 정보를 가져오는 데 실패했습니다.');
      }
      
      const data = await response.json();
      setOrder(data.order);
    } catch (err: any) {
      console.error('주문 정보 조회 오류:', err);
      setError(err.message || '주문 정보를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 상태 변경 다이얼로그 열기
  const handleOpenStatusDialog = (): void => {
    if (order) {
      setNewStatus(order.status);
      setStatusNote('');
      setStatusDialogOpen(true);
    }
  };
  
  // 상태 변경 다이얼로그 닫기
  const handleCloseStatusDialog = (): void => {
    setStatusDialogOpen(false);
    setNewStatus('');
    setStatusNote('');
  };
  
  // 상태 변경 처리
  const handleStatusChange = async (): Promise<void> => {
    if (!newStatus) return;
    
    try {
      setActionLoading(true);
      
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote
        })
      });
      
      if (response.ok) {
        // 성공 처리
        setStatusDialogOpen(false);
        setNewStatus('');
        setStatusNote('');
        fetchOrderDetail(); // 주문 정보 새로 가져오기
      } else {
        // 오류 처리
        const errorData = await response.json();
        throw new Error(errorData.message || '상태 변경 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('상태 변경 오류:', err);
      alert(`상태 변경 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setActionLoading(false);
    }
  };
  
  // 주문 취소 처리
  const handleCancelOrder = async () => {
    if (!order) return;
    
    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/orders/${order.id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: cancelReason || '관리자에 의한 주문 취소'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 주문 취소 성공
        setCancelDialogOpen(false);
        setCancelReason('');
        fetchOrderDetail(); // 주문 정보 새로 가져오기
      } else {
        // 오류 처리
        setError(data.error || '주문 취소 중 오류가 발생했습니다.');
      }
    } catch (err) {
      setError('서버 연결 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  };
  
  // 주문 환불 처리
  const handleRefundOrder = async () => {
    if (!order) return;
    
    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/orders/${order.id}/refund`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: refundReason || '관리자에 의한 주문 환불',
          amount: refundAmount || order.totalAmount,
          isPartial: refundType === 'partial'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 주문 환불 성공
        setRefundDialogOpen(false);
        setRefundReason('');
        setRefundAmount('');
        setRefundType('full');
        fetchOrderDetail(); // 주문 정보 새로 가져오기
      } else {
        // 오류 처리
        setError(data.error || '주문 환불 중 오류가 발생했습니다.');
      }
    } catch (err) {
      setError('서버 연결 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  };
  
  // 이메일 전송 핸들러
  const handleSendEmail = (): void => {
    // 이메일 전송 로직 구현 (추후 개발)
    alert('이메일 전송 기능은 아직 구현되지 않았습니다.');
  };
  
  // 인쇄 핸들러
  const handlePrint = (): void => {
    window.print();
  };
  
  // 컴포넌트 마운트 시 주문 정보 조회
  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>주문 정보를 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          variant="default"
          onClick={() => window.location.href = '/admin/orders'}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          주문 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <Alert variant="warning" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>알림</AlertTitle>
          <AlertDescription>주문 정보를 찾을 수 없습니다.</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          asChild
        >
          <Link href="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            주문 목록으로 돌아가기
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 브레드크럼 네비게이션 */}
      <nav className="flex items-center space-x-2 mb-6" aria-label="Breadcrumb">
        <Link href="/admin" className="text-gray-500 hover:text-gray-700">
          관리자
        </Link>
        <span className="text-gray-400">/</span>
        <Link href="/admin/orders" className="text-gray-500 hover:text-gray-700">
          주문 관리
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">주문 상세</span>
      </nav>
      
      {/* 주문 헤더 */}
      <Card className="p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold mr-2">주문 #{order.orderNumber}</h1>
            <Badge className={statusColors[order.status]}>
              {statusLabels[order.status] || order.status}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fetchOrderDetail()}
              title="새로고침"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={handleSendEmail}
            >
              <Mail className="mr-2 h-4 w-4" />
              이메일 전송
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
            >
              <Printer className="mr-2 h-4 w-4" />
              인쇄
            </Button>
            <Button
              variant="outline"
              asChild
            >
              <Link href={`/admin/orders/${orderId}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                수정
              </Link>
            </Button>
            <Button
              variant="default"
              onClick={handleOpenStatusDialog}
            >
              상태 변경
            </Button>
          </div>
        </div>
      </Card>
      
      {/* 주문 정보 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-4">
          <div className="flex items-center mb-2">
            <CreditCard className="h-4 w-4 text-gray-600 mr-2" />
            <h2 className="text-lg font-bold">결제 정보</h2>
          </div>
          <Separator className="my-2" />
          <div className="mt-2">
            <span className="text-gray-600 text-sm">결제 방법</span>
            <p className="text-base">{order.payment?.method || '-'}</p>
          </div>
          <div className="mt-2">
            <span className="text-gray-600 text-sm">결제 상태</span>
            <div className="mt-1">
              {order.payment?.status && (
                <Badge className={order.payment?.status ? paymentStatusColors[order.payment.status] : ''}>
                  {order.payment?.status ? paymentStatusLabels[order.payment.status] : '-'}
                </Badge>
              )}
            </div>
          </div>
          <div className="mt-2">
            <span className="text-gray-600 text-sm">총 금액</span>
            <p className="text-lg font-bold text-primary">{formatCurrency(order.totalAmount, order.currency)}</p>
          </div>
        </Card>
        <Card className="p-4 mb-6">
          <div className="flex items-center mb-2">
            <Receipt className="h-4 w-4 text-gray-600 mr-2" />
            <h2 className="text-lg font-bold">주문 정보</h2>
          </div>
          <Separator className="my-2" />
          <div className="mt-2">
            <span className="text-gray-600 text-sm">주문번호</span>
            <p className="text-base">{order.orderNumber}</p>
          </div>
          <div className="mt-2">
            <span className="text-gray-600 text-sm">주문일시</span>
            <p className="text-base">{formatDate(order.createdAt)}</p>
          </div>
          <div className="mt-2">
            <span className="text-gray-600 text-sm">최종 수정일시</span>
            <p className="text-base">{formatDate(order.updatedAt)}</p>
          </div>
        </Card>
        
        <Card className="p-4 mb-6">
          <div className="flex items-center mb-2">
            <Truck className="h-4 w-4 text-gray-600 mr-2" />
            <h2 className="text-lg font-bold">배송 정보</h2>
          </div>
          <Separator className="my-2" />
          <div className="mt-2">
            <span className="text-gray-600 text-sm">배송 방법</span>
            <p className="text-base">{order.shipping?.method || '-'}</p>
          </div>
          <div className="mt-2">
            <span className="text-gray-600 text-sm">배송 상태</span>
            <div className="mt-1">
              {order.shipping?.status && (
                <Badge className={order.shipping?.status ? 'bg-yellow-100 text-yellow-800' : ''}>
                  {order.shipping?.status ? '배송중' : '-'}
                </Badge>
              )}
            </div>
          </div>
          <div className="mt-2">
            <span className="text-gray-600 text-sm">추적 번호</span>
            <p className="text-base">{order.shipping?.trackingNumber || '-'}</p>
          </div>
        </Card>
        <Card className="p-4 mb-6">
          <div className="flex items-center mb-2">
            <Info className="h-4 w-4 text-gray-600 mr-2" />
            <h2 className="text-lg font-bold">여행 정보</h2>
          </div>
          <Separator className="my-2" />
          {order.items[0]?.travelDate ? (
            <>
              <div className="mt-2">
                <span className="text-gray-600 text-sm">여행 시작일</span>
                <p className="text-base">{formatDate(order.items[0].travelDate.startDate)}</p>
              </div>
              <div className="mt-2">
                <span className="text-gray-600 text-sm">여행 종료일</span>
                <p className="text-base">{formatDate(order.items[0].travelDate.endDate)}</p>
              </div>
            </>
          ) : (
            <div className="mt-2">
              <p className="text-gray-500">여행 일정 정보 없음</p>
            </div>
          )}
          <div className="mt-2">
            <span className="text-gray-600 text-sm">인원</span>
            <p className="text-base">
              {order.items[0]?.quantity ? (
                <>
                  성인 {order.items[0].quantity.adult || 0}명
                  {order.items[0].quantity.child > 0 && `, 아동 ${order.items[0].quantity.child}명`}
                  {order.items[0].quantity.infant > 0 && `, 유아 ${order.items[0].quantity.infant}명`}
                </>
              ) : '-'}
            </p>
          </div>
        </Card>
        
        <Card className="p-4 mb-6">
          <div className="flex items-center mb-2">
            <XCircle className={`h-4 w-4 mr-2 ${order.status === 'cancelled' || order.status === 'refunded' ? 'text-red-600' : 'text-gray-400'}`} />
            <h2 className="text-lg font-bold">취소/환불 정보</h2>
          </div>
          <Separator className="my-2" />
          {(order.status === 'cancelled' || order.status === 'refunded') ? (
            <>
              <div className="mt-2">
                <span className="text-gray-600 text-sm">상태</span>
                <div className="mt-1">
                  <Badge className="bg-red-100 text-red-800">
                    {statusLabels[order.status]}
                  </Badge>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-gray-600 text-sm">처리일시</span>
                <p className="text-base">{formatDate(order.updatedAt)}</p>
              </div>
              <div className="mt-2">
                <span className="text-gray-600 text-sm">사유</span>
                <p className="text-base">{order.notes || '정보 없음'}</p>
              </div>
            </>
          ) : (
            <div className="mt-4 flex flex-col items-center justify-center">
              <p className="text-gray-500 text-center mb-4">
                취소 또는 환불 처리되지 않은 주문입니다.
              </p>
              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  size="sm"
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={actionLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  주문 취소
                </Button>
                <Button 
                  variant="outline" 
                  className="text-amber-600 border-amber-600 hover:bg-amber-50"
                  size="sm"
                  onClick={() => setRefundDialogOpen(true)}
                  disabled={actionLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  환불 처리
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
      
      {/* 주문 상품 정보 */}
      <OrderLineItems order={order} />
      
      {/* 고객 정보 */}
      <OrderCustomerInfo order={order} />
      
      {/* 주문 상태 이력 */}
      <OrderStatusHistory order={order} />
      
      {/* 관리자 메모 */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="text-lg font-semibold">관리자 메모</h3>
        </CardHeader>
        <CardContent>
          <Textarea
            className="min-h-[120px] w-full"
            value={order?.notes || ''}
            placeholder="주문에 대한 관리자 메모를 입력하세요."
            onChange={(e) => {
              // 메모 저장 기능 구현 예정
              console.log('Notes changed:', e.target.value);
            }}
          />
          <div className="flex justify-end mt-4">
            <Button 
              onClick={() => alert('메모 저장 기능은 추후 구현 예정입니다.')}
            >
              메모 저장
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* 상태 변경 다이얼로그 */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>주문 상태 변경</DialogTitle>
            <DialogDescription>
              주문 #{order?.orderNumber}의 상태를 변경합니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="order-status">상태</Label>
              <Select
                value={newStatus}
                onValueChange={setNewStatus}
              >
                <SelectTrigger id="order-status">
                  <SelectValue placeholder="상태를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">결제 대기</SelectItem>
                  <SelectItem value="confirmed">주문 확인</SelectItem>
                  <SelectItem value="processing">처리중</SelectItem>
                  <SelectItem value="shipped">배송완료</SelectItem>
                  <SelectItem value="delivered">배송완료</SelectItem>
                  <SelectItem value="cancelled">취소됨</SelectItem>
                  <SelectItem value="refunded">환불됨</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status-note">메모</Label>
              <Textarea
                id="status-note"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="상태 변경에 대한 메모를 입력하세요"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseStatusDialog}>
              취소
            </Button>
            <Button 
              onClick={handleStatusChange} 
              disabled={actionLoading || !newStatus}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리중...
                </>
              ) : (
                '저장'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 주문 취소 다이얼로그 */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>주문 취소</DialogTitle>
            <DialogDescription>
              주문 #{order?.orderNumber}을(를) 취소하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cancel-reason">취소 사유</Label>
              <Textarea
                id="cancel-reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="취소 사유를 입력하세요"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              닫기
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCancelOrder} 
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리중...
                </>
              ) : (
                '취소 확인'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 주문 환불 다이얼로그 */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>주문 환불</DialogTitle>
            <DialogDescription>
              주문 #{order?.orderNumber}의 환불을 처리하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="refund-type">환불 유형</Label>
              <Select
                value={refundType}
                onValueChange={(value) => setRefundType(value)}
              >
                <SelectTrigger id="refund-type">
                  <SelectValue placeholder="환불 유형을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">전체 환불</SelectItem>
                  <SelectItem value="partial">부분 환불</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="refund-amount">환불 금액</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">₩</span>
                <Input
                  id="refund-amount"
                  type="number"
                  className="pl-7"
                  value={refundAmount.toString()}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  disabled={refundType === 'full'}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="refund-reason">환불 사유</Label>
              <Textarea
                id="refund-reason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="환불 사유를 입력하세요"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
              닫기
            </Button>
            <Button 
              onClick={handleRefundOrder} 
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리중...
                </>
              ) : (
                '환불 처리'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
