import { logger } from './logger';
import { LogCategory } from './types';

/**
 * 로거 사용 예제를 보여주는 함수
 * 실제 애플리케이션에서는 이 파일을 삭제하고
 * 필요한 곳에서 logger를 import하여 사용하세요.
 */
export const loggerExample = () => {
  // 기본 로그 레벨 사용 예제
  logger.debug('디버그 메시지 예제');
  logger.info('정보 메시지 예제', { user: 'test-user' });
  logger.warn('경고 메시지 예제', null, LogCategory.STATE);
  logger.error('오류 메시지 예제', new Error('테스트 에러'), { context: 'login' });
  
  // 성능 로깅 예제
  logger.performance('페이지 로딩', 230, { page: 'home' }, 'HomePage');
  
  // 흐름 로깅 예제
  logger.flow('AuthComponent', 'login-start', { method: 'email' });
  logger.flow('AuthComponent', 'login-complete', { success: true });
  
  // 사용자 상호작용 로깅 예제
  logger.interaction('LoginForm', 'button-click', { buttonId: 'submit' });
  
  // API 호출 로깅 예제
  logger.api('/api/users', 'GET', { params: { limit: 10 } }, 200, 45);
  
  // Firebase 호출 로깅 예제
  logger.firebase('read', '/users/123', { fields: ['name', 'email'] }, 50);
  
  // 커스텀 로그 미들웨어 예제 (실제로는 활성화하지 않음)
  /*
  import { registerLogMiddleware, LogMiddleware, LogEntry } from './logger';
  
  const sensitiveDataMiddleware: LogMiddleware = (entry, next) => {
    // PII 데이터 감지 및 마스킹 로직
    if (entry.data && entry.data.email) {
      entry.data.email = '***@***.com';
    }
    
    if (entry.data && entry.data.password) {
      entry.data.password = '********';
    }
    
    // 처리된 로그 엔트리를 다음 미들웨어로 전달
    next(entry);
  };
  
  registerLogMiddleware(sensitiveDataMiddleware);
  */
}; 