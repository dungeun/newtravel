import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  Timestamp, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { authOptions } from '@/lib/auth';

// 장바구니 조회 (GET)
export async function GET(request: NextRequest) {
  try {
    // 세션에서 사용자 정보 가져오기
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // 장바구니 문서 가져오기
    const cartDocRef = doc(db, 'carts', userId);
    const cartDoc = await getDoc(cartDocRef);
    
    // 장바구니 문서가 없으면 빈 장바구니 생성
    if (!cartDoc.exists()) {
      const emptyCart = {
        userId,
        itemCount: 0,
        subtotal: 0,
        discountAmount: 0,
        total: 0,
        lastUpdated: serverTimestamp(),
      };
      
      await updateDoc(cartDocRef, emptyCart);
      return NextResponse.json({ id: userId, ...emptyCart, items: [] });
    }
    
    // 장바구니 항목 가져오기
    const cartItemsRef = collection(db, 'carts', userId, 'items');
    const cartItemsSnapshot = await getDocs(cartItemsRef);
    const items = cartItemsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // 장바구니 정보 반환
    return NextResponse.json({
      id: cartDoc.id,
      ...cartDoc.data(),
      items
    });
  } catch (error) {
    console.error('장바구니 조회 오류:', error);
    return NextResponse.json(
      { error: '장바구니 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 장바구니 항목 추가 (POST)
export async function POST(request: NextRequest) {
  try {
    // 세션에서 사용자 정보 가져오기
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // 요청 본문 파싱
    const body = await request.json();
    const { productId, title, mainImage, price, quantity, options, dates } = body;
    
    // 필수 필드 검증
    if (!productId || !title || !price || !quantity) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }
    
    // 장바구니 항목 추가
    const cartItemsRef = collection(db, 'carts', userId, 'items');
    
    const newItem = {
      productId,
      title,
      mainImage,
      price,
      quantity,
      options,
      dates: dates ? {
        startDate: Timestamp.fromDate(new Date(dates.startDate)),
        endDate: Timestamp.fromDate(new Date(dates.endDate))
      } : undefined,
      addedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(cartItemsRef, newItem);
    
    // 장바구니 요약 정보 업데이트
    await updateCartSummary(userId);
    
    // 추가된 항목 반환
    return NextResponse.json({
      id: docRef.id,
      ...newItem
    });
  } catch (error) {
    console.error('장바구니 항목 추가 오류:', error);
    return NextResponse.json(
      { error: '장바구니 항목 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 장바구니 비우기 (DELETE)
export async function DELETE(request: NextRequest) {
  try {
    // 세션에서 사용자 정보 가져오기
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // 장바구니 항목 가져오기
    const cartItemsRef = collection(db, 'carts', userId, 'items');
    const snapshot = await getDocs(cartItemsRef);
    
    // 모든 항목 삭제
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // 장바구니 정보 업데이트
    const cartRef = doc(db, 'carts', userId);
    await updateDoc(cartRef, {
      itemCount: 0,
      subtotal: 0,
      discountAmount: 0,
      total: 0,
      lastUpdated: serverTimestamp()
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('장바구니 비우기 오류:', error);
    return NextResponse.json(
      { error: '장바구니 비우기 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 장바구니 요약 정보 업데이트 (내부 함수)
async function updateCartSummary(userId: string): Promise<void> {
  if (!userId) return;
  
  try {
    // 장바구니 항목 가져오기
    const cartItemsRef = collection(db, 'carts', userId, 'items');
    const snapshot = await getDocs(cartItemsRef);
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // 총 금액 및 항목 수 계산
    const itemCount = items.reduce((total, item: any) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item: any) => total + (item.price * item.quantity), 0);
    
    // 할인 금액 계산 (할인 로직이 있을 경우)
    const discountAmount = 0; // 예시: 할인 없음
    
    // 최종 금액 계산
    const total = subtotal - discountAmount;
    
    // 장바구니 문서 업데이트
    const cartRef = doc(db, 'carts', userId);
    await updateDoc(cartRef, {
      itemCount,
      subtotal,
      discountAmount,
      total,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('장바구니 요약 업데이트 오류:', error);
    throw error;
  }
}
