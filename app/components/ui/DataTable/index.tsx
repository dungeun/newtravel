'use client';

import { useDataTable } from './useDataTable';
import { DataTableProps } from './types';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import TablePagination from './TablePagination';
import { logger } from '@/lib/logging';
import React from 'react';

/**
 * 데이터 테이블 컴포넌트
 * 데이터를 테이블 형태로 표시하고 정렬, 필터링, 페이지네이션, 행 선택 기능을 제공합니다.
 */
function DataTable<T extends Record<string, any>>(props: DataTableProps<T>) {
  const {
    title,
    description,
    columns,
    data,
    isLoading = false,
    selectable = false,
    pagination = true,
    striped = true,
    bordered = false,
    hover = true,
    className = '',
    headerClassName = '',
    bodyClassName = '',
    emptyMessage = '데이터가 없습니다.',
    maxHeight,
    actions,
    size = 'medium',
    onRowClick,
    onRowDoubleClick,
  } = props;

  // useDataTable 커스텀 훅으로 테이블 로직 관리
  const {
    rows,
    filteredCount,
    totalCount,
    sortState,
    handleSort,
    paginationState,
    handlePageChange,
    handlePageSizeChange,
    pageCount,
    currentPage,
    getPageRange,
    selectedRows,
    handleRowSelect,
    handleSelectAll,
    isAllSelected,
    isIndeterminate,
    visibleRowCount,
  } = useDataTable<T>(props);

  // 성능 측정 시작
  const startTime = performance.now();

  // 컨테이너 클래스
  const containerClass = `
    bg-white shadow-md rounded-lg overflow-hidden
    ${bordered ? 'border border-gray-200' : ''}
    ${className}
  `.trim();

  // 테이블 크기에 따른 패딩 클래스
  const sizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  }[size];

  // 테이블 클래스
  const tableClass = `min-w-full divide-y divide-gray-200 ${sizeClasses}`;

  // 렌더링 완료시 성능 기록
  React.useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // 10ms 이상 걸린 경우만 로깅 (너무 많은 로그 방지)
    if (renderTime > 10) {
      logger.performance('DataTable Render Time', renderTime, {
        component: 'DataTable',
        rowCount: rows.length,
        columnCount: columns.length,
      });
    }
  }, [rows.length, columns.length, startTime]);

  return (
    <div className={containerClass}>
      {/* 타이틀, 설명, 액션 버튼 */}
      {(title || description || actions) && (
        <div className="border-b border-gray-200 px-6 py-4">
          {title && <h2 className="text-xl font-semibold text-gray-800">{title}</h2>}
          {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
          {actions && <div className="mt-4 flex justify-end space-x-2">{actions}</div>}
        </div>
      )}

      <div
        className="overflow-x-auto"
        style={{ maxHeight: maxHeight ? `${maxHeight}px` : undefined }}
      >
        <table className={tableClass}>
          {/* 테이블 헤더 */}
          <TableHeader<T>
            columns={columns}
            sortState={sortState}
            onSort={handleSort}
            selectable={selectable}
            isAllSelected={isAllSelected}
            isIndeterminate={isIndeterminate}
            onSelectAll={handleSelectAll}
            headerClassName={headerClassName}
          />

          {/* 테이블 바디 */}
          <tbody
            className={`divide-y divide-gray-200 bg-white ${bodyClassName}`}
          >
            {isLoading ? (
              // 로딩 상태
              <tr>
                <td
                  colSpan={columns.filter(col => !col.hidden).length + (selectable ? 1 : 0)}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  <div className="flex items-center justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                    <span className="ml-2">데이터 로딩 중...</span>
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              // 데이터 없음
              <tr>
                <td
                  colSpan={columns.filter(col => !col.hidden).length + (selectable ? 1 : 0)}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              // 데이터 행
              rows.map((row, index) => (
                <TableRow
                  key={typeof props.rowId === 'function' ? String(props.rowId(row)) : String(row[props.rowId as keyof T] || index)}
                  columns={columns}
                  data={row}
                  index={index}
                  isSelected={selectedRows.includes(
                    typeof props.rowId === 'function'
                      ? props.rowId(row)
                      : row[props.rowId as keyof T]
                  )}
                  onSelect={handleRowSelect}
                  onClick={onRowClick}
                  onDoubleClick={onRowDoubleClick}
                  selectable={selectable}
                  rowClassName={striped && index % 2 === 1 ? 'bg-gray-50' : ''}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {pagination && !isLoading && filteredCount > 0 && (
        <TablePagination
          currentPage={currentPage}
          pageCount={pageCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageRanges={getPageRange()}
          visibleRowCount={visibleRowCount}
          filteredCount={filteredCount}
          totalCount={totalCount}
          pageSize={paginationState.pageSize}
        />
      )}
    </div>
  );
}

// 메모이제이션된 DataTable 컴포넌트 export
export default React.memo(DataTable); 