import { NextRequest, NextResponse } from 'next/server';
import { createUser, getAllUsers } from '@/lib/users';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/api/auth/[...nextauth]/route';

// GET /api/users
export async function GET(request: NextRequest) {
  try {
    // 세션 정보 확인 및 권한 체크
    const session = await getServerSession(authOptions);
    
    // 인증되지 않은 사용자 거부
    if (!session) {
      return NextResponse.json({
        error: '로그인이 필요합니다.',
        success: false
      }, { status: 401 });
    }
    
    // 관리자가 아닌 경우 접근 거부
    // @ts-ignore - session.user.role이 타입 정의에 없을 수 있음
    if (session.user.role !== 'admin') {
      return NextResponse.json({
        error: '관리자만 접근할 수 있습니다.',
        success: false
      }, { status: 403 });
    }
    
    // 모든 사용자 목록 조회
    const users = await getAllUsers();
    
    return NextResponse.json({
      users,
      message: '사용자 목록 조회 성공',
      success: true
    }, { status: 200 });
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    return NextResponse.json({
      error: '사용자 목록을 가져오는 중 오류가 발생했습니다.',
      success: false
    }, { status: 500 });
  }
}

// POST /api/users
export async function POST(req: NextRequest) {
  const data = await req.json();
  // TODO: 데이터 유효성 검사 필요
  const id = await createUser(data);
  return NextResponse.json({ id });
} 