import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import { getOrderById, updateOrder } from '@/lib/orders';
import { OrderStatus } from '@/types/order';
import { logger } from '@/lib/logger';
import { sendOrderStatusUpdateEmail } from '@/lib/admin/orderNotifications';

/**
 * 관리자 주문 상태 업데이트 API
 * PUT /api/admin/orders/{id}/status
 * 요청 본문:
 * - status: 변경할 상태 (필수)
 * - note: 상태 변경 사유 (선택 사항)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 세션 확인 및 관리자 권한 검증
    const session = await getServerSession(authOptions);
    
    if (!session) {
      logger.warn('관리자 주문 상태 업데이트: 인증되지 않은 접근', {
        orderId: params.id
      }, 'ADMIN_ORDERS');
      return NextResponse.json({
        success: false,
        error: '로그인이 필요합니다.'
      }, { status: 401 });
    }
    
    // @ts-ignore - session.user.role이 타입 정의에 없을 수 있음
    const isAdmin = session.user.role === 'admin';
    
    if (!isAdmin) {
      logger.warn('관리자 주문 상태 업데이트: 권한 없음', {
        userId: session.user.id,
        orderId: params.id
      }, 'ADMIN_ORDERS');
      return NextResponse.json({
        success: false,
        error: '관리자 권한이 필요합니다.'
      }, { status: 403 });
    }
    
    const orderId = params.id;
    const data = await request.json();
    
    // 필수 필드 검증
    if (!data.status) {
      return NextResponse.json({
        success: false,
        error: '변경할 상태는 필수 항목입니다.'
      }, { status: 400 });
    }
    
    // 주문 존재 확인
    const order = await getOrderById(orderId);
    
    if (!order) {
      logger.warn('관리자 주문 상태 업데이트: 주문 없음', {
        orderId
      }, 'ADMIN_ORDERS');
      return NextResponse.json({
        success: false,
        error: '주문을 찾을 수 없습니다.'
      }, { status: 404 });
    }
    
    // 상태 변경 검증 (타입 안전)
    const newStatus = data.status as OrderStatus;
    const note = data.note || '';
    const previousStatus = order.status;
    
    // 상태가 동일한 경우 처리
    if (previousStatus === newStatus) {
      return NextResponse.json({
        success: true,
        message: '주문 상태가 이미 동일합니다.',
        orderId,
        status: newStatus
      }, { status: 200 });
    }
    
    logger.info('관리자 주문 상태 업데이트 시작', {
      orderId,
      orderNumber: order.orderNumber,
      previousStatus,
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
      orderNumber: order.orderNumber,
      previousStatus,
      newStatus
    }, 'ADMIN_ORDERS');
    
    // 이메일 알림 전송 (비동기적으로 처리하여 응답 지연 방지)
    try {
      // 상태가 변경된 경우에만 이메일 전송
      if (previousStatus !== newStatus) {
        sendOrderStatusUpdateEmail(order, previousStatus, newStatus)
          .then(success => {
            if (success) {
              logger.info('주문 상태 변경 이메일 전송 성공', {
                orderId,
                orderNumber: order.orderNumber,
                newStatus
              }, 'ADMIN_ORDERS');
            }
          })
          .catch(error => {
            logger.error('주문 상태 변경 이메일 전송 오류', {
              orderId,
              orderNumber: order.orderNumber,
              error: error.message
            }, 'ADMIN_ORDERS');
          });
      }
    } catch (emailError: any) {
      // 이메일 전송 오류가 주문 상태 업데이트 성공에 영향을 주지 않도록 오류 처리
      logger.error('주문 상태 변경 이메일 전송 중 예외 발생', {
        orderId,
        orderNumber: order.orderNumber,
        error: emailError.message
      }, 'ADMIN_ORDERS');
    }
    
    return NextResponse.json({
      success: true,
      message: '주문 상태가 업데이트되었습니다.',
      orderId,
      previousStatus,
      newStatus
    }, { status: 200 });
    
  } catch (error: any) {
    logger.error('관리자 주문 상태 업데이트 오류', {
      orderId: params.id,
      error: error.message,
      stack: error.stack
    }, 'ADMIN_ORDERS');
    
    return NextResponse.json({
      success: false,
      error: '주문 상태 업데이트 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
