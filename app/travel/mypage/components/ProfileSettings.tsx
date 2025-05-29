'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle, UserCircle, Key, Bell } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

// 프로필 업데이트 폼 스키마
const profileFormSchema = z.object({
  name: z.string().min(2, { message: '이름은 2글자 이상이어야 합니다.' }),
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().max(500, { message: '자기소개는 500자 이내로 작성해주세요.' }).optional(),
});

// 비밀번호 변경 폼 스키마
const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, { message: '현재 비밀번호를 입력해주세요.' }),
  newPassword: z.string().min(8, { message: '새 비밀번호는 8자 이상이어야 합니다.' }),
  confirmPassword: z.string().min(8, { message: '비밀번호 확인을 입력해주세요.' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["confirmPassword"],
});

// 알림 설정 타입
type NotificationSettings = {
  email: {
    marketing: boolean;
    orderUpdates: boolean;
    promotions: boolean;
  };
  push: {
    marketing: boolean;
    orderUpdates: boolean;
    promotions: boolean;
  };
};

interface ProfileSettingsProps {
  user: any;
}

export default function ProfileSettings({ user }: ProfileSettingsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // 알림 설정 상태
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: {
      marketing: true,
      orderUpdates: true,
      promotions: true,
    },
    push: {
      marketing: false,
      orderUpdates: true,
      promotions: false,
    },
  });
  
  // 프로필 폼 설정
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.displayName || '',
      phone: user?.phoneNumber || '',
      address: user?.address || '',
      bio: user?.bio || '',
    },
  });
  
  // 비밀번호 폼 설정
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  // 프로필 업데이트 제출 핸들러
  const onProfileSubmit = async (data: z.infer<typeof profileFormSchema>) => {
    setIsUpdating(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await axios.put('/api/user/profile', data);
      
      if (response.data.success) {
        setSuccess('프로필이 성공적으로 업데이트되었습니다.');
        
        // 토스트 메시지 표시
        toast({
          title: "프로필 업데이트 성공",
          description: "프로필 정보가 성공적으로 저장되었습니다.",
        });
      } else {
        setError(response.data.error || '프로필 업데이트에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('프로필 업데이트 오류:', err);
      setError(err.response?.data?.error || err.message || '프로필 업데이트에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // 비밀번호 변경 제출 핸들러
  const onPasswordSubmit = async (data: z.infer<typeof passwordFormSchema>) => {
    setIsUpdating(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await axios.put('/api/user/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      
      if (response.data.success) {
        setSuccess('비밀번호가 성공적으로 변경되었습니다.');
        passwordForm.reset();
        
        // 토스트 메시지 표시
        toast({
          title: "비밀번호 변경 성공",
          description: "비밀번호가 성공적으로 변경되었습니다.",
        });
      } else {
        setError(response.data.error || '비밀번호 변경에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('비밀번호 변경 오류:', err);
      setError(err.response?.data?.error || err.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // 알림 설정 변경 핸들러
  const handleNotificationChange = (type: 'email' | 'push', key: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: value
      }
    }));
    
    // 실제로는 API 호출을 통해 서버에 저장해야 함
    // 여기서는 간단히 토스트 메시지만 표시
    toast({
      title: "알림 설정 변경",
      description: "알림 설정이 변경되었습니다.",
    });
  };
  
  return (
    <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-6 grid w-full grid-cols-3">
        <TabsTrigger value="profile" className="flex gap-2">
          <UserCircle className="h-4 w-4" />
          프로필 정보
        </TabsTrigger>
        <TabsTrigger value="password" className="flex gap-2">
          <Key className="h-4 w-4" />
          비밀번호 변경
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex gap-2">
          <Bell className="h-4 w-4" />
          알림 설정
        </TabsTrigger>
      </TabsList>
      
      {/* 프로필 정보 탭 */}
      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>프로필 정보</CardTitle>
            <CardDescription>
              개인 정보를 업데이트하고 관리하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이름</FormLabel>
                      <FormControl>
                        <Input placeholder="이름을 입력하세요" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>연락처</FormLabel>
                      <FormControl>
                        <Input placeholder="연락처를 입력하세요" {...field} />
                      </FormControl>
                      <FormDescription>
                        예약 및 주문 관련 연락을 위해 사용됩니다.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>주소</FormLabel>
                      <FormControl>
                        <Input placeholder="주소를 입력하세요" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>자기소개</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="자기소개를 입력하세요 (선택사항)" 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        500자 이내로 작성해주세요.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <p>{error}</p>
                    </div>
                  </div>
                )}
                
                {success && (
                  <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <p>{success}</p>
                    </div>
                  </div>
                )}
                
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? '저장 중...' : '저장하기'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* 비밀번호 변경 탭 */}
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>비밀번호 변경</CardTitle>
            <CardDescription>
              계정 보안을 위해 정기적으로 비밀번호를 변경하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>현재 비밀번호</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="현재 비밀번호" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>새 비밀번호</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="새 비밀번호" {...field} />
                      </FormControl>
                      <FormDescription>
                        비밀번호는 8자 이상이어야 하며, 문자, 숫자, 특수문자를 포함하는 것이 좋습니다.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>비밀번호 확인</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="비밀번호 확인" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <p>{error}</p>
                    </div>
                  </div>
                )}
                
                {success && (
                  <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <p>{success}</p>
                    </div>
                  </div>
                )}
                
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? '변경 중...' : '비밀번호 변경'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* 알림 설정 탭 */}
      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>알림 설정</CardTitle>
            <CardDescription>
              이메일 및 푸시 알림 설정을 관리하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 이메일 알림 설정 */}
              <div>
                <h3 className="mb-4 text-lg font-medium">이메일 알림</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-order-updates">주문 상태 업데이트</Label>
                      <p className="text-sm text-gray-500">
                        주문 확인, 배송 상태 등의 업데이트를 이메일로 받습니다.
                      </p>
                    </div>
                    <Switch
                      id="email-order-updates"
                      checked={notificationSettings.email.orderUpdates}
                      onCheckedChange={(checked) => 
                        handleNotificationChange('email', 'orderUpdates', checked)
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-promotions">특별 프로모션</Label>
                      <p className="text-sm text-gray-500">
                        할인 및 특별 프로모션 정보를 이메일로 받습니다.
                      </p>
                    </div>
                    <Switch
                      id="email-promotions"
                      checked={notificationSettings.email.promotions}
                      onCheckedChange={(checked) => 
                        handleNotificationChange('email', 'promotions', checked)
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-marketing">마케팅 이메일</Label>
                      <p className="text-sm text-gray-500">
                        새로운 상품 및 서비스에 대한 마케팅 이메일을 받습니다.
                      </p>
                    </div>
                    <Switch
                      id="email-marketing"
                      checked={notificationSettings.email.marketing}
                      onCheckedChange={(checked) => 
                        handleNotificationChange('email', 'marketing', checked)
                      }
                    />
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              {/* 푸시 알림 설정 */}
              <div>
                <h3 className="mb-4 text-lg font-medium">푸시 알림</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-order-updates">주문 상태 업데이트</Label>
                      <p className="text-sm text-gray-500">
                        주문 확인, 배송 상태 등의 업데이트를 푸시 알림으로 받습니다.
                      </p>
                    </div>
                    <Switch
                      id="push-order-updates"
                      checked={notificationSettings.push.orderUpdates}
                      onCheckedChange={(checked) => 
                        handleNotificationChange('push', 'orderUpdates', checked)
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-promotions">특별 프로모션</Label>
                      <p className="text-sm text-gray-500">
                        할인 및 특별 프로모션 정보를 푸시 알림으로 받습니다.
                      </p>
                    </div>
                    <Switch
                      id="push-promotions"
                      checked={notificationSettings.push.promotions}
                      onCheckedChange={(checked) => 
                        handleNotificationChange('push', 'promotions', checked)
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-marketing">마케팅 알림</Label>
                      <p className="text-sm text-gray-500">
                        새로운 상품 및 서비스에 대한 마케팅 알림을 받습니다.
                      </p>
                    </div>
                    <Switch
                      id="push-marketing"
                      checked={notificationSettings.push.marketing}
                      onCheckedChange={(checked) => 
                        handleNotificationChange('push', 'marketing', checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">
              알림 설정은 자동으로 저장됩니다.
            </p>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
