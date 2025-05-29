'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import React from 'react';

const timeDeals = [
  {
    id: 1,
    title: '울란바토르 3박 4일 패키지',
    image: '/images/deals/ulaanbaatar-package.jpg',
    originalPrice: 1200000,
    discountPrice: 890000,
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24시간 후
  },
  {
    id: 2,
    title: '고비 사막 투어 특가',
    image: '/images/deals/gobi-tour.jpg',
    originalPrice: 1500000,
    discountPrice: 1190000,
    endTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48시간 후
  },
];

const calculateTimeLeft = (endTime: Date): string => {
  const now = new Date();
  const difference = endTime.getTime() - now.getTime();

  if (difference <= 0) {
    return '종료';
  }

  const hours = Math.floor(difference / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return `${hours}시간 ${minutes}분 ${seconds}초`;
};

const TimeDealCard = React.memo(({ deal, timeLeft }: { deal: typeof timeDeals[0], timeLeft: string }) => {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-lg">
      <div className="relative h-64">
        <Image src={deal.image} alt={deal.title} fill className="object-cover" />
      </div>
      <div className="p-6">
        <h3 className="mb-2 text-xl font-semibold">{deal.title}</h3>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <span className="text-gray-500 line-through">
              {deal.originalPrice.toLocaleString()}원
            </span>
            <span className="ml-2 text-2xl font-bold text-red-600">
              {deal.discountPrice.toLocaleString()}원
            </span>
          </div>
          <div className="text-sm font-semibold text-red-600">{timeLeft}</div>
        </div>
        <button className="w-full rounded-lg bg-blue-600 py-3 text-white transition-colors hover:bg-blue-700">
          예약하기
        </button>
      </div>
    </div>
  );
});

TimeDealCard.displayName = 'TimeDealCard';

function TimeDeals() {
  const [timeLeft, setTimeLeft] = useState<{ [key: number]: string }>({});

  const updateTimeLeft = useCallback(() => {
    const newTimeLeft: { [key: number]: string } = {};
    
    timeDeals.forEach(deal => {
      newTimeLeft[deal.id] = calculateTimeLeft(deal.endTime);
    });
    
    setTimeLeft(newTimeLeft);
  }, []);

  useEffect(() => {
    updateTimeLeft();
    
    const timer = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [updateTimeLeft]);

  const dealCards = useMemo(() => {
    return timeDeals.map(deal => (
      <TimeDealCard 
        key={deal.id} 
        deal={deal} 
        timeLeft={timeLeft[deal.id] || '계산 중...'}
      />
    ));
  }, [timeLeft]);

  return (
    <section className="bg-gray-100 py-12">
      <div className="container mx-auto">
        <h2 className="mb-8 text-center text-3xl font-bold">특가 상품</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {dealCards}
        </div>
      </div>
    </section>
  );
}

export default React.memo(TimeDeals);
