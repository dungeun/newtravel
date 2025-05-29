// 재고(Inventory) 타입
export interface Inventory {
  id: string;
  productId: string;
  date: Date | string; // 출발일 등
  option?: string; // 객실타입 등 옵션
  totalStock: number;
  availableStock: number;
  reservedStock: number;
  updatedAt: Date | string;
} 