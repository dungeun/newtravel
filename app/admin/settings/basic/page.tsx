'use client';

import React, { useState, useEffect } from 'react';
import ImageUpload from '@/components/common/ImageUpload';
import { db, storage } from '@/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import SettingsLayout from '../components/SettingsLayout';

// URL 정규식 패턴
const URL_PATTERN = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

interface SiteSettings {
  // 기본 정보
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;

  // SEO 설정
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  faviconUrl: string;

  // 푸터 설정
  footerText: string;
  footerLinks: {
    text: string;
    url: string;
  }[];
  copyrightText: string;

  // 소셜 미디어
  socialLinks: {
    platform: string;
    url: string;
  }[];
}

export default function BasicSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: '',
    siteDescription: '',
    siteUrl: '',
    adminEmail: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ogImage: '',
    faviconUrl: '',
    footerText: '',
    footerLinks: [],
    copyrightText: '',
    socialLinks: [],
  });

  const [newFooterLink, setNewFooterLink] = useState({ text: '', url: '' });
  const [newSocialLink, setNewSocialLink] = useState({ platform: '', url: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'site'));
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as SiteSettings);
      }
    } catch (error) {
      console.error('설정을 불러오는 중 오류 발생:', error);
    }
  };

  const handleImageUpload = async (file: File, type: 'favicon' | 'ogImage') => {
    try {
      const storageRef = ref(storage, `site/${type}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      setSettings(prev => ({
        ...prev,
        [type === 'favicon' ? 'faviconUrl' : 'ogImage']: url,
      }));
    } catch (error) {
      console.error('이미지 업로드 중 오류 발생:', error);
    }
  };

  // URL 형식 검증 및 변환 함수
  const formatUrl = (url: string): string => {
    if (!url) return '';

    // URL에서 앞뒤 공백 제거
    url = url.trim();

    // 이미 http:// 또는 https://로 시작하는 경우
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // www.로 시작하거나 도메인으로 시작하는 경우 https:// 추가
    return `https://${url}`;
  };

  // URL 입력 처리 함수
  const handleUrlChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'site' | 'footer' | 'social',
    index?: number
  ) => {
    const value = e.target.value;

    switch (type) {
      case 'site':
        setSettings(prev => ({
          ...prev,
          siteUrl: value,
        }));
        break;

      case 'footer':
        if (index !== undefined) {
          const newFooterLinks = [...settings.footerLinks];
          newFooterLinks[index] = {
            ...newFooterLinks[index],
            url: value,
          };
          setSettings(prev => ({
            ...prev,
            footerLinks: newFooterLinks,
          }));
        } else {
          setNewFooterLink(prev => ({
            ...prev,
            url: value,
          }));
        }
        break;

      case 'social':
        if (index !== undefined) {
          const newSocialLinks = [...settings.socialLinks];
          newSocialLinks[index] = {
            ...newSocialLinks[index],
            url: value,
          };
          setSettings(prev => ({
            ...prev,
            socialLinks: newSocialLinks,
          }));
        } else {
          setNewSocialLink(prev => ({
            ...prev,
            url: value,
          }));
        }
        break;
    }
  };

  // 설정 저장 전 URL 형식 변환
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 모든 URL 형식 변환
      const formattedSettings = {
        ...settings,
        siteUrl: formatUrl(settings.siteUrl),
        footerLinks: settings.footerLinks.map(link => ({
          ...link,
          url: formatUrl(link.url),
        })),
        socialLinks: settings.socialLinks.map(link => ({
          ...link,
          url: formatUrl(link.url),
        })),
      };

      // Firestore에 저장
      await setDoc(doc(db, 'settings', 'site'), formattedSettings);

      // 변환된 설정을 상태에 반영
      setSettings(formattedSettings);

      setSaveMessage('설정이 저장되었습니다.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('설정 저장 중 오류 발생:', error);
      setSaveMessage('설정 저장 중 오류가 발생했습니다.');
    }

    setIsLoading(false);
  };

  // 푸터 링크 추가
  const addFooterLink = () => {
    if (newFooterLink.text && newFooterLink.url) {
      setSettings(prev => ({
        ...prev,
        footerLinks: [
          ...prev.footerLinks,
          {
            text: newFooterLink.text,
            url: formatUrl(newFooterLink.url),
          },
        ],
      }));
      setNewFooterLink({ text: '', url: '' });
    }
  };

  // 소셜 링크 추가
  const addSocialLink = () => {
    if (newSocialLink.platform && newSocialLink.url) {
      setSettings(prev => ({
        ...prev,
        socialLinks: [
          ...prev.socialLinks,
          {
            platform: newSocialLink.platform,
            url: formatUrl(newSocialLink.url),
          },
        ],
      }));
      setNewSocialLink({ platform: '', url: '' });
    }
  };

  return (
    <SettingsLayout title="기본 설정">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 기본 정보 섹션 */}
        <section className="space-y-6">
          <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">기본 정보</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="siteName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                사이트 이름
              </label>
              <input
                type="text"
                id="siteName"
                value={settings.siteName}
                onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="adminEmail" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                관리자 이메일
              </label>
              <input
                type="email"
                id="adminEmail"
                value={settings.adminEmail}
                onChange={e => setSettings({ ...settings, adminEmail: e.target.value })}
                className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="siteDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                사이트 설명
              </label>
              <textarea
                id="siteDescription"
                rows={3}
                value={settings.siteDescription}
                onChange={e => setSettings({ ...settings, siteDescription: e.target.value })}
                className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="siteUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                사이트 URL
              </label>
              <input
                type="text"
                id="siteUrl"
                value={settings.siteUrl}
                onChange={e => handleUrlChange(e, 'site')}
                placeholder="https://example.com"
                className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </section>

        {/* SEO 설정 섹션 */}
        <section className="space-y-6">
          <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">SEO 설정</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="metaTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                메타 제목
              </label>
              <input
                type="text"
                id="metaTitle"
                value={settings.metaTitle}
                onChange={e => setSettings({ ...settings, metaTitle: e.target.value })}
                className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="metaKeywords" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                메타 키워드 (콤마로 구분)
              </label>
              <input
                type="text"
                id="metaKeywords"
                value={settings.metaKeywords}
                onChange={e => setSettings({ ...settings, metaKeywords: e.target.value })}
                className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="metaDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                메타 설명
              </label>
              <textarea
                id="metaDescription"
                rows={3}
                value={settings.metaDescription}
                onChange={e => setSettings({ ...settings, metaDescription: e.target.value })}
                className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </section>

        {/* 저장 버튼 */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          {saveMessage && (
            <p className={`text-sm ${saveMessage.includes('오류') ? 'text-red-500' : 'text-green-500'}`}>
              {saveMessage}
            </p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? '저장 중...' : '설정 저장'}
          </button>
        </div>
      </form>
    </SettingsLayout>
  );
}
