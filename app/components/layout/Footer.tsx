'use client';

import React from 'react';

interface FooterProps {
  siteName: string;
  footerText: string;
  footerLinks: {
    name: string;
    url: string;
  }[];
  socialLinks: {
    platform: string;
    url: string;
  }[];
  contactEmail: string;
  contactPhone: string;
  address: string;
  copyright: string;
}

export default function Footer({ footerText, copyright }: FooterProps) {
  return (
    <footer className="bg-gray-800 py-6 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm text-gray-300">
            {footerText} | © 2025 월급루팡-돈버는 직장인. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
