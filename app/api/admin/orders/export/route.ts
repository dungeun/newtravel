import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import { getOrders } from '@/lib/orders';
import { Order, OrderStatus } from '@/types/order';
import { logger } from '@/lib/logger';

// 라우트 세그먼트 설정 - 동적 렌더링 강제
export const dynamic = 'force-dynamic';

/**
 * 주문 데이터를 CSV 형식으로 변환하는 함수
 */
function convertOrdersToCSV(orders: Order[]): string {
  // CSV 헤더 정의
  const headers = [
    '주문번호',
    '주문일시',
    '상태',
    '고객명',
    '이메일',
    '전화번호',
    '상품명',
    '총 금액',
    '결제 방법',
    '결제 상태',
    '특별 요청사항',
    '메모'
  ].join(',');

  // 각 주문을 CSV 행으로 변환
  const rows = orders.map(order => {
    // 날짜 포맷팅
    const createdAt = new Date(order.createdAt).toLocaleString('ko-KR');
    
    // 주문 상품명 (여러 상품이 있을 경우 첫 번째 상품만 표시)
    const productTitle = order.items.length > 0 
      ? `"${order.items[0].productTitle}${order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : ''}"`
      : '';
    
    // 특별 요청사항과 메모는 쌍따옴표로 감싸서 쉼표 처리
    const specialRequests = order.specialRequests ? `"${order.specialRequests.replace(/"/g, '""')}"` : '';
    const notes = order.notes ? `"${order.notes.replace(/"/g, '""')}"` : '';
    
    return [
      order.orderNumber,
      createdAt,
      order.status,
      `"${order.customer.name}"`,
      order.customer.email,
      order.customer.phone,
      productTitle,
      order.totalAmount,
      order.payment?.method || '',
      order.payment?.status || '',
      specialRequests,
      notes
    ].join(',');
  });

  // 헤더와 행을 결합하여 최종 CSV 생성
  return [headers, ...rows].join('\n');
}

/**
 * 관리자 주문 데이터 내보내기 API
 * GET /api/admin/orders/export
 * 쿼리 파라미터:
 * - format: 내보내기 형식 (기본값: csv)
 * - status: 주문 상태 필터 (선택 사항)
 * - startDate: 시작 날짜 필터 (선택 사항)
 * - endDate: 종료 날짜 필터 (선택 사항)
 * - search: 검색어 (선택 사항)
 */
export async function GET(request: NextRequest) {
  try {
    // 세션 확인 및 관리자 권한 검증
    const session = await getServerSession(authOptions);
    
    if (!session) {
      logger.warn('관리자 주문 내보내기: 인증되지 않은 접근', {}, 'ADMIN_ORDERS_EXPORT');
      return NextResponse.json({
        success: false,
        error: '로그인이 필요합니다.'
      }, { status: 401 });
    }
    
    // @ts-ignore - session.user.role이 타입 정의에 없을 수 있음
    const isAdmin = session.user.role === 'admin';
    
    if (!isAdmin) {
      logger.warn('관리자 주문 내보내기: 권한 없음', {
        userId: session.user.id
      }, 'ADMIN_ORDERS_EXPORT');
      return NextResponse.json({
        success: false,
        error: '관리자 권한이 필요합니다.'
      }, { status: 403 });
    }
    
    // 쿼리 파라미터 파싱
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'csv';
    const status = url.searchParams.get('status') as OrderStatus | null;
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const search = url.searchParams.get('search');
    
    // 내보내기 형식 검증
    if (format !== 'csv') {
      return NextResponse.json({
        success: false,
        error: '지원하지 않는 내보내기 형식입니다. 현재는 csv만 지원합니다.'
      }, { status: 400 });
    }
    
    // 필터 객체 구성
    const filters: Record<string, any> = {};
    
    if (status) {
      filters.status = status;
    }
    
    if (startDate) {
      filters.startDate = new Date(startDate);
    }
    
    if (endDate) {
      filters.endDate = new Date(endDate);
    }
    
    if (search) {
      filters.search = search;
    }
    
    logger.info('관리자 주문 내보내기 시작', {
      format,
      filters
    }, 'ADMIN_ORDERS_EXPORT');
    
    // 주문 데이터 조회 (페이지네이션 없이 전체 데이터)
    const { orders } = await getOrders({
      limit: 1000, // 최대 1000개 주문 내보내기 (필요에 따라 조정)
      filters
    });
    
    // CSV 형식으로 변환
    const csv = convertOrdersToCSV(orders);
    
    // 현재 날짜를 파일명에 포함
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    const filename = `orders_export_${dateStr}.csv`;
    
    logger.info('관리자 주문 내보내기 완료', {
      format,
      count: orders.length,
      filename
    }, 'ADMIN_ORDERS_EXPORT');
    
    // CSV 파일 응답 반환
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
    
  } catch (error: any) {
    logger.error('관리자 주문 내보내기 오류', {
      error: error.message,
      stack: error.stack
    }, 'ADMIN_ORDERS_EXPORT');
    
    return NextResponse.json({
      success: false,
      error: '주문 데이터 내보내기 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
