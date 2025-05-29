import { TravelProduct } from '@/types/product';

// 임시 상품 데이터 (실제로는 데이터베이스에서 가져와야 함)
const mockProducts: TravelProduct[] = [
  {
    id: '1',
    title: '제주도 여행 패키지',
    description: '아름다운 제주도의 풍경을 만끽할 수 있는 패키지',
    price: {
      adult: 299000,
      child: 199000,
      infant: 50000,
    },
    originalPrice: 399000,
    images: ['/images/jeju.jpg'],
    region: '제주도',
    duration: {
      days: 3,
      nights: 2,
    },
    isBestSeller: true,
    isTimeDeal: false,
    categoryId: 'domestic',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // 더 많은 상품 데이터 추가...
];

// 모든 상품 가져오기
export async function getAllProducts(filters: any = {}): Promise<TravelProduct[]> {
  // 필터링 로직 구현 (간단한 예시)
  let filteredProducts = [...mockProducts];

  if (filters.status) {
    // 상태 필터링 로직
  }

  if (filters.region) {
    filteredProducts = filteredProducts.filter(
      (product) => product.region === filters.region
    );
  }

  if (filters.isBestSeller) {
    filteredProducts = filteredProducts.filter(
      (product) => product.isBestSeller
    );
  }

  if (filters.isTimeDeal) {
    filteredProducts = filteredProducts.filter(
      (product) => product.isTimeDeal
    );
  }

  if (filters.categoryId) {
    filteredProducts = filteredProducts.filter(
      (product) => product.categoryId === filters.categoryId
    );
  }

  // 정렬
  if (filters.priceOrder) {
    filteredProducts.sort((a, b) => {
      const priceA = a.price?.adult || 0;
      const priceB = b.price?.adult || 0;
      return filters.priceOrder === 'asc' ? priceA - priceB : priceB - priceA;
    });
  }

  if (filters.dateOrder) {
    filteredProducts.sort((a, b) => {
      const dateA = a.createdAt?.getTime() || 0;
      const dateB = b.createdAt?.getTime() || 0;
      return filters.dateOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }

  return filteredProducts;
}

// 상품 ID로 조회
export async function getProductById(id: string): Promise<TravelProduct | null> {
  const product = mockProducts.find((p) => p.id === id);
  return product || null;
}

// 새 상품 생성
export async function createProduct(productData: Omit<TravelProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<TravelProduct> {
  const newProduct: TravelProduct = {
    ...productData,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // 실제로는 데이터베이스에 저장하는 로직이 필요
  mockProducts.push(newProduct);
  
  return newProduct;
}

// 상품 업데이트
export async function updateProduct(
  id: string,
  productData: Partial<TravelProduct>
): Promise<TravelProduct | null> {
  const index = mockProducts.findIndex((p) => p.id === id);
  
  if (index === -1) return null;
  
  const updatedProduct = {
    ...mockProducts[index],
    ...productData,
    updatedAt: new Date(),
  };
  
  mockProducts[index] = updatedProduct;
  return updatedProduct;
}

// 상품 삭제
export async function deleteProduct(id: string): Promise<boolean> {
  const index = mockProducts.findIndex((p) => p.id === id);
  
  if (index === -1) return false;
  
  mockProducts.splice(index, 1);
  return true;
}
