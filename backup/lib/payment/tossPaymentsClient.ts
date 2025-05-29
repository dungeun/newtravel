/**
 * Toss Payments API 클라이언트
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { logger } from '@/lib/logger';
import { PaymentErrorCode } from '@/lib/payment/errorHandling';

// Toss Payments API 기본 URL
const TOSS_API_BASE_URL = 'https://api.tosspayments.com/v1';

// Toss Payments 결제 요청 인터페이스
export interface TossPaymentRequest {
  amount: number;
  orderId: string;
  orderName: string;
  customerName: string;
  customerEmail?: string;
  successUrl: string;
  failUrl: string;
  cardOptions?: {
    cardCompany?: string;
    cardType?: string;
    installmentPlanMonths?: number;
  };
  virtualAccountOptions?: {
    validHours?: number;
    dueDate?: string;
    bankCode?: string;
    customerMobilePhone?: string;
    useEscrow?: boolean;
    escrowProducts?: Array<{
      id: string;
      name: string;
      code?: string;
      unitPrice: number;
      quantity: number;
    }>;
  };
  mobilePhoneOptions?: {
    customerMobilePhone: string;
  };
  cashReceiptOptions?: {
    type: 'PERSONAL' | 'BUSINESS' | 'NONE';
    customerIdentityNumber?: string;
  };
  useInternationalCardOnly?: boolean;
  flowMode?: 'DEFAULT' | 'DIRECT';
  easyPay?: string;
  taxFreeAmount?: number;
  cultureExpense?: boolean;
}

// Toss Payments 결제 응답 인터페이스
export interface TossPaymentResponse {
  paymentKey: string;
  orderId: string;
  orderName: string;
  status: string;
  requestedAt: string;
  approvedAt?: string;
  useEscrow: boolean;
  cultureExpense: boolean;
  card?: {
    company: string;
    number: string;
    installmentPlanMonths: number;
    isInterestFree: boolean;
    approveNo: string;
    useCardPoint: boolean;
    cardType: string;
    ownerType: string;
    acquireStatus: string;
    receiptUrl: string;
  };
  virtualAccount?: {
    accountType: string;
    accountNumber: string;
    bankCode: string;
    customerName: string;
    dueDate: string;
    refundStatus: string;
    expired: boolean;
    settlementStatus: string;
  };
  mobilePhone?: {
    customerMobilePhone: string;
    settlementStatus: string;
    receiptUrl: string;
  };
  giftCertificate?: {
    approveNo: string;
    settlementStatus: string;
  };
  transfer?: {
    bankCode: string;
    settlementStatus: string;
  };
  receipt?: {
    url: string;
  };
  checkout?: {
    url: string;
  };
  currency: string;
  totalAmount: number;
  balanceAmount: number;
  suppliedAmount: number;
  vat: number;
  taxFreeAmount: number;
  method: string;
  version: string;
}

// Toss Payments 결제 확인 응답 인터페이스
export interface TossPaymentConfirmResponse extends TossPaymentResponse {
  secret?: string;
  type: string;
  country: string;
  failure?: {
    code: string;
    message: string;
  };
  cancels?: Array<{
    cancelAmount: number;
    cancelReason: string;
    taxFreeAmount: number;
    taxAmount: number;
    refundableAmount: number;
    canceledAt: string;
  }>;
  cashReceipt?: {
    receiptKey: string;
    type: string;
    amount: number;
    taxFreeAmount: number;
    issueNumber: string;
    receiptUrl: string;
  };
  discount?: {
    amount: number;
  };
}

/**
 * Toss Payments API 클라이언트 클래스
 */
export class TossPaymentsClient {
  private secretKey: string;
  private timeout: number;
  
  constructor(secretKey: string, timeout: number = 10000) {
    this.secretKey = secretKey;
    this.timeout = timeout; // 타임아웃 기본값 10초
  }
  
  /**
   * 결제 승인 요청
   */
  async confirmPayment(paymentKey: string, orderId: string, amount: number): Promise<TossPaymentConfirmResponse> {
    try {
      logger.info('Toss 결제 승인 요청', {
        paymentKey: paymentKey.substring(0, 8) + '...',
        orderId,
        amount
      }, 'TOSS_API');
      
      const config: AxiosRequestConfig = {
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.secretKey}:`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        timeout: this.timeout
      };
      
      const response = await axios.post(
        `${TOSS_API_BASE_URL}/payments/${paymentKey}`,
        { orderId, amount },
        config
      );
      
      logger.info('Toss 결제 승인 성공', {
        paymentKey: paymentKey.substring(0, 8) + '...',
        orderId,
        status: response.data.status
      }, 'TOSS_API');
      
      return response.data;
    } catch (error: any) {
      // 에러 로깅 및 처리
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        // 타임아웃 오류 처리
        if (axiosError.code === 'ECONNABORTED') {
          logger.error('Toss 결제 승인 타임아웃', {
            paymentKey: paymentKey.substring(0, 8) + '...',
            orderId,
            timeout: this.timeout
          }, 'TOSS_API');
          
          throw new Error(
            JSON.stringify({
              code: PaymentErrorCode.TIMEOUT_ERROR,
              message: '결제 승인 요청 시간이 초과되었습니다.',
              status: 408
            })
          );
        }
        
        // 서버 응답 오류 처리
        if (axiosError.response) {
          const errorData = axiosError.response.data as Record<string, any>;
          const errorCode = errorData.code || 'UNKNOWN_ERROR';
          const errorMessage = errorData.message || '알 수 없는 오류가 발생했습니다.';
          
          logger.error('Toss 결제 승인 오류', {
            paymentKey: paymentKey.substring(0, 8) + '...',
            orderId,
            errorCode,
            errorMessage,
            status: axiosError.response.status
          }, 'TOSS_API');
          
          throw new Error(
            JSON.stringify({
              code: errorCode,
              message: errorMessage,
              status: axiosError.response.status
            })
          );
        }
        
        // 네트워크 오류 처리
        if (axiosError.request && !axiosError.response) {
          logger.error('Toss 결제 승인 네트워크 오류', {
            paymentKey: paymentKey.substring(0, 8) + '...',
            orderId,
            error: axiosError.message
          }, 'TOSS_API');
          
          throw new Error(
            JSON.stringify({
              code: PaymentErrorCode.NETWORK_ERROR,
              message: '네트워크 연결 오류가 발생했습니다.',
              status: 0
            })
          );
        }
      }
      
      // 기타 예상치 못한 오류 처리
      logger.error('Toss 결제 승인 중 예상치 못한 오류', {
        paymentKey: paymentKey.substring(0, 8) + '...',
        orderId,
        error: error.message,
        stack: error.stack
      }, 'TOSS_API');
      
      throw error;
    }
  }
  
  /**
   * 결제 취소 요청
   */
  async cancelPayment(
    paymentKey: string,
    cancelReason: string,
    cancelAmount?: number,
    refundReceiveAccount?: {
      bank: string;
      accountNumber: string;
      holderName: string;
    }
  ): Promise<TossPaymentResponse> {
    try {
      logger.info('Toss 결제 취소 요청', {
        paymentKey: paymentKey.substring(0, 8) + '...',
        cancelReason,
        cancelAmount
      }, 'TOSS_API');
      
      const payload: Record<string, any> = {
        cancelReason,
      };
      
      if (cancelAmount) {
        payload.cancelAmount = cancelAmount;
      }
      
      if (refundReceiveAccount) {
        payload.refundReceiveAccount = refundReceiveAccount;
      }
      
      const config: AxiosRequestConfig = {
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.secretKey}:`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        timeout: this.timeout
      };
      
      const response = await axios.post(
        `${TOSS_API_BASE_URL}/payments/${paymentKey}/cancel`,
        payload,
        config
      );
      
      logger.info('Toss 결제 취소 성공', {
        paymentKey: paymentKey.substring(0, 8) + '...',
        status: response.data.status
      }, 'TOSS_API');
      
      return response.data;
    } catch (error: any) {
      // 에러 로깅 및 처리
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        // 타임아웃 오류 처리
        if (axiosError.code === 'ECONNABORTED') {
          logger.error('Toss 결제 취소 타임아웃', {
            paymentKey: paymentKey.substring(0, 8) + '...',
            timeout: this.timeout
          }, 'TOSS_API');
          
          throw new Error(
            JSON.stringify({
              code: PaymentErrorCode.TIMEOUT_ERROR,
              message: '결제 취소 요청 시간이 초과되었습니다.',
              status: 408
            })
          );
        }
        
        // 서버 응답 오류 처리
        if (axiosError.response) {
          const errorData = axiosError.response.data as Record<string, any>;
          const errorCode = errorData.code || 'UNKNOWN_ERROR';
          const errorMessage = errorData.message || '알 수 없는 오류가 발생했습니다.';
          
          logger.error('Toss 결제 취소 오류', {
            paymentKey: paymentKey.substring(0, 8) + '...',
            errorCode,
            errorMessage,
            status: axiosError.response.status
          }, 'TOSS_API');
          
          throw new Error(
            JSON.stringify({
              code: errorCode,
              message: errorMessage,
              status: axiosError.response.status
            })
          );
        }
        
        // 네트워크 오류 처리
        if (axiosError.request && !axiosError.response) {
          logger.error('Toss 결제 취소 네트워크 오류', {
            paymentKey: paymentKey.substring(0, 8) + '...',
            error: axiosError.message
          }, 'TOSS_API');
          
          throw new Error(
            JSON.stringify({
              code: PaymentErrorCode.NETWORK_ERROR,
              message: '네트워크 연결 오류가 발생했습니다.',
              status: 0
            })
          );
        }
      }
      
      // 기타 예상치 못한 오류 처리
      logger.error('Toss 결제 취소 중 예상치 못한 오류', {
        paymentKey: paymentKey.substring(0, 8) + '...',
        error: error.message,
        stack: error.stack
      }, 'TOSS_API');
      
      throw error;
    }
  }
  
  // 결제 조회 요청은 아래의 개선된 결제 정보 조회 메서드로 대체됨
  
  /**
   * 결제 정보 조회
   */
  async getPayment(paymentKey: string): Promise<TossPaymentResponse> {
    try {
      logger.info('Toss 결제 정보 조회 요청', {
        paymentKey: paymentKey.substring(0, 8) + '...'
      }, 'TOSS_API');
      
      const config: AxiosRequestConfig = {
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.secretKey}:`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        timeout: this.timeout
      };
      
      const response = await axios.get(
        `${TOSS_API_BASE_URL}/payments/${paymentKey}`,
        config
      );
      
      logger.info('Toss 결제 정보 조회 성공', {
        paymentKey: paymentKey.substring(0, 8) + '...',
        status: response.data.status
      }, 'TOSS_API');
      
      return response.data;
    } catch (error: any) {
      // 에러 로깅 및 처리
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        // 타임아웃 오류 처리
        if (axiosError.code === 'ECONNABORTED') {
          logger.error('Toss 결제 정보 조회 타임아웃', {
            paymentKey: paymentKey.substring(0, 8) + '...',
            timeout: this.timeout
          }, 'TOSS_API');
          
          throw new Error(
            JSON.stringify({
              code: PaymentErrorCode.TIMEOUT_ERROR,
              message: '결제 정보 조회 요청 시간이 초과되었습니다.',
              status: 408
            })
          );
        }
        
        // 서버 응답 오류 처리
        if (axiosError.response) {
          const errorData = axiosError.response.data as Record<string, any>;
          const errorCode = errorData.code || 'UNKNOWN_ERROR';
          const errorMessage = errorData.message || '알 수 없는 오류가 발생했습니다.';
          
          logger.error('Toss 결제 정보 조회 오류', {
            paymentKey: paymentKey.substring(0, 8) + '...',
            errorCode,
            errorMessage,
            status: axiosError.response.status
          }, 'TOSS_API');
          
          throw new Error(
            JSON.stringify({
              code: errorCode,
              message: errorMessage,
              status: axiosError.response.status
            })
          );
        }
        
        // 네트워크 오류 처리
        if (axiosError.request && !axiosError.response) {
          logger.error('Toss 결제 정보 조회 네트워크 오류', {
            paymentKey: paymentKey.substring(0, 8) + '...',
            error: axiosError.message
          }, 'TOSS_API');
          
          throw new Error(
            JSON.stringify({
              code: PaymentErrorCode.NETWORK_ERROR,
              message: '네트워크 연결 오류가 발생했습니다.',
              status: 0
            })
          );
        }
      }
      
      // 기타 예상치 못한 오류 처리
      logger.error('Toss 결제 정보 조회 중 예상치 못한 오류', {
        paymentKey: paymentKey.substring(0, 8) + '...',
        error: error.message,
        stack: error.stack
      }, 'TOSS_API');
      
      throw error;
    }
  }
}

/**
 * Toss Payments 클라이언트 인스턴스 생성
 */
export const createTossPaymentsClient = (): TossPaymentsClient => {
  const secretKey = process.env.TOSS_PAYMENTS_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error('TOSS_PAYMENTS_SECRET_KEY 환경 변수가 설정되지 않았습니다.');
  }
  
  return new TossPaymentsClient(secretKey);
};
