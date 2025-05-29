'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/reactQuery';
import { useSession } from 'next-auth/react';
import { db } from '@/firebase/config';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  Timestamp, 
  writeBatch 
} from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { CartItem } from '@/hooks/useCart';

// 주문 항목 타입
export interface OrderItem {
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
}

// 고객 정보 타입
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

// 주문 타입
export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  paymentId?: string;
  subtotal: number;
  discountAmount: number;
  tax: number;
  total: number;
  customer: Customer;
  items?: OrderItem[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}

// 주문 생성 파라미터 타입
export interface CreateOrderParams {
  customer: Customer;
  cartItems: CartItem[];
  paymentMethod: string;
}

// 주문 목록 가져오기
const getUserOrders = async (userId: string, limitCount: number = 10): Promise<Order[]> => {
  if (!userId) {
    throw new Error('사용자 인증이 필요합니다.');
  }
  
  try {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  } catch (error) {
    console.error('주문 목록 가져오기 오류:', error);
    throw error;
  }
};

// 주문 상세 정보 가져오기
const getOrderById = async (orderId: string): Promise<Order | null> => {
  if (!orderId) return null;
  
  try {
    // 주문 문서 가져오기
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (!orderDoc.exists()) {
      return null;
    }
    
    // 주문 항목 가져오기
    const orderItemsRef = collection(db, 'orders', orderId, 'items');
    const itemsSnapshot = await getDocs(orderItemsRef);
    const items = itemsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as OrderItem[];
    
    // 주문 정보 반환
    return {
      id: orderDoc.id,
      ...orderDoc.data() as Omit<Order, 'id' | 'items'>,
      items
    };
  } catch (error) {
    console.error('주문 상세 가져오기 오류:', error);
    throw error;
  }
};

// 주문 생성하기
const createOrder = async (
  userId: string,
  params: CreateOrderParams
): Promise<Order> => {
  if (!userId) {
    throw new Error('사용자 인증이 필요합니다.');
  }
  
  const { customer, cartItems, paymentMethod } = params;
  
  if (!cartItems.length) {
    throw new Error('장바구니가 비어 있습니다.');
  }
  
  const batch = writeBatch(db);
  
  try {
    // 주문 문서 생성
    const orderRef = doc(collection(db, 'orders'));
    const orderId = orderRef.id;
    
    // 주문 번호 생성
    const orderNumber = `ORD-${orderId.substring(0, 8).toUpperCase()}`;
    
    // 주문 합계 계산
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const discountAmount = 0; // 할인 로직 구현 시 반영
    const tax = 0; // 세금 로직 구현 시 반영
    const total = subtotal - discountAmount + tax;
    
    // 주문 데이터 생성
    const orderData = {
      id: orderId,
      userId,
      orderNumber,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod,
      paymentId: '',
      subtotal,
      discountAmount,
      tax,
      total,
      customer,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    } as Order;
    
    // 주문 문서 저장
    batch.set(orderRef, orderData);
    
    // 주문 항목 저장
    cartItems.forEach(item => {
      const orderItemRef = doc(collection(db, 'orders', orderId, 'items'));
      const orderItem: OrderItem = {
        id: orderItemRef.id,
        productId: item.productId,
        title: item.title,
        mainImage: item.mainImage,
        price: item.price,
        quantity: item.quantity,
        options: item.options,
        dates: item.dates
      };
      
      batch.set(orderItemRef, orderItem);
    });
    
    // 주문 이력 기록
    const historyRef = doc(collection(db, 'orders', orderId, 'history'));
    batch.set(historyRef, {
      id: historyRef.id,
      status: 'pending',
      timestamp: Timestamp.now(),
      note: '주문 생성됨',
      performedBy: 'system'
    });
    
    // 사용자 문서 업데이트 (주문 수, 총 지출)
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      batch.update(userRef, {
        orderCount: (userData.orderCount || 0) + 1,
        totalSpent: (userData.totalSpent || 0) + total,
        updatedAt: Timestamp.now()
      });
    }
    
    // 배치 커밋
    await batch.commit();
    
    // 생성된 주문 정보 반환
    return {
      ...orderData,
      items: cartItems.map(item => ({
        ...item,
        id: item.id // 장바구니 항목 ID가 아닌 새 ID가 필요하지만, 이 샘플에서는 단순화
      })) as OrderItem[]
    };
  } catch (error) {
    console.error('주문 생성 오류:', error);
    throw error;
  }
};

// 주문 상태 업데이트
const updateOrderStatus = async (
  orderId: string,
  newStatus: Order['status'],
  note: string,
  performedBy: string
): Promise<void> => {
  if (!orderId) {
    throw new Error('주문 ID가 필요합니다.');
  }
  
  try {
    const batch = writeBatch(db);
    const orderRef = doc(db, 'orders', orderId);
    
    // 주문 상태 업데이트
    batch.update(orderRef, {
      status: newStatus,
      updatedAt: Timestamp.now(),
      ...(newStatus === 'completed' ? { completedAt: Timestamp.now() } : {})
    });
    
    // 주문 이력 추가
    const historyRef = doc(collection(db, 'orders', orderId, 'history'));
    batch.set(historyRef, {
      id: historyRef.id,
      status: newStatus,
      timestamp: Timestamp.now(),
      note,
      performedBy
    });
    
    await batch.commit();
  } catch (error) {
    console.error('주문 상태 업데이트 오류:', error);
    throw error;
  }
};

// 결제 상태 업데이트
const updatePaymentStatus = async (
  orderId: string,
  newStatus: Order['paymentStatus'],
  paymentId?: string
): Promise<void> => {
  if (!orderId) {
    throw new Error('주문 ID가 필요합니다.');
  }
  
  try {
    const orderRef = doc(db, 'orders', orderId);
    
    await updateDoc(orderRef, {
      paymentStatus: newStatus,
      ...(paymentId ? { paymentId } : {}),
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('결제 상태 업데이트 오류:', error);
    throw error;
  }
};

// useOrders 훅
export function useOrders() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // 주문 목록 쿼리
  const ordersQuery = useQuery({
    queryKey: queryKeys.orders.list(userId || ''),
    queryFn: () => getUserOrders(userId || '', 10),
    enabled: !!userId, // 로그인된 경우에만 실행
    staleTime: 1000 * 60 * 5, // 5분
  });
  
  // 주문 생성 뮤테이션
  const createOrderMutation = useMutation({
    mutationFn: (params: CreateOrderParams) => createOrder(userId || '', params),
    onSuccess: () => {
      // 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list(userId || '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.items(userId || '') });
      
      toast({
        title: '주문이 성공적으로 생성되었습니다.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '주문 생성에 실패했습니다.',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // 주문 상태 업데이트 뮤테이션
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ orderId, newStatus, note, performedBy }: { 
      orderId: string; 
      newStatus: Order['status']; 
      note: string; 
      performedBy: string; 
    }) => updateOrderStatus(orderId, newStatus, note, performedBy),
    onSuccess: (_, variables) => {
      // 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list(userId || '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.orderId) });
      
      toast({
        title: '주문 상태가 업데이트되었습니다.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '주문 상태 업데이트에 실패했습니다.',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // 결제 상태 업데이트 뮤테이션
  const updatePaymentStatusMutation = useMutation({
    mutationFn: ({ orderId, newStatus, paymentId }: { 
      orderId: string; 
      newStatus: Order['paymentStatus']; 
      paymentId?: string; 
    }) => updatePaymentStatus(orderId, newStatus, paymentId),
    onSuccess: (_, variables) => {
      // 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list(userId || '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.orderId) });
      
      toast({
        title: '결제 상태가 업데이트되었습니다.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '결제 상태 업데이트에 실패했습니다.',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  return {
    orders: ordersQuery.data || [],
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    error: ordersQuery.error,
    
    createOrder: createOrderMutation.mutate,
    isCreatingOrder: createOrderMutation.isPending,
    
    updateOrderStatus: updateOrderStatusMutation.mutate,
    isUpdatingOrderStatus: updateOrderStatusMutation.isPending,
    
    updatePaymentStatus: updatePaymentStatusMutation.mutate,
    isUpdatingPaymentStatus: updatePaymentStatusMutation.isPending,
  };
}

// 특정 주문 상세 정보를 위한 훅
export function useOrderDetail(orderId: string | undefined) {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId || ''),
    queryFn: () => orderId ? getOrderById(orderId) : Promise.resolve(null),
    enabled: !!orderId && !!session, // 로그인 상태와 주문 ID가 있을 때만 실행
    staleTime: 1000 * 60 * 10, // 10분
  });
} 