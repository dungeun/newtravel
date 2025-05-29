'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { auth } from '@/firebase/config';
import { sendPasswordResetEmail } from 'firebase/auth';

// 비밀번호 재설정 폼 스키마
const resetPasswordSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요.'),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, data.email);
      
      // 성공 메시지
      setEmailSent(true);
      toast({
        title: '비밀번호 재설정 이메일 발송 완료',
        description: '이메일을 확인하여 비밀번호 재설정을 완료해주세요.',
      });
    } catch (error: any) {
      console.error('Reset password error:', error);
      
      // 에러 메시지 처리
      let errorMessage = '비밀번호 재설정 이메일 발송에 실패했습니다.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = '입력하신 이메일로 등록된 계정을 찾을 수 없습니다.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '유효하지 않은 이메일 형식입니다.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.';
      }
      
      toast({
        title: '이메일 발송 실패',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="text-center">
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <div className="text-sm text-green-700">
            이메일이 성공적으로 발송되었습니다. 받은 메일함을 확인해주세요.
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          이메일을 받지 못하셨나요? 스팸함을 확인하거나 다시 시도해주세요.
        </p>
        <Button
          className="mt-4"
          onClick={() => setEmailSent(false)}
        >
          다시 시도하기
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일</label>
        <Input
          id="email"
          type="email"
          placeholder="your-email@example.com"
          {...register('email')}
          autoComplete="email"
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? '처리 중...' : '비밀번호 재설정 이메일 보내기'}
      </Button>
    </form>
  );
} 