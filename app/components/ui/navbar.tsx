import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface NavItem {
  href: string;
  label: string;
  active?: boolean;
  icon?: React.ReactNode;
}

interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  items?: NavItem[];
  rightItems?: React.ReactNode;
  variant?: 'default' | 'transparent' | 'subtle';
  size?: 'default' | 'sm' | 'lg';
  mobileMenuButton?: React.ReactNode;
}

export function Navbar({
  className,
  logo,
  items = [],
  rightItems,
  variant = 'default',
  size = 'default',
  mobileMenuButton,
  ...props
}: NavbarProps) {
  const variants = {
    default: 'bg-white border-b shadow-sm',
    transparent: 'bg-transparent',
    subtle: 'bg-slate-50/80 backdrop-blur-sm'
  };

  const sizes = {
    default: 'h-16',
    sm: 'h-12',
    lg: 'h-20'
  };

  return (
    <header
      className={cn(
        variants[variant],
        sizes[size],
        'sticky top-0 z-50 w-full',
        className
      )}
      {...props}
    >
      <div className="container mx-auto flex h-full items-center justify-between px-4">
        {/* 로고 영역 */}
        <div className="flex items-center">
          {logo}
        </div>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden items-center gap-6 md:flex">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors',
                item.active 
                  ? 'text-primary' 
                  : 'text-gray-700 hover:text-primary'
              )}
            >
              <div className="flex items-center gap-2">
                {item.icon && <span>{item.icon}</span>}
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        {/* 오른쪽 아이템 영역 (검색, 로그인 등) */}
        <div className="hidden items-center gap-2 md:flex">
          {rightItems}
        </div>

        {/* 모바일 메뉴 버튼 */}
        <div className="flex md:hidden">
          {mobileMenuButton}
        </div>
      </div>
    </header>
  );
}

// 검색 바 컴포넌트
interface NavbarSearchProps extends React.HTMLAttributes<HTMLFormElement> {
  placeholder?: string;
  buttonText?: string;
}

export function NavbarSearch({
  className,
  placeholder = '검색어를 입력하세요...',
  buttonText = '검색',
  ...props
}: NavbarSearchProps) {
  return (
    <form className={cn('flex w-full max-w-xs items-center', className)} {...props}>
      <div className="relative flex-1">
        <input
          type="text"
          placeholder={placeholder}
          className="flex h-9 w-full rounded-l-md border border-r-0 border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
      <Button type="submit" size="sm" className="rounded-l-none">
        {buttonText}
      </Button>
    </form>
  );
}

// 모바일 메뉴 버튼 컴포넌트
export function NavbarMobileMenuButton({ 
  onClick 
}: { 
  onClick: () => void 
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      aria-label="메뉴 열기"
      className="p-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
        <line x1="4" x2="20" y1="12" y2="12" />
        <line x1="4" x2="20" y1="6" y2="6" />
        <line x1="4" x2="20" y1="18" y2="18" />
      </svg>
    </Button>
  );
} 