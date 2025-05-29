// 주문 관련 타입 정의

// 기본 주문자 정보 타입
export interface OrderCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

// 여행자 정보 타입
export interface Traveler {
  type: 'adult' | 'child' | 'infant';
  name: string;
  gender?: 'male' | 'female' | 'other';
  birthDate?: Date | string;
  passportNumber?: string;
  passportExpiry?: Date | string;
  nationality?: string;
  specialRequests?: string;
}

// 주문 항목 타입
export interface OrderItem {
  productId: string;
  productTitle: string;
  quantity: {
    adult: number;
    child: number;
    infant: number;
  };
  price: {
    adult: number;
    child: number;
    infant: number;
    currency: string;
  };
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
    description?: string;
  };
  subtotal: number;
  travelDate: {
    startDate: Date | string;
    endDate: Date | string;
  };
  travelers?: Traveler[];
}

// 결제 정보 타입
export interface PaymentInfo {
  method: 'credit_card' | 'bank_transfer' | 'paypal' | 'kakao_pay' | 'naver_pay' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
  transactionId?: string;
  paidAmount: number;
  currency: string;
  paidAt?: Date | string;
  receiptUrl?: string;
  refundInfo?: {
    amount: number;
    reason: string;
    date: Date | string;
    status: 'pending' | 'completed' | 'rejected';
  };
}

// 주문 상태 타입
export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'paid' 
  | 'processing' 
  | 'ready' 
  | 'completed' 
  | 'cancelled' 
  | 'refunded';

// 상세 주문 타입(최종)
export interface Order {
  id: string;
  orderNumber: string;
  customer: OrderCustomer;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  payment?: PaymentInfo;
  createdAt: Date | string;
  updatedAt: Date | string;
  specialRequests?: string;
  notes?: string; // 관리자용 내부 메모
  couponCode?: string;
  couponDiscount?: number;
  isBusinessTrip?: boolean;
  taxInvoiceRequested?: boolean;
  history?: {
    status: OrderStatus;
    timestamp: Date | string;
    note?: string; // 상태 변경 사유
  };
} 