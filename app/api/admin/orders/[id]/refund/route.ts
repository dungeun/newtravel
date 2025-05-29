import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder } from '@/lib/orders';
import { logger } from '@/lib/logger';
import { sendOrderStatusUpdateEmail } from '@/lib/admin/orderNotifications';
import { withErrorHandling } from '@/middleware/adminAuth';

interface CustomError extends Error {
  code?: string;
}

/**
 * 관리자 주문 환불 API
 * PUT /api/admin/orders/{id}/refund
 * 요청 본문:
 * - reason: 환불 사유 (선택 사항)
 * - amount: 환불 금액 (선택 사항, 기본값: 전체 금액)
 * - isPartial: 부분 환불 여부 (선택 사항, 기본값: false)
 */
export const PUT = withErrorHandling(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const orderId = params.id;
    const data = await request.json();
    
    // 주문 존재 확인
    const order = await getOrderById(orderId);
    
    if (!order) {
      logger.warn('관리자 주문 환불: 주문 없음', {
        orderId
      }, 'ADMIN_ORDERS_REFUND');
      
      const error = new Error('주문을 찾을 수 없습니다.') as CustomError;
      error.code = 'not-found';
      throw error;
    }
    
    // 이미 환불된 주문 확인
    if (order.status === 'refunded') {
      logger.warn('관리자 주문 환불: 이미 환불됨', {
        orderId,
        orderNumber: order.orderNumber
      }, 'ADMIN_ORDERS_REFUND');
      
      const error = new Error('이미 환불된 주문입니다.') as CustomError;
      error.code = 'invalid-argument';
      throw error;
    }
    
    // 결제 완료 상태가 아닌 주문 확인
    if (order.status !== 'paid' && order.status !== 'completed' && order.status !== 'cancelled') {
      logger.warn('관리자 주문 환불: 유효하지 않은 상태', {
        orderId,
        orderNumber: order.orderNumber,
        status: order.status
      }, 'ADMIN_ORDERS_REFUND');
      
      const error = new Error('결제 완료, 배송 완료 또는 취소된 주문만 환불할 수 있습니다.') as CustomError;
      error.code = 'invalid-argument';
      throw error;
    }
    
    // 환불 사유
    const reason = data.reason || '관리자에 의한 환불';
    
    // 부분 환불 여부
    const isPartial = data.isPartial === true;
    
    // 환불 금액 (기본값: 전체 금액)
    const refundAmount = data.amount !== undefined 
      ? parseFloat(data.amount) 
      : order.totalAmount;
    
    // 부분 환불 금액 검증
    if (isPartial && (refundAmount <= 0 || refundAmount > order.totalAmount)) {
      logger.warn('관리자 주문 환불: 유효하지 않은 환불 금액', {
        orderId,
        orderNumber: order.orderNumber,
        refundAmount,
        totalAmount: order.totalAmount
      }, 'ADMIN_ORDERS_REFUND');
      
      const error = new Error('유효하지 않은 환불 금액입니다. 0보다 크고 주문 총액 이하여야 합니다.') as CustomError;
      error.code = 'invalid-argument';
      throw error;
    }
    
    logger.info('관리자 주문 환불 시작', {
      orderId,
      orderNumber: order.orderNumber,
      previousStatus: order.status,
      reason,
      isPartial,
      refundAmount
    }, 'ADMIN_ORDERS_REFUND');
    
    // 주문 상태 업데이트
    const updateData = {
      status: 'refunded',
      updatedAt: new Date(),
      // @ts-ignore - refundedAt 필드가 타입에 없을 수 있음
      refundedAt: new Date(),
      history: {
        status: 'refunded',
        timestamp: new Date(),
        note: reason,
        refundAmount,
        isPartial
      }
    };
    
    await updateOrder(orderId, updateData);
    
    // 이메일 알림 전송 (비동기)
    try {
      await sendOrderStatusUpdateEmail(order.customer.email, {
        orderNumber: order.orderNumber,
        status: 'refunded',
        reason,
        refundAmount,
        isPartial
      });
      
      logger.info('주문 환불 이메일 발송 완료', {
        orderId,
        orderNumber: order.orderNumber,
        email: order.customer.email
      }, 'ADMIN_ORDERS_REFUND');
    } catch (emailError) {
      logger.error('주문 환불 이메일 발송 실패', {
        orderId,
        orderNumber: order.orderNumber,
        error: emailError
      }, 'ADMIN_ORDERS_REFUND');
      // 이메일 발송 실패는 API 응답에 영향을 주지 않음
    }
    
    logger.info('관리자 주문 환불 완료', {
      orderId,
      orderNumber: order.orderNumber
    }, 'ADMIN_ORDERS_REFUND');
    
    return NextResponse.json({
      success: true,
      message: '주문이 성공적으로 환불되었습니다.',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        previousStatus: order.status,
        newStatus: 'refunded',
        refundAmount,
        isPartial
      }
    }, { status: 200 });
  }
);
