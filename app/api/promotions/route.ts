import { NextRequest, NextResponse } from 'next/server';
import { createPromotion, getAllPromotions } from '@/lib/promotions';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import { Promotion } from '@/types/promotion';

// 모든 활성화된 프로모션 목록 조회 (GET /api/promotions)
export async function GET(request: NextRequest) {
  try {
    const promotions = await getAllPromotions();
    
    // 활성화된 프로모션만 필터링 (현재 날짜 기준)
    const now = new Date();
    const activePromotions = promotions.filter(promotion => {
      const startDate = new Date(promotion.startDate);
      const endDate = new Date(promotion.endDate);
      return promotion.isActive && startDate <= now && endDate >= now;
    });
    
    return NextResponse.json({
      promotions: activePromotions,
      message: '프로모션 목록 조회 성공',
      success: true
    }, { status: 200 });
  } catch (error) {
    console.error('프로모션 목록 조회 오류:', error);
    return NextResponse.json({
      error: '프로모션 목록을 가져오는 중 오류가 발생했습니다.',
      success: false
    }, { status: 500 });
  }
}

// 새 프로모션 생성 (POST /api/promotions) - 관리자 전용
export async function POST(request: NextRequest) {
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
        error: '관리자만 프로모션을 생성할 수 있습니다.',
        success: false
      }, { status: 403 });
    }
    
    const data = await request.json();
    
    // 필수 필드 검증
    if (!data.title || !data.startDate || !data.endDate || !data.type || data.value === undefined) {
      return NextResponse.json({
        error: '프로모션 제목, 타입, 값, 시작일, 종료일은 필수 항목입니다.',
        success: false
      }, { status: 400 });
    }
    
    // 날짜 검증
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({
        error: '유효하지 않은 날짜 형식입니다.',
        success: false
      }, { status: 400 });
    }
    
    if (endDate < startDate) {
      return NextResponse.json({
        error: '종료일은 시작일보다 이후여야 합니다.',
        success: false
      }, { status: 400 });
    }
    
    // 현재 시간 설정
    const now = new Date();
    
    // Omit<Promotion, 'id'> 타입으로 캐스팅
    const newPromotion: Omit<Promotion, 'id'> = {
      title: data.title,
      description: data.description || '',
      type: data.type,
      value: data.value,
      code: data.code,
      startDate,
      endDate,
      minOrderAmount: data.minOrderAmount,
      maxDiscountAmount: data.maxDiscountAmount,
      isActive: data.isActive ?? true,
      applicableProductIds: data.applicableProductIds || [],
      applicableCategoryIds: data.applicableCategoryIds || [],
      usageLimit: data.usageLimit,
      usedCount: data.usedCount || 0,
      createdAt: now,
      updatedAt: now
    };
    
    // 프로모션 생성
    const promotionId = await createPromotion(newPromotion);
    
    return NextResponse.json({
      promotionId,
      message: '프로모션이 성공적으로 생성되었습니다.',
      success: true
    }, { status: 201 });
  } catch (error) {
    console.error('프로모션 생성 오류:', error);
    return NextResponse.json({
      error: '프로모션 생성 중 오류가 발생했습니다.',
      success: false
    }, { status: 500 });
  }
} 