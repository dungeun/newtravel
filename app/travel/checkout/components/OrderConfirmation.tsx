'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/hooks/useOrder';
import { useCheckout } from '@/hooks/useCheckout';
import { useCart } from '@/hooks/useCart';
import { clearAllCheckoutData } from '@/lib/checkout/checkoutSync';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function OrderConfirmation() {
  const { orderInfo, resetOrderInfo } = useOrder();
  const { setStepCompleted, goToPreviousStep, resetCheckout } = useCheckout();
  const { clearCart } = useCart();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // 주문 정보 검증
  const validateOrderInfo = () => {
    // 주문자 정보 검증
    if (!orderInfo.ordererInfo.name || !orderInfo.ordererInfo.email || !orderInfo.ordererInfo.phone) {
      setError('주문자 정보가 올바르지 않습니다.');
      return false;
    }
    
    // 여행자 정보 검증
    if (!orderInfo.travelers || orderInfo.travelers.length === 0) {
      setError('여행자 정보가 필요합니다.');
      return false;
    }
    
    // 결제 정보 검증
    if (!orderInfo.paymentMethod) {
      setError('결제 방법을 선택해주세요.');
      return false;
    }
    
    return true;
  };
  
  // 브라우저 새로고침 또는 페이지 이탈 시 경고 메시지 표시
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 주문 제출 중이 아닐 때만 경고 메시지 표시
      if (!isSubmitting) {
        const message = '페이지를 떠나면 입력한 정보가 손실될 수 있습니다. 계속하시겠습니까?';
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isSubmitting]);
  
  // 주문 처리 함수
  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // 주문 정보 검증
      if (!validateOrderInfo()) {
        setIsSubmitting(false);
        return;
      }
      
      // 결제 처리 페이지로 이동
      router.push(`/travel/payment/process?method=${orderInfo.paymentMethod}&amount=${orderInfo.total}`);
      
      // 실제 API 연동 대신 모의 처리 (실제 구현 시 아래 코드 활성화)
      /*
      // 주문 정보 준비
      const orderData = {
        ordererInfo: orderInfo.ordererInfo,
        travelers: orderInfo.travelers,
        items: orderInfo.items,
        specialRequests: orderInfo.specialRequests,
        paymentMethod: orderInfo.paymentMethod,
        subtotal: orderInfo.subtotal,
        discountAmount: orderInfo.discountAmount,
        tax: orderInfo.tax,
        total: orderInfo.total,
      };
      
      // API 호출하여 주문 처리
      const response = await axios.post('/api/orders', orderData);
      
      // 성공적인 응답 처리
      if (response.data.success) {
        setOrderNumber(response.data.orderNumber || response.data.id);
        setOrderComplete(true);
        
        // 장바구니 비우기
        clearCart();
        
        // 체크아웃 상태 초기화
        resetCheckout();
        
        // 세션 스토리지에서 체크아웃 데이터 정리
        clearAllCheckoutData();
        
        // 주문 완료 페이지로 이동
        router.push(`/travel/orders/${response.data.orderNumber || response.data.id}`);
      } else {
        // 서버에서 성공이라고 응답했지만 데이터에 오류가 있는 경우
        setError(response.data.error || '주문 처리 중 오류가 발생했습니다.');
      }
      */
    } catch (error: any) {
      console.error('주문 처리 오류:', error);
      setError(
        error.response?.data?.error || 
        error.message || 
        '주문 처리 중 오류가 발생했습니다.'
      );
      setIsSubmitting(false);
    }
  };
  
  // 쇼핑 계속하기
  const handleContinueShopping = () => {
    // 주문 및 체크아웃 상태 초기화
    resetOrderInfo();
    resetCheckout();
    
    // 여행 상품 페이지로 이동
    router.push('/travel');
  };
  
  // 주문 상세 보기
  const handleViewOrderDetails = () => {
    // 주문 및 체크아웃 상태 초기화
    resetOrderInfo();
    resetCheckout();
    
    // 마이페이지 주문 상세 페이지로 이동
    router.push(`/travel/order/${orderNumber}`);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">주문 확인</h2>
      <p className="text-sm text-gray-500">
        주문 정보를 확인하고 결제를 진행해주세요.
      </p>
      
      {/* 주문 정보 요약 */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">주문 정보</h3>
            
            {/* 주문자 정보 */}
            <div>
              <h4 className="text-sm font-medium text-gray-500">주문자 정보</h4>
              <div className="mt-1 rounded-md bg-gray-50 p-3">
                <p><span className="font-medium">이름:</span> {orderInfo.ordererInfo.name}</p>
                <p><span className="font-medium">이메일:</span> {orderInfo.ordererInfo.email}</p>
                <p><span className="font-medium">연락처:</span> {orderInfo.ordererInfo.phone}</p>
              </div>
            </div>
            
            {/* 여행자 정보 */}
            <div>
              <h4 className="text-sm font-medium text-gray-500">여행자 정보</h4>
              <div className="mt-1 space-y-2">
                {orderInfo.travelers.map((traveler, index) => (
                  <div key={traveler.id} className="rounded-md bg-gray-50 p-3">
                    <p className="font-medium">여행자 {index + 1}: {traveler.name}</p>
                    <p><span className="text-sm text-gray-500">생년월일:</span> {traveler.birthdate}</p>
                    <p>
                      <span className="text-sm text-gray-500">성별:</span>{' '}
                      {traveler.gender === 'male' ? '남성' : traveler.gender === 'female' ? '여성' : '기타'}
                    </p>
                    {traveler.phone && <p><span className="text-sm text-gray-500">연락처:</span> {traveler.phone}</p>}
                    {traveler.email && <p><span className="text-sm text-gray-500">이메일:</span> {traveler.email}</p>}
                    {traveler.specialRequests && (
                      <p><span className="text-sm text-gray-500">특별 요청:</span> {traveler.specialRequests}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* 상품 정보 */}
            <div>
              <h4 className="text-sm font-medium text-gray-500">상품 정보</h4>
              <div className="mt-1 space-y-2">
                {orderInfo.items.map((item) => (
                  <div key={item.id} className="rounded-md bg-gray-50 p-3">
                    <div className="flex justify-between">
                      <p className="font-medium">{item.title}</p>
                      <p className="font-medium">{(item.price * item.quantity).toLocaleString()}원</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {item.price.toLocaleString()}원 x {item.quantity}개
                    </p>
                    {item.options && (
                      <p className="text-sm text-gray-500">
                        {item.options.adult > 0 && `성인 ${item.options.adult}명`}
                        {item.options.child > 0 && `, 아동 ${item.options.child}명`}
                        {item.options.infant > 0 && `, 유아 ${item.options.infant}명`}
                      </p>
                    )}
                    {item.dates && (
                      <p className="text-sm text-gray-500">
                        여행 기간: {new Date(item.dates.startDate).toLocaleDateString()} ~ {new Date(item.dates.endDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* 결제 정보 */}
            <div>
              <h4 className="text-sm font-medium text-gray-500">결제 정보</h4>
              <div className="mt-1 rounded-md bg-gray-50 p-3">
                <p>
                  <span className="font-medium">결제 방법:</span>{' '}
                  {orderInfo.paymentMethod === 'card'
                    ? '신용/체크카드'
                    : orderInfo.paymentMethod === 'kakaopay'
                    ? '카카오페이'
                    : orderInfo.paymentMethod === 'tosspay'
                    ? '토스페이'
                    : '무통장 입금'}
                </p>
              </div>
            </div>
            
            {/* 금액 정보 */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-500">상품 금액</span>
                <span>{orderInfo.subtotal.toLocaleString()}원</span>
              </div>
              {orderInfo.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">할인 금액</span>
                  <span>-{orderInfo.discountAmount.toLocaleString()}원</span>
                </div>
              )}
              {orderInfo.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">세금</span>
                  <span>{orderInfo.tax.toLocaleString()}원</span>
                </div>
              )}
              <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-lg font-bold">
                <span>총 결제 금액</span>
                <span className="text-blue-600">{orderInfo.total.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 주문 완료 메시지 */}
      {orderComplete && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <CheckCircle className="mb-4 h-12 w-12 text-green-500" />
            <h3 className="mb-2 text-xl font-bold">주문이 완료되었습니다!</h3>
            <p className="mb-4 text-gray-600">
              주문번호: <span className="font-medium">{orderNumber}</span>
            </p>
            <p className="mb-6 text-sm text-gray-500">
              주문 확인 메일이 {orderInfo.ordererInfo.email}로 발송되었습니다.
            </p>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Button variant="outline" onClick={handleContinueShopping}>
                쇼핑 계속하기
              </Button>
              <Button onClick={handleViewOrderDetails}>
                주문 상세 보기
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 오류 메시지 */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600">
          <p>{error}</p>
        </div>
      )}
      
      {/* 이전/주문하기 버튼 */}
      {!orderComplete && (
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={goToPreviousStep}
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> 이전 단계
          </Button>
          <Button
            type="button"
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 처리 중...
              </>
            ) : (
              '결제하기'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
