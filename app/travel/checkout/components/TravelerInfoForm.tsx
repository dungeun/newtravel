'use client';

import { useState } from 'react';
import { useOrder, TravelerInfo } from '@/hooks/useOrder';
import { useCheckout } from '@/hooks/useCheckout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, PlusCircle, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function TravelerInfoForm() {
  const { orderInfo, addTraveler, updateTraveler, removeTraveler } = useOrder();
  const { setStepCompleted, goToNextStep, goToPreviousStep, requiredTravelers } = useCheckout();
  
  const [currentTraveler, setCurrentTraveler] = useState<TravelerInfo>({
    id: '',
    name: '',
    birthdate: '',
    gender: 'male',
    phone: '',
    email: '',
    passportNumber: '',
    passportExpiry: '',
    nationality: '',
    specialRequests: '',
  });
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  
  // 여행자 추가 폼 초기화
  const initializeNewTravelerForm = () => {
    setCurrentTraveler({
      id: uuidv4(),
      name: '',
      birthdate: '',
      gender: 'male',
      phone: '',
      email: '',
      passportNumber: '',
      passportExpiry: '',
      nationality: '',
      specialRequests: '',
    });
    setEditingIndex(null);
    setShowForm(true);
    setLocalErrors({});
  };
  
  // 여행자 수정 폼 초기화
  const editTraveler = (traveler: TravelerInfo, index: number) => {
    setCurrentTraveler({ ...traveler });
    setEditingIndex(index);
    setShowForm(true);
    setLocalErrors({});
  };
  
  // 입력값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentTraveler(prev => ({ ...prev, [name]: value }));
    
    // 입력 시 해당 필드 오류 메시지 제거
    if (localErrors[name]) {
      setLocalErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };
  
  // 성별 변경 핸들러
  const handleGenderChange = (value: string) => {
    setCurrentTraveler(prev => ({ ...prev, gender: value as 'male' | 'female' | 'other' }));
    
    // 입력 시 해당 필드 오류 메시지 제거
    if (localErrors['gender']) {
      setLocalErrors(prev => {
        const updated = { ...prev };
        delete updated['gender'];
        return updated;
      });
    }
  };
  
  // 국적 변경 핸들러
  const handleNationalityChange = (value: string) => {
    setCurrentTraveler(prev => ({ ...prev, nationality: value }));
    
    // 입력 시 해당 필드 오류 메시지 제거
    if (localErrors['nationality']) {
      setLocalErrors(prev => {
        const updated = { ...prev };
        delete updated['nationality'];
        return updated;
      });
    }
  };
  
  // 여행자 정보 저장 핸들러
  const handleSaveTraveler = () => {
    // 필수 필드 검증
    const errors: Record<string, string> = {};
    
    if (!currentTraveler.name) {
      errors.name = '이름을 입력해주세요.';
    }
    
    if (!currentTraveler.birthdate) {
      errors.birthdate = '생년월일을 입력해주세요.';
    } else {
      // 생년월일 형식 검증 (YYYY-MM-DD)
      const birthdatePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!birthdatePattern.test(currentTraveler.birthdate)) {
        errors.birthdate = '생년월일 형식이 올바르지 않습니다. (YYYY-MM-DD)';
      }
    }
    
    if (!currentTraveler.gender) {
      errors.gender = '성별을 선택해주세요.';
    }
    
    // 선택적 필드 검증
    if (currentTraveler.phone && !/^\d{10,11}$/.test(currentTraveler.phone.replace(/-/g, ''))) {
      errors.phone = '유효한 전화번호 형식이 아닙니다.';
    }
    
    if (currentTraveler.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentTraveler.email)) {
      errors.email = '유효한 이메일 형식이 아닙니다.';
    }
    
    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }
    
    // 여행자 정보 저장
    if (editingIndex !== null) {
      // 기존 여행자 정보 업데이트
      updateTraveler(currentTraveler.id, currentTraveler);
    } else {
      // 새 여행자 추가
      addTraveler(currentTraveler);
    }
    
    // 폼 초기화
    setShowForm(false);
    setEditingIndex(null);
  };
  
  // 여행자 삭제 핸들러
  const handleRemoveTraveler = (id: string) => {
    if (window.confirm('여행자 정보를 삭제하시겠습니까?')) {
      removeTraveler(id);
    }
  };
  
  // 폼 취소 핸들러
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingIndex(null);
    setLocalErrors({});
  };
  
  // 다음 단계로 이동
  const handleNext = () => {
    // 필요한 여행자 수 검증
    const { adult = 0, child = 0, infant = 0 } = requiredTravelers;
    const requiredTotal = adult + child + infant;
    
    if (orderInfo.travelers.length < requiredTotal) {
      alert(`최소 ${requiredTotal}명의 여행자 정보가 필요합니다.`);
      return;
    }
    
    // 단계 완료 표시
    setStepCompleted('traveler-info', true);
    
    // 다음 단계로 이동
    goToNextStep();
  };
  
  // 이전 단계로 이동
  const handlePrevious = () => {
    goToPreviousStep();
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">여행자 정보</h2>
      <p className="text-sm text-gray-500">
        여행에 참여하는 모든 여행자의 정보를 입력해주세요.
        {requiredTravelers.adult > 0 && ` (성인: ${requiredTravelers.adult}명`}
        {requiredTravelers.child > 0 && `, 아동: ${requiredTravelers.child}명`}
        {requiredTravelers.infant > 0 && `, 유아: ${requiredTravelers.infant}명`}
        {(requiredTravelers.adult > 0 || requiredTravelers.child > 0 || requiredTravelers.infant > 0) && ')'}
      </p>
      
      {/* 여행자 목록 */}
      {orderInfo.travelers.length > 0 && (
        <div className="space-y-4">
          {orderInfo.travelers.map((traveler, index) => (
            <Card key={traveler.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      여행자 {index + 1}: {traveler.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {traveler.birthdate} · {traveler.gender === 'male' ? '남성' : traveler.gender === 'female' ? '여성' : '기타'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editTraveler(traveler, index)}
                    >
                      수정
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveTraveler(traveler.id)}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* 여행자 추가 버튼 */}
      {!showForm && (
        <Button
          variant="outline"
          className="w-full"
          onClick={initializeNewTravelerForm}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          여행자 추가
        </Button>
      )}
      
      {/* 여행자 정보 폼 */}
      {showForm && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* 이름 입력 */}
              <div>
                <Label htmlFor="name" className="flex items-center">
                  이름 <span className="ml-1 text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={currentTraveler.name}
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
              
              {/* 생년월일 입력 */}
              <div>
                <Label htmlFor="birthdate" className="flex items-center">
                  생년월일 <span className="ml-1 text-red-500">*</span>
                </Label>
                <Input
                  id="birthdate"
                  name="birthdate"
                  type="date"
                  value={currentTraveler.birthdate}
                  onChange={handleChange}
                  className={localErrors.birthdate ? 'border-red-500' : ''}
                />
                {localErrors.birthdate && (
                  <div className="mt-1 flex items-center text-xs text-red-500">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {localErrors.birthdate}
                  </div>
                )}
              </div>
              
              {/* 성별 선택 */}
              <div>
                <Label className="flex items-center">
                  성별 <span className="ml-1 text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={currentTraveler.gender}
                  onValueChange={handleGenderChange}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">남성</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">여성</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">기타</Label>
                  </div>
                </RadioGroup>
                {localErrors.gender && (
                  <div className="mt-1 flex items-center text-xs text-red-500">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {localErrors.gender}
                  </div>
                )}
              </div>
              
              {/* 연락처 입력 (선택) */}
              <div>
                <Label htmlFor="phone">연락처 (선택)</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={currentTraveler.phone || ''}
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
              </div>
              
              {/* 이메일 입력 (선택) */}
              <div>
                <Label htmlFor="email">이메일 (선택)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={currentTraveler.email || ''}
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
              
              {/* 여권번호 입력 (선택) */}
              <div>
                <Label htmlFor="passportNumber">여권번호 (선택)</Label>
                <Input
                  id="passportNumber"
                  name="passportNumber"
                  value={currentTraveler.passportNumber || ''}
                  onChange={handleChange}
                  placeholder="M12345678"
                />
              </div>
              
              {/* 여권만료일 입력 (선택) */}
              <div>
                <Label htmlFor="passportExpiry">여권만료일 (선택)</Label>
                <Input
                  id="passportExpiry"
                  name="passportExpiry"
                  type="date"
                  value={currentTraveler.passportExpiry || ''}
                  onChange={handleChange}
                />
              </div>
              
              {/* 국적 선택 (선택) */}
              <div>
                <Label htmlFor="nationality">국적 (선택)</Label>
                <Select
                  value={currentTraveler.nationality || ''}
                  onValueChange={handleNationalityChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="국적을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KR">대한민국</SelectItem>
                    <SelectItem value="US">미국</SelectItem>
                    <SelectItem value="JP">일본</SelectItem>
                    <SelectItem value="CN">중국</SelectItem>
                    <SelectItem value="OTHER">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* 특별 요청사항 (선택) */}
              <div>
                <Label htmlFor="specialRequests">특별 요청사항 (선택)</Label>
                <Textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={currentTraveler.specialRequests || ''}
                  onChange={handleChange}
                  placeholder="알레르기, 식이 제한 등 특별한 요청사항이 있으면 입력해주세요."
                  rows={3}
                />
              </div>
              
              {/* 버튼 영역 */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelForm}
                >
                  취소
                </Button>
                <Button type="button" onClick={handleSaveTraveler}>
                  {editingIndex !== null ? '수정 완료' : '추가'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 이전/다음 버튼 */}
      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={handlePrevious}>
          이전 단계
        </Button>
        <Button type="button" onClick={handleNext}>
          다음 단계
        </Button>
      </div>
    </div>
  );
}
