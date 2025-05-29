'use client';

import React from 'react';
import Link from 'next/link';
import {
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  UserGroupIcon,
  PaintBrushIcon,
  ChartBarIcon,
  UsersIcon,
  UserPlusIcon,
  ListBulletIcon,
  WrenchScrewdriverIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import { logger } from '@/lib/logging';

/**
 * Dashboard Navigation Props
 */
interface DashboardNavProps {
  isActive: (path: string) => boolean;
  isSidebarCollapsed: boolean;
  isUsersOpen: boolean;
  isBoardsOpen: boolean;
  isDesignOpen: boolean;
  isSettingsOpen: boolean;
  handleMenuToggle: (menu: 'design' | 'settings' | 'users' | 'boards') => void;
}

/**
 * 대시보드 네비게이션 컴포넌트
 * 대시보드의 메뉴 항목들을 렌더링합니다.
 */
function DashboardNav({
  isActive,
  isSidebarCollapsed,
  isUsersOpen,
  isBoardsOpen,
  isDesignOpen,
  isSettingsOpen,
  handleMenuToggle,
}: DashboardNavProps) {
  // 아이콘 크기 계산
  const iconClass = isSidebarCollapsed ? 'size-8' : 'mr-3 size-5';
  
  // 성능 측정 시작
  const startTime = typeof performance !== 'undefined' ? performance.now() : 0;

  React.useEffect(() => {
    if (typeof performance === 'undefined') return;
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    if (renderTime > 10) {
      // 10ms 이상만 로깅
      if (typeof logger !== 'undefined' && logger.performance) {
        logger.performance('DashboardNav Render Time', renderTime, {
          component: 'DashboardNav',
        });
      } else {
        console.log('[PERF] DashboardNav Render Time:', renderTime, 'ms');
      }
    }
  }, [isSidebarCollapsed, isUsersOpen, isBoardsOpen, isDesignOpen, isSettingsOpen]);

  const menuItemClass = (isActive: boolean) => `
    flex items-center rounded-md px-3 py-2 text-sm font-medium
    ${isActive 
      ? 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white' 
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
    }
  `;

  return (
    <nav className="flex-1 space-y-1 px-2 py-4">
      {/* 대시보드 */}
      <Link
        href="/dashboard"
        className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
          isActive('/dashboard')
            ? 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
        }`}
      >
        <ChartBarIcon className={iconClass} />
        {!isSidebarCollapsed && <span>대시보드</span>}
      </Link>

      {/* 사용자 관리 */}
      <div>
        <button
          type="button"
          className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium ${
            isActive('/users')
              ? 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
          }`}
          onClick={() => handleMenuToggle('users')}
        >
          <div className="flex items-center">
            <UserGroupIcon className={iconClass} />
            {!isSidebarCollapsed && <span>사용자 관리</span>}
          </div>
          {!isSidebarCollapsed && (
            <ChevronDownIcon
              className={`size-4 transition-transform ${isUsersOpen ? 'rotate-180' : ''}`}
            />
          )}
        </button>
        
        {isUsersOpen && !isSidebarCollapsed && (
          <div className="mt-1 space-y-1 pl-4">
            <Link
              href="/users/list"
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                isActive('/users/list')
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              <UsersIcon className="mr-3 size-4" />
              <span>사용자 목록</span>
            </Link>
            <Link
              href="/users/add"
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                isActive('/users/add')
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              <UserPlusIcon className="mr-3 size-4" />
              <span>사용자 추가</span>
            </Link>
          </div>
        )}
      </div>

      {/* 게시판 관리 */}
      <div>
        <button
          type="button"
          className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium ${
            isActive('/boards')
              ? 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
          }`}
          onClick={() => handleMenuToggle('boards')}
        >
          <div className="flex items-center">
            <ClipboardDocumentListIcon className={iconClass} />
            {!isSidebarCollapsed && <span>게시판 관리</span>}
          </div>
          {!isSidebarCollapsed && (
            <ChevronDownIcon
              className={`size-4 transition-transform ${isBoardsOpen ? 'rotate-180' : ''}`}
            />
          )}
        </button>
        
        {isBoardsOpen && !isSidebarCollapsed && (
          <div className="mt-1 space-y-1 pl-4">
            <Link
              href="/boards/list"
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                isActive('/boards/list')
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              <ListBulletIcon className="mr-3 size-4" />
              <span>게시판 목록</span>
            </Link>
            <Link
              href="/boards/categories"
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                isActive('/boards/categories')
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              <PaperAirplaneIcon className="mr-3 size-4" />
              <span>카테고리 관리</span>
            </Link>
          </div>
        )}
      </div>

      {/* 디자인 관리 */}
      <div>
        <button
          type="button"
          className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium ${
            isActive('/design')
              ? 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
          }`}
          onClick={() => handleMenuToggle('design')}
        >
          <div className="flex items-center">
            <PaintBrushIcon className={iconClass} />
            {!isSidebarCollapsed && <span>디자인 관리</span>}
          </div>
          {!isSidebarCollapsed && (
            <ChevronDownIcon
              className={`size-4 transition-transform ${isDesignOpen ? 'rotate-180' : ''}`}
            />
          )}
        </button>
        
        {isDesignOpen && !isSidebarCollapsed && (
          <div className="mt-1 space-y-1 pl-4">
            <Link
              href="/design/themes"
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                isActive('/design/themes')
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              <PaintBrushIcon className="mr-3 size-4" />
              <span>테마 설정</span>
            </Link>
          </div>
        )}
      </div>

      {/* 시스템 설정 */}
      <div>
        <button
          type="button"
          className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium ${
            isActive('/settings')
              ? 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
          }`}
          onClick={() => handleMenuToggle('settings')}
        >
          <div className="flex items-center">
            <Cog6ToothIcon className={iconClass} />
            {!isSidebarCollapsed && <span>시스템 설정</span>}
          </div>
          {!isSidebarCollapsed && (
            <ChevronDownIcon
              className={`size-4 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`}
            />
          )}
        </button>
        
        {isSettingsOpen && !isSidebarCollapsed && (
          <div className="mt-1 space-y-1 pl-4">
            <Link
              href="/admin/settings"
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                isActive('/admin/settings')
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              <Cog6ToothIcon className="mr-3 size-4" />
              <span>일반 설정</span>
            </Link>
            <Link
              href="/admin/settings/basic"
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                isActive('/admin/settings/basic')
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              <Cog6ToothIcon className="mr-3 size-4" />
              <span>기본 설정</span>
            </Link>
            <Link
              href="/admin/settings/admin"
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                isActive('/admin/settings/admin')
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              <WrenchScrewdriverIcon className="mr-3 size-4" />
              <span>관리자 설정</span>
            </Link>
            <Link
              href="/admin/settings/system"
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                isActive('/admin/settings/system')
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              <WrenchScrewdriverIcon className="mr-3 size-4" />
              <span>시스템 설정</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

// 메모이제이션하여 불필요한 리렌더링 방지
export default React.memo(DashboardNav); 