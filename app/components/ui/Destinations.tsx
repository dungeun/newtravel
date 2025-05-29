'use client';

import Image from 'next/image';

const destinations = [
  {
    id: 1,
    name: '울란바토르',
    image: '/images/destinations/ulaanbaatar.jpg',
    description: '몽골의 수도, 현대와 전통이 공존하는 도시',
  },
  {
    id: 2,
    name: '고비 사막',
    image: '/images/destinations/gobi.jpg',
    description: '광활한 사막과 모험이 기다리는 곳',
  },
  {
    id: 3,
    name: '테를지',
    image: '/images/destinations/terelj.jpg',
    description: '아름다운 초원과 유목민의 삶을 경험할 수 있는 국립공원',
  },
  {
    id: 4,
    name: '카라코룸',
    image: '/images/destinations/karakorum.jpg',
    description: '몽골 제국의 옛 수도, 역사적인 유적지',
  },
];

export default function Destinations() {
  return (
    <section className="py-12">
      <h2 className="mb-8 text-center text-3xl font-bold">인기 여행지</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {destinations.map(destination => (
          <div
            key={destination.id}
            className="overflow-hidden rounded-lg bg-white shadow-lg transition-shadow hover:shadow-xl"
          >
            <div className="relative h-48">
              <Image src={destination.image} alt={destination.name} fill className="object-cover" />
            </div>
            <div className="p-4">
              <h3 className="mb-2 text-xl font-semibold">{destination.name}</h3>
              <p className="text-gray-600">{destination.description}</p>
              <button className="mt-4 w-full rounded bg-blue-600 py-2 text-white transition-colors hover:bg-blue-700">
                자세히 보기
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
