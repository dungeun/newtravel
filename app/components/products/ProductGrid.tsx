'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Product } from '@/types/product';

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
  onResetFilters?: () => void;
}

export default function ProductGrid({ 
  products, 
  emptyMessage = '검색 결과가 없습니다.',
  onResetFilters 
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center h-60">
          <p className="text-lg text-gray-500">{emptyMessage}</p>
          {onResetFilters && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={onResetFilters}
            >
              필터 초기화
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/travel/products/${product.id}`} passHref>
      <Card className="overflow-hidden h-full flex flex-col cursor-pointer transition-all duration-200 hover:shadow-lg">
        <div className="h-48 overflow-hidden relative">
          {product.mainImage ? (
            <img 
              src={product.mainImage.url} 
              alt={product.mainImage.alt || product.title} 
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">이미지 없음</span>
            </div>
          )}
          
          {/* 특별 상품 배지 */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {product.isBestSeller && (
              <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded font-medium">인기상품</span>
            )}
            {product.isTimeDeal && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">타임딜</span>
            )}
          </div>
        </div>
        
        <CardContent className="p-4 flex-grow flex flex-col">
          {/* 지역 배지 */}
          {product.region && (
            <div className="mb-2">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {product.region}
              </span>
            </div>
          )}
          
          {/* 제목 및 설명 */}
          <h3 className="font-semibold text-lg mb-1 line-clamp-2">{product.title}</h3>
          {product.shortDescription && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.shortDescription}</p>
          )}
          
          {/* 하단 정보 */}
          <div className="mt-auto">
            <div className="flex justify-between items-center">
              <div className="text-gray-600 text-sm">
                {product.duration?.days && product.duration?.nights ? (
                  <span>{product.duration.days}일 {product.duration.nights}박</span>
                ) : null}
              </div>
              <div className="text-xl font-bold">
                {product.price?.adult ? (
                  <>
                    {product.price.adult.toLocaleString()}
                    <span className="text-sm font-normal">원~</span>
                  </>
                ) : (
                  '가격정보없음'
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
} 