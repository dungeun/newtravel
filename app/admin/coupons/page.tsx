'use client';

import React, { useState, useEffect } from 'react';
import { AdminPageLayout } from '../components/AdminPageLayout';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  description: string;
  usageLimit: number;
  usageCount: number;
  status: 'active' | 'expired' | 'used';
  createdAt: string;
  productIds?: string[];
  userIds?: string[];
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    description: '',
    usageLimit: 1,
    productIds: [] as string[],
    userIds: [] as string[]
  });
  
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    fetchCoupons();
  }, []);
  
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const couponsQuery = query(collection(db, 'coupons'), orderBy('createdAt', 'desc'));
      const couponsSnapshot = await getDocs(couponsQuery);
      const couponsList = couponsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Coupon[];
      
      // 쿠폰 상태 업데이트 (만료 여부 등)
      const updatedCoupons = couponsList.map(coupon => {
        const now = new Date();
        const endDate = new Date(coupon.endDate);
        
        if (endDate < now) {
          return { ...coupon, status: 'expired' as const };
        }
        if (coupon.usageCount >= coupon.usageLimit) {
          return { ...coupon, status: 'used' as const };
        }
        return coupon;
      });
      
      setCoupons(updatedCoupons);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast({
        title: '쿠폰 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'value' || name === 'minOrderAmount' || name === 'maxDiscountAmount' || name === 'usageLimit'
        ? Number(value)
        : value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 쿠폰 코드 중복 확인
      const couponsQuery = query(collection(db, 'coupons'));
      const couponsSnapshot = await getDocs(couponsQuery);
      const existingCoupon = couponsSnapshot.docs.find(doc => 
        doc.data().code === formData.code
      );
      
      if (existingCoupon) {
        toast({
          title: '쿠폰 코드가 이미 존재합니다.',
          description: '다른 쿠폰 코드를 입력해주세요.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      // 쿠폰 데이터 생성
      const couponData = {
        code: formData.code,
        type: formData.type,
        value: formData.value,
        minOrderAmount: formData.minOrderAmount,
        maxDiscountAmount: formData.type === 'percentage' ? formData.maxDiscountAmount : undefined,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        description: formData.description,
        usageLimit: formData.usageLimit,
        usageCount: 0,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        productIds: formData.productIds.length > 0 ? formData.productIds : undefined,
        userIds: formData.userIds.length > 0 ? formData.userIds : undefined,
      };
      
      // Firestore에 쿠폰 추가
      await addDoc(collection(db, 'coupons'), couponData);
      
      toast({
        title: '쿠폰이 생성되었습니다.',
        description: `쿠폰 코드: ${formData.code}`,
      });
      
      // 폼 초기화 및 다이얼로그 닫기
      setFormData({
        code: '',
        type: 'percentage',
        value: 0,
        minOrderAmount: 0,
        maxDiscountAmount: 0,
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        description: '',
        usageLimit: 1,
        productIds: [],
        userIds: []
      });
      setIsDialogOpen(false);
      
      // 쿠폰 목록 새로고침
      fetchCoupons();
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast({
        title: '쿠폰 생성에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('정말로 이 쿠폰을 삭제하시겠습니까?')) return;
    
    try {
      await deleteDoc(doc(db, 'coupons', couponId));
      
      toast({
        title: '쿠폰이 삭제되었습니다.',
      });
      
      // 쿠폰 목록에서 삭제된 쿠폰 제거
      setCoupons(prev => prev.filter(coupon => coupon.id !== couponId));
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast({
        title: '쿠폰 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
  };
  
  const formatDateForDisplay = (dateString: string) => {
    return format(new Date(dateString), 'PPP', { locale: ko });
  };
  
  const getStatusBadgeClass = (status: Coupon['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'used':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusText = (status: Coupon['status']) => {
    switch (status) {
      case 'active':
        return '활성';
      case 'expired':
        return '만료됨';
      case 'used':
        return '사용완료';
      default:
        return status;
    }
  };
  
  const getDiscountText = (coupon: Coupon) => {
    if (coupon.type === 'percentage') {
      return `${coupon.value}% 할인 (최대 ${formatCurrency(coupon.maxDiscountAmount || 0)})`;
    } else {
      return `${formatCurrency(coupon.value)} 할인`;
    }
  };
  
  const filteredCoupons = coupons.filter(coupon => {
    if (activeTab === 'all') return true;
    return coupon.status === activeTab;
  });

  return (
    <AdminPageLayout
      title="쿠폰 관리"
      description="할인 쿠폰 생성 및 관리"
      actions={
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              새 쿠폰 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>새 쿠폰 생성</DialogTitle>
              <DialogDescription>
                할인 쿠폰 정보를 입력하여 새로운 쿠폰을 생성합니다.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="code" className="text-right">
                    쿠폰 코드
                  </Label>
                  <Input
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="SUMMER2025"
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    할인 유형
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange('type', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="할인 유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">비율 할인 (%)</SelectItem>
                      <SelectItem value="fixed">정액 할인 (원)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="value" className="text-right">
                    할인 값
                  </Label>
                  <Input
                    id="value"
                    name="value"
                    type="number"
                    value={formData.value}
                    onChange={handleInputChange}
                    placeholder={formData.type === 'percentage' ? '10' : '10000'}
                    className="col-span-3"
                    required
                    min={0}
                    max={formData.type === 'percentage' ? 100 : undefined}
                  />
                </div>
                
                {formData.type === 'percentage' && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="maxDiscountAmount" className="text-right">
                      최대 할인액
                    </Label>
                    <Input
                      id="maxDiscountAmount"
                      name="maxDiscountAmount"
                      type="number"
                      value={formData.maxDiscountAmount}
                      onChange={handleInputChange}
                      placeholder="50000"
                      className="col-span-3"
                      required
                      min={0}
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="minOrderAmount" className="text-right">
                    최소 주문액
                  </Label>
                  <Input
                    id="minOrderAmount"
                    name="minOrderAmount"
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={handleInputChange}
                    placeholder="30000"
                    className="col-span-3"
                    required
                    min={0}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">
                    시작일
                  </Label>
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.startDate ? format(formData.startDate, 'PPP', { locale: ko }) : "날짜 선택"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.startDate}
                          onSelect={(date) => date && setFormData(prev => ({ ...prev, startDate: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">
                    종료일
                  </Label>
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.endDate ? format(formData.endDate, 'PPP', { locale: ko }) : "날짜 선택"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.endDate}
                          onSelect={(date) => date && setFormData(prev => ({ ...prev, endDate: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="usageLimit" className="text-right">
                    사용 제한 횟수
                  </Label>
                  <Input
                    id="usageLimit"
                    name="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    placeholder="1"
                    className="col-span-3"
                    required
                    min={1}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    설명
                  </Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="여름 시즌 특별 할인"
                    className="col-span-3"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? '생성 중...' : '쿠폰 생성'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">전체 쿠폰</TabsTrigger>
          <TabsTrigger value="active">활성 쿠폰</TabsTrigger>
          <TabsTrigger value="used">사용완료 쿠폰</TabsTrigger>
          <TabsTrigger value="expired">만료된 쿠폰</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 rounded-full"></div>
                </div>
              ) : filteredCoupons.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {activeTab === 'all' ? '등록된 쿠폰이 없습니다.' : `${getStatusText(activeTab as any)} 상태의 쿠폰이 없습니다.`}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left">쿠폰 코드</th>
                        <th className="py-3 px-4 text-left">설명</th>
                        <th className="py-3 px-4 text-left">할인</th>
                        <th className="py-3 px-4 text-left">최소 주문액</th>
                        <th className="py-3 px-4 text-left">기간</th>
                        <th className="py-3 px-4 text-center">사용 횟수</th>
                        <th className="py-3 px-4 text-center">상태</th>
                        <th className="py-3 px-4 text-center">관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCoupons.map((coupon) => (
                        <tr key={coupon.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{coupon.code}</td>
                          <td className="py-3 px-4">{coupon.description}</td>
                          <td className="py-3 px-4">{getDiscountText(coupon)}</td>
                          <td className="py-3 px-4">{formatCurrency(coupon.minOrderAmount)}</td>
                          <td className="py-3 px-4">
                            {formatDateForDisplay(coupon.startDate)} ~ {formatDateForDisplay(coupon.endDate)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {coupon.usageCount} / {coupon.usageLimit}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(coupon.status)}`}>
                              {getStatusText(coupon.status)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCoupon(coupon.id)}
                              disabled={coupon.usageCount > 0}
                              title={coupon.usageCount > 0 ? '사용된 쿠폰은 삭제할 수 없습니다' : '쿠폰 삭제'}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
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
