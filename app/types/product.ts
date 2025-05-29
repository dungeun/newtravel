// 여행 상품 관련 타입 정의

// 상품 이미지 타입
export interface ProductImage {
  id: string;
  url: string;
  localPath?: string;
  alt?: string;
  order: number;
}

// 가격 정보 타입
export interface PriceInfo {
  adult: number;
  child?: number;
  infant?: number;
  currency: string;
  fuelSurcharge?: number;
}

// 할인 정보 타입
export interface DiscountInfo {
  type: 'percentage' | 'fixed';
  value: number;
  startDate?: Date;
  endDate?: Date;
  minimumQuantity?: number;
}

// 기본 상품 타입 (React Query에서 사용)
export interface Product {
  id: string;
  title: string;
  description?: string;
  shortDescription?: string;
  mainImage?: {
    url: string;
    alt?: string;
  };
  price?: {
    adult: number;
    child?: number;
    infant?: number;
    currency: string;
  };
  region?: string;
  status?: string;
  includesTransportation?: boolean;
  includesAccommodation?: boolean;
  categoryIds?: string[];
  tags?: string[];
  isBestSeller?: boolean;
  isTimeDeal?: boolean;
  reviewCount?: number;
  averageRating?: number;
  createdAt: any; // Timestamp
  updatedAt: any; // Timestamp
  [key: string]: any; // 추가 필드를 위한 인덱스 시그니처
}

// 여행 상품 타입
export interface TravelProduct {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  images: ProductImage[];
  price: PriceInfo;
  discount?: DiscountInfo;
  availability: {
    startDate?: Date;
    endDate?: Date;
    availableDays?: string[]; // ['monday', 'tuesday', ...]
    stockQuantity?: number;
  };
  region: string;
  location?: {
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  duration: {
    days: number;
    nights: number;
  };
  includesTransportation: boolean;
  transportationType?: string; // 'air', 'train', 'bus', 'ship', 'none'
  includesAccommodation: boolean;
  accommodationType?: string; // 'hotel', 'resort', 'guesthouse', 'camping', ...
  accommodationGrade?: number; // 1-5 stars
  includedServices?: string[];
  excludedServices?: string[];
  itinerary?: {
    day: number;
    description: string;
    activities?: string[];
  }[];
  relatedProducts?: string[]; // Related product IDs
  tags?: string[];
  categories?: string[];
  reviews?: {
    id: string;
    userId: string;
    rating: number;
    comment?: string;
    date: Date;
  }[];
  averageRating?: number;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published' | 'archived';
  isTimeDeal?: boolean;
  isBestSeller?: boolean;
}

// 상품 카테고리 타입
export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  images?: ProductImage[];
  order?: number;
  createdAt: Date;
  updatedAt: Date;
} 