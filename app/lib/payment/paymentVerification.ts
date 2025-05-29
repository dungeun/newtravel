/**
 * 결제 검증 유틸리티 함수
 */

import { 
  getPaymentInfo, 
  PaymentInfo 
} from '@/lib/payment/paymentUtils';
import { createTossPaymentsClient } from '@/lib/payment/tossPaymentsClient';
import { createKakaoPayClient } from '@/lib/payment/kakaoPayClient';
import { getOrderById } from '@/lib/order/orderService';
import { logger } from '@/lib/logger';
import { 
  PaymentErrorCode, 
  createPaymentError, 
  mapTossError, 
  mapKakaoError 
} from '@/lib/payment/errorHandling';

/**
 * 결제 검증 결과 인터페이스
 */
export interface PaymentVerificationResult {
  isValid: boolean;
  paymentInfo?: PaymentInfo;
  error?: string;
  details?: Record<string, any>;
}

/**
 * 결제 금액 검증
 */
export const verifyPaymentAmount = (
  expectedAmount: number,
  actualAmount: number
): boolean => {
  return expectedAmount === actualAmount;
};

/**
 * 결제 상태 검증
 */
export const verifyPaymentStatus = (
  status: string,
  validStatuses: string[] = ['DONE', 'SUCCESS_PAYMENT', 'completed', 'paid']
): boolean => {
  return validStatuses.some(validStatus => 
    status.toLowerCase() === validStatus.toLowerCase()
  );
};

/**
 * 결제 중복 처리 검증
 */
export const verifyNoDuplicatePayment = async (
  orderId: string,
  paymentId: string
): Promise<boolean> => {
  try {
    // 주문 정보 조회
    const order = await getOrderById(orderId);
    
    if (!order) {
      logger.warn('중복 결제 검증: 주문 정보 없음', {
        orderId,
        paymentId
      }, 'PAYMENT_VERIFICATION');
      return true; // 주문이 없으면 중복 아님
    }
    
    // 이미 결제된 주문인지 확인
    if (order.status === 'paid' && order.paymentId && order.paymentId !== paymentId) {
      logger.warn('중복 결제 발견', {
        orderId,
        paymentId,
        existingPaymentId: order.paymentId,
        orderStatus: order.status
      }, 'PAYMENT_VERIFICATION');
      return false; // 이미 다른 결제 ID로 결제됨
    }
    
    return true;
  } catch (error: any) {
    logger.error('중복 결제 검증 오류', {
      orderId,
      paymentId,
      error: error.message,
      stack: error.stack
    }, 'PAYMENT_VERIFICATION');
    
    // 오류 발생 시 안전하게 중복으로 처리
    return false;
  }
};

/**
 * Toss Payments 결제 검증
 */
export const verifyTossPayment = async (
  paymentKey: string,
  orderId: string,
  amount: number
): Promise<PaymentVerificationResult> => {
  try {
    logger.info('Toss 결제 검증 시작', {
      paymentKey: paymentKey.substring(0, 8) + '...',
      orderId,
      amount
    }, 'PAYMENT_VERIFICATION');
    
    // 결제 정보 조회
    const paymentInfo = await getPaymentInfo(orderId);
    
    if (!paymentInfo) {
      logger.warn('Toss 결제 검증: 결제 정보 없음', {
        orderId
      }, 'PAYMENT_VERIFICATION');
      
      return {
        isValid: false,
        error: '결제 정보를 찾을 수 없습니다.',
      };
    }
    
    // 금액 검증
    if (!verifyPaymentAmount(paymentInfo.amount, amount)) {
      logger.warn('Toss 결제 검증: 금액 불일치', {
        orderId,
        expectedAmount: paymentInfo.amount,
        actualAmount: amount
      }, 'PAYMENT_VERIFICATION');
      
      return {
        isValid: false,
        paymentInfo,
        error: '결제 금액이 일치하지 않습니다.',
        details: {
          expectedAmount: paymentInfo.amount,
          actualAmount: amount,
        },
      };
    }
    
    // 중복 결제 검증
    if (!(await verifyNoDuplicatePayment(paymentInfo.orderId, paymentInfo.paymentId))) {
      logger.warn('Toss 결제 검증: 중복 결제', {
        orderId,
        paymentId: paymentInfo.paymentId
      }, 'PAYMENT_VERIFICATION');
      
      return {
        isValid: false,
        paymentInfo,
        error: '이미 처리된 결제입니다.',
      };
    }
    
    try {
      // Toss Payments API에서 결제 정보 조회
      const tossClient = createTossPaymentsClient();
      const tossPayment = await tossClient.getPayment(paymentKey);
      
      // 결제 상태 검증
      if (!verifyPaymentStatus(tossPayment.status)) {
        logger.warn('Toss 결제 검증: 상태 불일치', {
          orderId,
          status: tossPayment.status
        }, 'PAYMENT_VERIFICATION');
        
        return {
          isValid: false,
          paymentInfo,
          error: '결제가 완료되지 않았습니다.',
          details: {
            status: tossPayment.status,
          },
        };
      }
      
      // 결제 금액 재검증
      if (tossPayment.totalAmount !== amount) {
        logger.warn('Toss 결제 검증: API 금액 불일치', {
          orderId,
          expectedAmount: amount,
          actualAmount: tossPayment.totalAmount
        }, 'PAYMENT_VERIFICATION');
        
        return {
          isValid: false,
          paymentInfo,
          error: 'Toss 결제 금액이 일치하지 않습니다.',
          details: {
            expectedAmount: amount,
            actualAmount: tossPayment.totalAmount,
          },
        };
      }
      
      // 결제 ID 검증
      if (tossPayment.orderId !== orderId) {
        logger.warn('Toss 결제 검증: 주문 ID 불일치', {
          expectedOrderId: orderId,
          actualOrderId: tossPayment.orderId
        }, 'PAYMENT_VERIFICATION');
        
        return {
          isValid: false,
          paymentInfo,
          error: '주문 번호가 일치하지 않습니다.',
          details: {
            expectedOrderId: orderId,
            actualOrderId: tossPayment.orderId,
          },
        };
      }
      
      logger.info('Toss 결제 검증 성공', {
        orderId,
        paymentKey: paymentKey.substring(0, 8) + '...'
      }, 'PAYMENT_VERIFICATION');
      
      return {
        isValid: true,
        paymentInfo,
        details: {
          provider: 'toss',
          status: tossPayment.status,
          paymentKey,
        },
      };
    } catch (error: any) {
      // Toss API 오류 처리
      const tossError = mapTossError(
        error.code || 'UNKNOWN_ERROR',
        orderId,
        paymentKey,
        { amount },
        error
      );
      
      logger.error('Toss 결제 검증 API 오류', {
        orderId,
        paymentKey: paymentKey.substring(0, 8) + '...',
        errorCode: tossError.code,
        errorMessage: tossError.message,
        originalError: error.message
      }, 'PAYMENT_VERIFICATION');
      
      return {
        isValid: false,
        paymentInfo,
        error: tossError.message,
        details: {
          code: tossError.code,
          provider: 'toss',
          originalError: error.message,
        },
      };
    }
  } catch (error: any) {
    // 기타 오류 처리
    logger.error('Toss 결제 검증 중 오류 발생', {
      orderId,
      paymentKey: paymentKey.substring(0, 8) + '...',
      error: error.message,
      stack: error.stack
    }, 'PAYMENT_VERIFICATION');
    
    return {
      isValid: false,
      error: '결제 검증 중 오류가 발생했습니다.',
      details: {
        provider: 'toss',
        originalError: error.message,
      },
    };
  }
};

/**
 * KakaoPay 결제 검증
 */
export const verifyKakaoPayment = async (
  tid: string,
  orderId: string,
  // pgToken은 결제 승인 시에만 사용되며 검증 시에는 사용되지 않습니다
  _pgToken?: string
): Promise<PaymentVerificationResult> => {
  try {
    logger.info('KakaoPay 결제 검증 시작', {
      tid: tid.substring(0, 8) + '...',
      orderId
    }, 'PAYMENT_VERIFICATION');
    
    // 결제 정보 조회
    const paymentInfo = await getPaymentInfo(orderId);
    
    if (!paymentInfo) {
      logger.warn('KakaoPay 결제 검증: 결제 정보 없음', {
        orderId
      }, 'PAYMENT_VERIFICATION');
      
      return {
        isValid: false,
        error: '결제 정보를 찾을 수 없습니다.',
      };
    }
    
    // 중복 결제 검증
    if (!(await verifyNoDuplicatePayment(paymentInfo.orderId, paymentInfo.paymentId))) {
      logger.warn('KakaoPay 결제 검증: 중복 결제', {
        orderId,
        paymentId: paymentInfo.paymentId
      }, 'PAYMENT_VERIFICATION');
      
      return {
        isValid: false,
        paymentInfo,
        error: '이미 처리된 결제입니다.',
      };
    }
    
    try {
      // KakaoPay API에서 결제 정보 조회
      const kakaoClient = createKakaoPayClient();
      const kakaoPayment = await kakaoClient.getOrder(tid);
      
      // 결제 상태 검증
      if (!verifyPaymentStatus(kakaoPayment.status, ['SUCCESS_PAYMENT'])) {
        logger.warn('KakaoPay 결제 검증: 상태 불일치', {
          orderId,
          status: kakaoPayment.status
        }, 'PAYMENT_VERIFICATION');
        
        return {
          isValid: false,
          paymentInfo,
          error: '결제가 완료되지 않았습니다.',
          details: {
            status: kakaoPayment.status,
          },
        };
      }
      
      // 결제 금액 검증
      if (!verifyPaymentAmount(paymentInfo.amount, kakaoPayment.amount.total)) {
        logger.warn('KakaoPay 결제 검증: 금액 불일치', {
          orderId,
          expectedAmount: paymentInfo.amount,
          actualAmount: kakaoPayment.amount.total
        }, 'PAYMENT_VERIFICATION');
        
        return {
          isValid: false,
          paymentInfo,
          error: 'KakaoPay 결제 금액이 일치하지 않습니다.',
          details: {
            expectedAmount: paymentInfo.amount,
            actualAmount: kakaoPayment.amount.total,
          },
        };
      }
      
      // 주문 ID 검증
      if (kakaoPayment.partner_order_id !== orderId) {
        logger.warn('KakaoPay 결제 검증: 주문 ID 불일치', {
          expectedOrderId: orderId,
          actualOrderId: kakaoPayment.partner_order_id
        }, 'PAYMENT_VERIFICATION');
        
        return {
          isValid: false,
          paymentInfo,
          error: '주문 번호가 일치하지 않습니다.',
          details: {
            expectedOrderId: orderId,
            actualOrderId: kakaoPayment.partner_order_id,
          },
        };
      }
      
      logger.info('KakaoPay 결제 검증 성공', {
        orderId,
        tid: tid.substring(0, 8) + '...'
      }, 'PAYMENT_VERIFICATION');
      
      return {
        isValid: true,
        paymentInfo,
        details: {
          provider: 'kakao',
          status: kakaoPayment.status,
          tid,
        },
      };
    } catch (error: any) {
      // KakaoPay API 오류 처리
      const kakaoError = mapKakaoError(
        error.code || 'UNKNOWN_ERROR',
        orderId,
        tid,
        undefined,
        error
      );
      
      logger.error('KakaoPay 결제 검증 API 오류', {
        orderId,
        tid: tid.substring(0, 8) + '...',
        errorCode: kakaoError.code,
        errorMessage: kakaoError.message,
        originalError: error.message
      }, 'PAYMENT_VERIFICATION');
      
      return {
        isValid: false,
        paymentInfo,
        error: kakaoError.message,
        details: {
          code: kakaoError.code,
          provider: 'kakao',
          originalError: error.message,
        },
      };
    }
  } catch (error: any) {
    // 기타 오류 처리
    logger.error('KakaoPay 결제 검증 중 오류 발생', {
      orderId,
      tid: tid.substring(0, 8) + '...',
      error: error.message,
      stack: error.stack
    }, 'PAYMENT_VERIFICATION');
    
    return {
      isValid: false,
      error: '결제 검증 중 오류가 발생했습니다.',
      details: {
        provider: 'kakao',
        originalError: error.message,
      },
    };
  }
};

/**
 * 결제 검증 (통합)
 */
export const verifyPayment = async (
  provider: string,
  paymentData: Record<string, any>
): Promise<PaymentVerificationResult> => {
  try {
    // 제공자 유효성 검사
    if (!provider) {
      logger.warn('결제 검증: 제공자 누락', {
        paymentData: JSON.stringify(paymentData || {}).substring(0, 100) + '...'
      }, 'PAYMENT_VERIFICATION');
      
      return {
        isValid: false,
        error: '결제 제공자 정보가 없습니다.'
      };
    }
    
    // 지원되지 않는 결제 제공자 처리
    if (!['toss', 'kakao'].includes(provider.toLowerCase())) {
      logger.warn('결제 검증: 지원되지 않는 제공자', {
        provider,
        orderId: paymentData?.orderId
      }, 'PAYMENT_VERIFICATION');
      
      return {
        isValid: false,
        error: `지원되지 않는 결제 제공자: ${provider}`
      };
    }
    
    // paymentData 유효성 검사
    if (!paymentData || typeof paymentData !== 'object') {
      logger.warn('결제 검증: 결제 데이터 누락 또는 유효하지 않음', {
        provider
      }, 'PAYMENT_VERIFICATION');
      
      return {
        isValid: false,
        error: '결제 데이터가 유효하지 않습니다.'
      };
    }
    
    logger.info('결제 검증 시작', {
      provider,
      orderId: paymentData.orderId,
      ...provider.toLowerCase() === 'toss' ? { paymentKey: paymentData.paymentKey?.substring(0, 8) + '...' } : {},
      ...provider.toLowerCase() === 'kakao' ? { tid: paymentData.tid?.substring(0, 8) + '...' } : {}
    }, 'PAYMENT_VERIFICATION');
    
    // 제공자에 따른 검증 로직 실행
    switch (provider.toLowerCase()) {
      case 'toss':
        if (!paymentData.paymentKey) {
          logger.warn('Toss 결제 검증: paymentKey 누락', {
            orderId: paymentData.orderId
          }, 'PAYMENT_VERIFICATION');
          
          return {
            isValid: false,
            error: 'paymentKey가 없습니다.'
          };
        }
        
        if (!paymentData.orderId) {
          logger.warn('Toss 결제 검증: orderId 누락', {
            paymentKey: paymentData.paymentKey?.substring(0, 8) + '...'
          }, 'PAYMENT_VERIFICATION');
          
          return {
            isValid: false,
            error: 'orderId가 없습니다.'
          };
        }
        
        if (!paymentData.amount) {
          logger.warn('Toss 결제 검증: amount 누락', {
            orderId: paymentData.orderId,
            paymentKey: paymentData.paymentKey?.substring(0, 8) + '...'
          }, 'PAYMENT_VERIFICATION');
          
          return {
            isValid: false,
            error: 'amount가 없습니다.'
          };
        }
        
        return await verifyTossPayment(
          paymentData.paymentKey,
          paymentData.orderId,
          paymentData.amount
        );
        
      case 'kakao':
        if (!paymentData.tid) {
          logger.warn('KakaoPay 결제 검증: tid 누락', {
            orderId: paymentData.orderId
          }, 'PAYMENT_VERIFICATION');
          
          return {
            isValid: false,
            error: 'tid가 없습니다.'
          };
        }
        
        if (!paymentData.orderId) {
          logger.warn('KakaoPay 결제 검증: orderId 누락', {
            tid: paymentData.tid?.substring(0, 8) + '...'
          }, 'PAYMENT_VERIFICATION');
          
          return {
            isValid: false,
            error: 'orderId가 없습니다.'
          };
        }
        
        return await verifyKakaoPayment(
          paymentData.tid,
          paymentData.orderId,
          paymentData.pg_token
        );
        
      default:
        logger.warn('지원되지 않는 결제 제공자', {
          provider,
          orderId: paymentData.orderId
        }, 'PAYMENT_VERIFICATION');
        
        return {
          isValid: false,
          error: `지원되지 않는 결제 제공자: ${provider}`
        };
    }
  } catch (error: any) {
    // 오류 유형에 따른 처리
    let errorCode = PaymentErrorCode.VERIFICATION_FAILED;
    let errorDetails: Record<string, any> = { originalError: error.message };
    
    // 타임아웃 오류 처리
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout') || error.message?.includes('타임아웃')) {
      errorCode = PaymentErrorCode.TIMEOUT_ERROR;
      errorDetails.errorType = 'timeout';
      
      logger.error('결제 검증 타임아웃', {
        provider,
        orderId: paymentData?.orderId,
        error: error.message
      }, 'PAYMENT_VERIFICATION');
    }
    // 네트워크 오류 처리
    else if (error.code === 'ENOTFOUND' || error.message?.includes('network') || error.message?.includes('네트워크')) {
      errorCode = PaymentErrorCode.NETWORK_ERROR;
      errorDetails.errorType = 'network';
      
      logger.error('결제 검증 네트워크 오류', {
        provider,
        orderId: paymentData?.orderId,
        error: error.message
      }, 'PAYMENT_VERIFICATION');
    }
    // 서버 오류 처리
    else if (error.response && error.response.status >= 500) {
      errorCode = PaymentErrorCode.SERVER_ERROR;
      errorDetails.errorType = 'server';
      errorDetails.statusCode = error.response.status;
      
      logger.error('결제 검증 서버 오류', {
        provider,
        orderId: paymentData?.orderId,
        status: error.response.status,
        error: error.message
      }, 'PAYMENT_VERIFICATION');
    }
    // JSON 파싱 오류 처리
    else if (error.message?.includes('JSON') || error.message?.includes('Unexpected token')) {
      errorCode = PaymentErrorCode.INVALID_RESPONSE;
      errorDetails.errorType = 'parsing';
      
      logger.error('결제 검증 응답 파싱 오류', {
        provider,
        orderId: paymentData?.orderId,
        error: error.message
      }, 'PAYMENT_VERIFICATION');
    }
    // 기타 오류
    else {
      logger.error('결제 검증 중 오류 발생', {
        provider,
        orderId: paymentData?.orderId,
        error: error.message,
        stack: error.stack
      }, 'PAYMENT_VERIFICATION');
    }
    
    // 결제 오류 생성
    const paymentError = createPaymentError(
      errorCode,
      provider as 'toss' | 'kakao',
      paymentData?.orderId,
      undefined,
      { paymentData },
      error
    );
    
    return {
      isValid: false,
      error: paymentError.message,
      details: {
        code: paymentError.code,
        ...errorDetails
      }
    };
  }
};
