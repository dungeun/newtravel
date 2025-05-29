import { LogCategory, LogEntry, LogLevel, LogMiddleware } from './types';

/**
 * 로그 처리에 필요한 미들웨어 함수 목록
 */
let logMiddleware: LogMiddleware[] = [];

/**
 * 로그 미들웨어를 등록합니다.
 * @param middleware 로그 처리를 위한 미들웨어 함수
 */
export const registerLogMiddleware = (middleware: LogMiddleware): void => {
  logMiddleware.push(middleware);
};

/**
 * 특정 위치에 로그 미들웨어를 삽입합니다.
 * @param middleware 로그 처리를 위한 미들웨어 함수
 * @param index 삽입할 위치 인덱스
 */
export const insertLogMiddleware = (middleware: LogMiddleware, index: number): void => {
  logMiddleware.splice(index, 0, middleware);
};

/**
 * 로그 미들웨어를 제거합니다.
 * @param middleware 제거할 미들웨어 함수
 * @returns 미들웨어 제거 성공 여부
 */
export const removeLogMiddleware = (middleware: LogMiddleware): boolean => {
  const index = logMiddleware.indexOf(middleware);
  if (index !== -1) {
    logMiddleware.splice(index, 1);
    return true;
  }
  return false;
};

/**
 * 로그 미들웨어를 초기화합니다.
 */
export const clearLogMiddleware = (): void => {
  logMiddleware = [];
};

/**
 * 활성화된 로그 그룹 ID
 */
let activeCorrelationId: string | null = null;

/**
 * 새로운 로그 그룹을 시작합니다.
 * @param groupName 그룹 이름 (선택 사항)
 * @returns 생성된 상관관계 ID
 */
export const startLogGroup = (groupName?: string): string => {
  const newCorrelationId = groupName ? `${groupName}-${Date.now()}` : `log-group-${Date.now()}`;
  activeCorrelationId = newCorrelationId;
  return newCorrelationId;
};

/**
 * 현재 로그 그룹을 종료합니다.
 */
export const endLogGroup = (): void => {
  activeCorrelationId = null;
};

/**
 * 현재 활성화된 로그 그룹 ID를 반환합니다.
 * @returns 활성화된 상관관계 ID 또는 null
 */
export const getActiveCorrelationId = (): string | null => {
  return activeCorrelationId;
};

/**
 * 로그 엔트리를 미들웨어 체인을 통해 처리하고 출력합니다.
 * @param entry 처리할 로그 엔트리
 */
const processLogEntry = (entry: LogEntry): void => {
  // 활성화된 correlationId가 있고 로그에 correlationId가 없는 경우 자동 추가
  if (activeCorrelationId && !entry.correlationId) {
    entry = { ...entry, correlationId: activeCorrelationId };
  }

  // 로그 미들웨어가 없으면 바로 콘솔에 출력
  if (logMiddleware.length === 0) {
    outputLogToConsole(entry);
    return;
  }

  // 미들웨어 체인을 생성하고 실행
  let middlewareIndex = 0;

  const runMiddleware = (currentEntry: LogEntry): void => {
    if (middlewareIndex < logMiddleware.length) {
      const currentMiddleware = logMiddleware[middlewareIndex];
      middlewareIndex++;
      
      // 현재 미들웨어 실행 후 다음 미들웨어로 넘김
      currentMiddleware(currentEntry, runMiddleware);
    } else {
      // 모든 미들웨어 처리 완료 후 콘솔에 출력
      outputLogToConsole(currentEntry);
    }
  };

  runMiddleware(entry);
};

/**
 * 로그 엔트리를 콘솔에 출력합니다.
 * @param entry 출력할 로그 엔트리
 */
const outputLogToConsole = (entry: LogEntry): void => {
  const { level, category, message, component, action, data, duration, correlationId } = entry;
  
  // 기본 로그 형식 생성
  const timestamp = new Date(entry.timestamp).toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}] [${category}]`;
  
  // 컴포넌트 정보 추가
  const componentStr = component ? ` [${component}]` : '';
  
  // 액션 정보 추가
  const actionStr = action ? ` [${action}]` : '';
  
  // 소요 시간 정보 추가
  const durationStr = duration !== undefined ? ` (${duration}ms)` : '';
  
  // 상관관계 ID 추가
  const correlationStr = correlationId ? ` [correlationId: ${correlationId}]` : '';
  
  // 최종 로그 메시지 구성
  const logMessage = `${prefix}${componentStr}${actionStr}${durationStr}${correlationStr}: ${message}`;
  
  // 로그 레벨에 따라 적절한 콘솔 메서드 호출
  switch (level) {
    case LogLevel.DEBUG:
      console.debug(logMessage, data !== undefined ? data : '');
      break;
    case LogLevel.INFO:
      console.info(logMessage, data !== undefined ? data : '');
      break;
    case LogLevel.WARN:
      console.warn(logMessage, data !== undefined ? data : '');
      break;
    case LogLevel.ERROR:
      console.error(logMessage, data !== undefined ? data : '');
      break;
    case LogLevel.PERFORMANCE:
    case LogLevel.FLOW:
    default:
      console.log(logMessage, data !== undefined ? data : '');
      break;
  }
};

/**
 * 로그 엔트리 작성을 위한 기본 구조를 생성합니다.
 * @param level 로그 레벨
 * @param message 로그 메시지
 * @param category 로그 카테고리
 * @returns 기본 로그 엔트리
 */
const createBaseEntry = (
  level: LogLevel,
  message: string,
  category: LogCategory
): LogEntry => {
  return {
    timestamp: Date.now(),
    level,
    category,
    message,
  };
};

/**
 * 로거 객체
 * 다양한 로그 레벨과 목적에 맞는 로깅 메서드를 제공합니다.
 */
export const logger = {
  /**
   * 디버그 레벨 로그를 기록합니다.
   * @param message 로그 메시지
   * @param data 추가 데이터 (선택 사항)
   * @param category 로그 카테고리 (기본값: UI)
   * @param component 컴포넌트 이름 (선택 사항)
   */
  debug: (
    message: string,
    data?: any,
    category: LogCategory = LogCategory.UI,
    component?: string
  ): void => {
    const entry: LogEntry = {
      ...createBaseEntry(LogLevel.DEBUG, message, category),
      data,
      component,
    };
    processLogEntry(entry);
  },

  /**
   * 정보 레벨 로그를 기록합니다.
   * @param message 로그 메시지
   * @param data 추가 데이터 (선택 사항)
   * @param category 로그 카테고리 (기본값: UI)
   * @param component 컴포넌트 이름 (선택 사항)
   */
  info: (
    message: string,
    data?: any,
    category: LogCategory = LogCategory.UI,
    component?: string
  ): void => {
    const entry: LogEntry = {
      ...createBaseEntry(LogLevel.INFO, message, category),
      data,
      component,
    };
    processLogEntry(entry);
  },

  /**
   * 경고 레벨 로그를 기록합니다.
   * @param message 로그 메시지
   * @param data 추가 데이터 (선택 사항)
   * @param category 로그 카테고리 (기본값: UI)
   * @param component 컴포넌트 이름 (선택 사항)
   */
  warn: (
    message: string,
    data?: any,
    category: LogCategory = LogCategory.UI,
    component?: string
  ): void => {
    const entry: LogEntry = {
      ...createBaseEntry(LogLevel.WARN, message, category),
      data,
      component,
    };
    processLogEntry(entry);
  },

  /**
   * 에러 레벨 로그를 기록합니다.
   * @param message 에러 메시지
   * @param error Error 객체 (선택 사항)
   * @param data 추가 데이터 (선택 사항)
   * @param category 로그 카테고리 (기본값: UI)
   * @param component 컴포넌트 이름 (선택 사항)
   */
  error: (
    message: string,
    error?: Error,
    data?: any,
    category: LogCategory = LogCategory.UI,
    component?: string
  ): void => {
    const entry: LogEntry = {
      ...createBaseEntry(LogLevel.ERROR, message, category),
      data: {
        ...(data || {}),
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : undefined,
      },
      component,
    };
    processLogEntry(entry);
  },

  /**
   * 성능 측정 로그를 기록합니다.
   * @param action 측정한 작업 이름
   * @param duration 수행 시간 (밀리초)
   * @param data 추가 데이터 (선택 사항)
   * @param component 컴포넌트 이름 (선택 사항)
   */
  performance: (
    action: string,
    duration: number,
    data?: any,
    component?: string
  ): void => {
    const entry: LogEntry = {
      ...createBaseEntry(LogLevel.PERFORMANCE, `Performance: ${action}`, LogCategory.PERFORMANCE),
      action,
      duration,
      data,
      component,
    };
    processLogEntry(entry);
  },

  /**
   * 애플리케이션 흐름 로그를 기록합니다.
   * @param component 흐름이 발생한 컴포넌트 이름
   * @param action 수행된 액션
   * @param data 추가 데이터 (선택 사항)
   */
  flow: (
    component: string,
    action: string,
    data?: any
  ): void => {
    const entry: LogEntry = {
      ...createBaseEntry(LogLevel.FLOW, `Flow: ${action}`, LogCategory.NAVIGATION),
      component,
      action,
      data,
    };
    processLogEntry(entry);
  },

  /**
   * 사용자 상호작용 로그를 기록합니다.
   * @param component 상호작용이 발생한 컴포넌트
   * @param action 사용자 액션
   * @param data 추가 데이터 (선택 사항)
   */
  interaction: (
    component: string,
    action: string,
    data?: any
  ): void => {
    const entry: LogEntry = {
      ...createBaseEntry(LogLevel.INFO, `User interaction: ${action}`, LogCategory.INTERACTION),
      component,
      action,
      data,
    };
    processLogEntry(entry);
  },

  /**
   * API 호출 로그를 기록합니다.
   * @param endpoint API 엔드포인트
   * @param method HTTP 메서드
   * @param data 요청/응답 데이터 (선택 사항)
   * @param status 응답 상태 코드 (선택 사항)
   * @param duration 요청 소요 시간 (선택 사항)
   */
  api: (
    endpoint: string,
    method: string,
    data?: any,
    status?: number,
    duration?: number
  ): void => {
    const statusStr = status ? `(${status})` : '';
    const entry: LogEntry = {
      ...createBaseEntry(LogLevel.INFO, `API ${method} ${endpoint} ${statusStr}`, LogCategory.API),
      action: `${method} ${endpoint}`,
      data,
      duration,
    };
    processLogEntry(entry);
  },

  /**
   * Firebase 작업 로그를 기록합니다.
   * @param operation Firebase 작업 유형 (예: 'read', 'write', 'auth')
   * @param path 데이터 경로
   * @param data 작업 데이터 (선택 사항)
   * @param duration 작업 소요 시간 (선택 사항)
   */
  firebase: (
    operation: string,
    path: string,
    data?: any,
    duration?: number
  ): void => {
    const entry: LogEntry = {
      ...createBaseEntry(LogLevel.INFO, `Firebase ${operation}: ${path}`, LogCategory.FIREBASE),
      action: operation,
      data: {
        path,
        ...(data ? { data } : {}),
      },
      duration,
    };
    processLogEntry(entry);
  },
}; 