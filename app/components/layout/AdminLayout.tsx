'use client';

import React from 'react';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="ml-64">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
