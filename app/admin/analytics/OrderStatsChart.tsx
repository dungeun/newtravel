import React from 'react';

export interface OrderStatsData {
  date: string;
  orderCount: number;
  sales: number;
  cancelled: number;
}

type ChartType = 'bar' | 'line';

export interface OrderStatsChartProps {
  data: OrderStatsData[];
  period: 'day' | 'week' | 'month' | 'year';
  type?: ChartType;
}

export default function OrderStatsChart({ data, period, type = 'bar' }: OrderStatsChartProps) {
  // 최대값 계산 (Y축 스케일)
  const maxSales = Math.max(...data.map(d => d.sales), 1);
  const maxOrders = Math.max(...data.map(d => d.orderCount), 1);
  const maxCancelled = Math.max(...data.map(d => d.cancelled), 1);

  return (
    <div className="w-full">
      <h3 className="mb-2 text-lg font-bold">주문/매출 통계</h3>
      <div className="flex gap-2 text-xs text-gray-500 mb-2">
        <span>주문수(파랑)</span>
        <span>매출(초록)</span>
        <span>취소(빨강)</span>
      </div>
      <div className="flex items-end h-40 w-full gap-2 bg-gray-50 rounded p-2 overflow-x-auto">
        {data.map((d, i) => (
          <div key={d.date} className="flex flex-col items-center w-10 min-w-[2.5rem]">
            {/* 주문수 바 */}
            <div
              className="bg-blue-500 rounded-t"
              style={{ height: `${(d.orderCount / maxOrders) * 80}px`, width: '10px' }}
              title={`주문수: ${d.orderCount}`}
            />
            {/* 매출 바 */}
            <div
              className="bg-green-500 rounded-t mt-1"
              style={{ height: `${(d.sales / maxSales) * 80}px`, width: '10px' }}
              title={`매출: ${d.sales.toLocaleString()}원`}
            />
            {/* 취소 바 */}
            <div
              className="bg-red-400 rounded-t mt-1"
              style={{ height: `${(d.cancelled / maxCancelled) * 40}px`, width: '10px' }}
              title={`취소: ${d.cancelled}`}
            />
            <span className="mt-1 text-[10px] text-gray-600 truncate">{d.date.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 