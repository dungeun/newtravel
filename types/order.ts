export interface OrderItem {
  id: string;
  productId: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  options?: {
    name: string;
    value: string;
    price?: number;
  }[];
}

export interface Payment {
  method: 'credit_card' | 'bank_transfer' | 'kakao_pay' | 'naver_pay' | string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  paidAt?: string | Date;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'paid' | 'processing' | 'ready' | 'completed' | 'cancelled' | 'refunded';
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  payment?: Payment;
  createdAt: string | Date;
  updatedAt: string | Date;
  shippingAddress?: {
    name: string;
    phone: string;
    address: string;
    postalCode?: string;
  };
  billingAddress?: {
    name: string;
    phone: string;
    address: string;
    postalCode?: string;
  };
  notes?: string;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
