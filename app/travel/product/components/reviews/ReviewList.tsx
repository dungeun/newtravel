'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Star, ThumbsUp, Flag, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import ReviewForm from './ReviewForm';
import { useAuth } from '@/hooks/useAuth';

interface ReviewListProps {
  productId: string;
}

export default function ReviewList({ productId }: ReviewListProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent');
  
  // 리뷰 목록 조회
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/reviews?productId=${productId}`);
        
        if (response.data.success) {
          setReviews(response.data.reviews || []);
        } else {
          setError(response.data.error || '리뷰를 불러오는데 실패했습니다.');
        }
      } catch (err: any) {
        console.error('리뷰 조회 오류:', err);
        setError(err.response?.data?.error || err.message || '리뷰를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [productId]);
  
  // 사용자의 리뷰 작성 가능 여부 확인
  useEffect(() => {
    const checkCanReview = async () => {
      if (!user) return;
      
      try {
        const response = await axios.get(`/api/reviews/check-eligibility?productId=${productId}`);
        setCanReview(response.data.canReview || false);
      } catch (err) {
        console.error('리뷰 작성 가능 여부 확인 오류:', err);
        setCanReview(false);
      }
    };
    
    checkCanReview();
  }, [productId, user]);
  
  // 리뷰 좋아요 처리
  const handleLikeReview = async (reviewId: string) => {
    if (!user) {
      router.push(`/auth/signin?redirect=/travel/product/${productId}`);
      return;
    }
    
    try {
      const response = await axios.post(`/api/reviews/${reviewId}/like`);
      
      if (response.data.success) {
        // 리뷰 목록 업데이트
        setReviews(reviews.map(review => {
          if (review.id === reviewId) {
            return {
              ...review,
              likes: response.data.likes,
              hasLiked: response.data.hasLiked
            };
          }
          return review;
        }));
      }
    } catch (err) {
      console.error('리뷰 좋아요 오류:', err);
    }
  };
  
  // 리뷰 신고 처리
  const handleReportReview = async (reviewId: string) => {
    if (!user) {
      router.push(`/auth/signin?redirect=/travel/product/${productId}`);
      return;
    }
    
    if (window.confirm('이 리뷰를 부적절한 내용으로 신고하시겠습니까?')) {
      try {
        const response = await axios.post(`/api/reviews/${reviewId}/report`);
        
        if (response.data.success) {
          alert('리뷰가 신고되었습니다. 검토 후 조치하겠습니다.');
        }
      } catch (err) {
        console.error('리뷰 신고 오류:', err);
      }
    }
  };
  
  // 리뷰 내용 토글
  const toggleReviewExpand = (reviewId: string) => {
    setExpandedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };
  
  // 리뷰 정렬
  const sortReviews = () => {
    const sortedReviews = [...reviews];
    
    if (sortBy === 'recent') {
      sortedReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'rating') {
      sortedReviews.sort((a, b) => b.rating - a.rating);
    }
    
    return sortedReviews;
  };
  
  // 리뷰 작성 완료 후 처리
  const handleReviewSubmitted = (newReview: any) => {
    setReviews([newReview, ...reviews]);
    setShowReviewForm(false);
    setCanReview(false);
  };
  
  // 평균 평점 계산
  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };
  
  // 별점 분포 계산
  const calculateRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]; // 1점, 2점, 3점, 4점, 5점
    
    reviews.forEach(review => {
      const rating = Math.floor(review.rating);
      if (rating >= 1 && rating <= 5) {
        distribution[rating - 1]++;
      }
    });
    
    return distribution;
  };
  
  // 로딩 상태 표시
  if (loading) {
    return (
      <div className="my-8 space-y-4">
        <h2 className="text-2xl font-bold">리뷰</h2>
        <div className="flex h-20 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        </div>
      </div>
    );
  }
  
  // 에러 상태 표시
  if (error) {
    return (
      <div className="my-8 space-y-4">
        <h2 className="text-2xl font-bold">리뷰</h2>
        <div className="rounded-md bg-red-50 p-4 text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  const sortedReviews = sortReviews();
  const averageRating = calculateAverageRating();
  const ratingDistribution = calculateRatingDistribution();
  
  return (
    <div className="my-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">리뷰</h2>
        <span className="text-sm text-gray-500">총 {reviews.length}개</span>
      </div>
      
      {/* 평점 요약 */}
      <div className="rounded-lg bg-gray-50 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-blue-600">{averageRating}</div>
            <div className="mt-2 flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    parseFloat(averageRating) >= star
                      ? 'fill-yellow-400 text-yellow-400'
                      : parseFloat(averageRating) >= star - 0.5
                      ? 'fill-yellow-400 text-yellow-400 opacity-50'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="mt-1 text-sm text-gray-500">{reviews.length}개의 리뷰</div>
          </div>
          
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <div className="w-8 text-sm">{rating}점</div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-yellow-400"
                    style={{
                      width: `${reviews.length > 0 ? (ratingDistribution[rating - 1] / reviews.length) * 100 : 0}%`
                    }}
                  ></div>
                </div>
                <div className="w-8 text-right text-sm">{ratingDistribution[rating - 1]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 리뷰 작성 버튼 */}
      {user ? (
        canReview ? (
          <div className="rounded-lg border p-4">
            {showReviewForm ? (
              <ReviewForm
                productId={productId}
                onCancel={() => setShowReviewForm(false)}
                onSubmit={handleReviewSubmitted}
              />
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3 p-4">
                <p className="text-center text-gray-600">이 상품을 구매하셨네요! 여행은 어떠셨나요?</p>
                <Button onClick={() => setShowReviewForm(true)}>리뷰 작성하기</Button>
              </div>
            )}
          </div>
        ) : (
          reviews.some(review => review.userId === user.uid) && (
            <div className="rounded-lg border bg-gray-50 p-4 text-center text-gray-600">
              이미 이 상품에 대한 리뷰를 작성하셨습니다.
            </div>
          )
        )
      ) : (
        <div className="rounded-lg border bg-gray-50 p-4 text-center">
          <p className="mb-3 text-gray-600">리뷰를 작성하려면 로그인이 필요합니다.</p>
          <Button
            variant="outline"
            onClick={() => router.push(`/auth/signin?redirect=/travel/product/${productId}`)}
          >
            로그인하기
          </Button>
        </div>
      )}
      
      {/* 정렬 옵션 */}
      {reviews.length > 0 && (
        <div className="flex justify-end">
          <div className="flex rounded-md border">
            <Button
              variant={sortBy === 'recent' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-r-none"
              onClick={() => setSortBy('recent')}
            >
              최신순
            </Button>
            <Button
              variant={sortBy === 'rating' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-l-none"
              onClick={() => setSortBy('rating')}
            >
              평점순
            </Button>
          </div>
        </div>
      )}
      
      {/* 리뷰 목록 */}
      {reviews.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-gray-500">아직 리뷰가 없습니다. 첫 리뷰를 작성해보세요!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedReviews.map((review) => {
            const isExpanded = expandedReviews[review.id] || false;
            const reviewDate = new Date(review.createdAt);
            const isLongContent = review.comment.length > 200;
            
            return (
              <div key={review.id} className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={review.userAvatar} alt={review.userName} />
                      <AvatarFallback>{review.userName.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{review.userName}</div>
                      <div className="text-sm text-gray-500">
                        {format(reviewDate, 'yyyy년 MM월 dd일', { locale: ko })}
                      </div>
                    </div>
                  </div>
                  
                  {review.isVerified && (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      구매 확인
                    </Badge>
                  )}
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
                
                <div className="mb-4">
                  {isLongContent && !isExpanded ? (
                    <>
                      <p className="whitespace-pre-line text-gray-700">{review.comment.slice(0, 200)}...</p>
                      <button
                        className="mt-1 flex items-center text-sm text-blue-600"
                        onClick={() => toggleReviewExpand(review.id)}
                      >
                        더 보기 <ChevronDown className="ml-1 h-4 w-4" />
                      </button>
                    </>
                  ) : isLongContent && isExpanded ? (
                    <>
                      <p className="whitespace-pre-line text-gray-700">{review.comment}</p>
                      <button
                        className="mt-1 flex items-center text-sm text-blue-600"
                        onClick={() => toggleReviewExpand(review.id)}
                      >
                        접기 <ChevronUp className="ml-1 h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <p className="whitespace-pre-line text-gray-700">{review.comment}</p>
                  )}
                </div>
                
                {review.images && review.images.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {review.images.map((image: string, index: number) => (
                      <div
                        key={index}
                        className="relative h-20 w-20 cursor-pointer overflow-hidden rounded-md"
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
                
                <div className="flex justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-1 ${review.hasLiked ? 'text-blue-600' : ''}`}
                    onClick={() => handleLikeReview(review.id)}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    도움됨 {review.likes > 0 ? review.likes : ''}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-gray-500"
                    onClick={() => handleReportReview(review.id)}
                  >
                    <Flag className="h-4 w-4" />
                    신고
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
