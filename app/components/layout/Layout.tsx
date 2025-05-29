'use client';

import React, { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import Footer from './Footer';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { settings, loading } = useSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="grow">{children}</main>
      <Footer
        siteName={settings.siteName}
        footerText={settings.footerText}
        footerLinks={settings.footerLinks}
        socialLinks={settings.socialLinks}
        contactEmail={settings.contactEmail}
        contactPhone={settings.contactPhone}
        address={settings.address}
        copyright={settings.copyright}
      />
    </div>
  );
}
