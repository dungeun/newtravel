'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/hooks/useOrder';
import { useCheckout } from '@/hooks/useCheckout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CreditCard, Landmark, ArrowRight, FileText } from 'lucide-react';

export default function PaymentForm() {
  const router = useRouter();
  const { orderInfo, setPaymentMethod, updateOrdererInfo, updateSpecialRequests } = useOrder();
  const { setStepCompleted, goToNextStep, goToPreviousStep } = useCheckout();
  
  const [paymentMethod, setLocalPaymentMethod] = useState<'card' | 'kakaopay' | 'tosspay' | 'bank'>(
    orderInfo.paymentMethod || 'card'
  );
  
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });
  
  const [specialRequests, setSpecialRequests] = useState(orderInfo.specialRequests || '');
  const [isAgreeToTerms, setIsAgreeToTerms] = useState(orderInfo.ordererInfo.isAgreeToTerms || false);
  
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  
  // 결제 방법 변경 핸들러
  const handlePaymentMethodChange = (value: string) => {
    setLocalPaymentMethod(value as 'card' | 'kakaopay' | 'tosspay' | 'bank');
    setPaymentMethod(value as 'card' | 'kakaopay' | 'tosspay' | 'bank');
    
    // 입력 시 해당 필드 오류 메시지 제거
    if (localErrors['paymentMethod']) {
      setLocalErrors(prev => {
        const updated = { ...prev };
        delete updated['paymentMethod'];
        return updated;
      });
    }
  };
  
  // 카드 정보 변경 핸들러
  const handleCardInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // 카드 번호 포맷팅 (4자리마다 공백 추가)
    if (name === 'cardNumber') {
      const formattedValue = formatCardNumber(value);
      setCardInfo(prev => ({ ...prev, [name]: formattedValue }));
    }
    // 만료일 포맷팅 (MM/YY)
    else if (name === 'expiryDate') {
      const formattedValue = formatExpiryDate(value);
      setCardInfo(prev => ({ ...prev, [name]: formattedValue }));
    }
    // 기타 필드
    else {
      setCardInfo(prev => ({ ...prev, [name]: value }));
    }
    
    // 입력 시 해당 필드 오류 메시지 제거
    if (localErrors[name]) {
      setLocalErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };
  
  // 카드번호 포맷팅 (4자리마다 공백 추가)
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // 만료일 포맷팅 (MM/YY)
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    } else {
      return v;
    }
  };
  
  // 카드 발급사 이름 추출
  const getCardIssuerName = (cardNumber: string) => {
    const firstDigit = cardNumber.replace(/\s+/g, '').charAt(0);
    
    switch (firstDigit) {
      case '3':
        return 'American Express';
      case '4':
        return 'Visa';
      case '5':
        return 'MasterCard';
      case '6':
        return 'Discover';
      case '9':
        return '국내전용';
      default:
        return '';
    }
  };
  
  // 특별 요청사항 변경 핸들러
  const handleSpecialRequestsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSpecialRequests(value);
    updateSpecialRequests(value);
  };
  
  // 이용 약관 동의 변경 핸들러
  const handleTermsAgreementChange = (checked: boolean) => {
    setIsAgreeToTerms(checked);
    updateOrdererInfo({ isAgreeToTerms: checked });
    
    // 입력 시 해당 필드 오류 메시지 제거
    if (localErrors['termsAgreement']) {
      setLocalErrors(prev => {
        const updated = { ...prev };
        delete updated['termsAgreement'];
        return updated;
      });
    }
  };
  
  // 다음 단계로 이동
  const handleNext = () => {
    // 결제 방법 검증
    const errors: Record<string, string> = {};
    
    if (!paymentMethod) {
      errors.paymentMethod = '결제 방법을 선택해주세요.';
    }
    
    // 카드 결제 선택 시 카드 정보 검증
    if (paymentMethod === 'card') {
      if (!cardInfo.cardNumber) {
        errors.cardNumber = '카드 번호를 입력해주세요.';
      } else {
        // 카드 번호 형식 검증
        const cardNumberClean = cardInfo.cardNumber.replace(/\s+/g, '');
        if (cardNumberClean.length < 13 || cardNumberClean.length > 19) {
          errors.cardNumber = '유효하지 않은 카드번호입니다.';
        }
      }
      
      if (!cardInfo.cardHolder) {
        errors.cardHolder = '카드 소유자 이름을 입력해주세요.';
      }
      
      if (!cardInfo.expiryDate) {
        errors.expiryDate = '만료일을 입력해주세요.';
      } else {
        // 만료일 형식 검증 (MM/YY)
        const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (!expiryPattern.test(cardInfo.expiryDate)) {
          errors.expiryDate = '유효하지 않은 만료일입니다. MM/YY 형식으로 입력해주세요.';
        }
      }
      
      if (!cardInfo.cvv) {
        errors.cvv = 'CVV를 입력해주세요.';
      } else {
        // CVV 검증
        const cvvClean = cardInfo.cvv.replace(/\D/g, '');
        if (cvvClean.length < 3 || cvvClean.length > 4) {
          errors.cvv = '유효하지 않은 CVV 번호입니다.';
        }
      }
    }
    
    // 이용 약관 동의 검증
    if (!isAgreeToTerms) {
      errors.termsAgreement = '이용 약관에 동의해주세요.';
    }
    
    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }
    
    // 단계 완료 표시
    setStepCompleted('payment', true);
    
    // 신용카드 또는 계좌이체 선택 시 결제 완료 페이지로 이동
    if (paymentMethod === 'card' || paymentMethod === 'bank') {
      // 결제 완료 페이지로 이동
      router.push('/travel/order-complete');
    } else {
      // 다른 결제 방법은 다음 단계로 이동 (토스페이, 카카오페이 등)
      goToNextStep();
    }
  };
  
  // 이전 단계로 이동
  const handlePrevious = () => {
    goToPreviousStep();
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">결제 정보</h2>
      <p className="text-sm text-gray-500">결제 방법을 선택하고 필요한 정보를 입력해주세요.</p>
      
      {/* 결제 방법 선택 */}
      <div>
        <Label className="mb-2 block">결제 방법 선택</Label>
        <RadioGroup
          value={paymentMethod}
          onValueChange={handlePaymentMethodChange}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <Card className={`cursor-pointer ${paymentMethod === 'card' ? 'border-blue-500' : ''}`}>
            <CardContent className="flex items-center p-4">
              <RadioGroupItem value="card" id="card" className="mr-4" />
              <Label htmlFor="card" className="flex flex-1 cursor-pointer items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                신용/체크카드
              </Label>
            </CardContent>
          </Card>
          
          <Card className={`cursor-pointer ${paymentMethod === 'kakaopay' ? 'border-blue-500' : ''}`}>
            <CardContent className="flex items-center p-4">
              <RadioGroupItem value="kakaopay" id="kakaopay" className="mr-4" />
              <Label htmlFor="kakaopay" className="flex flex-1 cursor-pointer items-center">
                <div className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-black">
                  K
                </div>
                카카오페이
              </Label>
            </CardContent>
          </Card>
          
          <Card className={`cursor-pointer ${paymentMethod === 'tosspay' ? 'border-blue-500' : ''}`}>
            <CardContent className="flex items-center p-4">
              <RadioGroupItem value="tosspay" id="tosspay" className="mr-4" />
              <Label htmlFor="tosspay" className="flex flex-1 cursor-pointer items-center">
                <div className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                  T
                </div>
                토스페이
              </Label>
            </CardContent>
          </Card>
          
          <Card className={`cursor-pointer ${paymentMethod === 'bank' ? 'border-blue-500' : ''}`}>
            <CardContent className="flex items-center p-4">
              <RadioGroupItem value="bank" id="bank" className="mr-4" />
              <Label htmlFor="bank" className="flex flex-1 cursor-pointer items-center">
                <Landmark className="mr-2 h-5 w-5" />
                무통장 입금
              </Label>
            </CardContent>
          </Card>
        </RadioGroup>
        
        {localErrors.paymentMethod && (
          <div className="mt-2 flex items-center text-xs text-red-500">
            <AlertCircle className="mr-1 h-3 w-3" />
            {localErrors.paymentMethod}
          </div>
        )}
      </div>
      
      {/* 카드 결제 폼 */}
      {paymentMethod === 'card' && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* 카드 번호 */}
              <div>
                <Label htmlFor="cardNumber" className="flex items-center">
                  카드 번호 <span className="ml-1 text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    value={cardInfo.cardNumber}
                    onChange={handleCardInfoChange}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className={`pr-12 ${localErrors.cardNumber ? 'border-red-500' : ''}`}
                  />
                  {getCardIssuerName(cardInfo.cardNumber) && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500">
                      {getCardIssuerName(cardInfo.cardNumber)}
                    </div>
                  )}
                </div>
                {localErrors.cardNumber && (
                  <div className="mt-1 flex items-center text-xs text-red-500">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {localErrors.cardNumber}
                  </div>
                )}
              </div>
              
              {/* 카드 소유자 이름 */}
              <div>
                <Label htmlFor="cardHolder" className="flex items-center">
                  카드 소유자 이름 <span className="ml-1 text-red-500">*</span>
                </Label>
                <Input
                  id="cardHolder"
                  name="cardHolder"
                  value={cardInfo.cardHolder}
                  onChange={handleCardInfoChange}
                  placeholder="홍길동"
                  className={localErrors.cardHolder ? 'border-red-500' : ''}
                />
                {localErrors.cardHolder && (
                  <div className="mt-1 flex items-center text-xs text-red-500">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {localErrors.cardHolder}
                  </div>
                )}
              </div>
              
              {/* 만료일 및 CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate" className="flex items-center">
                    만료일 <span className="ml-1 text-red-500">*</span>
                  </Label>
                  <Input
                    id="expiryDate"
                    name="expiryDate"
                    value={cardInfo.expiryDate}
                    onChange={handleCardInfoChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    className={localErrors.expiryDate ? 'border-red-500' : ''}
                  />
                  {localErrors.expiryDate && (
                    <div className="mt-1 flex items-center text-xs text-red-500">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      {localErrors.expiryDate}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="cvv" className="flex items-center">
                    CVV <span className="ml-1 text-red-500">*</span>
                  </Label>
                  <Input
                    id="cvv"
                    name="cvv"
                    value={cardInfo.cvv}
                    onChange={handleCardInfoChange}
                    placeholder="123"
                    maxLength={4}
                    className={localErrors.cvv ? 'border-red-500' : ''}
                  />
                  {localErrors.cvv && (
                    <div className="mt-1 flex items-center text-xs text-red-500">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      {localErrors.cvv}
                    </div>
                  )}
                </div>
              </div>
              
              <p className="mt-2 text-xs text-gray-500">
                * 카드 정보는 안전하게 보호되며, 실제 결제는 카드사의 보안 페이지를 통해 진행됩니다.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 카카오페이 안내 */}
      {paymentMethod === 'kakaopay' && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400">
                <span className="text-lg font-bold text-black">K</span>
              </div>
              <div>
                <h3 className="text-lg font-medium">카카오페이로 결제하기</h3>
                <p className="mt-2 text-sm text-gray-500">
                  결제 진행 시 카카오페이 결제창으로 이동합니다.
                  <br />
                  카카오톡 앱이 설치된 기기에서 진행해주세요.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 토스페이 안내 */}
      {paymentMethod === 'tosspay' && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500">
                <span className="text-lg font-bold text-white">T</span>
              </div>
              <div>
                <h3 className="text-lg font-medium">토스페이로 결제하기</h3>
                <p className="mt-2 text-sm text-gray-500">
                  결제 진행 시 토스페이 결제창으로 이동합니다.
                  <br />
                  토스 앱이 설치된 기기에서 진행해주세요.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 무통장 입금 안내 */}
      {paymentMethod === 'bank' && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">무통장 입금 안내</h3>
              <div className="rounded-md bg-gray-50 p-4">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">은행명</p>
                    <p className="font-medium">신한은행</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">계좌번호</p>
                    <p className="font-medium">123-456-789012</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">예금주</p>
                    <p className="font-medium">(주)트래블</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">입금기한</p>
                    <p className="font-medium">주문일로부터 24시간 이내</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                * 입금자명은 주문자 이름과 동일해야 합니다.
                <br />
                * 기한 내 미입금 시 자동으로 주문이 취소됩니다.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 특별 요청사항 */}
      <div className="space-y-2">
        <Label htmlFor="specialRequests">특별 요청사항 (선택)</Label>
        <Textarea
          id="specialRequests"
          placeholder="여행 또는 숙박 시 필요한 특별 요청사항이 있으면 입력해주세요."
          value={specialRequests}
          onChange={handleSpecialRequestsChange}
          className="min-h-[100px]"
        />
        <p className="text-xs text-gray-500">
          * 특별 요청사항은 가능한 범위 내에서 제공되며, 보장되지 않을 수 있습니다.
        </p>
      </div>
      
      {/* 이용 약관 동의 */}
      <div className="space-y-4">
        <div className="rounded-md border p-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={isAgreeToTerms}
              onCheckedChange={handleTermsAgreementChange}
            />
            <Label
              htmlFor="terms"
              className="flex cursor-pointer items-center text-sm font-medium"
            >
              <span>
                <span className="text-red-500">*</span> 이용 약관 및 개인정보 처리방침에 동의합니다.
              </span>
            </Label>
          </div>
          {localErrors.termsAgreement && (
            <div className="mt-2 flex items-center text-xs text-red-500">
              <AlertCircle className="mr-1 h-3 w-3" />
              {localErrors.termsAgreement}
            </div>
          )}
          <div className="mt-2 flex items-center text-xs text-blue-600">
            <FileText className="mr-1 h-3 w-3" />
            <button
              type="button"
              className="underline hover:text-blue-800"
              onClick={() => window.open('/terms', '_blank')}
            >
              이용 약관 보기
            </button>
          </div>
        </div>
      </div>
      
      {/* 이전/다음 버튼 */}
      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={handlePrevious}>
          이전 단계
        </Button>
        <Button type="button" onClick={handleNext}>
          다음 단계 <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
