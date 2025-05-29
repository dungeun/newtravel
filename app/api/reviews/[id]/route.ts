import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';

// 리뷰 상세 조회 API
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;
    
    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: '리뷰 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 리뷰 조회
    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewSnap = await getDoc(reviewRef);
    
    if (!reviewSnap.exists()) {
      return NextResponse.json(
        { success: false, error: '존재하지 않는 리뷰입니다.' },
        { status: 404 }
      );
    }
    
    const reviewData = reviewSnap.data();
    
    // 현재 로그인한 사용자 정보
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // 권한 확인: 자신의 리뷰만 볼 수 있음 (관리자 제외)
    if (reviewData.userId !== userId && !session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: '권한이 없습니다.' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({
      success: true,
      review: {
        id: reviewSnap.id,
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
        isVerified: reviewData.isVerified || false,
        status: reviewData.status || 'approved',
        createdAt: reviewData.createdAt?.toDate() || new Date(),
        updatedAt: reviewData.updatedAt?.toDate() || new Date()
      }
    });
  } catch (error: any) {
    console.error('리뷰 조회 오류:', error);
    
    return NextResponse.json(
      { success: false, error: error.message || '리뷰 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 리뷰 수정 API
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;
    
    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: '리뷰 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 현재 로그인한 사용자 정보
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }
    
    // 리뷰 조회
    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewSnap = await getDoc(reviewRef);
    
    if (!reviewSnap.exists()) {
      return NextResponse.json(
        { success: false, error: '존재하지 않는 리뷰입니다.' },
        { status: 404 }
      );
    }
    
    const reviewData = reviewSnap.data();
    
    // 권한 확인: 자신의 리뷰만 수정 가능 (관리자 제외)
    if (reviewData.userId !== userId && !session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: '권한이 없습니다.' },
        { status: 403 }
      );
    }
    
    // 요청 데이터 파싱
    const requestData = await req.json();
    
    // 수정 가능한 필드만 추출
    const updateData: any = {};
    
    if (requestData.title !== undefined) {
      updateData.title = requestData.title;
    }
    
    if (requestData.rating !== undefined) {
      updateData.rating = requestData.rating;
    }
    
    if (requestData.comment !== undefined) {
      updateData.comment = requestData.comment;
    }
    
    if (requestData.images !== undefined) {
      updateData.images = requestData.images;
    }
    
    // 관리자만 수정 가능한 필드
    if (session?.user?.isAdmin) {
      if (requestData.status !== undefined) {
        updateData.status = requestData.status;
      }
      
      if (requestData.isVerified !== undefined) {
        updateData.isVerified = requestData.isVerified;
      }
    }
    
    // 수정 시간 업데이트
    updateData.updatedAt = serverTimestamp();
    
    // 리뷰 업데이트
    await updateDoc(reviewRef, updateData);
    
    return NextResponse.json({
      success: true,
      message: '리뷰가 성공적으로 수정되었습니다.'
    });
  } catch (error: any) {
    console.error('리뷰 수정 오류:', error);
    
    return NextResponse.json(
      { success: false, error: error.message || '리뷰 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 리뷰 삭제 API
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;
    
    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: '리뷰 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 현재 로그인한 사용자 정보
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }
    
    // 리뷰 조회
    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewSnap = await getDoc(reviewRef);
    
    if (!reviewSnap.exists()) {
      return NextResponse.json(
        { success: false, error: '존재하지 않는 리뷰입니다.' },
        { status: 404 }
      );
    }
    
    const reviewData = reviewSnap.data();
    
    // 권한 확인: 자신의 리뷰만 삭제 가능 (관리자 제외)
    if (reviewData.userId !== userId && !session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: '권한이 없습니다.' },
        { status: 403 }
      );
    }
    
    // 리뷰 삭제
    await deleteDoc(reviewRef);
    
    return NextResponse.json({
      success: true,
      message: '리뷰가 성공적으로 삭제되었습니다.'
    });
  } catch (error: any) {
    console.error('리뷰 삭제 오류:', error);
    
    return NextResponse.json(
      { success: false, error: error.message || '리뷰 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
