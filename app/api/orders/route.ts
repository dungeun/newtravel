import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import { createOrder, getOrdersByUser, getOrderById, updateOrder } from '@/lib/orders';
import { Order, OrderStatus } from '@/types/order';
import { decreaseInventory } from '@/lib/inventory';

// In-memory mock order storage (replace with Firestore in production)
let orders: any[] = [];

// GET /api/orders?email=xxx
export async function GET(request: NextRequest) {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({
        error: '로그인이 필요합니다.',
        success: false
      }, { status: 401 });
    }
    
    // @ts-ignore - session.user.id가 타입 정의에 없을 수 있음
    const userId = session.user.id;
    // @ts-ignore - session.user.role이 타입 정의에 없을 수 있음
    const isAdmin = session.user.role === 'admin';
    
    // 관리자가 전체 주문 목록 조회는 /api/admin/orders 엔드포인트로 구현 예정
    // 여기서는 자신의 주문만 조회 가능
    const orders = await getOrdersByUser(userId);
    
    return NextResponse.json({
      orders,
      message: '주문 목록 조회 성공',
      success: true
    }, { status: 200 });
  } catch (error) {
    console.error('주문 목록 조회 오류:', error);
    return NextResponse.json({
      error: '주문 목록을 가져오는 중 오류가 발생했습니다.',
      success: false
    }, { status: 500 });
  }
}

// POST /api/orders
export async function POST(request: NextRequest) {
  try {
    // 세션 확인 (비로그인 주문도 허용)
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || 'guest-' + Date.now().toString();
    
    const data = await request.json();
    
    // 필수 필드 검증
    if (!data.items || !data.items.length) {
      return NextResponse.json({
        error: '주문 항목은 필수입니다.',
        success: false
      }, { status: 400 });
    }
    
    if (!data.ordererInfo || !data.ordererInfo.name || !data.ordererInfo.email || !data.ordererInfo.phone) {
      return NextResponse.json({
        error: '주문자 정보는 필수입니다.',
        success: false
      }, { status: 400 });
    }
    
    if (!data.travelers || data.travelers.length === 0) {
      return NextResponse.json({
        error: '여행자 정보는 필수입니다.',
        success: false
      }, { status: 400 });
    }
    
    // 현재 시간 설정
    const now = new Date();
    
    // 주문 번호 생성 (현재 시간 + 랜덤 숫자)
    const orderNumber = `ORD-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    // 상태 설정 (타입 안전 확보)
    const initialStatus: OrderStatus = 'pending';
    
    // Omit<Order, 'id'> 타입으로 캐스팅
    const newOrder: Omit<Order, 'id'> = {
      orderNumber,
      customer: {
        id: userId,
        name: data.ordererInfo.name,
        email: data.ordererInfo.email,
        phone: data.ordererInfo.phone,
        address: data.ordererInfo.address || {}
      },
      items: data.items,
      totalAmount: data.total || data.subtotal,
      currency: data.currency || 'KRW',
      status: initialStatus,
      payment: {
        method: data.paymentMethod,
        details: data.paymentDetails || {},
        status: 'completed'
      },
      createdAt: now,
      updatedAt: now,
      specialRequests: data.specialRequests || '',
      travelers: data.travelers,
      notes: data.notes,
      couponCode: data.couponCode,
      couponDiscount: data.discountAmount || 0,
      isBusinessTrip: data.isBusinessTrip || false,
      taxInvoiceRequested: data.taxInvoiceRequested || false,
      history: {
        status: initialStatus,
        timestamp: now
      }
    };
    
    // 주문 생성
    const orderId = await createOrder(newOrder);
    
    // 재고 업데이트 (각 주문 항목에 대해)
    if (data.items && data.items.length) {
      for (const item of data.items) {
        if (item.inventoryId) {
          // 재고 감소
          const adultCount = item.options?.adult || 0;
          const childCount = item.options?.child || 0;
          const infantCount = item.options?.infant || 0;
          const quantity = adultCount + childCount + infantCount || item.quantity || 1;
          
          await decreaseInventory(item.inventoryId, quantity);
        }
      }
    }
    
    // 이메일 전송 로직 (실제 구현은 별도로 필요)
    // await sendOrderConfirmationEmail(data.ordererInfo.email, orderNumber, newOrder);
    
    return NextResponse.json({
      id: orderId,
      orderNumber,
      message: '주문이 성공적으로 생성되었습니다.',
      success: true
    }, { status: 201 });
  } catch (error) {
    console.error('주문 생성 오류:', error);
    return NextResponse.json({
      error: '주문 생성 중 오류가 발생했습니다.',
      success: false
    }, { status: 500 });
  }
}

// 주문 상태 업데이트 (PATCH /api/orders)
export async function PATCH(request: NextRequest) {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({
        error: '로그인이 필요합니다.',
        success: false
      }, { status: 401 });
    }
    
    // @ts-ignore - session.user.role이 타입 정의에 없을 수 있음
    const isAdmin = session.user.role === 'admin';
    
    // 관리자만 일괄 상태 변경 가능
    if (!isAdmin) {
      return NextResponse.json({
        error: '관리자만 주문 상태를 일괄 변경할 수 있습니다.',
        success: false
      }, { status: 403 });
    }
    
    const data = await request.json();
    
    // 필수 필드 검증
    if (!data.orderId || !data.status) {
      return NextResponse.json({
        error: '주문 ID와 변경할 상태는 필수 항목입니다.',
        success: false
      }, { status: 400 });
    }
    
    // 주문 존재 확인
    const order = await getOrderById(data.orderId);
    if (!order) {
      return NextResponse.json({
        error: '주문을 찾을 수 없습니다.',
        success: false
      }, { status: 404 });
    }
    
    // 상태 변경 검증 (타입 안전)
    const newStatus = data.status as OrderStatus;
    const validStatuses: OrderStatus[] = ['pending', 'confirmed', 'paid', 'processing', 'ready', 'completed', 'cancelled', 'refunded'];
    
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json({
        error: '유효하지 않은 주문 상태입니다.',
        success: false
      }, { status: 400 });
    }
    
    // 이미 취소/환불된 주문은 상태 변경 불가
    if ((order.status === 'cancelled' || order.status === 'refunded') && 
        newStatus !== 'cancelled' && newStatus !== 'refunded') {
      return NextResponse.json({
        error: '취소되거나 환불된 주문의 상태는 변경할 수 없습니다.',
        success: false
      }, { status: 400 });
    }
    
    // 주문 히스토리 업데이트
    const now = new Date();
    const historyEntry = {
      status: newStatus,
      timestamp: now
    };
    
    // 업데이트할 데이터 준비
    const updateData: Partial<Order> = {
      status: newStatus,
      updatedAt: now,
      history: historyEntry
    };
    
    // 주문 업데이트
    await updateOrder(data.orderId, updateData);
    
    return NextResponse.json({
      message: '주문 상태가 성공적으로 업데이트되었습니다.',
      success: true,
      status: newStatus
    }, { status: 200 });
  } catch (error) {
    console.error('주문 상태 업데이트 오류:', error);
    return NextResponse.json({
      error: '주문 상태 변경 중 오류가 발생했습니다.',
      success: false
    }, { status: 500 });
  }
} 