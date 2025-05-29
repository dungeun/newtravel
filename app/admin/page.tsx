'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { AdminPageLayout } from './components/AdminPageLayout';
import { DashboardCard } from './components/DashboardCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { 
  ShoppingCart, 
  CreditCard, 
  Ticket, 
  Bell, 
  Send, 
  Package, 
  Users,
  BarChart,
  Calendar
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    orders: 0,
    products: 0,
    users: 0,
    revenue: 0,
    notifications: 0,
    pushAds: 0
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 주문 수 가져오기
        const ordersQuery = query(collection(db, 'orders'));
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersCount = ordersSnapshot.size;
        
        // 상품 수 가져오기
        const productsQuery = query(collection(db, 'travel_products'));
        const productsSnapshot = await getDocs(productsQuery);
        const productsCount = productsSnapshot.size;
        
        // 사용자 수 가져오기
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const usersCount = usersSnapshot.size;
        
        // 알림 수 가져오기
        const notificationsQuery = query(collection(db, 'notifications'));
        const notificationsSnapshot = await getDocs(notificationsQuery);
        const notificationsCount = notificationsSnapshot.size;
        
        // 푸시 광고 수 가져오기
        const pushAdsQuery = query(collection(db, 'push_ads'));
        const pushAdsSnapshot = await getDocs(pushAdsQuery);
        const pushAdsCount = pushAdsSnapshot.size;
        
        // 매출 계산 (간단한 예시)
        let totalRevenue = 0;
        ordersSnapshot.forEach(doc => {
          const orderData = doc.data();
          if (orderData.totalAmount) {
            totalRevenue += orderData.totalAmount;
          }
        });
        
        setStats({
          orders: ordersCount,
          products: productsCount,
          users: usersCount,
          revenue: totalRevenue,
          notifications: notificationsCount,
          pushAds: pushAdsCount
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const dashboardStats = [
    {
      title: '총 주문',
      value: loading ? '-' : stats.orders.toString(),
      icon: <ShoppingCart className="h-8 w-8 text-blue-500" />,
      change: '+5',
      trend: 'up' as const,
      link: '/admin/orders'
    },
    {
      title: '총 매출',
      value: loading ? '-' : `₩${stats.revenue.toLocaleString()}`,
      icon: <CreditCard className="h-8 w-8 text-green-500" />,
      change: '+12%',
      trend: 'up' as const,
      link: '/admin/sales'
    },
    {
      title: '활성 상품',
      value: loading ? '-' : stats.products.toString(),
      icon: <Package className="h-8 w-8 text-purple-500" />,
      change: '+2',
      trend: 'up' as const,
      link: '/admin/travel'
    },
    {
      title: '발행 쿠폰',
      value: '15',
      icon: <Ticket className="h-8 w-8 text-yellow-500" />,
      change: '-1',
      trend: 'down' as const,
      link: '/admin/coupons'
    },
    {
      title: '등록 알림',
      value: loading ? '-' : stats.notifications.toString(),
      icon: <Bell className="h-8 w-8 text-blue-400" />,
      link: '/admin/notifications'
    },
    {
      title: 'PWA 광고',
      value: loading ? '-' : stats.pushAds.toString(),
      icon: <Send className="h-8 w-8 text-indigo-500" />,
      link: '/admin/push-ads'
    },
    {
      title: '사용자',
      value: loading ? '-' : stats.users.toString(),
      icon: <Users className="h-8 w-8 text-gray-500" />,
      change: '+8',
      trend: 'up' as const,
      link: '/admin/users'
    },
    {
      title: '예약 일정',
      value: '다음 7일',
      icon: <Calendar className="h-8 w-8 text-red-500" />,
      link: '/admin/calendar'
    }
  ];
  
  return (
    <AdminPageLayout
      title="관리자 대시보드"
      description="여행 상품 관리 시스템의 관리자 대시보드입니다."
    >
      {/* 대시보드 통계 카드 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <DashboardCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
            trend={stat.trend}
            link={stat.link}
          />
        ))}
      </div>
      
      {/* 최근 주문 및 활동 */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              최근 주문
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 rounded-full"></div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>최근 주문 정보를 불러오는 중입니다...</p>
                <Link href="/admin/orders" className="text-blue-500 hover:underline mt-2 inline-block">
                  모든 주문 보기
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="mr-2 h-5 w-5" />
              매출 추이
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 rounded-full"></div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>매출 차트를 불러오는 중입니다...</p>
                <Link href="/admin/sales" className="text-blue-500 hover:underline mt-2 inline-block">
                  상세 매출 보기
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  );
}
