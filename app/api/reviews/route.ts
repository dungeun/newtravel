import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { reviewSchema } from '@/lib/validations/review';

// 오류 응답 생성 함수
const createErrorResponse = (message: string, status: number = 400) => {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
};

// 인증 확인 함수
const checkAuth = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { authenticated: false, error: '로그인이 필요합니다.', status: 401 };
  }
  return { authenticated: true, userId: session.user.id };
};

// 리뷰 목록 조회 API
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get('productId');
    
    if (!productId) {
      return createErrorResponse('상품 ID가 필요합니다.');
    }
    
    // 상품 존재 여부 확인
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    
    if (!productSnap.exists()) {
      return createErrorResponse('존재하지 않는 상품입니다.', 404);
    }
    
    // 현재 사용자 정보 (로그인한 경우)
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // 정렬 및 필터 옵션 처리
    const sortBy = url.searchParams.get('sortBy') || 'recent';
    const filterRating = url.searchParams.get('rating') ? parseInt(url.searchParams.get('rating') || '0') : null;
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    // 리뷰 목록 조회
    const reviewsRef = collection(db, 'reviews');
    let reviewsQuery = query(
      reviewsRef,
      where('productId', '==', productId),
      where('status', '==', 'approved'), // 승인된 리뷰만 표시
      orderBy(sortBy === 'recent' ? 'createdAt' : 'rating', sortBy === 'recent' ? 'desc' : 'desc')
    );
    
    const reviewsSnapshot = await getDocs(reviewsQuery);
    
    // 리뷰 데이터 가공
    let reviews = [];
    
    for (const doc of reviewsSnapshot.docs) {
      const reviewData = doc.data();
      
      // 평점 필터링 적용
      if (filterRating && reviewData.rating !== filterRating) {
        continue;
      }
      
      // 사용자가 좋아요를 눌렀는지 확인
      let hasLiked = false;
      
      if (userId) {
        const likeRef = collection(db, 'reviewLikes');
        const likeQuery = query(
          likeRef,
          where('reviewId', '==', doc.id),
          where('userId', '==', userId)
        );
        const likeSnapshot = await getDocs(likeQuery);
        hasLiked = !likeSnapshot.empty;
      }
      
      reviews.push({
        id: doc.id,
        productId: reviewData.productId,
        userId: reviewData.userId,
        userName: reviewData.userName,
        userAvatar: reviewData.userAvatar,
        title: reviewData.title,
        rating: reviewData.rating,
        comment: reviewData.comment,
        images: reviewData.images || [],
        likes: reviewData.likes || 0,
        hasLiked,
        isVerified: reviewData.isVerified || false,
        createdAt: reviewData.createdAt?.toDate() || new Date(),
        updatedAt: reviewData.updatedAt?.toDate() || new Date()
      });
    }
    
    // 페이지네이션 적용
    const totalCount = reviews.length;
    reviews = reviews.slice(offset, offset + limit);
    
    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error: any) {
    console.error('리뷰 조회 오류:', error);
    return createErrorResponse(error.message || '리뷰 조회 중 오류가 발생했습니다.', 500);
  }
}

// 리뷰 작성 API
export async function POST(req: NextRequest) {
  try {
    // 인증 확인
    const authResult = await checkAuth(req);
    if (!authResult.authenticated) {
      return createErrorResponse(authResult.error, authResult.status);
    }
    
    const userId = authResult.userId;
    const session = await getServerSession(authOptions);
    const userName = session?.user?.name || '사용자';
    const userAvatar = session?.user?.image || '';
    
    // 요청 데이터 파싱
    const requestData = await req.json();
    
    // 데이터 유효성 검증
    try {
      reviewSchema.parse(requestData);
    } catch (validationError: any) {
      return createErrorResponse(validationError.errors?.[0]?.message || '유효하지 않은 데이터입니다.');
    }
    
    const { productId, title, rating, comment, images } = requestData;
    
    // 상품 존재 여부 확인
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    
    if (!productSnap.exists()) {
      return createErrorResponse('존재하지 않는 상품입니다.', 404);
    }
    
    // 이미 리뷰를 작성했는지 확인
    const reviewsRef = collection(db, 'reviews');
    const existingReviewQuery = query(
      reviewsRef,
      where('productId', '==', productId),
      where('userId', '==', userId)
    );
    const existingReviewSnapshot = await getDocs(existingReviewQuery);
    
    if (!existingReviewSnapshot.empty) {
      return createErrorResponse('이미 이 상품에 대한 리뷰를 작성하셨습니다.');
    }
    
    // 상품 구매 여부 확인 (실제로는 주문 데이터와 연동)
    const ordersRef = collection(db, 'orders');
    const orderQuery = query(
      ordersRef,
      where('userId', '==', userId),
      where('status', '==', 'completed'),
      where('items', 'array-contains', { productId })
    );
    const orderSnapshot = await getDocs(orderQuery);
    const hasVerifiedPurchase = !orderSnapshot.empty;
    
    // 리뷰 데이터 생성
    const reviewData = {
      productId,
      productName: productSnap.data().name || '상품명',
      userId,
      userName,
      userAvatar,
      title,
      rating,
      comment,
      images: images || [],
      likes: 0,
      status: 'pending', // 관리자 승인 대기 상태
      isVerified: hasVerifiedPurchase, // 구매 확인 여부
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // 리뷰 저장
    const reviewDocRef = await addDoc(reviewsRef, reviewData);
    
    // 상품의 평균 평점 업데이트
    await updateProductRating(productId);
    
    return NextResponse.json({
      success: true,
      message: '리뷰가 성공적으로 등록되었습니다.',
      review: {
        id: reviewRef.id,
        ...reviewData,
        hasLiked: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  } catch (error: any) {
    console.error('리뷰 작성 오류:', error);
    
    return NextResponse.json(
      { success: false, error: '리뷰 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 상품 평균 평점 업데이트 함수
async function updateProductRating(productId: string) {
  try {
    // 상품의 모든 리뷰 조회
    const reviewsRef = collection(db, 'reviews');
    const reviewsQuery = query(
      reviewsRef,
      where('productId', '==', productId),
      where('isVisible', '==', true)
    );
    const reviewsSnapshot = await getDocs(reviewsQuery);
    
    // 평균 평점 계산
    let totalRating = 0;
    let reviewCount = 0;
    
    reviewsSnapshot.forEach(doc => {
      const reviewData = doc.data();
      totalRating += reviewData.rating;
      reviewCount++;
    });
    
    const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;
    
    // 상품 정보 업데이트
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      averageRating,
      reviewCount,
      updatedAt: serverTimestamp()
    });
    
    return { averageRating, reviewCount };
  } catch (error) {
    console.error('상품 평점 업데이트 오류:', error);
    throw error;
  }
}
