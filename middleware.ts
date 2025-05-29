import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

// 라우트 가드 미들웨어
export default withAuth(
  // 로그인 상태 아닐 때 리디렉션 처리
  function middleware(req) {
    const { pathname, origin } = req.nextUrl;
    const { token } = req.nextauth;
    
    console.log('미들웨어: 현재 경로', pathname);
    console.log('미들웨어: 토큰 존재 여부', !!token);
    if (token) {
      console.log('미들웨어: 토큰 내용', { 
        id: token.id, 
        role: token.role, 
        name: token.name,
        email: token.email,
        exp: token.exp,
        iat: token.iat
      });
    }
    
    // 디버깅을 위한 로그 출력
    console.log('미들웨어: req.nextauth 객체 키들', Object.keys(req.nextauth));
    
    // 관리자 설정 페이지는 인증 검사 제외
    if (pathname.startsWith('/admin/settings')) {
      console.log('미들웨어: admin/settings 경로 접근 감지');
      console.log('미들웨어: 설정 페이지는 인증 검사 제외, 접근 허용');
      return NextResponse.next();
    }
    
    return NextResponse.next();

    // 특정 관리자 엔드포인트에 대한 접근 제한 (예: 중요한 설정 페이지)
    if (pathname.startsWith('/admin/users') || 
        pathname.startsWith('/admin/products')) {
      // 토큰이 없으면 접근 거부 없이 계속 진행
      if (!token) {
        console.log('미들웨어: 관리자 페이지지만 토큰 체크 없이 접근 허용');
        return NextResponse.next();
      }
    }

    // 다른 모든 경로는 접근 허용
    console.log('미들웨어: 기타 경로 접근 허용');
    return NextResponse.next();
  },
  {
    callbacks: {
      // 미들웨어는 항상 실행되지만, 특정 경로에서만 인증 확인
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        console.log('미들웨어(authorized 콜백): 경로', pathname);
        console.log('미들웨어(authorized 콜백): 토큰 존재 여부', !!token);
        
        // '/admin/settings' 경로만 토큰이 필요함
        if (pathname.startsWith('/admin/settings')) {
          const isAuthorized = !!token;
          console.log('미들웨어(authorized 콜백): settings 경로 인증 결과', isAuthorized);
          return isAuthorized;
        }
        
        // 다른 경로는 인증 없이 허용
        console.log('미들웨어(authorized 콜백): 기타 경로 허용');
        return true;
      },
    },
    pages: {
      // 로그인 페이지 경로
      signIn: '/auth/signin',
    },
  }
);

// 미들웨어를 적용할 경로 설정
export const config = {
  matcher: [
    // 관리자 설정 페이지와 일반 관리자 페이지를 미들웨어가 처리
    '/admin/:path*',
  ],
}; 