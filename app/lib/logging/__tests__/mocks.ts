import { LogCategory, LogEntry, LogLevel, LogMiddleware } from '../types';

/**
 * 테스트용 로그 엔트리
 */
export const mockLogEntry: LogEntry = {
  timestamp: 1617183600000,
  level: LogLevel.INFO,
  category: LogCategory.UI,
  message: 'Test log message',
  component: 'TestComponent',
  action: 'testAction',
  data: { testKey: 'testValue' },
};

/**
 * 각 로그 레벨별 테스트 메시지
 */
export const mockLogMessages = {
  [LogLevel.DEBUG]: 'Debug message for testing',
  [LogLevel.INFO]: 'Info message for testing',
  [LogLevel.WARN]: 'Warning message for testing',
  [LogLevel.ERROR]: 'Error message for testing',
  [LogLevel.PERFORMANCE]: 'Performance message for testing',
  [LogLevel.FLOW]: 'Flow message for testing',
};

/**
 * 테스트용 로그 카테고리별 메시지
 */
export const mockCategoryMessages = {
  [LogCategory.UI]: 'UI log message',
  [LogCategory.STATE]: 'State log message',
  [LogCategory.API]: 'API log message',
  [LogCategory.FIREBASE]: 'Firebase log message',
  [LogCategory.NAVIGATION]: 'Navigation log message',
  [LogCategory.RENDER]: 'Render log message',
  [LogCategory.INTERACTION]: 'Interaction log message',
  [LogCategory.PERFORMANCE]: 'Performance log message',
};

/**
 * 테스트용 에러 객체
 */
export const mockError = new Error('Test error message');

/**
 * 통과형 미들웨어
 * 로그 엔트리를 변경하지 않고 그대로 다음 미들웨어로 전달
 */
export const mockPassthroughMiddleware: LogMiddleware = (entry, next) => {
  next(entry);
};

/**
 * 수정형 미들웨어
 * 로그 엔트리의 메시지와 카테고리를
 */
export const mockTransformingMiddleware: LogMiddleware = (entry, next) => {
  next({
    ...entry,
    message: `transformed: ${entry.message}`,
    data: {
      ...entry.data,
      middlewareAdded: true,
    },
  });
};

/**
 * 필터링 미들웨어
 * 특정 조건에 맞는 로그만 통과시키고 나머지는 필터링
 */
export const mockFilteringMiddleware = (allowedLevels: LogLevel[]): LogMiddleware => {
  return (entry, next) => {
    if (allowedLevels.includes(entry.level)) {
      next(entry);
    }
    // allowedLevels에 없는 레벨은 필터링 (next 호출 안 함)
  };
};

/**
 * 모킹된 콘솔 객체
 */
export const createMockConsole = () => ({
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
});

/**
 * 원래 콘솔 메서드를 저장하고 모킹 설정을 위한 함수
 */
export const setupConsoleMock = () => {
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  };
  
  const mockConsole = createMockConsole();
  
  // 콘솔 메서드 모킹
  console.log = mockConsole.log;
  console.info = mockConsole.info;
  console.warn = mockConsole.warn;
  console.error = mockConsole.error;
  console.debug = mockConsole.debug;
  
  // 원래 콘솔과 모킹된 콘솔 반환
  return { originalConsole, mockConsole };
};

/**
 * 콘솔 모킹 해제 함수
 */
export const restoreConsoleMock = (originalConsole: typeof console) => {
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.debug = originalConsole.debug;
}; 