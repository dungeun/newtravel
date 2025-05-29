'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { TravelerInfo } from './useOrder';

// 체크아웃 단계 타입
export type CheckoutStep = 'orderer-info' | 'traveler-info' | 'payment' | 'confirmation';

// 체크아웃 스토어 상태 타입
interface CheckoutState {
  // 현재 체크아웃 단계
  currentStep: CheckoutStep;
  
  // 각 단계별 완료 여부
  stepsCompleted: Record<CheckoutStep, boolean>;
  
  // 체크아웃 폼 제출 상태
  isSubmitting: boolean;
  
  // 체크아웃 오류 메시지
  error: string | null;
  
  // 필요한 여행자 수 (성인, 아동, 유아)
  requiredTravelers: {
    adult: number;
    child: number;
    infant: number;
  };
  
  // 임시 여행자 정보 (작성 중인 여행자 정보)
  draftTraveler: Partial<TravelerInfo>;
  
  // 현재 단계 설정
  setCurrentStep: (step: CheckoutStep) => void;
  
  // 단계 완료 상태 설정
  setStepCompleted: (step: CheckoutStep, isCompleted: boolean) => void;
  
  // 제출 상태 설정
  setIsSubmitting: (isSubmitting: boolean) => void;
  
  // 오류 메시지 설정
  setError: (error: string | null) => void;
  
  // 필요한 여행자 수 설정
  setRequiredTravelers: (travelers: { adult: number; child: number; infant: number }) => void;
  
  // 임시 여행자 정보 업데이트
  updateDraftTraveler: (info: Partial<TravelerInfo>) => void;
  
  // 임시 여행자 정보 초기화
  resetDraftTraveler: () => void;
  
  // 새 여행자 정보 생성
  createNewTraveler: () => TravelerInfo;
  
  // 다음 단계로 이동
  goToNextStep: () => void;
  
  // 이전 단계로 이동
  goToPreviousStep: () => void;
  
  // 체크아웃 상태 초기화
  resetCheckout: () => void;
}

// 체크아웃 단계 순서
const CHECKOUT_STEPS: CheckoutStep[] = ['orderer-info', 'traveler-info', 'payment', 'confirmation'];

// 초기 상태
const initialState = {
  currentStep: 'orderer-info' as CheckoutStep,
  stepsCompleted: {
    'orderer-info': false,
    'traveler-info': false,
    'payment': false,
    'confirmation': false,
  },
  isSubmitting: false,
  error: null,
  requiredTravelers: {
    adult: 1,
    child: 0,
    infant: 0,
  },
  draftTraveler: {},
};

// useCheckout 스토어 생성
export const useCheckout = create<CheckoutState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // 현재 단계 설정
      setCurrentStep: (step) => {
        set({ currentStep: step });
      },
      
      // 단계 완료 상태 설정
      setStepCompleted: (step, isCompleted) => {
        set((state) => ({
          stepsCompleted: {
            ...state.stepsCompleted,
            [step]: isCompleted,
          },
        }));
      },
      
      // 제출 상태 설정
      setIsSubmitting: (isSubmitting) => {
        set({ isSubmitting });
      },
      
      // 오류 메시지 설정
      setError: (error) => {
        set({ error });
      },
      
      // 필요한 여행자 수 설정
      setRequiredTravelers: (travelers) => {
        set({ requiredTravelers: travelers });
      },
      
      // 임시 여행자 정보 업데이트
      updateDraftTraveler: (info) => {
        set((state) => ({
          draftTraveler: {
            ...state.draftTraveler,
            ...info,
          },
        }));
      },
      
      // 임시 여행자 정보 초기화
      resetDraftTraveler: () => {
        set({ draftTraveler: {} });
      },
      
      // 새 여행자 정보 생성
      createNewTraveler: () => {
        const { draftTraveler } = get();
        const newTraveler: TravelerInfo = {
          id: uuidv4(),
          name: draftTraveler.name || '',
          birthdate: draftTraveler.birthdate || '',
          gender: draftTraveler.gender || 'male',
          phone: draftTraveler.phone,
          email: draftTraveler.email,
          passportNumber: draftTraveler.passportNumber,
          passportExpiry: draftTraveler.passportExpiry,
          nationality: draftTraveler.nationality,
          specialRequests: draftTraveler.specialRequests,
        };
        
        // 임시 여행자 정보 초기화
        get().resetDraftTraveler();
        
        return newTraveler;
      },
      
      // 다음 단계로 이동
      goToNextStep: () => {
        const { currentStep } = get();
        const currentIndex = CHECKOUT_STEPS.indexOf(currentStep);
        
        if (currentIndex < CHECKOUT_STEPS.length - 1) {
          const nextStep = CHECKOUT_STEPS[currentIndex + 1];
          set({ currentStep: nextStep });
        }
      },
      
      // 이전 단계로 이동
      goToPreviousStep: () => {
        const { currentStep } = get();
        const currentIndex = CHECKOUT_STEPS.indexOf(currentStep);
        
        if (currentIndex > 0) {
          const previousStep = CHECKOUT_STEPS[currentIndex - 1];
          set({ currentStep: previousStep });
        }
      },
      
      // 체크아웃 상태 초기화
      resetCheckout: () => {
        set(initialState);
      },
    }),
    {
      name: 'travel-checkout-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default useCheckout;
