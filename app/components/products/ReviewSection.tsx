'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { StarFilledIcon, StarIcon } from '@radix-ui/react-icons';
import { useToast } from '@/components/ui/use-toast';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  rating: number;
  comment: string;
  date: Date;
  helpfulCount?: number;
}

interface ReviewSectionProps {
  productId: string;
  averageRating?: number;
  reviewCount?: number;
  reviews?: Review[];
}

export default function ReviewSection({ 
  productId, 
  averageRating = 0, 
  reviewCount = 0,
  reviews = [] 
}: ReviewSectionProps) {
  const { toast } = useToast();
  
  const handleMarkHelpful = (reviewId: string) => {
    toast({
      title: "리뷰에 도움됨 표시했습니다",
      description: "리뷰에 도움이 되었다는 의견을 남겼습니다.",
    });
  };
  
  const handleWriteReview = () => {
    toast({
      title: "리뷰 작성",
      description: "로그인 후 리뷰를 작성할 수 있습니다.",
    });
  };
  
  // 별점 생성 함수
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= rating ? (
              <StarFilledIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <StarIcon className="h-5 w-5 text-gray-300" />
            )}
          </span>
        ))}
      </div>
    );
  };
  
  // 리뷰가 없는 경우 표시할 컴포넌트
  if (reviews.length === 0) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>리뷰</span>
            <Button onClick={handleWriteReview}>리뷰 작성하기</Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-10">
          <p className="text-gray-500 mb-4">아직 이 상품에 대한 리뷰가 없습니다.</p>
          <p className="text-gray-500 mb-6">첫 번째 리뷰를 작성해 보세요!</p>
          <Button onClick={handleWriteReview}>리뷰 작성하기</Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>리뷰 ({reviewCount})</span>
            {averageRating > 0 && (
              <div className="flex items-center gap-1 ml-2">
                {renderStars(averageRating)}
                <span className="text-sm font-normal">
                  {averageRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
          <Button onClick={handleWriteReview}>리뷰 작성하기</Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="pb-6">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <Avatar>
                    {review.userImage ? (
                      <AvatarImage src={review.userImage} alt={review.userName} />
                    ) : null}
                    <AvatarFallback>{review.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="font-medium">{review.userName}</div>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">
                        {review.date instanceof Date 
                          ? review.date.toLocaleDateString() 
                          : new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 pl-12">
                <p className="text-gray-700 whitespace-pre-line">{review.comment}</p>
                
                <div className="mt-3 flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => handleMarkHelpful(review.id)}
                  >
                    도움이 돼요 ({review.helpfulCount || 0})
                  </Button>
                </div>
              </div>
              
              <Separator className="mt-6" />
            </div>
          ))}
        </div>
        
        {reviewCount > reviews.length && (
          <div className="mt-4 text-center">
            <Button variant="outline">더 많은 리뷰 보기</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 