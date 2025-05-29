/**
 * 데이터 테이블 컴포넌트 타입 정의
 */

/**
 * 데이터 테이블 컬럼 정의
 */
export interface DataTableColumn<T = any> {
  /** 컬럼 ID (고유 식별자) */
  id: string;
  
  /** 컬럼 헤더에 표시할 제목 */
  header: string;
  
  /** 셀 렌더링에 사용할 행 데이터의 속성 이름 */
  accessor?: keyof T;
  
  /** 커스텀 렌더링 함수 (accessor보다 우선 적용) */
  cell?: (row: T, index: number) => React.ReactNode;
  
  /** 컬럼 너비 (기본값: 'auto') */
  width?: string | number;
  
  /** 컬럼 정렬 가능 여부 */
  sortable?: boolean;
  
  /** 커스텀 정렬 함수 */
  sort?: (a: T, b: T, direction: SortDirection) => number;
  
  /** 컬럼 필터링 가능 여부 */
  filterable?: boolean;
  
  /** 셀 텍스트 정렬 (기본값: 'left') */
  align?: 'left' | 'center' | 'right';
  
  /** 컬럼 CSS 클래스 */
  className?: string;
  
  /** 헤더 CSS 클래스 */
  headerClassName?: string;
  
  /** 셀 CSS 클래스 */
  cellClassName?: string | ((row: T) => string);
  
  /** 최소 너비 */
  minWidth?: string | number;
  
  /** 최대 너비 */
  maxWidth?: string | number;
  
  /** 컬럼 표시 여부 */
  hidden?: boolean;
}

/**
 * 정렬 방향
 */
export type SortDirection = 'asc' | 'desc';

/**
 * 정렬 상태
 */
export interface SortState {
  /** 정렬할 컬럼 ID */
  id: string;
  
  /** 정렬 방향 */
  direction: SortDirection;
}

/**
 * 필터 유형
 */
export type FilterType = 'text' | 'select' | 'dateRange' | 'number' | 'boolean' | 'custom';

/**
 * 필터 연산자
 */
export type FilterOperator =
  | 'contains'
  | 'equals'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'between'
  | 'in'
  | 'custom';

/**
 * 필터 상태
 */
export interface FilterState {
  /** 필터링할 컬럼 ID */
  id: string;
  
  /** 필터 값 */
  value: any;
  
  /** 필터 연산자 */
  operator: FilterOperator;
  
  /** 필터 유형 */
  type: FilterType;
}

/**
 * 페이지네이션 상태
 */
export interface PaginationState {
  /** 현재 페이지 (0부터 시작) */
  page: number;
  
  /** 페이지당 행 수 */
  pageSize: number;
  
  /** 전체 행 수 */
  totalCount: number;
}

/**
 * 데이터 테이블 Props
 */
export interface DataTableProps<T = any> {
  /** 테이블에 표시할 데이터 배열 */
  data: T[];
  
  /** 테이블 컬럼 정의 */
  columns: DataTableColumn<T>[];
  
  /** 로딩 상태 */
  isLoading?: boolean;
  
  /** 정렬 기능 활성화 여부 */
  sortable?: boolean;
  
  /** 초기 정렬 상태 */
  initialSort?: SortState;
  
  /** 정렬 상태 변경 핸들러 */
  onSortChange?: (sortState: SortState) => void;
  
  /** 필터링 기능 활성화 여부 */
  filterable?: boolean;
  
  /** 초기 필터 상태 */
  initialFilters?: FilterState[];
  
  /** 필터 상태 변경 핸들러 */
  onFilterChange?: (filterState: FilterState[]) => void;
  
  /** 페이지네이션 활성화 여부 */
  pagination?: boolean;
  
  /** 초기 페이지네이션 상태 */
  initialPagination?: Partial<PaginationState>;
  
  /** 페이지네이션 상태 변경 핸들러 */
  onPaginationChange?: (paginationState: PaginationState) => void;
  
  /** 행 선택 기능 활성화 여부 */
  selectable?: boolean;
  
  /** 초기 선택된 행 ID 배열 */
  initialSelectedRows?: string[] | number[];
  
  /** 행 선택 상태 변경 핸들러 */
  onSelectionChange?: (selectedRows: string[] | number[]) => void;
  
  /** 행 ID로 사용할 데이터 속성 (기본값: 'id') */
  rowId?: keyof T | ((row: T) => string | number);
  
  /** 행 클릭 핸들러 */
  onRowClick?: (row: T, index: number) => void;
  
  /** 행 더블 클릭 핸들러 */
  onRowDoubleClick?: (row: T, index: number) => void;
  
  /** 테이블 제목 */
  title?: string;
  
  /** 테이블 설명 */
  description?: string;
  
  /** 데이터 없음 메시지 */
  emptyMessage?: string;
  
  /** 스트라이프 스타일 적용 여부 */
  striped?: boolean;
  
  /** 테두리 스타일 적용 여부 */
  bordered?: boolean;
  
  /** 행 Hover 효과 적용 여부 */
  hover?: boolean;
  
  /** 테이블 CSS 클래스 */
  className?: string;
  
  /** 테이블 헤더 CSS 클래스 */
  headerClassName?: string;
  
  /** 테이블 바디 CSS 클래스 */
  bodyClassName?: string;

  /** 테이블 최대 높이 (스크롤 적용) */
  maxHeight?: string | number;

  /** 커스텀 엑션 버튼들 */
  actions?: React.ReactNode;

  /** 테이블 크기 */
  size?: 'small' | 'medium' | 'large';
} 