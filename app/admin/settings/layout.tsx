'use client';

import React from 'react';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full">
      <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}
