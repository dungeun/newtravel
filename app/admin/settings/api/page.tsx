'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ApiSettingsPage() {
  const [settings, setSettings] = useState({
    apiKey: '',
    apiSecret: '',
    apiEndpoint: '',
    requestLimit: 1000,
    timeout: 30,
    retryCount: 3,
    webhookUrl: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 설정 저장 로직 구현
    console.log('API 설정 저장:', settings);
  };

  return (
    <DashboardLayout>
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-xl font-semibold text-gray-900">API 설정</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
              API 키
            </label>
            <input
              type="text"
              id="apiKey"
              value={settings.apiKey}
              onChange={e => setSettings({ ...settings, apiKey: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="apiSecret" className="block text-sm font-medium text-gray-700">
              API 시크릿
            </label>
            <input
              type="password"
              id="apiSecret"
              value={settings.apiSecret}
              onChange={e => setSettings({ ...settings, apiSecret: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="apiEndpoint" className="block text-sm font-medium text-gray-700">
              API 엔드포인트
            </label>
            <input
              type="url"
              id="apiEndpoint"
              value={settings.apiEndpoint}
              onChange={e => setSettings({ ...settings, apiEndpoint: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="requestLimit" className="block text-sm font-medium text-gray-700">
              요청 제한 (시간당)
            </label>
            <input
              type="number"
              id="requestLimit"
              value={settings.requestLimit}
              onChange={e => setSettings({ ...settings, requestLimit: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="timeout" className="block text-sm font-medium text-gray-700">
              타임아웃 (초)
            </label>
            <input
              type="number"
              id="timeout"
              value={settings.timeout}
              onChange={e => setSettings({ ...settings, timeout: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="retryCount" className="block text-sm font-medium text-gray-700">
              재시도 횟수
            </label>
            <input
              type="number"
              id="retryCount"
              value={settings.retryCount}
              onChange={e => setSettings({ ...settings, retryCount: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-700">
              웹훅 URL
            </label>
            <input
              type="url"
              id="webhookUrl"
              value={settings.webhookUrl}
              onChange={e => setSettings({ ...settings, webhookUrl: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              저장하기
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
