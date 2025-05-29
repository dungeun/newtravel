'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

/**
 * 대시보드 인증 컴포넌트
 * 대시보드 접근에 필요한 인증 및 권한 체크를 담당합니다.
 */
export default function DashboardAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();

  // NextAuth 세션 기반 권한 체크
  useEffect(() => {
    console.log('DashboardAuth: 세션 상태 확인', { status, session });
    
    // 세션 로딩 중
    if (status === 'loading') {
      return;
    }
    
    // 인증되지 않음
    if (status === 'unauthenticated') {
      console.log('DashboardAuth: 인증되지 않음, 로그인으로 리디렉션');
      router.push('/auth/signin?callbackUrl=/admin');
      return;
    }
    
    // 인증됨
    if (status === 'authenticated' && session?.user) {
      // 관리자 권한이 있는 경우에만 접근 허용
      const userRole = session.user.role;
      console.log('DashboardAuth: 인증됨, 사용자 역할 확인', userRole);
      
      if (userRole === 'admin' || userRole === 'superadmin') {
        console.log('DashboardAuth: 관리자 권한 확인, 접근 허용');
        setIsAuthorized(true);
      } else {
        console.log('DashboardAuth: 관리자 권한 없음, 메인으로 리디렉션');
        router.push('/');
      }
    }
    
    setIsLoading(false);
  }, [status, session, router]);

  // 세션 만료 감지 및 처리 (세션 타임아웃)
  useEffect(() => {
    // 인증된 상태에서만 세션 타임아웃 적용
    if (!isAuthorized) return;
    
    // 세션 만료 이벤트 리스너
    const handleSessionExpired = () => {
      // 세션 만료 시 처리
      setIsAuthorized(false);
      router.push('/auth/signin?callbackUrl=/admin&reason=session_expired');
    };

    // 사용자 비활성 감지 (예: 30분)
    let inactivityTimer: NodeJS.Timeout;
    
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        handleSessionExpired();
      }, 30 * 60 * 1000); // 30분
    };

    // 사용자 활동 이벤트 리스너
    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    // 이벤트 리스너 등록
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('keypress', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);
    window.addEventListener('mousemove', handleUserActivity);
    
    // 초기 타이머 설정
    resetInactivityTimer();

    // 클린업 함수
    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('keypress', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      window.removeEventListener('mousemove', handleUserActivity);
    };
  }, [isAuthorized, router]);

  // 로딩 중이면 로딩 인디케이터 표시
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
        <span className="ml-2">권한 확인 중...</span>
      </div>
    );
  }

  // 권한이 있으면 자식 컴포넌트 렌더링
  return isAuthorized ? children : null;
} 