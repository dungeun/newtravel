import { z } from 'zod';

// 리뷰 생성 및 수정 스키마
export const reviewSchema = z.object({
  productId: z.string().min(1, { message: '상품 ID가 필요합니다.' }),
  title: z.string().min(2, { message: '제목은 2글자 이상이어야 합니다.' }).max(100, { message: '제목은 100자 이내로 작성해주세요.' }),
  rating: z.number().min(1, { message: '별점을 선택해주세요.' }).max(5, { message: '별점은 5점 이하여야 합니다.' }),
  comment: z.string().min(10, { message: '내용은 10글자 이상이어야 합니다.' }).max(2000, { message: '내용은 2000자 이내로 작성해주세요.' }),
  images: z.array(z.string().url({ message: '유효한 이미지 URL이 아닙니다.' })).optional(),
});

// 리뷰 상태 변경 스키마
export const reviewStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected'], {
    errorMap: () => ({ message: '유효한 상태값이 아닙니다. (pending, approved, rejected)' })
  })
});

// 리뷰 좋아요 스키마
export const reviewLikeSchema = z.object({
  reviewId: z.string().min(1, { message: '리뷰 ID가 필요합니다.' }),
});

// 리뷰 신고 스키마
export const reviewReportSchema = z.object({
  reviewId: z.string().min(1, { message: '리뷰 ID가 필요합니다.' }),
  reason: z.string().min(1, { message: '신고 사유가 필요합니다.' }).max(500, { message: '신고 사유는 500자 이내로 작성해주세요.' }),
});

// 이미지 업로드 스키마
export const imageUploadSchema = z.object({
  productId: z.string().min(1, { message: '상품 ID가 필요합니다.' }),
  images: z.array(z.any()).min(1, { message: '이미지가 필요합니다.' }).max(5, { message: '이미지는 최대 5개까지 업로드할 수 있습니다.' }),
});

// 리뷰 자격 확인 스키마
export const reviewEligibilitySchema = z.object({
  productId: z.string().min(1, { message: '상품 ID가 필요합니다.' }),
});
