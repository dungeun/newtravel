# 원격 로그 저장소 통합 전략

## 1. 개요

이 문서는 클라이언트 측 로깅 시스템에서 수집된 로그를 원격 서버에 전송하고 저장하기 위한 전략과 구현 방향을 설명합니다. 로깅 시스템의 확장성과 유지 관리성을 고려한 설계 방향과 추천 서비스를 제시합니다.

## 2. 원격 로깅 서비스 평가 기준

원격 로깅 서비스를 선택할 때 다음과 같은 기준을 고려해야 합니다:

| 기준 | 설명 | 중요도 |
|------|------|--------|
| **비용** | 로그 저장 용량, API 호출 횟수, 보존 기간에 따른 비용 구조 | 높음 |
| **확장성** | 트래픽 증가 및 로그 볼륨 증가에 대응할 수 있는 능력 | 높음 |
| **검색 기능** | 로그 데이터에 대한 검색, 필터링, 쿼리 기능 | 높음 |
| **통합 용이성** | Web/JS 환경과의 통합 편의성 및 API/SDK 지원 | 높음 |
| **알림 시스템** | 특정 로그 패턴이나 오류 발생 시 알림 기능 | 중간 |
| **보존 정책** | 로그 데이터의 자동 보존 및 만료 정책 | 중간 |
| **대시보드** | 로그 분석 및 시각화를 위한 대시보드 지원 | 중간 |
| **보안** | 데이터 암호화, 접근 제어, 규정 준수 | 높음 |
| **실시간 처리** | 실시간 로그 스트리밍 및 처리 지원 | 낮음 |

## 3. 추천 원격 로깅 서비스 비교

다음은 현재 시장에서 널리 사용되는 로깅 서비스 중 3가지 주요 옵션의 비교입니다:

### 3.1 Sentry

**장점:**
- 클라이언트 오류 추적에 특화
- React 및 Next.js에 대한 우수한 통합
- 스택 트레이스, 사용자 컨텍스트, 환경 정보 자동 수집
- 무료 티어 제공
- 성능 모니터링 기능 내장

**단점:**
- 일반 로그보다 오류 중심 설계
- 대용량 로그 처리 시 비용 증가

**비용 구조:** 사용자 기반 가격 책정, 이벤트 볼륨 제한

### 3.2 Datadog RUM (Real User Monitoring)

**장점:**
- 종합적인 애플리케이션 성능 모니터링
- 다양한 데이터 유형 수집 및 상관 관계 분석
- 강력한 대시보드 및 분석 도구
- 대규모 엔터프라이즈 환경에 적합

**단점:**
- 소규모 프로젝트에는 복잡할 수 있음
- 비교적 높은 비용

**비용 구조:** 호스트 및 이벤트 볼륨 기반 가격 책정

### 3.3 LogRocket

**장점:**
- 세션 재생 기능 (사용자 경험 시각화)
- React 앱에 특화된 디버깅 도구
- 성능 메트릭 및 오류 추적 통합
- 개인정보 보호 기능 내장

**단점:**
- 세션 재생 기능으로 인한 데이터 사용량 증가 가능
- 자유로운 로그 형식 지원에 제한

**비용 구조:** 세션 볼륨 기반 가격 책정

## 4. 추천 통합 방식: 추상화 계층 설계

로깅 서비스가 변경되어도 애플리케이션 코드를 최소한으로 수정할 수 있도록 다음과 같은 추상화 계층을 설계할 것을 권장합니다:

```typescript
/**
 * 원격 로그 전송 인터페이스
 * 모든 원격 로그 전송 구현체는 이 인터페이스를 따라야 함
 */
interface RemoteLogTransport {
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
```

## 5. 원격 로깅 구현 전략

### 5.1 배치 처리 설계

로그를 개별적으로 전송하는 대신 배치로 처리하여 네트워크 요청 수를 줄이고 성능을 향상시킵니다:

```typescript
class LogBatchProcessor {
  private batchSize: number = 10;
  private batchTimeout: number = 5000; // 5초
  private logQueue: LogEntry[] = [];
  private timer: NodeJS.Timeout | null = null;
  private transport: RemoteLogTransport;
  
  constructor(transport: RemoteLogTransport, config?: { batchSize?: number, batchTimeout?: number }) {
    this.transport = transport;
    if (config?.batchSize) this.batchSize = config.batchSize;
    if (config?.batchTimeout) this.batchTimeout = config.batchTimeout;
  }
  
  public addLog(entry: LogEntry): void {
    this.logQueue.push(entry);
    
    // 배치 크기에 도달하면 즉시 전송
    if (this.logQueue.length >= this.batchSize) {
      this.flush();
      return;
    }
    
    // 첫 로그가 추가되면 타이머 시작
    if (this.logQueue.length === 1 && !this.timer) {
      this.timer = setTimeout(() => this.flush(), this.batchTimeout);
    }
  }
  
  public flush(): void {
    if (this.logQueue.length === 0) return;
    
    const logsToSend = [...this.logQueue];
    this.logQueue = [];
    
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    this.transport.sendBatch(logsToSend).catch(() => {
      // 실패 시 재시도 큐에 추가
      this.handleSendFailure(logsToSend);
    });
  }
  
  private handleSendFailure(entries: LogEntry[]): void {
    // 실패한 로그 처리 로직 구현
    // 예: 로컬 스토리지에 저장 후 나중에 재시도
  }
}
```

### 5.2 재시도 메커니즘

네트워크 문제 등으로 로그 전송에 실패할 경우를 대비한 재시도 메커니즘:

```typescript
class RetryMechanism {
  private maxRetries: number = 3;
  private retryDelay: number = 5000; // 5초
  private failedBatches: Array<{ entries: LogEntry[], attempts: number, nextRetry: number }> = [];
  private transport: RemoteLogTransport;
  private isRetrying: boolean = false;
  
  constructor(transport: RemoteLogTransport, config?: { maxRetries?: number, retryDelay?: number }) {
    this.transport = transport;
    if (config?.maxRetries) this.maxRetries = config.maxRetries;
    if (config?.retryDelay) this.retryDelay = config.retryDelay;
    
    // 주기적으로 실패한 로그 전송 재시도
    setInterval(() => this.processRetryQueue(), this.retryDelay);
  }
  
  public addFailedBatch(entries: LogEntry[]): void {
    this.failedBatches.push({
      entries,
      attempts: 0,
      nextRetry: Date.now() + this.retryDelay
    });
  }
  
  private async processRetryQueue(): Promise<void> {
    if (this.isRetrying || this.failedBatches.length === 0) return;
    
    this.isRetrying = true;
    const now = Date.now();
    
    // 재시도 시간이 된 배치 처리
    const batchesToRetry = this.failedBatches.filter(batch => batch.nextRetry <= now);
    this.failedBatches = this.failedBatches.filter(batch => batch.nextRetry > now);
    
    for (const batch of batchesToRetry) {
      batch.attempts++;
      
      try {
        const success = await this.transport.sendBatch(batch.entries);
        if (!success && batch.attempts < this.maxRetries) {
          // 지수 백오프로 다음 재시도 시간 계산
          const nextDelay = this.retryDelay * Math.pow(2, batch.attempts - 1);
          batch.nextRetry = Date.now() + nextDelay;
          this.failedBatches.push(batch);
        } else if (!success) {
          // 최대 재시도 횟수 초과 - 로컬 스토리지에 보관 또는 폐기
          this.handleMaxRetriesExceeded(batch.entries);
        }
      } catch (error) {
        if (batch.attempts < this.maxRetries) {
          const nextDelay = this.retryDelay * Math.pow(2, batch.attempts - 1);
          batch.nextRetry = Date.now() + nextDelay;
          this.failedBatches.push(batch);
        } else {
          this.handleMaxRetriesExceeded(batch.entries);
        }
      }
    }
    
    this.isRetrying = false;
  }
  
  private handleMaxRetriesExceeded(entries: LogEntry[]): void {
    // 최대 재시도 횟수 초과 처리
    // 예: 브라우저 재시작 시 전송할 수 있도록 localStorage에 저장
    try {
      const storedLogs = JSON.parse(localStorage.getItem('failed_logs') || '[]');
      const updatedLogs = [...storedLogs, ...entries].slice(-100); // 최대 100개 저장
      localStorage.setItem('failed_logs', JSON.stringify(updatedLogs));
    } catch (e) {
      console.error('Failed to store logs for later retry', e);
    }
  }
}
```

### 5.3 인증 및 보안

원격 로그 전송 시 보안을 강화하기 위한 방안:

```typescript
interface SecureTransportConfig {
  apiKey: string;
  encryptPayload?: boolean;
  allowedLogLevels?: LogLevel[];
  sensitiveFields?: string[];
}

class SecureLogTransport implements RemoteLogTransport {
  private config: SecureTransportConfig;
  private endpoint: string;
  
  constructor(endpoint: string, config: SecureTransportConfig) {
    this.endpoint = endpoint;
    this.config = config;
  }
  
  public async send(entry: LogEntry): Promise<boolean> {
    if (this.shouldFilterLog(entry)) {
      return false;
    }
    
    const processedEntry = this.sanitizeEntry(entry);
    const payload = this.preparePayload(processedEntry);
    
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Client-Timestamp': Date.now().toString()
        },
        body: JSON.stringify(payload)
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to send log to remote server', error);
      return false;
    }
  }
  
  public async sendBatch(entries: LogEntry[]): Promise<boolean> {
    const filteredEntries = entries.filter(entry => !this.shouldFilterLog(entry));
    if (filteredEntries.length === 0) return true;
    
    const processedEntries = filteredEntries.map(entry => this.sanitizeEntry(entry));
    const payload = this.preparePayload(processedEntries);
    
    try {
      const response = await fetch(`${this.endpoint}/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Client-Timestamp': Date.now().toString()
        },
        body: JSON.stringify(payload)
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to send batch logs to remote server', error);
      return false;
    }
  }
  
  // ... 다른 필수 메서드 구현
  
  private shouldFilterLog(entry: LogEntry): boolean {
    // 허용된 로그 레벨만 전송
    if (this.config.allowedLogLevels && 
        !this.config.allowedLogLevels.includes(entry.level)) {
      return true;
    }
    
    return false;
  }
  
  private sanitizeEntry(entry: LogEntry): LogEntry {
    if (!entry.data || !this.config.sensitiveFields) {
      return entry;
    }
    
    const sanitizedEntry = { ...entry };
    const sensitiveFields = this.config.sensitiveFields;
    
    const sanitizeObject = (obj: any) => {
      for (const key in obj) {
        if (sensitiveFields.includes(key)) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };
    
    if (sanitizedEntry.data) {
      sanitizedEntry.data = JSON.parse(JSON.stringify(sanitizedEntry.data));
      sanitizeObject(sanitizedEntry.data);
    }
    
    return sanitizedEntry;
  }
  
  private preparePayload(entryOrEntries: LogEntry | LogEntry[]): any {
    const payload = {
      entries: Array.isArray(entryOrEntries) ? entryOrEntries : [entryOrEntries],
      metadata: {
        clientInfo: this.getClientInfo(),
        timestamp: Date.now()
      }
    };
    
    return this.config.encryptPayload ? this.encryptPayload(payload) : payload;
  }
  
  private getClientInfo(): any {
    // 클라이언트 정보(브라우저, OS 등) 수집
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      // 기타 필요한 클라이언트 정보
    };
  }
  
  private encryptPayload(payload: any): any {
    // 실제 구현에서는 적절한 암호화 로직 적용
    // 예시로만 표시, 실제로는 더 안전한 방법 사용 필요
    return {
      encrypted: btoa(JSON.stringify(payload)),
      algorithm: 'base64' // 실제로는 더 강력한 암호화 사용
    };
  }
}
```

## 6. 실제 구현 계획

### 6.1 단계적 접근

1. **1단계: 로컬 저장 미들웨어 구현**
   - 로그를 IndexedDB/localStorage에 저장
   - 오프라인 지원 및 로그 손실 방지

2. **2단계: 기본 원격 전송 구현**
   - 선택한 로깅 서비스와 통합
   - 배치 처리 및 재시도 메커니즘 적용

3. **3단계: 고급 기능 추가**
   - 로그 필터링 및 샘플링
   - 보안 강화 및 최적화

### 6.2 성능 고려사항

- **네트워크 영향 최소화**
  - 배치 처리로 요청 수 감소
  - 적절한 배치 크기 및 타이밍 조정

- **브라우저 성능 고려**
  - 메인 스레드 차단 방지
  - 가능한 경우 Web Worker 활용

- **데이터 사용량 최적화**
  - 로그 압축
  - 필요한 정보만 전송 (적절한 필터링)
  - 중복 제거

## 7. 권장사항 및 결론

### 7.1 추천 로깅 서비스

다음 우선순위로 로깅 서비스를 추천합니다:

1. **Sentry**: 오류 추적에 중점을 둔 애플리케이션에 적합하며, React 통합이 우수하고 초기 설정이 간단합니다. 무료 티어가 있어 초기 비용 부담이 적습니다.

2. **LogRocket**: 사용자 경험 및 세션 재생이 중요한 경우 좋은 선택입니다.

3. **Datadog RUM**: 대규모 엔터프라이즈 애플리케이션이나 여러 서비스와의 통합이 필요한 경우 적합합니다.

### 7.2 자체 구현 vs 기존 솔루션

- **장단점 비교**:
  - 자체 구현: 완전한 제어, 맞춤 기능, 추가 비용 없음, 하지만 개발 및 유지 관리 부담
  - 기존 솔루션: 빠른 구현, 안정성, 고급 기능, 하지만 비용 발생 및 제어 제한

- **추천**: 초기에는 Sentry와 같은 기존 솔루션으로 시작하고, 필요에 따라 추가 기능을 위한 추상화 계층을 구현하는 하이브리드 접근 방식을 권장합니다.

### 7.3 즉시 구현 가능한 이행 계획

1. **1주차**: Sentry 통합 구현 및 기본 오류 추적 설정
2. **2주차**: 커스텀 로그 미들웨어로 Sentry 통합 확장
3. **3주차**: 배치 처리 및 오프라인 지원 추가
4. **4주차**: 성능 최적화 및 테스트

## 8. 로깅 서비스 리소스 예상

| 서비스 | 무료 티어 | 초기 비용 (소규모) | 대규모 앱 비용 |
|-------|-----------|-----------------|-------------|
| Sentry | 5K 이벤트/월, 1인 사용자 | $26/월 (100K 이벤트) | $80+/월 |
| LogRocket | 1K 세션/월, 7일 보존 | $99/월 (10K 세션) | $500+/월 |
| Datadog RUM | 무료 평가판만 | $15/월 (10K 세션) | $300+/월 |

최종 비용은 사용량, 선택한 플랜, 계약 조건에 따라 다를 수 있습니다. 