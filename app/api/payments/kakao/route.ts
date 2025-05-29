import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import { 
  createKakaoPayClient, 
  KakaoPayReadyRequest 
} from '@/lib/payment/kakaoPayClient';
import { 
  PaymentStatus, 
  generatePaymentId, 
  createPaymentInfo, 
  getCallbackUrls,
  getPaymentInfoById,
  updatePaymentStatus
} from '@/lib/payment/paymentUtils';
import { verifyPayment } from '@/lib/payment/paymentVerification';
import { logger } from '@/lib/logger';
import { 
  PaymentErrorCode, 
  handlePaymentError, 
  createPaymentError 
} from '@/lib/payment/errorHandling';

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

/**
 * KakaoPay 결제 시작 API
 * 
 * @route POST /api/payments/kakao
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
      provider: 'kakao',
      successUrl,
      failUrl,
      metadata: {
        orderName: `${order.items[0]?.title || '여행 상품'} ${order.items.length > 1 ? `외 ${order.items.length - 1}건` : ''}`,
        customerName: order.ordererInfo.name,
      },
    });
    
    // KakaoPay 클라이언트 생성
    const kakaoClient = createKakaoPayClient();
    
    // 결제 요청 데이터 생성
    const paymentRequest: Omit<KakaoPayReadyRequest, 'cid'> = {
      partner_order_id: paymentInfo.paymentId,
      partner_user_id: session.user.id,
      item_name: paymentInfo.metadata?.orderName || '여행 상품',
      quantity: order.items.length,
      total_amount: order.totalAmount,
      tax_free_amount: 0,
      approval_url: successUrl,
      cancel_url: failUrl,
      fail_url: failUrl,
    };
    
    // KakaoPay 결제 준비 요청
    const kakaoResponse = await kakaoClient.ready(paymentRequest);
    
    // 결제 정보 반환
    return NextResponse.json({
      success: true,
      paymentId: paymentInfo.paymentId,
      tid: kakaoResponse.tid,
      next_redirect_pc_url: kakaoResponse.next_redirect_pc_url,
      next_redirect_mobile_url: kakaoResponse.next_redirect_mobile_url,
      next_redirect_app_url: kakaoResponse.next_redirect_app_url,
      android_app_scheme: kakaoResponse.android_app_scheme,
      ios_app_scheme: kakaoResponse.ios_app_scheme,
      created_at: kakaoResponse.created_at,
    });
  } catch (error: any) {
    const requestData = await req.json().catch(() => ({}));
    const orderId = requestData?.orderId;
    
    logger.error('KakaoPay 결제 시작 오류:', {
      error: error.message,
      stack: error.stack,
      orderId
    }, 'PAYMENT');
    
    // 에러 처리
    const errorResponse = handlePaymentError(
      error,
      'kakao',
      orderId
    );
    
    return NextResponse.json(
      errorResponse,
      { status: error.status || 500 }
    );
  }
}

/**
 * KakaoPay 결제 승인 API
 * 
 * @route GET /api/payments/kakao
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const pg_token = url.searchParams.get('pg_token');
  const paymentId = url.searchParams.get('paymentId');
  const tid = url.searchParams.get('tid');
  
  if (!pg_token || !paymentId || !tid) {
    return NextResponse.json(
      { success: false, error: '필수 파라미터가 누락되었습니다.' },
      { status: 400 }
    );
  }
  
  try {
    // 결제 검증 수행
    const verificationResult = await verifyPayment('kakao', {
      tid,
      orderId: paymentId,
      pg_token
    });
    
    if (!verificationResult.isValid) {
      logger.error('결제 검증 실패:', {
        error: verificationResult.error,
        details: verificationResult.details,
        paymentId,
        tid
      }, 'PAYMENT');
      
      // 검증 오류 코드 추출
      const errorCode = verificationResult.details?.code || PaymentErrorCode.VERIFICATION_FAILED;
      
      // 검증 오류 처리
      const paymentError = createPaymentError(
        errorCode,
        'kakao',
        paymentId,
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
    
    // 세션 확인
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }
    
    // KakaoPay 클라이언트 생성
    const kakaoClient = createKakaoPayClient();
    
    // 결제 승인 요청
    const approveResponse = await kakaoClient.approve({
      tid,
      partner_order_id: paymentId,
      partner_user_id: paymentInfo.userId,
      pg_token,
    });
    
    // 추가 검증: 승인 후 응답 데이터 검증
    if (approveResponse.partner_order_id !== paymentId) {
      console.error('결제 승인 후 주문 ID 불일치:', {
        expected: paymentId,
        actual: approveResponse.partner_order_id
      });
      
      logPaymentError(
        paymentId,
        'ORDER_ID_MISMATCH',
        '결제 승인 후 주문 ID가 일치하지 않습니다.',
        { expected: paymentId, actual: approveResponse.partner_order_id }
      );
    }
    
    if (approveResponse.amount.total !== paymentInfo.amount) {
      console.error('결제 승인 후 금액 불일치:', {
        expected: paymentInfo.amount,
        actual: approveResponse.amount.total
      });

      logger.info('결제가 성공적으로 완료되었습니다.', {
        tid,
        paymentId,
        pg_token,
        amount: approveResponse.amount.total,
        method: approveResponse.payment_method_type
      }, 'PAYMENT');
    }

    if (approveResponse.approved_at) {
      // 결제 정보 업데이트
      await updatePaymentStatus(
        paymentId,
        PaymentStatus.COMPLETED,
        tid,
        {
          method: approveResponse.payment_method_type,
          approvedAt: approveResponse.approved_at,
          cardInfo: approveResponse.card_info,
          amount: approveResponse.amount,
        }
      );

      // 주문 상태 업데이트
      await updateOrderStatus(paymentInfo.orderId, OrderStatus.PAYMENT_COMPLETED);
    } else {
      // 결제 실패 처리
      await updatePaymentStatus(
        paymentId,
        PaymentStatus.FAILED,
        tid,
        { failReason: 'PAYMENT_INCOMPLETE' }
      );

      // 주문 상태 업데이트
      await updateOrderStatus(paymentInfo.orderId, OrderStatus.PAYMENT_FAILED);

      return NextResponse.json(
        { success: false, error: '결제가 완료되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 결제 정보 반환
    return NextResponse.json({
      success: true,
      payment: approveResponse,
    });
  } catch (error: any) {
    console.error('KakaoPay 결제 승인 오류:', error);

    // 로그 기록
    logger.error('KakaoPay 결제 승인 중 오류가 발생했습니다.', {
      error: error.message,
      stack: error.stack,
      paymentId,
      tid,
      pg_token
    }, 'PAYMENT');

    try {
      // 결제 정보 조회
      const paymentInfo = await getPaymentInfoById(paymentId);

      if (paymentInfo) {
        // 결제 정보 업데이트
        await updatePaymentStatus(
          paymentId,
          PaymentStatus.FAILED,
          null,
          { failReason: error.message || 'PAYMENT_APPROVE_ERROR' }
        );
        
        // 주문 상태 업데이트
        await updateOrderStatus(paymentInfo.orderId, OrderStatus.PAYMENT_FAILED);
      }
    } catch (updateError) {
      logger.error('결제 실패 상태 업데이트 오류:', {
        error: updateError,
        paymentId
      }, 'PAYMENT');
    }
    
    // 에러 처리
    const errorResponse = handlePaymentError(
      error,
      'kakao',
      paymentId
    );
    
    return NextResponse.json(
      errorResponse,
      { status: error.status || 500 }
    );
  }
}
