'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShoppingCart, 
  Ticket, 
  Bell, 
  Send, 
  Home, 
  Package, 
  Settings,
  Users,
  BarChart,
  Palette,
  Star,
  FileText
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
}

interface AdminNavigationProps {
  isDarkMode?: boolean;
}

export function AdminNavigation({ isDarkMode = false }: AdminNavigationProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    // 대시보드 및 통계
    {
      title: '대시보드',
      href: '/admin',
      icon: <Home className="h-5 w-5" />,
      description: '관리자 대시보드'
    },
    {
      title: '매출 관리',
      href: '/admin/sales',
      icon: <BarChart className="h-5 w-5" />,
      description: '매출 및 통계'
    },
    
    // 주문 및 상품 관리
    {
      title: '주문 관리',
      href: '/admin/orders',
      icon: <ShoppingCart className="h-5 w-5" />,
      description: '주문 및 예약 관리'
    },
    {
      title: '상품 관리',
      href: '/admin/travel',
      icon: <Package className="h-5 w-5" />,
      description: '여행 상품 관리'
    },
    {
      title: '리뷰 관리',
      href: '/admin/reviews',
      icon: <Star className="h-5 w-5" />,
      description: '상품 리뷰 관리'
    },
    
    // 마케팅 관리
    {
      title: '쿠폰 관리',
      href: '/admin/coupons',
      icon: <Ticket className="h-5 w-5" />,
      description: '쿠폰 및 프로모션'
    },
    {
      title: 'PWA 광고 발송',
      href: '/admin/push-ads',
      icon: <Send className="h-5 w-5" />,
      description: '푸시 알림 광고'
    },
    {
      title: '알림 및 소식',
      href: '/admin/notifications',
      icon: <Bell className="h-5 w-5" />,
      description: '알림 및 소식 관리'
    },
    
    // 디자인 및 콘텐츠 관리
    {
      title: '디자인 관리',
      href: '/admin/design',
      icon: <Palette className="h-5 w-5" />,
      description: '사이트 디자인 관리'
    },
    {
      title: '콘텐츠 관리',
      href: '/admin/content',
      icon: <FileText className="h-5 w-5" />,
      description: '사이트 콘텐츠 관리'
    },
    
    // 시스템 관리
    {
      title: '사용자 관리',
      href: '/admin/users',
      icon: <Users className="h-5 w-5" />,
      description: '사용자 계정 관리'
    },
    {
      title: '설정',
      href: '/admin/settings',
      icon: <Settings className="h-5 w-5" />,
      description: '시스템 설정'
    }
  ];

  const isActive = (href: string) => {
    if (href === '/admin' && pathname === '/admin') {
      return true;
    }
    return href !== '/admin' && pathname.startsWith(href);
  };

  return (
    <div className={`h-screen w-60 fixed left-0 top-0 overflow-y-auto ${isDarkMode ? 'bg-gray-800 border-r border-gray-700' : 'bg-white border-r border-gray-200'}`}>
      <div className="p-6">
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>여행 관리자</h1>
      </div>
      
      <nav className="mt-2 px-3 pb-6">
        {/* 대시보드 및 통계 */}
        <div className="mb-4">
          <h3 className={`px-3 text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            대시보드 및 통계
          </h3>
          <ul className="mt-2 space-y-1">
            {navItems.slice(0, 2).map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={`flex items-center px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-[#14b8a6] text-white'
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {/* 주문 및 상품 관리 */}
        <div className="mb-4">
          <h3 className={`px-3 text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            주문 및 상품
          </h3>
          <ul className="mt-2 space-y-1">
            {navItems.slice(2, 5).map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={`flex items-center px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-[#14b8a6] text-white'
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {/* 마케팅 관리 */}
        <div className="mb-4">
          <h3 className={`px-3 text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            마케팅
          </h3>
          <ul className="mt-2 space-y-1">
            {navItems.slice(5, 8).map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={`flex items-center px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-[#14b8a6] text-white'
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {/* 디자인 및 콘텐츠 */}
        <div className="mb-4">
          <h3 className={`px-3 text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            디자인 및 콘텐츠
          </h3>
          <ul className="mt-2 space-y-1">
            {navItems.slice(8, 10).map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={`flex items-center px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-[#14b8a6] text-white'
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {/* 시스템 */}
        <div className="mb-4">
          <h3 className={`px-3 text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            시스템
          </h3>
          <ul className="mt-2 space-y-1">
            {navItems.slice(10).map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={`flex items-center px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-[#14b8a6] text-white'
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      
      <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center">
              <div className={`p-4 border rounded-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}> 
            A
          </div>
          <div className="ml-3">
            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>관리자</p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
