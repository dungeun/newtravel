'use client';

import React from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useDashboardState } from './useDashboardState';
import DashboardNav from './DashboardNav';
import DashboardAuth from './DashboardAuth';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { logger } from '@/lib/logging';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * 토글 버튼 컴포넌트 (메모이제이션)
 */
const SidebarToggle = React.memo(({ 
  isSidebarCollapsed, 
  toggleSidebar 
}: { 
  isSidebarCollapsed: boolean; 
  toggleSidebar: () => void;
}) => {
  return (
    <div className="flex h-16 items-center justify-center border-b border-slate-200 dark:border-slate-800">
      <button
        onClick={toggleSidebar}
        className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label={isSidebarCollapsed ? '사이드바 확장' : '사이드바 축소'}
      >
        <Bars3Icon
          className={`text-slate-600 dark:text-slate-300 ${isSidebarCollapsed ? 'size-8' : 'size-6'}`}
        />
      </button>
    </div>
  );
});

SidebarToggle.displayName = 'SidebarToggle';

/**
 * 대시보드 레이아웃 컴포넌트
 * 대시보드의 전체 레이아웃 구조를 담당합니다.
 */
function DashboardLayout({ children }: DashboardLayoutProps) {
  // 대시보드 상태 관리 훅 사용
  const {
    isSidebarCollapsed,
    isDesignOpen,
    isSettingsOpen,
    isUsersOpen,
    isBoardsOpen,
    toggleSidebar,
    handleMenuToggle,
    isActive,
  } = useDashboardState();

  // 컴포넌트 렌더링 로깅
  logger.flow('DashboardLayout', '대시보드 레이아웃 렌더링', {
    isSidebarCollapsed,
    menuStates: { isDesignOpen, isSettingsOpen, isUsersOpen, isBoardsOpen }
  });

  return (
    <DashboardAuth>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
        {/* 사이드바 */}
        <div
          className={`fixed inset-y-0 left-0 ${
            isSidebarCollapsed ? 'w-16' : 'w-64'
          } z-10 bg-white dark:bg-slate-800 shadow-lg transition-all duration-300`}
        >
          <div className="flex h-full flex-col">
            {/* 토글 버튼 */}
            <SidebarToggle 
              isSidebarCollapsed={isSidebarCollapsed} 
              toggleSidebar={toggleSidebar} 
            />

            {/* 네비게이션 메뉴 */}
            <DashboardNav
              isActive={isActive}
              isSidebarCollapsed={isSidebarCollapsed}
              isUsersOpen={isUsersOpen}
              isBoardsOpen={isBoardsOpen}
              isDesignOpen={isDesignOpen}
              isSettingsOpen={isSettingsOpen}
              handleMenuToggle={handleMenuToggle}
            />
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div
          className={`flex-1 ${
            isSidebarCollapsed ? 'pl-16' : 'pl-64'
          } transition-all duration-300`}
        >
          {/* 헤더 (theme toggle 추가) */}
          <div className="sticky top-0 z-10 flex h-16 items-center justify-end border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-800">
            <ThemeToggle />
          </div>
          
          <main className="p-6">{children}</main>
        </div>
      </div>
    </DashboardAuth>
  );
}

export default React.memo(DashboardLayout); 