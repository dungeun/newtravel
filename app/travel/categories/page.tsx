'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';

interface TravelProduct {
  id: string;
  title: string;
  description: string;
  price: {
    adult: number;
    child: number;
    infant: number;
    fuelSurcharge: number;
  };
  images: {
    src: string;
    alt: string;
    localPath: string;
  }[];
  createdAt: string;
}

interface TravelCategory {
  id: string;
  name: string;
  description?: string;
  url: string;
  imageUrl?: string;
}

type ViewMode = 'grid' | 'list';

export default function TravelCategories() {
  const [products, setProducts] = useState<TravelProduct[]>([]);
  const [categories, setCategories] = useState<TravelCategory[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState(true);

  // 카테고리 목록 가져오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const categoriesRef = collection(db, 'travel_board_categories');
        const categoriesQuery = query(categoriesRef);
        const querySnapshot = await getDocs(categoriesQuery);
        
        const categoriesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as TravelCategory[];
        
        setCategories(categoriesData);
      } catch (error) {
        console.error('카테고리 데이터 가져오기 실패:', error);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // 인기 상품 가져오기
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'travel_products'));
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as TravelProduct[];
        
        // 최신순으로 최대 6개만 표시
        setProducts(productsData.slice(0, 6));
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      }
    };

    fetchProducts();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <div className="size-12 animate-spin rounded-full border-y-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">여행 카테고리</h1>
        <div className="flex items-center gap-2 rounded-lg border p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-lg p-2 ${
              viewMode === 'grid'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="썸네일 보기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-lg p-2 ${
              viewMode === 'list'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="목록 보기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 카테고리 목록 */}
      <div className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">여행 카테고리</h2>
        {categories.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">등록된 여행 카테고리가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map(category => (
              <Link 
                key={category.id} 
                href={`/travel/${category.url}`} 
                className="block overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={category.imageUrl || '/placeholder-category.jpg'}
                    alt={category.name}
                    className="h-48 w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="mb-2 text-xl font-semibold">{category.name}</h3>
                  {category.description && (
                    <p className="mb-4 line-clamp-2 text-gray-600">{category.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 인기 상품 섹션 */}
      <div>
        <h2 className="mb-4 text-2xl font-semibold">인기 여행 상품</h2>
        {products.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">등록된 여행 상품이 없습니다.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map(product => (
              <div
                key={product.id}
                className="relative overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
              >
                <Link href={`/travel/products/${product.id}`} className="block">
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={product.images[0]?.localPath || '/placeholder.jpg'}
                      alt={product.images[0]?.alt || product.title}
                      className="h-48 w-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="mb-2 line-clamp-2 text-xl font-semibold">{product.title}</h2>
                    <p className="mb-4 line-clamp-2 text-gray-600">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-blue-600">
                          {formatPrice(product.price.adult)}원
                        </p>
                        <p className="text-sm text-gray-500">성인 기준</p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {products.map(product => (
              <div
                key={product.id}
                className="relative overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
              >
                <Link href={`/travel/products/${product.id}`} className="block">
                  <div className="flex">
                    <div className="h-32 w-48 shrink-0">
                      <img
                        src={product.images[0]?.localPath || '/placeholder.jpg'}
                        alt={product.images[0]?.alt || product.title}
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="mb-2 text-xl font-semibold">{product.title}</h2>
                          <p className="mb-2 line-clamp-2 text-gray-600">{product.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">
                            {formatPrice(product.price.adult)}원
                          </p>
                          <p className="text-sm text-gray-500">성인 기준</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>아동: {formatPrice(product.price.child)}원</span>
                          <span>유아: {formatPrice(product.price.infant)}원</span>
                          <span>유류할증료: {formatPrice(product.price.fuelSurcharge)}원</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 정적 페이지 재검증 설정
export const dynamic = 'force-dynamic';
export const revalidate = 60; // 60초마다 재검증
