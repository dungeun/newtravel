"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cartStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  CalendarIcon, MapPinIcon, ClockIcon, CheckIcon, XIcon, 
  InfoIcon, HeartIcon, LoaderIcon, Share2Icon 
} from "lucide-react";
import { useProductDetail } from "@/hooks/useProducts";
import { Product } from "@/types/product";
import { useToast } from "@/components/ui/use-toast";
import { useProducts } from "@/hooks/useProducts";
import Link from "next/link";
import ReviewList from '@/travel/product/components/reviews/ReviewList';

// Product 인터페이스 확장
interface ProductWithDetails extends Product {
  schedule?: Array<{
    day: string;
    content: string;
    places?: string[];
  }>;
  includes?: string[];
  excludes?: string[];
  notes?: string[];
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Array.isArray(id) ? id[0] : id;
  const { toast } = useToast();
  
  // React Query를 사용해 상품 정보 가져오기
  const { 
    data: product, 
    isLoading, 
    error 
  } = useProductDetail(productId) as { 
    data: ProductWithDetails | undefined; 
    isLoading: boolean; 
    error: unknown;
  };
  
  const addItem = useCartStore(s => s.addItem);
  
  // 주문 관련 상태
  const [activeImage, setActiveImage] = useState(0);
  const [adult, setAdult] = useState(1);
  const [child, setChild] = useState(0);
  const [infant, setInfant] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 총 주문 금액 계산
  const calculateTotalPrice = () => {
    if (!product || !product.price) return 0;
    
    const adultPrice = (product.price.adult || 0) * adult;
    const childPrice = (product.price.child || 0) * child;
    const infantPrice = (product.price.infant || 0) * infant;
    const fuelCharge = (adult + child) * (product.price.fuelSurcharge as number || 0);
    
    return adultPrice + childPrice + infantPrice + fuelCharge;
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (!startDate || !endDate) {
      toast({
        title: "여행 날짜를 선택하세요",
        variant: "destructive",
      });
      return;
    }
    
    addItem(
      product as any,
      { adult, child, infant },
      { startDate, endDate }
    );
    
    toast({
      title: "장바구니에 추가되었습니다",
      description: `${product.title}이(가) 장바구니에 추가되었습니다.`,
    });
  };

  // 상품 공유 기능
  const handleShare = async () => {
    if (!product) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.shortDescription || product.title,
          url: window.location.href,
        });
      } catch (err) {
        toast({
          title: "공유 중 오류가 발생했습니다",
          variant: "destructive",
        });
      }
    } else {
      // 클립보드에 URL 복사
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "URL이 클립보드에 복사되었습니다",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <LoaderIcon className="mx-auto mb-4 size-12 animate-spin text-blue-500" />
          <p className="text-gray-600">상품 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="max-w-md rounded-lg bg-red-50 p-6 text-center">
          <div className="mb-4 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-medium text-gray-900">상품을 찾을 수 없습니다</h3>
          <p className="mb-4 text-gray-600">상품 정보를 불러오는 중 오류가 발생했습니다.</p>
          <Button onClick={() => window.history.back()}>이전 페이지로 돌아가기</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* 상품 제목 및 메타 정보 */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {product.isTimeDeal && (
              <Badge className="bg-red-500">타임딜</Badge>
            )}
            <Badge variant="outline">{product.region}</Badge>
            {product.categoryIds?.map((category, idx) => (
              <Badge key={idx} variant="secondary">{category}</Badge>
            ))}
            {product.duration?.days && (
              <Badge variant="outline" className="flex items-center gap-1">
                <ClockIcon className="h-3 w-3" />
                {product.duration.days}일 {product.duration.nights || 0}박
              </Badge>
            )}
          </div>
          
          {/* 공유 버튼 */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleShare} 
            className="flex items-center gap-1 text-gray-600"
          >
            <Share2Icon className="h-4 w-4" />
            <span className="hidden sm:inline">공유</span>
          </Button>
        </div>
        
        <h1 className="mt-2 text-3xl font-bold">{product.title}</h1>
        {product.averageRating && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(product.averageRating || 0)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.averageRating?.toFixed(1)} ({product.reviewCount || 0}개 리뷰)
            </span>
          </div>
        )}
      </div>

      {/* 상품 정보 & 주문 영역 */}
      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* 이미지 갤러리 */}
        <div className="lg:col-span-2">
          <div className="mb-4 overflow-hidden rounded-lg shadow-md">
            {product.mainImage ? (
              <div className="relative aspect-[4/3]">
                <Image
                  src={product.mainImage.url}
                  alt={product.mainImage.alt || product.title}
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-gray-200 text-gray-400">이미지 없음</div>
            )}
          </div>
          
          {/* 상품 간단 설명 */}
          {product.shortDescription && (
            <div className="mb-6 rounded-lg bg-gray-50 p-4 text-gray-700">
              {product.shortDescription}
            </div>
          )}
        </div>

        {/* 주문 정보 */}
        <div>
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle>예약 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mb-4 text-2xl font-bold text-blue-600">
                {product.price?.adult?.toLocaleString() || 0}원~
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="adult-count">성인 ({product.price?.adult?.toLocaleString() || 0}원/인)</Label>
                  <Input
                    id="adult-count"
                    type="number"
                    min={1}
                    value={adult}
                    onChange={e => setAdult(Math.max(1, Number(e.target.value)))}
                  />
                </div>
                <div>
                  <Label htmlFor="child-count">아동 ({product.price?.child?.toLocaleString() || 0}원/인)</Label>
                  <Input
                    id="child-count"
                    type="number"
                    min={0}
                    value={child}
                    onChange={e => setChild(Math.max(0, Number(e.target.value)))}
                  />
                </div>
                <div>
                  <Label htmlFor="infant-count">유아 ({product.price?.infant?.toLocaleString() || 0}원/인)</Label>
                  <Input
                    id="infant-count"
                    type="number"
                    min={0}
                    value={infant}
                    onChange={e => setInfant(Math.max(0, Number(e.target.value)))}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="start-date">여행 시작일</Label>
                  <div className="relative">
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="pr-9"
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="end-date">여행 종료일</Label>
                  <div className="relative">
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="pr-9"
                      min={startDate || new Date().toISOString().split('T')[0]}
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="rounded-md bg-gray-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600">성인 {adult}명</span>
                  <span className="text-sm">{((product.price?.adult || 0) * adult).toLocaleString()}원</span>
                </div>
                {child > 0 && (
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600">아동 {child}명</span>
                    <span className="text-sm">{((product.price?.child || 0) * child).toLocaleString()}원</span>
                  </div>
                )}
                {infant > 0 && (
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600">유아 {infant}명</span>
                    <span className="text-sm">{((product.price?.infant || 0) * infant).toLocaleString()}원</span>
                  </div>
                )}
                {product.price?.fuelSurcharge > 0 && (
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600">유류 할증료 ({adult + child}명)</span>
                    <span className="text-sm">{((product.price.fuelSurcharge) * (adult + child)).toLocaleString()}원</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex items-center justify-between font-bold">
                  <span>총 합계</span>
                  <span className="text-lg text-blue-600">{calculateTotalPrice().toLocaleString()}원</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddToCart} 
                  className="w-full"
                  size="lg"
                >
                  장바구니 담기
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="flex-shrink-0"
                  onClick={() => toast({ title: "찜 목록에 추가되었습니다" })}
                >
                  <HeartIcon className="h-5 w-5 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* 상품 상세 정보 탭 */}
      <Tabs defaultValue="info" className="mt-8">
        <TabsList className="mb-4 grid w-full grid-cols-4">
          <TabsTrigger value="info">상품 정보</TabsTrigger>
          <TabsTrigger value="schedule">일정</TabsTrigger>
          <TabsTrigger value="includes">포함/불포함</TabsTrigger>
          <TabsTrigger value="notes">참고사항</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold">상품 소개</h3>
                <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
                
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-md bg-gray-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <MapPinIcon className="size-5 text-blue-500" />
                      <h4 className="font-medium">지역</h4>
                    </div>
                    <p>{product.region}</p>
                  </div>
                  
                  {product.duration && (
                    <div className="rounded-md bg-gray-50 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <ClockIcon className="size-5 text-blue-500" />
                        <h4 className="font-medium">여행 기간</h4>
                      </div>
                      <p>{product.duration.days}일 {product.duration.nights || 0}박</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedule" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {!product.schedule || product.schedule.length === 0 ? (
                <div className="rounded-md bg-gray-50 p-6 text-center text-gray-500">
                  <p>상세 일정 정보가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {product.schedule.map((day: { day: string; content: string; places?: string[] }, idx: number) => (
                    <div key={idx} className="rounded-md border p-4">
                      <h4 className="mb-3 text-lg font-medium text-blue-600">DAY {day.day}</h4>
                      <p className="whitespace-pre-line text-gray-700">{day.content}</p>
                      
                      {day.places && day.places.length > 0 && (
                        <div className="mt-3">
                          <h5 className="mb-2 font-medium">방문 장소</h5>
                          <div className="flex flex-wrap gap-2">
                            {day.places.map((place, pidx) => (
                              <Badge key={pidx} variant="outline" className="bg-gray-50">
                                {place}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="includes" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-medium">
                    <CheckIcon className="size-5 text-green-500" />
                    포함 사항
                  </h3>
                  
                  {!product.includes || product.includes.length === 0 ? (
                    <p className="text-gray-500">포함 사항 정보가 없습니다.</p>
                  ) : (
                    <ul className="list-inside space-y-2">
                      {product.includes.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckIcon className="mt-1 size-4 flex-shrink-0 text-green-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <div>
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-medium">
                    <XIcon className="size-5 text-red-500" />
                    불포함 사항
                  </h3>
                  
                  {!product.excludes || product.excludes.length === 0 ? (
                    <p className="text-gray-500">불포함 사항 정보가 없습니다.</p>
                  ) : (
                    <ul className="list-inside space-y-2">
                      {product.excludes.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <XIcon className="mt-1 size-4 flex-shrink-0 text-red-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-medium">
                <InfoIcon className="size-5 text-blue-500" />
                알아두실 사항
              </h3>
              
              {!product.notes || product.notes.length === 0 ? (
                <div className="rounded-md bg-gray-50 p-6 text-center text-gray-500">
                  <p>추가 참고사항이 없습니다.</p>
                </div>
              ) : (
                <ul className="list-inside space-y-3">
                  {product.notes.map((note: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 rounded-md bg-gray-50 p-3">
                      <InfoIcon className="mt-1 size-4 flex-shrink-0 text-blue-500" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 리뷰 섹션 */}
      <div className="mt-10 mb-8">
        <h2 className="mb-6 text-2xl font-bold">고객 리뷰</h2>
        <ReviewList productId={productId} />
      </div>
      {/* 추천 상품 섹션 */}
      {product.region && (
        <RecommendedProducts 
          currentProductId={product.id} 
          region={product.region} 
        />
      )}
    </div>
  );
}

function RecommendedProducts({ 
  currentProductId, 
  region 
}: { 
  currentProductId: string; 
  region: string; 
}) {
  // 같은 지역의 상품 가져오기 (현재 상품 제외)
  const { data: products, isLoading } = useProducts({ 
    region, 
    status: 'published',
    limitCount: 4 
  });

  const filteredProducts = products?.filter(p => p.id !== currentProductId) || [];

  if (isLoading || filteredProducts.length === 0) return null;

  return (
    <div className="mt-12">
      <h3 className="mb-4 text-2xl font-bold">추천 여행 상품</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.slice(0, 4).map((product) => (
          <Link 
            key={product.id} 
            href={`/travel/products/${product.id}`}
            className="block group"
          >
            <div className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg">
              <div className="relative aspect-[4/3]">
                {product.mainImage ? (
                  <Image
                    src={product.mainImage.url}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-200">
                    <span className="text-gray-400">이미지 없음</span>
                  </div>
                )}
                {product.isTimeDeal && (
                  <Badge className="absolute top-2 right-2 bg-red-500">
                    타임딜
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <h4 className="mb-1 font-medium line-clamp-1">{product.title}</h4>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{product.region}</Badge>
                  <span className="font-bold text-blue-600">
                    {product.price?.adult?.toLocaleString() || 0}원~
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 
// 동적 페이지로 설정 (정적 생성 방지)
export const dynamic = 'force-dynamic';
export const revalidate = false;
