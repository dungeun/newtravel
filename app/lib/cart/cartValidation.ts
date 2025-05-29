'use client';

import { CartItem } from '@/hooks/useCart';

// 장바구니 항목 유효성 검사
export function validateCartItem(item: any): { isValid: boolean; error?: string } {
  // 필수 필드 검증
  if (!item.productId) {
    return { isValid: false, error: '상품 ID가 누락되었습니다.' };
  }
  
  if (!item.title) {
    return { isValid: false, error: '상품명이 누락되었습니다.' };
  }
  
  if (item.price === undefined || item.price === null || isNaN(item.price)) {
    return { isValid: false, error: '유효한 가격이 아닙니다.' };
  }
  
  if (!item.quantity || item.quantity < 1) {
    return { isValid: false, error: '수량은 1 이상이어야 합니다.' };
  }
  
  // 옵션 검증 (있는 경우)
  if (item.options) {
    const { adult, child, infant } = item.options;
    
    // 최소한 하나의 인원은 있어야 함
    if ((!adult || adult < 0) && (!child || child < 0) && (!infant || infant < 0)) {
      return { isValid: false, error: '최소한 한 명 이상의 인원이 필요합니다.' };
    }
    
    // 음수 값 검증
    if ((adult && adult < 0) || (child && child < 0) || (infant && infant < 0)) {
      return { isValid: false, error: '인원 수는 0 이상이어야 합니다.' };
    }
  }
  
  // 날짜 검증 (있는 경우)
  if (item.dates) {
    const { startDate, endDate } = item.dates;
    
    // 시작일과 종료일 모두 있는지 확인
    if (!startDate || !endDate) {
      return { isValid: false, error: '여행 시작일과 종료일이 모두 필요합니다.' };
    }
    
    // 시작일이 종료일보다 이후인지 확인
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { isValid: false, error: '유효하지 않은 날짜 형식입니다.' };
    }
    
    if (start > end) {
      return { isValid: false, error: '종료일은 시작일 이후여야 합니다.' };
    }
    
    // 과거 날짜 검증
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (start < today) {
      return { isValid: false, error: '과거 날짜는 선택할 수 없습니다.' };
    }
  }
  
  return { isValid: true };
}

// 장바구니 항목 중복 검사
export function isDuplicateCartItem(newItem: CartItem, existingItems: CartItem[]): boolean {
  return existingItems.some(item => {
    // 동일한 상품 ID 확인
    if (item.productId !== newItem.productId) return false;
    
    // 옵션이 있는 경우 옵션도 비교
    if (item.options && newItem.options) {
      const sameAdult = item.options.adult === newItem.options.adult;
      const sameChild = item.options.child === newItem.options.child;
      const sameInfant = item.options.infant === newItem.options.infant;
      
      if (!sameAdult || !sameChild || !sameInfant) return false;
    }
    
    // 날짜가 있는 경우 날짜도 비교
    if (item.dates && newItem.dates) {
      const itemStartDate = item.dates.startDate instanceof Date 
        ? item.dates.startDate 
        : new Date(item.dates.startDate);
        
      const itemEndDate = item.dates.endDate instanceof Date 
        ? item.dates.endDate 
        : new Date(item.dates.endDate);
        
      const newStartDate = newItem.dates.startDate instanceof Date 
        ? newItem.dates.startDate 
        : new Date(newItem.dates.startDate);
        
      const newEndDate = newItem.dates.endDate instanceof Date 
        ? newItem.dates.endDate 
        : new Date(newItem.dates.endDate);
      
      const sameStartDate = itemStartDate.getTime() === newStartDate.getTime();
      const sameEndDate = itemEndDate.getTime() === newEndDate.getTime();
      
      if (!sameStartDate || !sameEndDate) return false;
    }
    
    // 모든 조건이 일치하면 중복
    return true;
  });
}

// 장바구니 항목 병합 (중복 항목의 수량 합치기)
export function mergeCartItems(items: CartItem[]): CartItem[] {
  const mergedItems: CartItem[] = [];
  const processedIds = new Set<string>();
  
  items.forEach(item => {
    // 이미 처리된 항목은 건너뛰기
    if (processedIds.has(item.id)) return;
    
    // 중복 항목 찾기
    const duplicates = items.filter(i => 
      i.productId === item.productId && 
      JSON.stringify(i.options) === JSON.stringify(item.options) && 
      JSON.stringify(i.dates) === JSON.stringify(item.dates)
    );
    
    // 중복 항목이 있으면 수량 합치기
    if (duplicates.length > 1) {
      const totalQuantity = duplicates.reduce((sum, i) => sum + i.quantity, 0);
      const mergedItem = { ...item, quantity: totalQuantity };
      mergedItems.push(mergedItem);
      
      // 처리된 항목 표시
      duplicates.forEach(d => processedIds.add(d.id));
    } else {
      // 중복 없는 항목은 그대로 추가
      mergedItems.push(item);
      processedIds.add(item.id);
    }
  });
  
  return mergedItems;
}

// 장바구니 항목 최대 수량 검증
export function validateMaxQuantity(item: CartItem, maxQuantity = 10): { isValid: boolean; error?: string } {
  if (item.quantity > maxQuantity) {
    return { 
      isValid: false, 
      error: `최대 주문 가능 수량은 ${maxQuantity}개입니다.` 
    };
  }
  
  return { isValid: true };
}

// 장바구니 항목 가격 계산
export function calculateItemPrice(item: CartItem): number {
  let totalPrice = item.price * item.quantity;
  
  // 옵션에 따른 추가 가격 계산 (예시)
  if (item.options) {
    const { adult = 0, child = 0, infant = 0 } = item.options;
    
    // 아동은 성인 가격의 70%, 유아는 성인 가격의 30% (예시)
    totalPrice = (adult * item.price) + (child * item.price * 0.7) + (infant * item.price * 0.3);
  }
  
  return totalPrice;
}
