'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem } from '@/hooks/useCart';

// 주문자 정보 타입
export interface OrdererInfo {
  name: string;
  email: string;
  phone: string;
  isAgreeToTerms: boolean;
}

// 여행자 정보 타입
export interface TravelerInfo {
  id: string;
  name: string;
  birthdate: string;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  email?: string;
  passportNumber?: string;
  passportExpiry?: string;
  nationality?: string;
  specialRequests?: string;
}

// 주문 정보 타입
export interface OrderInfo {
  orderId?: string;
  orderNumber?: string;
  ordererInfo: OrdererInfo;
  travelers: TravelerInfo[];
  items: CartItem[];
  specialRequests?: string;
  paymentMethod?: 'card' | 'kakaopay' | 'tosspay' | 'bank';
  subtotal: number;
  discountAmount: number;
  tax: number;
  total: number;
}

// 주문 스토어 상태 타입
interface OrderState {
  orderInfo: OrderInfo;
  validationErrors: Record<string, string>;
  
  // 주문자 정보 업데이트
  updateOrdererInfo: (info: Partial<OrdererInfo>) => void;
  
  // 여행자 정보 추가
  addTraveler: (traveler: TravelerInfo) => void;
  
  // 여행자 정보 업데이트
  updateTraveler: (id: string, info: Partial<TravelerInfo>) => void;
  
  // 여행자 정보 삭제
  removeTraveler: (id: string) => void;
  
  // 장바구니 항목 설정
  setItems: (items: CartItem[]) => void;
  
  // 특별 요청사항 업데이트
  updateSpecialRequests: (requests: string) => void;
  
  // 결제 방법 설정
  setPaymentMethod: (method: 'card' | 'kakaopay' | 'tosspay' | 'bank') => void;
  
  // 주문 금액 계산 및 업데이트
  updateOrderAmounts: () => void;
  
  // 주문 정보 유효성 검사
  validateOrderInfo: () => boolean;
  
  // 주문 정보 초기화
  resetOrderInfo: () => void;
}

// 초기 상태
const initialOrderInfo: OrderInfo = {
  ordererInfo: {
    name: '',
    email: '',
    phone: '',
    isAgreeToTerms: false,
  },
  travelers: [],
  items: [],
  subtotal: 0,
  discountAmount: 0,
  tax: 0,
  total: 0,
};

// useOrder 스토어 생성
export const useOrder = create<OrderState>()(
  persist(
    (set, get) => ({
      orderInfo: initialOrderInfo,
      validationErrors: {},
      
      // 주문자 정보 업데이트
      updateOrdererInfo: (info) => {
        set((state) => ({
          orderInfo: {
            ...state.orderInfo,
            ordererInfo: {
              ...state.orderInfo.ordererInfo,
              ...info,
            },
          },
        }));
      },
      
      // 여행자 정보 추가
      addTraveler: (traveler) => {
        set((state) => ({
          orderInfo: {
            ...state.orderInfo,
            travelers: [...state.orderInfo.travelers, traveler],
          },
        }));
      },
      
      // 여행자 정보 업데이트
      updateTraveler: (id, info) => {
        set((state) => ({
          orderInfo: {
            ...state.orderInfo,
            travelers: state.orderInfo.travelers.map((traveler) =>
              traveler.id === id ? { ...traveler, ...info } : traveler
            ),
          },
        }));
      },
      
      // 여행자 정보 삭제
      removeTraveler: (id) => {
        set((state) => ({
          orderInfo: {
            ...state.orderInfo,
            travelers: state.orderInfo.travelers.filter(
              (traveler) => traveler.id !== id
            ),
          },
        }));
      },
      
      // 장바구니 항목 설정
      setItems: (items) => {
        set((state) => ({
          orderInfo: {
            ...state.orderInfo,
            items,
          },
        }));
        
        // 금액 업데이트
        get().updateOrderAmounts();
      },
      
      // 특별 요청사항 업데이트
      updateSpecialRequests: (requests) => {
        set((state) => ({
          orderInfo: {
            ...state.orderInfo,
            specialRequests: requests,
          },
        }));
      },
      
      // 결제 방법 설정
      setPaymentMethod: (method) => {
        set((state) => ({
          orderInfo: {
            ...state.orderInfo,
            paymentMethod: method,
          },
        }));
      },
      
      // 주문 금액 계산 및 업데이트
      updateOrderAmounts: () => {
        const { items } = get().orderInfo;
        
        // 소계 계산
        const subtotal = items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
        
        // 할인 금액 (예시: 할인 없음)
        const discountAmount = 0;
        
        // 세금 (예시: 세금 없음)
        const tax = 0;
        
        // 총액 계산
        const total = subtotal - discountAmount + tax;
        
        set((state) => ({
          orderInfo: {
            ...state.orderInfo,
            subtotal,
            discountAmount,
            tax,
            total,
          },
        }));
      },
      
      // 주문 정보 유효성 검사
      validateOrderInfo: () => {
        const { ordererInfo, travelers, items, paymentMethod } = get().orderInfo;
        const errors: Record<string, string> = {};
        
        // 주문자 정보 검증
        if (!ordererInfo.name) {
          errors['ordererName'] = '주문자 이름을 입력해주세요.';
        }
        
        if (!ordererInfo.email) {
          errors['ordererEmail'] = '이메일을 입력해주세요.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ordererInfo.email)) {
          errors['ordererEmail'] = '유효한 이메일 형식이 아닙니다.';
        }
        
        if (!ordererInfo.phone) {
          errors['ordererPhone'] = '연락처를 입력해주세요.';
        } else if (!/^\d{10,11}$/.test(ordererInfo.phone.replace(/-/g, ''))) {
          errors['ordererPhone'] = '유효한 전화번호 형식이 아닙니다.';
        }
        
        if (!ordererInfo.isAgreeToTerms) {
          errors['agreeToTerms'] = '이용약관에 동의해주세요.';
        }
        
        // 여행자 정보 검증
        if (travelers.length === 0) {
          errors['travelers'] = '최소 1명 이상의 여행자 정보가 필요합니다.';
        } else {
          travelers.forEach((traveler, index) => {
            if (!traveler.name) {
              errors[`traveler${index}Name`] = '여행자 이름을 입력해주세요.';
            }
            
            if (!traveler.birthdate) {
              errors[`traveler${index}Birthdate`] = '생년월일을 입력해주세요.';
            }
            
            if (!traveler.gender) {
              errors[`traveler${index}Gender`] = '성별을 선택해주세요.';
            }
          });
        }
        
        // 장바구니 항목 검증
        if (items.length === 0) {
          errors['items'] = '장바구니에 상품이 없습니다.';
        }
        
        // 결제 방법 검증
        if (!paymentMethod) {
          errors['paymentMethod'] = '결제 방법을 선택해주세요.';
        }
        
        // 유효성 검사 결과 저장
        set({ validationErrors: errors });
        
        // 에러가 없으면 true 반환
        return Object.keys(errors).length === 0;
      },
      
      // 주문 정보 초기화
      resetOrderInfo: () => {
        set({
          orderInfo: initialOrderInfo,
          validationErrors: {},
        });
      },
    }),
    {
      name: 'travel-order-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default useOrder;
