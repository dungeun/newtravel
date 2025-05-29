# 컴포넌트 아키텍처 가이드라인

본 문서는 프로젝트의 컴포넌트 아키텍처에 대한 지침을 제공합니다. 이 가이드라인은 코드 유지보수성과 확장성을 높이기 위한 것으로, PRD 섹션 4.1.1에서 정의된 요구사항에 기반합니다.

## 1. 컴포넌트 크기 최적화

대규모 컴포넌트는 유지보수와 이해가 어렵습니다. 컴포넌트 크기를 최적화하기 위한 지침:

### 1.1 파일 크기 제한

- **목표**: 모든 컴포넌트 파일은 150줄 이하로 유지
- **예외**: 복잡한 로직의 경우 최대 200줄까지 허용 (단, 주석과 문서화 포함)

### 1.2 대규모 컴포넌트 분할 전략

대규모 컴포넌트는 다음과 같은 패턴으로 분할합니다:

1. **레이아웃 컴포넌트 분리**:
   - 메인 컴포넌트: 페이지 또는 섹션의 기본 구조만 담당
   - 하위 컴포넌트: 특정 UI 영역 담당 (예: 헤더, 사이드바, 콘텐츠 영역)

2. **로직과 UI 분리**:
   - 비즈니스 로직: 커스텀 훅으로 추출
   - UI 렌더링: 순수 컴포넌트로 구현

3. **폴더 구조 활용**:
   - 복잡한 컴포넌트는 독립 폴더로 구성
   - `index.tsx`를 진입점으로 사용

#### 예시: DashboardLayout 분할

```
DashboardLayout/ (폴더)
├── index.tsx            // 메인 레이아웃 구조 (120줄)
├── DashboardAuth.tsx    // 인증 관련 컴포넌트 (80줄)
├── DashboardNav.tsx     // 네비게이션 컴포넌트 (150줄)
└── useDashboardState.ts // 레이아웃 상태 관리 훅 (90줄)
```

#### 예시: DataTable 모듈화

```
DataTable/ (폴더)
├── index.tsx            // 메인 컴포넌트 (120줄)
├── useDataTable.ts      // 테이블 로직 훅 (150줄)
├── TableHeader.tsx      // 헤더 컴포넌트 (80줄)
├── TableRow.tsx         // 행 컴포넌트 (90줄)
├── TablePagination.tsx  // 페이지네이션 (60줄)
└── TableFilter.tsx      // 필터 컴포넌트 (70줄)
```

## 2. 단일 책임 원칙(SRP) 적용

각 컴포넌트는 하나의 책임만 가지도록 설계합니다.

### 2.1 책임 분리 가이드라인

| 책임 영역 | 분리 전략 | 파일 위치 |
|---------|----------|----------|
| **비즈니스 로직** | 커스텀 훅으로 추출 | `use[Feature]State.ts`, `use[Feature].ts` |
| **UI 렌더링** | 순수/프레젠테이셔널 컴포넌트 | `[Component].tsx` |
| **데이터 페칭** | 서비스 레이어/훅 | `services/` 또는 `hooks/use[Resource].ts` |
| **레이아웃** | 레이아웃 컴포넌트 | `components/layout/` |
| **상태 관리** | 커스텀 훅 또는 Context | `hooks/` 또는 `context/` |

### 2.2 컴포넌트 분류

1. **컨테이너 컴포넌트**:
   - 데이터와 상태를 관리
   - 프레젠테이셔널 컴포넌트에 데이터 전달
   - 비즈니스 로직 포함

2. **프레젠테이셔널 컴포넌트**:
   - UI 렌더링에만 집중
   - props로 데이터 수신
   - 상태 관리 최소화 (UI 상태만 관리)
   - 독립적으로 테스트 가능

3. **레이아웃 컴포넌트**:
   - 구조와 스타일링만 담당
   - `children` prop으로 내용 삽입
   - 최소한의 로직만 포함

### 2.3 커스텀 훅 설계

```typescript
// ✅ 좋은 예: 관련 로직을 훅으로 추출
export function useDataTable(initialData) {
  const [data, setData] = useState(initialData);
  const [sortField, setSortField] = useState(null);
  const [filter, setFilter] = useState({});
  
  // 정렬 로직
  const sortedData = useMemo(() => {
    // ...정렬 로직
  }, [data, sortField]);
  
  // 필터링 로직
  const filteredData = useMemo(() => {
    // ...필터링 로직
  }, [sortedData, filter]);
  
  return {
    data: filteredData,
    sortField,
    setSortField,
    filter,
    setFilter,
    // 기타 필요한 상태 및 메서드
  };
}

// ❌ 나쁜 예: 컴포넌트 내에 모든 로직 포함
function DataTable({ initialData }) {
  const [data, setData] = useState(initialData);
  const [sortField, setSortField] = useState(null);
  const [filter, setFilter] = useState({});
  
  // 컴포넌트 내에 정렬 및 필터링 로직 포함
  // 많은 상태 및 사이드 이펙트 관리
  // ...수백 줄의 코드
}
```

## 3. 컴포넌트 패턴 표준화

### 3.1 컴포넌트 구조

모든 컴포넌트는 다음 구조를 따릅니다:

```typescript
// 1. 임포트
import { useState, useEffect } from 'react';
import { ComponentProps } from './types';

// 2. 타입 정의 (또는 별도 파일에서 임포트)
interface Props {
  // props 정의
}

// 3. 컴포넌트 정의
export default function Component({ prop1, prop2 }: Props) {
  // 상태 정의
  const [state, setState] = useState();
  
  // 사이드 이펙트
  useEffect(() => {
    // 사이드 이펙트 로직
  }, [dependencies]);
  
  // 이벤트 핸들러
  const handleEvent = () => {
    // 이벤트 처리 로직
  };
  
  // 조건부 렌더링을 위한 계산
  const conditionalContent = condition ? <Element /> : <OtherElement />;
  
  // 렌더링
  return (
    <div>
      {/* JSX 구조 */}
    </div>
  );
}

// 4. 서브 컴포넌트 (옵션)
function SubComponent() {
  // ...
}
```

### 3.2 Props 인터페이스 표준화

1. **명명 규칙**:
   - 컴포넌트명 + `Props` (예: `ButtonProps`, `DataTableProps`)
   - 일관된 네이밍 사용

2. **타입 정의**:
   - 명시적 타입 정의 (any 사용 금지)
   - 선택적 props는 `?` 사용
   - 기본값이 있는 경우 명시

3. **문서화**:
   - 각 prop에 JSDoc 주석 추가
   - 예시 값 제공 (가능한 경우)

```typescript
/**
 * 버튼 컴포넌트 Props
 */
interface ButtonProps {
  /** 버튼에 표시할 텍스트 */
  label: string;
  
  /** 버튼 클릭 핸들러 */
  onClick: () => void;
  
  /** 버튼 변형 스타일 (기본값: 'primary') */
  variant?: 'primary' | 'secondary' | 'danger';
  
  /** 버튼 비활성화 여부 */
  disabled?: boolean;
  
  /** 버튼 크기 (기본값: 'medium') */
  size?: 'small' | 'medium' | 'large';
}
```

### 3.3 에러 처리 패턴

1. **컴포넌트 에러 경계 사용**:
   - 중요 컴포넌트 주변에 에러 경계 배치
   - 폴백 UI 제공

2. **데이터 페칭 에러 처리**:
   - 로딩/에러/데이터 상태 명확히
   - 사용자 친화적인 에러 메시지
   - 재시도 메커니즘 제공

3. **입력 값 검증**:
   - prop 타입 검증
   - 필수 값 검증
   - 유효하지 않은 입력에 대한 피드백

```typescript
// 에러 처리 예시
function UserProfile({ userId }) {
  const { data, error, isLoading } = useUser(userId);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return (
      <ErrorDisplay 
        message="사용자 정보를 불러올 수 없습니다." 
        error={error}
        onRetry={() => refetch()} 
      />
    );
  }
  
  if (!data) {
    return <EmptyState message="사용자 정보가 없습니다." />;
  }
  
  return (
    <div>
      {/* 사용자 프로필 렌더링 */}
    </div>
  );
}
```

## 4. 성능 최적화 패턴

### 4.1 불필요한 리렌더링 방지

- React.memo 사용 (적절한 경우)
- useCallback과 useMemo로 함수 및 계산 값 메모이제이션
- 이펙트 의존성 배열 최적화

### 4.2 메모이제이션 사용 지침

```typescript
// ✅ 좋은 예: 필요한 경우에만 메모이제이션
const memoizedValue = useMemo(() => {
  return heavyComputation(a, b);
}, [a, b]);

// ✅ 좋은 예: 이벤트 핸들러 메모이제이션
const handleClick = useCallback(() => {
  // 핸들러 로직
}, [dependencies]);

// ❌ 나쁜 예: 불필요한 메모이제이션
const simple = useMemo(() => a + b, [a, b]); // 단순 계산은 필요 없음
```

## 5. 테스트 전략

각 컴포넌트 유형에 맞는 테스트 전략:

1. **순수 컴포넌트**:
   - 렌더링 테스트
   - 스냅샷 테스트
   - 이벤트 핸들링 테스트

2. **컨테이너 컴포넌트**:
   - 통합 테스트
   - 데이터 흐름 테스트

3. **커스텀 훅**:
   - 단위 테스트
   - 에지 케이스 테스트

4. **전체 기능**:
   - 엔드-투-엔드 테스트

## 6. 리팩토링 체크리스트

컴포넌트 리팩토링 시 다음 체크리스트를 사용합니다:

1. **컴포넌트 크기**
   - [ ] 150줄 이하로 분할됨
   - [ ] 중첩 레벨 3 이하로 유지

2. **책임 분리**
   - [ ] 비즈니스 로직이 커스텀 훅으로 분리됨
   - [ ] UI와 데이터 로직이 분리됨
   - [ ] 한 컴포넌트는 한 가지 주요 기능만 담당

3. **재사용성**
   - [ ] 공통 로직이 적절히 추출됨
   - [ ] props가 명확하게 정의됨
   - [ ] 불필요한 의존성이 제거됨

4. **성능**
   - [ ] 불필요한 리렌더링 방지됨
   - [ ] 메모이제이션이 적절히 사용됨
   - [ ] 비용이 큰 작업이 최적화됨 