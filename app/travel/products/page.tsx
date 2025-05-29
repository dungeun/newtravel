'use client';

import { useState, useCallback, useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import ProductsList from '@/components/products/ProductsList';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import type { TravelProduct } from '@/types/product';

// 필터 값 타입 정의
interface FilterValues {
  region: string;
  minPrice: string;
  maxPrice: string;
  duration: string;
  theme: string;
  sortBy: 'price-asc' | 'price-desc' | 'newest' | 'popular';
}

export default function ProductsPage() {
  // 필터 상태 관리
  const [filterValues, setFilterValues] = useState<FilterValues>({
    region: '',
    minPrice: '',
    maxPrice: '',
    duration: '',
    theme: '',
    sortBy: 'newest',
  });

  // React Query 필터 상태
  const [queryFilters, setQueryFilters] = useState<{
    sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'popular';
    region?: string;
    minPrice?: number;
    maxPrice?: number;
    category?: string;
    isBestSeller?: boolean;
    isTimeDeal?: boolean;
  }>({
    sortBy: 'newest',
  });

  // 페이지네이션을 위한 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // 상품 데이터 가져오기
  const { data: productsData, isLoading, error } = useProducts(queryFilters);
  const products: TravelProduct[] = productsData || [];

  // 필터링된 상품 목록
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];
    
    let result = [...products];
    
    // 지역 필터링
    if (filterValues.region) {
      result = result.filter(product => product.region === filterValues.region);
    }
    
    // 가격 필터링
    if (filterValues.minPrice) {
      const min = Number(filterValues.minPrice);
      result = result.filter(product => (product.price?.adult || 0) >= min);
    }
    
    if (filterValues.maxPrice) {
      const max = Number(filterValues.maxPrice);
      result = result.filter(product => (product.price?.adult || 0) <= max);
    }
    
    // 테마 필터링
    if (filterValues.theme) {
      result = result.filter(product => 
        filterValues.theme && product.categories?.includes(filterValues.theme)
      );
    }
    
    // 정렬
    if (filterValues.sortBy === 'price-asc') {
      result.sort((a, b) => (a.price?.adult || 0) - (b.price?.adult || 0));
    } else if (filterValues.sortBy === 'price-desc') {
      result.sort((a, b) => (b.price?.adult || 0) - (a.price?.adult || 0));
    } else if (filterValues.sortBy === 'newest') {
      result.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    }
    
    return result;
  }, [products, filterValues]);

  // 현재 페이지의 상품 목록
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // 필터 초기화
  const handleResetFilters = useCallback(() => {
    setFilterValues({
      region: '',
      minPrice: '',
      maxPrice: '',
      duration: '',
      theme: '',
      sortBy: 'newest',
    });
    setQueryFilters({ sortBy: 'newest' });
  }, []);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 에러 발생 시
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">상품을 불러오는 중 오류가 발생했습니다.</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          다시 시도하기
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">여행 상품</h1>
      
      {/* 필터 섹션 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">필터</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 지역 필터 */}
          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
              지역
            </label>
            <select
              id="region"
              value={filterValues.region}
              onChange={(e) => setFilterValues(prev => ({ ...prev, region: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            >
              <option value="">전체 지역</option>
              <option value="제주도">제주도</option>
              <option value="부산">부산</option>
              <option value="경주">경주</option>
              <option value="강원도">강원도</option>
              <option value="전주">전주</option>
            </select>
          </div>
          
          {/* 가격 범위 필터 */}
          <div className="flex space-x-2">
            <div className="flex-1">
              <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
                최소 가격
              </label>
              <input
                type="number"
                id="minPrice"
                value={filterValues.minPrice}
                onChange={(e) => setFilterValues(prev => ({ ...prev, minPrice: e.target.value }))}
                placeholder="최소 가격"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
                최대 가격
              </label>
              <input
                type="number"
                id="maxPrice"
                value={filterValues.maxPrice}
                onChange={(e) => setFilterValues(prev => ({ ...prev, maxPrice: e.target.value }))}
                placeholder="최대 가격"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          {/* 테마 필터 */}
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
              테마
            </label>
            <select
              id="theme"
              value={filterValues.theme}
              onChange={(e) => setFilterValues(prev => ({ ...prev, theme: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            >
              <option value="">전체 테마</option>
              <option value="자연">자연</option>
              <option value="역사">역사</option>
              <option value="체험">체험</option>
              <option value="휴양">휴양</option>
              <option value="맛집">맛집</option>
            </select>
          </div>
          
          {/* 정렬 기준 */}
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
              정렬 기준
            </label>
            <select
              id="sortBy"
              value={filterValues.sortBy}
              onChange={(e) => setFilterValues(prev => ({
                ...prev,
                sortBy: e.target.value as 'price-asc' | 'price-desc' | 'newest' | 'popular'
              }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            >
              <option value="newest">최신순</option>
              <option value="price-asc">낮은 가격순</option>
              <option value="price-desc">높은 가격순</option>
              <option value="popular">인기순</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button 
            onClick={handleResetFilters}
            variant="outline"
            className="ml-2"
          >
            필터 초기화
          </Button>
        </div>
      </div>
      
      {/* 상품 목록 */}
      <div className="w-full">
        <ProductsList 
          products={currentProducts} 
          onResetFilters={handleResetFilters}
        />
      </div>
      
      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(pageNum);
                      }}
                      isActive={pageNum === currentPage}
                      className={pageNum === currentPage ? 'bg-primary text-primary-foreground' : ''}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) handlePageChange(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

// 동적 페이지로 설정 (정적 생성 방지)
export const dynamic = 'force-dynamic';
export const revalidate = false;
