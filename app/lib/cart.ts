'use client';

import { TravelProduct } from '../types/product';

// 장바구니 항목 타입
export interface CartItem {
  productId: string;
  product: TravelProduct;
  quantity: {
    adult: number;
    child: number;
    infant: number;
  };
  travelDate: {
    startDate: string;
    endDate: string;
  };
  subtotal: number;
}

// 장바구니 타입
export interface Cart {
  items: CartItem[];
  totalAmount: number;
  currency: string;
}

// 로컬 스토리지 키
const CART_STORAGE_KEY = 'travel-plugin-cart';

// 장바구니 초기화
export function initCart(): Cart {
  return {
    items: [],
    totalAmount: 0,
    currency: 'KRW'
  };
}

// 장바구니 가져오기
export function getCart(): Cart {
  if (typeof window === 'undefined') {
    return initCart();
  }
  
  const cartData = localStorage.getItem(CART_STORAGE_KEY);
  
  if (!cartData) {
    const newCart = initCart();
    saveCart(newCart);
    return newCart;
  }
  
  try {
    return JSON.parse(cartData);
  } catch (error) {
    console.error('장바구니 데이터 파싱 오류:', error);
    const newCart = initCart();
    saveCart(newCart);
    return newCart;
  }
}

// 장바구니 저장
export function saveCart(cart: Cart): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }
}

// 장바구니에 상품 추가
export function addToCart(
  product: TravelProduct, 
  quantity: { adult: number; child: number; infant: number; },
  travelDate: { startDate: string; endDate: string; }
): Cart {
  const cart = getCart();
  
  // 기존 항목이 있는지 확인
  const existingItemIndex = cart.items.findIndex(item => 
    item.productId === product.id && 
    item.travelDate.startDate === travelDate.startDate &&
    item.travelDate.endDate === travelDate.endDate
  );
  
  // 소계 계산
  const subtotal = 
    (quantity.adult * product.price.adult) + 
    (quantity.child * (product.price.child || 0)) + 
    (quantity.infant * (product.price.infant || 0));
  
  if (existingItemIndex >= 0) {
    // 기존 항목 업데이트
    cart.items[existingItemIndex].quantity.adult += quantity.adult;
    cart.items[existingItemIndex].quantity.child += quantity.child;
    cart.items[existingItemIndex].quantity.infant += quantity.infant;
    cart.items[existingItemIndex].subtotal += subtotal;
  } else {
    // 새 항목 추가
    cart.items.push({
      productId: product.id,
      product,
      quantity,
      travelDate,
      subtotal
    });
  }
  
  // 총액 재계산
  cart.totalAmount = cart.items.reduce((total, item) => total + item.subtotal, 0);
  
  // 장바구니 저장
  saveCart(cart);
  
  return cart;
}

// 장바구니에서 상품 수량 변경
export function updateCartItemQuantity(
  index: number,
  newQuantity: { adult: number; child: number; infant: number; }
): Cart {
  const cart = getCart();
  
  if (index >= 0 && index < cart.items.length) {
    const item = cart.items[index];
    
    // 수량 변경
    item.quantity = newQuantity;
    
    // 소계 재계산
    item.subtotal = 
      (newQuantity.adult * item.product.price.adult) + 
      (newQuantity.child * (item.product.price.child || 0)) + 
      (newQuantity.infant * (item.product.price.infant || 0));
    
    // 총액 재계산
    cart.totalAmount = cart.items.reduce((total, item) => total + item.subtotal, 0);
    
    // 장바구니 저장
    saveCart(cart);
  }
  
  return cart;
}

// 장바구니에서 상품 제거
export function removeFromCart(index: number): Cart {
  const cart = getCart();
  
  if (index >= 0 && index < cart.items.length) {
    // 항목 제거
    cart.items.splice(index, 1);
    
    // 총액 재계산
    cart.totalAmount = cart.items.reduce((total, item) => total + item.subtotal, 0);
    
    // 장바구니 저장
    saveCart(cart);
  }
  
  return cart;
}

// 장바구니 비우기
export function clearCart(): Cart {
  const newCart = initCart();
  saveCart(newCart);
  return newCart;
} 