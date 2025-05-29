import { useQuery } from '@tanstack/react-query';
import { getAllProducts } from '@/lib/products';
import { TravelProduct } from '@/types/product';

export function useProductsQuery() {
  return useQuery<TravelProduct[]>({
    queryKey: ['products'],
    queryFn: getAllProducts,
  });
} 