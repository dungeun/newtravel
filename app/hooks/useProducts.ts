'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/reactQuery';
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
  startAfter,
  DocumentData
} from 'firebase/firestore';
import { Product } from '@/types/product';

// 가용한 필터 타입 정의
export type ProductFilterType = {
  status?: 'published' | 'draft' | 'archived';
  categoryId?: string;
  region?: string;
  priceOrder?: 'asc' | 'desc';
  dateOrder?: 'asc' | 'desc';
  isBestSeller?: boolean;
  isTimeDeal?: boolean;
  limitCount?: number;
};

// 기본 필터 값
const defaultFilters: ProductFilterType = {
  status: 'published',
  dateOrder: 'desc',
  limitCount: 20,
};

// 모든 상품 가져오기 (필터링 적용)
const getProducts = async (filters: ProductFilterType = {}): Promise<Product[]> => {
  try {
    // Firestore 초기화 확인
    if (!db || !collection || !query) {
      console.error('Firestore가 초기화되지 않았습니다.');
      return [];
    }

    const mergedFilters = { ...defaultFilters, ...filters };
    
    // 기본 쿼리
    const conditions = [];
    
    // 조건 추가
    if (mergedFilters.status) {
      conditions.push(where('status', '==', mergedFilters.status));
    }
    
    if (mergedFilters.categoryId) {
      conditions.push(where('categoryIds', 'array-contains', mergedFilters.categoryId));
    }
    
    if (mergedFilters.region) {
      conditions.push(where('region', '==', mergedFilters.region));
    }
    
    if (mergedFilters.isBestSeller) {
      conditions.push(where('isBestSeller', '==', true));
    }
    
    if (mergedFilters.isTimeDeal) {
      conditions.push(where('isTimeDeal', '==', true));
    }
    
    // 정렬 추가
    const dateOrderDirection = mergedFilters.dateOrder || 'desc';
    conditions.push(orderBy('createdAt', dateOrderDirection as any));
    
    // 가격 정렬이 있는 경우 (지역 필터와 함께 적용 필요)
    if (mergedFilters.priceOrder && mergedFilters.region) {
      conditions.push(orderBy('price.adult', mergedFilters.priceOrder as any));
    }
    
    // 결과 제한
    const limitCount = mergedFilters.limitCount || 20;
    conditions.push(limit(limitCount));
    
    // 쿼리 실행
    const q = query(collection(db, 'products'), ...conditions);
    const snapshot = await getDocs(q);
    
    // 결과 반환
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
  } catch (error) {
    console.error('상품 목록 조회 중 오류 발생:', error);
    return [];
  }
};

// 특정 상품 ID로 상세 정보 가져오기
const getProductById = async (id: string): Promise<Product | null> => {
  try {
    // Firestore 초기화 확인
    if (!db || !doc || !getDoc) {
      console.error('Firestore가 초기화되지 않았습니다.');
      return null;
    }

    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Product;
  } catch (error) {
    console.error(`상품 ID(${id}) 조회 중 오류 발생:`, error);
    return null;
  }
};

// useProducts 훅
export function useProducts(filters: ProductFilterType = {}) {
  const queryClient = useQueryClient();
  const filtersKey = JSON.stringify(filters);
  
  return useQuery({
    queryKey: queryKeys.products.list(filtersKey),
    queryFn: () => getProducts(filters),
    staleTime: 1000 * 60 * 5, // 5분
  });
}

// useProductDetail 훅
export function useProductDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detail(id || ''),
    queryFn: () => id ? getProductById(id) : Promise.resolve(null),
    enabled: !!id, // id가 있을 때만 쿼리 실행
    staleTime: 1000 * 60 * 10, // 10분
  });
}

// 상품 데이터 미리 로드
export function prefetchProducts(filters: ProductFilterType = {}) {
  const queryClient = useQueryClient();
  const filtersKey = JSON.stringify(filters);
  
  return queryClient.prefetchQuery({
    queryKey: queryKeys.products.list(filtersKey),
    queryFn: () => getProducts(filters),
    staleTime: 1000 * 60 * 5, // 5분
  });
}

// 상품 상세 데이터 미리 로드
export function prefetchProductDetail(id: string) {
  const queryClient = useQueryClient();
  
  return queryClient.prefetchQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => getProductById(id),
    staleTime: 1000 * 60 * 10, // 10분
  });
} 