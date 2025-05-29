'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteKeywords: string;
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

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  error: string | null;
}

const defaultSettings: SiteSettings = {
  siteName: '기본 사이트 이름',
  siteDescription: '기본 사이트 설명',
  siteKeywords: '기본, 키워드',
  footerText: '기본 푸터 텍스트',
  footerLinks: [
    { name: '홈', url: '/' },
    { name: '소개', url: '/about' },
    { name: '연락처', url: '/contact' },
  ],
  socialLinks: [
    { platform: 'Facebook', url: 'https://facebook.com' },
    { platform: 'Twitter', url: 'https://twitter.com' },
    { platform: 'Instagram', url: 'https://instagram.com' },
  ],
  contactEmail: 'contact@example.com',
  contactPhone: '02-123-4567',
  address: '서울특별시 강남구 테헤란로 123',
  copyright: '© 2024 기본 사이트. All rights reserved.',
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  error: null,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const settingsRef = doc(db, 'settings', 'site');

    const unsubscribe = onSnapshot(
      settingsRef,
      doc => {
        if (doc.exists()) {
          const data = doc.data() as SiteSettings;
          setSettings({
            ...defaultSettings,
            ...data,
          });
        }
        setLoading(false);
      },
      err => {
        console.error('설정 데이터를 불러오는 중 오류 발생:', err);
        setError('설정을 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, error }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
