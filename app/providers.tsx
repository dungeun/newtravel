'use client';

import React, { useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SettingsProvider } from './contexts/SettingsContext';
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
        staleTime: 5 * 60 * 1000, // 5분
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <NextThemesProvider attribute="class" defaultTheme="light" enableSystem>
          <CustomThemeProvider>
            <SettingsProvider>
              {children}
              <Toaster />
              <ReactQueryDevtools initialIsOpen={false} />
            </SettingsProvider>
          </CustomThemeProvider>
        </NextThemesProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
