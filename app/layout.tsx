import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from './ClientLayout';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: '초원로드 - 초원의별 | 당신의 특별한 몽골 여행을 위한 최고의 선택',
  description: '몽골 여행의 모든 것, 초원로드와 함께하세요.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-inter min-h-screen bg-background antialiased">
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
