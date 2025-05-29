import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, query, where, deleteDoc } from 'firebase/firestore';

// 위시리스트 항목 삭제 API
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const productId = params.id;
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: '상품 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 위시리스트 항목 조회
    const wishlistRef = collection(db, 'wishlists');
    const wishlistQuery = query(
      wishlistRef, 
      where('userId', '==', userId),
      where('productId', '==', productId)
    );
    const wishlistSnapshot = await getDocs(wishlistQuery);
    
    if (wishlistSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: '위시리스트에 해당 상품이 없습니다.' },
        { status: 404 }
      );
    }
    
    // 위시리스트 항목 삭제
    const wishlistDoc = wishlistSnapshot.docs[0];
    await deleteDoc(doc(db, 'wishlists', wishlistDoc.id));
    
    return NextResponse.json({
      success: true,
      message: '위시리스트에서 삭제되었습니다.'
    });
  } catch (error: any) {
    console.error('위시리스트 삭제 오류:', error);
    
    return NextResponse.json(
      { success: false, error: '위시리스트 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
