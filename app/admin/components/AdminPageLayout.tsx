'use client';

import React, { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { AdminNavigation } from './AdminNavigation';
import { useTheme } from '@/contexts/ThemeContext';

interface AdminPageLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}

/**
 * 어드민 페이지 공통 레이아웃 컴포넌트
 * 
 * 모든 어드민 페이지에서 일관된 디자인을 위해 사용
 */
export function AdminPageLayout({ 
  children, 
  title, 
  description, 
  actions 
}: AdminPageLayoutProps) {
  // 테마 컨텍스트 사용
  const { currentTheme } = useTheme();
  
  // 다크모드 여부 확인
  const isDarkMode = currentTheme.name.toLowerCase().includes('다크') || 
                    currentTheme.name.toLowerCase().includes('dark');
  
  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <AdminNavigation isDarkMode={isDarkMode} />
      
      <div className="flex-1 ml-60"> {/* 네비게이션 너비만큼 마진 조정 */}
        <div className="container p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{title}</h1>
              {description && (
                <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-muted-foreground'}`}>{description}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 어드민 섹션 컴포넌트
 * 
 * 어드민 페이지 내에서 섹션을 구분하기 위해 사용
 */
export function AdminSection({ 
  children, 
  title, 
  description 
}: { 
  children: ReactNode; 
  title?: string; 
  description?: string;
}) {
  // 테마 컨텍스트 사용
  const { currentTheme } = useTheme();
  
  // 다크모드 여부 확인
  const isDarkMode = currentTheme.name.toLowerCase().includes('다크') || 
                    currentTheme.name.toLowerCase().includes('dark');
  
  return (
    <Card className={`overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
      {(title || description) && (
        <div className={`px-6 py-4 ${isDarkMode ? 'border-gray-700' : 'border-b'}`}>
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {description && (
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-muted-foreground'}`}>{description}</p>
          )}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </Card>
  );
}
