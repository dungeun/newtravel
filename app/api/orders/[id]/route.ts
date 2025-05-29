import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder, deleteOrder } from '@/lib/orders';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import { restoreInventory } from '@/lib/inventory';
import { Order, OrderStatus } from '@/types/order';

// 사용자 권한 확인 함수 (관리자이거나 주문 소유자인지 확인)
async function checkOrderPermission(orderId: string) {
  const session = await getServerSession(authOptions);
  
  // 세션이 없는 경우(비로그인)
  if (!session) {
    return {
      hasPermission: false,
      status: 401,
      message: '로그인이 필요합니다.'
    };
  }
  
  // 주문 데이터 조회
  const order = await getOrderById(orderId);
  if (!order) {
    return {
      hasPermission: false,
      status: 404,
      message: '주문을 찾을 수 없습니다.'
    };
  }
  
  // @ts-ignore - session.user.id가 타입 정의에 없을 수 있음
  const isOwner = session.user.id === order.customer.id;
  // @ts-ignore - session.user.role이 타입 정의에 없을 수 있음
  const isAdmin = session.user.role === 'admin';
  
  // 권한 체크: 관리자이거나 주문 소유자인 경우에만 접근 허용
  if (!isAdmin && !isOwner) {
    return {
      hasPermission: false,
      status: 403,
      message: '접근 권한이 없습니다.'
    };
  }
  
  return {
    hasPermission: true,
    isAdmin,
    isOwner,
    order
  };
}

// 단일 주문 조회 (GET /api/orders/[id])
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 권한 체크
    const permission = await checkOrderPermission(params.id);
    if (!permission.hasPermission) {
      return NextResponse.json({
        error: permission.message,
        success: false
      }, { status: permission.status });
    }
    
    return NextResponse.json({
      order: permission.order,
      message: '주문 조회 성공',
      success: true
    }, { status: 200 });
  } catch (error) {
    console.error('주문 조회 오류:', error);
    return NextResponse.json({
      error: '주문을 조회하는 중 오류가 발생했습니다.',
      success: false
    }, { status: 500 });
  }
}

// 주문 상태 업데이트 (PATCH /api/orders/[id])
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 권한 체크
    const permission = await checkOrderPermission(params.id);
    if (!permission.hasPermission) {
      return NextResponse.json({
        error: permission.message,
        success: false
      }, { status: permission.status });
    }
    
    // 타입 안전을 위해 order가 존재한다고 가정
    const order = permission.order as Order;
    
    const data = await request.json();
    
    // 관리자가 아닌 경우, 일부 상태 변경만 허용 (예: 'pending' -> 'cancelled'만 가능)
    if (!permission.isAdmin) {
      if (data.status && data.status !== 'cancelled') {
        return NextResponse.json({
          error: '관리자만 주문 상태를 변경할 수 있습니다.',
          success: false
        }, { status: 403 });
      }
      
      // 취소 가능한 주문 상태 체크
      if (order.status !== 'pending' && order.status !== 'confirmed') {
        return NextResponse.json({
          error: '이미 처리 중이거나 완료된 주문은 취소할 수 없습니다.',
          success: false
        }, { status: 400 });
      }
    }
    
    // 주문 상태가 바뀌는 경우 히스토리 업데이트
    if (data.status && data.status !== order.status) {
      const now = new Date();
      
      // 현재 오류가 발생하는 부분 수정
      // Order 타입의 history 필드가 배열이 아닌 객체로 정의되어 있음
      data.history = {
        status: data.status as OrderStatus,
        timestamp: now
      };
      
      // 상태가 'cancelled'로 변경되는 경우 재고 복원
      if (data.status === 'cancelled') {
        // TODO: inventoryIds와 각 항목의 수량 정보가 있어야 함
        // 여기서는 나중에 구현
      }
    }
    
    // 업데이트 시간 추가
    data.updatedAt = new Date();
    
    // 주문 업데이트
    await updateOrder(params.id, data);
    
    return NextResponse.json({
      message: '주문이 성공적으로 업데이트되었습니다.',
      success: true
    }, { status: 200 });
  } catch (error) {
    console.error('주문 업데이트 오류:', error);
    return NextResponse.json({
      error: '주문을 업데이트하는 중 오류가 발생했습니다.',
      success: false
    }, { status: 500 });
  }
}

// 주문 삭제 (DELETE /api/orders/[id]) - 관리자 전용
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
        error: '관리자만 주문을 삭제할 수 있습니다.',
        success: false
      }, { status: 403 });
    }
    
    // 주문 존재 여부 확인
    const existingOrder = await getOrderById(params.id);
    if (!existingOrder) {
      return NextResponse.json({
        error: '삭제할 주문을 찾을 수 없습니다.',
        success: false
      }, { status: 404 });
    }
    
    // 주문 삭제
    await deleteOrder(params.id);
    
    return NextResponse.json({
      message: '주문이 성공적으로 삭제되었습니다.',
      success: true
    }, { status: 200 });
  } catch (error) {
    console.error('주문 삭제 오류:', error);
    return NextResponse.json({
      error: '주문을 삭제하는 중 오류가 발생했습니다.',
      success: false
    }, { status: 500 });
  }
} 