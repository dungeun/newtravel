import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import { 
  createTossPaymentsClient, 
  TossPaymentRequest 
} from '@/lib/payment/tossPaymentsClient';
import { 
  PaymentStatus, 
  generatePaymentId, 
  createPaymentInfo, 
  getCallbackUrls,
  getPaymentInfoById,
  updatePaymentStatus
} from '@/lib/payment/paymentUtils';
// 주문 서비스 모듈 임포트
// 실제 구현 시 아래 주석을 해제하고 정확한 경로를 지정해주세요
// import { getOrderById, updateOrderStatus, OrderStatus } from '@/lib/order/orderService';

// 임시 주문 서비스 구현
const OrderStatus = {
  PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
  PAYMENT_FAILED: 'PAYMENT_FAILED'
} as const;

const getOrderById = async (orderId: string) => {
  // 실제 구현에서는 데이터베이스에서 주문 정보를 조회해야 합니다
  // 테스트를 위한 임시 구현
  return {
    id: orderId,
    userId: 'test-user-id',
    totalAmount: 10000,
    items: [{ title: '테스트 상품' }],
    ordererInfo: {
      name: '테스트 사용자'
    }
  };
};

const updateOrderStatus = async (orderId: string, status: string) => {
  // 실제 구현에서는 데이터베이스에서 주문 상태를 업데이트해야 합니다
  console.log(`주문 ${orderId}의 상태를 ${status}로 업데이트합니다.`);
  return true;
};
import { verifyTossPayment } from '@/lib/payment/paymentVerification';
import { logger } from '@/lib/logger';
import { 
  PaymentErrorCode, 
  handlePaymentError, 
  createPaymentError 
} from '@/lib/payment/errorHandling';

/**
 * Toss Payments 결제 시작 API
 * 
 * @route POST /api/payments/toss
 */
export async function POST(req: NextRequest) {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }
    
    // 요청 데이터 파싱
    const data = await req.json();
    const { orderId, baseUrl } = data;
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: '주문 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 주문 정보 조회
    const order = await getOrderById(orderId);
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: '주문 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 주문 소유자 확인
    if (order.userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '권한이 없습니다.' },
        { status: 403 }
      );
    }
    
    // 결제 ID 생성
    const paymentId = generatePaymentId();
    
    // 콜백 URL 생성
    const { successUrl, failUrl } = getCallbackUrls(baseUrl || req.nextUrl.origin, paymentId);
    
    // 결제 정보 생성
    const paymentInfo = await createPaymentInfo({
      paymentId,
      orderId,
      userId: session.user.id,
      amount: order.totalAmount,
      currency: 'KRW',
      status: PaymentStatus.READY,
      provider: 'toss',
      successUrl,
      failUrl,
      metadata: {
        orderName: `${order.items[0]?.title || '여행 상품'} ${order.items.length > 1 ? `외 ${order.items.length - 1}건` : ''}`,
        customerName: order.ordererInfo.name,
      },
    });
    
    // Toss Payments 클라이언트 생성
    const tossClient = createTossPaymentsClient();
    
    // 결제 요청 데이터 생성
    const paymentRequest: TossPaymentRequest = {
      amount: order.totalAmount,
      orderId: paymentInfo.paymentId,
      orderName: paymentInfo.metadata?.orderName || '여행 상품',
      customerName: paymentInfo.metadata?.customerName || session.user.name || '고객',
      customerEmail: session.user.email,
      successUrl,
      failUrl,
    };
    
    // 결제 URL 생성 (실제로는 Toss Payments SDK를 사용하여 프론트엔드에서 처리)
    // 여기서는 결제 정보만 생성하고 프론트엔드에서 처리할 수 있도록 정보 반환
    
    return NextResponse.json({
      success: true,
      paymentId: paymentInfo.paymentId,
      amount: paymentInfo.amount,
      orderName: paymentRequest.orderName,
      customerName: paymentRequest.customerName,
      successUrl,
      failUrl,
    });
  } catch (error: any) {
    const requestData = await req.json().catch(() => ({}));
    const orderId = requestData?.orderId;
    
    logger.error('Toss Payments 결제 시작 오류:', {
      error: error.message,
      stack: error.stack,
      orderId
    }, 'PAYMENT');
    
    // 에러 처리
    const errorResponse = handlePaymentError(
      error,
      'toss',
      orderId
    );
    
    return NextResponse.json(
      errorResponse,
      { status: error.status || 500 }
    );
  }
}

/**
 * Toss Payments 결제 확인 API
 * 
 * @route GET /api/payments/toss
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const paymentKey = url.searchParams.get('paymentKey');
  const orderId = url.searchParams.get('orderId');
  const amount = url.searchParams.get('amount');
  
  if (!paymentKey || !orderId || !amount) {
    return NextResponse.json(
      { success: false, error: '필수 파라미터가 누락되었습니다.' },
      { status: 400 }
    );
  }
  
  try {
    // 결제 검증 수행
    const verificationResult = await verifyTossPayment(
      paymentKey,
      orderId,
      parseInt(amount, 10)
    );
    
    if (!verificationResult.isValid) {
      logger.error('결제 검증 실패:', {
        error: verificationResult.error,
        details: verificationResult.details,
        orderId,
        paymentKey
      }, 'PAYMENT');
      
      // 검증 오류 코드 추출
      const errorCode = verificationResult.details?.code || PaymentErrorCode.VERIFICATION_FAILED;
      
      // 검증 오류 처리
      const paymentError = createPaymentError(
        errorCode,
        'toss',
        orderId,
        verificationResult.paymentInfo?.paymentId,
        verificationResult.details
      );
      
      return NextResponse.json(
        { 
          success: false, 
          error: verificationResult.error || '결제 검증에 실패했습니다.',
          code: paymentError.code,
          details: process.env.NODE_ENV === 'development' ? verificationResult.details : undefined
        },
        { status: 400 }
      );
    }
    
    const paymentInfo = verificationResult.paymentInfo;
    
    if (!paymentInfo) {
      return NextResponse.json(
        { success: false, error: '결제 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // Toss Payments 클라이언트 생성
    const tossClient = createTossPaymentsClient();
    
    // 결제 승인 요청
    // 실제 구현에서는 아래 코드를 사용하세요
    // const paymentResponse = await tossClient.confirmPayment(
    //   paymentKey,
    //   orderId,
    //   parseInt(amount, 10)
    // );
    
    // 테스트를 위한 가상의 응답 데이터
    const paymentResponse = {
      paymentKey,
      orderId,
      amount: parseInt(amount, 10),
      status: 'DONE'
    };
    
    // 추가 검증: 승인 후 응답 데이터 검증
    if (paymentResponse.orderId !== orderId) {
      logger.error('결제 승인 후 주문 ID 불일치:', {
        expected: orderId,
        actual: paymentResponse.orderId
      }, 'PAYMENT');
      
      return NextResponse.json(
        { success: false, error: '결제 정보가 일치하지 않습니다.' },
        { status: 400 }
      );
    }
    
    if (paymentResponse.amount !== parseInt(amount, 10)) {
      logger.error('결제 승인 후 금액 불일치:', {
        expected: parseInt(amount, 10),
        actual: paymentResponse.amount
      }, 'PAYMENT');
    }
    
    logger.info('결제가 성공적으로 완료되었습니다.', {
      paymentKey,
      orderId,
      amount: parseInt(amount, 10),
      status: paymentResponse.status
    }, 'PAYMENT');
    
    // 결제 상태 업데이트
    if (paymentResponse.status === 'DONE') {
      // 결제 정보 조회
      const paymentInfo = await getPaymentInfoById(orderId);
      
      if (paymentInfo) {
        // 결제 상태 업데이트
        await updatePaymentStatus(
          paymentInfo.paymentId,
          PaymentStatus.COMPLETED,
          paymentKey,
          {
            // 실제 구현에서는 아래 코드를 사용하세요
            // receiptUrl: paymentResponse.receipt.url,
            // method: paymentResponse.method,
            // approvedAt: paymentResponse.approvedAt,
            // cardInfo: paymentResponse.card ? {
            //   company: paymentResponse.card.company,
            //   number: paymentResponse.card.number,
            //   installmentPlanMonths: paymentResponse.card.installmentPlanMonths
            // } : undefined
            
            // 테스트를 위한 가상의 데이터
            receiptUrl: 'https://example.com/receipt',
            method: 'CARD',
            approvedAt: new Date().toISOString(),
            cardInfo: {
              company: 'TestCard',
              number: '123456******1234',
              installmentPlanMonths: 0
            }
          }
        );
        
        // 주문 상태 업데이트
        await updateOrderStatus(paymentInfo.orderId, OrderStatus.PAYMENT_COMPLETED);
      } else {
        // 결제 실패 처리
        await updatePaymentStatus(
          orderId,
          PaymentStatus.FAILED,
          paymentKey,
          { failReason: 'PAYMENT_INFO_NOT_FOUND' }
        );
        
        return NextResponse.json(
          { success: false, error: '결제 정보를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
    } else {
      // 결제 실패 처리
      await updatePaymentStatus(
        orderId,
        PaymentStatus.FAILED,
        paymentKey,
        { failReason: paymentResponse.status }
      );
      
      // 주문 상태 업데이트
      await updateOrderStatus(paymentInfo.orderId, OrderStatus.PAYMENT_FAILED);
      
      return NextResponse.json(
        { success: false, error: '결제가 실패했습니다.' },
        { status: 400 }
      );
    }
    
    // 결제 정보 반환
    return NextResponse.json({
      success: true,
      payment: paymentResponse,
    });
  } catch (error: any) {
    logger.error('Toss Payments 결제 확인 오류:', {
      error: error.message,
      stack: error.stack,
      paymentKey,
      orderId,
      amount
    }, 'PAYMENT');
    
    try {
      // 결제 정보 조회
      const paymentInfo = await getPaymentInfoById(orderId);
      
      if (paymentInfo) {
        // 결제 상태 업데이트
        await updatePaymentStatus(
          paymentInfo.paymentId,
          PaymentStatus.FAILED,
          null,
          { failReason: error.message || 'PAYMENT_CONFIRM_ERROR' }
        );
        
        // 주문 상태 업데이트
        await updateOrderStatus(paymentInfo.orderId, OrderStatus.PAYMENT_FAILED);
      }
    } catch (updateError) {
      logger.error('결제 실패 상태 업데이트 오류:', {
        error: updateError,
        orderId
      }, 'PAYMENT');
    }
    
    // 에러 처리
    const errorResponse = handlePaymentError(
      error,
      'toss',
      orderId
    );
    
    return NextResponse.json(
      errorResponse,
      { status: error.status || 500 }
    );
  }
}
