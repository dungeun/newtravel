import { logger, clearLogMiddleware, registerLogMiddleware } from '../logger';
import { LogCategory, LogEntry, LogLevel, LogMiddleware } from '../types';

// 테스트를 위해 콘솔 메서드를 모킹
describe('Logger', () => {
  // 원래 console 메서드 저장
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  };
  
  // 모킹된 console 함수들
  const mockConsole = {
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };
  
  // 각 테스트 전에 콘솔 메서드 모킹 및 미들웨어 초기화
  beforeEach(() => {
    // 콘솔 메서드 모킹
    console.log = mockConsole.log;
    console.info = mockConsole.info;
    console.warn = mockConsole.warn;
    console.error = mockConsole.error;
    console.debug = mockConsole.debug;
    
    // 각 테스트 전에 mock 함수 초기화
    jest.clearAllMocks();
    
    // 미들웨어 초기화
    clearLogMiddleware();
  });
  
  // 테스트 후 원래 콘솔 메서드 복원
  afterAll(() => {
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.debug = originalConsole.debug;
  });
  
  // 기본 로그 레벨 테스트
  describe('Basic logging functions', () => {
    test('logger.debug should call console.debug with correct format', () => {
      const message = 'Debug message';
      const data = { test: 'data' };
      
      logger.debug(message, data);
      
      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      expect(mockConsole.debug).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] [ui]'),
        data
      );
    });
    
    test('logger.info should call console.info with correct format', () => {
      const message = 'Info message';
      const data = { user: 'test' };
      
      logger.info(message, data);
      
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] [ui]'),
        data
      );
    });
    
    test('logger.warn should call console.warn with correct format', () => {
      const message = 'Warning message';
      
      logger.warn(message);
      
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('[WARN] [ui]'),
        ''
      );
    });
    
    test('logger.error should call console.error with correct format', () => {
      const message = 'Error message';
      const error = new Error('Test error');
      
      logger.error(message, error);
      
      expect(mockConsole.error).toHaveBeenCalledTimes(1);
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] [ui]'),
        expect.objectContaining({
          error: expect.objectContaining({
            name: 'Error',
            message: 'Test error'
          })
        })
      );
    });
  });
  
  // 특수 로깅 기능 테스트
  describe('Specialized logging functions', () => {
    test('logger.performance should log performance data correctly', () => {
      const action = 'loadData';
      const duration = 150;
      const component = 'DataTable';
      
      logger.performance(action, duration, null, component);
      
      expect(mockConsole.log).toHaveBeenCalledTimes(1);
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('[PERFORMANCE] [performance]'),
        ''
      );
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining(`[${component}]`),
        ''
      );
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining(`[${action}]`),
        ''
      );
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining(`(${duration}ms)`),
        ''
      );
    });
    
    test('logger.flow should log application flow correctly', () => {
      const component = 'AuthFlow';
      const action = 'userLogin';
      const data = { method: 'email' };
      
      logger.flow(component, action, data);
      
      expect(mockConsole.log).toHaveBeenCalledTimes(1);
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('[FLOW] [navigation]'),
        data
      );
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining(`[${component}]`),
        data
      );
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining(`[${action}]`),
        data
      );
    });
    
    test('logger.interaction should log user interactions correctly', () => {
      const component = 'Button';
      const action = 'click';
      const data = { buttonId: 'submit' };
      
      logger.interaction(component, action, data);
      
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] [interaction]'),
        data
      );
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining(`[${component}]`),
        data
      );
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining(`[${action}]`),
        data
      );
    });
    
    test('logger.api should log API calls correctly', () => {
      const endpoint = '/api/users';
      const method = 'GET';
      const data = { params: { id: 123 } };
      const status = 200;
      const duration = 50;
      
      logger.api(endpoint, method, data, status, duration);
      
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] [api]'),
        data
      );
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining(`[${method} ${endpoint}]`),
        data
      );
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining(`(${status})`),
        data
      );
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining(`(${duration}ms)`),
        data
      );
    });
  });
  
  // 로그 미들웨어 테스트
  describe('Middleware functionality', () => {
    test('Middleware should be called with log entry and next function', () => {
      const mockMiddleware: LogMiddleware = jest.fn((entry, next) => {
        next(entry);
      });
      
      registerLogMiddleware(mockMiddleware);
      
      const message = 'Test middleware';
      logger.info(message);
      
      expect(mockMiddleware).toHaveBeenCalledTimes(1);
      expect(mockMiddleware).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.INFO,
          category: LogCategory.UI,
          message
        }),
        expect.any(Function)
      );
      
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
    });
    
    test('Middleware should be able to modify log entry', () => {
      const modifyingMiddleware: LogMiddleware = (entry, next) => {
        // 로그 엔트리 수정
        const modifiedEntry: LogEntry = {
          ...entry,
          message: `Modified: ${entry.message}`,
          category: LogCategory.API, // 카테고리 변경
          data: { ...entry.data, added: true }
        };
        
        next(modifiedEntry);
      };
      
      registerLogMiddleware(modifyingMiddleware);
      
      const originalMessage = 'Original message';
      logger.info(originalMessage, { original: true });
      
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining(`Modified: ${originalMessage}`),
        expect.objectContaining({
          original: true,
          added: true
        })
      );
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[API]'),
        expect.any(Object)
      );
    });
    
    test('Middleware should be able to filter logs', () => {
      const filteringMiddleware: LogMiddleware = (entry, next) => {
        // INFO 레벨 로그만 통과
        if (entry.level === LogLevel.INFO) {
          next(entry);
        }
        // 다른 레벨은 필터링 (next 호출 안 함)
      };
      
      registerLogMiddleware(filteringMiddleware);
      
      // INFO 로그는 통과해야 함
      logger.info('Info message');
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      
      // 다른 레벨은 필터링되어야 함
      logger.debug('Debug message');
      logger.warn('Warning message');
      logger.error('Error message');
      
      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.error).not.toHaveBeenCalled();
    });
    
    test('Multiple middleware should be executed in order', () => {
      const middleware1: LogMiddleware = jest.fn((entry, next) => {
        next({
          ...entry,
          message: `[M1] ${entry.message}`
        });
      });
      
      const middleware2: LogMiddleware = jest.fn((entry, next) => {
        next({
          ...entry,
          message: `[M2] ${entry.message}`
        });
      });
      
      // 순서대로 등록
      registerLogMiddleware(middleware1);
      registerLogMiddleware(middleware2);
      
      const message = 'Test message';
      logger.info(message);
      
      // 미들웨어가 순서대로 호출됨
      expect(middleware1).toHaveBeenCalledTimes(1);
      expect(middleware2).toHaveBeenCalledTimes(1);
      
      // 두 번째 미들웨어는 첫 번째 미들웨어가 수정한 로그를 받아야 함
      expect(middleware2).toHaveBeenCalledWith(
        expect.objectContaining({
          message: `[M1] ${message}`
        }),
        expect.any(Function)
      );
      
      // 최종 로그는 두 미들웨어를 모두 거친 결과여야 함
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining(`[M2] [M1] ${message}`),
        ''
      );
    });
  });
}); 