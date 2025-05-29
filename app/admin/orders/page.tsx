'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AdminPageLayout } from '../components/AdminPageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, FileDown, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'paid' | 'processing' | 'ready' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

// 주문 상태별 색상 정의
const statusColors: Record<Order['status'], string> = {
  'pending': 'bg-gray-100 text-gray-800',
  'confirmed': 'bg-blue-100 text-blue-800',
  'paid': 'bg-green-100 text-green-800',
  'processing': 'bg-yellow-100 text-yellow-800',
  'ready': 'bg-purple-100 text-purple-800',
  'completed': 'bg-green-100 text-green-800',
  'cancelled': 'bg-red-100 text-red-800',
  'refunded': 'bg-red-100 text-red-800'
};

// 주문 상태 한글 표시
const statusLabels: Record<Order['status'], string> = {
  'pending': '대기중',
  'confirmed': '확인됨',
  'paid': '결제완료',
  'processing': '처리중',
  'ready': '준비완료',
  'completed': '완료됨',
  'cancelled': '취소됨',
  'refunded': '환불됨'
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchOrders();
  }, [activeTab]);
  
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const ordersRef = collection(db, 'orders');
      let ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'), limit(50));
      
      // 상태별 필터링
      if (activeTab !== 'all') {
        ordersQuery = query(ordersRef, where('status', '==', activeTab), orderBy('createdAt', 'desc'), limit(50));
      }
      
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersList = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      setOrders(ordersList);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('주문 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 검색 로직 구현
    // 실제 구현에서는 Firebase 쿼리로 검색하거나 클라이언트 측에서 필터링
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
  };
  
  const formatDate = (dateValue: any) => {
    try {
      // Firebase Timestamp 객체 처리
      if (dateValue && typeof dateValue === 'object') {
        if ('toDate' in dateValue) {
          const date = dateValue.toDate();
          return format(date, 'yyyy-MM-dd HH:mm', { locale: ko });
        }
        
        // seconds/nanoseconds 객체 처리
        if ('seconds' in dateValue && 'nanoseconds' in dateValue) {
          const date = new Date(dateValue.seconds * 1000);
          return format(date, 'yyyy-MM-dd HH:mm', { locale: ko });
        }
      }
      
      // 문자열 처리
      if (typeof dateValue === 'string') {
        return format(parseISO(dateValue), 'yyyy-MM-dd HH:mm', { locale: ko });
      }
      
      // Date 객체 처리
      if (dateValue instanceof Date) {
        return format(dateValue, 'yyyy-MM-dd HH:mm', { locale: ko });
      }
      
      return '날짜 정보 없음';
    } catch (error) {
      console.error('날짜 변환 오류:', error, dateValue);
      return '날짜 오류';
    }
  };
  
  // 검색 결과 필터링
  const filteredOrders = searchQuery
    ? orders.filter(order => 
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : orders;
  
  return (
    <AdminPageLayout
      title="주문 관리"
      description="여행 상품 주문 및 예약 관리"
      actions={
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="주문번호, 고객명 검색..."
              className="pl-8 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <Button variant="outline" className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            내보내기
          </Button>
        </div>
      }
    >
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">전체 주문</TabsTrigger>
          <TabsTrigger value="pending">대기중</TabsTrigger>
          <TabsTrigger value="confirmed">확인됨</TabsTrigger>
          <TabsTrigger value="paid">결제완료</TabsTrigger>
          <TabsTrigger value="processing">처리중</TabsTrigger>
          <TabsTrigger value="completed">완료됨</TabsTrigger>
          <TabsTrigger value="cancelled">취소됨</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          <Card>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {searchQuery ? '검색 결과가 없습니다.' : '주문 내역이 없습니다.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left font-medium">주문번호</th>
                        <th className="py-3 px-4 text-left font-medium">고객명</th>
                        <th className="py-3 px-4 text-left font-medium">상품</th>
                        <th className="py-3 px-4 text-right font-medium">금액</th>
                        <th className="py-3 px-4 text-center font-medium">상태</th>
                        <th className="py-3 px-4 text-left font-medium">주문일시</th>
                        <th className="py-3 px-4 text-center font-medium">관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <span className="font-medium">{order.orderNumber}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div>{order.customerName}</div>
                            <div className="text-xs text-gray-500">{order.customerEmail}</div>
                          </td>
                          <td className="py-3 px-4">
                            {order.items && order.items.length > 0 ? (
                              <div>
                                <div>{order.items[0].productName}</div>
                                {order.items.length > 1 && (
                                  <div className="text-xs text-gray-500">외 {order.items.length - 1}개</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {formatCurrency(order.totalAmount)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${statusColors[order.status]}`}>
                              {statusLabels[order.status]}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Link href={`/admin/orders/${order.id}`}>
                              <Button variant="ghost" size="icon" title="주문 상세보기">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
}
