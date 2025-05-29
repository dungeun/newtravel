import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder } from '@/lib/orders';
import { logger } from '@/lib/logger';
import { sendOrderStatusUpdateEmail } from '@/lib/admin/orderNotifications';
import { withErrorHandling } from '@/middleware/adminAuth';

interface CustomError extends Error {
  code?: string;
}

/**
 * 관리자 주문 취소 API
 * PUT /api/admin/orders/{id}/cancel
 * 요청 본문:
 * - reason: 취소 사유 (선택 사항)
 * - refundAmount: 환불 금액 (선택 사항, 기본값: 전체 금액)
 */
export const PUT = withErrorHandling(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const orderId = params.id;
    const data = await request.json();
    
    // 주문 존재 확인
    const order = await getOrderById(orderId);
    
    if (!order) {
      logger.warn('관리자 주문 취소: 주문 없음', {
        orderId
      }, 'ADMIN_ORDERS_CANCEL');
      
      const error = new Error('주문을 찾을 수 없습니다.') as CustomError;
      error.code = 'not-found';
      throw error;
    }
    
    // 이미 취소된 주문 확인
    if (order.status === 'cancelled') {
      logger.warn('관리자 주문 취소: 이미 취소됨', {
        orderId,
        orderNumber: order.orderNumber
      }, 'ADMIN_ORDERS_CANCEL');
      
      const error = new Error('이미 취소된 주문입니다.') as CustomError;
      error.code = 'invalid-argument';
      throw error;
    }
    
    // 이미 환불된 주문 확인
    if (order.status === 'refunded') {
      logger.warn('관리자 주문 취소: 이미 환불됨', {
        orderId,
        orderNumber: order.orderNumber
      }, 'ADMIN_ORDERS_CANCEL');
      
      const error = new Error('이미 환불된 주문은 취소할 수 없습니다.') as CustomError;
      error.code = 'invalid-argument';
      throw error;
    }
    
    // 취소 사유
    const reason = data.reason || '관리자에 의한 취소';
    
    // 환불 금액 (기본값: 전체 금액)
    const refundAmount = data.refundAmount !== undefined 
      ? parseFloat(data.refundAmount) 
      : order.totalAmount;
    
    logger.info('관리자 주문 취소 시작', {
      orderId,
      orderNumber: order.orderNumber,
      previousStatus: order.status,
      reason,
      refundAmount
    }, 'ADMIN_ORDERS_CANCEL');
    
    // 주문 상태 업데이트
    const updateData = {
      status: 'cancelled',
      updatedAt: new Date(),
      // @ts-ignore - cancelledAt 필드가 타입에 없을 수 있음
      cancelledAt: new Date(),
      history: {
        status: 'cancelled',
        timestamp: new Date(),
        note: reason,
        refundAmount
      }
    };
    
    await updateOrder(orderId, updateData);
    
    // 이메일 알림 전송 (비동기)
    try {
      await sendOrderStatusUpdateEmail(order.customer.email, {
        orderNumber: order.orderNumber,
        status: 'cancelled',
        reason
      });
      
      logger.info('주문 취소 이메일 발송 완료', {
        orderId,
        orderNumber: order.orderNumber,
        email: order.customer.email
      }, 'ADMIN_ORDERS_CANCEL');
    } catch (emailError) {
      logger.error('주문 취소 이메일 발송 실패', {
        orderId,
        orderNumber: order.orderNumber,
        error: emailError
      }, 'ADMIN_ORDERS_CANCEL');
      // 이메일 발송 실패는 API 응답에 영향을 주지 않음
    }
    
    logger.info('관리자 주문 취소 완료', {
      orderId,
      orderNumber: order.orderNumber
    }, 'ADMIN_ORDERS_CANCEL');
    
    return NextResponse.json({
      success: true,
      message: '주문이 성공적으로 취소되었습니다.',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        previousStatus: order.status,
        newStatus: 'cancelled',
        refundAmount
      }
    }, { status: 200 });
  }
);
