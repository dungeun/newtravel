import React from 'react';
import type { Metadata } from 'next';
import TravelHeader from './TravelHeader';

export const metadata: Metadata = {
  title: '여행 상품 플러그인 - 사용자',
  description: '여행 상품 예약 및 관리 시스템',
};

export default function TravelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 bg-[#14b8a6] py-4">
        <div className="container mx-auto px-4">
          <TravelHeader />
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 pb-8">
        {children}
      </main>
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} 여행 상품 플러그인. All rights reserved.
        </div>
      </footer>
    </div>
  );
} 