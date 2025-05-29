import { NextRequest, NextResponse } from 'next/server';
import { getPromotionById, updatePromotion, deletePromotion } from '@/lib/promotions';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/api/auth/[...nextauth]/route';

// 단일 프로모션 조회 (GET /api/promotions/[id])
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const promotion = await getPromotionById(params.id);
    
    if (!promotion) {
      return NextResponse.json({
        error: '프로모션을 찾을 수 없습니다.',
        success: false
      }, { status: 404 });
    }
    
    // 활성화 상태 및 유효 기간 확인
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    const isActive = promotion.isActive && startDate <= now && endDate >= now;
    
    return NextResponse.json({
      promotion,
      isActive,
      message: '프로모션 조회 성공',
      success: true
    }, { status: 200 });
  } catch (error) {
    console.error('프로모션 조회 오류:', error);
    return NextResponse.json({
      error: '프로모션을 조회하는 중 오류가 발생했습니다.',
      success: false
    }, { status: 500 });
  }
}

// 프로모션 수정 (관리자만 가능) (PUT /api/promotions/[id])
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 세션 확인 및 관리자 권한 체크
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({
        error: '로그인이 필요합니다.',
        success: false
      }, { status: 401 });
    }
    
    // 관리자 권한 체크
    // @ts-ignore - session.user.role이 타입 정의에 없을 수 있음
    if (session.user.role !== 'admin') {
      return NextResponse.json({
        error: '관리자만 프로모션을 수정할 수 있습니다.',
        success: false
      }, { status: 403 });
    }
    
    // 기존 프로모션 확인
    const existingPromotion = await getPromotionById(params.id);
    if (!existingPromotion) {
      return NextResponse.json({
        error: '수정할 프로모션을 찾을 수 없습니다.',
        success: false
      }, { status: 404 });
    }
    
    const data = await request.json();
    
    // 업데이트 시간 추가
    data.updatedAt = new Date();
    
    // 프로모션 업데이트
    await updatePromotion(params.id, data);
    
    return NextResponse.json({
      message: '프로모션이 성공적으로 수정되었습니다.',
      success: true
    }, { status: 200 });
  } catch (error) {
    console.error('프로모션 수정 오류:', error);
    return NextResponse.json({
      error: '프로모션을 수정하는 중 오류가 발생했습니다.',
      success: false
    }, { status: 500 });
  }
}

// 프로모션 삭제 (관리자만 가능) (DELETE /api/promotions/[id])
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 세션 확인 및 관리자 권한 체크
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({
        error: '로그인이 필요합니다.',
        success: false
      }, { status: 401 });
    }
    
    // 관리자 권한 체크
    // @ts-ignore - session.user.role이 타입 정의에 없을 수 있음
    if (session.user.role !== 'admin') {
      return NextResponse.json({
        error: '관리자만 프로모션을 삭제할 수 있습니다.',
        success: false
      }, { status: 403 });
    }
    
    // 기존 프로모션 확인
    const existingPromotion = await getPromotionById(params.id);
    if (!existingPromotion) {
      return NextResponse.json({
        error: '삭제할 프로모션을 찾을 수 없습니다.',
        success: false
      }, { status: 404 });
    }
    
    // 프로모션 삭제
    await deletePromotion(params.id);
    
    return NextResponse.json({
      message: '프로모션이 성공적으로 삭제되었습니다.',
      success: true
    }, { status: 200 });
  } catch (error) {
    console.error('프로모션 삭제 오류:', error);
    return NextResponse.json({
      error: '프로모션을 삭제하는 중 오류가 발생했습니다.',
      success: false
    }, { status: 500 });
  }
} 