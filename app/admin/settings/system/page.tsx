'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import SettingsLayout from '../components/SettingsLayout';

interface SystemSettings {
  // 캐시 설정
  enableCache: boolean;
  cacheDuration: number;
  
  // 백업 설정
  enableAutoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupTime: string;
  backupRetention: number;
  
  // 로깅 설정
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  logRetention: number;
  
  // 성능 설정
  maxUploadSize: number;
  maxRequestsPerMinute: number;
  
  // 유지보수
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    enableCache: true,
    cacheDuration: 60,
    enableAutoBackup: true,
    backupFrequency: 'daily',
    backupTime: '00:00',
    backupRetention: 30,
    logLevel: 'info',
    logRetention: 90,
    maxUploadSize: 10,
    maxRequestsPerMinute: 100,
    maintenanceMode: false,
    maintenanceMessage: '유지보수 중입니다. 잠시 후 다시 시도해주세요.',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'system'));
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as SystemSettings);
      }
    } catch (error) {
      console.error('시스템 설정을 불러오는 중 오류 발생:', error);
      setSaveMessage('시스템 설정을 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSaveMessage('');

    try {
      await setDoc(doc(db, 'settings', 'system'), settings);
      setSaveMessage('시스템 설정이 저장되었습니다.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('시스템 설정 저장 중 오류 발생:', error);
      setSaveMessage('시스템 설정 저장 중 오류가 발생했습니다.');
    }

    setIsLoading(false);
  };

  return (
    <SettingsLayout title="시스템 설정">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 캐시 설정 */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">캐시 설정</h2>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="enableCache"
                checked={settings.enableCache}
                onChange={e => setSettings({ ...settings, enableCache: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <label htmlFor="enableCache" className="ml-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                캐시 활성화
              </label>
            </div>

            <div>
              <label htmlFor="cacheDuration" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                캐시 유지 시간 (분)
              </label>
              <input
                type="number"
                id="cacheDuration"
                value={settings.cacheDuration}
                onChange={e => setSettings({ ...settings, cacheDuration: parseInt(e.target.value) })}
                min={0}
                className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </section>

        {/* 백업 설정 */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">백업 설정</h2>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="enableAutoBackup"
                checked={settings.enableAutoBackup}
                onChange={e => setSettings({ ...settings, enableAutoBackup: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <label htmlFor="enableAutoBackup" className="ml-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                자동 백업 활성화
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="backupFrequency" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  백업 주기
                </label>
                <select
                  id="backupFrequency"
                  value={settings.backupFrequency}
                  onChange={e => setSettings({ ...settings, backupFrequency: e.target.value as 'daily' | 'weekly' | 'monthly' })}
                  className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="daily">매일</option>
                  <option value="weekly">매주</option>
                  <option value="monthly">매월</option>
                </select>
              </div>

              <div>
                <label htmlFor="backupTime" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  백업 시간
                </label>
                <input
                  type="time"
                  id="backupTime"
                  value={settings.backupTime}
                  onChange={e => setSettings({ ...settings, backupTime: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="backupRetention" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  백업 보존 기간 (일)
                </label>
                <input
                  type="number"
                  id="backupRetention"
                  value={settings.backupRetention}
                  onChange={e => setSettings({ ...settings, backupRetention: parseInt(e.target.value) })}
                  min={1}
                  className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 로깅 설정 */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">로깅 설정</h2>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="logLevel" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  로그 수준
                </label>
                <select
                  id="logLevel"
                  value={settings.logLevel}
                  onChange={e => setSettings({ ...settings, logLevel: e.target.value as 'debug' | 'info' | 'warn' | 'error' })}
                  className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="debug">Debug</option>
                  <option value="info">Info</option>
                  <option value="warn">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <div>
                <label htmlFor="logRetention" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  로그 보존 기간 (일)
                </label>
                <input
                  type="number"
                  id="logRetention"
                  value={settings.logRetention}
                  onChange={e => setSettings({ ...settings, logRetention: parseInt(e.target.value) })}
                  min={1}
                  className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 성능 설정 */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">성능 설정</h2>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="maxUploadSize" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  최대 업로드 크기 (MB)
                </label>
                <input
                  type="number"
                  id="maxUploadSize"
                  value={settings.maxUploadSize}
                  onChange={e => setSettings({ ...settings, maxUploadSize: parseInt(e.target.value) })}
                  min={1}
                  className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="maxRequestsPerMinute" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  분당 최대 요청 수
                </label>
                <input
                  type="number"
                  id="maxRequestsPerMinute"
                  value={settings.maxRequestsPerMinute}
                  onChange={e => setSettings({ ...settings, maxRequestsPerMinute: parseInt(e.target.value) })}
                  min={1}
                  className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 유지보수 설정 */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">유지보수 모드</h2>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <label htmlFor="maintenanceMode" className="ml-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                유지보수 모드 활성화
              </label>
            </div>

            <div>
              <label htmlFor="maintenanceMessage" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                유지보수 메시지
              </label>
              <textarea
                id="maintenanceMessage"
                value={settings.maintenanceMessage}
                onChange={e => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                rows={3}
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
