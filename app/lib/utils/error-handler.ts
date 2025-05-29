import { NextResponse } from 'next/server';

/**
 * API 오류 타입
 */
export type ApiError = {
  code: string;
  message: string;
  status: number;
  details?: any;
};

/**
 * 일반적인 API 오류
 */
export const API_ERRORS = {
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: '로그인이 필요합니다.',
    status: 401
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: '접근 권한이 없습니다.',
    status: 403
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: '요청한 리소스를 찾을 수 없습니다.',
    status: 404
  },
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: '입력 데이터가 유효하지 않습니다.',
    status: 400
  },
  ALREADY_EXISTS: {
    code: 'ALREADY_EXISTS',
    message: '이미 존재하는 리소스입니다.',
    status: 409
  },
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    message: '서버 오류가 발생했습니다.',
    status: 500
  }
};

/**
 * 리뷰 관련 API 오류
 */
export const REVIEW_ERRORS = {
  ALREADY_REVIEWED: {
    code: 'ALREADY_REVIEWED',
    message: '이미 리뷰를 작성했습니다.',
    status: 400
  },
  NOT_PURCHASED: {
    code: 'NOT_PURCHASED',
    message: '구매한 상품만 리뷰를 작성할 수 있습니다.',
    status: 403
  },
  REVIEW_NOT_FOUND: {
    code: 'REVIEW_NOT_FOUND',
    message: '리뷰를 찾을 수 없습니다.',
    status: 404
  },
  ALREADY_LIKED: {
    code: 'ALREADY_LIKED',
    message: '이미 좋아요를 누른 리뷰입니다.',
    status: 400
  },
  ALREADY_REPORTED: {
    code: 'ALREADY_REPORTED',
    message: '이미 신고한 리뷰입니다.',
    status: 400
  },
  CANNOT_REPORT_OWN_REVIEW: {
    code: 'CANNOT_REPORT_OWN_REVIEW',
    message: '자신의 리뷰는 신고할 수 없습니다.',
    status: 403
  },
  REVIEW_NOT_APPROVED: {
    code: 'REVIEW_NOT_APPROVED',
    message: '승인되지 않은 리뷰입니다.',
    status: 403
  }
};

/**
 * API 오류 응답 생성 함수
 * @param error 오류 객체 또는 오류 메시지
 * @param status HTTP 상태 코드 (기본값: 500)
 * @param details 추가 오류 세부 정보
 * @returns NextResponse 객체
 */
export const createApiErrorResponse = (
  error: ApiError | string,
  status: number = 500,
  details?: any
) => {
  // 문자열인 경우 오류 객체로 변환
  if (typeof error === 'string') {
    error = {
      code: 'API_ERROR',
      message: error,
      status,
      details
    };
  }

  // 오류 로깅 (실제 환경에서는 로깅 서비스 연동)
  console.error(`API Error [${error.code}]: ${error.message}`, error.details || '');

  return NextResponse.json(
    {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details || details
      }
    },
    { status: error.status || status }
  );
};

/**
 * 예외 처리 래퍼 함수
 * API 핸들러를 감싸서 예외 처리를 통합적으로 관리
 * @param handler API 핸들러 함수
 * @returns 예외 처리가 적용된 API 핸들러 함수
 */
export const withErrorHandling = (handler: Function) => {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error: any) {
      console.error('API Error:', error);
      
      // Firebase 오류 처리
      if (error.code && error.code.startsWith('firestore/')) {
        return createApiErrorResponse({
          code: error.code,
          message: error.message || '데이터베이스 오류가 발생했습니다.',
          status: 500
        });
      }
      
      // Zod 유효성 검사 오류 처리
      if (error.errors && Array.isArray(error.errors)) {
        return createApiErrorResponse({
          code: 'VALIDATION_ERROR',
          message: error.errors[0]?.message || '입력 데이터가 유효하지 않습니다.',
          status: 400,
          details: error.errors
        });
      }
      
      // 기타 오류
      return createApiErrorResponse({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || '서버 오류가 발생했습니다.',
        status: 500
      });
    }
  };
};
