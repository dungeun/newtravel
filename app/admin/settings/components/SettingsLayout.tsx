'use client';

import SettingsSidebar from './SettingsSidebar';

interface SettingsLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function SettingsLayout({ children, title }: SettingsLayoutProps) {
  return (
    <div className="flex h-full">
      <SettingsSidebar />
      <div className="flex-1 p-6">
        <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm">
          <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
} 