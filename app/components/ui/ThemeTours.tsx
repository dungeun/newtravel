'use client';

import Image from 'next/image';
import { FaHorse, FaCampground, FaCamera, FaUtensils } from 'react-icons/fa';

const themeTours = [
  {
    id: 1,
    title: '말타기 체험',
    icon: FaHorse,
    image: '/images/themes/horse-riding.jpg',
    description: '몽골의 전통 말타기를 체험하며 초원을 달려보세요',
  },
  {
    id: 2,
    title: '게르 캠핑',
    icon: FaCampground,
    image: '/images/themes/ger-camping.jpg',
    description: '전통 게르에서 하룻밤을 보내며 유목민의 삶을 체험해보세요',
  },
  {
    id: 3,
    title: '사진 투어',
    icon: FaCamera,
    image: '/images/themes/photo-tour.jpg',
    description: '아름다운 풍경과 일상을 카메라에 담아보세요',
  },
  {
    id: 4,
    title: '전통 음식 체험',
    icon: FaUtensils,
    image: '/images/themes/food-experience.jpg',
    description: '몽골의 전통 음식을 맛보고 요리법도 배워보세요',
  },
];

export default function ThemeTours() {
  return (
    <section className="py-12">
      <div className="container mx-auto">
        <h2 className="mb-8 text-center text-3xl font-bold">테마별 여행</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {themeTours.map(tour => {
            const Icon = tour.icon;
            return (
              <div
                key={tour.id}
                className="overflow-hidden rounded-lg bg-white shadow-lg transition-shadow hover:shadow-xl"
              >
                <div className="relative h-48">
                  <Image src={tour.image} alt={tour.title} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Icon className="text-xl text-blue-600" />
                    <h3 className="text-xl font-semibold">{tour.title}</h3>
                  </div>
                  <p className="mb-4 text-gray-600">{tour.description}</p>
                  <button className="w-full rounded bg-blue-600 py-2 text-white transition-colors hover:bg-blue-700">
                    자세히 보기
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
