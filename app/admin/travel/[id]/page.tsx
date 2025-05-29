'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import TravelDetailTabs from './TravelDetailTabs';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Simplified version of the product interface
interface TravelProduct {
  id: string;
  title: string;
  price: {
    adult: number;
    child: number;
    infant: number;
    fuelSurcharge: number;
  };
  description: string;
  images: {
    src: string;
    alt: string;
    localPath: string;
  }[];
  schedule: any[];
  luggage: any;
  insurance: any;
  notice: any;
  createdAt: string;
}

// Making the entire page a client component to avoid server/client mismatch
export default function TravelDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<TravelProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const docRef = doc(db, 'travel_products', params.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          setProduct({
            id: docSnap.id,
            title: data.title || '',
            description: data.description || '',
            price: {
              adult: data.price?.adult || 0,
              child: data.price?.child || 0,
              infant: data.price?.infant || 0,
              fuelSurcharge: data.price?.fuelSurcharge || 0,
            },
            images: data.images || [],
            schedule: data.schedule || [],
            luggage: data.luggage || {},
            insurance: data.insurance || {},
            notice: data.notice || {},
            createdAt: data.createdAt || new Date().toISOString(),
          });
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error('Error fetching travel product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('정말로 이 상품을 삭제하시겠습니까?')) return;

    try {
      await deleteDoc(doc(db, 'travel_products', params.id));
      alert('상품이 삭제되었습니다.');
      router.push('/travel/free_travel');
    } catch (error) {
      console.error('Error deleting travel product:', error);
      alert('상품 삭제 중 오류가 발생했습니다.');
    }
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const getTotalPrice = () => {
    if (!product) return 0;
    return product.price.adult * quantity;
  };

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[400px] items-center justify-center px-4 py-8">
        <div className="text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-y-2 border-blue-500"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600">상품을 찾을 수 없습니다.</h1>
        <Link
          href="/travel/free_travel"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/travel/free_travel" className="text-blue-600 hover:underline">
          ← 목록으로 돌아가기
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/travel/free_travel/${params.id}/edit`)}
            className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
          >
            <PencilIcon className="size-4" />
            수정
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:text-red-800"
          >
            <TrashIcon className="size-4" />
            삭제
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-lg">
        {/* Product Header Section with Image Slider and Info */}
        <div className="flex flex-col md:flex-row">
          {/* Image Slider - Takes 2/3 of the width on desktop */}
          <div className="w-full bg-gray-50 md:w-2/3">
            {product.images.length > 0 ? (
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000 }}
                className="h-[400px] w-full md:h-[500px]"
              >
                {product.images.map((image, index) => (
                  <SwiperSlide key={index} className="flex items-center justify-center">
                    <div className="relative size-full overflow-hidden">
                      <Image
                        src={image.localPath || '/images/placeholder.jpg'}
                        alt={image.alt || `${product.title} 이미지 ${index + 1}`}
                        width={800}
                        height={600}
                        className="size-full object-cover"
                        unoptimized
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="flex h-[400px] w-full items-center justify-center bg-gray-200 md:h-[500px]">
                <p className="text-gray-500">이미지가 없습니다</p>
              </div>
            )}
          </div>

          {/* Product Info - Takes 1/3 of the width on desktop */}
          <div className="w-full border-l border-gray-200 p-6 md:w-1/3">
            <h1 className="mb-4 text-2xl font-bold">{product.title}</h1>

            <div className="mb-4 border-t border-gray-200 pt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-gray-600">상품 가격</span>
                <span className="text-xl font-bold text-blue-600">
                  {product.price.adult.toLocaleString()}원 / 인
                </span>
              </div>
              <p className="mb-4 text-sm text-gray-500">
                (유류할증료 {product.price.fuelSurcharge.toLocaleString()}원 포함)
              </p>
            </div>

            <div className="mb-6 border-t border-gray-200 pt-4">
              <div className="mb-4">
                <h3 className="mb-2 font-medium">상품 설명</h3>
                <p className="text-sm text-gray-700">{product.description}</p>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6 border-t border-gray-200 pt-4">
              <h3 className="mb-3 font-medium">인원 선택 (성인)</h3>
              <div className="mb-4 flex items-center">
                <button
                  onClick={decreaseQuantity}
                  className="flex size-10 items-center justify-center rounded-l bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  -
                </button>
                <div className="flex h-10 w-16 items-center justify-center border-y border-gray-200">
                  {quantity}
                </div>
                <button
                  onClick={increaseQuantity}
                  className="flex size-10 items-center justify-center rounded-r bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Price */}
            <div className="mb-6 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">총 가격</span>
                <span className="text-2xl font-bold text-blue-600">
                  {getTotalPrice().toLocaleString()}원
                </span>
              </div>
            </div>

            {/* Booking Button */}
            <button className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700">
              예약하기
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <TravelDetailTabs product={product} />
        </div>
      </div>
    </div>
  );
}
