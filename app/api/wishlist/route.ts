import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

// 위시리스트 조회 API
export async function GET(req: NextRequest) {
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
    
    // Firebase에서 위시리스트 조회
    const wishlistRef = collection(db, 'wishlists');
    const wishlistQuery = query(wishlistRef, where('userId', '==', userId));
    const wishlistSnapshot = await getDocs(wishlistQuery);
    
    // 위시리스트 항목 매핑
    const wishlistItems = [];
    
    for (const doc of wishlistSnapshot.docs) {
      const wishlistData = doc.data();
      const productId = wishlistData.productId;
      
      // 상품 정보 조회
      const productsRef = collection(db, 'products');
      const productQuery = query(productsRef, where('id', '==', productId));
      const productSnapshot = await getDocs(productQuery);
      
      if (!productSnapshot.empty) {
        const productData = productSnapshot.docs[0].data();
        
        wishlistItems.push({
          id: productData.id,
          title: productData.title,
          price: productData.price,
          image: productData.images?.[0] || null,
          description: productData.description,
          wishlistId: doc.id, // 위시리스트 항목 ID
          addedAt: wishlistData.createdAt?.toDate() || new Date()
        });
      }
    }
    
    // 날짜 기준으로 정렬 (최신순)
    wishlistItems.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
    
    return NextResponse.json({
      success: true,
      items: wishlistItems
    });
  } catch (error: any) {
    console.error('위시리스트 조회 오류:', error);
    
    return NextResponse.json(
      { success: false, error: '위시리스트 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 위시리스트 추가 API
export async function POST(req: NextRequest) {
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
    const { productId } = await req.json();
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: '상품 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 이미 위시리스트에 있는지 확인
    const wishlistRef = collection(db, 'wishlists');
    const wishlistQuery = query(
      wishlistRef, 
      where('userId', '==', userId),
      where('productId', '==', productId)
    );
    const wishlistSnapshot = await getDocs(wishlistQuery);
    
    if (!wishlistSnapshot.empty) {
      return NextResponse.json({
        success: true,
        message: '이미 위시리스트에 추가된 상품입니다.',
        alreadyExists: true
      });
    }
    
    // 위시리스트에 추가
    const newWishlistItem = {
      userId,
      productId,
      createdAt: new Date()
    };
    
    await addDoc(collection(db, 'wishlists'), newWishlistItem);
    
    return NextResponse.json({
      success: true,
      message: '위시리스트에 추가되었습니다.'
    });
  } catch (error: any) {
    console.error('위시리스트 추가 오류:', error);
    
    return NextResponse.json(
      { success: false, error: '위시리스트 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
