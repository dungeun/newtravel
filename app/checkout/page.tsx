'use client';

import { useState } from 'react';
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import PaymentMethod from './PaymentMethod';
import OrderSummary from './OrderSummary';
import { doc, collection, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

// 타입 정의 추가
interface FormData {
  name: string;
  email: string;
  phone: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeRefund: boolean;
}

type PaymentMethodType = 'card' | 'bank' | 'kakaopay' | 'naverpay' | 'tosspay';

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('card');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    agreeTerms: false,
    agreePrivacy: false,
    agreeRefund: false,
  });

  // 폼 입력 처리 - 타입 안정성 개선
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // 결제 방법 변경 처리 - 타입 안정성 개선
  const handlePaymentMethodChange = (method: PaymentMethodType) => {
    setPaymentMethod(method);
  };

  // 이메일 유효성 검사 함수 추가
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 전화번호 유효성 검사 함수 추가
  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  // 결제 처리 - 에러 처리 강화
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      // 폼 유효성 검사 강화
      if (!formData.name.trim()) {
        toast({
          title: "입력 오류",
          description: "이름을 입력해주세요.",
          variant: "destructive",
        });
        return;
      }

      if (!formData.email.trim() || !isValidEmail(formData.email)) {
        toast({
          title: "입력 오류",
          description: "올바른 이메일 주소를 입력해주세요.",
          variant: "destructive",
        });
        return;
      }

      if (!formData.phone.trim() || !isValidPhone(formData.phone)) {
        toast({
          title: "입력 오류",
          description: "올바른 전화번호를 입력해주세요. (예: 010-1234-5678)",
          variant: "destructive",
        });
        return;
      }

      // 약관 동의 확인
      if (!formData.agreeTerms || !formData.agreePrivacy || !formData.agreeRefund) {
        toast({
          title: "약관 동의 필요",
          description: "모든 필수 약관에 동의해주세요.",
          variant: "destructive",
        });
        return;
      }

      // 장바구니 확인 - null 체크 강화
      if (!cart || !cart.items || !Array.isArray(cart.items) || cart.items.length === 0) {
        toast({
          title: "장바구니가 비어있습니다",
          description: "결제를 진행하려면 상품을 추가해주세요.",
          variant: "destructive",
        });
        router.push('/travel/cart');
        return;
      }

      setIsSubmitting(true);

      // 총 금액 계산 - 안전한 계산
      const totalAmount = cart.items.reduce((sum, item) => {
        const price = typeof item.price === 'number' ? item.price : 0;
        const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
        return sum + (price * quantity);
      }, 0);

      if (totalAmount <= 0) {
        throw new Error('결제 금액이 올바르지 않습니다.');
      }
      
      // 주문 정보 생성 - 데이터 검증 추가
      const orderData = {
        userId: user?.uid || 'guest',
        customerName: formData.name.trim(),
        customerEmail: formData.email.trim().toLowerCase(),
        customerPhone: formData.phone.trim(),
        paymentMethod: paymentMethod,
        totalAmount: totalAmount,
        status: 'completed' as const,
        items: cart.items.map(item => ({
          productId: item.productId || '',
          title: item.title || '상품명 없음',
          price: typeof item.price === 'number' ? item.price : 0,
          quantity: typeof item.quantity === 'number' ? item.quantity : 0,
          options: item.options || {},
          dates: item.dates || {}
        })),
        createdAt: serverTimestamp(),
      };

      // Firestore에 주문 데이터 저장
      const ordersRef = collection(db, 'orders');
      const orderDoc = await addDoc(ordersRef, orderData);
      
      if (!orderDoc.id) {
        throw new Error('주문 생성에 실패했습니다.');
      }
      
      // 매출 데이터 생성 (관리자 대시보드용)
      const salesData = {
        orderId: orderDoc.id,
        userId: user?.uid || 'guest',
        amount: totalAmount,
        paymentMethod: paymentMethod,
        status: 'completed' as const,
        createdAt: serverTimestamp(),
      };
      
      // Firestore에 매출 데이터 저장
      const salesRef = collection(db, 'sales');
      await addDoc(salesRef, salesData);
      
      // 장바구니 비우기
      if (typeof clearCart === 'function') {
        clearCart();
      }
      
      // 성공 토스트
      toast({
        title: "결제 완료",
        description: "결제가 성공적으로 완료되었습니다.",
        variant: "default",
      });
      
      // 결제 완료 페이지로 이동
      router.push(`/checkout/complete?orderId=${orderDoc.id}`);
      
    } catch (error) {
      console.error('결제 처리 오류:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.";
      
      toast({
        title: "결제 처리 오류",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 결제 수단별 버튼 텍스트 - 타입 안정성 개선
  const getPaymentButtonText = (): string => {
    const buttonTexts: Record<PaymentMethodType, string> = {
      card: '카드로 결제하기',
      bank: '계좌이체로 결제하기',
      kakaopay: '카카오페이로 결제하기',
      naverpay: '네이버페이로 결제하기',
      tosspay: '토스로 결제하기'
    };
    
    return buttonTexts[paymentMethod] || '결제하기';
  };

  // Checkbox 컴포넌트를 위한 헬퍼 함수
  const handleCheckboxChange = (field: keyof FormData) => (checked: boolean | 'indeterminate') => {
    setFormData(prev => ({
      ...prev,
      [field]: checked === true
    }));
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">결제하기</h1>
        <p className="text-gray-600">주문 정보를 확인하고 결제를 진행하세요.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* 주문자 정보 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">주문자 정보</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">이름 *</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    placeholder="홍길동" 
                    required 
                    maxLength={50}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">이메일 *</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    placeholder="example@email.com" 
                    required 
                    maxLength={100}
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">연락처 *</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    placeholder="010-1234-5678" 
                    required 
                    maxLength={20}
                  />
                </div>
              </div>
            </div>
            
            {/* 결제 수단 선택 */}
            <PaymentMethod 
              selectedMethod={paymentMethod} 
              onMethodChange={handlePaymentMethodChange} 
            />
            
            {/* 약관 동의 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">약관 동의</h2>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="agreeTerms" 
                    checked={formData.agreeTerms} 
                    onCheckedChange={handleCheckboxChange('agreeTerms')}
                  />
                  <Label htmlFor="agreeTerms" className="text-sm">
                    (필수) 이용약관 동의
                  </Label>
                  <Link href="/terms" className="text-xs text-teal-600 ml-auto hover:underline">
                    보기
                  </Link>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="agreePrivacy" 
                    checked={formData.agreePrivacy} 
                    onCheckedChange={handleCheckboxChange('agreePrivacy')}
                  />
                  <Label htmlFor="agreePrivacy" className="text-sm">
                    (필수) 개인정보 수집 및 이용 동의
                  </Label>
                  <Link href="/privacy" className="text-xs text-teal-600 ml-auto hover:underline">
                    보기
                  </Link>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="agreeRefund" 
                    checked={formData.agreeRefund} 
                    onCheckedChange={handleCheckboxChange('agreeRefund')}
                  />
                  <Label htmlFor="agreeRefund" className="text-sm">
                    (필수) 환불 정책 동의
                  </Label>
                  <Link href="/refund" className="text-xs text-teal-600 ml-auto hover:underline">
                    보기
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            {/* 주문 요약 */}
            <OrderSummary />
            
            {/* 결제 버튼 */}
            <Button 
              type="submit" 
              className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white py-6 text-lg font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  처리 중...
                </div>
              ) : (
                getPaymentButtonText()
              )}
            </Button>
            
            <div className="mt-4 text-center">
              <Link href="/travel/cart" className="text-sm text-gray-600 hover:text-teal-600 hover:underline">
                장바구니로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}