import { NextRequest, NextResponse } from 'next/server';
import { getOrders, getOrderById, updateOrder } from '@/lib/orders';
import { OrderStatus } from '@/types/order';
import { logger } from '@/lib/logger';
import { withErrorHandling } from '@/middleware/adminAuth';

/**
 * 관리자 주문 목록 조회 API
 * GET /api/admin/orders
 * 쿼리 파라미터:
 * - page: 페이지 번호 (기본값: 1)
 * - limit: 페이지당 항목 수 (기본값: 10)
 * - status: 주문 상태 필터 (선택 사항, 콤마로 구분된 복수 상태 가능)
 * - startDate: 시작 날짜 필터 (선택 사항)
 * - endDate: 종료 날짜 필터 (선택 사항)
 * - search: 검색어 (주문번호, 고객명, 이메일 등)
 * - minAmount: 최소 주문 금액
 * - maxAmount: 최대 주문 금액
 * - paymentMethod: 결제 방법
 * - paymentStatus: 결제 상태
 * - productId: 특정 상품 ID
 * - sortBy: 정렬 기준 (createdAt, updatedAt, totalAmount)
 * - sortOrder: 정렬 방향 (asc, desc)
 */
/**
 * 관리자 주문 목록 조회 API
 * GET /api/admin/orders
 * 쿼리 파라미터:
 * - page: 페이지 번호 (기본값: 1)
 * - limit: 페이지당 항목 수 (기본값: 10)
 * - status: 주문 상태 필터 (선택 사항, 콤마로 구분된 복수 상태 가능)
 * - startDate: 시작 날짜 필터 (선택 사항)
 * - endDate: 종료 날짜 필터 (선택 사항)
 * - search: 검색어 (주문번호, 고객명, 이메일 등)
 * - minAmount: 최소 주문 금액
 * - maxAmount: 최대 주문 금액
 * - paymentMethod: 결제 방법
 * - paymentStatus: 결제 상태
 * - productId: 특정 상품 ID
 * - sortBy: 정렬 기준 (createdAt, updatedAt, totalAmount)
 * - sortOrder: 정렬 방향 (asc, desc)
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  // 쿼리 파라미터 파싱
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const statusParam = url.searchParams.get('status');
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');
  const search = url.searchParams.get('search');
  const minAmount = url.searchParams.get('minAmount');
  const maxAmount = url.searchParams.get('maxAmount');
  const paymentMethod = url.searchParams.get('paymentMethod');
  const paymentStatus = url.searchParams.get('paymentStatus');
  const productId = url.searchParams.get('productId');
  const sortBy = url.searchParams.get('sortBy');
  const sortOrder = url.searchParams.get('sortOrder');
  
  // 필터 객체 구성
  const filters: Record<string, any> = {};
  
  // 상태 필터 (단일 상태 또는 콤마로 구분된 복수 상태)
  if (statusParam) {
    if (statusParam.includes(',')) {
      // 콤마로 구분된 복수 상태
      filters.status = statusParam.split(',') as OrderStatus[];
    } else {
      // 단일 상태
      filters.status = statusParam as OrderStatus;
    }
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
  
  // 금액 범위 필터
  if (minAmount) {
    filters.minAmount = parseFloat(minAmount);
  }
  
  if (maxAmount) {
    filters.maxAmount = parseFloat(maxAmount);
  }
  
  // 결제 관련 필터
  if (paymentMethod) {
    filters.paymentMethod = paymentMethod;
  }
  
  if (paymentStatus) {
    filters.paymentStatus = paymentStatus;
  }
  
  // 상품 ID 필터
  if (productId) {
    filters.productId = productId;
  }
  
  // 정렬 기준
  if (sortBy && ['createdAt', 'updatedAt', 'totalAmount'].includes(sortBy)) {
    filters.sortBy = sortBy;
  }
  
  // 정렬 방향
  if (sortOrder && ['asc', 'desc'].includes(sortOrder)) {
    filters.sortOrder = sortOrder;
  }
  
  logger.info('관리자 주문 목록 조회 시작', {
    page,
    limit,
    filters
  }, 'ADMIN_ORDERS');
  
  // 주문 목록 조회 (페이지네이션 및 필터 적용)
  const { orders, total, totalPages } = await getOrders({
    page,
    limit,
    filters
  });
  
  logger.info('관리자 주문 목록 조회 완료', {
    count: orders.length,
    total,
    page,
    totalPages
  }, 'ADMIN_ORDERS');
  
  return NextResponse.json({
    success: true,
    orders,
    pagination: {
      total,
      page,
      limit,
      totalPages
    }
  }, { status: 200 });
});

/**
 * 관리자 주문 상태 일괄 업데이트 API
 * PATCH /api/admin/orders
 * 요청 본문:
 * - orderIds: 업데이트할 주문 ID 배열
 * - status: 변경할 상태
 * - note: 상태 변경 사유 (선택 사항)
 */
export const PATCH = withErrorHandling(async (request: NextRequest) => {
  const data = await request.json();
  
  // 필수 필드 검증
  if (!data.orderIds || !Array.isArray(data.orderIds) || data.orderIds.length === 0) {
    const error = new Error('업데이트할 주문 ID 목록이 필요합니다.');
    error.code = 'invalid-argument';
    throw error;
  }
  
  if (!data.status) {
    const error = new Error('변경할 상태는 필수 항목입니다.');
    error.code = 'invalid-argument';
    throw error;
  }
  
  // 상태 변경 검증 (타입 안전)
  const newStatus = data.status as OrderStatus;
  const note = data.note || '';
  const orderIds = data.orderIds;
  
  logger.info('관리자 주문 상태 일괄 업데이트 시작', {
    orderCount: orderIds.length,
    newStatus,
    hasNote: !!note
  }, 'ADMIN_ORDERS');
  
  // 각 주문에 대해 상태 업데이트 수행
  const results = [];
  const errors = [];
  
  for (const orderId of orderIds) {
    try {
      // 주문 존재 확인
      const order = await getOrderById(orderId);
      
      if (!order) {
        errors.push({
          orderId,
          error: '주문을 찾을 수 없습니다.'
        });
        continue;
      }
      
      // 주문 상태 업데이트
      await updateOrder(orderId, {
        status: newStatus,
        updatedAt: new Date(),
        history: {
          status: newStatus,
          timestamp: new Date(),
          note
        }
      });
      
      results.push({
        orderId,
        success: true,
        previousStatus: order.status,
        newStatus
      });
      
    } catch (error: any) {
      logger.error('주문 상태 업데이트 실패', {
        orderId,
        error: error.message
      }, 'ADMIN_ORDERS');
      
      errors.push({
        orderId,
        error: error.message || '업데이트 중 오류가 발생했습니다.'
      });
    }
  }
  
  logger.info('관리자 주문 상태 일괄 업데이트 완료', {
    successCount: results.length,
    errorCount: errors.length
  }, 'ADMIN_ORDERS');
  
  return NextResponse.json({
    success: true,
    results,
    errors,
    message: `${results.length}개 주문의 상태가 업데이트되었습니다. ${errors.length}개 실패.`
  }, { status: 200 });
});
