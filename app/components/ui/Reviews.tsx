'use client';

import Image from 'next/image';
import { FaStar } from 'react-icons/fa';

const reviews = [
  {
    id: 1,
    name: '김서연',
    avatar: '/images/avatars/user1.jpg',
    rating: 5,
    date: '2024-03-15',
    text: '게르에서의 하룻밤은 정말 특별한 경험이었어요. 밤하늘의 별들이 잊을 수 없네요.',
    tourName: '게르 캠핑 체험',
  },
  {
    id: 2,
    name: '이준호',
    avatar: '/images/avatars/user2.jpg',
    rating: 5,
    date: '2024-03-10',
    text: '말타기 체험이 하이라이트였습니다. 가이드님도 친절하시고 안전하게 잘 진행됐어요.',
    tourName: '초원 말타기 투어',
  },
  {
    id: 3,
    name: '박민지',
    avatar: '/images/avatars/user3.jpg',
    rating: 4,
    date: '2024-03-05',
    text: '고비 사막 투어는 정말 환상적이었습니다. 사막에서의 일출은 평생 잊지 못할 것 같아요.',
    tourName: '고비 사막 투어',
  },
];

export default function Reviews() {
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <FaStar key={index} className={index < rating ? 'text-yellow-400' : 'text-gray-300'} />
      ));
  };

  return (
    <section className="py-12">
      <div className="container mx-auto">
        <h2 className="mb-8 text-center text-3xl font-bold">여행후기</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map(review => (
            <div key={review.id} className="rounded-lg bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center">
                <div className="relative mr-4 size-12">
                  <Image
                    src={review.avatar}
                    alt={review.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{review.name}</h3>
                  <p className="text-sm text-gray-500">{review.date}</p>
                </div>
              </div>
              <div className="mb-2 flex items-center">{renderStars(review.rating)}</div>
              <p className="mb-2 text-gray-600">{review.text}</p>
              <p className="text-sm text-blue-600">{review.tourName}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
