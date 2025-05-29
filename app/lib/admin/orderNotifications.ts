import { Order, OrderStatus } from '@/types/order';
import { logger } from '@/lib/logger';
import { sendEmail } from '@/lib/email';

/**
 * 주문 상태 변경 시 고객에게 이메일 알림 전송
 */
export async function sendOrderStatusUpdateEmail(
  order: Order,
  previousStatus: OrderStatus,
  newStatus: OrderStatus
): Promise<boolean> {
  try {
    if (!order.customer?.email) {
      logger.warn('주문 상태 변경 이메일 전송 실패: 이메일 주소 없음', {
        orderId: order.id,
        orderNumber: order.orderNumber
      }, 'ORDER_NOTIFICATIONS');
      return false;
    }
    
    // 상태별 이메일 제목 및 내용 설정
    const statusEmailContent = getStatusEmailContent(newStatus, order);
    
    // 이메일 전송
    await sendEmail({
      to: order.customer.email,
      subject: statusEmailContent.subject,
      html: statusEmailContent.body,
      from: 'no-reply@example.com',
      replyTo: 'support@example.com'
    });
    
    logger.info('주문 상태 변경 이메일 전송 완료', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      email: order.customer.email.substring(0, 3) + '***@' + order.customer.email.split('@')[1],
      previousStatus,
      newStatus
    }, 'ORDER_NOTIFICATIONS');
    
    return true;
  } catch (error: any) {
    logger.error('주문 상태 변경 이메일 전송 오류', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      error: error.message,
      stack: error.stack
    }, 'ORDER_NOTIFICATIONS');
    
    return false;
  }
}

/**
 * 주문 상태별 이메일 내용 생성
 */
function getStatusEmailContent(status: OrderStatus, order: Order): { subject: string; body: string } {
  const customerName = order.customer?.name || '고객';
  const orderNumber = order.orderNumber;
  const orderDate = new Date(order.createdAt).toLocaleDateString('ko-KR');
  const orderItems = order.items.map(item => item.productTitle).join(', ');
  
  switch (status) {
    case 'confirmed':
      return {
        subject: `[여행사] 주문이 확인되었습니다 (주문번호: ${orderNumber})`,
        body: `
          <h2>${customerName}님, 주문이 확인되었습니다.</h2>
          <p>주문번호: <strong>${orderNumber}</strong></p>
          <p>주문일자: ${orderDate}</p>
          <p>주문 상품: ${orderItems}</p>
          <p>주문이 확인되었으며, 결제가 완료되면 처리가 진행됩니다.</p>
          <p>문의사항이 있으시면 고객센터로 연락 주시기 바랍니다.</p>
        `
      };
      
    case 'paid':
      return {
        subject: `[여행사] 결제가 완료되었습니다 (주문번호: ${orderNumber})`,
        body: `
          <h2>${customerName}님, 결제가 완료되었습니다.</h2>
          <p>주문번호: <strong>${orderNumber}</strong></p>
          <p>주문일자: ${orderDate}</p>
          <p>주문 상품: ${orderItems}</p>
          <p>결제가 완료되었으며, 주문 처리가 진행 중입니다.</p>
          <p>문의사항이 있으시면 고객센터로 연락 주시기 바랍니다.</p>
        `
      };
      
    case 'processing':
      return {
        subject: `[여행사] 주문이 처리 중입니다 (주문번호: ${orderNumber})`,
        body: `
          <h2>${customerName}님, 주문이 처리 중입니다.</h2>
          <p>주문번호: <strong>${orderNumber}</strong></p>
          <p>주문일자: ${orderDate}</p>
          <p>주문 상품: ${orderItems}</p>
          <p>주문이 처리 중이며, 곧 준비가 완료될 예정입니다.</p>
          <p>문의사항이 있으시면 고객센터로 연락 주시기 바랍니다.</p>
        `
      };
      
    case 'ready':
      return {
        subject: `[여행사] 주문 준비가 완료되었습니다 (주문번호: ${orderNumber})`,
        body: `
          <h2>${customerName}님, 주문 준비가 완료되었습니다.</h2>
          <p>주문번호: <strong>${orderNumber}</strong></p>
          <p>주문일자: ${orderDate}</p>
          <p>주문 상품: ${orderItems}</p>
          <p>주문 준비가 완료되었습니다. 여행 일정에 맞춰 서비스가 제공될 예정입니다.</p>
          <p>문의사항이 있으시면 고객센터로 연락 주시기 바랍니다.</p>
        `
      };
      
    case 'completed':
      return {
        subject: `[여행사] 주문이 완료되었습니다 (주문번호: ${orderNumber})`,
        body: `
          <h2>${customerName}님, 주문이 완료되었습니다.</h2>
          <p>주문번호: <strong>${orderNumber}</strong></p>
          <p>주문일자: ${orderDate}</p>
          <p>주문 상품: ${orderItems}</p>
          <p>주문이 완료되었습니다. 저희 서비스를 이용해 주셔서 감사합니다.</p>
          <p>여행은 어떠셨나요? 리뷰를 작성해 주시면 다른 고객들에게 도움이 됩니다.</p>
          <p>문의사항이 있으시면 고객센터로 연락 주시기 바랍니다.</p>
        `
      };
      
    case 'cancelled':
      return {
        subject: `[여행사] 주문이 취소되었습니다 (주문번호: ${orderNumber})`,
        body: `
          <h2>${customerName}님, 주문이 취소되었습니다.</h2>
          <p>주문번호: <strong>${orderNumber}</strong></p>
          <p>주문일자: ${orderDate}</p>
          <p>주문 상품: ${orderItems}</p>
          <p>요청하신 대로 주문이 취소되었습니다.</p>
          <p>결제하신 금액은 환불 정책에 따라 처리될 예정입니다.</p>
          <p>문의사항이 있으시면 고객센터로 연락 주시기 바랍니다.</p>
        `
      };
      
    case 'refunded':
      return {
        subject: `[여행사] 환불이 완료되었습니다 (주문번호: ${orderNumber})`,
        body: `
          <h2>${customerName}님, 환불이 완료되었습니다.</h2>
          <p>주문번호: <strong>${orderNumber}</strong></p>
          <p>주문일자: ${orderDate}</p>
          <p>주문 상품: ${orderItems}</p>
          <p>환불이 완료되었습니다. 결제 수단에 따라 환불 금액이 반영되기까지 시간이 소요될 수 있습니다.</p>
          <p>문의사항이 있으시면 고객센터로 연락 주시기 바랍니다.</p>
        `
      };
      
    default:
      return {
        subject: `[여행사] 주문 상태가 업데이트되었습니다 (주문번호: ${orderNumber})`,
        body: `
          <h2>${customerName}님, 주문 상태가 업데이트되었습니다.</h2>
          <p>주문번호: <strong>${orderNumber}</strong></p>
          <p>주문일자: ${orderDate}</p>
          <p>주문 상품: ${orderItems}</p>
          <p>주문 상태가 업데이트되었습니다.</p>
          <p>문의사항이 있으시면 고객센터로 연락 주시기 바랍니다.</p>
        `
      };
  }
}
