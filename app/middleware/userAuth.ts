import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// 사용자 인증 미들웨어
export async function userAuthMiddleware(req: NextRequest) {
  try {
    // JWT 토큰 확인
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    // 토큰이 없거나 사용자 정보가 없는 경우
    if (!token || !token.sub) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }
    
    // 요청 컨텍스트에 사용자 ID 추가
    req.headers.set('x-user-id', token.sub);
    
    return NextResponse.next();
  } catch (error) {
    console.error('사용자 인증 미들웨어 오류:', error);
    return NextResponse.json(
      { error: '인증 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 오류 처리 미들웨어
export function withUserAuth(handler: Function) {
  return async function(req: NextRequest, ...args: any[]) {
    try {
      // 사용자 인증 미들웨어 실행
      const authResponse = await userAuthMiddleware(req);
      
      // 인증 실패 시 오류 응답 반환
      if (authResponse.status !== 200) {
        return authResponse;
      }
      
      // 인증 성공 시 핸들러 실행
      return await handler(req, ...args);
    } catch (error) {
      console.error('API 핸들러 오류:', error);
      return NextResponse.json(
        { error: '요청을 처리하는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  };
}
