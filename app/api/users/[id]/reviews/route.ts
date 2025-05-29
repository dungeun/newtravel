import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit 
} from 'firebase/firestore';

// 사용자별 리뷰 목록 조회 API
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 현재 로그인한 사용자 정보
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;
    
    // 권한 확인: 자신의 리뷰만 볼 수 있음 (관리자 제외)
    if (userId !== currentUserId && !session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: '권한이 없습니다.' },
        { status: 403 }
      );
    }
    
    // URL 파라미터 처리
    const url = new URL(req.url);
    const limitCount = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    const offset = (page - 1) * limitCount;
    
    // 리뷰 목록 조회
    const reviewsRef = collection(db, 'reviews');
    const reviewsQuery = query(
      reviewsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const reviewsSnapshot = await getDocs(reviewsQuery);
    const reviews = [];
    
    // 리뷰 데이터 가공
    for (const doc of reviewsSnapshot.docs) {
      const reviewData = doc.data();
      
      reviews.push({
        id: doc.id,
        productId: reviewData.productId,
        productName: reviewData.productName || '상품명',
        title: reviewData.title,
        rating: reviewData.rating,
        comment: reviewData.comment,
        images: reviewData.images || [],
        likes: reviewData.likes || 0,
        status: reviewData.status || 'approved',
        isVerified: reviewData.isVerified || false,
        createdAt: reviewData.createdAt?.toDate() || new Date(),
        updatedAt: reviewData.updatedAt?.toDate() || new Date()
      });
    }
    
    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        total: reviews.length,
        page,
        limit: limitCount
      }
    });
  } catch (error: any) {
    console.error('사용자 리뷰 조회 오류:', error);
    
    return NextResponse.json(
      { success: false, error: error.message || '리뷰 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
