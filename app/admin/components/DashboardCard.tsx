'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  link?: string;
}

export function DashboardCard({ 
  title, 
  value, 
  icon, 
  change, 
  trend, 
  link 
}: DashboardCardProps) {
  const cardContent = (
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="mt-1 text-2xl font-semibold">{value}</h3>
          {change && (
            <div className="mt-1 flex items-center">
              {trend === 'up' && (
                <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              )}
              {trend === 'down' && (
                <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
              )}
              <span className={`text-xs font-medium ${
                trend === 'up' ? 'text-green-500' : 
                trend === 'down' ? 'text-red-500' : 'text-gray-500'
              }`}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div className="rounded-full bg-gray-100 p-3">
          {icon}
        </div>
      </div>
    </CardContent>
  );

  if (link) {
    return (
      <Link href={link} className="block transition-transform hover:scale-[1.02]">
        <Card className="overflow-hidden">
          {cardContent}
        </Card>
      </Link>
    );
  }

  return (
    <Card className="overflow-hidden">
      {cardContent}
    </Card>
  );
}
