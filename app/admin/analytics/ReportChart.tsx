import React from 'react';
// import type { ReportChartProps } from './ReportChart';
import { logger } from '@/lib/logging';

// Report 데이터 타입
export interface ReportData {
  date: string;
  visitors: number;
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
}

type ChartType = 'line' | 'bar';

export interface ReportChartProps {
  data: ReportData[];
  period: 'day' | 'week' | 'month' | 'year';
  metrics: ('visitors' | 'pageViews' | 'uniqueVisitors' | 'bounceRate' | 'avgSessionDuration')[];
  title?: string;
  type?: ChartType;
}

export function ReportChart(props: ReportChartProps) {
  // 성능 측정 시작
  const startTime = typeof performance !== 'undefined' ? performance.now() : 0;

  React.useEffect(() => {
    if (typeof performance === 'undefined') return;
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    if (renderTime > 10) {
      if (typeof logger !== 'undefined' && logger.performance) {
        logger.performance('ReportChart Render Time', renderTime, {
          component: 'ReportChart',
        });
      } else {
        console.log('[PERF] ReportChart Render Time:', renderTime, 'ms');
      }
    }
  }, [props.data, props.metrics, props.type, props.period]);

  // 임시 차트 UI (실제 차트 라이브러리로 교체 가능)
  return (
    <div className="w-full">
      <h3 className="mb-2 text-lg font-bold">{props.title || '방문자 통계'}</h3>
      <div className="flex gap-2 text-xs text-gray-500 mb-2">
        {props.metrics.map(m => (
          <span key={m}>{m}</span>
        ))}
      </div>
      <div className="flex items-end h-40 w-full gap-2 bg-gray-50 rounded p-2 overflow-x-auto">
        {props.data.map((d, i) => (
          <div key={d.date} className="flex flex-col items-center w-10 min-w-[2.5rem]">
            {props.metrics.map((m, j) => (
              <div
                key={m}
                className={
                  m === 'visitors' ? 'bg-blue-500' :
                  m === 'pageViews' ? 'bg-green-500' :
                  m === 'uniqueVisitors' ? 'bg-purple-500' :
                  m === 'bounceRate' ? 'bg-red-400' :
                  'bg-yellow-400'
                }
                style={{ height: `${((d as any)[m] / 500) * 60}px`, width: '10px', marginTop: j > 0 ? '2px' : 0 }}
                title={`${m}: ${(d as any)[m]}`}
              />
            ))}
            <span className="mt-1 text-[10px] text-gray-600 truncate">{d.date.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 