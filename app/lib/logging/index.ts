/**
 * 로깅 시스템
 * 
 * 이 모듈은 애플리케이션 전체에서 사용할 로깅 시스템을 제공합니다.
 * 다양한 로그 레벨, 카테고리 및 구조화된 로그 엔트리를 지원합니다.
 * 
 * @example
 * ```typescript
 * import { logger, LogCategory } from '@/lib/logging';
 * 
 * // 기본 로깅
 * logger.info('사용자 로그인 성공', { userId: '123' });
 * 
 * // 에러 로깅
 * try {
 *   // 어떤 작업
 * } catch (error) {
 *   logger.error('작업 중 오류 발생', error, { context: 'UserService' });
 * }
 * 
 * // 성능 로깅
 * const startTime = performance.now();
 * // 어떤 작업
 * const endTime = performance.now();
 * logger.performance('데이터 로드', endTime - startTime, { count: items.length });
 * ```
 */

export { logger, registerLogMiddleware, clearLogMiddleware } from './logger';
export { LogLevel, LogCategory, type LogEntry, type LogMiddleware } from './types';
export { loggerExample } from './example'; 