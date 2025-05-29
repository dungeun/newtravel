'use client';

import { SessionProvider } from 'next-auth/react';
import { PropsWithChildren } from 'react';
import ReactQueryProvider from '@/components/providers/ReactQueryProvider';
import { Toaster } from '@/components/ui/toaster';

export default function Providers({ children }: PropsWithChildren) {
  return (
    <SessionProvider>
      <ReactQueryProvider>
        {children}
        <Toaster />
      </ReactQueryProvider>
    </SessionProvider>
  );
}
