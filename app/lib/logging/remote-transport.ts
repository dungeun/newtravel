import { LogEntry, LogLevel } from './types';

/**
 * 원격 로그 전송 인터페이스
 * 모든 원격 로그 전송 구현체는 이 인터페이스를 따라야 함
 */
export interface RemoteLogTransport {
  /**
   * 로그 엔트리를 원격 서버로 전송
   * @param entry 전송할 로그 엔트리
   * @returns 전송 성공 여부 또는 Promise
   */
  send(entry: LogEntry): Promise<boolean>;
  
  /**
   * 배치 로그 엔트리를 원격 서버로 전송
   * @param entries 전송할 로그 엔트리 배열
   * @returns 전송 성공 여부 또는 Promise
   */
  sendBatch(entries: LogEntry[]): Promise<boolean>;
  
  /**
   * 전송 실패한 로그 재전송 시도
   * @returns 재전송 성공 여부 또는 Promise
   */
  retryFailed(): Promise<boolean>;
  
  /**
   * 전송 관련 설정 구성
   * @param config 설정 객체
   */
  configure(config: any): void;
}

/**
 * 보안 전송 설정 인터페이스
 */
export interface SecureTransportConfig {
  apiKey: string;
  encryptPayload?: boolean;
  allowedLogLevels?: LogLevel[];
  sensitiveFields?: string[];
  endpoint?: string;
}

/**
 * 배치 처리 설정 인터페이스
 */
export interface BatchProcessorConfig {
  batchSize?: number;
  batchTimeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * 원격 로깅 서비스 종류
 */
export enum RemoteLogService {
  SENTRY = 'sentry',
  LOGROCKET = 'logrocket',
  DATADOG = 'datadog',
  CUSTOM = 'custom',
}

/**
 * 원격 로깅 팩토리 인터페이스
 * 로깅 서비스 타입에 따른 로그 전송 구현체 생성
 */
export interface RemoteLogFactory {
  /**
   * 로깅 서비스 타입에 따른 로그 전송 구현체 생성
   * @param type 원격 로깅 서비스 유형
   * @param config 보안 설정
   * @param batchConfig 배치 처리 설정
   * @returns 로그 전송 구현체
   */
  createTransport(
    type: RemoteLogService,
    config: SecureTransportConfig,
    batchConfig?: BatchProcessorConfig
  ): RemoteLogTransport;
}

/**
 * 원격 로깅 미들웨어 생성 함수
 * 로그 미들웨어 시스템과 원격 로그 전송을 통합
 * 
 * @example
 * ```typescript
 * import { logger, registerLogMiddleware } from '@/lib/logging';
 * import { createRemoteLoggingMiddleware, RemoteLogService } from '@/lib/logging/remote-transport';
 * 
 * // Sentry 로깅 미들웨어 등록
 * const sentryMiddleware = createRemoteLoggingMiddleware(
 *   RemoteLogService.SENTRY,
 *   {
 *     apiKey: 'your-sentry-api-key',
 *     allowedLogLevels: [LogLevel.ERROR, LogLevel.WARN],
 *   },
 *   {
 *     batchSize: 5,
 *     batchTimeout: 2000,
 *   }
 * );
 * 
 * registerLogMiddleware(sentryMiddleware);
 * ```
 */
export const createRemoteLoggingMiddleware = (
  type: RemoteLogService,
  config: SecureTransportConfig,
  batchConfig?: BatchProcessorConfig
) => {
  // 실제 구현에서는 로그 전송 팩토리를 통해 로그 전송 구현체 생성
  // 현재는 인터페이스 정의 단계이므로 미들웨어 함수만 반환
  
  return (entry: LogEntry, next: (processedEntry: LogEntry) => void) => {
    // 원격 서버로 로그 전송 (비동기)
    // 여기서는 실제 구현하지 않고 다음 미들웨어로 전달만 함
    
    // 로그 원격 전송을 시작함을 표시
    console.log(`[Remote Logging] Would send log to ${type} service: ${entry.level} - ${entry.message}`);
    
    // 다음 미들웨어로 로그 전달 (전송 여부와 상관없이 로컬 처리 계속)
    next(entry);
  };
}; 