'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormValues } from '@/utils/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { signIn } from 'next-auth/react';
import { auth } from '@/firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';

interface LoginFormProps {
  callbackUrl?: string;
}

export default function LoginForm({ callbackUrl = '/' }: LoginFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      // Firebase Authentication으로 로그인
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      if (!userCredential.user) {
        throw new Error('인증에 실패했습니다.');
      }

      // NextAuth 세션 생성
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // 성공 메시지
      toast({
        title: '로그인 성공',
        description: '환영합니다!',
      });

      // 리디렉션
      router.push(callbackUrl);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // 에러 메시지 처리
      let errorMessage = '로그인에 실패했습니다.';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = '이 계정은 비활성화되었습니다. 관리자에게 문의하세요.';
      }
      
      toast({
        title: '로그인 실패',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">비밀번호</label>
        <Input
          id="password"
          type="password"
          {...register('password')}
          autoComplete="current-password"
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? '로그인 중...' : '로그인'}
      </Button>
    </form>
  );
} 