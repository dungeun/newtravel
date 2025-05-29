'use client';

import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header siteName="월급루팡" onSidebarOpen={() => setSidebarOpen(true)} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      <Footer
        siteName="월급루팡"
        footerText="월급루팡 - 돈버는 직장인 커뮤니티"
        footerLinks={[]}
        socialLinks={[]}
        contactEmail=""
        contactPhone=""
        address=""
        copyright="© 2025 월급루팡. All rights reserved."
      />
    </div>
  );
}
