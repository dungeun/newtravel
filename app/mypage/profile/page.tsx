'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

// UI Components
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator/index';

// Toast implementation
type ToastProps = {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
};

type ToastHook = {
  toast: (props: ToastProps) => void;
};

// Temporary mock for useToast hook
const useToast = (): ToastHook => {
  return {
    toast: (props) => {
      console.log(`Toast: ${props.title} - ${props.description}`);
      // In a real implementation, this would show a toast notification
    }
  };
};

// Icons
import { Pencil, Save, Loader2, AlertCircle } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  profileImage?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  // Since status is not available in useAuth, we'll handle authentication differently
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formChanged, setFormChanged] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 인증 상태 확인 및 리디렉션
  useEffect(() => {
    // Check if user is authenticated
    if (user?.id) {
      setAuthStatus('authenticated');
      fetchUserProfile();
    } else if (user === null) {
      setAuthStatus('unauthenticated');
      router.push('/login?callbackUrl=/mypage/profile');
    }
  }, [user, router]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login?callbackUrl=/mypage/profile');
    }
  }, [authStatus, router]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // API 엔드포인트 호출
      const response = await fetch('/api/mypage/profile');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || '프로필 정보를 불러오는 데 실패했습니다.');
      }
      
      const data = await response.json();
      
      // 응답 구조 확인 및 데이터 추출
      if (data.success && data.profile) {
        setProfile(data.profile);
      } else {
        throw new Error('프로필 데이터 형식이 올바르지 않습니다.');
      }
    } catch (err: any) {
      console.error('프로필 조회 오류:', err);
      setError(err.message || '프로필 정보를 불러오는 중 오류가 발생했습니다.');
      toast({
        title: "프로필 로딩 실패",
        description: err.message || '프로필 정보를 불러오는 중 오류가 발생했습니다.',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // 입력값 유효성 검사
    validateField(name, value);
    
    if (name.includes('.')) {
      // 중첩된 객체 속성 처리 (예: address.street)
      const [parent, child] = name.split('.');
      setProfile(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          [parent]: {
            ...prev[parent as keyof UserProfile] as object,
            [child]: value
          }
        };
      });
    } else {
      // 일반 속성 처리
      setProfile(prev => {
        if (!prev) return prev;
        return { ...prev, [name]: value };
      });
    }
    
    setFormChanged(true);
  };
  
  // 필드 유효성 검사
  const validateField = (name: string, value: string) => {
    const errors = { ...validationErrors };
    
    if (name === 'name') {
      if (!value.trim()) {
        errors.name = '이름은 필수 입력 항목입니다.';
      } else if (value.length < 2) {
        errors.name = '이름은 최소 2자 이상이어야 합니다.';
      } else {
        delete errors.name;
      }
    }
    
    if (name === 'phone') {
      const phoneRegex = /^\d{2,3}-?\d{3,4}-?\d{4}$/;
      if (value && !phoneRegex.test(value)) {
        errors.phone = '올바른 전화번호 형식이 아닙니다.';
      } else {
        delete errors.phone;
      }
    }
    
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) {
        errors.email = '이메일은 필수 입력 항목입니다.';
      } else if (!emailRegex.test(value)) {
        errors.email = '올바른 이메일 형식이 아닙니다.';
      } else {
        delete errors.email;
      }
    }
    
    setValidationErrors(errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;
    
    // 모든 필드 유효성 검사
    validateField('name', profile.name);
    validateField('email', profile.email);
    if (profile.phone) validateField('phone', profile.phone);
    
    // 유효성 검사 오류가 있는 경우 제출 중단
    if (Object.keys(validationErrors).length > 0) {
      toast({
        title: "입력 오류",
        description: "입력 항목을 확인해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      // API 엔드포인트 호출
      const response = await fetch('/api/mypage/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || '프로필 정보를 업데이트하는 데 실패했습니다.');
      }
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "프로필 업데이트 성공",
          description: "프로필 정보가 성공적으로 업데이트되었습니다.",
          variant: "default"
        });
        setFormChanged(false);
      } else {
        throw new Error(data.error?.message || '프로필 업데이트에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('프로필 업데이트 오류:', err);
      setError(err.message || '프로필 정보를 업데이트하는 중 오류가 발생했습니다.');
      toast({
        title: "프로필 업데이트 실패",
        description: err.message || '프로필 정보를 업데이트하는 중 오류가 발생했습니다.',
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // 파일 크기 및 형식 검사
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (file.size > maxSizeInBytes) {
      setError('이미지 크기는 5MB 이하여야 합니다.');
      toast({
        title: "이미지 크기 초과",
        description: "이미지 크기는 5MB 이하여야 합니다.",
        variant: "destructive"
      });
      return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      setError('지원되지 않는 이미지 형식입니다. JPG, PNG, GIF, WEBP 형식만 지원합니다.');
      toast({
        title: "지원되지 않는 형식",
        description: "JPG, PNG, GIF, WEBP 형식만 지원합니다.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setUploadingImage(true);
      setError(null);
      
      // FormData 생성
      const formData = new FormData();
      formData.append('image', file);
      
      // API 엔드포인트 호출
      const response = await fetch('/api/mypage/profile/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || '이미지 업로드에 실패했습니다.');
      }
      
      const data = await response.json();
      
      if (data.success && data.profileImage) {
        // 프로필 이미지 URL 업데이트
        setProfile(prev => {
          if (!prev) return prev;
          return { ...prev, profileImage: data.profileImage };
        });
        
        toast({
          title: "이미지 업로드 성공",
          description: "프로필 이미지가 성공적으로 업로드되었습니다.",
          variant: "default"
        });
      } else {
        throw new Error('이미지 업로드 응답 형식이 올바르지 않습니다.');
      }
    } catch (err: any) {
      console.error('이미지 업로드 오류:', err);
      setError(err.message || '이미지 업로드 중 오류가 발생했습니다.');
      toast({
        title: "이미지 업로드 실패",
        description: err.message || '이미지 업로드 중 오류가 발생했습니다.',
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
      
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };



  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <div className="h-8 w-64 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-4 w-full max-w-md bg-gray-200 animate-pulse rounded"></div>
          <div className="my-6 h-px bg-gray-200 w-full"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <div className="h-24 w-24 rounded-full bg-gray-200 animate-pulse"></div>
                  <div className="h-5 w-32 mt-4 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 w-48 mt-2 bg-gray-200 animate-pulse rounded"></div>
                </CardContent>
              </Card>
            </div>
            
            <div className="col-span-1 md:col-span-3">
              <Card>
                <CardContent className="p-6">
                  <div className="h-6 w-32 mb-4 bg-gray-200 animate-pulse rounded"></div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
                      <div className="h-10 w-full bg-gray-200 animate-pulse rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
                      <div className="h-10 w-full bg-gray-200 animate-pulse rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
                      <div className="h-10 w-full bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[30vh]">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md w-full flex items-start space-x-3" role="alert">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-medium">프로필 로딩 오류</h3>
              <p className="text-sm">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => fetchUserProfile()}
              >
                다시 시도
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">내 정보 관리</h1>
      <p className="text-gray-500 mb-6">개인 정보를 확인하고 수정할 수 있습니다.</p>
      
      <div className="h-px bg-gray-200 w-full mb-8"></div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 프로필 이미지 및 기본 정보 */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="relative inline-block">
                <div className="relative">
                  <div className="inline-flex h-24 w-24 select-none items-center justify-center overflow-hidden rounded-full bg-gray-100 relative">
                    {profile?.profileImage ? (
                      <img 
                        src={profile.profileImage} 
                        alt={profile?.name || '사용자'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                        {profile?.name?.substring(0, 2) || 'NA'}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 shadow-md hover:bg-primary/90 transition-colors"
                    aria-label="프로필 이미지 변경"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
                
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/gif, image/webp"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  className="sr-only"
                />
              </div>
              
              <h2 className="text-lg font-medium mt-4">
                {profile?.name || '사용자'}
              </h2>
              <p className="text-gray-500 text-sm">
                {profile?.email}
              </p>
              
              {uploadingImage && (
                <div className="mt-4 flex justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
            </div>
          </div>

          {/* 개인 정보 폼 */}
          <div className="col-span-1 md:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-medium mb-4">개인 정보</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={profile?.name || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={profile?.email || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                    required
                    disabled
                  />
                </div>
                
                <div className="col-span-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                  <input
                    id="phone"
                    type="text"
                    name="phone"
                    value={profile?.phone || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">생년월일</label>
                  <input
                    id="birthDate"
                    type="date"
                    name="birthDate"
                    value={profile?.birthDate || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">성별</label>
                  <select
                    id="gender"
                    name="gender"
                    value={profile?.gender || ''}
                    onChange={handleInputChange as any}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value=""></option>
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                    <option value="other">기타</option>
                  </select>
                </div>
              </div>

              <h2 className="text-lg font-medium mb-4 mt-8">주소 정보</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700 mb-1">우편번호</label>
                  <input
                    id="postalCode"
                    type="text"
                    name="address.postalCode"
                    value={profile?.address?.postalCode || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-1">국가</label>
                  <input
                    id="country"
                    type="text"
                    name="address.country"
                    value={profile?.address?.country || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div className="col-span-2">
                  <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">주소</label>
                  <input
                    id="street"
                    type="text"
                    name="address.street"
                    value={profile?.address?.street || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">시/군/구</label>
                  <input
                    id="city"
                    type="text"
                    name="address.city"
                    value={profile?.address?.city || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-1">시/도</label>
                  <input
                    id="state"
                    type="text"
                    name="address.state"
                    value={profile?.address?.state || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={saving || !formChanged}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      변경사항 저장
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>


    </div>
  );
}
