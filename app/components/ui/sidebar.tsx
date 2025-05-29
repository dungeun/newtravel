import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  href: string;
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  external?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

interface SidebarSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'compact' | 'bordered';
  collapsible?: boolean;
  collapsed?: boolean;
  onCollapseToggle?: () => void;
}

export function Sidebar({
  children,
  className,
  variant = 'default',
  collapsible = false,
  collapsed = false,
  onCollapseToggle,
  ...props
}: SidebarProps) {
  const variants = {
    default: 'bg-white border-r min-h-screen',
    compact: 'bg-white border-r w-16 min-h-screen',
    bordered: 'bg-white border-r border-border rounded-lg min-h-[calc(100vh-3rem)] m-4',
  };

  return (
    <aside
      className={cn(
        variants[variant],
        collapsible && 'transition-all duration-300',
        collapsible && collapsed && 'w-16',
        className
      )}
      {...props}
    >
      {collapsible && (
        <div className="flex justify-end px-2 py-2">
          <button
            onClick={onCollapseToggle}
            className="rounded-md p-1 hover:bg-accent"
            aria-label={collapsed ? '사이드바 확장' : '사이드바 축소'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                'size-4 transition-transform',
                collapsed ? 'rotate-0' : 'rotate-180'
              )}
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        </div>
      )}
      {children}
    </aside>
  );
}

export function SidebarSection({
  title,
  children,
  className,
}: SidebarSectionProps) {
  return (
    <div className={cn('py-4', className)}>
      {title && (
        <h3 className="px-4 text-xs font-medium uppercase text-muted-foreground">
          {title}
        </h3>
      )}
      <nav className="mt-2 space-y-1 px-2">{children}</nav>
    </div>
  );
}

export function SidebarItem({
  href,
  label,
  icon,
  active = false,
  external = false,
  disabled = false,
  children,
}: SidebarItemProps) {
  const itemContent = (
    <div
      className={cn(
        'flex items-center rounded-md px-3 py-2 text-sm transition-colors',
        active
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        disabled && 'pointer-events-none opacity-50'
      )}
    >
      {icon && <span className="mr-2">{icon}</span>}
      <span className="truncate">{label}</span>
      {external && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-auto size-3.5"
        >
          <path d="M7 7h10v10" />
          <path d="M7 17 17 7" />
        </svg>
      )}
    </div>
  );

  if (disabled) {
    return <div className="cursor-not-allowed">{itemContent}</div>;
  }

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {itemContent}
      </a>
    );
  }

  return (
    <Link href={href}>
      {itemContent}
      {children}
    </Link>
  );
} 