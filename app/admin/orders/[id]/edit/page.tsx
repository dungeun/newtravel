'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminPageLayout } from '@/admin/components/AdminPageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Save, X, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// 주문 상태 타입
type OrderStatus = 'pending' | 'confirmed' | 'paid' | 'processing' | 'ready' | 'completed' | 'cancelled' | 'refunded';

// 주문 타입
interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  notes?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

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

export default function OrderEditPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  // 편집 가능한 필드
  const [formData, setFormData] = useState({
    status: '',
    notes: '',
    specialRequests: '',
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  });
  
  // 주문 정보 조회
  const fetchOrderDetail = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnapshot = await getDoc(orderRef);
      
      if (!orderSnapshot.exists()) {
        throw new Error('주문 정보를 찾을 수 없습니다.');
      }
      
      const orderData = { id: orderSnapshot.id, ...orderSnapshot.data() } as Order;
      setOrder(orderData);
      
      // 폼 데이터 초기화
      setFormData({
        status: orderData.status,
        notes: orderData.notes || '',
        specialRequests: orderData.specialRequests || '',
        customerName: orderData.customer.name,
        customerEmail: orderData.customer.email,
        customerPhone: orderData.customer.phone
      });
    } catch (err: any) {
      console.error('주문 정보 조회 오류:', err);
      setError(err.message || '주문 정보를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 입력 필드 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // 주문 정보 저장
  const handleSaveOrder = async () => {
    setSaving(true);
    setError(null);
    setConfirmDialogOpen(false);
    
    try {
      // 업데이트할 데이터 준비
      const updateData = {
        status: formData.status,
        notes: formData.notes,
        specialRequests: formData.specialRequests,
        customer: {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone
        },
        updatedAt: new Date().toISOString()
      };
      
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, updateData);
      
      // 성공 시 상세 페이지로 이동
      router.push(`/admin/orders/${orderId}`);
    } catch (err: any) {
      console.error('주문 정보 업데이트 오류:', err);
      setError(err.message || '주문 정보 업데이트 중 오류가 발생했습니다.');
      setSaving(false);
    }
  };
  
  // 컴포넌트 마운트 시 주문 정보 조회
  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);
  
  // 사용하지 않는 함수 제거
  
  return (
    <AdminPageLayout
      title="주문 수정"
      description={order ? `주문번호: ${order.orderNumber}` : '주문 정보 로딩 중...'}
    >
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error && !order ? (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button variant="outline" asChild>
            <Link href="/admin/orders" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              주문 목록으로 돌아가기
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>주문 상태 변경</CardTitle>
              <CardDescription>주문의 현재 처리 상태를 변경합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">주문 상태</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as OrderStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="주문 상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>고객 정보</CardTitle>
              <CardDescription>주문한 고객의 정보를 수정합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="customerName">고객명</Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customerEmail">이메일</Label>
                  <Input
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customerPhone">전화번호</Label>
                  <Input
                    id="customerPhone"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>주문 메모</CardTitle>
              <CardDescription>주문에 대한 메모와 특별 요청 사항을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="notes">관리자 메모</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="주문에 대한 내부 메모를 입력하세요."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="specialRequests">고객 요청사항</Label>
                  <Textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="고객의 특별 요청사항을 입력하세요."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href={`/admin/orders/${orderId}`} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                취소
              </Link>
            </Button>
            <Button 
              onClick={() => setConfirmDialogOpen(true)} 
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              저장하기
            </Button>
          </div>
          
          <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>주문 정보 변경 확인</AlertDialogTitle>
                <AlertDialogDescription>
                  주문 정보를 변경하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction onClick={handleSaveOrder}>확인</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </AdminPageLayout>
  );
}
