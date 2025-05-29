import { NextRequest, NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct } from '@/lib/products';
import { auth } from '@/lib/auth';
import { TravelProduct } from '@/types/product';

// 임시 데이터 저장소 (실제로는 데이터베이스를 사용해야 함)
// 실제 구현에서는 app/api/products/route.ts와 공유되어야 하는 데이터입니다.
let products: TravelProduct[] = [
  {
    id: '1',
    title: '제주도 3박 4일 패키지',
    shortDescription: '아름다운 제주의 자연을 만끽하는 특별한 여행',
    description: '제주도의 아름다운 해변과 산을 탐험하며 특별한 추억을 만들어보세요.',
    region: '제주도',
    price: {
      adult: 550000,
      child: 350000,
      infant: 150000,
      currency: 'KRW',
    },
    status: 'published',
    images: [],
    availability: {
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    },
    duration: {
      days: 4,
      nights: 3,
    },
    categories: ['island', 'nature'],
    includesTransportation: true,
    includesAccommodation: true,
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2023-12-01'),
  },
  {
    id: '2',
    title: '부산 2박 3일 시티투어',
    shortDescription: '도시의 활기를 느끼는 부산 여행',
    description: '해운대, 광안리, 자갈치 시장 등 부산의 명소를 둘러보세요.',
    region: '부산',
    price: {
      adult: 350000,
      child: 250000,
      infant: 100000,
      currency: 'KRW',
    },
    status: 'published',
    images: [],
    availability: {
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
    },
    duration: {
      days: 3,
      nights: 2,
    },
    categories: ['city', 'culture'],
    includesTransportation: true,
    includesAccommodation: true,
    createdAt: new Date('2023-11-15'),
    updatedAt: new Date('2023-11-15'),
  },
];

interface RouteParams {
  params: {
    id: string;
  };
}

// 단일 상품 조회 (GET /api/products/[id])
export async function GET(request: Request, { params }: RouteParams) {
  const { id } = params;
  
  // 해당 ID를 가진 상품 찾기
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return NextResponse.json(
      { error: '상품을 찾을 수 없습니다.' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(product);
}

// 상품 수정 (PUT /api/products/[id])
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    // 인증 확인
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    const data = await request.json();
    
    // 해당 ID를 가진 상품 찾기
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 상품 업데이트
    products[productIndex] = {
      ...products[productIndex],
      ...data,
      id, // ID는 변경되지 않도록
      updatedAt: new Date(),
    };
    
    return NextResponse.json(products[productIndex]);
  } catch (error) {
    console.error('상품 업데이트 중 오류:', error);
    return NextResponse.json(
      { error: '상품 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 상품 삭제 (DELETE /api/products/[id])
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    // 인증 확인
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    // 해당 ID를 가진 상품 찾기
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 상품 삭제
    products.splice(productIndex, 1);
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('상품 삭제 중 오류:', error);
    return NextResponse.json(
      { error: '상품 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 