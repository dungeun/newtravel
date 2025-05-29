import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  collection,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { authOptions } from '@/lib/auth';

// 장바구니 항목 조회 (GET)
export async function GET(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
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
    const { itemId } = params;
    
    // 장바구니 항목 가져오기
    const itemRef = doc(db, 'carts', userId, 'items', itemId);
    const itemDoc = await getDoc(itemRef);
    
    if (!itemDoc.exists()) {
      return NextResponse.json(
        { error: '장바구니 항목을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 항목 정보 반환
    return NextResponse.json({
      id: itemDoc.id,
      ...itemDoc.data()
    });
  } catch (error) {
    console.error('장바구니 항목 조회 오류:', error);
    return NextResponse.json(
      { error: '장바구니 항목 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 장바구니 항목 업데이트 (PATCH)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
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
    const { itemId } = params;
    
    // 요청 본문 파싱
    const body = await request.json();
    const { quantity, options, dates } = body;
    
    // 장바구니 항목 존재 확인
    const itemRef = doc(db, 'carts', userId, 'items', itemId);
    const itemDoc = await getDoc(itemRef);
    
    if (!itemDoc.exists()) {
      return NextResponse.json(
        { error: '장바구니 항목을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 업데이트할 데이터 준비
    const updateData: any = {
      updatedAt: serverTimestamp()
    };
    
    // 수량 업데이트
    if (quantity !== undefined) {
      if (quantity < 1) {
        return NextResponse.json(
          { error: '수량은 1 이상이어야 합니다.' },
          { status: 400 }
        );
      }
      updateData.quantity = quantity;
    }
    
    // 옵션 업데이트
    if (options !== undefined) {
      updateData.options = options;
    }
    
    // 날짜 업데이트
    if (dates !== undefined) {
      updateData.dates = {
        startDate: new Date(dates.startDate),
        endDate: new Date(dates.endDate)
      };
    }
    
    // 장바구니 항목 업데이트
    await updateDoc(itemRef, updateData);
    
    // 장바구니 요약 정보 업데이트
    await updateCartSummary(userId);
    
    // 업데이트된 항목 가져오기
    const updatedItemDoc = await getDoc(itemRef);
    
    // 업데이트된 항목 반환
    return NextResponse.json({
      id: updatedItemDoc.id,
      ...updatedItemDoc.data()
    });
  } catch (error) {
    console.error('장바구니 항목 업데이트 오류:', error);
    return NextResponse.json(
      { error: '장바구니 항목 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 장바구니 항목 삭제 (DELETE)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
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
    const { itemId } = params;
    
    // 장바구니 항목 존재 확인
    const itemRef = doc(db, 'carts', userId, 'items', itemId);
    const itemDoc = await getDoc(itemRef);
    
    if (!itemDoc.exists()) {
      return NextResponse.json(
        { error: '장바구니 항목을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 장바구니 항목 삭제
    await deleteDoc(itemRef);
    
    // 장바구니 요약 정보 업데이트
    await updateCartSummary(userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('장바구니 항목 삭제 오류:', error);
    return NextResponse.json(
      { error: '장바구니 항목 삭제 중 오류가 발생했습니다.' },
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
