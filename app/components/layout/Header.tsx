'use client';

import React from 'react';
import Link from 'next/link';
import { Bars3Icon } from '@heroicons/react/24/outline';

interface HeaderProps {
  siteName: string;
  onSidebarOpen: () => void;
}

export default function Header({ siteName, onSidebarOpen }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="-mb-px flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-black">
              {siteName}
            </Link>
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center p-2.5 text-gray-700 lg:hidden"
              onClick={onSidebarOpen}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="size-6 text-black" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
