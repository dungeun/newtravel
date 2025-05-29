'use client';

import { useCart } from "@/hooks/useCart";
import { Card, CardContent } from "@/components/ui/card";

export default function OrderSummary() {
  const { cart } = useCart();
  
  // 총 금액 계산
  const calculateTotal = () => {
    if (!cart || !cart.items || cart.items.length === 0) return 0;
    return cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // 할인 금액 (예시로 0원 설정)
  const discountAmount = 0;
  
  // 최종 결제 금액
  const finalAmount = calculateTotal() - discountAmount;

  return (
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
            <span>{discountAmount.toLocaleString()}원</span>
          </div>
          
          <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold">
            <span>총 결제 금액</span>
            <span className="text-teal-600">{finalAmount.toLocaleString()}원</span>
          </div>
        </div>
        
        <div className="text-sm text-gray-500 mt-4">
          <p>• 결제 완료 후 예약 확정 이메일이 발송됩니다.</p>
          <p>• 해외 결제 시 해외 수수료가 발생할 수 있습니다.</p>
          <p>• 결제 관련 문의는 고객센터로 연락해주세요.</p>
        </div>
      </CardContent>
    </Card>
  );
}
