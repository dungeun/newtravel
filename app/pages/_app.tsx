import React from 'react';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { gothicA1 } from '../styles/fonts';
import '../styles/globals.css';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <div className={`${gothicA1.variable} font-gothic`}>
        <Component {...pageProps} />
      </div>
    </SessionProvider>
  );
}
