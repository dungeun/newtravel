/**
 * 애플리케이션 로깅 유틸리티
 */

// 로그 레벨 정의
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// 로그 메시지 인터페이스
interface LogMessage {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  context?: string;
}

// 현재 환경 설정
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';
const isProduction = process.env.NODE_ENV === 'production';

// 로그 레벨 설정
const currentLogLevel = (() => {
  if (isTest) return LogLevel.ERROR; // 테스트 환경에서는 에러만 로깅
  if (isDevelopment) return LogLevel.DEBUG; // 개발 환경에서는 모든 로그 출력
  return LogLevel.INFO; // 기본적으로 INFO 레벨부터 로깅
})();

// 로그 레벨 우선순위
const logLevelPriority: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
};

// 로그 레벨에 따른 콘솔 메서드 매핑
const logMethods: Record<LogLevel, keyof typeof console> = {
  [LogLevel.DEBUG]: 'debug',
  [LogLevel.INFO]: 'info',
  [LogLevel.WARN]: 'warn',
  [LogLevel.ERROR]: 'error',
};

// 로그 포맷팅
const formatLog = (level: LogLevel, message: string, data?: any, context?: string): LogMessage => {
  return {
    level,
    message,
    data,
    timestamp: new Date().toISOString(),
    context,
  };
};

// 로그 출력
const writeLog = (logMessage: LogMessage): void => {
  // 현재 설정된 로그 레벨보다 낮은 레벨의 로그는 출력하지 않음
  if (logLevelPriority[logMessage.level] < logLevelPriority[currentLogLevel]) {
    return;
  }

  const { level, message, data, timestamp, context } = logMessage;
  const logMethod = logMethods[level];
  
  // 로그 메시지 구성
  const logParts = [
    `[${timestamp}]`,
    context ? `[${context}]` : '',
    `[${level.toUpperCase()}]`,
    message
  ];
  
  // 로그 출력
  if (data) {
    console[logMethod](logParts.join(' '), data);
  } else {
    console[logMethod](logParts.join(' '));
  }
  
  // 프로덕션 환경에서는 외부 로깅 서비스로 전송 (예: Sentry, LogRocket 등)
  if (isProduction && level === LogLevel.ERROR) {
    // TODO: 외부 로깅 서비스 연동
    // sendToExternalLoggingService(logMessage);
  }
};

// 로거 인스턴스
export const logger = {
  /**
   * 디버그 레벨 로그
   */
  debug: (message: string, data?: any, context?: string): void => {
    writeLog(formatLog(LogLevel.DEBUG, message, data, context));
  },
  
  /**
   * 정보 레벨 로그
   */
  info: (message: string, data?: any, context?: string): void => {
    writeLog(formatLog(LogLevel.INFO, message, data, context));
  },
  
  /**
   * 경고 레벨 로그
   */
  warn: (message: string, data?: any, context?: string): void => {
    writeLog(formatLog(LogLevel.WARN, message, data, context));
  },
  
  /**
   * 에러 레벨 로그
   */
  error: (message: string, data?: any, context?: string): void => {
    writeLog(formatLog(LogLevel.ERROR, message, data, context));
  },
  
  /**
   * 결제 관련 로그
   */
  payment: (message: string, data?: any): void => {
    writeLog(formatLog(LogLevel.INFO, message, data, 'PAYMENT'));
  },
  
  /**
   * 결제 오류 로그
   */
  paymentError: (message: string, data?: any): void => {
    writeLog(formatLog(LogLevel.ERROR, message, data, 'PAYMENT_ERROR'));
  },
};

// 전역 에러 핸들러 설정
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    logger.error('Uncaught error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', {
      reason: event.reason,
    });
  });
}

export default logger;
