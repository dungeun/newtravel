'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { getAllCategories } from '@/lib/categories';
import { uploadImage, deleteImage } from '@/utils/local-image-upload';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// 폼 데이터 타입 정의
interface ProductFormData {
  title: string;
  shortDescription: string;
  description: string;
  price: {
    adult: number;
    child: number;
    infant: number;
    currency: string;
  };
  region: string;
  status: 'draft' | 'published' | 'archived';
  duration: {
    days: number;
    nights: number;
  };
  categories: string[];
  images: string[];
  [key: string]: any; // 인덱스 시그니처 추가
}

export default function CreateProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
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
    categories: [],
    images: []
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // 카테고리 데이터 가져오기
  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await getAllCategories();
      return response || [];
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // 중첩된 객체 속성을 위한 처리
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ProductFormData],
          [child]: value
        }
      }));
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
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ProductFormData],
          [child]: Number(value) || 0
        }
      }));
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const files = Array.from(e.target.files);
    setIsLoading(true);
    
    try {
      // 이미지 업로드 및 미리보기 URL 생성
      const uploadPromises = files.map(async (file) => {
        try {
          // 이미지 업로드
          const result = await uploadImage(file, 'products');
          
          // 미리보기 URL 생성 (썸네일이 있으면 썸네일 사용)
          const previewUrl = result.thumbnailUrl || result.url;
          
          return {
            file,
            url: result.url,
            previewUrl,
            fileName: result.fileName,
            originalName: result.originalName
          };
        } catch (error) {
          console.error('이미지 업로드 실패:', file.name, error);
          toast({
            title: `이미지 업로드 실패: ${file.name}`,
            description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
            variant: 'destructive',
          });
          return null;
        }
      });
      
      // 모든 이미지 업로드 완료 대기
      const uploadResults = (await Promise.all(uploadPromises)).filter(Boolean);
      
      // 상태 업데이트
      const newPreviews = uploadResults.map(r => r!.previewUrl);
      const newImageUrls = uploadResults.map(r => r!.url);
      
      setImagePreviews(prev => [...prev, ...newPreviews]);
      
      // 폼 데이터에 이미지 URL 추가
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImageUrls]
      }));
      
      toast({
        title: '이미지 업로드 완료',
        description: `${uploadResults.length}개의 이미지가 업로드되었습니다.`,
      });
      
    } catch (error) {
      console.error('이미지 처리 중 오류 발생:', error);
      toast({
        title: '오류',
        description: '이미지 처리 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = async (index: number) => {
    try {
      const imageUrl = formData.images[index];
      
      // 서버에서 이미지 삭제 시도
      if (imageUrl) {
        await deleteImage(imageUrl);
      }
      
      // 상태에서 제거
      const newPreviews = [...imagePreviews];
      URL.revokeObjectURL(newPreviews[index]); // 메모리 해제
      
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
      
      toast({
        title: '이미지 삭제',
        description: '이미지가 삭제되었습니다.',
      });
      
    } catch (error) {
      console.error('이미지 삭제 중 오류:', error);
      toast({
        title: '오류',
        description: '이미지 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
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

      // 비어있는 이미지 필드를 추가
      const productData = {
        ...formData,
        images: [],
        availability: {
          startDate: new Date(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
        },
        includesTransportation: false,
        includesAccommodation: false,
      };

      // 상품 생성 API 호출
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error('상품 생성 실패');
      }

      const data = await response.json();

      toast({
        title: '성공',
        description: '상품이 성공적으로 생성되었습니다.',
      });

      // 생성된 상품 상세 페이지로 이동
      router.push(`/admin/travel/${data.productId}`);
    } catch (error) {
      console.error('상품 생성 오류:', error);
      toast({
        title: '오류',
        description: '상품 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <Card className="shadow-lg rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">새 상품 등록</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              새로운 여행 상품을 등록합니다. 필수 정보를 모두 입력해주세요.
            </CardDescription>
          </div>
          <Link href="/admin/travel/products" passHref>
            <Button variant="outline">뒤로 가기</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">기본 정보</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-700 dark:text-slate-200">상품명 *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="상품명을 입력하세요"
                    required
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region" className="text-slate-700 dark:text-slate-200">지역</Label>
                  <Input
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    placeholder="여행 지역을 입력하세요"
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortDescription" className="text-slate-700 dark:text-slate-200">간단 설명 *</Label>
                <Input
                  id="shortDescription"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  placeholder="상품에 대한 간단한 설명을 입력하세요"
                  required
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-700 dark:text-slate-200">상세 설명 *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="상품에 대한 상세 설명을 입력하세요"
                  rows={6}
                  required
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
            
            {/* 여행 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">여행 정보</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="duration.days" className="text-slate-700 dark:text-slate-200">여행 일수</Label>
                  <Input
                    id="duration.days"
                    name="duration.days"
                    type="number"
                    min="1"
                    value={formData.duration.days}
                    onChange={handleNumberChange}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration.nights" className="text-slate-700 dark:text-slate-200">숙박 일수</Label>
                  <Input
                    id="duration.nights"
                    name="duration.nights"
                    type="number"
                    min="0"
                    value={formData.duration.nights}
                    onChange={handleNumberChange}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status" className="text-slate-700 dark:text-slate-200">상품 상태</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger id="status" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">임시저장</SelectItem>
                    <SelectItem value="published">공개</SelectItem>
                    <SelectItem value="archived">보관</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  임시저장: 고객에게 보이지 않음, 공개: 고객에게 노출됨, 보관: 비공개 처리
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categories" className="text-slate-700 dark:text-slate-200">카테고리</Label>
                <Select
                  value={formData.categories[0] || ''}
                  onValueChange={(value) => handleSelectChange('categories', [value])}
                >
                  <SelectTrigger id="categories" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
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
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">가격 정보</h3>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price.adult" className="text-slate-700 dark:text-slate-200">성인 가격</Label>
                  <Input
                    id="price.adult"
                    name="price.adult"
                    type="number"
                    min="0"
                    value={formData.price.adult}
                    onChange={handleNumberChange}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price.child" className="text-slate-700 dark:text-slate-200">아동 가격</Label>
                  <Input
                    id="price.child"
                    name="price.child"
                    type="number"
                    min="0"
                    value={formData.price.child}
                    onChange={handleNumberChange}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price.infant" className="text-slate-700 dark:text-slate-200">유아 가격</Label>
                  <Input
                    id="price.infant"
                    name="price.infant"
                    type="number"
                    min="0"
                    value={formData.price.infant}
                    onChange={handleNumberChange}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
            
            {/* 이미지 업로드 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">이미지</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="images" className="cursor-pointer text-slate-700 dark:text-slate-200">
                    <div className="flex h-24 w-24 items-center justify-center rounded-md border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary">
                      <span className="text-3xl">+</span>
                    </div>
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </Label>
                  
                  {/* 이미지 미리보기 */}
                  <div className="flex flex-wrap gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative h-24 w-24 rounded-md overflow-hidden shadow border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold shadow-md"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  이미지는 최대 5MB, JPG, PNG, GIF 형식을 지원합니다.
                </p>
              </div>
            </div>
            
            {/* 저장 버튼 */}
            <div className="flex justify-end gap-2">
              <Link href="/admin/travel/products" passHref>
                <Button variant="outline" type="button">취소</Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '저장 중...' : '상품 저장'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 