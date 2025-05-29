import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  runTransaction,
  Timestamp
} from 'firebase/firestore';

/**
 * 리뷰 상태 타입
 */
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

/**
 * 리뷰 데이터 타입
 */
export type ReviewData = {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  title: string;
  rating: number;
  comment: string;
  images: string[];
  likes: number;
  status: ReviewStatus;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  hasLiked?: boolean;
};

/**
 * Firestore Timestamp를 Date로 변환
 * @param timestamp Firestore Timestamp 객체
 * @returns Date 객체
 */
export const timestampToDate = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date();
};

/**
 * 리뷰 데이터 포맷팅
 * @param doc Firestore 문서 스냅샷
 * @param userId 현재 사용자 ID (좋아요 확인용)
 * @returns 포맷팅된 리뷰 데이터
 */
export const formatReviewData = async (doc: any, userId?: string): Promise<ReviewData> => {
  const data = doc.data();
  
  // 사용자가 좋아요를 눌렀는지 확인
  let hasLiked = false;
  
  if (userId) {
    const likesRef = collection(db, 'reviewLikes');
    const likeQuery = query(
      likesRef,
      where('reviewId', '==', doc.id),
      where('userId', '==', userId)
    );
    const likeSnapshot = await getDocs(likeQuery);
    hasLiked = !likeSnapshot.empty;
  }
  
  return {
    id: doc.id,
    productId: data.productId,
    productName: data.productName || '상품명',
    userId: data.userId,
    userName: data.userName || '사용자',
    userAvatar: data.userAvatar,
    title: data.title,
    rating: data.rating,
    comment: data.comment,
    images: data.images || [],
    likes: data.likes || 0,
    status: data.status || 'pending',
    isVerified: data.isVerified || false,
    hasLiked,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt)
  };
};

/**
 * 상품 평균 평점 업데이트
 * @param productId 상품 ID
 */
export const updateProductRating = async (productId: string): Promise<void> => {
  try {
    // 상품 리뷰 조회
    const reviewsRef = collection(db, 'reviews');
    const reviewsQuery = query(
      reviewsRef,
      where('productId', '==', productId),
      where('status', '==', 'approved')
    );
    const reviewsSnapshot = await getDocs(reviewsQuery);
    
    // 평균 평점 계산
    let totalRating = 0;
    let reviewCount = 0;
    
    reviewsSnapshot.forEach((doc) => {
      const data = doc.data();
      totalRating += data.rating;
      reviewCount++;
    });
    
    const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;
    
    // 상품 정보 업데이트
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      averageRating,
      reviewCount,
      updatedAt: new Date()
    });
    
    return;
  } catch (error) {
    console.error('평균 평점 업데이트 오류:', error);
    throw error;
  }
};

/**
 * 사용자의 상품 구매 여부 확인
 * @param userId 사용자 ID
 * @param productId 상품 ID
 * @returns 구매 여부
 */
export const checkPurchaseEligibility = async (userId: string, productId: string): Promise<boolean> => {
  try {
    const ordersRef = collection(db, 'orders');
    const orderQuery = query(
      ordersRef,
      where('userId', '==', userId),
      where('status', '==', 'completed')
    );
    const orderSnapshot = await getDocs(orderQuery);
    
    // 주문 내역에서 해당 상품이 있는지 확인
    for (const orderDoc of orderSnapshot.docs) {
      const orderData = orderDoc.data();
      const orderItems = orderData.items || [];
      
      if (orderItems.some((item: any) => item.productId === productId)) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('구매 자격 확인 오류:', error);
    return false;
  }
};

/**
 * 리뷰 이미지 URL 유효성 검사
 * @param imageUrls 이미지 URL 배열
 * @returns 유효한 이미지 URL 배열
 */
export const validateImageUrls = (imageUrls: string[]): string[] => {
  if (!imageUrls || !Array.isArray(imageUrls)) {
    return [];
  }
  
  return imageUrls.filter(url => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  });
};
