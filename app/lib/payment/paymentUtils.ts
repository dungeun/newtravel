/**
 * 결제 관련 유틸리티 함수 모음
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';

// 결제 상태 정의
export enum PaymentStatus {
  READY = 'ready',
  IN_PROGRESS = 'in-progress',
  DONE = 'done',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
  FAILED = 'failed',
  VIRTUAL_ACCOUNT_ISSUED = 'virtual-account-issued',
  VIRTUAL_ACCOUNT_EXPIRED = 'virtual-account-expired',
}

// 결제 방법 정의
export enum PaymentMethod {
  CARD = 'card',
  VIRTUAL_ACCOUNT = 'virtual-account',
  PHONE = 'phone',
  TRANSFER = 'transfer',
  CULTURE_VOUCHER = 'culture-voucher',
  GIFT_CERTIFICATE = 'gift-certificate',
  POINT = 'point',
  KAKAO_PAY = 'kakao-pay',
  TOSS_PAY = 'toss-pay',
  NAVER_PAY = 'naver-pay',
  PAYCO = 'payco',
  SAMSUNG_PAY = 'samsung-pay',
}

// 결제 정보 인터페이스
export interface PaymentInfo {
  paymentId: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  method?: PaymentMethod;
  status: PaymentStatus;
  provider: 'toss' | 'kakao';
  providerPaymentId?: string;
  successUrl: string;
  failUrl: string;
  metadata?: Record<string, any>;
  createdAt: any;
  updatedAt: any;
}

/**
 * 결제 ID 생성
 */
export const generatePaymentId = (): string => {
  return `payment_${uuidv4().replace(/-/g, '')}`;
};

/**
 * 주문 ID 생성
 */
export const generateOrderId = (): string => {
  return `order_${uuidv4().replace(/-/g, '')}`;
};

/**
 * 결제 정보 생성
 */
export const createPaymentInfo = async (
  paymentInfo: Omit<PaymentInfo, 'createdAt' | 'updatedAt'>
): Promise<PaymentInfo> => {
  const paymentsRef = collection(db, 'payments');
  const paymentDocRef = doc(paymentsRef, paymentInfo.paymentId);
  
  const paymentData: PaymentInfo = {
    ...paymentInfo,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  await setDoc(paymentDocRef, paymentData);
  
  return paymentData;
};

/**
 * 결제 정보 조회 (결제 ID 기준)
 */
export const getPaymentInfo = async (paymentId: string): Promise<PaymentInfo | null> => {
  const paymentDocRef = doc(db, 'payments', paymentId);
  const paymentDoc = await getDoc(paymentDocRef);
  
  if (!paymentDoc.exists()) {
    return null;
  }
  
  return paymentDoc.data() as PaymentInfo;
};

/**
 * 결제 정보 조회 (ID 기준)
 */
export const getPaymentInfoById = async (paymentId: string): Promise<PaymentInfo | null> => {
  return getPaymentInfo(paymentId);
};

/**
 * 결제 상태 업데이트
 */
export const updatePaymentStatus = async (
  paymentId: string,
  status: PaymentStatus,
  providerPaymentId?: string | null,
  metadata?: Record<string, any>
): Promise<void> => {
  const paymentDocRef = doc(db, 'payments', paymentId);
  
  const updateData: Record<string, any> = {
    status,
    updatedAt: serverTimestamp(),
  };
  
  if (providerPaymentId) {
    updateData.providerPaymentId = providerPaymentId;
  }
  
  if (metadata) {
    // 기존 결제 정보 가져오기
    const paymentDoc = await getDoc(paymentDocRef);
    
    if (paymentDoc.exists()) {
      const existingData = paymentDoc.data();
      updateData.metadata = {
        ...existingData.metadata || {},
        ...metadata,
      };
    } else {
      updateData.metadata = {
        ...metadata,
      };
    }
  }
  
  await updateDoc(paymentDocRef, updateData);
};

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
 * 결제 URL 생성 (개발 환경용)
 */
export const getCallbackUrls = (baseUrl: string, paymentId: string) => {
  // 개발 환경에서는 localhost URL 사용
  const isDev = process.env.NODE_ENV === 'development';
  const host = isDev ? 'http://localhost:3000' : baseUrl;
  
  return {
    successUrl: `${host}/travel/payment/success?paymentId=${paymentId}`,
    failUrl: `${host}/travel/payment/fail?paymentId=${paymentId}`,
    callbackUrl: `${host}/api/payments/webhook`,
  };
};

/**
 * 결제 에러 로깅
 */
export const logPaymentError = (
  paymentId: string,
  errorCode: string,
  errorMessage: string,
  errorDetails?: any
): void => {
  console.error(`Payment Error [${paymentId}]: ${errorCode} - ${errorMessage}`, errorDetails);
  // 실제 프로덕션 환경에서는 로깅 서비스 사용 (예: Sentry, Datadog 등)
};
