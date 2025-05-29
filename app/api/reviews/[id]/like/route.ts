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
  deleteDoc, 
  query, 
  where, 
  updateDoc, 
  increment, 
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { reviewLikeSchema } from '@/lib/validations/review';

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

// 리뷰 좋아요 API
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 확인
    const authResult = await checkAuth(req);
    if (!authResult.authenticated) {
      return createErrorResponse(authResult.error, authResult.status);
    }
    
    const userId = authResult.userId;
    const reviewId = params.id;
    
    if (!reviewId) {
      return createErrorResponse('리뷰 ID가 필요합니다.');
    }
    
    // 요청 데이터 검증
    try {
      reviewLikeSchema.parse({ reviewId });
    } catch (validationError: any) {
      return createErrorResponse(validationError.errors?.[0]?.message || '유효하지 않은 데이터입니다.');
    }
    
    // 리뷰 존재 여부 확인
    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewSnap = await getDoc(reviewRef);
    
    if (!reviewSnap.exists()) {
      return createErrorResponse('존재하지 않는 리뷰입니다.', 404);
    }
    
    // 승인된 리뷰인지 확인
    const reviewData = reviewSnap.data();
    if (reviewData.status !== 'approved') {
      return createErrorResponse('승인되지 않은 리뷰입니다.', 403);
    }
    
    // 트랜잭션을 사용하여 좋아요 처리 (동시성 문제 해결)
    return await runTransaction(db, async (transaction) => {
      // 이미 좋아요를 눌렀는지 확인
      const likesRef = collection(db, 'reviewLikes');
      const likeQuery = query(
        likesRef,
        where('reviewId', '==', reviewId),
        where('userId', '==', userId)
      );
      const likeSnapshot = await getDocs(likeQuery);
      
      let hasLiked = false;
      let likes = reviewData.likes || 0;
      
      if (likeSnapshot.empty) {
        // 좋아요 추가
        const newLikeRef = doc(collection(db, 'reviewLikes'));
        transaction.set(newLikeRef, {
          reviewId,
          userId,
          createdAt: serverTimestamp()
        });
        
        // 리뷰의 좋아요 수 증가
        transaction.update(reviewRef, {
          likes: increment(1)
        });
        
        hasLiked = true;
        likes += 1;
      } else {
        // 좋아요 취소
        const likeDoc = likeSnapshot.docs[0];
        transaction.delete(doc(db, 'reviewLikes', likeDoc.id));
        
        // 리뷰의 좋아요 수 감소
        transaction.update(reviewRef, {
          likes: increment(-1)
        });
        
        hasLiked = false;
        likes = Math.max(0, likes - 1);
      }
    
      return NextResponse.json({
        success: true,
        message: hasLiked ? '리뷰에 좋아요를 표시했습니다.' : '리뷰 좋아요를 취소했습니다.',
        hasLiked,
        likes
      });
    });
  } catch (error: any) {
    console.error('리뷰 좋아요 오류:', error);
    return createErrorResponse(error.message || '리뷰 좋아요 처리 중 오류가 발생했습니다.', 500);
  }
}
