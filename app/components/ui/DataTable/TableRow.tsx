'use client';

import React from 'react';
import { DataTableColumn } from './types';

interface TableRowProps<T = any> {
  columns: DataTableColumn<T>[];
  data: T;
  index: number;
  isSelected?: boolean;
  onSelect?: (data: T) => void;
  onClick?: (data: T, index: number) => void;
  onDoubleClick?: (data: T, index: number) => void;
  selectable?: boolean;
  rowClassName?: string;
}

/**
 * DataTable의 행 컴포넌트
 * 데이터 행 렌더링 담당
 */
const TableRow = React.memo(function TableRow<T = any>({
  columns,
  data,
  index,
  isSelected = false,
  onSelect,
  onClick,
  onDoubleClick,
  selectable = false,
  rowClassName = '',
}: TableRowProps<T>) {
  // 행 클릭 핸들러
  const handleClick = React.useCallback(() => {
    if (onClick) {
      onClick(data, index);
    }
  }, [onClick, data, index]);

  // 행 더블 클릭 핸들러
  const handleDoubleClick = React.useCallback(() => {
    if (onDoubleClick) {
      onDoubleClick(data, index);
    }
  }, [onDoubleClick, data, index]);

  // 체크박스 변경 핸들러
  const handleCheckboxChange = React.useCallback(() => {
    if (onSelect) {
      onSelect(data);
    }
  }, [onSelect, data]);

  // 행 스타일 계산
  const rowStyles = React.useMemo(() => {
    return [
      'hover:bg-gray-50',
      isSelected ? 'bg-blue-50' : '',
      rowClassName,
    ]
      .filter(Boolean)
      .join(' ');
  }, [isSelected, rowClassName]);

  return (
    <tr
      className={rowStyles}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* 선택 체크박스 */}
      {selectable && (
        <td className="px-4 py-2 text-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </td>
      )}

      {/* 데이터 셀 */}
      {columns
        .filter((column) => !column.hidden)
        .map((column) => {
          // 셀 컨텐츠 결정
          let cellContent: React.ReactNode;

          if (column.cell) {
            // 커스텀 셀 렌더러 사용
            cellContent = column.cell(data, index);
          } else if (column.accessor) {
            // accessor를 통한 데이터 접근
            const value = data[column.accessor as keyof T];
            cellContent = value !== null && value !== undefined ? String(value) : '';
          } else {
            // 기본값
            cellContent = '';
          }

          // 셀 클래스 결정
          let cellClassName = 'px-4 py-3';

          // 정렬 클래스 추가
          if (column.align === 'center') {
            cellClassName += ' text-center';
          } else if (column.align === 'right') {
            cellClassName += ' text-right';
          }

          // 커스텀 셀 클래스 추가
          if (column.cellClassName) {
            if (typeof column.cellClassName === 'function') {
              cellClassName += ` ${column.cellClassName(data)}`;
            } else {
              cellClassName += ` ${column.cellClassName}`;
            }
          }

          return (
            <td
              key={column.id}
              className={cellClassName}
              style={{
                width: column.width,
                minWidth: column.minWidth,
                maxWidth: column.maxWidth,
              }}
            >
              {cellContent}
            </td>
          );
        })}
    </tr>
  );
});

// memo 컴포넌트 디버깅을 위한 displayName 설정
TableRow.displayName = 'TableRow';

export default TableRow; 