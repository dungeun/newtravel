'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import * as Tabs from '@radix-ui/react-tabs';
import { User, Receipt, Loader2 } from 'lucide-react';

interface MyPageLayoutProps {
  children: React.ReactNode;
}

export default function MyPageLayout({ children }: MyPageLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    // 로그인하지 않은 사용자는 로그인 페이지로 리디렉션
    if (!loading && !user) {
      router.push('/auth/signin?redirect=/mypage');
    }
  }, [user, loading, router]);

  // 현재 경로에 따라 활성 탭 설정
  useEffect(() => {
    if (pathname === '/mypage') {
      setActiveTab('orders');
    } else if (pathname.includes('/mypage/profile')) {
      setActiveTab('profile');
    }
  }, [pathname]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="flex items-center">
            <span className="text-lg font-medium mr-2">로딩 중...</span>
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">로그인이 필요합니다</h1>
        <p className="text-gray-500 mb-6">마이 페이지를 이용하려면 로그인이 필요합니다.</p>
        
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-lg font-medium mb-4">로그인</h2>
          <p className="text-gray-500 text-sm mb-4">계정이 있으신가요?</p>
          <Link 
            href="/auth/signin?redirect=/mypage"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">마이 페이지</h1>
      <p className="text-gray-500 mb-6">주문 내역 확인 및 개인 정보 관리</p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-medium">{user.name || '사용자'}</h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
            
            <Tabs.Root 
              value={activeTab} 
              orientation="vertical"
              className="w-full"
            >
              <Tabs.List className="flex flex-col w-full" aria-label="마이 페이지 탭">
                <Link href="/mypage" passHref>
                  <Tabs.Trigger 
                    value="orders" 
                    className={`flex items-center px-4 py-3 text-left ${activeTab === 'orders' ? 'bg-gray-100 border-l-4 border-primary font-medium' : 'hover:bg-gray-50'}`}
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    주문 내역
                  </Tabs.Trigger>
                </Link>
                
                <Link href="/mypage/profile" passHref>
                  <Tabs.Trigger 
                    value="profile" 
                    className={`flex items-center px-4 py-3 text-left ${activeTab === 'profile' ? 'bg-gray-100 border-l-4 border-primary font-medium' : 'hover:bg-gray-50'}`}
                  >
                    <User className="h-4 w-4 mr-2" />
                    내 정보 관리
                  </Tabs.Trigger>
                </Link>
              </Tabs.List>
            </Tabs.Root>
          </div>
        </div>
        
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
