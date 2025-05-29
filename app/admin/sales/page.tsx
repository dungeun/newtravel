'use client';

import React, { useState, useEffect } from 'react';
import { AdminPageLayout } from '../components/AdminPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { format, subDays, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Download } from 'lucide-react';
// Calendar 컴포넌트 대신 Input 사용
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';

interface SalesData {
  date: string;
  totalSales: number;
  orderCount: number;
  averageOrderValue: number;
}

interface ProductSalesData {
  productId: string;
  productName: string;
  totalSales: number;
  orderCount: number;
}

export default function SalesPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [startDateStr, setStartDateStr] = useState<string>(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDateStr, setEndDateStr] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [productSalesData, setProductSalesData] = useState<ProductSalesData[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [averageOrderValue, setAverageOrderValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, [period, startDateStr, endDateStr]);
  
  // 날짜 문자열이 변경될 때 Date 객체 업데이트
  useEffect(() => {
    try {
      setStartDate(parseISO(startDateStr));
    } catch (error) {
      console.error('Invalid start date format');
    }
  }, [startDateStr]);
  
  useEffect(() => {
    try {
      setEndDate(parseISO(endDateStr));
    } catch (error) {
      console.error('Invalid end date format');
    }
  }, [endDateStr]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      // 주문 데이터 가져오기
      const ordersRef = collection(db, 'orders');
      // 날짜 문자열을 ISO 문자열로 변환
      const startTimestamp = new Date(`${startDateStr}T00:00:00`).toISOString();
      const endTimestamp = new Date(`${endDateStr}T23:59:59`).toISOString();
      
      const ordersQuery = query(
        ordersRef,
        where('createdAt', '>=', startTimestamp),
        where('createdAt', '<=', endTimestamp),
        orderBy('createdAt', 'asc')
      );
      
      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // 총 매출 및 주문 수 계산
      let totalSalesAmount = 0;
      let orderCount = orders.length;
      
      orders.forEach(order => {
        if (order.totalAmount) {
          totalSalesAmount += order.totalAmount;
        }
      });
      
      setTotalSales(totalSalesAmount);
      setTotalOrders(orderCount);
      setAverageOrderValue(orderCount > 0 ? totalSalesAmount / orderCount : 0);
      
      // 기간별 매출 데이터 생성
      const salesByDate = new Map<string, { totalSales: number, orderCount: number }>();
      const salesByProduct = new Map<string, { productId: string, productName: string, totalSales: number, orderCount: number }>();
      
      orders.forEach(order => {
        // 날짜 포맷팅 (일별, 주별, 월별)
        let dateKey = '';
        const orderDate = parseISO(order.createdAt);
        
        if (period === 'daily') {
          dateKey = format(orderDate, 'yyyy-MM-dd');
        } else if (period === 'weekly') {
          dateKey = `${format(orderDate, 'yyyy')}-W${format(orderDate, 'ww')}`;
        } else if (period === 'monthly') {
          dateKey = format(orderDate, 'yyyy-MM');
        }
        
        // 날짜별 매출 데이터 업데이트
        if (!salesByDate.has(dateKey)) {
          salesByDate.set(dateKey, { totalSales: 0, orderCount: 0 });
        }
        
        const dateData = salesByDate.get(dateKey)!;
        dateData.totalSales += order.totalAmount || 0;
        dateData.orderCount += 1;
        
        // 상품별 매출 데이터 업데이트
        if (order.items) {
          order.items.forEach(item => {
            const productId = item.productId;
            const productName = item.productName || '알 수 없는 상품';
            
            if (!salesByProduct.has(productId)) {
              salesByProduct.set(productId, { 
                productId, 
                productName, 
                totalSales: 0, 
                orderCount: 0 
              });
            }
            
            const productData = salesByProduct.get(productId)!;
            productData.totalSales += (item.price || 0) * (item.quantity || 1);
            productData.orderCount += 1;
          });
        }
      });
      
      // 날짜별 매출 데이터 변환
      const formattedSalesData: SalesData[] = Array.from(salesByDate.entries()).map(([date, data]) => ({
        date,
        totalSales: data.totalSales,
        orderCount: data.orderCount,
        averageOrderValue: data.orderCount > 0 ? data.totalSales / data.orderCount : 0
      }));
      
      // 상품별 매출 데이터 변환
      const formattedProductSalesData: ProductSalesData[] = Array.from(salesByProduct.values())
        .sort((a, b) => b.totalSales - a.totalSales);
      
      setSalesData(formattedSalesData);
      setProductSalesData(formattedProductSalesData);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
  };

  const handleExportData = () => {
    // CSV 데이터 생성
    const csvHeader = 'Date,Total Sales,Order Count,Average Order Value\n';
    const csvData = salesData.map(item => 
      `${item.date},${item.totalSales},${item.orderCount},${item.averageOrderValue}`
    ).join('\n');
    
    const csvContent = csvHeader + csvData;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // 다운로드 링크 생성 및 클릭
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sales-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDateForDisplay = (date: Date) => {
    return format(date, 'PPP', { locale: ko });
  };

  return (
    <AdminPageLayout
      title="매출 관리"
      description="여행 상품 매출 통계 및 분석"
      actions={
        <Button onClick={handleExportData} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          보고서 다운로드
        </Button>
      }
    >
      {/* 필터 및 기간 선택 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">기간:</span>
              <Select value={period} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setPeriod(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="기간 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">일별</SelectItem>
                  <SelectItem value="weekly">주별</SelectItem>
                  <SelectItem value="monthly">월별</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">시작일:</span>
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                <Input
                  type="date"
                  value={startDateStr}
                  onChange={(e) => setStartDateStr(e.target.value)}
                  className="w-[200px]"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">종료일:</span>
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                <Input
                  type="date"
                  value={endDateStr}
                  onChange={(e) => setEndDateStr(e.target.value)}
                  className="w-[200px]"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 매출 요약 카드 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '로딩 중...' : formatCurrency(totalSales)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDateForDisplay(startDate)} ~ {formatDateForDisplay(endDate)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 주문 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '로딩 중...' : totalOrders.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDateForDisplay(startDate)} ~ {formatDateForDisplay(endDate)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">평균 주문 금액</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '로딩 중...' : formatCurrency(averageOrderValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDateForDisplay(startDate)} ~ {formatDateForDisplay(endDate)}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* 매출 차트 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>기간별 매출 추이</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 rounded-full"></div>
            </div>
          ) : salesData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              해당 기간에 매출 데이터가 없습니다.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={salesData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `날짜: ${label}`}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="totalSales" name="총 매출" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="orderCount" name="주문 수" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
      
      {/* 상품별 매출 */}
      <Card>
        <CardHeader>
          <CardTitle>상품별 매출</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 rounded-full"></div>
            </div>
          ) : productSalesData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              해당 기간에 상품 매출 데이터가 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left">상품명</th>
                    <th className="py-3 px-4 text-right">총 매출</th>
                    <th className="py-3 px-4 text-right">판매 수량</th>
                    <th className="py-3 px-4 text-right">평균 판매가</th>
                  </tr>
                </thead>
                <tbody>
                  {productSalesData.map((product) => (
                    <tr key={product.productId} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{product.productName}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(product.totalSales)}</td>
                      <td className="py-3 px-4 text-right">{product.orderCount}</td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(product.orderCount > 0 ? product.totalSales / product.orderCount : 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}
