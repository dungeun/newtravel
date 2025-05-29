'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Star, Edit, Trash, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';

interface UserReviewsProps {
  userId: string;
}

export default function UserReviews({ userId }: UserReviewsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 사용자 리뷰 목록 조회
  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/users/${userId}/reviews`);
        
        if (response.data.success) {
          setReviews(response.data.reviews || []);
        } else {
          setError(response.data.error || '리뷰를 불러오는데 실패했습니다.');
        }
      } catch (err: any) {
        console.error('사용자 리뷰 조회 오류:', err);
        setError(err.response?.data?.error || err.message || '리뷰를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchUserReviews();
    }
  }, [userId]);
  
  // 리뷰 삭제 처리
  const handleDeleteReview = async () => {
    if (!deleteReviewId) return;
    
    try {
      setIsDeleting(true);
      const response = await axios.delete(`/api/reviews/${deleteReviewId}`);
      
      if (response.data.success) {
        // 리뷰 목록에서 삭제된 리뷰 제거
        setReviews(reviews.filter(review => review.id !== deleteReviewId));
        
        toast({
          title: "리뷰 삭제 완료",
          description: "리뷰가 성공적으로 삭제되었습니다.",
        });
      } else {
        throw new Error(response.data.error || '리뷰 삭제에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('리뷰 삭제 오류:', err);
      
      toast({
        title: "리뷰 삭제 실패",
        description: err.response?.data?.error || err.message || '리뷰 삭제 중 오류가 발생했습니다.',
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteReviewId(null);
    }
  };
  
  // 리뷰 수정 페이지로 이동
  const handleEditReview = (reviewId: string) => {
    router.push(`/travel/mypage/reviews/edit/${reviewId}`);
  };
  
  // 상품 상세 페이지로 이동
  const handleViewProduct = (productId: string) => {
    router.push(`/travel/products/${productId}`);
  };
  
  // 로딩 상태 표시
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>내 리뷰</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // 에러 상태 표시
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>내 리뷰</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-2 rounded-md bg-red-50 p-4 text-red-600">
            <AlertCircle className="h-6 w-6" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>내 리뷰</CardTitle>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <p className="text-gray-500">작성한 리뷰가 없습니다.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => router.push('/travel/products')}
            >
              여행 상품 둘러보기
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => {
              const reviewDate = new Date(review.createdAt);
              
              return (
                <div key={review.id} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h4 
                        className="cursor-pointer font-medium hover:text-blue-600"
                        onClick={() => handleViewProduct(review.productId)}
                      >
                        {review.productName || '상품명'}
                      </h4>
                      <div className="text-sm text-gray-500">
                        {format(reviewDate, 'yyyy년 MM월 dd일', { locale: ko })}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {review.status === 'pending' && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                          검토중
                        </Badge>
                      )}
                      {review.isVerified && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          구매 확인
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-2 flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          review.rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {review.title && <h4 className="mb-2 font-medium">{review.title}</h4>}
                  
                  <p className="mb-4 whitespace-pre-line text-gray-700">
                    {review.comment.length > 150 
                      ? `${review.comment.slice(0, 150)}...` 
                      : review.comment}
                  </p>
                  
                  {review.images && review.images.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {review.images.map((image: string, index: number) => (
                        <div
                          key={index}
                          className="relative h-16 w-16 cursor-pointer overflow-hidden rounded-md"
                          onClick={() => window.open(image, '_blank')}
                        >
                          <img
                            src={image}
                            alt={`리뷰 이미지 ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Separator className="my-3" />
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => handleEditReview(review.id)}
                    >
                      <Edit className="h-4 w-4" />
                      수정
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setDeleteReviewId(review.id)}
                    >
                      <Trash className="h-4 w-4" />
                      삭제
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* 리뷰 삭제 확인 대화상자 */}
        <AlertDialog open={!!deleteReviewId} onOpenChange={(open) => !open && setDeleteReviewId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>리뷰 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                정말로 이 리뷰를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteReview} 
                disabled={isDeleting}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    삭제 중...
                  </>
                ) : (
                  '삭제'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
