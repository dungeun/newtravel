'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { TravelProduct } from '@/types/product';

// Format price utility function
const formatPrice = (price?: number): string => {
  if (price === undefined) return '가격 문의';
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0
  }).format(price);
};

interface ProductsListProps {
  products: TravelProduct[];
  onResetFilters: () => void;
}

const ProductsList: React.FC<ProductsListProps> = ({ products, onResetFilters }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">상품이 없습니다.</p>
        <Button onClick={onResetFilters} variant="outline">
          필터 초기화
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
          <Link href={`/travel/products/${product.id}`} className="flex flex-col h-full">
            <div className="relative aspect-video">
              <Image
                src={product.images && product.images.length > 0 ? 
                  (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url) : 
                  '/images/placeholder.svg'}
                alt={product.title || '상품 이미지'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
              />
              {product.isBestSeller && (
                <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
                  베스트셀러
                </Badge>
              )}
              {product.isTimeDeal && (
                <Badge className="absolute top-2 left-2 bg-blue-500 hover:bg-blue-600">
                  타임딜
                </Badge>
              )}
            </div>
            <div className="flex-grow p-4 flex flex-col">
              <CardHeader className="p-0 mb-2">
                <CardTitle className="text-lg line-clamp-1">
                  {product.title || '제목 없음'}
                </CardTitle>
                {product.description && (
                  <CardDescription className="line-clamp-2 text-sm">
                    {product.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="p-0 mt-auto">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">{product.region || '지역 정보 없음'}</p>
                    {product.duration?.days && (
                      <p className="text-sm text-gray-500">
                        {product.duration.days}박 {product.duration.days + 1}일
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {product.price?.adult ? `${formatPrice(product.price.adult)}~` : '가격 문의'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </div>
          </Link>
          <CardFooter className="flex justify-between mt-auto border-t p-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/travel/products/${product.id}`}>
                자세히 보기
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/travel/checkout?productId=${product.id}`}>
                예약하기
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ProductsList;
