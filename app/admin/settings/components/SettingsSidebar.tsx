'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Cog6ToothIcon, 
  BellIcon, 
  ShieldCheckIcon, 
  ComputerDesktopIcon,
  ServerIcon,
} from '@heroicons/react/24/outline';

/**
 * 설정 페이지 사이드바 컴포넌트
 */
export default function SettingsSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const menuItemClass = (isActive: boolean) => `
    flex items-center px-4 py-3 text-sm font-medium rounded-md mb-1
    ${isActive 
      ? 'bg-primary/10 text-primary dark:bg-primary/20' 
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-slate-100'
    }
  `;

  const iconClass = 'w-5 h-5 mr-3';

  return (
    <div className="min-w-[240px] p-4 border-r border-slate-200 dark:border-slate-800 h-full">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">설정</h2>
      <nav className="flex flex-col">
        <Link
          href="/admin/settings/basic"
          className={menuItemClass(isActive('/admin/settings/basic'))}
        >
          <Cog6ToothIcon className={iconClass} />
          <span>기본 설정</span>
        </Link>
        <Link
          href="/admin/settings/admin"
          className={menuItemClass(isActive('/admin/settings/admin'))}
        >
          <ShieldCheckIcon className={iconClass} />
          <span>관리자 설정</span>
        </Link>
        <Link
          href="/admin/settings/system"
          className={menuItemClass(isActive('/admin/settings/system'))}
        >
          <ComputerDesktopIcon className={iconClass} />
          <span>시스템 설정</span>
        </Link>
        <Link
          href="/admin/settings/notification"
          className={menuItemClass(isActive('/admin/settings/notification'))}
        >
          <BellIcon className={iconClass} />
          <span>알림 설정</span>
        </Link>
        <Link
          href="/admin/settings/api"
          className={menuItemClass(isActive('/admin/settings/api'))}
        >
          <ServerIcon className={iconClass} />
          <span>API 설정</span>
        </Link>
      </nav>
    </div>
  );
} 