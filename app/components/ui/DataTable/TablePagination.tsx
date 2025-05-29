'use client';

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/solid';

interface TablePaginationProps {
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageRanges?: number[];
  visibleRowCount: number;
  filteredCount: number;
  totalCount: number;
  pageSizeOptions?: number[];
  pageSize?: number;
  className?: string;
}

/**
 * DataTable의 페이지네이션 컴포넌트
 * 페이지 네비게이션 및 페이지 크기 변경 기능 제공
 */
export default function TablePagination({
  currentPage,
  pageCount,
  onPageChange,
  onPageSizeChange,
  pageRanges = [],
  visibleRowCount,
  filteredCount,
  totalCount,
  pageSizeOptions = [10, 25, 50, 100],
  pageSize = 10,
  className = '',
}: TablePaginationProps) {
  // 페이지 이동 핸들러
  const handlePageChange = (page: number) => {
    if (page >= 0 && page < pageCount) {
      onPageChange(page);
    }
  };

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onPageSizeChange) {
      onPageSizeChange(Number(e.target.value));
    }
  };

  // 현재 표시 중인 항목 범위 계산
  const startItem = filteredCount > 0 ? currentPage * pageSize + 1 : 0;
  const endItem = Math.min((currentPage + 1) * pageSize, filteredCount);

  return (
    <div
      className={`flex flex-col items-center border-t border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      {/* 페이지 정보 */}
      <div className="flex items-center text-sm text-gray-700">
        <span className="hidden sm:inline">전체 </span>
        <span className="font-semibold text-gray-900 mx-1">{totalCount}</span>
        <span className="hidden sm:inline">개 중 </span>
        <span className="font-semibold text-gray-900 mx-1">{filteredCount}</span>
        <span className="hidden sm:inline">개 데이터,</span>
        <span className="inline sm:hidden mx-1">개 중</span>
        <span className="font-semibold text-gray-900 mx-1">
          {startItem}-{endItem}
        </span>
        <span className="hidden sm:inline">번 표시 중</span>
      </div>

      {/* 페이지 크기 선택 */}
      {onPageSizeChange && (
        <div className="mt-2 flex items-center text-sm sm:mt-0">
          <label htmlFor="pageSize" className="mr-2 text-gray-700">
            페이지당 행 수:
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={handlePageSizeChange}
            className="rounded border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 페이지 네비게이션 */}
      <nav className="mt-2 inline-flex sm:mt-0">
        <ul className="inline-flex -space-x-px text-sm">
          {/* 처음 페이지 */}
          <li>
            <button
              onClick={() => handlePageChange(0)}
              disabled={currentPage === 0}
              className={`ml-0 flex h-8 items-center justify-center rounded-l-lg border border-gray-300 bg-white px-3 leading-tight ${
                currentPage === 0
                  ? 'cursor-not-allowed text-gray-400'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              <ChevronDoubleLeftIcon className="h-4 w-4" />
            </button>
          </li>

          {/* 이전 페이지 */}
          <li>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className={`flex h-8 items-center justify-center border border-gray-300 bg-white px-3 leading-tight ${
                currentPage === 0
                  ? 'cursor-not-allowed text-gray-400'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
          </li>

          {/* 페이지 숫자 버튼 */}
          {pageRanges.map((pageIndex, i) =>
            pageIndex === -1 ? (
              // 생략 표시
              <li key={`ellipsis-${i}`}>
                <span className="flex h-8 items-center justify-center border border-gray-300 bg-white px-3 leading-tight text-gray-500">
                  ...
                </span>
              </li>
            ) : (
              // 페이지 버튼
              <li key={pageIndex}>
                <button
                  onClick={() => handlePageChange(pageIndex)}
                  className={`flex h-8 items-center justify-center border border-gray-300 px-3 leading-tight ${
                    currentPage === pageIndex
                      ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                >
                  {pageIndex + 1}
                </button>
              </li>
            )
          )}

          {/* 다음 페이지 */}
          <li>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= pageCount - 1}
              className={`flex h-8 items-center justify-center border border-gray-300 bg-white px-3 leading-tight ${
                currentPage >= pageCount - 1
                  ? 'cursor-not-allowed text-gray-400'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </li>

          {/* 마지막 페이지 */}
          <li>
            <button
              onClick={() => handlePageChange(pageCount - 1)}
              disabled={currentPage >= pageCount - 1}
              className={`flex h-8 items-center justify-center rounded-r-lg border border-gray-300 bg-white px-3 leading-tight ${
                currentPage >= pageCount - 1
                  ? 'cursor-not-allowed text-gray-400'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              <ChevronDoubleRightIcon className="h-4 w-4" />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
} 