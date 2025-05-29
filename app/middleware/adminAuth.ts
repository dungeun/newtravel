import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// 관리자 권한 확인 미들웨어
export async function adminAuthMiddleware(req: NextRequest) {
  try {
    // JWT 토큰 가져오기
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    // 인증되지 않은 사용자
    if (!token) {
      console.log('Admin API 접근 거부: 인증되지 않은 사용자');
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    
    // 관리자 권한 확인
    if (token.role !== 'admin') {
      console.log(`Admin API 접근 거부: 권한 없음 (역할: ${token.role})`);
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }
    
    // 관리자 인증 성공
    console.log('Admin API 접근 허용: 관리자 인증 성공');
    return NextResponse.next();
  } catch (error) {
    console.error('Admin 인증 미들웨어 오류:', error);
    return NextResponse.json(
      { error: '인증 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 오류 처리 래퍼 함수
export function withErrorHandling(handler: Function) {
  return async (req: NextRequest, context: any) => {
    try {
      // 관리자 인증 미들웨어 실행
      const authResponse = await adminAuthMiddleware(req);
      
      // 인증 실패 시 오류 응답 반환
      if (authResponse instanceof NextResponse && authResponse.status !== 200) {
        return authResponse;
      }
      
      // 핸들러 실행
      return await handler(req, context);
    } catch (error: any) {
      console.error('API 요청 처리 오류:', error);
      
      // 오류 유형에 따른 적절한 상태 코드 결정
      let statusCode = 500;
      let errorMessage = '요청을 처리하는 중 오류가 발생했습니다.';
      
      if (error.code === 'not-found') {
        statusCode = 404;
        errorMessage = '요청한 리소스를 찾을 수 없습니다.';
      } else if (error.code === 'invalid-argument') {
        statusCode = 400;
        errorMessage = '잘못된 요청입니다.';
      } else if (error.code === 'permission-denied') {
        statusCode = 403;
        errorMessage = '이 작업을 수행할 권한이 없습니다.';
      } else if (error.code === 'unauthenticated') {
        statusCode = 401;
        errorMessage = '인증이 필요합니다.';
      } else if (error.code === 'already-exists') {
        statusCode = 409;
        errorMessage = '리소스가 이미 존재합니다.';
      }
      
      // 커스텀 에러 메시지가 있으면 사용
      if (error.message) {
        errorMessage = error.message;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: statusCode }
      );
    }
  };
}
