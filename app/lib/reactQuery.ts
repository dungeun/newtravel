import { 
  QueryClient,
  MutationCache,
  QueryCache
} from '@tanstack/react-query';

// 에러 처리를 위한 타입 정의
interface FirebaseError {
  code: string;
  message: string;
}

// 일반 에러인지 Firebase 에러인지 체크하는 함수
const isFirebaseError = (error: unknown): error is FirebaseError => {
  return (
    typeof error === 'object' && 
    error !== null && 
    'code' in error && 
    'message' in error
  );
};

// 쿼리 클라이언트 설정
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      gcTime: 1000 * 60 * 10, // 10분
      retry: 1, // 실패 시 재시도 횟수
      refetchOnWindowFocus: false, // 창에 포커스가 생길 때 다시 가져오지 않음
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      // 글로벌 에러 처리
      if (isFirebaseError(error)) {
        console.error('Query 에러:', error.message, '(코드:', error.code, ')');
      } else {
        console.error('Query 에러:', error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      // 글로벌 에러 처리
      if (isFirebaseError(error)) {
        console.error('Mutation 에러:', error.message, '(코드:', error.code, ')');
      } else {
        console.error('Mutation 에러:', error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
      }
    },
  }),
});

// 쿼리 키
export const queryKeys = {
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
  },
  cart: {
    all: ['cart'] as const,
    items: (userId: string) => [...queryKeys.cart.all, userId, 'items'] as const,
  },
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (userId: string) => [...queryKeys.orders.lists(), userId] as const,
    detail: (id: string) => [...queryKeys.orders.all, id] as const,
  },
  categories: {
    all: ['categories'] as const,
  },
  users: {
    all: ['users'] as const,
    detail: (id: string) => [...queryKeys.users.all, id] as const,
  },
  reviews: {
    all: ['reviews'] as const,
    product: (productId: string) => [...queryKeys.reviews.all, 'product', productId] as const,
    user: (userId: string) => [...queryKeys.reviews.all, 'user', userId] as const,
  },
}; 