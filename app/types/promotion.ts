// 프로모션/쿠폰 타입
export interface Promotion {
  id: string;
  title: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'coupon';
  value: number;
  code?: string; // 쿠폰 코드
  startDate: Date | string;
  endDate: Date | string;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  applicableProductIds?: string[];
  applicableCategoryIds?: string[];
  usageLimit?: number;
  usedCount?: number;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
} 