'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

interface TravelProduct {
  id: string;
  title: string;
  departureDate: Date;
  returnDate: Date;
  price: number;
  maxParticipants: number;
  currentParticipants: number;
  destination: string;
  duration: number;
  images: string[];
  status: 'available' | 'full' | 'closed';
}

export default function TravelProductList() {
  const params = useParams();
  const router = useRouter();
  const [products, setProducts] = useState<TravelProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!params.boardUrl) return;

      try {
        const productsRef = collection(db, 'boards', params.boardUrl as string, 'posts');
        const q = query(productsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          departureDate: doc.data().departureDate.toDate(),
          returnDate: doc.data().returnDate.toDate(),
        })) as TravelProduct[];

        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [params.boardUrl]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">여행 상품 목록</h1>
        <button
          onClick={() => router.push(`/board/travel/${params.boardUrl}/write`)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          상품 등록
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map(product => (
          <div
            key={product.id}
            onClick={() => router.push(`/board/travel/${params.boardUrl}/${product.id}`)}
            className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
          >
            {/* 상품 이미지 */}
            {product.images && product.images.length > 0 && (
              <div className="relative h-48">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="size-full object-cover"
                />
                <div className="absolute right-2 top-2">
                  <span
                    className={`rounded px-2 py-1 text-sm ${
                      product.status === 'available'
                        ? 'bg-green-500'
                        : product.status === 'full'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    } text-white`}
                  >
                    {product.status === 'available'
                      ? '예약 가능'
                      : product.status === 'full'
                        ? '마감 임박'
                        : '예약 마감'}
                  </span>
                </div>
              </div>
            )}

            {/* 상품 정보 */}
            <div className="p-4">
              <h2 className="mb-2 line-clamp-2 text-xl font-semibold">{product.title}</h2>

              <div className="space-y-2 text-gray-600">
                <div className="flex items-center">
                  <Calendar className="mr-2 size-4" />
                  <span>
                    {format(product.departureDate, 'yyyy.MM.dd', { locale: ko })} ~
                    {format(product.returnDate, 'yyyy.MM.dd', { locale: ko })}
                  </span>
                </div>

                <div className="flex items-center">
                  <MapPin className="mr-2 size-4" />
                  <span>{product.destination}</span>
                </div>

                <div className="flex items-center">
                  <Clock className="mr-2 size-4" />
                  <span>{product.duration}일</span>
                </div>

                <div className="flex items-center">
                  <Users className="mr-2 size-4" />
                  <span>
                    예약: {product.currentParticipants}/{product.maxParticipants}명
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <span className="text-xl font-bold text-blue-600">
                  {product.price.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
