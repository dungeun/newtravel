# 로그 처리 미들웨어 아키텍처 설계

## 1. 개요

로그 미들웨어 시스템은 로그 엔트리가 최종 출력(콘솔, 서버, 스토리지 등)되기 전에 
일련의 처리 단계를 거칠 수 있도록 하는 아키텍처를 제공합니다. 이 설계를 통해 로깅 시스템의 핵심 코드를 변경하지 않고도
다양한 로그 처리 기능을 추가할 수 있습니다.

## 2. 미들웨어 함수 시그니처

```typescript
type LogMiddleware = (
  entry: LogEntry,
  next: (processedEntry: LogEntry) => void
) => void;
```

각 미들웨어 함수는:
- 현재 로그 엔트리(`entry`)를 매개변수로 받습니다.
- 처리를 완료한 후 수정된 로그 엔트리를 다음 미들웨어로 전달하는 `next` 함수를 호출합니다.
- 로그를 필터링하기 위해 `next`를 호출하지 않을 수도 있습니다.

## 3. 미들웨어 등록 및 관리

```typescript
// 미들웨어 배열 관리
let logMiddleware: LogMiddleware[] = [];

// 미들웨어 등록 함수
export const registerLogMiddleware = (middleware: LogMiddleware): void => {
  logMiddleware.push(middleware);
};

// 미들웨어 순서 지정 함수
export const insertLogMiddleware = (middleware: LogMiddleware, index: number): void => {
  logMiddleware.splice(index, 0, middleware);
};

// 미들웨어 제거 함수
export const removeLogMiddleware = (middleware: LogMiddleware): boolean => {
  const index = logMiddleware.indexOf(middleware);
  if (index !== -1) {
    logMiddleware.splice(index, 1);
    return true;
  }
  return false;
};

// 미들웨어 초기화 함수
export const clearLogMiddleware = (): void => {
  logMiddleware = [];
};
```

## 4. 미들웨어 실행 흐름

```typescript
const processLogEntry = (entry: LogEntry): void => {
  // 미들웨어가 없으면 바로 콘솔에 출력
  if (logMiddleware.length === 0) {
    outputLogToConsole(entry);
    return;
  }

  // 미들웨어 체인 구성 및 실행
  let middlewareIndex = 0;

  const runMiddleware = (currentEntry: LogEntry): void => {
    if (middlewareIndex < logMiddleware.length) {
      const currentMiddleware = logMiddleware[middlewareIndex];
      middlewareIndex++;
      
      // 현재 미들웨어 실행 후 다음 미들웨어로 넘김
      currentMiddleware(currentEntry, runMiddleware);
    } else {
      // 모든 미들웨어 처리 완료 후 출력
      outputLogToConsole(currentEntry);
    }
  };

  runMiddleware(entry);
};
```

이 패턴은 재귀적으로 미들웨어 체인을 실행하며, 각 미들웨어는 로그 엔트리를 처리한 후 다음 미들웨어에 전달할지 
여부를 결정합니다.

## 5. 미들웨어 예시

### 5.1 민감 정보 마스킹 미들웨어

```typescript
const sensitiveDataMiddleware: LogMiddleware = (entry, next) => {
  if (entry.data) {
    // 깊은 복사로 원본 데이터 변경 방지
    const processedData = JSON.parse(JSON.stringify(entry.data));
    
    // 민감 정보 필드 검사 및 마스킹
    const maskFields = (obj: any) => {
      const sensitiveFields = ['password', 'token', 'secret', 'credit_card', 'ssn'];
      
      Object.keys(obj).forEach(key => {
        if (sensitiveFields.includes(key.toLowerCase())) {
          obj[key] = '********';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          maskFields(obj[key]);
        }
      });
    };
    
    maskFields(processedData);
    
    // 이메일 마스킹
    const maskEmails = (obj: any) => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string' && emailRegex.test(obj[key])) {
          const parts = obj[key].split('@');
          obj[key] = `${parts[0].substring(0, 2)}***@${parts[1]}`;
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          maskEmails(obj[key]);
        }
      });
    };
    
    maskEmails(processedData);
    
    // 처리된 데이터로 교체
    entry = { ...entry, data: processedData };
  }
  
  next(entry);
};
```

### 5.2 로그 필터링 미들웨어

```typescript
// 개발 환경에서는 모든 로그 레벨, 프로덕션에서는 중요 로그만 출력
const environmentFilterMiddleware: LogMiddleware = (entry, next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment || 
      entry.level === LogLevel.ERROR || 
      entry.level === LogLevel.WARN || 
      (entry.level === LogLevel.PERFORMANCE && entry.duration && entry.duration > 500)) {
    next(entry);
  }
  // 필터링 조건에 맞지 않으면 next() 호출하지 않음
};
```

### 5.3 로그 강화 미들웨어

```typescript
// 글로벌 컨텍스트 정보 추가 (사용자 ID, 세션 ID 등)
const contextEnrichmentMiddleware: LogMiddleware = (entry, next) => {
  const getUserInfo = () => {
    // 실제 구현에서는 전역 상태나 세션에서 필요한 정보 가져옴
    return {
      userId: 'current-user-id',
      sessionId: 'current-session-id',
      userRole: 'user-role',
    };
  };
  
  const globalContext = getUserInfo();
  
  // 기존 데이터에 컨텍스트 정보 추가
  const enrichedEntry = {
    ...entry,
    data: {
      ...entry.data,
      _context: globalContext,
    },
  };
  
  next(enrichedEntry);
};
```

### 5.4 성능 이슈 감지 미들웨어

```typescript
// 성능 로그 분석 및 경고
const performanceAlertMiddleware: LogMiddleware = (entry, next) => {
  if (entry.level === LogLevel.PERFORMANCE && entry.duration) {
    // 임계값 설정
    const thresholds = {
      API: 1000,     // API 호출은 1초 이상이면 경고
      RENDER: 100,   // 컴포넌트 렌더링은 100ms 이상이면 경고
      DEFAULT: 500,  // 기타 작업은 500ms 이상이면 경고
    };
    
    const threshold = thresholds[entry.category] || thresholds.DEFAULT;
    
    if (entry.duration > threshold) {
      // 심각한 성능 문제인 경우 별도 처리
      console.warn(`⚠️ Performance warning: ${entry.action || 'Operation'} took ${entry.duration}ms`);
      
      // 분석 시스템에 별도 알림을 보낼 수 있음
      // sendPerformanceAlert(entry);
    }
  }
  
  next(entry);
};
```

### 5.5 로그 그룹화 미들웨어

```typescript
// 관련 로그 그룹화 (예: 동일한 요청에 속한 로그들)
const logGroupingMiddleware: LogMiddleware = (entry, next) => {
  // correlationId가 없으면 생성
  if (!entry.correlationId) {
    // 현재 활성화된 correlationId가 있는지 확인
    const activeCorrelationId = getActiveCorrelationId();
    
    if (activeCorrelationId) {
      entry = { ...entry, correlationId: activeCorrelationId };
    }
  }
  
  next(entry);
};

// 액티브 correlationId 관리 (요청별, 흐름별)
let activeCorrelationId: string | null = null;

export const startLogGroup = (groupName?: string): string => {
  const newCorrelationId = groupName ? `${groupName}-${Date.now()}` : `log-group-${Date.now()}`;
  activeCorrelationId = newCorrelationId;
  return newCorrelationId;
};

export const endLogGroup = (): void => {
  activeCorrelationId = null;
};

export const getActiveCorrelationId = (): string | null => {
  return activeCorrelationId;
};
```

## 6. 미들웨어 적용 순서 가이드라인

미들웨어의 등록 순서는 로그 처리 흐름에 중요한 영향을 미칩니다. 일반적으로 권장되는 순서는:

1. **컨텍스트 강화 미들웨어**: 로그에 글로벌 컨텍스트 정보 추가
2. **로그 그룹화 미들웨어**: correlationId 관리 및 로그 그룹화
3. **민감 정보 마스킹 미들웨어**: 데이터 보안 및 개인정보 보호
4. **성능 이슈 감지 미들웨어**: 성능 문제 검사 및 경고
5. **로그 필터링 미들웨어**: 환경 또는 조건에 따라 로그 필터링

## 7. 확장 계획

미래의 확장을 위한 고려사항:

1. **원격 로그 저장소 미들웨어**: 원격 서버로 로그 전송
2. **배치 처리 미들웨어**: 로그를 일정량 모았다가 한 번에 처리하여 성능 최적화
3. **로그 변환 미들웨어**: 다양한 포맷(JSON, CSV 등)으로 로그 변환
4. **로그 압축 및 최적화 미들웨어**: 대량의 로그 데이터 효율적으로 처리

## 8. 미들웨어 사용 예시

```typescript
// 필요한 미들웨어 등록
import { registerLogMiddleware } from '@/lib/logging';

// 개발 환경에서만 실행되는 설정 코드
if (process.env.NODE_ENV === 'development') {
  registerLogMiddleware(contextEnrichmentMiddleware);
  registerLogMiddleware(logGroupingMiddleware);
}

// 모든 환경에서 실행
registerLogMiddleware(sensitiveDataMiddleware);

// 프로덕션 환경에서만 실행
if (process.env.NODE_ENV === 'production') {
  registerLogMiddleware(performanceAlertMiddleware);
  registerLogMiddleware(environmentFilterMiddleware);
  // 추후 원격 로그 저장소 미들웨어 추가
}
```

## 결론

이 미들웨어 아키텍처는 로깅 시스템을 확장 가능하고 유연하게 만들어 줍니다. 새로운 요구사항이 생길 때 로깅 코어를 
수정하지 않고 적절한 미들웨어를 추가함으로써 기능을 확장할 수 있습니다. 이는 코드 유지보수성을 높이고, 로그 처리 기능을 
모듈화하여 관리할 수 있게 합니다. 