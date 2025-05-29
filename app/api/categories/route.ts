import { NextRequest, NextResponse } from 'next/server';
import { getAllCategories, createCategory } from '@/lib/categories';
import { ProductCategory } from '@/types/category';

// 모든 카테고리 가져오기 (GET /api/categories)
export async function GET(request: NextRequest) {
  try {
    const categories = await getAllCategories();
    return NextResponse.json({ 
      categories, 
      message: '카테고리 조회 성공',
      success: true 
    }, { status: 200 });
  } catch (error) {
    console.error('카테고리 목록 조회 오류:', error);
    return NextResponse.json({ 
      error: '카테고리 목록을 가져오는 중 오류가 발생했습니다.', 
      success: false 
    }, { status: 500 });
  }
}

// 새 카테고리 생성 (POST /api/categories)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 필수 필드 검증
    if (!data.name) {
      return NextResponse.json({ 
        error: '카테고리 이름은 필수 항목입니다.', 
        success: false 
      }, { status: 400 });
    }
    
    // 현재 시간 설정
    const now = new Date();
    
    // 기본 순서 값 설정 (없으면 0)
    if (data.order === undefined) {
      data.order = 0;
    }
    
    // Omit<ProductCategory, 'id'> 타입으로 캐스팅
    const newCategory: Omit<ProductCategory, 'id'> = {
      name: data.name,
      description: data.description || '',
      parentId: data.parentId || undefined,
      imageUrl: data.imageUrl || undefined,
      order: data.order,
      createdAt: now,
      updatedAt: now
    };
    
    // 카테고리 생성
    const categoryId = await createCategory(newCategory);
    
    return NextResponse.json({ 
      categoryId, 
      message: '카테고리가 성공적으로 생성되었습니다.',
      success: true 
    }, { status: 201 });
  } catch (error) {
    console.error('카테고리 생성 오류:', error);
    return NextResponse.json({ 
      error: '카테고리 생성 중 오류가 발생했습니다.', 
      success: false 
    }, { status: 500 });
  }
} 