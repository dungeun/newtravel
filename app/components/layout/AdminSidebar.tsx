'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UsersIcon,
  UserPlusIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Bars3Icon,
  XMarkIcon,
  DocumentTextIcon,
  PhotoIcon,
  BellIcon,
  ShieldCheckIcon,
  ComputerDesktopIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  SwatchIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(true);
  const [isBoardsOpen, setIsBoardsOpen] = useState(true);
  const [isDesignOpen, setIsDesignOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleMenuToggle = (menu: string) => {
    switch (menu) {
      case 'users':
        setIsUsersOpen(!isUsersOpen);
        break;
      case 'boards':
        setIsBoardsOpen(!isBoardsOpen);
        break;
      case 'design':
        setIsDesignOpen(!isDesignOpen);
        break;
      case 'settings':
        setIsSettingsOpen(!isSettingsOpen);
        break;
    }
  };

  const menuItemClass = (isActive: boolean) => `
    flex items-center px-4 py-2 text-sm font-medium rounded-md
    ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
  `;

  const iconClass = 'w-5 h-5 mr-3';

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300 ease-in-out${isSidebarCollapsed ? 'w-16' : 'w-64'}`}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-end border-b px-4">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="rounded-md p-2 hover:bg-gray-100"
          >
            {isSidebarCollapsed ? (
              <Bars3Icon className="size-5" />
            ) : (
              <XMarkIcon className="size-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {/* Dashboard */}
          <Link href="/admin" className={menuItemClass(isActive('/admin'))}>
            <HomeIcon className={iconClass} />
            {!isSidebarCollapsed && <span>대시보드</span>}
          </Link>

          {/* User Management */}
          <div>
            <button
              onClick={() => handleMenuToggle('users')}
              className={`flex w-full items-center justify-between rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900`}
            >
              <div className="flex items-center">
                <UserGroupIcon className={iconClass} />
                {!isSidebarCollapsed && <span>사용자 관리</span>}
              </div>
              {!isSidebarCollapsed &&
                (isUsersOpen ? (
                  <ChevronUpIcon className="size-4" />
                ) : (
                  <ChevronDownIcon className="size-4" />
                ))}
            </button>
            {isUsersOpen && !isSidebarCollapsed && (
              <div className="mt-1 space-y-1">
                <Link
                  href="/admin/users/members"
                  className={menuItemClass(isActive('/admin/users/members'))}
                >
                  <UserPlusIcon className={iconClass} />
                  <span>회원 목록</span>
                </Link>
                <Link
                  href="/admin/users/admins"
                  className={menuItemClass(isActive('/admin/users/admins'))}
                >
                  <UsersIcon className={iconClass} />
                  <span>관리자 관리</span>
                </Link>
              </div>
            )}
          </div>

          {/* Board Management */}
          <div>
            <button
              onClick={() => handleMenuToggle('boards')}
              className={`flex w-full items-center justify-between rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900`}
            >
              <div className="flex items-center">
                <ClipboardDocumentListIcon className={iconClass} />
                {!isSidebarCollapsed && <span>게시판 관리</span>}
              </div>
              {!isSidebarCollapsed &&
                (isBoardsOpen ? (
                  <ChevronUpIcon className="size-4" />
                ) : (
                  <ChevronDownIcon className="size-4" />
                ))}
            </button>
            {isBoardsOpen && !isSidebarCollapsed && (
              <div className="mt-1 space-y-1">
                <Link
                  href="/admin/boards/list"
                  className={menuItemClass(isActive('/admin/boards/list'))}
                >
                  <DocumentTextIcon className={iconClass} />
                  <span>전체 게시판</span>
                </Link>
                <Link
                  href="/admin/boards/settings"
                  className={menuItemClass(isActive('/admin/boards/settings'))}
                >
                  <WrenchScrewdriverIcon className={iconClass} />
                  <span>게시판 설정</span>
                </Link>
              </div>
            )}
          </div>

          {/* Travel Product Management */}
          <Link href="/admin/travel" className={menuItemClass(isActive('/admin/travel'))}>
            <GlobeAltIcon className={iconClass} />
            {!isSidebarCollapsed && <span>여행 상품 관리</span>}
          </Link>

          {/* Design Management */}
          <div>
            <button
              onClick={() => handleMenuToggle('design')}
              className={`flex w-full items-center justify-between rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900`}
            >
              <div className="flex items-center">
                <PaintBrushIcon className={iconClass} />
                {!isSidebarCollapsed && <span>디자인 관리</span>}
              </div>
              {!isSidebarCollapsed &&
                (isDesignOpen ? (
                  <ChevronUpIcon className="size-4" />
                ) : (
                  <ChevronDownIcon className="size-4" />
                ))}
            </button>
            {isDesignOpen && !isSidebarCollapsed && (
              <div className="mt-1 space-y-1">
                <Link
                  href="/admin/design/templates"
                  className={menuItemClass(isActive('/admin/design/templates'))}
                >
                  <SwatchIcon className={iconClass} />
                  <span>템플릿 관리</span>
                </Link>
                <Link
                  href="/admin/design/images"
                  className={menuItemClass(isActive('/admin/design/images'))}
                >
                  <PhotoIcon className={iconClass} />
                  <span>이미지 관리</span>
                </Link>
              </div>
            )}
          </div>

          {/* Settings */}
          <div>
            <button
              onClick={() => handleMenuToggle('settings')}
              className={`flex w-full items-center justify-between rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900`}
            >
              <div className="flex items-center">
                <Cog6ToothIcon className={iconClass} />
                {!isSidebarCollapsed && <span>설정</span>}
              </div>
              {!isSidebarCollapsed &&
                (isSettingsOpen ? (
                  <ChevronUpIcon className="size-4" />
                ) : (
                  <ChevronDownIcon className="size-4" />
                ))}
            </button>
            {isSettingsOpen && !isSidebarCollapsed && (
              <div className="mt-1 space-y-1">
                <Link
                  href="/admin/settings/basic"
                  className={menuItemClass(isActive('/admin/settings/basic'))}
                >
                  <Cog6ToothIcon className={iconClass} />
                  <span>기본 설정</span>
                </Link>
                <Link
                  href="/admin/settings/notification"
                  className={menuItemClass(isActive('/admin/settings/notification'))}
                >
                  <BellIcon className={iconClass} />
                  <span>알림 설정</span>
                </Link>
                <Link
                  href="/admin/settings/security"
                  className={menuItemClass(isActive('/admin/settings/security'))}
                >
                  <ShieldCheckIcon className={iconClass} />
                  <span>보안 설정</span>
                </Link>
                <Link
                  href="/admin/settings/system"
                  className={menuItemClass(isActive('/admin/settings/system'))}
                >
                  <ComputerDesktopIcon className={iconClass} />
                  <span>시스템 설정</span>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
}
