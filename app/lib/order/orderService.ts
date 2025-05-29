/**
 * 주문 관련 서비스 함수
 */

import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';

// 주문 상태 정의
export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CONFIRMED = 'confirmed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
  PAYMENT_FAILED = 'payment_failed',
}

// 주문 정보 인터페이스
export interface OrderInfo {
  id: string;
  userId: string;
  items: Array<{
    id: string;
    title: string;
    price: number;
    quantity: number;
    options?: {
      adult: number;
      child: number;
      infant: number;
    };
    dates?: {
      startDate: string;
      endDate: string;
    };
  }>;
  ordererInfo: {
    name: string;
    email: string;
    phone: string;
  };
  travelers: Array<{
    id: string;
    name: string;
    birthdate: string;
    gender: string;
  }>;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod?: string;
  paymentId?: string;
  specialRequests?: string;
  createdAt: any;
  updatedAt: any;
}

/**
 * 주문 정보 조회
 */
export const getOrderById = async (orderId: string): Promise<OrderInfo | null> => {
  try {
    const orderDocRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderDocRef);
    
    if (!orderDoc.exists()) {
      return null;
    }
    
    return orderDoc.data() as OrderInfo;
  } catch (error) {
    console.error('주문 정보 조회 오류:', error);
    throw error;
  }
};

/**
 * 주문 상태 업데이트
 */
export const updateOrderStatus = async (
  orderId: string,
  status: string,
  paymentId?: string
): Promise<void> => {
  try {
    const orderDocRef = doc(db, 'orders', orderId);
    
    const updateData: Record<string, any> = {
      status,
      updatedAt: serverTimestamp(),
    };
    
    if (paymentId) {
      updateData.paymentId = paymentId;
    }
    
    await updateDoc(orderDocRef, updateData);
  } catch (error) {
    console.error('주문 상태 업데이트 오류:', error);
    throw error;
  }
};

/**
 * 사용자별 주문 목록 조회
 */
export const getOrdersByUserId = async (
  userId: string,
  status?: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{ orders: OrderInfo[]; total: number }> => {
  try {
    const ordersRef = collection(db, 'orders');
    
    let q = query(
      ordersRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    if (status) {
      q = query(q, where('status', '==', status));
    }
    
    const snapshot = await getDocs(q);
    
    const total = snapshot.docs.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    const orders = snapshot.docs
      .slice(startIndex, endIndex)
      .map((doc) => ({ ...doc.data(), id: doc.id } as OrderInfo));
    
    return { orders, total };
  } catch (error) {
    console.error('사용자별 주문 목록 조회 오류:', error);
    throw error;
  }
};

/**
 * 주문 취소
 */
export const cancelOrder = async (orderId: string): Promise<void> => {
  try {
    await updateOrderStatus(orderId, OrderStatus.CANCELED);
  } catch (error) {
    console.error('주문 취소 오류:', error);
    throw error;
  }
};

/**
 * 주문 환불
 */
export const refundOrder = async (orderId: string): Promise<void> => {
  try {
    await updateOrderStatus(orderId, OrderStatus.REFUNDED);
  } catch (error) {
    console.error('주문 환불 오류:', error);
    throw error;
  }
};
