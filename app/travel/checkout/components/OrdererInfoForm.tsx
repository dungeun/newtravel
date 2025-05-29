'use client';

import { useState, useEffect } from 'react';
import { useOrder } from '@/hooks/useOrder';
import { useCheckout } from '@/hooks/useCheckout';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle } from 'lucide-react';

export default function OrdererInfoForm() {
  const { orderInfo, updateOrdererInfo, validateOrderInfo, validationErrors } = useOrder();
  const { setStepCompleted, goToNextStep } = useCheckout();
  const { user } = useAuth();
  
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  
  // 사용자 정보로 초기화
  useEffect(() => {
    if (user && !orderInfo.ordererInfo.name && !orderInfo.ordererInfo.email) {
      updateOrdererInfo({
        name: user.displayName || '',
        email: user.email || '',
      });
    }
  }, [user, orderInfo.ordererInfo, updateOrdererInfo]);
  
  // 입력값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateOrdererInfo({ [name]: value });
    
    // 입력 시 해당 필드 오류 메시지 제거
    if (localErrors[name]) {
      setLocalErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };
  
  // 체크박스 변경 핸들러
  const handleCheckboxChange = (checked: boolean) => {
    updateOrdererInfo({ isAgreeToTerms: checked });
    
    // 입력 시 해당 필드 오류 메시지 제거
    if (localErrors['isAgreeToTerms']) {
      setLocalErrors(prev => {
        const updated = { ...prev };
        delete updated['isAgreeToTerms'];
        return updated;
      });
    }
  };
  
  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 필수 필드 검증
    const errors: Record<string, string> = {};
    
    if (!orderInfo.ordererInfo.name) {
      errors.name = '이름을 입력해주세요.';
    }
    
    if (!orderInfo.ordererInfo.email) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderInfo.ordererInfo.email)) {
      errors.email = '유효한 이메일 형식이 아닙니다.';
    }
    
    if (!orderInfo.ordererInfo.phone) {
      errors.phone = '연락처를 입력해주세요.';
    } else if (!/^\d{10,11}$/.test(orderInfo.ordererInfo.phone.replace(/-/g, ''))) {
      errors.phone = '유효한 전화번호 형식이 아닙니다.';
    }
    
    if (!orderInfo.ordererInfo.isAgreeToTerms) {
      errors.isAgreeToTerms = '이용약관에 동의해주세요.';
    }
    
    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }
    
    // 단계 완료 표시
    setStepCompleted('orderer-info', true);
    
    // 다음 단계로 이동
    goToNextStep();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold">예약자 정보</h2>
      <p className="text-sm text-gray-500">여행 상품 예약을 위한 정보를 입력해주세요.</p>
      
      <div className="space-y-4">
        {/* 이름 입력 */}
        <div>
          <Label htmlFor="name" className="flex items-center">
            이름 <span className="ml-1 text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            value={orderInfo.ordererInfo.name}
            onChange={handleChange}
            placeholder="홍길동"
            className={localErrors.name ? 'border-red-500' : ''}
          />
          {localErrors.name && (
            <div className="mt-1 flex items-center text-xs text-red-500">
              <AlertCircle className="mr-1 h-3 w-3" />
              {localErrors.name}
            </div>
          )}
        </div>
        
        {/* 이메일 입력 */}
        <div>
          <Label htmlFor="email" className="flex items-center">
            이메일 <span className="ml-1 text-red-500">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={orderInfo.ordererInfo.email}
            onChange={handleChange}
            placeholder="example@example.com"
            className={localErrors.email ? 'border-red-500' : ''}
          />
          {localErrors.email && (
            <div className="mt-1 flex items-center text-xs text-red-500">
              <AlertCircle className="mr-1 h-3 w-3" />
              {localErrors.email}
            </div>
          )}
        </div>
        
        {/* 연락처 입력 */}
        <div>
          <Label htmlFor="phone" className="flex items-center">
            연락처 <span className="ml-1 text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            name="phone"
            value={orderInfo.ordererInfo.phone}
            onChange={handleChange}
            placeholder="01012345678"
            className={localErrors.phone ? 'border-red-500' : ''}
          />
          {localErrors.phone && (
            <div className="mt-1 flex items-center text-xs text-red-500">
              <AlertCircle className="mr-1 h-3 w-3" />
              {localErrors.phone}
            </div>
          )}
          <p className="mt-1 text-xs text-gray-500">
            '-' 없이 숫자만 입력해주세요.
          </p>
        </div>
        
        {/* 이용약관 동의 */}
        <div className="flex items-start space-x-2 pt-4">
          <Checkbox
            id="terms"
            checked={orderInfo.ordererInfo.isAgreeToTerms}
            onCheckedChange={handleCheckboxChange}
            className={localErrors.isAgreeToTerms ? 'border-red-500' : ''}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              이용약관 동의 <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500">
              <a href="#" className="text-blue-600 hover:underline">
                이용약관
              </a>
              과{' '}
              <a href="#" className="text-blue-600 hover:underline">
                개인정보 처리방침
              </a>
              에 동의합니다.
            </p>
            {localErrors.isAgreeToTerms && (
              <div className="flex items-center text-xs text-red-500">
                <AlertCircle className="mr-1 h-3 w-3" />
                {localErrors.isAgreeToTerms}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <Button type="submit">다음 단계</Button>
      </div>
    </form>
  );
}
