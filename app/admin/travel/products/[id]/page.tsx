'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { getProductById, deleteProduct } from '@/lib/products';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const productId = params.id;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // 상품 정보 가져오기
  const { data: product, isLoading, error, refetch } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await getProductById(productId);
      return response;
    },
    enabled: !!productId,
  });

  // 상품 삭제 핸들러
  const handleDeleteProduct = async () => {
    try {
      const success = await deleteProduct(productId);

      if (!success) {
        throw new Error('상품 삭제 실패');
      }

      toast({
        title: '성공',
        description: '상품이 성공적으로 삭제되었습니다.',
      });
      
      setIsDeleteDialogOpen(false);
      router.push('/admin/travel/products');
    } catch (error) {
      console.error('상품 삭제 오류:', error);
      toast({
        title: '오류',
        description: '상품 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">상품 정보 로딩 중...</div>;
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">상품 상세</CardTitle>
            <CardDescription>상품을 찾을 수 없거나 오류가 발생했습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end">
              <Link href="/admin/travel/products" passHref>
                <Button variant="outline">목록으로 돌아가기</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">{product.title}</CardTitle>
            <CardDescription>{product.shortDescription}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/travel/products" passHref>
              <Button variant="outline">목록</Button>
            </Link>
            <Link href={`/admin/travel/products/${productId}/edit`} passHref>
              <Button variant="outline">수정</Button>
            </Link>
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              삭제
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div className="rounded-md border p-4">
              <h3 className="mb-4 text-lg font-semibold">기본 정보</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">상품명</p>
                  <p>{product.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">상태</p>
                  <Badge variant={product.status === 'published' ? 'default' : 'secondary'}>
                    {product.status === 'published' ? '공개' : 
                    product.status === 'draft' ? '임시저장' : '비공개'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">지역</p>
                  <p>{product.region || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">여행 기간</p>
                  <p>{product.duration?.days}일 {product.duration?.nights}박</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">간단 설명</p>
                  <p>{product.shortDescription}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">상세 설명</p>
                  <p className="whitespace-pre-wrap">{product.description}</p>
                </div>
              </div>
            </div>

            {/* 가격 정보 */}
            <div className="rounded-md border p-4">
              <h3 className="mb-4 text-lg font-semibold">가격 정보</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">성인 가격</p>
                  <p>{new Intl.NumberFormat('ko-KR', {
                    style: 'currency',
                    currency: product.price?.currency || 'KRW'
                  }).format(product.price?.adult || 0)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">아동 가격</p>
                  <p>{new Intl.NumberFormat('ko-KR', {
                    style: 'currency',
                    currency: product.price?.currency || 'KRW'
                  }).format(product.price?.child || 0)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">유아 가격</p>
                  <p>{new Intl.NumberFormat('ko-KR', {
                    style: 'currency',
                    currency: product.price?.currency || 'KRW'
                  }).format(product.price?.infant || 0)}</p>
                </div>
              </div>
            </div>

            {/* 카테고리 정보 */}
            {product.categories && product.categories.length > 0 && (
              <div className="rounded-md border p-4">
                <h3 className="mb-4 text-lg font-semibold">카테고리</h3>
                <div className="flex flex-wrap gap-2">
                  {product.categories.map((category, index) => (
                    <Badge key={index} variant="outline">{category}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 이미지 정보 (있을 경우) */}
            {product.images && product.images.length > 0 && (
              <div className="rounded-md border p-4">
                <h3 className="mb-4 text-lg font-semibold">이미지</h3>
                <div className="grid grid-cols-3 gap-4">
                  {product.images.map((image, index) => (
                    <div key={index} className="relative aspect-video overflow-hidden rounded-md">
                      <img 
                        src={typeof image === 'string' ? image : image.url} 
                        alt={typeof image === 'string' ? `상품 이미지 ${index + 1}` : image.alt || `상품 이미지 ${index + 1}`} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 등록 정보 */}
            <div className="rounded-md border p-4">
              <h3 className="mb-4 text-lg font-semibold">등록 정보</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">등록일</p>
                  <p>{product.createdAt ? new Date(product.createdAt).toLocaleString() : '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">마지막 업데이트</p>
                  <p>{product.updatedAt ? new Date(product.updatedAt).toLocaleString() : '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>상품 삭제</DialogTitle>
            <DialogDescription>
              정말로 "{product.title}" 상품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 