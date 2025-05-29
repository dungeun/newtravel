/**
 * KakaoPay API 클라이언트
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { logger } from '@/lib/logger';
import { PaymentErrorCode } from '@/lib/payment/errorHandling';

// KakaoPay API 기본 URL
const KAKAO_API_BASE_URL = 'https://kapi.kakao.com/v1/payment';

// KakaoPay 결제 준비 요청 인터페이스
export interface KakaoPayReadyRequest {
  cid: string; // 가맹점 코드
  partner_order_id: string; // 가맹점 주문번호
  partner_user_id: string; // 가맹점 회원 ID
  item_name: string; // 상품명
  quantity: number; // 상품 수량
  total_amount: number; // 총 금액
  tax_free_amount: number; // 비과세 금액
  approval_url: string; // 결제 성공 시 redirect URL
  cancel_url: string; // 결제 취소 시 redirect URL
  fail_url: string; // 결제 실패 시 redirect URL
  available_cards?: string[]; // 사용 가능 카드 설정
  payment_method_type?: string; // 결제 수단 설정
  install_month?: number; // 카드 할부 개월 수
  custom_json?: Record<string, any>; // 추가 정보
}

// KakaoPay 결제 준비 응답 인터페이스
export interface KakaoPayReadyResponse {
  tid: string; // 결제 고유 번호
  next_redirect_app_url: string; // 모바일 앱 결제 URL
  next_redirect_mobile_url: string; // 모바일 웹 결제 URL
  next_redirect_pc_url: string; // PC 웹 결제 URL
  android_app_scheme: string; // 안드로이드 앱 스킴
  ios_app_scheme: string; // iOS 앱 스킴
  created_at: string; // 결제 준비 요청 시간
}

// KakaoPay 결제 승인 요청 인터페이스
export interface KakaoPayApproveRequest {
  cid: string; // 가맹점 코드
  tid: string; // 결제 고유 번호
  partner_order_id: string; // 가맹점 주문번호
  partner_user_id: string; // 가맹점 회원 ID
  pg_token: string; // 결제 승인 요청 토큰
  payload?: string; // 결제 승인 요청 시 전달할 데이터
  total_amount?: number; // 총 금액 검증용
}

// KakaoPay 결제 승인 응답 인터페이스
export interface KakaoPayApproveResponse {
  aid: string; // 요청 고유 번호
  tid: string; // 결제 고유 번호
  cid: string; // 가맹점 코드
  sid: string; // 정기 결제용 ID
  partner_order_id: string; // 가맹점 주문번호
  partner_user_id: string; // 가맹점 회원 ID
  payment_method_type: string; // 결제 수단
  amount: {
    total: number; // 총 금액
    tax_free: number; // 비과세 금액
    vat: number; // 부가세 금액
    point: number; // 사용한 포인트 금액
    discount: number; // 할인 금액
    green_deposit: number; // 환경보증금
  };
  card_info?: {
    purchase_corp: string; // 매입 카드사
    purchase_corp_code: string; // 매입 카드사 코드
    issuer_corp: string; // 카드 발급사
    issuer_corp_code: string; // 카드 발급사 코드
    kakaopay_purchase_corp: string; // 카카오페이 매입사
    kakaopay_purchase_corp_code: string; // 카카오페이 매입사 코드
    kakaopay_issuer_corp: string; // 카카오페이 발급사
    kakaopay_issuer_corp_code: string; // 카카오페이 발급사 코드
    bin: string; // 카드 BIN
    card_type: string; // 카드 타입
    install_month: string; // 할부 개월 수
    approved_id: string; // 카드사 승인번호
    card_mid: string; // 카드사 가맹점 번호
    interest_free_install: string; // 무이자 할부 여부
    card_item_code: string; // 카드 상품 코드
  };
  item_name: string; // 상품명
  item_code: string; // 상품 코드
  quantity: number; // 상품 수량
  created_at: string; // 결제 준비 요청 시간
  approved_at: string; // 결제 승인 시간
  payload?: string; // 결제 승인 요청 시 전달한 데이터
}

// KakaoPay 결제 취소 요청 인터페이스
export interface KakaoPayCancelRequest {
  cid: string; // 가맹점 코드
  tid: string; // 결제 고유 번호
  cancel_amount: number; // 취소 금액
  cancel_tax_free_amount: number; // 취소 비과세 금액
  payload?: string; // 취소 요청 시 전달할 데이터
}

// KakaoPay 결제 취소 응답 인터페이스
export interface KakaoPayCancelResponse {
  aid: string; // 요청 고유 번호
  tid: string; // 결제 고유 번호
  cid: string; // 가맹점 코드
  status: string; // 결제 상태
  partner_order_id: string; // 가맹점 주문번호
  partner_user_id: string; // 가맹점 회원 ID
  payment_method_type: string; // 결제 수단
  amount: {
    total: number; // 총 금액
    tax_free: number; // 비과세 금액
    vat: number; // 부가세 금액
    point: number; // 사용한 포인트 금액
    discount: number; // 할인 금액
    green_deposit: number; // 환경보증금
  };
  approved_cancel_amount: {
    total: number; // 취소된 총 금액
    tax_free: number; // 취소된 비과세 금액
    vat: number; // 취소된 부가세 금액
    point: number; // 취소된 포인트 금액
    discount: number; // 취소된 할인 금액
    green_deposit: number; // 취소된 환경보증금
  };
  canceled_amount: {
    total: number; // 누계 취소 금액
    tax_free: number; // 누계 취소 비과세 금액
    vat: number; // 누계 취소 부가세 금액
    point: number; // 누계 취소 포인트 금액
    discount: number; // 누계 취소 할인 금액
    green_deposit: number; // 누계 취소 환경보증금
  };
  cancel_available_amount: {
    total: number; // 취소 가능 금액
    tax_free: number; // 취소 가능 비과세 금액
    vat: number; // 취소 가능 부가세 금액
    point: number; // 취소 가능 포인트 금액
    discount: number; // 취소 가능 할인 금액
    green_deposit: number; // 취소 가능 환경보증금
  };
  item_name: string; // 상품명
  item_code: string; // 상품 코드
  quantity: number; // 상품 수량
  created_at: string; // 결제 준비 요청 시간
  approved_at: string; // 결제 승인 시간
  canceled_at: string; // 결제 취소 시간
  payload?: string; // 취소 요청 시 전달한 데이터
}

// KakaoPay 결제 조회 응답 인터페이스
export interface KakaoPayOrderResponse {
  tid: string; // 결제 고유 번호
  cid: string; // 가맹점 코드
  status: string; // 결제 상태
  partner_order_id: string; // 가맹점 주문번호
  partner_user_id: string; // 가맹점 회원 ID
  payment_method_type: string; // 결제 수단
  amount: {
    total: number; // 총 금액
    tax_free: number; // 비과세 금액
    vat: number; // 부가세 금액
    point: number; // 사용한 포인트 금액
    discount: number; // 할인 금액
    green_deposit: number; // 환경보증금
  };
  canceled_amount: {
    total: number; // 누계 취소 금액
    tax_free: number; // 누계 취소 비과세 금액
    vat: number; // 누계 취소 부가세 금액
    point: number; // 누계 취소 포인트 금액
    discount: number; // 누계 취소 할인 금액
    green_deposit: number; // 누계 취소 환경보증금
  };
  cancel_available_amount: {
    total: number; // 취소 가능 금액
    tax_free: number; // 취소 가능 비과세 금액
    vat: number; // 취소 가능 부가세 금액
    point: number; // 취소 가능 포인트 금액
    discount: number; // 취소 가능 할인 금액
    green_deposit: number; // 취소 가능 환경보증금
  };
  item_name: string; // 상품명
  item_code: string; // 상품 코드
  quantity: number; // 상품 수량
  created_at: string; // 결제 준비 요청 시간
  approved_at: string; // 결제 승인 시간
  canceled_at: string; // 결제 취소 시간
  payload?: string; // 요청 시 전달한 데이터
}

/**
 * KakaoPay API 클라이언트 클래스
 */
export class KakaoPayClient {
  private adminKey: string;
  private cid: string;
  private timeout: number;
  
  constructor(adminKey: string, cid: string, timeout: number = 10000) {
    this.adminKey = adminKey;
    this.cid = cid;
    this.timeout = timeout; // 타임아웃 기본값 10초
  }
  
  /**
   * 결제 준비 요청
   */
  async ready(request: Omit<KakaoPayReadyRequest, 'cid'>): Promise<KakaoPayReadyResponse> {
    try {
      logger.info('KakaoPay 결제 준비 요청', {
        partnerOrderId: request.partner_order_id,
        partnerUserId: request.partner_user_id,
        itemName: request.item_name,
        totalAmount: request.total_amount
      }, 'KAKAO_API');
      
      const payload = {
        cid: this.cid,
        ...request
      };
      
      const config: AxiosRequestConfig = {
        headers: {
          Authorization: `KakaoAK ${this.adminKey}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
        timeout: this.timeout
      };
      
      const response = await axios.post(
        `${KAKAO_API_BASE_URL}/ready`,
        payload,
        config
      );
      
      logger.info('KakaoPay 결제 준비 성공', {
        partnerOrderId: request.partner_order_id,
        tid: response.data.tid
      }, 'KAKAO_API');
      
      return response.data;
    } catch (error: any) {
      // 에러 로깅 및 처리
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        // 타임아웃 오류 처리
        if (axiosError.code === 'ECONNABORTED') {
          logger.error('KakaoPay 결제 준비 타임아웃', {
            partnerOrderId: request.partner_order_id,
            timeout: this.timeout
          }, 'KAKAO_API');
          
          throw new Error(
            JSON.stringify({
              code: PaymentErrorCode.TIMEOUT_ERROR,
              message: '결제 준비 요청 시간이 초과되었습니다.',
              status: 408
            })
          );
        }
        
        // 서버 응답 오류 처리
        if (axiosError.response) {
          const errorData = axiosError.response.data as Record<string, any>;
          const errorCode = errorData.code || 'UNKNOWN_ERROR';
          const errorMessage = errorData.msg || '알 수 없는 오류가 발생했습니다.';
          
          logger.error('KakaoPay 결제 준비 오류', {
            partnerOrderId: request.partner_order_id,
            errorCode,
            errorMessage,
            status: axiosError.response.status
          }, 'KAKAO_API');
          
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
          logger.error('KakaoPay 결제 준비 네트워크 오류', {
            partnerOrderId: request.partner_order_id,
            error: axiosError.message
          }, 'KAKAO_API');
          
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
      logger.error('KakaoPay 결제 준비 중 예상치 못한 오류', {
        partnerOrderId: request.partner_order_id,
        error: error.message,
        stack: error.stack
      }, 'KAKAO_API');
      
      throw error;
    }
  }
  
  /**
   * 결제 승인 요청
   */
  async approve(request: Omit<KakaoPayApproveRequest, 'cid'>): Promise<KakaoPayApproveResponse> {
    try {
      logger.info('KakaoPay 결제 승인 요청', {
        tid: request.tid.substring(0, 8) + '...',
        partnerOrderId: request.partner_order_id,
        partnerUserId: request.partner_user_id
      }, 'KAKAO_API');
      
      const payload = {
        cid: this.cid,
        ...request
      };
      
      const config: AxiosRequestConfig = {
        headers: {
          Authorization: `KakaoAK ${this.adminKey}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
        timeout: this.timeout
      };
      
      const response = await axios.post(
        `${KAKAO_API_BASE_URL}/approve`,
        payload,
        config
      );
      
      logger.info('KakaoPay 결제 승인 성공', {
        tid: request.tid.substring(0, 8) + '...',
        partnerOrderId: request.partner_order_id,
        amount: response.data.amount.total
      }, 'KAKAO_API');
      
      return response.data;
    } catch (error: any) {
      // 에러 로깅 및 처리
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        // 타임아웃 오류 처리
        if (axiosError.code === 'ECONNABORTED') {
          logger.error('KakaoPay 결제 승인 타임아웃', {
            tid: request.tid.substring(0, 8) + '...',
            partnerOrderId: request.partner_order_id,
            timeout: this.timeout
          }, 'KAKAO_API');
          
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
          const errorMessage = errorData.msg || '알 수 없는 오류가 발생했습니다.';
          
          logger.error('KakaoPay 결제 승인 오류', {
            tid: request.tid.substring(0, 8) + '...',
            partnerOrderId: request.partner_order_id,
            errorCode,
            errorMessage,
            status: axiosError.response.status
          }, 'KAKAO_API');
          
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
          logger.error('KakaoPay 결제 승인 네트워크 오류', {
            tid: request.tid.substring(0, 8) + '...',
            partnerOrderId: request.partner_order_id,
            error: axiosError.message
          }, 'KAKAO_API');
          
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
      logger.error('KakaoPay 결제 승인 중 예상치 못한 오류', {
        tid: request.tid.substring(0, 8) + '...',
        partnerOrderId: request.partner_order_id,
        error: error.message,
        stack: error.stack
      }, 'KAKAO_API');
      
      throw error;
    }
  }
  
  /**
   * 결제 취소 요청
   */
  async cancel(request: Omit<KakaoPayCancelRequest, 'cid'>): Promise<KakaoPayCancelResponse> {
    try {
      logger.info('KakaoPay 결제 취소 요청', {
        tid: request.tid.substring(0, 8) + '...',
        cancelAmount: request.cancel_amount,
        cancelTaxFreeAmount: request.cancel_tax_free_amount
      }, 'KAKAO_API');
      
      const payload = {
        cid: this.cid,
        ...request
      };
      
      const config: AxiosRequestConfig = {
        headers: {
          Authorization: `KakaoAK ${this.adminKey}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
        timeout: this.timeout
      };
      
      const response = await axios.post(
        `${KAKAO_API_BASE_URL}/cancel`,
        payload,
        config
      );
      
      logger.info('KakaoPay 결제 취소 성공', {
        tid: request.tid.substring(0, 8) + '...',
        cancelAmount: request.cancel_amount,
        status: response.data.status
      }, 'KAKAO_API');
      
      return response.data;
    } catch (error: any) {
      // 에러 로깅 및 처리
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        // 타임아웃 오류 처리
        if (axiosError.code === 'ECONNABORTED') {
          logger.error('KakaoPay 결제 취소 타임아웃', {
            tid: request.tid.substring(0, 8) + '...',
            timeout: this.timeout
          }, 'KAKAO_API');
          
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
          const errorMessage = errorData.msg || '알 수 없는 오류가 발생했습니다.';
          
          logger.error('KakaoPay 결제 취소 오류', {
            tid: request.tid.substring(0, 8) + '...',
            errorCode,
            errorMessage,
            status: axiosError.response.status
          }, 'KAKAO_API');
          
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
          logger.error('KakaoPay 결제 취소 네트워크 오류', {
            tid: request.tid.substring(0, 8) + '...',
            error: axiosError.message
          }, 'KAKAO_API');
          
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
      logger.error('KakaoPay 결제 취소 중 예상치 못한 오류', {
        tid: request.tid.substring(0, 8) + '...',
        error: error.message,
        stack: error.stack
      }, 'KAKAO_API');
      
      throw error;
    }
  }
  
  // 결제 조회 요청은 아래의 개선된 결제 정보 조회 메서드로 대체됨
  
  /**
   * 결제 정보 조회
   */
  async getOrder(tid: string): Promise<KakaoPayOrderResponse> {
    try {
      logger.info('KakaoPay 결제 정보 조회 요청', {
        tid: tid.substring(0, 8) + '...'
      }, 'KAKAO_API');
      
      const config: AxiosRequestConfig = {
        headers: {
          Authorization: `KakaoAK ${this.adminKey}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
        timeout: this.timeout
      };
      
      const response = await axios.get(
        `${KAKAO_API_BASE_URL}/order`,
        {
          ...config,
          params: {
            cid: this.cid,
            tid: tid
          }
        }
      );
      
      logger.info('KakaoPay 결제 정보 조회 성공', {
        tid: tid.substring(0, 8) + '...',
        status: response.data.status
      }, 'KAKAO_API');
      
      return response.data;
    } catch (error: any) {
      // 에러 로깅 및 처리
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        // 타임아웃 오류 처리
        if (axiosError.code === 'ECONNABORTED') {
          logger.error('KakaoPay 결제 정보 조회 타임아웃', {
            tid: tid.substring(0, 8) + '...',
            timeout: this.timeout
          }, 'KAKAO_API');
          
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
          const errorMessage = errorData.msg || '알 수 없는 오류가 발생했습니다.';
          
          logger.error('KakaoPay 결제 정보 조회 오류', {
            tid: tid.substring(0, 8) + '...',
            errorCode,
            errorMessage,
            status: axiosError.response.status
          }, 'KAKAO_API');
          
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
          logger.error('KakaoPay 결제 정보 조회 네트워크 오류', {
            tid: tid.substring(0, 8) + '...',
            error: axiosError.message
          }, 'KAKAO_API');
          
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
      logger.error('KakaoPay 결제 정보 조회 중 예상치 못한 오류', {
        tid: tid.substring(0, 8) + '...',
        error: error.message,
        stack: error.stack
      }, 'KAKAO_API');
      
      throw error;
    }
  }
}

/**
 * KakaoPay 클라이언트 인스턴스 생성
 */
export const createKakaoPayClient = (): KakaoPayClient => {
  const adminKey = process.env.KAKAO_ADMIN_KEY;
  const cid = process.env.KAKAO_CID || 'TC0ONETIME'; // 테스트용 CID
  
  if (!adminKey) {
    throw new Error('KAKAO_ADMIN_KEY 환경 변수가 설정되지 않았습니다.');
  }
  
  return new KakaoPayClient(adminKey, cid);
};
