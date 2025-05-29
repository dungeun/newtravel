import { NextRequest, NextResponse } from 'next/server';
import { getOrdersByUser } from '@/lib/orders';
import { withUserAuth } from '@/middleware/userAuth';
import { getToken } from 'next-auth/jwt';
import { createErrorResponse, ErrorType, withErrorHandling } from '@/lib/errorHandler';
import { Order } from '@/types/order';

// 사용자 주문 내역 조회 API
async function handler(request: NextRequest) {
  // JWT 토큰에서 사용자 ID 가져오기
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const userId = token?.sub;
  
  if (!userId) {
    return createErrorResponse(ErrorType.UNAUTHORIZED, '유효한 사용자 ID를 찾을 수 없습니다.');
  }
  
  // 쿼리 파라미터 파싱
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  
  // 필터링 파라미터
  const status = searchParams.get('status');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const search = searchParams.get('search');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  
  if (page < 1 || limit < 1 || limit > 50) {
    return createErrorResponse(
      ErrorType.VALIDATION_ERROR, 
      '잘못된 페이지 또는 한계 값입니다. 페이지는 1 이상, 한계는 1~50 사이의 값이어야 합니다.'
    );
  }
  
  // 정렬 필드 검증
  const validSortFields = ['createdAt', 'totalAmount', 'status', 'orderNumber'];
  if (!validSortFields.includes(sortBy)) {
    return createErrorResponse(
      ErrorType.VALIDATION_ERROR,
      `잘못된 정렬 필드입니다. 유효한 필드: ${validSortFields.join(', ')}`
    );
  }
  
  // 정렬 순서 검증
  if (sortOrder !== 'asc' && sortOrder !== 'desc') {
    return createErrorResponse(
      ErrorType.VALIDATION_ERROR,
      '정렬 순서는 asc(오름차순) 또는 desc(내림차순)이어야 합니다.'
    );
  }
  
  // 사용자 주문 내역 조회
  let orders = await getOrdersByUser(userId);
  
  // 주문이 없는 경우 빈 배열 반환 (오류가 아님)
  if (orders.length === 0) {
    return NextResponse.json({
      orders: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: limit
      }
    });
  }
  
  // 필터링 적용
  if (status) {
    orders = orders.filter(order => order.status === status);
  }
  
  if (startDate) {
    const startTimestamp = new Date(startDate).getTime();
    orders = orders.filter(order => {
      const orderDate = new Date(order.createdAt).getTime();
      return orderDate >= startTimestamp;
    });
  }
  
  if (endDate) {
    const endTimestamp = new Date(endDate).getTime();
    orders = orders.filter(order => {
      const orderDate = new Date(order.createdAt).getTime();
      return orderDate <= endTimestamp;
    });
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    orders = orders.filter(order => {
      return (
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.items.some(item => item.productTitle.toLowerCase().includes(searchLower))
      );
    });
  }
  
  // 정렬 적용
  orders.sort((a, b) => {
    let valueA: any;
    let valueB: any;
    
    switch (sortBy) {
      case 'createdAt':
        valueA = new Date(a.createdAt).getTime();
        valueB = new Date(b.createdAt).getTime();
        break;
      case 'totalAmount':
        valueA = a.totalAmount;
        valueB = b.totalAmount;
        break;
      case 'status':
        valueA = a.status;
        valueB = b.status;
        break;
      case 'orderNumber':
        valueA = a.orderNumber;
        valueB = b.orderNumber;
        break;
      default:
        valueA = new Date(a.createdAt).getTime();
        valueB = new Date(b.createdAt).getTime();
    }
    
    const compareResult = valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    return sortOrder === 'asc' ? compareResult : -compareResult;
  });
  
  // 필터링 후 주문이 없는 경우
  if (orders.length === 0) {
    return NextResponse.json({
      orders: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: limit
      },
      filters: { status, startDate, endDate, search, sortBy, sortOrder }
    });
  }
  
  // 페이지네이션 계산
  const offset = (page - 1) * limit;
  const totalPages = Math.ceil(orders.length / limit);
  
  // 요청한 페이지가 총 페이지 수를 초과하는 경우
  if (page > totalPages && totalPages > 0) {
    return createErrorResponse(
      ErrorType.BAD_REQUEST, 
      `요청한 페이지(${page})가 총 페이지 수(${totalPages})를 초과합니다.`
    );
  }
  
  // 페이지네이션 적용
  const paginatedOrders = orders.slice(offset, offset + limit);
  
  // 상태별 주문 수 계산
  const statusCounts: Record<string, number> = {};
  orders.forEach(order => {
    const status = order.status;
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  
  return NextResponse.json({
    success: true,
    orders: paginatedOrders,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: orders.length,
      itemsPerPage: limit
    },
    filters: { status, startDate, endDate, search, sortBy, sortOrder },
    summary: {
      statusCounts,
      totalOrders: orders.length
    }
  });
}

// 인증 및 오류 처리 미들웨어 적용
export const GET = withUserAuth(withErrorHandling(handler));
