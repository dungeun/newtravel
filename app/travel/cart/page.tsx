'use client';

import { useCart } from "@/hooks/useCart";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MinusIcon, PlusIcon, TrashIcon, ShoppingBagIcon, ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function CartPage() {
  const { 
    cart, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    isLoading 
  } = useCart();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleQuantityChange = (itemId: string, newValue: number) => {
    if (newValue > 0) {
      updateQuantity({ itemId, quantity: newValue });
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
    toast({
      title: "상품이 삭제되었습니다",
      description: "장바구니에서 상품이 삭제되었습니다.",
    });
  };

  const handleClearCart = () => {
    if (window.confirm("장바구니를 비우시겠습니까?")) {
      clearCart();
      toast({
        title: "장바구니가 비워졌습니다",
        description: "모든 상품이 장바구니에서 제거되었습니다.",
      });
    }
  };

  const handleProceedToCheckout = () => {
    if (!cart || cart.items.length === 0) {
      toast({
        title: "장바구니가 비어있습니다",
        description: "결제를 진행하려면 상품을 추가해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    router.push('/checkout');
  };

  // 총 금액 계산
  const calculateTotal = () => {
    if (!cart || !cart.items || cart.items.length === 0) return 0;
    return cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full border-4 border-teal-500 border-t-transparent animate-spin mb-4"></div>
          <p className="text-lg text-gray-600">장바구니를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">장바구니</h1>
        <p className="text-gray-600">여행 상품을 확인하고 결제를 진행하세요.</p>
      </div>

      {cart && cart.items && cart.items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">상품 목록</h2>
                    <button 
                      onClick={handleClearCart}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      장바구니 비우기
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {cart.items.map((item) => (
                    <div key={item.id} className="p-6 flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-1/4 relative h-32 rounded-md overflow-hidden">
                        <Image
                          src={item.mainImage || "/images/travel-placeholder.jpg"}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="w-full md:w-3/4 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                          <div className="text-sm text-gray-500 mb-4">
                            {item.options && (
                              <div className="mt-1">
                                <p>성인: {item.options.adult}명</p>
                                {item.options.child > 0 && <p>아동: {item.options.child}명</p>}
                                {item.options.infant > 0 && <p>유아: {item.options.infant}명</p>}
                              </div>
                            )}
                            {item.dates && (
                              <p className="mt-1">
                                {new Date(item.dates.startDate.seconds * 1000).toLocaleDateString()} ~ 
                                {new Date(item.dates.endDate.seconds * 1000).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300"
                              disabled={item.quantity <= 1}
                            >
                              <MinusIcon className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-semibold">
                              {(item.price * item.quantity).toLocaleString()}원
                            </span>
                            <button 
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">주문 요약</h2>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">상품 금액</span>
                      <span>{calculateTotal().toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">할인</span>
                      <span>0원</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold">
                      <span>총 결제 금액</span>
                      <span className="text-teal-600">{calculateTotal().toLocaleString()}원</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-md"
                    onClick={handleProceedToCheckout}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        처리 중...
                      </div>
                    ) : (
                      "결제하기"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-8">
            <Link href="/travel/free_travel" className="inline-flex items-center text-teal-600 hover:text-teal-700">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              쇼핑 계속하기
            </Link>
          </div>
        </>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <ShoppingBagIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">장바구니가 비어있습니다</h2>
          <p className="text-gray-600 mb-6 max-w-md">
            아직 장바구니에 상품이 없습니다. 다양한 여행 상품을 둘러보고 장바구니에 담아보세요.
          </p>
          <Link 
            href="/travel/free_travel" 
            className="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            여행 상품 둘러보기
          </Link>
        </div>
      )}
    </div>
  );
}

// 정적 페이지 재검증 설정
export const revalidate = 60; // 60초마다 재검증
