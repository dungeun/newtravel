import { getOrderById } from '@/lib/orders';
import { withUserAuth } from '@/middleware/userAuth';
import { getToken } from 'next-auth/jwt';
import { createErrorResponse, ErrorType, withErrorHandling } from '@/lib/errorHandler';
import { NextRequest, NextResponse } from 'next/server';

// 동적 렌더링 강제
export const dynamic = 'force-dynamic';

// 특정 주문 상세 정보 조회 API
async function handler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // JWT 토큰에서 사용자 ID 가져오기
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const userId = token?.sub;
  
  if (!userId) {
    return createErrorResponse(ErrorType.UNAUTHORIZED, '유효한 사용자 ID를 찾을 수 없습니다.');
  }

  const orderId = params.id;
  
  if (!orderId) {
    return createErrorResponse(ErrorType.BAD_REQUEST, '주문 ID가 필요합니다.');
  }
  
  // 주문 ID 형식 검증 (Firebase 문서 ID 형식)
  const idRegex = /^[a-zA-Z0-9]{20}$/;
  if (!idRegex.test(orderId)) {
    return createErrorResponse(
      ErrorType.VALIDATION_ERROR, 
      '잘못된 주문 ID 형식입니다.',
      { orderId }
    );
  }
  
  // 주문 상세 정보 조회
  const order = await getOrderById(orderId);
  
  if (!order) {
    return createErrorResponse(
      ErrorType.NOT_FOUND, 
      '주문을 찾을 수 없습니다. 주문 ID를 확인해주세요.',
      { orderId }
    );
  }
  
  // 주문자 ID와 현재 사용자 ID가 일치하는지 확인
  if (order.customer.id !== userId) {
    return createErrorResponse(
      ErrorType.FORBIDDEN, 
      '해당 주문에 접근할 권한이 없습니다. 자신의 주문만 조회할 수 있습니다.'
    );
  }
  
  // 성공적인 응답
  return NextResponse.json({
    success: true,
    order
  });
}

// 인증 및 오류 처리 미들웨어 적용
export const GET = withUserAuth(withErrorHandling(handler));
