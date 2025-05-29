'use client';

import Link from 'next/link';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '@/lib/store/cartStore';

export default function TravelHeader() {
  const { items } = useCartStore();
  const cartCount = items.reduce((sum, item) => sum + item.quantity.adult + item.quantity.child + item.quantity.infant, 0);

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-white">여행 상품 플러그인</h1>
      <Link href="/travel/cart" className="relative ml-4">
        <ShoppingCartIcon className="w-7 h-7 text-white" />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
            {cartCount}
          </span>
        )}
      </Link>
    </div>
  );
} 