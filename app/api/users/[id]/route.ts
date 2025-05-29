import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser, deleteUser } from '@/lib/users';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/api/auth/[...nextauth]/route';

// 사용자 권한 확인 함수 (관리자이거나 본인인지 확인)
async function checkPermission(userId: string) {
  const session = await getServerSession(authOptions);
  
  // 세션이 없는 경우(비로그인)
  if (!session) {
    return {
      hasPermission: false,
      status: 401,
      message: '로그인이 필요합니다.'
    };
  }
  
  // @ts-ignore - session.user.id가 타입 정의에 없을 수 있음
  const isSelf = session.user.id === userId;
  // @ts-ignore - session.user.role이 타입 정의에 없을 수 있음
  const isAdmin = session.user.role === 'admin';
  
  // 권한 체크: 관리자이거나 본인인 경우에만 접근 허용
  if (!isAdmin && !isSelf) {
    return {
      hasPermission: false,
      status: 403,
      message: '접근 권한이 없습니다.'
    };
  }
  
  return {
    hasPermission: true,
    isAdmin,
    isSelf
  };
}

// 단일 사용자 조회 (GET /api/users/[id])
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 권한 체크
    const permission = await checkPermission(params.id);
    if (!permission.hasPermission) {
      return NextResponse.json({
        error: permission.message,
        success: false
      }, { status: permission.status });
    }
    
    const user = await getUserById(params.id);
    
    if (!user) {
      return NextResponse.json({
        error: '사용자를 찾을 수 없습니다.',
        success: false
      }, { status: 404 });
    }
    
    return NextResponse.json({
      user,
      message: '사용자 정보 조회 성공',
      success: true
    }, { status: 200 });
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return NextResponse.json({
      error: '사용자 정보를 조회하는 중 오류가 발생했습니다.',
      success: false
    }, { status: 500 });
  }
}

// 사용자 정보 수정 (PUT /api/users/[id])
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 권한 체크
    const permission = await checkPermission(params.id);
    if (!permission.hasPermission) {
      return NextResponse.json({
        error: permission.message,
        success: false
      }, { status: permission.status });
    }
    
    const data = await request.json();
    
    // 관리자가 아닌 경우, role 필드를 변경하지 못하도록 함
    if (!permission.isAdmin && data.role) {
      delete data.role;
    }
    
    // 사용자 존재 여부 확인
    const existingUser = await getUserById(params.id);
    if (!existingUser) {
      return NextResponse.json({
        error: '사용자를 찾을 수 없습니다.',
        success: false
      }, { status: 404 });
    }
    
    // 업데이트 시간 추가
    data.updatedAt = new Date();
    
    // 사용자 정보 업데이트
    await updateUser(params.id, data);
    
    return NextResponse.json({
      message: '사용자 정보가 성공적으로 수정되었습니다.',
      success: true
    }, { status: 200 });
  } catch (error) {
    console.error('사용자 정보 수정 오류:', error);
    return NextResponse.json({
      error: '사용자 정보를 수정하는 중 오류가 발생했습니다.',
      success: false
    }, { status: 500 });
  }
}

// 사용자 삭제 (DELETE /api/users/[id])
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 권한 체크 (관리자만 가능)
    const session = await getServerSession(authOptions);
    
    // 세션이 없는 경우
    if (!session) {
      return NextResponse.json({
        error: '로그인이 필요합니다.',
        success: false
      }, { status: 401 });
    }
    
    // 관리자 확인
    // @ts-ignore - session.user.role이 타입 정의에 없을 수 있음
    if (session.user.role !== 'admin') {
      return NextResponse.json({
        error: '관리자만 사용자를 삭제할 수 있습니다.',
        success: false
      }, { status: 403 });
    }
    
    // 사용자 존재 여부 확인
    const existingUser = await getUserById(params.id);
    if (!existingUser) {
      return NextResponse.json({
        error: '삭제할 사용자를 찾을 수 없습니다.',
        success: false
      }, { status: 404 });
    }
    
    // 사용자 삭제
    await deleteUser(params.id);
    
    return NextResponse.json({
      message: '사용자가 성공적으로 삭제되었습니다.',
      success: true
    }, { status: 200 });
  } catch (error) {
    console.error('사용자 삭제 오류:', error);
    return NextResponse.json({
      error: '사용자를 삭제하는 중 오류가 발생했습니다.',
      success: false
    }, { status: 500 });
  }
} 