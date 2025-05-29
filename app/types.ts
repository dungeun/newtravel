// 여행 상품 관련 타입
export interface TravelProduct {
  id: string;
  title: string;
  description: string;
  region: string;
  theme?: string;
  price: {
    adult: number;
    child?: number;
    infant?: number;
  };
  discountRate?: number;
  originalPrice?: number;
  images: {
    localPath?: string;
    src?: string;
    alt?: string;
  }[];
  [key: string]: any; // 기타 속성을 위한 인덱스 시그니처
}

// 사용자 관련 타입
export interface User {
  id: string;
  email: string;
  displayName?: string;
  role?: 'user' | 'admin';
  [key: string]: any;
}

// 메인페이지 섹션 타입
export enum SectionType {
  HEADER = 'header',
  BANNER = 'banner',
  HERO = 'hero',
  SEARCH = 'search',
  REGIONAL_TRAVEL = 'regionalTravel',
  TIME_DEAL = 'timeDeal',
  THEME_TRAVEL = 'themeTravel',
  PROMOTION = 'promotion',
  REVIEW = 'review',
  FOOTER = 'footer'
}

export interface Section {
  id: string;
  type: SectionType;
  title: string;
  isFixed: boolean;
  isVisible: boolean;
  order: number;
}

// 메인페이지 레이아웃 설정
export interface MainPageLayout {
  sections: Section[];
}

// 배너 타입 정의
export interface Banner {
  id: string;
  title: string;
  backgroundColor: string;
  imageUrl: string;
  link: string;
  isActive: boolean;
  createdAt: Date;
}
