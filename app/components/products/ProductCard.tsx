import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { Card, CardContent } from '@/components/ui/card';

// 상품 타입 정의 개선
interface TravelProduct {
  id: string;
  title: string;
  description?: string;
  price: {
    adult: number;
    child?: number;
    infant?: number;
    fuelSurcharge?: number;
  };
  images?: {
    src: string;
    alt?: string;
    localPath?: string;
  }[];
  region?: string;
  isTimeDeal?: boolean;
  createdAt?: string;
}

interface ProductCardProps {
  product: TravelProduct;
  showAddToCart?: boolean;
}

export default function ProductCard({ product, showAddToCart = true }: ProductCardProps) {
  const { addToCart } = useCart();
  const [showForm, setShowForm] = useState(false);
  const [adult, setAdult] = useState(1);
  const [child, setChild] = useState(0);
  const [infant, setInfant] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [success, setSuccess] = useState('');

  // 이미지 URL 안전하게 가져오기
  const getImageUrl = () => {
    if (!product.images || product.images.length === 0) return '/no-image.png';
    return product.images[0].src || product.images[0].localPath || '/no-image.png';
  };

  const handleAddToCart = () => {
    if (!startDate || !endDate) {
      setSuccess('여행 기간을 선택하세요.');
      return;
    }
    
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price.adult,
      quantity: adult,
      image: getImageUrl(),
      product,
      startDate,
      endDate,
      options: { adult, child, infant },
    });
    
    setSuccess('장바구니에 담았습니다!');
    setShowForm(false);
    setTimeout(() => setSuccess(''), 2000);
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <Link href={`/travel/products/${product.id}`} className="block">
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={getImageUrl()}
            alt={product.images?.[0]?.alt || product.title}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {product.isTimeDeal && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
              타임딜
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.title}</h3>
            {product.region && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {product.region}
              </span>
            )}
          </div>
          <div className="text-blue-600 font-bold mb-1">{product.price.adult.toLocaleString()}원~</div>
          {product.description && (
            <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>
          )}
        </div>

        {showAddToCart && (
          <>
            <button
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={() => setShowForm(v => !v)}
            >
              {showForm ? '닫기' : '장바구니 담기'}
            </button>

            {showForm && (
              <div className="mt-3 p-3 border rounded bg-gray-50 space-y-2">
                <div className="flex gap-2 items-center">
                  <label className="text-sm">성인</label>
                  <input 
                    type="number" 
                    min={1} 
                    value={adult} 
                    onChange={e => setAdult(Number(e.target.value))} 
                    className="w-14 border rounded px-1"
                  />
                  <label className="text-sm">아동</label>
                  <input 
                    type="number" 
                    min={0} 
                    value={child} 
                    onChange={e => setChild(Number(e.target.value))} 
                    className="w-14 border rounded px-1"
                  />
                  <label className="text-sm">유아</label>
                  <input 
                    type="number" 
                    min={0} 
                    value={infant} 
                    onChange={e => setInfant(Number(e.target.value))} 
                    className="w-14 border rounded px-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm block">여행 시작</label>
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={e => setStartDate(e.target.value)} 
                      className="w-full border rounded px-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm block">여행 종료</label>
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={e => setEndDate(e.target.value)} 
                      className="w-full border rounded px-1"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition flex-1"
                    onClick={handleAddToCart}
                  >
                    추가
                  </button>
                  <button 
                    className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
                    onClick={() => setShowForm(false)}
                  >
                    취소
                  </button>
                </div>
                
                {success && (
                  <div className="text-green-600 text-sm mt-1 bg-green-50 p-2 rounded border border-green-100">
                    {success}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 