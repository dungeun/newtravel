import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';

// 동적 렌더링 강제
export const dynamic = 'force-dynamic';

// 리뷰 작성 자격 확인 API
export async function GET(req: NextRequest) {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: '인증되지 않은 사용자입니다.', canReview: false },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const url = new URL(req.url);
    const productId = url.searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: '상품 ID가 필요합니다.', canReview: false },
        { status: 400 }
      );
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
      return NextResponse.json({
        success: true,
        canReview: false,
        message: '이미 이 상품에 대한 리뷰를 작성하셨습니다.'
      });
    }
    
    // 구매 이력 확인
    const ordersRef = collection(db, 'orders');
    const orderQuery = query(
      ordersRef,
      where('userId', '==', userId),
      where('status', 'in', ['completed', 'ready'])
    );
    const orderSnapshot = await getDocs(orderQuery);
    
    let hasPurchased = false;
    
    // 주문 내역에서 해당 상품이 있는지 확인
    for (const orderDoc of orderSnapshot.docs) {
      const orderData = orderDoc.data();
      const orderItems = orderData.items || [];
      
      if (orderItems.some((item: any) => item.productId === productId)) {
        hasPurchased = true;
        break;
      }
    }
    
    return NextResponse.json({
      success: true,
      canReview: hasPurchased,
      message: hasPurchased 
        ? '리뷰를 작성할 수 있습니다.' 
        : '이 상품을 구매한 이력이 없어 리뷰를 작성할 수 없습니다.'
    });
  } catch (error: any) {
    console.error('리뷰 작성 자격 확인 오류:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: '리뷰 작성 자격 확인 중 오류가 발생했습니다.', 
        canReview: false 
      },
      { status: 500 }
    );
  }
}
