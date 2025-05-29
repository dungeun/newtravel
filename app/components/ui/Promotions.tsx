'use client';

import Image from 'next/image';

const promotions = [
  {
    id: 1,
    title: '여름 휴가 얼리버드',
    subtitle: '최대 30% 할인',
    image: '/images/promotions/summer-early-bird.jpg',
    description: '7-8월 성수기 여행을 미리 예약하시면 특별 할인!',
    validUntil: '2024-05-31',
  },
  {
    id: 2,
    title: '허니문 스페셜',
    subtitle: '커플 패키지 15% 할인',
    image: '/images/promotions/honeymoon-special.jpg',
    description: '신혼부부를 위한 로맨틱한 몽골 여행',
    validUntil: '2024-12-31',
  },
];

export default function Promotions() {
  return (
    <section className="bg-gray-50 py-12">
      <div className="container mx-auto">
        <h2 className="mb-8 text-center text-3xl font-bold">특별 프로모션</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {promotions.map(promo => (
            <div
              key={promo.id}
              className="overflow-hidden rounded-lg bg-white shadow-lg transition-shadow hover:shadow-xl"
            >
              <div className="relative h-64">
                <Image src={promo.image} alt={promo.title} fill className="object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="text-center text-white">
                    <h3 className="mb-2 text-2xl font-bold">{promo.title}</h3>
                    <p className="text-xl">{promo.subtitle}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="mb-4 text-gray-600">{promo.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">유효기간: {promo.validUntil}</span>
                  <button className="rounded bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700">
                    예약하기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
