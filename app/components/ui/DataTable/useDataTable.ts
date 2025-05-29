import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  DataTableProps,
  SortState,
  FilterState,
  PaginationState,
  SortDirection,
} from './types';
import { logger } from '@/lib/logging';

/**
 * DataTable 컴포넌트의 상태 관리 및 로직을 처리하는 커스텀 훅
 */
export function useDataTable<T extends Record<string, any>>(props: DataTableProps<T>) {
  const {
    data,
    columns,
    sortable = true,
    initialSort,
    onSortChange,
    filterable = false,
    initialFilters = [],
    onFilterChange,
    pagination = true,
    initialPagination,
    onPaginationChange,
    selectable = false,
    initialSelectedRows = [],
    onSelectionChange,
    rowId = 'id' as keyof T,
  } = props;

  // 상태 관리
  const [sortState, setSortState] = useState<SortState | null>(initialSort || null);
  const [filterState, setFilterState] = useState<FilterState[]>(initialFilters);
  const [paginationState, setPaginationState] = useState<PaginationState>({
    page: initialPagination?.page || 0,
    pageSize: initialPagination?.pageSize || 10,
    totalCount: initialPagination?.totalCount || data.length,
  });
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>(initialSelectedRows);

  // 데이터 변경 시 총 행 수 업데이트
  useEffect(() => {
    setPaginationState((prev) => ({
      ...prev,
      totalCount: data.length,
    }));
  }, [data]);

  // 필터된 데이터 계산 (메모이제이션)
  const filteredData = useMemo(() => {
    // 필터링이 비활성화되거나 필터가 없으면 원본 데이터 반환
    if (!filterable || filterState.length === 0) {
      return data;
    }

    // 필터 적용
    return data.filter((row) => {
      return filterState.every((filter) => {
        const column = columns.find((col) => col.id === filter.id);
        if (!column) return true;

        const accessor = column.accessor as keyof T;
        const value = accessor ? row[accessor] : null;

        switch (filter.operator) {
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'equals':
            return value === filter.value;
          case 'startsWith':
            return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase());
          case 'endsWith':
            return String(value).toLowerCase().endsWith(String(filter.value).toLowerCase());
          case 'greaterThan':
            return Number(value) > Number(filter.value);
          case 'lessThan':
            return Number(value) < Number(filter.value);
          case 'between':
            return (
              Array.isArray(filter.value) &&
              Number(value) >= Number(filter.value[0]) &&
              Number(value) <= Number(filter.value[1])
            );
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(value);
          default:
            return true;
        }
      });
    });
  }, [data, filterable, filterState, columns]);

  // 정렬된 데이터 계산 (메모이제이션)
  const sortedData = useMemo(() => {
    // 정렬이 비활성화되거나 정렬 상태가 없으면 필터된 데이터 반환
    if (!sortable || !sortState) {
      return filteredData;
    }

    const { id: sortId, direction } = sortState;
    const column = columns.find((col) => col.id === sortId);

    if (!column) {
      return filteredData;
    }

    return [...filteredData].sort((a, b) => {
      const accessor = column.accessor as keyof T;
      
      if (!accessor) {
        return 0;
      }

      let valueA = a[accessor];
      let valueB = b[accessor];

      // 값이 정의되지 않은 경우 처리
      if (valueA === undefined || valueA === null) {
        return direction === 'asc' ? -1 : 1;
      }
      if (valueB === undefined || valueB === null) {
        return direction === 'asc' ? 1 : -1;
      }

      // 커스텀 소팅 함수가 있으면 사용
      if (column.sort) {
        return column.sort(a, b, direction) * (direction === 'asc' ? 1 : -1);
      }

      // 값의 타입에 따라 적절한 비교 수행
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return direction === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      // 숫자, 불리언 등의 타입인 경우
      return direction === 'asc'
        ? valueA > valueB ? 1 : valueA < valueB ? -1 : 0
        : valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
    });
  }, [filteredData, sortable, sortState, columns]);

  // 페이지네이션 적용된 데이터 계산 (메모이제이션)
  const paginatedData = useMemo(() => {
    // 페이지네이션이 비활성화되면 정렬된 데이터 반환
    if (!pagination) {
      return sortedData;
    }

    const { page, pageSize } = paginationState;
    const start = page * pageSize;
    const end = start + pageSize;

    return sortedData.slice(start, end);
  }, [sortedData, pagination, paginationState]);

  // 전체 행이 선택되었는지 여부 (메모이제이션)
  const isAllSelected = useMemo(() => {
    if (sortedData.length === 0) return false;
    
    // 모든 행의 ID 가져오기
    const allIds = sortedData.map((row) => {
      const getId = typeof rowId === 'function' 
        ? rowId 
        : (row: T) => row[rowId as keyof T] as (string | number);
      return getId(row);
    });
    
    // 모든 ID가 selectedRows에 포함되어 있는지 확인
    return allIds.every((id) => selectedRows.includes(id));
  }, [sortedData, selectedRows, rowId]);

  // 일부 행만 선택되었는지 여부 (메모이제이션)
  const isIndeterminate = useMemo(() => {
    if (sortedData.length === 0) return false;
    
    // 선택된 행이 있지만 모든 행이 선택되지 않은 경우
    return selectedRows.length > 0 && !isAllSelected;
  }, [sortedData.length, selectedRows.length, isAllSelected]);

  // 페이지 수 계산 (메모이제이션)
  const pageCount = useMemo(() => {
    return Math.ceil(sortedData.length / paginationState.pageSize);
  }, [sortedData.length, paginationState.pageSize]);

  // 현재 페이지 (메모이제이션)
  const currentPage = useMemo(() => {
    return paginationState.page;
  }, [paginationState.page]);

  // 보이는 행 수 (메모이제이션)
  const visibleRowCount = useMemo(() => {
    return paginatedData.length;
  }, [paginatedData.length]);

  // 필터링된 행 수 (메모이제이션)
  const filteredCount = useMemo(() => {
    return sortedData.length;
  }, [sortedData.length]);

  // 총 행 수 (메모이제이션)
  const totalCount = useMemo(() => {
    return data.length;
  }, [data.length]);

  // 페이지 범위 계산 (메모이제이션)
  const getPageRange = useCallback(() => {
    const { page, pageSize } = paginationState;
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const currentPage = page;

    // 페이지 범위 계산 (총 5개의 페이지 버튼 표시)
    let startPage = Math.max(0, currentPage - 2);
    let endPage = Math.min(totalPages - 1, startPage + 4);

    // 끝 페이지가 최댓값보다 작으면 시작 페이지 조정
    if (endPage - startPage < 4) {
      startPage = Math.max(0, endPage - 4);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }, [paginationState, sortedData.length]);

  // 정렬 처리 핸들러
  const handleSort = useCallback((columnId: string) => {
    if (!sortable) return;

    setSortState((prev) => {
      // 새로운 정렬 상태 생성
      const newSortState: SortState = prev && prev.id === columnId
        ? { id: columnId, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { id: columnId, direction: 'asc' };

      // 외부 핸들러 호출
      if (onSortChange) {
        onSortChange(newSortState);
      }

      return newSortState;
    });
  }, [sortable, onSortChange]);

  // 필터 처리 핸들러
  const handleFilter = useCallback((filter: FilterState) => {
    if (!filterable) return;

    setFilterState((prev) => {
      // 필터 목록에서 같은 컬럼 ID를 가진 필터를 찾음
      const existingFilterIndex = prev.findIndex((f) => f.id === filter.id);

      let newFilters: FilterState[];

      if (existingFilterIndex >= 0) {
        // 기존 필터 업데이트
        newFilters = [...prev];
        newFilters[existingFilterIndex] = filter;
      } else {
        // 새 필터 추가
        newFilters = [...prev, filter];
      }

      // 외부 핸들러 호출
      if (onFilterChange) {
        onFilterChange(newFilters);
      }

      return newFilters;
    });
  }, [filterable, onFilterChange]);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((newPage: number) => {
    if (!pagination) return;

    setPaginationState((prev) => {
      const updatedState = { ...prev, page: newPage };
      
      // 외부 핸들러 호출
      if (onPaginationChange) {
        onPaginationChange(updatedState);
      }
      
      return updatedState;
    });
  }, [pagination, onPaginationChange]);

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    if (!pagination) return;

    setPaginationState((prev) => {
      // 페이지 크기 변경 시 현재 페이지를 유지하되, 
      // 만약 현재 페이지가 새 페이지 크기로 인해 유효하지 않게 되면 마지막 페이지로 설정
      const totalPages = Math.ceil(sortedData.length / newPageSize);
      const newPage = prev.page >= totalPages ? Math.max(0, totalPages - 1) : prev.page;
      
      const updatedState = { ...prev, pageSize: newPageSize, page: newPage };
      
      // 외부 핸들러 호출
      if (onPaginationChange) {
        onPaginationChange(updatedState);
      }
      
      return updatedState;
    });
  }, [pagination, onPaginationChange, sortedData.length]);

  // 행 선택 핸들러
  const handleRowSelect = useCallback((rowData: T) => {
    if (!selectable) return;

    const getId = typeof rowId === 'function' 
      ? rowId 
      : (row: T) => row[rowId as keyof T] as (string | number);
    
    const rowIdValue = getId(rowData);

    setSelectedRows((prev) => {
      // 이미 선택된 행이면 선택 해제, 아니면 선택 추가
      const newSelectedRows = prev.includes(rowIdValue)
        ? prev.filter((id) => id !== rowIdValue)
        : [...prev, rowIdValue];
      
      // 외부 핸들러 호출
      if (onSelectionChange) {
        // 타입 호환성을 위한 타입 변환
        const typedSelectedRows = newSelectedRows.every(id => typeof id === 'string')
          ? newSelectedRows as string[]
          : newSelectedRows as number[];
          
        onSelectionChange(typedSelectedRows);
      }
      
      return newSelectedRows;
    });
  }, [selectable, rowId, onSelectionChange]);

  // 모든 행 선택/해제 처리
  const handleSelectAll = useCallback((selected: boolean) => {
    if (!selectable) return;

    const newSelectedRows = selected
      ? sortedData.map((row) => {
          const getId = typeof rowId === 'function' 
            ? rowId 
            : (row: T) => row[rowId as keyof T] as (string | number);
          return getId(row);
        })
      : [];

    // 외부 핸들러 호출
    if (onSelectionChange) {
      // 타입 호환성을 위한 타입 변환
      const typedSelectedRows = newSelectedRows.every(id => typeof id === 'string')
        ? newSelectedRows as string[]
        : newSelectedRows as number[];
        
      onSelectionChange(typedSelectedRows);
    }

    setSelectedRows(newSelectedRows);
  }, [selectable, sortedData, rowId, onSelectionChange]);

  // 정렬 상태 변경 시 콜백 호출
  useEffect(() => {
    if (onSortChange && sortState) {
      onSortChange(sortState);
    }
  }, [sortState, onSortChange]);

  // 필터 상태 변경 시 콜백 호출
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filterState);
    }
  }, [filterState, onFilterChange]);

  // 페이지네이션 상태 변경 시 콜백 호출
  useEffect(() => {
    if (onPaginationChange) {
      onPaginationChange(paginationState);
    }
  }, [paginationState, onPaginationChange]);

  return {
    // 데이터
    rows: paginatedData,
    filteredCount,
    totalCount,
    
    // 정렬 관련
    sortState,
    handleSort,
    
    // 필터 관련
    filterState,
    handleFilter,
    
    // 페이지네이션 관련
    paginationState,
    handlePageChange,
    handlePageSizeChange,
    pageCount,
    currentPage,
    getPageRange,
    
    // 행 선택 관련
    selectedRows,
    handleRowSelect,
    handleSelectAll,
    isAllSelected,
    isIndeterminate,
    
    // 기타
    visibleRowCount,
  };
} 