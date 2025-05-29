'use client';

import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { DataTableColumn, SortState } from './types';

interface TableHeaderProps<T = any> {
  columns: DataTableColumn<T>[];
  sortState: SortState | null;
  onSort: (columnId: string) => void;
  selectable?: boolean;
  isAllSelected?: boolean;
  isIndeterminate?: boolean;
  onSelectAll?: (selected: boolean) => void;
  headerClassName?: string;
}

/**
 * DataTable의 헤더 컴포넌트
 * 컬럼 제목 표시 및 정렬 기능 제공
 */
export default function TableHeader<T>({
  columns,
  sortState,
  onSort,
  selectable = false,
  isAllSelected = false,
  isIndeterminate = false,
  onSelectAll,
  headerClassName = '',
}: TableHeaderProps<T>) {
  // 정렬 아이콘 렌더링 함수
  const renderSortIcon = (columnId: string) => {
    if (!sortState || sortState.id !== columnId) {
      return null;
    }

    return sortState.direction === 'asc' ? (
      <ArrowUpIcon className="ml-1 h-4 w-4" />
    ) : (
      <ArrowDownIcon className="ml-1 h-4 w-4" />
    );
  };

  // 체크박스 상태 변경 핸들러
  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectAll) {
      onSelectAll(e.target.checked);
    }
  };

  return (
    <thead className={`bg-gray-50 text-xs uppercase text-gray-700 ${headerClassName}`}>
      <tr>
        {/* 선택 체크박스 */}
        {selectable && (
          <th scope="col" className="px-4 py-3 w-10">
            <div className="flex items-center">
              <input
                id="checkbox-all"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                checked={isAllSelected}
                ref={(input) => {
                  if (input) {
                    input.indeterminate = isIndeterminate;
                  }
                }}
                onChange={handleSelectAllChange}
              />
              <label htmlFor="checkbox-all" className="sr-only">
                전체 선택
              </label>
            </div>
          </th>
        )}

        {/* 컬럼 헤더 */}
        {columns
          .filter((column) => !column.hidden)
          .map((column) => {
            const isSortable = column.sortable !== false; // 기본값은 정렬 가능
            const headerClasses = [
              'px-4 py-3',
              column.headerClassName || '',
              isSortable ? 'cursor-pointer hover:bg-gray-100' : '',
              column.align === 'center' ? 'text-center' : '',
              column.align === 'right' ? 'text-right' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <th
                key={column.id}
                scope="col"
                className={headerClasses}
                style={{
                  width: column.width,
                  minWidth: column.minWidth,
                  maxWidth: column.maxWidth,
                }}
                onClick={() => {
                  if (isSortable) {
                    onSort(column.id);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  {column.header}
                  {isSortable && renderSortIcon(column.id)}
                </div>
              </th>
            );
          })}
      </tr>
    </thead>
  );
} 