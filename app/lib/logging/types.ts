/**
 * 로그 레벨 정의
 * - DEBUG: 개발 디버깅용 상세 정보
 * - INFO: 일반적인 정보 메시지
 * - WARN: 오류는 아니지만 주의가 필요한 상황
 * - ERROR: 오류 및 예외 상황
 * - PERFORMANCE: 성능 측정 및 모니터링
 * - FLOW: 애플리케이션 흐름 추적
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  PERFORMANCE = 'performance',
  FLOW = 'flow',
}

/**
 * 로그 카테고리 정의
 * - UI: 사용자 인터페이스 관련 로그
 * - STATE: 상태 관리 관련 로그
 * - API: API 호출 및 응답 관련 로그
 * - FIREBASE: Firebase 상호작용 관련 로그
 * - NAVIGATION: 페이지 네비게이션 관련 로그
 * - RENDER: 컴포넌트 렌더링 관련 로그
 * - INTERACTION: 사용자 상호작용 관련 로그
 * - PERFORMANCE: 성능 측정 관련 로그
 */
export enum LogCategory {
  UI = 'ui',
  STATE = 'state',
  API = 'api',
  FIREBASE = 'firebase',
  NAVIGATION = 'navigation',
  RENDER = 'render',
  INTERACTION = 'interaction',
  PERFORMANCE = 'performance',
}

/**
 * 로그 엔트리 인터페이스
 * 로그 엔트리의 구조를 정의합니다.
 */
export interface LogEntry {
  /** 로그가 생성된 시간 (밀리초 단위 타임스탬프) */
  timestamp: number;
  
  /** 로그 레벨 */
  level: LogLevel;
  
  /** 로그 카테고리 */
  category: LogCategory;
  
  /** 로그 메시지 */
  message: string;
  
  /** 로그를 생성한 컴포넌트 (선택 사항) */
  component?: string;
  
  /** 수행된 액션 설명 (선택 사항) */
  action?: string;
  
  /** 추가 데이터 객체 (선택 사항) */
  data?: any;
  
  /** 작업 소요 시간 (밀리초 단위, 선택 사항) */
  duration?: number;
  
  /** 관련 로그 그룹 식별자 (선택 사항) */
  correlationId?: string;
}

/**
 * 로그 미들웨어 인터페이스
 * 로그가 최종 목적지(콘솔, 서버 등)로 전송되기 전에
 * 처리하는 미들웨어 함수의 시그니처를 정의합니다.
 */
export type LogMiddleware = (
  entry: LogEntry,
  next: (processedEntry: LogEntry) => void
) => void; 