'use client';

import { useCheckout } from '@/hooks/useCheckout';
import { useOrder } from '@/hooks/useOrder';
import { useCart } from '@/hooks/useCart';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { recoverCheckoutData, clearAllCheckoutData } from '@/lib/checkout/checkoutSync';
import { setupStorageSync } from '@/lib/utils/storage-utils';
import { Card, CardContent } from '@/components/ui/card';
import OrdererInfoForm from './OrdererInfoForm';
import TravelerInfoForm from './TravelerInfoForm';
import PaymentForm from './PaymentForm';
import OrderConfirmation from './OrderConfirmation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingBag, RefreshCw, WifiOff } from 'lucide-react';
import CheckoutErrorBoundary from './ErrorBoundary';
import { useToast } from '@/components/ui/use-toast';

export default function CheckoutLayout() {
  const { currentStep, setRequiredTravelers, setCurrentStep, setStepCompleted } = useCheckout();
  const { orderInfo, setItems, updateOrderAmounts } = useOrder();
  const { cart } = useCart();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // 로그인 상태 확인
  useEffect(() => {
    // 로그인 상태가 확인되었을 때 (loading이 아닐 때)
    if (status !== 'loading') {
      // 로그인되지 않은 경우
      if (!session) {
        // 현재 URL을 세션 스토리지에 저장하여 로그인 후 돌아올 수 있도록 함
        sessionStorage.setItem('redirectAfterLogin', '/travel/checkout');
        // 로그인 페이지로 리디렉션
        router.push('/auth/signin');
        toast({
          title: "로그인이 필요합니다",
          description: "결제를 진행하려면 로그인이 필요합니다.",
          variant: "destructive",
        });
      }
    }
  }, [session, status, router, toast]);
  
  // 세션 스토리지에서 체크아웃 데이터 복구
  useEffect(() => {
    if (!isInitialized) {
      try {
        const { checkoutState, hasData } = recoverCheckoutData();
        
        if (hasData && checkoutState) {
          // 체크아웃 상태 복구
          setCurrentStep(checkoutState.currentStep);
          
          // 단계 완료 상태 복구
          Object.entries(checkoutState.stepsCompleted).forEach(([step, completed]) => {
            setStepCompleted(step as any, completed);
          });
          
          // 필요한 여행자 수 복구
          if (checkoutState.requiredTravelers) {
            setRequiredTravelers(checkoutState.requiredTravelers);
          }
          
          // 세션 복구 알림
          if (hasData) {
            toast({
              title: "체크아웃 정보 복구 완료",
              description: "이전에 입력한 정보가 복구되었습니다.",
              duration: 3000,
            });
          }
        }
      } catch (error) {
        console.error('체크아웃 데이터 복구 오류:', error);
        toast({
          variant: "destructive",
          title: "데이터 복구 오류",
          description: "이전 체크아웃 정보를 복구하는 중 오류가 발생했습니다.",
          duration: 5000,
        });
        
        // 손상된 데이터 정리
        clearAllCheckoutData();
      } finally {
        setIsInitialized(true);
        setIsLoading(false);
      }
    }
  }, [isInitialized, setCurrentStep, setStepCompleted, setRequiredTravelers, toast]);
  
  // 세션 스토리지 동기화 설정
  useEffect(() => {
    const cleanup = setupStorageSync(() => {
      // 스토리지 변경 시 페이지 새로고침
      window.location.reload();
    });
    
    return cleanup;
  }, []);
  
  // 네트워크 상태 모니터링
  useEffect(() => {
    const handleOnline = () => {
      setNetworkError(false);
      toast({
        title: "네트워크 연결 복구",
        description: "인터넷 연결이 복구되었습니다.",
        duration: 3000,
      });
    };
    
    const handleOffline = () => {
      setNetworkError(true);
      toast({
        variant: "destructive",
        title: "네트워크 연결 끊김",
        description: "인터넷 연결이 끊겼습니다. 연결이 복구되면 자동으로 재개됩니다.",
        duration: 0, // 계속 표시
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);
  
  // 페이지 이탈 경고
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 주문 완료 단계가 아닐 때만 경고 메시지 표시
      if (currentStep !== 'confirmation') {
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
  }, [currentStep]);
  
  // 장바구니 항목을 주문 정보에 설정
  useEffect(() => {
    if (isInitialized && cart && cart.items && cart.items.length > 0) {
      setItems(cart.items);
      
      // 필요한 여행자 수 계산
      let adultCount = 0;
      let childCount = 0;
      let infantCount = 0;
      
      cart.items.forEach(item => {
        if (item.options) {
          adultCount += item.options.adult || 0;
          childCount += item.options.child || 0;
          infantCount += item.options.infant || 0;
        } else {
          // 옵션이 없는 경우 기본값으로 성인 1명
          adultCount += item.quantity || 1;
        }
      });
      
      // 필요한 여행자 수 설정
      setRequiredTravelers({
        adult: adultCount,
        child: childCount,
        infant: infantCount,
      });
      
      // 주문 금액 계산
      updateOrderAmounts();
    }
  }, [cart, setItems, setRequiredTravelers, updateOrderAmounts, isInitialized]);
  
  // 로딩 중인 경우
  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-12 text-center">
        <div className="mx-auto max-w-lg rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-6 flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          </div>
          <h2 className="mb-4 text-xl font-bold text-gray-800">체크아웃 정보를 불러오는 중입니다</h2>
          <p className="text-gray-600">잠시만 기다려주세요...</p>
        </div>
      </div>
    );
  }
  
  // 네트워크 오류 발생 시
  if (networkError) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-12 text-center">
        <div className="mx-auto max-w-lg rounded-lg border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <div className="mb-6 flex justify-center">
            <WifiOff className="h-16 w-16 text-red-500" />
          </div>
          <h2 className="mb-4 text-xl font-bold text-gray-800">인터넷 연결이 끊겼습니다</h2>
          <p className="mb-6 text-gray-600">인터넷 연결을 확인하고 다시 시도해주세요.</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="flex w-full items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            새로고침
          </Button>
        </div>
      </div>
    );
  }
  
  // 장바구니가 비어있는 경우
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="mx-auto max-w-lg rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-6 flex justify-center">
            <ShoppingBag className="size-16 text-gray-300" />
          </div>
          <h2 className="mb-4 text-2xl font-bold text-gray-800">장바구니가 비어 있습니다</h2>
          <p className="mb-6 text-gray-600">여행 상품을 둘러보고 장바구니에 추가해보세요.</p>
          <Link href="/travel">
            <Button className="flex w-full items-center justify-center gap-2">
              상품 보러가기
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <CheckoutErrorBoundary>
      <div className="container mx-auto px-4 py-8">
      {/* 제목 */}
      <h1 className="mb-6 text-2xl font-bold">결제 진행</h1>
      
      {/* 결제 단계 표시 */}
      <div className="mb-8">
        <div className="flex justify-between">
          <div className={`flex flex-1 flex-col items-center ${currentStep === 'orderer-info' ? 'text-blue-600' : 'text-gray-500'}`}>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full border ${currentStep === 'orderer-info' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>1</div>
            <span className="mt-2 text-sm">예약자 정보</span>
          </div>
          <div className="flex-1 self-center border-t border-gray-300"></div>
          <div className={`flex flex-1 flex-col items-center ${currentStep === 'traveler-info' ? 'text-blue-600' : 'text-gray-500'}`}>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full border ${currentStep === 'traveler-info' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>2</div>
            <span className="mt-2 text-sm">여행자 정보</span>
          </div>
          <div className="flex-1 self-center border-t border-gray-300"></div>
          <div className={`flex flex-1 flex-col items-center ${currentStep === 'payment' ? 'text-blue-600' : 'text-gray-500'}`}>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full border ${currentStep === 'payment' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>3</div>
            <span className="mt-2 text-sm">결제 정보</span>
          </div>
          <div className="flex-1 self-center border-t border-gray-300"></div>
          <div className={`flex flex-1 flex-col items-center ${currentStep === 'confirmation' ? 'text-blue-600' : 'text-gray-500'}`}>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full border ${currentStep === 'confirmation' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>4</div>
            <span className="mt-2 text-sm">주문 확인</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* 주요 컨텐츠 영역 */}
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              {/* 현재 단계에 따른 컴포넌트 렌더링 */}
              {currentStep === 'orderer-info' && <OrdererInfoForm />}
              {currentStep === 'traveler-info' && <TravelerInfoForm />}
              {currentStep === 'payment' && <PaymentForm />}
              {currentStep === 'confirmation' && <OrderConfirmation />}
            </CardContent>
          </Card>
        </div>
        
        {/* 주문 요약 */}
        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-bold">주문 요약</h2>
              
              <div className="space-y-4">
                {/* 상품 목록 */}
                <div className="space-y-2">
                  {orderInfo.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div>
                        <span className="font-medium">{item.title}</span>
                        <span className="ml-1 text-gray-500">x{item.quantity}</span>
                        {item.options && (
                          <div className="text-xs text-gray-500">
                            {item.options.adult > 0 && `성인 ${item.options.adult}명`}
                            {item.options.child > 0 && `, 아동 ${item.options.child}명`}
                            {item.options.infant > 0 && `, 유아 ${item.options.infant}명`}
                          </div>
                        )}
                      </div>
                      <span>{(item.price * item.quantity).toLocaleString()}원</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">상품 금액</span>
                  <span>{orderInfo.subtotal.toLocaleString()}원</span>
                </div>
                
                {orderInfo.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">할인</span>
                    <span>-{orderInfo.discountAmount.toLocaleString()}원</span>
                  </div>
                )}
                
                {orderInfo.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">세금</span>
                    <span>{orderInfo.tax.toLocaleString()}원</span>
                  </div>
                )}
                
                <div className="my-4 border-t border-gray-200 pt-4"></div>
                
                <div className="flex justify-between font-bold">
                  <span>총 결제 금액</span>
                  <span className="text-lg text-blue-600">
                    {orderInfo.total.toLocaleString()}원
                  </span>
                </div>
                
                <div className="mt-4">
                  <Link href="/travel/cart" className="text-sm text-blue-600 hover:underline">
                    ← 장바구니로 돌아가기
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </CheckoutErrorBoundary>
  );
}
