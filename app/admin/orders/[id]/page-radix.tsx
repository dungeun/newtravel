'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Order, OrderStatus } from '@/types/order';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Icons
import { 
  ArrowLeft, 
  Edit, 
  Printer, 
  Mail, 
  Receipt, 
  XCircle, 
  RefreshCw, 
  CreditCard, 
  Truck,
  Loader2,
  Info,
  AlertCircle
} from 'lucide-react';

// 주문 상태별 색상 정의
const statusColors: Record<OrderStatus, string> = {
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
const statusLabels: Record<OrderStatus, string> = {
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
const formatDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return '-';
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
const formatCurrency = (amount: number, currency: string = 'KRW'): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// OrderLineItems 컴포넌트 - 주문 상품 목록 표시
const OrderLineItems = ({ order }: { order: Order }): JSX.Element => {
  return (
    <div className="rounded-lg border p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4">주문 상품 정보</h3>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>상품명</TableHead>
              <TableHead className="text-center">옵션</TableHead>
              <TableHead className="text-center">여행 일정</TableHead>
              <TableHead className="text-right">단가</TableHead>
              <TableHead className="text-right">수량</TableHead>
              <TableHead className="text-right">금액</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="font-medium">
                    {item.productTitle}
                  </div>
                  {item.productId && (
                    <div className="text-xs text-gray-500">
                      상품 ID: {item.productId}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {item.quantity ? (
                    <div className="flex flex-wrap gap-1 justify-center">
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
              <TableCell colSpan={5} className="text-right font-semibold">
                총 주문금액
              </TableCell>
              <TableCell className="text-right font-bold text-lg">
                {formatCurrency(order.totalAmount, order.currency)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// OrderCustomerInfo 컴포넌트 - 고객 정보 표시
const OrderCustomerInfo = ({ order }: { order: Order }): JSX.Element => {
  return (
    <div className="rounded-lg border p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4">고객 정보</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>주문자 정보</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <div className="grid grid-cols-4 gap-3">
              <div className="font-semibold">고객명</div>
              <div className="col-span-3">{order.customer.name}</div>
              
              <div className="font-semibold">이메일</div>
              <div className="col-span-3">{order.customer.email}</div>
              
              <div className="font-semibold">전화번호</div>
              <div className="col-span-3">{order.customer.phone}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>특별 요청사항</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            {order.specialRequests ? (
              <p>{order.specialRequests}</p>
            ) : (
              <p className="text-gray-500">특별 요청사항이 없습니다.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// OrderStatusHistory 컴포넌트 - 주문 상태 이력 표시
const OrderStatusHistory = ({ order }: { order: Order }): JSX.Element => {
  return (
    <div className="rounded-lg border p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4">주문 상태 이력</h3>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>날짜</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>메모</TableHead>
            </TableRow>
          </TableHeader>
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
    </div>
  );
};
