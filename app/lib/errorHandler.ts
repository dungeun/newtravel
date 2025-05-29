import { NextResponse } from 'next/server';
import { logger } from './logger';

// 오류 타입 정의
export enum ErrorType {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT = 'CONFLICT',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}

// 오류 응답 인터페이스
export interface ErrorResponse {
  error: {
    type: ErrorType;
    message: string;
    details?: any;
  };
  status: number;
}

// HTTP 상태 코드 매핑
const statusCodes: Record<ErrorType, number> = {
  [ErrorType.UNAUTHORIZED]: 401,
  [ErrorType.FORBIDDEN]: 403,
  [ErrorType.NOT_FOUND]: 404,
  [ErrorType.BAD_REQUEST]: 400,
  [ErrorType.INTERNAL_ERROR]: 500,
  [ErrorType.VALIDATION_ERROR]: 422,
  [ErrorType.CONFLICT]: 409,
  [ErrorType.SERVICE_UNAVAILABLE]: 503
};

// 사용자 친화적인 오류 메시지
const defaultMessages: Record<ErrorType, string> = {
  [ErrorType.UNAUTHORIZED]: '로그인이 필요합니다.',
  [ErrorType.FORBIDDEN]: '해당 리소스에 접근할 권한이 없습니다.',
  [ErrorType.NOT_FOUND]: '요청한 리소스를 찾을 수 없습니다.',
  [ErrorType.BAD_REQUEST]: '잘못된 요청입니다.',
  [ErrorType.INTERNAL_ERROR]: '서버 오류가 발생했습니다. 나중에 다시 시도해주세요.',
  [ErrorType.VALIDATION_ERROR]: '입력 데이터가 유효하지 않습니다.',
  [ErrorType.CONFLICT]: '요청이 현재 리소스 상태와 충돌합니다.',
  [ErrorType.SERVICE_UNAVAILABLE]: '서비스를 일시적으로 사용할 수 없습니다.'
};

/**
 * API 오류 응답 생성 함수
 * @param type 오류 타입
 * @param message 사용자 정의 오류 메시지 (선택적)
 * @param details 추가 오류 세부 정보 (선택적)
 * @returns NextResponse 객체
 */
export function createErrorResponse(
  type: ErrorType,
  message?: string,
  details?: any
): NextResponse<ErrorResponse> {
  const status = statusCodes[type] || 500;
  const errorMessage = message || defaultMessages[type];
  
  // 오류 로깅
  logger.error(`API 오류 [${type}]: ${errorMessage}`, details);
  
  return NextResponse.json(
    {
      error: {
        type,
        message: errorMessage,
        ...(details ? { details } : {})
      },
      status
    },
    { status }
  );
}

/**
 * API 오류 처리 미들웨어
 * @param handler API 핸들러 함수
 * @returns 오류 처리가 적용된 API 핸들러 함수
 */
export function withErrorHandling(handler: Function) {
  return async function(...args: any[]) {
    try {
      return await handler(...args);
    } catch (error: any) {
      logger.error('API 핸들러 오류:', error);
      
      // Firebase 오류 처리
      if (error.code && error.code.startsWith('auth/')) {
        return createErrorResponse(
          ErrorType.UNAUTHORIZED,
          '인증 오류가 발생했습니다: ' + error.message
        );
      }
      
      // Firestore 오류 처리
      if (error.code && error.code.startsWith('firestore/')) {
        return createErrorResponse(
          ErrorType.INTERNAL_ERROR,
          '데이터베이스 오류가 발생했습니다: ' + error.message
        );
      }
      
      // 기타 오류 처리
      return createErrorResponse(
        ErrorType.INTERNAL_ERROR,
        '요청을 처리하는 중 오류가 발생했습니다.'
      );
    }
  };
}

/**
 * 클라이언트 측 오류 처리 함수
 * @param response Fetch API 응답 객체
 * @returns 오류 메시지 또는 null (오류가 없는 경우)
 */
export async function handleApiError(response: Response): Promise<string | null> {
  if (response.ok) return null;
  
  try {
    const errorData = await response.json();
    return errorData.error?.message || '알 수 없는 오류가 발생했습니다.';
  } catch (error) {
    return `오류 발생 (${response.status}): ${response.statusText || '알 수 없는 오류'}`;
  }
}
