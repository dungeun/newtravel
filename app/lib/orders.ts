import { db } from './firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter, QueryConstraint, Timestamp, DocumentSnapshot } from 'firebase/firestore';
import { Order, OrderStatus } from '@/types/order';
import { logger } from './logger';

const ORDERS_COLLECTION = 'orders';

// 주문 생성
export async function createOrder(order: Omit<Order, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, ORDERS_COLLECTION), order);
  return docRef.id;
}

// 주문 단건 조회
export async function getOrderById(id: string): Promise<Order | null> {
  const docRef = doc(db, ORDERS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Order;
}

// 특정 유저의 주문 목록 조회
export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const q = query(collection(db, ORDERS_COLLECTION), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
}

// 주문 수정
export async function updateOrder(id: string, update: Partial<Order>): Promise<void> {
  const docRef = doc(db, ORDERS_COLLECTION, id);
  await updateDoc(docRef, update);
}

// 주문 삭제
export async function deleteOrder(id: string): Promise<void> {
  const docRef = doc(db, ORDERS_COLLECTION, id);
  await deleteDoc(docRef);
}

// 주문 필터링 및 페이지네이션을 위한 인터페이스
interface OrdersQueryOptions {
  page?: number;
  limit?: number;
  filters?: {
    status?: OrderStatus | OrderStatus[];
    startDate?: Date;
    endDate?: Date;
    search?: string;
    minAmount?: number;
    maxAmount?: number;
    paymentMethod?: string;
    paymentStatus?: string;
    productId?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'totalAmount';
    sortOrder?: 'asc' | 'desc';
    [key: string]: any;
  };
  lastDoc?: DocumentSnapshot;
}

/**
 * 모든 주문 조회 (관리자용)
 * 페이지네이션과 필터링을 지원합니다.
 */
export async function getOrders(options: OrdersQueryOptions = {}) {
  try {
    const { page = 1, limit: pageLimit = 10, filters = {}, lastDoc } = options;
    
    // 정렬 기준 설정
    const sortField = filters.sortBy || 'createdAt';
    const sortDirection = filters.sortOrder || 'desc';
    
    // 기본 쿼리 제약 조건
    const constraints: QueryConstraint[] = [
      orderBy(sortField, sortDirection as 'asc' | 'desc')
    ];
    
    // 상태 필터 적용 (단일 상태 또는 상태 배열)
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        // Firestore는 단일 쿼리에서 OR 조건을 지원하지 않으므로 클라이언트 측에서 필터링
        // 일단 쿼리를 실행하고 결과를 필터링하는 방식으로 처리
      } else {
        constraints.push(where('status', '==', filters.status));
      }
    }
    
    // 날짜 범위 필터
    if (filters.startDate) {
      const startTimestamp = Timestamp.fromDate(filters.startDate);
      constraints.push(where('createdAt', '>=', startTimestamp));
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // 해당 날짜의 마지막 시간으로 설정
      const endTimestamp = Timestamp.fromDate(endDate);
      constraints.push(where('createdAt', '<=', endTimestamp));
    }
    
    // 결제 방법 필터
    if (filters.paymentMethod) {
      constraints.push(where('payment.method', '==', filters.paymentMethod));
    }
    
    // 결제 상태 필터
    if (filters.paymentStatus) {
      constraints.push(where('payment.status', '==', filters.paymentStatus));
    }
    
    // 검색어 필터 (주문번호, 고객명, 이메일 등)
    // Firestore는 단일 쿼리에서 OR 조건을 지원하지 않으므로
    // 클라이언트 측에서 추가 필터링이 필요할 수 있음
    if (filters.search) {
      // 주문번호로 검색 (정확히 일치하는 경우)
      constraints.push(where('orderNumber', '==', filters.search));
    }
    
    // 페이지네이션 적용
    constraints.push(limit(pageLimit));
    
    // 마지막 문서가 제공된 경우 (무한 스크롤 또는 다음 페이지용)
    if (lastDoc && page > 1) {
      constraints.push(startAfter(lastDoc));
    }
    
    // 쿼리 실행
    const q = query(collection(db, ORDERS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);
    
    // 결과 변환
    const orders = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Order));
    
    // 클라이언트 측 필터링 적용
    let filteredOrders = orders;
    
    // 검색어 필터링
    if (filters.search && orders.length > 0) {
      const searchLower = filters.search.toLowerCase();
      filteredOrders = filteredOrders.filter(order => {
        // 주문번호 검색은 이미 서버 측에서 처리됨
        const nameMatch = order.customer?.name?.toLowerCase().includes(searchLower) || false;
        const emailMatch = order.customer?.email?.toLowerCase().includes(searchLower) || false;
        const phoneMatch = order.customer?.phone ? order.customer.phone.includes(filters.search || '') : false;
        
        return nameMatch || emailMatch || phoneMatch;
      });
    }
    
    // 상태 배열 필터링
    if (filters.status && Array.isArray(filters.status)) {
      filteredOrders = filteredOrders.filter(order => 
        filters.status && Array.isArray(filters.status) && 
        filters.status.includes(order.status)
      );
    }
    
    // 금액 범위 필터링
    if (filters.minAmount !== undefined) {
      filteredOrders = filteredOrders.filter(order => 
        order.totalAmount >= (filters.minAmount || 0)
      );
    }
    
    if (filters.maxAmount !== undefined) {
      filteredOrders = filteredOrders.filter(order => 
        order.totalAmount <= (filters.maxAmount || Infinity)
      );
    }
    
    // 상품 ID 필터링
    if (filters.productId) {
      filteredOrders = filteredOrders.filter(order => 
        order.items.some(item => item.productId === filters.productId)
      );
    }
    
    // 전체 주문 수 계산 (간소화된 방식, 실제로는 별도의 카운트 쿼리가 필요할 수 있음)
    // 참고: 대규모 콜렉션에서는 이 방식이 비효율적일 수 있음
    const totalQuery = query(collection(db, ORDERS_COLLECTION));
    const totalSnapshot = await getDocs(totalQuery);
    const total = totalSnapshot.size;
    
    // 마지막 문서 (다음 페이지 조회용)
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    // 총 페이지 수 계산
    const totalPages = Math.ceil(total / pageLimit);
    
    logger.info('주문 목록 조회 완료', {
      total,
      filtered: filteredOrders.length,
      page,
      totalPages,
      filters: Object.keys(filters).length > 0 ? filters : 'none'
    }, 'ORDERS');
    
    return {
      orders: filteredOrders,
      total,
      totalPages,
      lastDoc: lastVisible,
      currentPage: page
    };
  } catch (error: any) {
    logger.error('주문 목록 조회 오류', {
      error: error.message,
      stack: error.stack
    }, 'ORDERS');
    throw error;
  }
}