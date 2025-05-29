import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { 
  PaymentStatus, 
  getPaymentInfo, 
  updatePaymentStatus
} from '@/lib/payment/paymentUtils';
import { logger } from '@/lib/logger';
import { 
  PaymentErrorCode,
  handlePaymentError,
  createPaymentError
} from '@/lib/payment/errorHandling';
import { verifyPayment } from '@/lib/payment/paymentVerification';

// 주문 서비스 모듈 임포트
// 실제 구현 시 아래 주석을 해제하고 정확한 경로를 지정해주세요
// import { updateOrderStatus, OrderStatus } from '@/lib/order/orderService';

// 임시 주문 서비스 구현
const OrderStatus = {
  PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_CANCELED: 'PAYMENT_CANCELED',
  PAYMENT_PENDING: 'PAYMENT_PENDING'
} as const;

const updateOrderStatus = async (orderId: string, status: string) => {
  // 실제 구현에서는 데이터베이스에서 주문 상태를 업데이트해야 합니다
  logger.info(`주문 ${orderId}의 상태를 ${status}로 업데이트합니다.`, {
    orderId,
    status
  }, 'ORDER');
  return true;
};

/**
 * Toss Payments 결제 상태 매핑
 */
const mapTossPaymentStatus = (status: string): PaymentStatus => {
  switch (status) {
    case 'DONE':
      return PaymentStatus.COMPLETED;
    case 'CANCELED':
      return PaymentStatus.CANCELED;
    case 'READY':
      return PaymentStatus.READY;
    case 'IN_PROGRESS':
      return PaymentStatus.IN_PROGRESS;
    case 'WAITING_FOR_DEPOSIT':
      return PaymentStatus.VIRTUAL_ACCOUNT_ISSUED;
    case 'EXPIRED':
      return PaymentStatus.VIRTUAL_ACCOUNT_EXPIRED;
    default:
      return PaymentStatus.FAILED;
  }
};

/**
 * KakaoPay 결제 상태 매핑
 */
const mapKakaoPaymentStatus = (status: string): PaymentStatus => {
  switch (status) {
    case 'QUIT_PAYMENT':
      return PaymentStatus.CANCELED;
    case 'CANCEL_PAYMENT':
      return PaymentStatus.CANCELED;
    case 'PART_CANCEL_PAYMENT':
      return PaymentStatus.COMPLETED; // 부분 취소는 여전히 결제 완료 상태
    case 'SUCCESS_PAYMENT':
      return PaymentStatus.COMPLETED;
    case 'READY_TO_PAYMENT':
      return PaymentStatus.READY;
    case 'FAIL_PAYMENT':
      return PaymentStatus.FAILED;
    case 'VBANK_ISSUED':
      return PaymentStatus.VIRTUAL_ACCOUNT_ISSUED;
    case 'VBANK_EXPIRED':
      return PaymentStatus.VIRTUAL_ACCOUNT_EXPIRED;
    default:
      return PaymentStatus.FAILED;
  }
};



/**
 * Toss Payments 웹훅 서명 검증
 */
const verifyTossSignature = (request: NextRequest, rawBody: string): boolean => {
  try {
    const tossSecretKey = process.env.TOSS_PAYMENTS_SECRET_KEY || '';
    const tossSignature = request.headers.get('Toss-Signature');
    
    if (!tossSignature || !tossSecretKey) {
      logger.warn('Toss 서명 검증 실패: 서명 또는 시크릿 키 누락', {
        hasSignature: !!tossSignature,
        hasSecretKey: !!tossSecretKey
      }, 'PAYMENT_SECURITY');
      return false;
    }
    
    // 서명 검증
    const hmac = crypto.createHmac('sha256', tossSecretKey);
    hmac.update(rawBody);
    const generatedSignature = hmac.digest('hex');
    
    const isValid = generatedSignature === tossSignature;
    
    if (!isValid) {
      logger.warn('Toss 서명 검증 실패: 서명 불일치', {
        expectedSignature: generatedSignature.substring(0, 10) + '...',
        receivedSignature: tossSignature.substring(0, 10) + '...'
      }, 'PAYMENT_SECURITY');
    }
    
    return isValid;
  } catch (error: any) {
    logger.error('Toss 서명 검증 오류:', {
      error: error.message,
      stack: error.stack
    }, 'PAYMENT_SECURITY');
    return false;
  }
};

/**
 * KakaoPay 웹훅 서명 검증
 */
const verifyKakaoSignature = (request: NextRequest): boolean => {
  try {
    const kakaoSecretKey = process.env.KAKAO_ADMIN_KEY || '';
    const kakaoSignature = request.headers.get('Authorization');
    
    if (!kakaoSignature || !kakaoSecretKey) {
      logger.warn('KakaoPay 서명 검증 실패: 서명 또는 시크릿 키 누락', {
        hasSignature: !!kakaoSignature,
        hasSecretKey: !!kakaoSecretKey
      }, 'PAYMENT_SECURITY');
      return false;
    }
    
    // Authorization 헤더 검증 (예: "KakaoAK {ADMIN_KEY}")
    const expectedAuth = `KakaoAK ${kakaoSecretKey}`;
    const isValid = kakaoSignature === expectedAuth;
    
    if (!isValid) {
      logger.warn('KakaoPay 서명 검증 실패: 서명 불일치', {
        hasExpectedPrefix: kakaoSignature.startsWith('KakaoAK ')
      }, 'PAYMENT_SECURITY');
    }
    
    return isValid;
  } catch (error: any) {
    logger.error('KakaoPay 서명 검증 오류:', {
      error: error.message,
      stack: error.stack
    }, 'PAYMENT_SECURITY');
    return false;
  }
};

/**
 * 결제 웹훅 처리 API
 * 
 * @route POST /api/payments/webhook
 */
export async function POST(req: NextRequest) {
  try {
    // 요청 본문 복사
    const rawBody = await req.text();
    let data;
    
    try {
      data = JSON.parse(rawBody);
    } catch (e) {
      logger.error('웹훅 요청 파싱 오류:', {
        error: e,
        rawBody: rawBody.substring(0, 100) + (rawBody.length > 100 ? '...' : '')
      }, 'PAYMENT_WEBHOOK');
      
      return NextResponse.json(
        { success: false, error: '잘못된 JSON 형식입니다.' },
        { status: 400 }
      );
    }
    
    // 웹훅 데이터 검증
    const { provider, orderId, paymentKey, status } = data;
    
    if (!provider || !orderId) {
      logger.warn('필수 웹훅 데이터 누락:', {
        provider,
        orderId
      }, 'PAYMENT_WEBHOOK');
      
      return NextResponse.json(
        { success: false, error: '필수 데이터가 누락되었습니다.' },
        { status: 400 }
      );
    }
    
    // 서명 검증
    let isSignatureValid = false;
    
    if (provider === 'toss') {
      isSignatureValid = verifyTossSignature(req, rawBody);
    } else if (provider === 'kakao') {
      isSignatureValid = verifyKakaoSignature(req);
    } else {
      logger.warn('지원하지 않는 결제 제공자:', {
        provider
      }, 'PAYMENT_WEBHOOK');
      
      return NextResponse.json(
        { success: false, error: '지원하지 않는 결제 제공자입니다.' },
        { status: 400 }
      );
    }
    
    // 개발 환경에서는 서명 검증 건너뛰기
    if (process.env.NODE_ENV !== 'development' && !isSignatureValid) {
      logger.warn('웹훅 서명 검증 실패:', {
        provider
      }, 'PAYMENT_WEBHOOK');
      
      return NextResponse.json(
        { success: false, error: '유효하지 않은 서명입니다.' },
        { status: 401 }
      );
    }
    
    // 결제 정보 조회
    const paymentInfo = await getPaymentInfo(orderId);
    
    if (!paymentInfo) {
      logger.warn('결제 정보 찾을 수 없음:', {
        provider,
        orderId
      }, 'PAYMENT_WEBHOOK');
      
      return NextResponse.json(
        { success: false, error: '결제 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 결제 상태 업데이트
    let paymentStatus: PaymentStatus;
    let metadata: Record<string, any> = {};
    
    try {
      // 결제 검증 로직 추가
      let verificationResult;
      
      if (provider === 'toss') {
        if (!paymentKey) {
          return NextResponse.json(
            { success: false, error: 'paymentKey가 필요합니다.' },
            { status: 400 }
          );
        }
        
        // Toss 결제 검증 실행
        verificationResult = await verifyPayment('toss', {
          paymentKey,
          orderId,
          amount: paymentInfo.amount
        });
        
        if (!verificationResult.isValid) {
          logger.warn('Toss 결제 검증 실패 (webhook):', {
            orderId,
            paymentKey: paymentKey.substring(0, 8) + '...',
            error: verificationResult.error,
            details: verificationResult.details
          }, 'PAYMENT_WEBHOOK');
          
          return NextResponse.json({
            success: false,
            error: verificationResult.error || '결제 검증에 실패했습니다.',
            details: verificationResult.details
          }, { status: 400 });
        }
        
        // 검증 성공 시 상태 및 메타데이터 설정
        const tossPayment = verificationResult.details || {};
        
        // 결제 상태 매핑
        paymentStatus = mapTossPaymentStatus(status || tossPayment.status || 'DONE');
        
        // 메타데이터 설정
        metadata = {
          paymentKey,
          method: tossPayment.method || 'CARD',
          receiptUrl: tossPayment.receiptUrl,
          approvedAt: tossPayment.approvedAt || new Date().toISOString(),
          totalAmount: paymentInfo.amount,
          balanceAmount: paymentInfo.amount,
          cardInfo: tossPayment.cardInfo
        };
        
      } else if (provider === 'kakao') {
        if (!data.tid) {
          return NextResponse.json(
            { success: false, error: 'tid가 필요합니다.' },
            { status: 400 }
          );
        }
        
        // KakaoPay 결제 검증 실행
        verificationResult = await verifyPayment('kakao', {
          tid: data.tid,
          orderId,
          pg_token: data.pg_token
        });
        
        if (!verificationResult.isValid) {
          logger.warn('KakaoPay 결제 검증 실패 (webhook):', {
            orderId,
            tid: data.tid.substring(0, 8) + '...',
            error: verificationResult.error,
            details: verificationResult.details
          }, 'PAYMENT_WEBHOOK');
          
          return NextResponse.json({
            success: false,
            error: verificationResult.error || '결제 검증에 실패했습니다.',
            details: verificationResult.details
          }, { status: 400 });
        }
        
        // 검증 성공 시 상태 및 메타데이터 설정
        const kakaoPayment = verificationResult.details || {};
        
        // 결제 상태 매핑
        paymentStatus = mapKakaoPaymentStatus(status || kakaoPayment.status || 'SUCCESS_PAYMENT');
        
        // 메타데이터 설정
        metadata = {
          tid: data.tid,
          method: kakaoPayment.method || 'CARD',
          approvedAt: kakaoPayment.approvedAt || new Date().toISOString(),
          totalAmount: paymentInfo.amount,
          itemName: kakaoPayment.itemName || '여행 상품'
        };
        
      } else {
        return NextResponse.json(
          { success: false, error: '지원하지 않는 결제 제공자입니다.' },
          { status: 400 }
        );
      }
      
      // 결제 상태 업데이트
      await updatePaymentStatus(
        paymentInfo.paymentId,
        paymentStatus,
        provider === 'toss' ? paymentKey : data.tid,
        metadata
      );
      
      // 주문 상태 업데이트
      let orderStatus: string;
      
      if (paymentStatus === PaymentStatus.COMPLETED) {
        orderStatus = OrderStatus.PAYMENT_COMPLETED;
        logger.info('결제 완료', {
          orderId: paymentInfo.orderId,
          paymentId: paymentInfo.paymentId,
          status: paymentStatus
        }, 'PAYMENT_WEBHOOK');
      } else if (paymentStatus === PaymentStatus.CANCELED) {
        orderStatus = OrderStatus.PAYMENT_CANCELED;
        logger.info('결제 취소', {
          orderId: paymentInfo.orderId,
          paymentId: paymentInfo.paymentId,
          status: paymentStatus
        }, 'PAYMENT_WEBHOOK');
      } else if (paymentStatus === PaymentStatus.FAILED) {
        orderStatus = OrderStatus.PAYMENT_FAILED;
        logger.warn('결제 실패', {
          orderId: paymentInfo.orderId,
          paymentId: paymentInfo.paymentId,
          status: paymentStatus
        }, 'PAYMENT_WEBHOOK');
      } else if (paymentStatus === PaymentStatus.VIRTUAL_ACCOUNT_ISSUED) {
        orderStatus = OrderStatus.PAYMENT_PENDING;
        logger.info('가상계좌 발급', {
          orderId: paymentInfo.orderId,
          paymentId: paymentInfo.paymentId,
          status: paymentStatus
        }, 'PAYMENT_WEBHOOK');
      } else {
        orderStatus = OrderStatus.PAYMENT_PENDING;
        logger.info('기타 결제 상태', {
          orderId: paymentInfo.orderId,
          paymentId: paymentInfo.paymentId,
          status: paymentStatus
        }, 'PAYMENT_WEBHOOK');
      }
      
      await updateOrderStatus(paymentInfo.orderId, orderStatus);
      
      // 웹훅 처리 완료 로그
      logger.info('웹훅 처리 완료', {
        provider,
        orderId: paymentInfo.orderId,
        paymentId: paymentInfo.paymentId,
        status: paymentStatus
      }, 'PAYMENT_WEBHOOK');
      
      return NextResponse.json({
        success: true,
        message: '웹훅 처리 완료',
        paymentId: paymentInfo.paymentId,
        orderId: paymentInfo.orderId,
        status: paymentStatus
      });
    } catch (processingError: any) {
      // 오류 유형에 따른 처리
      let errorCode = PaymentErrorCode.UNKNOWN_ERROR;
      let errorDetails: Record<string, any> = {
        provider,
        orderId,
        originalError: processingError.message
      };
      
      // 타임아웃 오류 처리
      if (processingError.code === 'ECONNABORTED' || processingError.message?.includes('timeout') || processingError.message?.includes('타임아웃')) {
        errorCode = PaymentErrorCode.TIMEOUT_ERROR;
        errorDetails.errorType = 'timeout';
        
        logger.error('결제 상태 업데이트 타임아웃:', {
          provider,
          orderId,
          error: processingError.message
        }, 'PAYMENT_WEBHOOK');
      }
      // 네트워크 오류 처리
      else if (processingError.code === 'ENOTFOUND' || processingError.message?.includes('network') || processingError.message?.includes('네트워크')) {
        errorCode = PaymentErrorCode.NETWORK_ERROR;
        errorDetails.errorType = 'network';
        
        logger.error('결제 상태 업데이트 네트워크 오류:', {
          provider,
          orderId,
          error: processingError.message
        }, 'PAYMENT_WEBHOOK');
      }
      // 데이터베이스 오류 처리
      else if (processingError.message?.includes('database') || processingError.message?.includes('DB') || processingError.message?.includes('sql')) {
        errorCode = PaymentErrorCode.INTERNAL_SERVER_ERROR;
        errorDetails.errorType = 'database';
        
        logger.error('결제 상태 업데이트 데이터베이스 오류:', {
          provider,
          orderId,
          error: processingError.message
        }, 'PAYMENT_WEBHOOK');
      }
      // 기타 오류
      else {
        logger.error('웹훅 처리 중 오류 발생:', {
          error: processingError.message,
          stack: processingError.stack,
          provider,
          orderId
        }, 'PAYMENT_WEBHOOK');
      }
      
      // 결제 오류 생성
      const paymentError = createPaymentError(
        errorCode,
        provider as 'toss' | 'kakao',
        orderId,
        undefined,
        errorDetails,
        processingError
      );
      
      return NextResponse.json({
        success: false,
        error: paymentError.message,
        code: paymentError.code,
        details: errorDetails
      }, { status: 500 });
    }
    
  } catch (error: any) {
    // 오류 유형에 따른 처리
    let statusCode = 500;
    let errorCode = error.code || 'UNKNOWN_ERROR';
    let errorDetails: Record<string, any> = {
      url: req.url,
      method: req.method
    };
    
    // 타임아웃 오류 처리
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout') || error.message?.includes('타임아웃')) {
      statusCode = 504; // Gateway Timeout
      errorCode = 'TIMEOUT_ERROR';
      errorDetails.errorType = 'timeout';
      
      logger.error('결제 웹훅 처리 타임아웃:', {
        error: error.message,
        provider: error.provider || 'unknown',
        orderId: error.orderId,
        url: req.url
      }, 'PAYMENT_WEBHOOK');
    }
    // 네트워크 오류 처리
    else if (error.code === 'ENOTFOUND' || error.message?.includes('network') || error.message?.includes('네트워크')) {
      statusCode = 503; // Service Unavailable
      errorCode = 'NETWORK_ERROR';
      errorDetails.errorType = 'network';
      
      logger.error('결제 웹훅 처리 네트워크 오류:', {
        error: error.message,
        provider: error.provider || 'unknown',
        orderId: error.orderId,
        url: req.url
      }, 'PAYMENT_WEBHOOK');
    }
    // 서버 오류 처리
    else if (error.response && error.response.status >= 500) {
      statusCode = error.response.status;
      errorCode = 'SERVER_ERROR';
      errorDetails.errorType = 'server';
      errorDetails.statusCode = error.response.status;
      
      logger.error('결제 웹훅 처리 서버 오류:', {
        error: error.message,
        provider: error.provider || 'unknown',
        orderId: error.orderId,
        status: error.response.status,
        url: req.url
      }, 'PAYMENT_WEBHOOK');
    }
    // JSON 파싱 오류 처리
    else if (error.message?.includes('JSON') || error.message?.includes('Unexpected token')) {
      statusCode = 400; // Bad Request
      errorCode = 'INVALID_REQUEST';
      errorDetails.errorType = 'parsing';
      
      logger.error('결제 웹훅 요청 파싱 오류:', {
        error: error.message,
        provider: error.provider || 'unknown',
        orderId: error.orderId,
        url: req.url
      }, 'PAYMENT_WEBHOOK');
    }
    // 인증 오류 처리
    else if (error.message?.includes('signature') || error.message?.includes('서명') || error.message?.includes('auth')) {
      statusCode = 401; // Unauthorized
      errorCode = 'SECURITY_ERROR';
      errorDetails.errorType = 'authentication';
      
      logger.error('결제 웹훅 인증 오류:', {
        error: error.message,
        provider: error.provider || 'unknown',
        orderId: error.orderId,
        url: req.url
      }, 'PAYMENT_WEBHOOK');
    }
    // 기타 오류
    else {
      logger.error('결제 웹훅 처리 오류:', {
        error: error.message,
        stack: error.stack,
        provider: error.provider || 'unknown',
        orderId: error.orderId,
        url: req.url,
        method: req.method,
        headers: Object.fromEntries(req.headers)
      }, 'PAYMENT_WEBHOOK');
    }
    
    // 에러 처리
    const errorResponse = handlePaymentError(
      error,
      error.provider || 'unknown',
      error.orderId
    );
    
    // 오류 응답에 추가 정보 포함
    return NextResponse.json(
      {
        ...errorResponse,
        code: errorCode,
        details: errorDetails
      },
      { status: error.status || statusCode }
    );
  }
}
