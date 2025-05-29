'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SettingsProvider } from './contexts/SettingsContext';
import ReactQueryProvider from './components/providers/ReactQueryProvider';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false
      }
    }
  }));

  return (
    <ReactQueryProvider>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <NextThemesProvider attribute="class" defaultTheme="light" enableSystem>
            <CustomThemeProvider>
              <SettingsProvider>{children}</SettingsProvider>
              <Toaster />
            </CustomThemeProvider>
          </NextThemesProvider>
        </SessionProvider>
      </QueryClientProvider>
    </ReactQueryProvider>
  );
}

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
