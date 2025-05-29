// 여행 상품 가격 정보
export interface ProductPrice {
  adult: number;      // 성인 가격
  child?: number;     // 아동 가격 (선택 사항)
  infant?: number;    // 유아 가격 (선택 사항)
}

// 여행 기간 정보
export interface TravelDuration {
  days: number;      // 여행 일수
  nights?: number;    // 숙박 일수 (선택 사항)
}

// 여행 상품 기본 정보
export interface TravelProductBase {
  id: string;                    // 상품 고유 ID
  title: string;                 // 상품 제목
  description?: string;          // 상품 설명 (선택 사항)
  price?: ProductPrice;          // 가격 정보 (선택 사항)
  originalPrice?: number;        // 원가 (선택 사항, 할인 전 가격)
  images?: string[];             // 상품 이미지 URL 배열 (선택 사항)
  region?: string;               // 여행 지역 (예: '제주도', '부산' 등)
  duration?: TravelDuration;     // 여행 기간 (선택 사항)
  isBestSeller?: boolean;        // 베스트셀러 여부 (선택 사항)
  isTimeDeal?: boolean;          // 타임딜 여부 (선택 사항)
  categoryId?: string;           // 카테고리 ID (선택 사항)
  createdAt: Date;               // 생성일
  updatedAt: Date;               // 수정일
}

// 여행 상품 상세 정보 (기본 정보 + 상세 정보)
export interface TravelProduct extends TravelProductBase {
  // 추가 상세 정보 필드들
  highlights?: string[];         // 여행 하이라이트 (선택 사항)
  included?: string[];           // 포함 사항 (선택 사항)
  excluded?: string[];           // 미포함 사항 (선택 사항)
  itinerary?: DayItinerary[];    // 일정 정보 (선택 사항)
  terms?: string;                // 예약 및 취소 정책 (선택 사항)
  maxTravelers?: number;         // 최대 인원 (선택 사항)
  minTravelers?: number;         // 최소 인원 (선택 사항)
  status?: 'draft' | 'published' | 'archived'; // 상품 상태 (선택 사항)
}

// 일별 일정 정보
export interface DayItinerary {
  day: number;                   // 일차
  title: string;                 // 일정 제목
  description: string;           // 일정 상세 설명
  meals?: string[];              // 식사 정보 (선택 사항)
  accommodation?: string;        // 숙소 정보 (선택 사항)
  activities?: string[];         // 활동 정보 (선택 사항)
}

// 상품 필터링 옵션
export interface ProductFilterOptions {
  region?: string;               // 지역 필터
  minPrice?: number;              // 최소 가격
  maxPrice?: number;              // 최대 가격
  duration?: string;              // 여행 기간 필터 (예: '1-3', '4-7', '8+')
  category?: string;              // 카테고리 필터
  isBestSeller?: boolean;         // 베스트셀러 여부
  isTimeDeal?: boolean;           // 타임딜 여부
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'popular'; // 정렬 기준
}

// 상품 검색 결과
export interface ProductSearchResult {
  products: TravelProduct[];      // 검색된 상품 목록
  total: number;                  // 전체 상품 수
  page: number;                   // 현재 페이지 번호
  limit: number;                  // 페이지당 상품 수
  totalPages: number;             // 전체 페이지 수
}
