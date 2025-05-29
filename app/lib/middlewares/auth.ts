import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/api/auth/[...nextauth]/route';

/**
 * 오류 응답 생성 함수
 * @param message 오류 메시지
 * @param status HTTP 상태 코드
 * @returns NextResponse 객체
 */
export const createErrorResponse = (message: string, status: number = 400) => {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
};

/**
 * 인증 확인 미들웨어
 * @param req NextRequest 객체
 * @returns 인증 결과 객체
 */
export const checkAuth = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return { 
      authenticated: false, 
      error: '로그인이 필요합니다.', 
      status: 401 
    };
  }
  
  return { 
    authenticated: true, 
    userId: session.user.id,
    user: session.user
  };
};

/**
 * 관리자 권한 확인 미들웨어
 * @param req NextRequest 객체
 * @returns 인증 및 권한 결과 객체
 */
export const checkAdmin = async (req: NextRequest) => {
  const authResult = await checkAuth(req);
  
  if (!authResult.authenticated) {
    return authResult;
  }
  
  if (!authResult.user.isAdmin) {
    return { 
      authenticated: true, 
      authorized: false,
      error: '관리자 권한이 필요합니다.', 
      status: 403 
    };
  }
  
  return { 
    authenticated: true, 
    authorized: true,
    userId: authResult.user.id,
    user: authResult.user
  };
};

/**
 * 리소스 소유자 확인 미들웨어
 * @param req NextRequest 객체
 * @param resourceUserId 리소스 소유자 ID
 * @returns 인증 및 권한 결과 객체
 */
export const checkResourceOwner = async (req: NextRequest, resourceUserId: string) => {
  const authResult = await checkAuth(req);
  
  if (!authResult.authenticated) {
    return authResult;
  }
  
  // 관리자이거나 리소스 소유자인 경우 접근 허용
  if (authResult.user.isAdmin || authResult.userId === resourceUserId) {
    return { 
      authenticated: true, 
      authorized: true,
      userId: authResult.user.id,
      user: authResult.user
    };
  }
  
  return { 
    authenticated: true, 
    authorized: false,
    error: '해당 리소스에 대한 권한이 없습니다.', 
    status: 403 
  };
};
