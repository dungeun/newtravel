'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { getProductById, updateProduct } from '@/lib/products';
import { getAllCategories } from '@/lib/categories';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TravelProduct } from '@/types/product';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const productId = params.id;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<TravelProduct>>({
    title: '',
    shortDescription: '',
    description: '',
    price: {
      adult: 0,
      child: 0,
      infant: 0,
      currency: 'KRW'
    },
    region: '',
    status: 'draft',
    duration: {
      days: 1,
      nights: 0
    },
    categories: []
  });

  // 상품 정보 가져오기
  const { data: product, isLoading: isProductLoading, error: productError } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await getProductById(productId);
      return response;
    },
    enabled: !!productId,
  });

  // 카테고리 데이터 가져오기
  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await getAllCategories();
      return response || [];
    }
  });

  // 상품 데이터로 폼 초기화
  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // 중첩된 객체 속성을 위한 처리
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        const newFormData = { ...prev };
        if (!newFormData[parent as keyof TravelProduct]) {
          newFormData[parent as keyof TravelProduct] = {} as any;
        }
        (newFormData[parent as keyof TravelProduct] as any)[child] = value;
        return newFormData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // 가격 및 일수 필드에 대한 숫자 처리
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        const newFormData = { ...prev };
        if (!newFormData[parent as keyof TravelProduct]) {
          newFormData[parent as keyof TravelProduct] = {} as any;
        }
        (newFormData[parent as keyof TravelProduct] as any)[child] = Number(value) || 0;
        return newFormData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: Number(value) || 0
      }));
    }
  };

  const handleSelectChange = (name: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 기본 필드 검증
      if (!formData.title || !formData.shortDescription || !formData.description) {
        toast({
          title: '오류',
          description: '제목, 짧은 설명, 상세 설명은 필수 항목입니다.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // 상품 업데이트 API 호출
      const response = await updateProduct(productId, formData);

      if (!response) {
        throw new Error('상품 업데이트 실패');
      }

      toast({
        title: '성공',
        description: '상품이 성공적으로 업데이트되었습니다.',
      });

      // 상품 상세 페이지로 이동
      router.push(`/admin/travel/products/${productId}`);
    } catch (error) {
      console.error('상품 업데이트 오류:', error);
      toast({
        title: '오류',
        description: '상품 업데이트 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isProductLoading) {
    return <div className="flex h-screen items-center justify-center">상품 정보 로딩 중...</div>;
  }

  if (productError || !product) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">상품 편집</CardTitle>
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
            <CardTitle className="text-2xl font-bold">상품 편집</CardTitle>
            <CardDescription>
              상품 정보를 수정합니다. 필수 정보를 모두 입력해주세요.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/admin/travel/products/${productId}`} passHref>
              <Button variant="outline">상세보기</Button>
            </Link>
            <Link href="/admin/travel/products" passHref>
              <Button variant="outline">목록</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">기본 정보</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">상품명 *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="상품명을 입력하세요"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="region">지역</Label>
                  <Input
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    placeholder="여행 지역을 입력하세요"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shortDescription">간단 설명 *</Label>
                <Input
                  id="shortDescription"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  placeholder="상품에 대한 간단한 설명을 입력하세요"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">상세 설명 *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="상품에 대한 상세 설명을 입력하세요"
                  rows={6}
                  required
                />
              </div>
            </div>
            
            {/* 여행 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">여행 정보</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="duration.days">여행 일수</Label>
                  <Input
                    id="duration.days"
                    name="duration.days"
                    type="number"
                    min="1"
                    value={formData.duration?.days}
                    onChange={handleNumberChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration.nights">숙박 일수</Label>
                  <Input
                    id="duration.nights"
                    name="duration.nights"
                    type="number"
                    min="0"
                    value={formData.duration?.nights}
                    onChange={handleNumberChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">상품 상태</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">임시저장</SelectItem>
                    <SelectItem value="published">공개</SelectItem>
                    <SelectItem value="archived">보관</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  임시저장: 고객에게 보이지 않음, 공개: 고객에게 노출됨, 보관: 비공개 처리
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categories">카테고리</Label>
                <Select
                  value={formData.categories?.[0] || ''}
                  onValueChange={(value) => handleSelectChange('categories', [value])}
                >
                  <SelectTrigger id="categories">
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* 가격 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">가격 정보</h3>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price.adult">성인 가격</Label>
                  <Input
                    id="price.adult"
                    name="price.adult"
                    type="number"
                    min="0"
                    value={formData.price?.adult}
                    onChange={handleNumberChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price.child">아동 가격</Label>
                  <Input
                    id="price.child"
                    name="price.child"
                    type="number"
                    min="0"
                    value={formData.price?.child}
                    onChange={handleNumberChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price.infant">유아 가격</Label>
                  <Input
                    id="price.infant"
                    name="price.infant"
                    type="number"
                    min="0"
                    value={formData.price?.infant}
                    onChange={handleNumberChange}
                  />
                </div>
              </div>
            </div>
            
            {/* 저장 버튼 */}
            <div className="flex justify-end gap-2">
              <Link href={`/admin/travel/products/${productId}`} passHref>
                <Button variant="outline" type="button">취소</Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '저장 중...' : '변경사항 저장'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 