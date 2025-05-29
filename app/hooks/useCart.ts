'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/reactQuery';
import { useSession } from 'next-auth/react';
import { db } from '@/firebase/config';
import { 
  doc,
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { useEffect } from 'react';
import {
  getCartFromLocalStorage,
  saveCartToLocalStorage,
  clearCartFromLocalStorage,
  mergeLocalAndFirebaseCart
} from '@/lib/cart/cartSync';

// 장바구니 항목 타입
export interface CartItem {
  id: string;
  productId: string;
  title: string;
  mainImage: string;
  price: number;
  quantity: number;
  options?: {
    adult: number;
    child: number;
    infant: number;
  };
  dates?: {
    startDate: Timestamp;
    endDate: Timestamp;
  };
  addedAt?: Timestamp;
  updatedAt?: Timestamp;
}

// 장바구니 타입
export interface Cart {
  id: string;
  userId: string;
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  lastUpdated: Timestamp;
  items: CartItem[];
}

// 장바구니 항목 추가 시 필요한 파라미터
export interface AddToCartParams {
  productId: string;
  title: string;
  mainImage: string;
  price: number;
  quantity: number;
  options?: {
    adult: number;
    child: number;
    infant: number;
  };
  dates?: {
    startDate: Date;
    endDate: Date;
  };
}

// 장바구니 호출 함수
const fetchCart = async (userId: string): Promise<Cart | null> => {
  if (!userId) {
    // 로그인하지 않은 경우 로컬 스토리지에서 장바구니 가져오기
    const localCart = getCartFromLocalStorage();
    if (localCart) {
      return localCart;
    }
    return {
      id: 'local',
      userId: 'anonymous',
      itemCount: 0,
      subtotal: 0,
      discountAmount: 0,
      total: 0,
      lastUpdated: Timestamp.now(),
      items: []
    };
  }
    
  try {
    // 장바구니 문서 가져오기
    const cartDocRef = doc(db, 'carts', userId);
    const cartDoc = await getDoc(cartDocRef);
      
    // 장바구니 문서가 없으면 빈 장바구니 생성
    if (!cartDoc.exists()) {
      const emptyCart: Omit<Cart, 'id' | 'items'> = {
        userId,
        itemCount: 0,
        subtotal: 0,
        discountAmount: 0,
        total: 0,
        lastUpdated: Timestamp.now(),
      };
      
      await updateDoc(cartDocRef, emptyCart);
      return { id: userId, ...emptyCart, items: [] };
      }
      
    // 장바구니 항목 가져오기
    const cartItemsRef = collection(db, 'carts', userId, 'items');
    const cartItemsSnapshot = await getDocs(cartItemsRef);
    const items = cartItemsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CartItem[];
    
    // 장바구니 정보 반환
    return {
      id: cartDoc.id,
      ...cartDoc.data() as Omit<Cart, 'id' | 'items'>,
      items
    };
    } catch (error) {
    console.error('장바구니 가져오기 오류:', error);
    throw error;
    }
  };

// 장바구니 항목 추가 함수
const addToCart = async (userId: string, item: AddToCartParams): Promise<CartItem> => {
  if (!userId) throw new Error('사용자 인증이 필요합니다.');
    
    try {
    // 장바구니 항목 추가
    const cartItemsRef = collection(db, 'carts', userId, 'items');
    
    const newItem: Omit<CartItem, 'id'> = {
      productId: item.productId,
      title: item.title,
      mainImage: item.mainImage,
      price: item.price,
      quantity: item.quantity,
      options: item.options,
      dates: item.dates ? {
        startDate: Timestamp.fromDate(item.dates.startDate),
        endDate: Timestamp.fromDate(item.dates.endDate)
      } : undefined,
      addedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(cartItemsRef, newItem);
    
    // 장바구니 정보 업데이트 (총 금액, 항목 수 등)
    await updateCartSummary(userId);
    
    // 추가된 항목 반환
    return {
      id: docRef.id,
      ...newItem
    };
    } catch (error) {
    console.error('장바구니 항목 추가 오류:', error);
    throw error;
    }
  };

// 장바구니 항목 제거 함수
const removeFromCart = async (userId: string, itemId: string): Promise<void> => {
  if (!userId) throw new Error('사용자 인증이 필요합니다.');
  
  try {
    // 장바구니 항목 삭제
    const itemRef = doc(db, 'carts', userId, 'items', itemId);
    await deleteDoc(itemRef);
    
    // 장바구니 정보 업데이트 (총 금액, 항목 수 등)
    await updateCartSummary(userId);
  } catch (error) {
    console.error('장바구니 항목 제거 오류:', error);
    throw error;
  }
};
        
// 장바구니 항목 수량 업데이트 함수
const updateCartItemQuantity = async (
  userId: string,
  itemId: string,
  quantity: number
): Promise<void> => {
  if (!userId) throw new Error('사용자 인증이 필요합니다.');
  if (quantity < 1) throw new Error('수량은 1 이상이어야 합니다.');
  
  try {
    // 장바구니 항목 업데이트
    const itemRef = doc(db, 'carts', userId, 'items', itemId);
    await updateDoc(itemRef, {
      quantity,
      updatedAt: Timestamp.now()
    });
    
    // 장바구니 정보 업데이트 (총 금액, 항목 수 등)
    await updateCartSummary(userId);
  } catch (error) {
    console.error('장바구니 항목 수량 업데이트 오류:', error);
    throw error;
  }
};

// 장바구니 요약 정보 업데이트 (총 금액, 항목 수 등)
const updateCartSummary = async (userId: string): Promise<void> => {
  if (!userId) return;
  
  try {
    // 장바구니 항목 가져오기
    const cartItemsRef = collection(db, 'carts', userId, 'items');
    const snapshot = await getDocs(cartItemsRef);
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CartItem[];
    
    // 총 금액 및 항목 수 계산
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // 할인 금액 계산 (할인 로직이 있을 경우)
    const discountAmount = 0; // 예시: 할인 없음
    
    // 최종 금액 계산
    const total = subtotal - discountAmount;
    
    // 장바구니 문서 업데이트
    const cartRef = doc(db, 'carts', userId);
    await updateDoc(cartRef, {
      itemCount,
      subtotal,
      discountAmount,
      total,
      lastUpdated: Timestamp.now()
    });
  } catch (error) {
    console.error('장바구니 요약 업데이트 오류:', error);
    throw error;
    }
};

// 장바구니 비우기 함수
const clearCart = async (userId: string): Promise<void> => {
  if (!userId) throw new Error('사용자 인증이 필요합니다.');
  
  try {
    // 장바구니 항목 가져오기
    const cartItemsRef = collection(db, 'carts', userId, 'items');
    const snapshot = await getDocs(cartItemsRef);
    
    // 모든 항목 삭제
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // 장바구니 정보 업데이트
    const cartRef = doc(db, 'carts', userId);
    await updateDoc(cartRef, {
      itemCount: 0,
      subtotal: 0,
      discountAmount: 0,
      total: 0,
      lastUpdated: Timestamp.now()
    });
  } catch (error) {
    console.error('장바구니 비우기 오류:', error);
    throw error;
  }
};

// useCart 훅
export function useCart() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // 장바구니 데이터 쿼리
  const cartQuery = useQuery({
    queryKey: queryKeys.cart.items(userId || 'anonymous'),
    queryFn: async () => {
      // 로그인된 경우 Firebase에서 장바구니 가져오기
      if (userId) {
        const firebaseCart = await fetchCart(userId);
        
        // 로컬 스토리지에 있는 장바구니 항목 가져오기
        const localItems = getCartFromLocalStorage();
        
        // 로컬 항목이 있고 Firebase 장바구니가 비어있으면 로컬 항목을 Firebase로 동기화
        if (localItems.length > 0 && (!firebaseCart || !firebaseCart.items || firebaseCart.items.length === 0)) {
          // 로컬 항목을 Firebase에 추가
          for (const item of localItems) {
            await addToCart(userId, {
              productId: item.productId,
              title: item.title,
              mainImage: item.mainImage,
              price: item.price,
              quantity: item.quantity,
              options: item.options,
              dates: item.dates ? {
                startDate: new Date(item.dates.startDate),
                endDate: new Date(item.dates.endDate)
              } : undefined
            });
          }
          
          // 로컬 스토리지 장바구니 비우기
          clearCartFromLocalStorage();
          
          // 업데이트된 장바구니 가져오기
          const updatedCart = await fetchCart(userId);
          return transformCartData(updatedCart);
          return await fetchCart(userId);
        }
        
        return firebaseCart;
      } else {
        // 로그인되지 않은 경우 로컬 스토리지에서 장바구니 가져오기
        const localItems = getCartFromLocalStorage();
        
        // 로컬 스토리지 장바구니를 Cart 형식으로 변환
        const localCart = {
          id: 'anonymous',
          userId: 'anonymous',
          itemCount: localItems.reduce((total, item) => total + item.quantity, 0),
          subtotal: localItems.reduce((total, item) => total + (item.price * item.quantity), 0),
          discountAmount: 0,
          total: localItems.reduce((total, item) => total + (item.price * item.quantity), 0),
          lastUpdated: new Date(),
          items: localItems
        };
        
        return localCart;
      }
    },
    staleTime: 1000 * 60 * 10, // 10분
  });
  
  // 세션 상태가 변경될 때 장바구니 동기화
  useEffect(() => {
    if (status === 'authenticated' && userId) {
      // 로그인 시 장바구니 쿼리 무효화하여 동기화 트리거
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.items(userId) });
    }
  }, [status, userId, queryClient]);
  
  // 장바구니 항목 추가 뮤테이션
  const addToCartMutation = useMutation({
    mutationFn: async (item: AddToCartParams) => {
      if (userId) {
        // 로그인된 경우 Firebase에 추가
        return await addToCart(userId, item);
      } else {
        // 로그인되지 않은 경우 로컬 스토리지에 추가
        const localItem: CartItem = {
          id: `local-${Date.now()}`,
          productId: item.productId,
          title: item.title,
          mainImage: item.mainImage,
          price: item.price,
          quantity: item.quantity,
          options: item.options,
          dates: item.dates ? {
            startDate: Timestamp.fromDate(item.dates.startDate),
            endDate: Timestamp.fromDate(item.dates.endDate)
          } : undefined,
          addedAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        
        // 로컬 스토리지에서 현재 장바구니 가져오기
        const localItems = getCartFromLocalStorage();
        
        // 이미 존재하는 상품인지 확인
        const existingItemIndex = localItems.findIndex(i => i.productId === item.productId);
        
        if (existingItemIndex >= 0) {
          // 이미 존재하는 상품이면 수량 증가
          localItems[existingItemIndex].quantity += item.quantity;
          localItems[existingItemIndex].updatedAt = Timestamp.now();
        } else {
          // 새로운 상품이면 추가
          localItems.push(localItem);
        }
        
        // 로컬 스토리지에 저장
        saveCartToLocalStorage(localItems);
        
        return localItem;
      }
    },
    onSuccess: () => {
      // 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.items(userId || 'anonymous') });
      
      toast({
        title: '상품이 장바구니에 추가되었습니다.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '장바구니에 추가하지 못했습니다.',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // 장바구니 항목 제거 뮤테이션
  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (userId) {
        // 로그인된 경우 Firebase에서 제거
        return await removeFromCart(userId, itemId);
      } else {
        // 로그인되지 않은 경우 로컬 스토리지에서 제거
        const localItems = getCartFromLocalStorage();
        const updatedItems = localItems.filter(item => item.id !== itemId);
        saveCartToLocalStorage(updatedItems);
      }
    },
    onSuccess: () => {
      // 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.items(userId || 'anonymous') });
      
      toast({
        title: '상품이 장바구니에서 제거되었습니다.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '장바구니에서 제거하지 못했습니다.',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // 장바구니 항목 수량 업데이트 뮤테이션
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (userId) {
        // 로그인된 경우 Firebase에서 업데이트
        return await updateCartItemQuantity(userId, itemId, quantity);
      } else {
        // 로그인되지 않은 경우 로컬 스토리지에서 업데이트
        const localItems = getCartFromLocalStorage();
        const itemIndex = localItems.findIndex(item => item.id === itemId);
        
        if (itemIndex >= 0) {
          localItems[itemIndex].quantity = quantity;
          localItems[itemIndex].updatedAt = Timestamp.now();
          saveCartToLocalStorage(localItems);
        }
      }
    },
    onSuccess: () => {
      // 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.items(userId || 'anonymous') });
    },
    onError: (error: Error) => {
      toast({
        title: '수량을 업데이트하지 못했습니다.',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // 장바구니 비우기 뮤테이션
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (userId) {
        // 로그인된 경우 Firebase에서 비우기
        return await clearCart(userId);
      } else {
        // 로그인되지 않은 경우 로컬 스토리지에서 비우기
        clearCartFromLocalStorage();
      }
    },
    onSuccess: () => {
      // 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.items(userId || 'anonymous') });
      
      toast({
        title: '장바구니가 비워졌습니다.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '장바구니를 비우지 못했습니다.',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    cart: cartQuery.data,
    isLoading: cartQuery.isLoading,
    isError: cartQuery.isError,
    error: cartQuery.error,
    addItem: addToCartMutation.mutate,
    removeItem: removeFromCartMutation.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    clearCart: clearCartMutation.mutate,
    isAddingItem: addToCartMutation.isPending,
    isRemovingItem: removeFromCartMutation.isPending,
    isUpdatingQuantity: updateQuantityMutation.isPending,
    isClearingCart: clearCartMutation.isPending,
  };
} 