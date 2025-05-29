import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder } from '@/lib/orders';
import { OrderStatus } from '@/types/order';
import { logger } from '@/lib/logger';
import { withErrorHandling } from '@/middleware/adminAuth';

interface CustomError extends Error {
  code?: string;
}

/**
 * 관리자 특정 주문 조회 API
 * GET /api/admin/orders/{id}
 */
export const GET = withErrorHandling(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const orderId = params.id;
    
    logger.info('관리자 주문 상세 조회 시작', {
      orderId
    }, 'ADMIN_ORDERS');
    
    // 주문 정보 조회
    const order = await getOrderById(orderId);
    
    if (!order) {
      logger.warn('관리자 주문 상세 조회: 주문 없음', {
        orderId
      }, 'ADMIN_ORDERS');
      
      const error = new Error('주문을 찾을 수 없습니다.') as CustomError;
      error.code = 'not-found';
      throw error;
    }
    
    logger.info('관리자 주문 상세 조회 완료', {
      orderId,
      orderNumber: order.orderNumber
    }, 'ADMIN_ORDERS');
    
    return NextResponse.json({
      success: true,
      order
    }, { status: 200 });
  }
)

/**
 * 관리자 특정 주문 상태 업데이트 API
 * PATCH /api/admin/orders/{id}
 * 요청 본문:
 * - status: 변경할 상태
 * - note: 상태 변경 사유 (선택 사항)
 */
export const PATCH = withErrorHandling(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const orderId = params.id;
    const data = await request.json();
    
    // 필수 필드 검증
    if (!data.status) {
      const error = new Error('변경할 상태는 필수 항목입니다.') as CustomError;
      error.code = 'invalid-argument';
      throw error;
    }
    
    // 주문 존재 확인
    const order = await getOrderById(orderId);
    
    if (!order) {
      logger.warn('관리자 주문 상태 업데이트: 주문 없음', {
        orderId
      }, 'ADMIN_ORDERS');
      
      const error = new Error('주문을 찾을 수 없습니다.') as CustomError;
      error.code = 'not-found';
      throw error;
    }
    
    // 상태 변경 검증 (타입 안전)
    const newStatus = data.status as OrderStatus;
    const note = data.note || '';
    
    logger.info('관리자 주문 상태 업데이트 시작', {
      orderId,
      previousStatus: order.status,
      newStatus,
      hasNote: !!note
    }, 'ADMIN_ORDERS');
    
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
    
    logger.info('관리자 주문 상태 업데이트 완료', {
      orderId,
      newStatus
    }, 'ADMIN_ORDERS');
    
    return NextResponse.json({
      success: true,
      message: '주문 상태가 업데이트되었습니다.',
      order: {
        id: order.id,
        previousStatus: order.status,
        newStatus
      }
    }, { status: 200 });
  }
)

/**
 * 관리자 특정 주문 정보 업데이트 API
 * PUT /api/admin/orders/{id}
 * 요청 본문: 업데이트할 주문 정보 필드
 */
export const PUT = withErrorHandling(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const orderId = params.id;
    const data = await request.json();
    
    // 주문 존재 확인
    const order = await getOrderById(orderId);
    
    if (!order) {
      logger.warn('관리자 주문 정보 업데이트: 주문 없음', {
        orderId
      }, 'ADMIN_ORDERS');
      
      const error = new Error('주문을 찾을 수 없습니다.') as CustomError;
      error.code = 'not-found';
      throw error;
    }
    
    // 업데이트 불가능한 필드 제거
    const { id, orderNumber, createdAt, ...updateData } = data;
    
    logger.info('관리자 주문 정보 업데이트 시작', {
      orderId,
      orderNumber: order.orderNumber,
      updateFields: Object.keys(updateData)
    }, 'ADMIN_ORDERS');
    
    // 주문 정보 업데이트
    await updateOrder(orderId, {
      ...updateData,
      updatedAt: new Date()
    });
    
    logger.info('관리자 주문 정보 업데이트 완료', {
      orderId,
      orderNumber: order.orderNumber
    }, 'ADMIN_ORDERS');
    
    return NextResponse.json({
      success: true,
      message: '주문 정보가 업데이트되었습니다.',
      orderId
    }, { status: 200 });
  }
)
