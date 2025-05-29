import { NextRequest, NextResponse } from 'next/server';
import { getCategoryById, updateCategory, deleteCategory } from '@/lib/categories';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import { getProductsByCategory } from '@/lib/products';

// 단일 카테고리 조회 (GET /api/categories/[id])
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await getCategoryById(params.id);
    
    if (!category) {
      return NextResponse.json({
        error: '카테고리를 찾을 수 없습니다.',
        success: false
      }, { status: 404 });
    }
    
    return NextResponse.json({
      category,
      message: '카테고리 조회 성공',
      success: true
    }, { status: 200 });
  } catch (error) {
    console.error('카테고리 조회 오류:', error);
    return NextResponse.json({
      error: '카테고리를 조회하는 중 오류가 발생했습니다.',
      success: false
    }, { status: 500 });
  }
}

// 카테고리 수정 (관리자만 가능) (PUT /api/categories/[id])
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 세션 확인 및 관리자 권한 체크
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({
        error: '로그인이 필요합니다.',
        success: false
      }, { status: 401 });
    }
    
    // 관리자 권한 체크
    // @ts-ignore - session.user.role이 타입 정의에 없을 수 있음
    if (session.user.role !== 'admin') {
      return NextResponse.json({
        error: '관리자만 카테고리를 수정할 수 있습니다.',
        success: false
      }, { status: 403 });
    }
    
    // 기존 카테고리 확인
    const existingCategory = await getCategoryById(params.id);
    if (!existingCategory) {
      return NextResponse.json({
        error: '수정할 카테고리를 찾을 수 없습니다.',
        success: false
      }, { status: 404 });
    }
    
    const data = await request.json();
    
    // 필수 필드 확인
    if (!data.name) {
      return NextResponse.json({
        error: '카테고리 이름은 필수입니다.',
        success: false
      }, { status: 400 });
    }
    
    // 업데이트 시간 추가
    data.updatedAt = new Date();
    
    // 카테고리 업데이트
    await updateCategory(params.id, data);
    
    return NextResponse.json({
      message: '카테고리가 성공적으로 수정되었습니다.',
      success: true
    }, { status: 200 });
  } catch (error) {
    console.error('카테고리 수정 오류:', error);
    return NextResponse.json({
      error: '카테고리를 수정하는 중 오류가 발생했습니다.',
      success: false
    }, { status: 500 });
  }
}

// 카테고리 삭제 (관리자만 가능) (DELETE /api/categories/[id])
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 세션 확인 및 관리자 권한 체크
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({
        error: '로그인이 필요합니다.',
        success: false
      }, { status: 401 });
    }
    
    // 관리자 권한 체크
    // @ts-ignore - session.user.role이 타입 정의에 없을 수 있음
    if (session.user.role !== 'admin') {
      return NextResponse.json({
        error: '관리자만 카테고리를 삭제할 수 있습니다.',
        success: false
      }, { status: 403 });
    }
    
    // 기존 카테고리 확인
    const existingCategory = await getCategoryById(params.id);
    if (!existingCategory) {
      return NextResponse.json({
        error: '삭제할 카테고리를 찾을 수 없습니다.',
        success: false
      }, { status: 404 });
    }
    
    // 이 카테고리에 속한 상품이 있는지 확인
    const relatedProducts = await getProductsByCategory(params.id);
    
    if (relatedProducts.length > 0) {
      return NextResponse.json({
        error: '이 카테고리에 속한 상품이 있어 삭제할 수 없습니다. 먼저 상품을 다른 카테고리로 이동하거나 삭제해주세요.',
        relatedProductsCount: relatedProducts.length,
        success: false
      }, { status: 400 });
    }
    
    // 카테고리 삭제
    await deleteCategory(params.id);
    
    return NextResponse.json({
      message: '카테고리가 성공적으로 삭제되었습니다.',
      success: true
    }, { status: 200 });
  } catch (error) {
    console.error('카테고리 삭제 오류:', error);
    return NextResponse.json({
      error: '카테고리를 삭제하는 중 오류가 발생했습니다.',
      success: false
    }, { status: 500 });
  }
} 