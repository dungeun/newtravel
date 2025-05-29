import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, createProduct } from '@/lib/products';
import { TravelProduct } from '@/types/product';
import { auth } from '@/lib/auth';

// 모든 상품 가져오기 (GET /api/products)
export async function GET(request: NextRequest) {
  try {
    const products = await getAllProducts();
    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('상품 목록 조회 오류:', error);
    return NextResponse.json({ error: '상품 목록을 가져오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 새 상품 생성 (POST /api/products)
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    const data = await request.json();
    
    // 기본 필드 검증
    if (!data.title || !data.description) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 새 상품 ID 생성
    const newProductId = Date.now().toString();
    
    // 새 상품 객체 생성
    const newProduct: TravelProduct = {
      id: newProductId,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 상품 생성
    const productId = await createProduct(newProduct);
    
    return NextResponse.json({ productId, message: '상품이 성공적으로 생성되었습니다.' }, { status: 201 });
  } catch (error) {
    console.error('상품 생성 오류:', error);
    return NextResponse.json({ error: '상품 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
} 