'use client';

import { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Star, Upload, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

// 리뷰 작성 폼 스키마
const reviewFormSchema = z.object({
  title: z.string().min(2, { message: '제목은 2글자 이상이어야 합니다.' }).max(100, { message: '제목은 100자 이내로 작성해주세요.' }),
  rating: z.number().min(1, { message: '별점을 선택해주세요.' }).max(5),
  comment: z.string().min(10, { message: '내용은 10글자 이상이어야 합니다.' }).max(2000, { message: '내용은 2000자 이내로 작성해주세요.' }),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  productId: string;
  onCancel: () => void;
  onSubmit: (review: any) => void;
}

export default function ReviewForm({ productId, onCancel, onSubmit }: ReviewFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
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
  
  // 별점 선택 처리
  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating);
    form.setValue('rating', rating);
  };
  
  // 이미지 업로드 처리
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    // 최대 5개까지만 업로드 가능
    if (images.length + files.length > 5) {
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
  
  // 이미지 제거 처리
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
  
  // 리뷰 제출 처리
  const handleSubmitReview = async (values: ReviewFormValues) => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "리뷰를 작성하려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 이미지 업로드 (있는 경우)
      let uploadedImageUrls: string[] = [];
      
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(image => {
          formData.append('images', image);
        });
        
        const uploadResponse = await axios.post(`/api/reviews/upload-images?productId=${productId}`, formData, {
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
          uploadedImageUrls = uploadResponse.data.imageUrls;
        }
      }
      
      // 리뷰 데이터 생성
      const reviewData = {
        productId,
        title: values.title,
        rating: values.rating,
        comment: values.comment,
        images: uploadedImageUrls,
      };
      
      // 리뷰 저장
      const response = await axios.post('/api/reviews', reviewData);
      
      if (response.data.success) {
        toast({
          title: "리뷰 작성 완료",
          description: "소중한 리뷰를 작성해주셔서 감사합니다.",
        });
        
        // 부모 컴포넌트에 알림
        onSubmit(response.data.review);
      } else {
        throw new Error(response.data.error || '리뷰 작성에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('리뷰 작성 오류:', error);
      
      toast({
        title: "리뷰 작성 실패",
        description: error.response?.data?.error || error.message || '리뷰 작성 중 오류가 발생했습니다.',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">리뷰 작성</h3>
      
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
            <FormLabel>이미지 업로드 (선택사항)</FormLabel>
            <div className="flex flex-wrap gap-4">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative h-24 w-24 overflow-hidden rounded-md border">
                  <img
                    src={url}
                    alt={`리뷰 이미지 ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              
              {imageUrls.length < 5 && (
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-500 hover:text-blue-500">
                  <Upload className="h-6 w-6" />
                  <span className="mt-1 text-xs">이미지 추가</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            <FormDescription>
              최대 5개까지 업로드 가능합니다. (각 파일 최대 5MB)
            </FormDescription>
          </div>
          
          {/* 제출 버튼 */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                '리뷰 작성하기'
              )}
            </Button>
          </div>
          
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="pt-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="mt-1 text-right text-sm text-gray-500">
                이미지 업로드 중... {uploadProgress}%
              </p>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
