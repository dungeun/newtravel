'use client';

import React, { useState } from 'react';
import { AdminHeader } from './components/AdminHeader';
import { Providers } from '../providers';
import { usePathname } from 'next/navigation';
import { 
  Cog6ToothIcon, 
  ShieldCheckIcon, 
  ComputerDesktopIcon,
  ServerIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarDaysIcon,
  TagIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  PaintBrushIcon,
  ChartBarIcon,
  BellIcon,
  ShoppingCartIcon,
  BanknotesIcon,
  TicketIcon
} from '@heroicons/react/24/outline';

// 메타데이터는 metadata.ts 파일에서 정의됨

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(pathname?.startsWith('/admin/settings'));
  const [isTravelOpen, setIsTravelOpen] = useState(pathname?.startsWith('/admin/travel'));
  
  return (
    <Providers>
      <div className="flex min-h-screen flex-col">
        <AdminHeader />
        <div className="flex flex-1">
          {/* 사이드바 네비게이션 */}
          <nav className="w-64 border-r bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 shadow-lg">
            <div className="p-4">
              <ul className="space-y-2">
                {/* 회원/관리자 관리 */}
                <li>
                  <a href="/admin/users" className="flex items-center gap-2 rounded-md p-2 font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary group">
                    <span className="w-2 h-2 rounded-full bg-primary/60 group-hover:bg-primary"></span>
                    <UserGroupIcon className="h-5 w-5 mr-1" />
                    회원/관리자 관리
                  </a>
                </li>
                
                {/* 게시판/문의 */}
                <li>
                  <a href="/admin/boards" className="flex items-center gap-2 rounded-md p-2 font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary group">
                    <span className="w-2 h-2 rounded-full bg-primary/60 group-hover:bg-primary"></span>
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-1" />
                    게시판/문의
                  </a>
                </li>
                
                {/* 디자인 관리 */}
                <li>
                  <a href="/admin/design" className="flex items-center gap-2 rounded-md p-2 font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary group">
                    <span className="w-2 h-2 rounded-full bg-primary/60 group-hover:bg-primary"></span>
                    <PaintBrushIcon className="h-5 w-5 mr-1" />
                    디자인 관리
                  </a>
                </li>
                
                {/* 여행 상품 관리 */}
                <li>
                  <div className="mb-1">
                    <button 
                      onClick={() => setIsTravelOpen(!isTravelOpen)}
                      className={`flex w-full items-center justify-between rounded-md p-2 font-medium transition-colors ${pathname?.startsWith('/admin/travel') ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary'} group`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary/60 group-hover:bg-primary"></span>
                        <ShoppingBagIcon className="h-5 w-5 mr-1" />
                        여행 상품 관리
                      </div>
                      {isTravelOpen ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {isTravelOpen && (
                    <div className="ml-4 pl-2 border-l border-slate-300 dark:border-slate-700 space-y-1">
                      <a 
                        href="/admin/travel" 
                        className={`flex items-center gap-2 rounded-md p-2 text-sm font-medium transition-colors ${pathname === '/admin/travel' ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 hover:text-primary'}`}
                      >
                        <ShoppingBagIcon className="h-4 w-4" />
                        <span>여행 전체상품</span>
                      </a>
                      <a 
                        href="/admin/travel/categories" 
                        className={`flex items-center gap-2 rounded-md p-2 text-sm font-medium transition-colors ${pathname === '/admin/travel/categories' ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 hover:text-primary'}`}
                      >
                        <TagIcon className="h-4 w-4" />
                        <span>여행 카테고리</span>
                      </a>
                      <a 
                        href="/admin/travel/day" 
                        className={`flex items-center gap-2 rounded-md p-2 text-sm font-medium transition-colors ${pathname === '/admin/travel/day' ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 hover:text-primary'}`}
                      >
                        <CalendarDaysIcon className="h-4 w-4" />
                        <span>여행 날짜설정</span>
                      </a>
                    </div>
                  )}
                </li>
                
                {/* 통계/리포트 */}
                <li>
                  <a href="/admin/analytics" className="flex items-center gap-2 rounded-md p-2 font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary group">
                    <span className="w-2 h-2 rounded-full bg-primary/60 group-hover:bg-primary"></span>
                    <ChartBarIcon className="h-5 w-5 mr-1" />
                    통계/리포트
                  </a>
                </li>
                
                {/* 알림/소식 */}
                <li>
                  <a href="/admin/notifications" className="flex items-center gap-2 rounded-md p-2 font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary group">
                    <span className="w-2 h-2 rounded-full bg-primary/60 group-hover:bg-primary"></span>
                    <BellIcon className="h-5 w-5 mr-1" />
                    알림/소식
                  </a>
                </li>
                
                {/* 주문관리 */}
                <li>
                  <a href="/admin/orders" className="flex items-center gap-2 rounded-md p-2 font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary group">
                    <span className="w-2 h-2 rounded-full bg-primary/60 group-hover:bg-primary"></span>
                    <ShoppingCartIcon className="h-5 w-5 mr-1" />
                    주문관리
                  </a>
                </li>
                
                {/* 매출관리 */}
                <li>
                  <a href="/admin/sales" className="flex items-center gap-2 rounded-md p-2 font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary group">
                    <span className="w-2 h-2 rounded-full bg-primary/60 group-hover:bg-primary"></span>
                    <BanknotesIcon className="h-5 w-5 mr-1" />
                    매출관리
                  </a>
                </li>
                
                {/* 쿠폰관리 */}
                <li>
                  <a href="/admin/coupons" className="flex items-center gap-2 rounded-md p-2 font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary group">
                    <span className="w-2 h-2 rounded-full bg-primary/60 group-hover:bg-primary"></span>
                    <TicketIcon className="h-5 w-5 mr-1" />
                    쿠폰관리
                  </a>
                </li>
                
                {/* 스타일 가이드 */}
                <li>
                  <a href="/admin/styleguide" className="flex items-center gap-2 rounded-md p-2 font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary group">
                    <span className="w-2 h-2 rounded-full bg-primary/60 group-hover:bg-primary"></span>
                    <PaintBrushIcon className="h-5 w-5 mr-1" />
                    스타일 가이드
                  </a>
                </li>
                
                {/* 설정 */}
                <li>
                  <div className="mb-1">
                    <button 
                      onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                      className={`flex w-full items-center justify-between rounded-md p-2 font-medium transition-colors ${pathname?.startsWith('/admin/settings') ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary'} group`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary/60 group-hover:bg-primary"></span>
                        <Cog6ToothIcon className="h-5 w-5 mr-1" />
                        설정
                      </div>
                      {isSettingsOpen ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {isSettingsOpen && (
                    <div className="ml-4 pl-2 border-l border-slate-300 dark:border-slate-700 space-y-1">
                      <a 
                        href="/admin/settings/basic" 
                        className={`flex items-center gap-2 rounded-md p-2 text-sm font-medium transition-colors ${pathname === '/admin/settings/basic' ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 hover:text-primary'}`}
                      >
                        <Cog6ToothIcon className="h-4 w-4" />
                        <span>기본 설정</span>
                      </a>
                      <a 
                        href="/admin/settings/admin" 
                        className={`flex items-center gap-2 rounded-md p-2 text-sm font-medium transition-colors ${pathname === '/admin/settings/admin' ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 hover:text-primary'}`}
                      >
                        <ShieldCheckIcon className="h-4 w-4" />
                        <span>관리자 설정</span>
                      </a>
                      <a 
                        href="/admin/settings/system" 
                        className={`flex items-center gap-2 rounded-md p-2 text-sm font-medium transition-colors ${pathname === '/admin/settings/system' ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 hover:text-primary'}`}
                      >
                        <ComputerDesktopIcon className="h-4 w-4" />
                        <span>시스템 설정</span>
                      </a>
                      <a 
                        href="/admin/settings/api" 
                        className={`flex items-center gap-2 rounded-md p-2 text-sm font-medium transition-colors ${pathname === '/admin/settings/api' ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 hover:text-primary'}`}
                      >
                        <ServerIcon className="h-4 w-4" />
                        <span>API 설정</span>
                      </a>
                    </div>
                  )}
                </li>
              </ul>
            </div>
          </nav>
          {/* 메인 컨텐츠 */}
          <main className="flex-1 p-6 bg-white dark:bg-slate-900">
            {children}
          </main>
        </div>
        <footer className="border-t py-3 bg-white dark:bg-slate-900 dark:border-slate-800">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} 여행 상품 플러그인 관리자. All rights reserved.
          </div>
        </footer>
      </div>
    </Providers>
  );
}
