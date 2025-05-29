'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { getAllProducts } from '@/lib/products';
import { TravelProduct } from '@/types/product';
import { DataTable } from '@/components/ui/data-table/data-table';
import { getProductColumns } from '@/components/ui/data-table/product-columns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminProductsPage() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<TravelProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [filteredProducts, setFilteredProducts] = useState<TravelProduct[]>([]);

  // React Query를 사용하여 상품 데이터 가져오기
  const { data: products, isLoading, error, refetch } = useQuery<TravelProduct[]>({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const response = await getAllProducts();
      return response;
    }
  });

  // 검색 및 필터링 적용
  useEffect(() => {
    if (!products) return;

    let result = [...products];

    // 상태 필터링
    if (statusFilter !== 'all') {
      result = result.filter(product => product.status === statusFilter);
    }

    // 지역 필터링
    if (regionFilter !== 'all') {
      result = result.filter(product => product.region === regionFilter);
    }

    // 검색어 필터링 (제목, 설명, 지역 검색)
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.title.toLowerCase().includes(query) || 
        (product.shortDescription && product.shortDescription.toLowerCase().includes(query)) ||
        (product.region && product.region.toLowerCase().includes(query))
      );
    }

    setFilteredProducts(result);
  }, [products, searchQuery, statusFilter, regionFilter]);

  // 고유 지역 목록 가져오기
  const regions = products ? 
    ['all', ...Array.from(new Set(products.filter(p => p.region).map(p => p.region)))] : 
    ['all'];

  // 상품 삭제 핸들러
  const handleDeleteProduct = (product: TravelProduct) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  // 상품 삭제 확인 핸들러
  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('상품 삭제 실패');

      toast({
        title: '성공',
        description: '상품이 성공적으로 삭제되었습니다.',
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      refetch(); // 데이터 새로고침
    } catch (error) {
      console.error('상품 삭제 오류:', error);
      toast({
        title: '오류',
        description: '상품 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 컬럼 정의
  const columns = getProductColumns({
    onDelete: handleDeleteProduct,
  });

  if (isLoading) return <div className="flex h-screen items-center justify-center">로딩 중...</div>;
  
  if (error) return (
    <div className="mx-auto max-w-7xl p-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">상품 관리</CardTitle>
          <CardDescription>오류가 발생했습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">상품 데이터를 불러오는 중 오류가 발생했습니다.</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl p-6">
      <Card className="shadow-lg rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">상품 관리</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              여행 상품을 관리합니다. 새 상품을 추가하거나 기존 상품을 편집, 삭제할 수 있습니다.
            </CardDescription>
          </div>
          <Link href="/admin/travel/products/create" passHref>
            <Button variant="default">새 상품 추가</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {/* 검색 및 필터 컨트롤 */}
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="search" className="text-slate-700 dark:text-slate-200">상품 검색</Label>
              <Input
                id="search"
                placeholder="제목, 설명, 지역 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <Label htmlFor="status-filter" className="text-slate-700 dark:text-slate-200">상태 필터</Label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger id="status-filter" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" >
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 상태</SelectItem>
                  <SelectItem value="published">공개</SelectItem>
                  <SelectItem value="draft">임시저장</SelectItem>
                  <SelectItem value="archived">보관</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="region-filter" className="text-slate-700 dark:text-slate-200">지역 필터</Label>
              <Select
                value={regionFilter}
                onValueChange={setRegionFilter}
              >
                <SelectTrigger id="region-filter" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                  <SelectValue placeholder="지역 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 지역</SelectItem>
                  {regions.filter(r => r !== 'all').map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* 데이터 테이블로 상품 목록 표시 */}
          <DataTable 
            columns={columns} 
            data={filteredProducts || []}
            emptyMessage="검색 결과가 없습니다."
          />
          {/* 삭제 확인 다이얼로그 */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-slate-900 dark:text-slate-100">상품 삭제</DialogTitle>
                <DialogDescription className="text-slate-600 dark:text-slate-400">
                  정말로 "{selectedProduct?.title}" 상품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  취소
                </Button>
                <Button variant="destructive" onClick={handleConfirmDelete}>
                  삭제
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
} 