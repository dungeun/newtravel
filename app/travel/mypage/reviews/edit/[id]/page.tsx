'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { Star, Upload, X, Loader2, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

// 리뷰 수정 폼 스키마
const reviewFormSchema = z.object({
  title: z.string().min(2, { message: '제목은 2글자 이상이어야 합니다.' }).max(100, { message: '제목은 100자 이내로 작성해주세요.' }),
  rating: z.number().min(1, { message: '별점을 선택해주세요.' }).max(5),
  comment: z.string().min(10, { message: '내용은 10글자 이상이어야 합니다.' }).max(2000, { message: '내용은 2000자 이내로 작성해주세요.' }),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export default function EditReviewPage() {
  const router = useRouter();
  const params = useParams();
  const reviewId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { toast } = useToast();
  const { user, loading } = useAuth();
  
  const [review, setReview] = useState<any>(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // 폼 설정
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      title: '',
      rating: 0,
      comment: '',
    },
  });
  
  // 리뷰 데이터 로드
  useEffect(() => {
    const fetchReview = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/reviews/${reviewId}`);
        
        if (response.data.success) {
          const reviewData = response.data.review;
          setReview(reviewData);
          
          // 폼 초기값 설정
          form.reset({
            title: reviewData.title,
            rating: reviewData.rating,
            comment: reviewData.comment,
          });
          
          setSelectedRating(reviewData.rating);
          
          // 기존 이미지 URL 설정
          if (reviewData.images && reviewData.images.length > 0) {
            setExistingImageUrls(reviewData.images);
          }
        } else {
          throw new Error(response.data.error || '리뷰를 불러오는데 실패했습니다.');
        }
      } catch (err: any) {
        console.error('리뷰 조회 오류:', err);
        
        toast({
          title: "리뷰 조회 실패",
          description: err.response?.data?.error || err.message || '리뷰를 불러오는데 실패했습니다.',
          variant: "destructive",
        });
        
        // 마이페이지로 리다이렉트
        router.push('/travel/mypage?tab=reviews');
      } finally {
        setIsLoading(false);
      }
    };
    
    // 로그인 확인 후 리뷰 데이터 로드
    if (!loading) {
      if (!user) {
        router.push('/auth/signin?redirect=/travel/mypage');
      } else {
        fetchReview();
      }
    }
  }, [reviewId, user, loading, router, form]);
  
  // 별점 선택 처리
  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating);
    form.setValue('rating', rating);
  };
  
  // 이미지 업로드 처리
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    // 최대 5개까지만 업로드 가능 (기존 이미지 포함)
    if (existingImageUrls.length + images.length + files.length > 5) {
      toast({
        title: "이미지 업로드 제한",
        description: "최대 5개까지 업로드할 수 있습니다.",
        variant: "destructive",
      });
      return;
    }
    
    // 파일 크기 제한 (각 파일 5MB 이하)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validFiles: File[] = [];
    const validUrls: string[] = [];
    
    Array.from(files).forEach(file => {
      if (file.size > maxSize) {
        toast({
          title: "파일 크기 초과",
          description: `${file.name}의 크기가 5MB를 초과합니다.`,
          variant: "destructive",
        });
        return;
      }
      
      validFiles.push(file);
      validUrls.push(URL.createObjectURL(file));
    });
    
    setImages([...images, ...validFiles]);
    setImageUrls([...imageUrls, ...validUrls]);
  };
  
  // 새 이미지 제거 처리
  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    const newImageUrls = [...imageUrls];
    
    // URL 객체 해제
    URL.revokeObjectURL(newImageUrls[index]);
    
    newImages.splice(index, 1);
    newImageUrls.splice(index, 1);
    
    setImages(newImages);
    setImageUrls(newImageUrls);
  };
  
  // 기존 이미지 제거 처리
  const handleRemoveExistingImage = (index: number) => {
    const newExistingImageUrls = [...existingImageUrls];
    newExistingImageUrls.splice(index, 1);
    setExistingImageUrls(newExistingImageUrls);
  };
  
  // 리뷰 수정 처리
  const handleSubmitReview = async (values: ReviewFormValues) => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "리뷰를 수정하려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 새 이미지 업로드 (있는 경우)
      let allImageUrls = [...existingImageUrls];
      
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(image => {
          formData.append('images', image);
        });
        
        const uploadResponse = await axios.post(`/api/reviews/upload-images?productId=${review.productId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress);
            }
          },
        });
        
        if (uploadResponse.data.success) {
          allImageUrls = [...allImageUrls, ...uploadResponse.data.imageUrls];
        }
      }
      
      // 리뷰 데이터 생성
      const reviewData = {
        title: values.title,
        rating: values.rating,
        comment: values.comment,
        images: allImageUrls,
      };
      
      // 리뷰 업데이트
      const response = await axios.put(`/api/reviews/${reviewId}`, reviewData);
      
      if (response.data.success) {
        toast({
          title: "리뷰 수정 완료",
          description: "리뷰가 성공적으로 수정되었습니다.",
        });
        
        // 마이페이지로 리다이렉트
        router.push('/travel/mypage?tab=reviews');
      } else {
        throw new Error(response.data.error || '리뷰 수정에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('리뷰 수정 오류:', error);
      
      toast({
        title: "리뷰 수정 실패",
        description: error.response?.data?.error || error.message || '리뷰 수정 중 오류가 발생했습니다.',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };
  
  // 취소 처리
  const handleCancel = () => {
    router.push('/travel/mypage?tab=reviews');
  };
  
  // 로딩 상태 표시
  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>리뷰 수정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2"
              onClick={handleCancel}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <CardTitle>리뷰 수정</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {review && (
            <div className="space-y-4">
              <div className="rounded-md bg-gray-50 p-4">
                <h3 className="font-medium">{review.productName || '상품명'}</h3>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmitReview)} className="space-y-4">
                  {/* 별점 선택 */}
                  <div className="space-y-2">
                    <FormLabel>별점</FormLabel>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Star
                          key={rating}
                          className={`h-8 w-8 cursor-pointer ${
                            rating <= (hoveredRating || selectedRating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          onMouseEnter={() => setHoveredRating(rating)}
                          onMouseLeave={() => setHoveredRating(0)}
                          onClick={() => handleRatingSelect(rating)}
                        />
                      ))}
                    </div>
                    {form.formState.errors.rating && (
                      <p className="text-sm text-red-500">{form.formState.errors.rating.message}</p>
                    )}
                  </div>
                  
                  {/* 제목 입력 */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>제목</FormLabel>
                        <FormControl>
                          <Input placeholder="리뷰 제목을 입력하세요" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* 내용 입력 */}
                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>내용</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="여행 경험을 자세히 공유해주세요"
                            className="min-h-[150px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          최소 10자 이상, 최대 2000자 이내로 작성해주세요.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* 이미지 업로드 */}
                  <div className="space-y-2">
                    <FormLabel>이미지 첨부 (선택사항)</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {/* 기존 이미지 미리보기 */}
                      {existingImageUrls.map((url, index) => (
                        <div key={`existing-${index}`} className="relative h-24 w-24 overflow-hidden rounded-md border">
                          <img src={url} alt={`기존 이미지 ${index + 1}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            className="absolute right-1 top-1 rounded-full bg-gray-800 p-1 text-white opacity-70 hover:opacity-100"
                            onClick={() => handleRemoveExistingImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      
                      {/* 새로 업로드된 이미지 미리보기 */}
                      {imageUrls.map((url, index) => (
                        <div key={`new-${index}`} className="relative h-24 w-24 overflow-hidden rounded-md border">
                          <img src={url} alt={`새 이미지 ${index + 1}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            className="absolute right-1 top-1 rounded-full bg-gray-800 p-1 text-white opacity-70 hover:opacity-100"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      
                      {/* 이미지 업로드 버튼 */}
                      {existingImageUrls.length + images.length < 5 && (
                        <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 hover:border-gray-400">
                          <Upload className="mb-1 h-5 w-5 text-gray-500" />
                          <span className="text-xs text-gray-500">사진 추가</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={isSubmitting}
                          />
                        </label>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      최대 5개, 각 5MB 이하의 이미지를 업로드할 수 있습니다.
                    </p>
                  </div>
                  
                  {/* 업로드 진행 상태 */}
                  {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>이미지 업로드 중...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* 버튼 영역 */}
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                      취소
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          저장 중...
                        </>
                      ) : (
                        '리뷰 수정'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
