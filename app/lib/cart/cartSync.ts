'use client';

import { CartItem } from '@/hooks/useCart';

// 로컬 스토리지 키
const CART_STORAGE_KEY = 'travel-cart';

// 로컬 스토리지에서 장바구니 가져오기
export function getCartFromLocalStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    if (!cartData) return [];
    
    const parsedCart = JSON.parse(cartData);
    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch (error) {
    console.error('로컬 스토리지에서 장바구니 데이터를 가져오는 중 오류 발생:', error);
    return [];
  }
}

// 로컬 스토리지에 장바구니 저장
export function saveCartToLocalStorage(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('로컬 스토리지에 장바구니 데이터를 저장하는 중 오류 발생:', error);
  }
}

// 로컬 스토리지에서 장바구니 삭제
export function clearCartFromLocalStorage(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error('로컬 스토리지에서 장바구니 데이터를 삭제하는 중 오류 발생:', error);
  }
}

// 로컬 스토리지와 Firebase 장바구니 병합
export function mergeLocalAndFirebaseCart(localItems: CartItem[], firebaseItems: CartItem[]): CartItem[] {
  // 이미 Firebase에 있는 상품의 ID 목록
  const firebaseProductIds = new Set(firebaseItems.map(item => item.productId));
  
  // 로컬 스토리지에만 있는 항목 필터링
  const uniqueLocalItems = localItems.filter(item => !firebaseProductIds.has(item.productId));
  
  // 병합된 장바구니 항목 반환
  return [...firebaseItems, ...uniqueLocalItems];
}

// 로컬 스토리지에 장바구니 항목 추가
export function addItemToLocalStorage(item: CartItem): void {
  const currentItems = getCartFromLocalStorage();
  const existingItemIndex = currentItems.findIndex(i => i.productId === item.productId);
  
  if (existingItemIndex >= 0) {
    // 이미 존재하는 상품이면 수량 증가
    currentItems[existingItemIndex].quantity += item.quantity;
  } else {
    // 새로운 상품이면 추가
    currentItems.push(item);
  }
  
  saveCartToLocalStorage(currentItems);
}

// 로컬 스토리지에서 장바구니 항목 제거
export function removeItemFromLocalStorage(productId: string): void {
  const currentItems = getCartFromLocalStorage();
  const updatedItems = currentItems.filter(item => item.productId !== productId);
  saveCartToLocalStorage(updatedItems);
}

// 로컬 스토리지에서 장바구니 항목 수량 업데이트
export function updateItemQuantityInLocalStorage(productId: string, quantity: number): void {
  const currentItems = getCartFromLocalStorage();
  const itemIndex = currentItems.findIndex(item => item.productId === productId);
  
  if (itemIndex >= 0) {
    currentItems[itemIndex].quantity = quantity;
    saveCartToLocalStorage(currentItems);
  }
}

// 로그인/로그아웃 시 장바구니 동기화 처리
export function handleCartSyncOnAuthChange(isLoggedIn: boolean, userId: string | null, firebaseItems: CartItem[]): void {
  if (isLoggedIn && userId) {
    // 로그인 시: 로컬 스토리지 장바구니와 Firebase 장바구니 병합
    const localItems = getCartFromLocalStorage();
    if (localItems.length > 0) {
      // 여기서 Firebase에 로컬 항목 추가 API 호출 필요
      // 이 부분은 useCart.ts에서 구현
    }
  } else {
    // 로그아웃 시: Firebase 장바구니를 로컬 스토리지에 저장
    if (firebaseItems.length > 0) {
      saveCartToLocalStorage(firebaseItems);
    }
  }
}
