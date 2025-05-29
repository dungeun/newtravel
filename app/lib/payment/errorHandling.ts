/**
 * 결제 시스템 오류 처리 유틸리티
 */

import { logger } from '@/lib/logger';
import { PaymentInfo } from '@/lib/payment/paymentUtils';

// 결제 오류 코드 정의
export enum PaymentErrorCode {
  // 일반 오류
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  
  // 결제 검증 오류
  VERIFICATION_FAILED = 'VERIFICATION_FAILED',
  AMOUNT_MISMATCH = 'AMOUNT_MISMATCH',
  ORDER_ID_MISMATCH = 'ORDER_ID_MISMATCH',
  DUPLICATE_PAYMENT = 'DUPLICATE_PAYMENT',
  
  // 결제 상태 오류
  PAYMENT_CANCELED = 'PAYMENT_CANCELED',
  PAYMENT_DECLINED = 'PAYMENT_DECLINED',
  PAYMENT_EXPIRED = 'PAYMENT_EXPIRED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  
  // 카드 관련 오류
  CARD_DECLINED = 'CARD_DECLINED',
  CARD_EXPIRED = 'CARD_EXPIRED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INVALID_CARD = 'INVALID_CARD',
  
  // 가상계좌 관련 오류
  VIRTUAL_ACCOUNT_EXPIRED = 'VIRTUAL_ACCOUNT_EXPIRED',
  DEPOSIT_TIMEOUT = 'DEPOSIT_TIMEOUT',
  
  // 보안 관련 오류
  SECURITY_ERROR = 'SECURITY_ERROR',
  FRAUD_SUSPECTED = 'FRAUD_SUSPECTED',
  
  // 시스템 오류
  GATEWAY_ERROR = 'GATEWAY_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
}

// 결제 오류 인터페이스
export interface PaymentError {
  code: PaymentErrorCode | string;
  message: string;
  provider?: 'toss' | 'kakao';
  orderId?: string;
  paymentId?: string;
  details?: Record<string, any>;
  timestamp: Date;
  originalError?: any;
}

// 결제 오류 메시지 매핑
export const paymentErrorMessages: Record<PaymentErrorCode, string> = {
  [PaymentErrorCode.UNKNOWN_ERROR]: '알 수 없는 오류가 발생했습니다.',
  [PaymentErrorCode.NETWORK_ERROR]: '네트워크 연결 오류가 발생했습니다.',
  [PaymentErrorCode.TIMEOUT_ERROR]: '요청 시간이 초과되었습니다.',
  [PaymentErrorCode.INVALID_REQUEST]: '잘못된 요청입니다.',
  [PaymentErrorCode.INVALID_RESPONSE]: '잘못된 응답입니다.',
  
  [PaymentErrorCode.VERIFICATION_FAILED]: '결제 검증에 실패했습니다.',
  [PaymentErrorCode.AMOUNT_MISMATCH]: '결제 금액이 일치하지 않습니다.',
  [PaymentErrorCode.ORDER_ID_MISMATCH]: '주문 ID가 일치하지 않습니다.',
  [PaymentErrorCode.DUPLICATE_PAYMENT]: '이미 처리된 결제입니다.',
  
  [PaymentErrorCode.PAYMENT_CANCELED]: '결제가 취소되었습니다.',
  [PaymentErrorCode.PAYMENT_DECLINED]: '결제가 거부되었습니다.',
  [PaymentErrorCode.PAYMENT_EXPIRED]: '결제 시간이 만료되었습니다.',
  [PaymentErrorCode.PAYMENT_FAILED]: '결제에 실패했습니다.',
  
  [PaymentErrorCode.CARD_DECLINED]: '카드 결제가 거부되었습니다.',
  [PaymentErrorCode.CARD_EXPIRED]: '만료된 카드입니다.',
  [PaymentErrorCode.INSUFFICIENT_FUNDS]: '잔액이 부족합니다.',
  [PaymentErrorCode.INVALID_CARD]: '유효하지 않은 카드입니다.',
  
  [PaymentErrorCode.VIRTUAL_ACCOUNT_EXPIRED]: '가상계좌 입금 기한이 만료되었습니다.',
  [PaymentErrorCode.DEPOSIT_TIMEOUT]: '입금 대기 시간이 초과되었습니다.',
  
  [PaymentErrorCode.SECURITY_ERROR]: '보안 오류가 발생했습니다.',
  [PaymentErrorCode.FRAUD_SUSPECTED]: '의심스러운 결제로 감지되었습니다.',
  
  [PaymentErrorCode.GATEWAY_ERROR]: '결제 게이트웨이에 오류가 발생했습니다.',
  [PaymentErrorCode.INTERNAL_SERVER_ERROR]: '서버 내부 오류가 발생했습니다.',
  [PaymentErrorCode.SERVER_ERROR]: '결제 서버에 오류가 발생했습니다.',
};

// Toss Payments 오류 코드 매핑
export const tossErrorCodeMapping: Record<string, PaymentErrorCode> = {
  'INVALID_CARD_COMPANY': PaymentErrorCode.INVALID_CARD,
  'INVALID_CARD_NUMBER': PaymentErrorCode.INVALID_CARD,
  'INVALID_CARD_EXPIRY': PaymentErrorCode.CARD_EXPIRED,
  'INVALID_CARD_BIRTH': PaymentErrorCode.INVALID_CARD,
  'INVALID_CARD_PASSWORD': PaymentErrorCode.INVALID_CARD,
  'INVALID_CARD_INSTALLMENT_PLAN': PaymentErrorCode.INVALID_REQUEST,
  'CARD_DECLINED': PaymentErrorCode.CARD_DECLINED,
  'CARD_PROCESSING_FAILED': PaymentErrorCode.PAYMENT_FAILED,
  'INSUFFICIENT_BALANCE': PaymentErrorCode.INSUFFICIENT_FUNDS,
  'PAY_PROCESS_CANCELED': PaymentErrorCode.PAYMENT_CANCELED,
  'PAY_PROCESS_ABORTED': PaymentErrorCode.PAYMENT_FAILED,
  'PAYMENT_AMOUNT_EXCEEDED': PaymentErrorCode.INVALID_REQUEST,
  'MERCHANT_NOT_FOUND': PaymentErrorCode.GATEWAY_ERROR,
  'INVALID_REQUEST': PaymentErrorCode.INVALID_REQUEST,
  'INVALID_API_KEY': PaymentErrorCode.SECURITY_ERROR,
  'INVALID_ACCESS_TOKEN': PaymentErrorCode.SECURITY_ERROR,
  'INVALID_PAYMENT_KEY': PaymentErrorCode.INVALID_REQUEST,
  'INVALID_ORDER_ID': PaymentErrorCode.ORDER_ID_MISMATCH,
  'INVALID_AMOUNT': PaymentErrorCode.AMOUNT_MISMATCH,
};

// KakaoPay 오류 코드 매핑
export const kakaoErrorCodeMapping: Record<string, PaymentErrorCode> = {
  'QUIT_PAYMENT': PaymentErrorCode.PAYMENT_CANCELED,
  'CANCEL_PAYMENT': PaymentErrorCode.PAYMENT_CANCELED,
  'FAIL_PAYMENT': PaymentErrorCode.PAYMENT_FAILED,
  'FAIL_AUTH_PASSWORD': PaymentErrorCode.SECURITY_ERROR,
  'FAIL_CARD_COMPANY': PaymentErrorCode.CARD_DECLINED,
  'FAIL_INVALID_CARD_INFO': PaymentErrorCode.INVALID_CARD,
  'FAIL_INSUFFICIENT_CARD_BALANCE': PaymentErrorCode.INSUFFICIENT_FUNDS,
  'FAIL_INVALID_CARD_STATUS': PaymentErrorCode.CARD_DECLINED,
  'FAIL_FRAUD_DETECT': PaymentErrorCode.FRAUD_SUSPECTED,
  'FAIL_EXCEED_LIMIT': PaymentErrorCode.PAYMENT_DECLINED,
  'FAIL_INVALID_PARAMETER': PaymentErrorCode.INVALID_REQUEST,
  'FAIL_SYSTEM_ERROR': PaymentErrorCode.GATEWAY_ERROR,
};

/**
 * 결제 오류 생성
 */
export const createPaymentError = (
  code: PaymentErrorCode | string,
  provider?: 'toss' | 'kakao',
  orderId?: string,
  paymentId?: string,
  details?: Record<string, any>,
  originalError?: any
): PaymentError => {
  // 코드가 매핑된 오류 코드인지 확인
  const errorCode = Object.values(PaymentErrorCode).includes(code as PaymentErrorCode)
    ? code as PaymentErrorCode
    : PaymentErrorCode.UNKNOWN_ERROR;
  
  // 오류 메시지 결정
  const message = paymentErrorMessages[errorCode as PaymentErrorCode] || '결제 중 오류가 발생했습니다.';
  
  return {
    code: errorCode,
    message,
    provider,
    orderId,
    paymentId,
    details,
    timestamp: new Date(),
    originalError,
  };
};

/**
 * Toss Payments 오류 매핑
 */
export const mapTossError = (
  errorCode: string,
  orderId?: string,
  paymentId?: string,
  details?: Record<string, any>,
  originalError?: any
): PaymentError => {
  const mappedCode = tossErrorCodeMapping[errorCode] || PaymentErrorCode.UNKNOWN_ERROR;
  return createPaymentError(mappedCode, 'toss', orderId, paymentId, details, originalError);
};

/**
 * KakaoPay 오류 매핑
 */
export const mapKakaoError = (
  errorCode: string,
  orderId?: string,
  paymentId?: string,
  details?: Record<string, any>,
  originalError?: any
): PaymentError => {
  const mappedCode = kakaoErrorCodeMapping[errorCode] || PaymentErrorCode.UNKNOWN_ERROR;
  return createPaymentError(mappedCode, 'kakao', orderId, paymentId, details, originalError);
};

/**
 * 결제 오류 로깅
 */
export const logPaymentError = (error: PaymentError): void => {
  // 오류 로그 형식 생성
  const logData = {
    code: error.code,
    message: error.message,
    provider: error.provider,
    orderId: error.orderId,
    paymentId: error.paymentId,
    details: error.details,
    timestamp: error.timestamp,
    stack: error.originalError?.stack,
  };
  
  // 오류 심각도에 따라 로깅
  if (
    error.code === PaymentErrorCode.INTERNAL_SERVER_ERROR ||
    error.code === PaymentErrorCode.GATEWAY_ERROR ||
    error.code === PaymentErrorCode.SECURITY_ERROR ||
    error.code === PaymentErrorCode.FRAUD_SUSPECTED
  ) {
    logger.error('심각한 결제 오류:', logData);
  } else if (
    error.code === PaymentErrorCode.PAYMENT_FAILED ||
    error.code === PaymentErrorCode.CARD_DECLINED ||
    error.code === PaymentErrorCode.INSUFFICIENT_FUNDS ||
    error.code === PaymentErrorCode.VERIFICATION_FAILED
  ) {
    logger.warn('결제 실패:', logData);
  } else {
    logger.info('결제 정보:', logData);
  }
};

/**
 * 사용자 친화적인 오류 메시지 생성
 */
export const getUserFriendlyErrorMessage = (error: PaymentError): string => {
  // 사용자에게 보여줄 친화적인 메시지 반환
  switch (error.code) {
    case PaymentErrorCode.CARD_DECLINED:
    case PaymentErrorCode.PAYMENT_DECLINED:
      return '카드 결제가 승인되지 않았습니다. 다른 카드로 시도해주세요.';
      
    case PaymentErrorCode.INSUFFICIENT_FUNDS:
      return '카드 잔액이 부족합니다. 다른 결제 수단을 이용해주세요.';
      
    case PaymentErrorCode.CARD_EXPIRED:
      return '만료된 카드입니다. 카드 정보를 확인해주세요.';
      
    case PaymentErrorCode.INVALID_CARD:
      return '카드 정보가 올바르지 않습니다. 다시 확인해주세요.';
      
    case PaymentErrorCode.PAYMENT_CANCELED:
      return '결제가 취소되었습니다. 다시 시도해주세요.';
      
    case PaymentErrorCode.NETWORK_ERROR:
    case PaymentErrorCode.TIMEOUT_ERROR:
      return '네트워크 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.';
      
    case PaymentErrorCode.FRAUD_SUSPECTED:
      return '보안상의 이유로 결제가 거부되었습니다. 카드사에 문의해주세요.';
      
    case PaymentErrorCode.GATEWAY_ERROR:
    case PaymentErrorCode.INTERNAL_SERVER_ERROR:
      return '시스템 오류가 발생했습니다. 잠시 후 다시 시도하거나 고객센터에 문의해주세요.';
      
    default:
      return '결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.';
  }
};

/**
 * 결제 오류 처리 및 응답 생성
 */
export const handlePaymentError = (
  error: any,
  provider?: 'toss' | 'kakao',
  orderId?: string,
  paymentId?: string
): { success: false; error: string; code: string; details?: Record<string, any> } => {
  let paymentError: PaymentError;
  
  // 이미 PaymentError 타입인지 확인
  if (error.code && error.message && error.timestamp) {
    paymentError = error as PaymentError;
  } 
  // 결제 게이트웨이별 오류 매핑
  else if (provider === 'toss' && error.code) {
    paymentError = mapTossError(error.code, orderId, paymentId, error.details, error);
  } else if (provider === 'kakao' && error.code) {
    paymentError = mapKakaoError(error.code, orderId, paymentId, error.details, error);
  } 
  // 네트워크 오류 처리
  else if (error.name === 'AbortError' || error.name === 'TimeoutError') {
    paymentError = createPaymentError(
      PaymentErrorCode.TIMEOUT_ERROR,
      provider,
      orderId,
      paymentId,
      { errorName: error.name },
      error
    );
  } else if (error.name === 'NetworkError' || error.message?.includes('network')) {
    paymentError = createPaymentError(
      PaymentErrorCode.NETWORK_ERROR,
      provider,
      orderId,
      paymentId,
      { errorName: error.name },
      error
    );
  } 
  // 기타 오류
  else {
    paymentError = createPaymentError(
      PaymentErrorCode.UNKNOWN_ERROR,
      provider,
      orderId,
      paymentId,
      { errorMessage: error.message },
      error
    );
  }
  
  // 오류 로깅
  logPaymentError(paymentError);
  
  // 응답 생성
  return {
    success: false,
    error: getUserFriendlyErrorMessage(paymentError),
    code: paymentError.code,
    details: process.env.NODE_ENV === 'development' ? paymentError.details : undefined,
  };
};
