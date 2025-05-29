'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ReportData, ReportChart } from './ReportChart';
import OrderStatsChart, { OrderStatsData } from './OrderStatsChart';

// 샘플 데이터 생성
const generateSampleData = (days: number): ReportData[] => {
  const data: ReportData[] = [];
  const now = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - i - 1));
    
    data.push({
      date: date.toISOString().split('T')[0],
      visitors: Math.floor(Math.random() * 500) + 100,
      pageViews: Math.floor(Math.random() * 1500) + 500,
      uniqueVisitors: Math.floor(Math.random() * 300) + 50,
      bounceRate: Math.random() * 50 + 10,
      avgSessionDuration: Math.floor(Math.random() * 300) + 30
    });
  }
  
  return data;
};

// 기간에 따른 주문/매출 mock 데이터 생성
const generateOrderStats = (days: number): OrderStatsData[] => {
  const data: OrderStatsData[] = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - i - 1));
    data.push({
      date: date.toISOString().split('T')[0],
      orderCount: Math.floor(Math.random() * 10) + 2,
      sales: Math.floor(Math.random() * 2000000) + 500000,
      cancelled: Math.floor(Math.random() * 3),
    });
  }
  return data;
};

/**
 * 분석 페이지
 */
export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [metrics, setMetrics] = useState<('visitors' | 'pageViews' | 'uniqueVisitors' | 'bounceRate' | 'avgSessionDuration')[]>(['visitors', 'pageViews']);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  // 기간에 따른 데이터 생성 (useMemo 사용하여 최적화)
  const [reportData, setReportData] = useState<ReportData[]>([]);
  
  // 기간에 따른 주문/매출 mock 데이터 생성
  const orderStatsData = React.useMemo(() => {
    let days = 7;
    if (period === 'day') days = 1;
    if (period === 'week') days = 7;
    if (period === 'month') days = 30;
    if (period === 'year') days = 12;
    return generateOrderStats(days);
  }, [period]);

  // 기간 변경 시 데이터 다시 생성
  useEffect(() => {
    let days = 7;
    
    switch (period) {
      case 'day':
        days = 24; // 시간별 (하루)
        break;
      case 'week':
        days = 7; // 일별 (1주)
        break;
      case 'month':
        days = 30; // 일별 (1달)
        break;
      case 'year':
        days = 12; // 월별 (1년)
        break;
    }
    
    setReportData(generateSampleData(days));
  }, [period]);

  // 기간 변경 핸들러
  const handlePeriodChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(e.target.value as 'day' | 'week' | 'month' | 'year');
  }, []);

  // 차트 타입 변경 핸들러 
  const handleChartTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setChartType(e.target.value as 'line' | 'bar');
  }, []);

  // 지표 변경 핸들러
  const handleMetricChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const metric = e.target.value as 'visitors' | 'pageViews' | 'uniqueVisitors' | 'bounceRate' | 'avgSessionDuration';
    
    setMetrics(prev => {
      if (e.target.checked) {
        return [...prev, metric];
      } else {
        return prev.filter(m => m !== metric);
      }
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-slate-800 dark:text-slate-100">분석 대시보드</h1>
        <p className="text-slate-500 dark:text-slate-400">웹사이트 통계 및 사용자 동향을 분석합니다.</p>
      </div>

      <div className="rounded-lg bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* 기간 선택 */}
          <div>
            <label htmlFor="period" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              기간
            </label>
            <select
              id="period"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 py-2 pl-3 pr-10 text-base text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              value={period}
              onChange={handlePeriodChange}
            >
              <option value="day">오늘 (시간별)</option>
              <option value="week">이번 주 (일별)</option>
              <option value="month">이번 달 (일별)</option>
              <option value="year">올해 (월별)</option>
            </select>
          </div>

          {/* 차트 타입 선택 */}
          <div>
            <label htmlFor="chartType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              차트 타입
            </label>
            <select
              id="chartType"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 py-2 pl-3 pr-10 text-base text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              value={chartType}
              onChange={handleChartTypeChange}
            >
              <option value="line">라인 차트</option>
              <option value="bar">바 차트</option>
            </select>
          </div>
          
          {/* 지표 선택 */}
          <div>
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">지표 선택</span>
            <div className="mt-2 flex flex-wrap gap-4">
              <label className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  className="text-blue-600"
                  value="visitors"
                  checked={metrics.includes('visitors')}
                  onChange={handleMetricChange}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">방문자</span>
              </label>
              <label className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  className="text-blue-600"
                  value="pageViews"
                  checked={metrics.includes('pageViews')}
                  onChange={handleMetricChange}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">페이지뷰</span>
              </label>
              <label className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  className="text-blue-600"
                  value="uniqueVisitors"
                  checked={metrics.includes('uniqueVisitors')}
                  onChange={handleMetricChange}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">순 방문자</span>
              </label>
              <label className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  className="text-blue-600"
                  value="bounceRate"
                  checked={metrics.includes('bounceRate')}
                  onChange={handleMetricChange}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">이탈률</span>
              </label>
              <label className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  className="text-blue-600"
                  value="avgSessionDuration"
                  checked={metrics.includes('avgSessionDuration')}
                  onChange={handleMetricChange}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">세션 시간</span>
              </label>
            </div>
          </div>
        </div>

        {/* 차트 */}
        <ReportChart
          data={reportData}
          period={period}
          metrics={metrics}
          title="방문자 통계"
          type={chartType}
        />
      </div>
    </div>
  );
} 