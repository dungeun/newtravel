// 상품 카테고리 타입
export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  imageUrl?: string;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
} 