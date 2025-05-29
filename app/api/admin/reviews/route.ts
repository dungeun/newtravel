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
  limit,
  startAfter,
  getDoc,
  doc,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';

// 라우트 세그먼트 설정 - 동적 렌더링 강제
export const dynamic = 'force-dynamic';

// 관리자용 리뷰 목록 조회 API
export async function GET(req: NextRequest) {
  try {
    // 현재 로그인한 사용자 정보
    const session = await getServerSession(authOptions);
    
    // 관리자 권한 확인
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }
    
    // URL 파라미터 처리
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || '';
    const search = url.searchParams.get('search') || '';
    const sort = url.searchParams.get('sort') || 'createdAt';
    const order = url.searchParams.get('order') || 'desc';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limitCount = parseInt(url.searchParams.get('limit') || '10');
    const cursor = url.searchParams.get('cursor') || '';
    
    // 쿼리 조건 설정
    const constraints: QueryConstraint[] = [];
    
    // 상태 필터링
    if (status) {
      constraints.push(where('status', '==', status));
    }
    
    // 정렬 설정
    constraints.push(orderBy(sort, order as 'asc' | 'desc'));
    
    // 페이지네이션 설정
    if (cursor) {
      const cursorDoc = await getDoc(doc(db, 'reviews', cursor));
      if (cursorDoc.exists()) {
        constraints.push(startAfter(cursorDoc));
      }
    }
    
    constraints.push(limit(limitCount));
    
    // 리뷰 목록 조회
    const reviewsRef = collection(db, 'reviews');
    const reviewsQuery = query(reviewsRef, ...constraints);
    const reviewsSnapshot = await getDocs(reviewsQuery);
    
    // 검색어가 있는 경우 클라이언트 측에서 필터링 (Firestore는 전체 텍스트 검색을 지원하지 않음)
    let reviews = [];
    let filteredCount = 0;
    
    for (const doc of reviewsSnapshot.docs) {
      const reviewData = doc.data();
      
      // 검색어 필터링
      if (search && !(
        reviewData.title?.toLowerCase().includes(search.toLowerCase()) ||
        reviewData.comment?.toLowerCase().includes(search.toLowerCase()) ||
        reviewData.userName?.toLowerCase().includes(search.toLowerCase()) ||
        reviewData.productName?.toLowerCase().includes(search.toLowerCase())
      )) {
        continue;
      }
      
      filteredCount++;
      
      reviews.push({
        id: doc.id,
        productId: reviewData.productId,
        productName: reviewData.productName || '상품명',
        userId: reviewData.userId,
        userName: reviewData.userName,
        userAvatar: reviewData.userAvatar,
        title: reviewData.title,
        rating: reviewData.rating,
        comment: reviewData.comment,
        images: reviewData.images || [],
        likes: reviewData.likes || 0,
        status: reviewData.status || 'pending',
        isVerified: reviewData.isVerified || false,
        createdAt: reviewData.createdAt?.toDate() || new Date(),
        updatedAt: reviewData.updatedAt?.toDate() || new Date()
      });
    }
    
    // 전체 리뷰 수 조회 (페이지네이션용)
    let totalCount = 0;
    
    if (status || search) {
      // 필터링된 경우 전체 리뷰를 조회하여 카운트 (비효율적이지만 Firestore의 한계)
      const countConstraints: QueryConstraint[] = [];
      
      if (status) {
        countConstraints.push(where('status', '==', status));
      }
      
      const countQuery = query(reviewsRef, ...countConstraints);
      const countSnapshot = await getDocs(countQuery);
      
      if (search) {
        // 검색어가 있는 경우 클라이언트 측에서 필터링하여 카운트
        totalCount = countSnapshot.docs.filter(doc => {
          const data = doc.data();
          return (
            data.title?.toLowerCase().includes(search.toLowerCase()) ||
            data.comment?.toLowerCase().includes(search.toLowerCase()) ||
            data.userName?.toLowerCase().includes(search.toLowerCase()) ||
            data.productName?.toLowerCase().includes(search.toLowerCase())
          );
        }).length;
      } else {
        totalCount = countSnapshot.size;
      }
    } else {
      // 필터링되지 않은 경우 전체 리뷰 수 조회
      const countQuery = query(reviewsRef);
      const countSnapshot = await getDocs(countQuery);
      totalCount = countSnapshot.size;
    }
    
    // 페이지네이션 정보
    const lastDoc = reviewsSnapshot.docs[reviewsSnapshot.docs.length - 1];
    const nextCursor = lastDoc ? lastDoc.id : null;
    
    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        total: totalCount,
        page,
        limit: limitCount,
        nextCursor: nextCursor && reviews.length === limitCount ? nextCursor : null
      }
    });
  } catch (error: any) {
    console.error('관리자 리뷰 조회 오류:', error);
    
    return NextResponse.json(
      { success: false, error: error.message || '리뷰 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
