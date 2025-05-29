'use client';

import { getSessionItem, setSessionItem, removeSessionItem } from '@/lib/utils/storage-utils';
import { OrderInfo } from '@/hooks/useOrder';
import { CheckoutStep } from '@/hooks/useCheckout';

// 세션 스토리지 키
const ORDER_STORAGE_KEY = 'travel-order-storage';
const CHECKOUT_STORAGE_KEY = 'travel-checkout-storage';

// 체크아웃 상태 타입
interface CheckoutState {
  currentStep: CheckoutStep;
  stepsCompleted: Record<CheckoutStep, boolean>;
  requiredTravelers: {
    adult: number;
    child: number;
    infant: number;
  };
}

/**
 * 세션 스토리지에서 주문 정보 가져오기
 * @returns 저장된 주문 정보 또는 null
 */
export const getOrderFromSessionStorage = (): OrderInfo | null => {
  const data = getSessionItem<{ state: { orderInfo: OrderInfo } } | null>(
    ORDER_STORAGE_KEY,
    null
  );
  
  return data?.state?.orderInfo || null;
};

/**
 * 주문 정보를 세션 스토리지에 저장
 * @param orderInfo 저장할 주문 정보
 */
export const saveOrderToSessionStorage = (orderInfo: OrderInfo): void => {
  const existingData = getSessionItem<{ state: { orderInfo: OrderInfo } } | null>(
    ORDER_STORAGE_KEY,
    null
  );
  
  const newData = {
    state: {
      ...(existingData?.state || {}),
      orderInfo,
    },
  };
  
  setSessionItem(ORDER_STORAGE_KEY, newData);
};

/**
 * 세션 스토리지에서 체크아웃 상태 가져오기
 * @returns 저장된 체크아웃 상태 또는 null
 */
export const getCheckoutFromSessionStorage = (): CheckoutState | null => {
  const data = getSessionItem<{ state: CheckoutState } | null>(
    CHECKOUT_STORAGE_KEY,
    null
  );
  
  return data?.state || null;
};

/**
 * 체크아웃 상태를 세션 스토리지에 저장
 * @param checkoutState 저장할 체크아웃 상태
 */
export const saveCheckoutToSessionStorage = (checkoutState: CheckoutState): void => {
  setSessionItem(CHECKOUT_STORAGE_KEY, { state: checkoutState });
};

/**
 * 세션 스토리지에서 주문 정보 제거
 */
export const clearOrderFromSessionStorage = (): void => {
  removeSessionItem(ORDER_STORAGE_KEY);
};

/**
 * 세션 스토리지에서 체크아웃 상태 제거
 */
export const clearCheckoutFromSessionStorage = (): void => {
  removeSessionItem(CHECKOUT_STORAGE_KEY);
};

/**
 * 세션 스토리지에서 모든 체크아웃 관련 데이터 제거
 */
export const clearAllCheckoutData = (): void => {
  clearOrderFromSessionStorage();
  clearCheckoutFromSessionStorage();
};

/**
 * 체크아웃 데이터 복구 함수
 * 페이지 새로고침 후 데이터 복구에 사용
 * @returns 복구된 데이터 객체
 */
export const recoverCheckoutData = () => {
  const orderInfo = getOrderFromSessionStorage();
  const checkoutState = getCheckoutFromSessionStorage();
  
  return {
    orderInfo,
    checkoutState,
    hasData: !!(orderInfo || checkoutState)
  };
};
