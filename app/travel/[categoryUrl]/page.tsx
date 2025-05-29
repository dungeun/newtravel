'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  getCountFromServer,
  doc,
  getDoc,
} from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';

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
  description: string;
  url: string;
  products?: string[]; // 상품 ID 목록
}

type ViewMode = 'grid' | 'list';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryUrl = params.categoryUrl as string;
  
  const [products, setProducts] = useState<TravelProduct[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;
  
  // 페이지네이션 계산
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  // 카테고리 및 상품 정보 가져오기
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setIsLoading(true);
        // 카테고리 정보 가져오기
        const categoriesRef = collection(db, 'travel_board_categories');
        const q = query(categoriesRef, where('url', '==', categoryUrl));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const categoryData = querySnapshot.docs[0].data() as TravelCategory;
          categoryData.id = querySnapshot.docs[0].id;
          setCategoryName(categoryData.name);
          setCategoryDescription(categoryData.description || '');

          // 카테고리에 상품이 없는 경우
          if (!categoryData.products || categoryData.products.length === 0) {
            setProducts([]);
            setTotalProducts(0);
            setIsLoading(false);
            return;
          }

          // 해당 카테고리에 속한 상품 ID 목록
          const productIds = categoryData.products || [];
          setTotalProducts(productIds.length);

          // 페이지네이션 적용 - 현재 페이지에 해당하는 상품 ID만 선택
          const start = (currentPage - 1) * productsPerPage;
          const end = Math.min(start + productsPerPage, productIds.length);
          const currentPageProductIds = productIds.slice(start, end);
          
          // 상품 정보 가져오기
          const productsData: TravelProduct[] = [];

          for (const productId of currentPageProductIds) {
            try {
              const productDoc = await getDoc(doc(db, 'travel_products', productId));
              if (productDoc.exists()) {
                productsData.push({
                  id: productDoc.id,
                  ...productDoc.data(),
                } as TravelProduct);
              }
            } catch (error) {
              console.error(`상품 ID ${productId} 가져오기 실패:`, error);
            }
          }
          
          setProducts(productsData);
        } else {
          // 카테고리를 찾을 수 없을 때 처리
          console.error('카테고리를 찾을 수 없습니다:', categoryUrl);
          router.push('/travel/categories');
        }
      } catch (error) {
        console.error('카테고리 데이터 가져오기 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryData();
  }, [categoryUrl, currentPage, router]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

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
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <Link 
            href="/travel/categories" 
            className="text-sm text-gray-500 hover:text-blue-600"
          >
            여행 카테고리
          </Link>
          <span className="text-sm text-gray-400">/</span>
          <span className="text-sm font-medium text-gray-800">{categoryName}</span>
        </div>
        <h1 className="text-3xl font-bold">{categoryName}</h1>
        {categoryDescription && (
          <p className="mt-2 text-gray-600">{categoryDescription}</p>
        )}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          총 <span className="font-medium">{totalProducts}</span>개의 상품
        </div>
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
                    src={product.images[0]?.src || '/placeholder.jpg'}
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
                      src={product.images[0]?.src || '/placeholder.jpg'}
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

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              이전
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = currentPage - 2 + i;
              if (pageNum > 0 && pageNum <= totalPages) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`rounded-md px-3 py-1 text-sm font-medium ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              return null;
            })}
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 정적 페이지 재검증 설정
export const revalidate = 60; // 60초마다 재검증