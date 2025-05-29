'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Utensils,
  Bed,
  Plane,
  Bus,
  Train,
  Ship,
} from 'lucide-react';

interface TravelProduct {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
  };
  // 여행 상품 특화 필드
  departureDate: Date;
  returnDate: Date;
  price: number;
  maxParticipants: number;
  currentParticipants: number;
  destination: string;
  duration: number;
  meals: {
    breakfast: number;
    lunch: number;
    dinner: number;
  };
  accommodation: {
    type: string;
    description: string;
  };
  transportation: {
    type: string;
    description: string;
  };
  itinerary: {
    day: number;
    title: string;
    description: string;
    meals: string[];
    accommodation: string;
  }[];
  images: string[];
  status: 'available' | 'full' | 'closed';
}

export default function TravelProductDetail() {
  const params = useParams();
  const [product, setProduct] = useState<TravelProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.boardUrl || !params.postId) return;

      try {
        const productRef = doc(
          db,
          'boards',
          params.boardUrl as string,
          'posts',
          params.postId as string
        );
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const data = productSnap.data();
          setProduct({
            id: productSnap.id,
            ...data,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            departureDate: data.departureDate.toDate(),
            returnDate: data.returnDate.toDate(),
          } as TravelProduct);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.boardUrl, params.postId]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center">상품을 찾을 수 없습니다.</div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* 상품 기본 정보 */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
        <h1 className="mb-4 text-3xl font-bold">{product.title}</h1>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Calendar className="mr-2 size-5" />
            <span>출발: {format(product.departureDate, 'yyyy년 MM월 dd일', { locale: ko })}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="mr-2 size-5" />
            <span>도착: {format(product.returnDate, 'yyyy년 MM월 dd일', { locale: ko })}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="mr-2 size-5" />
            <span>여행지: {product.destination}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 size-5" />
            <span>여행기간: {product.duration}일</span>
          </div>
          <div className="flex items-center">
            <Users className="mr-2 size-5" />
            <span>
              예약인원: {product.currentParticipants}/{product.maxParticipants}명
            </span>
          </div>
          <div className="text-xl font-bold text-blue-600">{product.price.toLocaleString()}원</div>
        </div>

        {/* 상품 이미지 */}
        {product.images && product.images.length > 0 && (
          <div className="mb-6">
            <img
              src={product.images[0]}
              alt={product.title}
              className="h-96 w-full rounded-lg object-cover"
            />
          </div>
        )}
      </div>

      {/* 상품 상세 정보 */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-bold">상품 상세 정보</h2>

        {/* 숙박 정보 */}
        <div className="mb-6">
          <h3 className="mb-2 flex items-center text-xl font-semibold">
            <Bed className="mr-2 size-5" />
            숙박 정보
          </h3>
          <p>{product.accommodation.description}</p>
        </div>

        {/* 식사 정보 */}
        <div className="mb-6">
          <h3 className="mb-2 flex items-center text-xl font-semibold">
            <Utensils className="mr-2 size-5" />
            식사 정보
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>아침: {product.meals.breakfast}회</div>
            <div>점심: {product.meals.lunch}회</div>
            <div>저녁: {product.meals.dinner}회</div>
          </div>
        </div>

        {/* 교통 정보 */}
        <div className="mb-6">
          <h3 className="mb-2 flex items-center text-xl font-semibold">
            {product.transportation.type === 'plane' && <Plane className="mr-2 size-5" />}
            {product.transportation.type === 'bus' && <Bus className="mr-2 size-5" />}
            {product.transportation.type === 'train' && <Train className="mr-2 size-5" />}
            {product.transportation.type === 'ship' && <Ship className="mr-2 size-5" />}
            교통 정보
          </h3>
          <p>{product.transportation.description}</p>
        </div>

        {/* 일정 정보 */}
        <div>
          <h3 className="mb-4 text-xl font-semibold">상세 일정</h3>
          <div className="space-y-4">
            {product.itinerary.map((day, index) => (
              <div key={index} className="rounded-lg border p-4">
                <h4 className="mb-2 font-semibold">
                  Day {day.day}: {day.title}
                </h4>
                <p className="mb-2">{day.description}</p>
                <div className="text-sm text-gray-600">
                  <div>식사: {day.meals.join(', ')}</div>
                  <div>숙박: {day.accommodation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 예약/결제 정보 */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-bold">예약/결제 정보</h2>
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 font-semibold">예약 가능 인원</h3>
            <p>{product.maxParticipants - product.currentParticipants}명</p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">상품 상태</h3>
            <p
              className={
                product.status === 'available'
                  ? 'text-green-600'
                  : product.status === 'full'
                    ? 'text-yellow-600'
                    : 'text-red-600'
              }
            >
              {product.status === 'available'
                ? '예약 가능'
                : product.status === 'full'
                  ? '마감 임박'
                  : '예약 마감'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
