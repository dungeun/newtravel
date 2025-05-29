import { useState, useEffect } from 'react';

// Product 타입 정의
export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: {
    adult: number;
    child?: number;
    infant?: number;
  };
  originalPrice?: number;
  images?: string[];
  region?: string;
  duration?: {
    days: number;
    nights?: number;
  };
  isBestSeller?: boolean;
  isTimeDeal?: boolean;
  categoryId?: string;
}

export interface ProductFilterType {
  status?: 'published' | 'draft' | 'archived';
  region?: string;
  priceOrder?: 'asc' | 'desc';
  dateOrder?: 'asc' | 'desc';
  isBestSeller?: boolean;
  isTimeDeal?: boolean;
  categoryId?: string;
}

interface UseProductsResult {
  products: Product[];
  isLoading: boolean;
  error: Error | null;
}

export function useProducts(filters: Partial<ProductFilterType> = {}): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        // TODO: 실제 API 엔드포인트로 대체
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(filters),
        });

        if (!response.ok) {
          throw new Error('상품을 불러오는데 실패했습니다.');
        }

        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  return { products, isLoading, error } as const;
}

export default useProducts;
