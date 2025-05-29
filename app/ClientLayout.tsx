"use client";

import { SessionProvider } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
} 