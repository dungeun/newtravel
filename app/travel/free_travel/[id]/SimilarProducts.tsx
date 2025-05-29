'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// 간단한 상품 인터페이스
interface TravelProduct {
  id: string;
  title: string;
  description: string;
  price: {
    adult: number;
    child: number;
    infant: number;
    fuelSurcharge: number;
  };
  images: {
    src: string;
    alt: string;
    localPath: string;
  }[];
}

export default function SimilarProducts({ currentProductId }: { currentProductId: string }) {
  const [products, setProducts] = useState<TravelProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const productsRef = collection(db, 'travel_products');
        const q = query(productsRef, limit(8)); // 최대 8개 상품 가져오기
        const querySnapshot = await getDocs(q);
        
        const fetchedProducts: TravelProduct[] = [];
        querySnapshot.forEach((doc) => {
          // 현재 보고 있는 상품은 제외
          if (doc.id !== currentProductId) {
            const data = doc.data() as Omit<TravelProduct, 'id'>;
            fetchedProducts.push({
              id: doc.id,
              ...data,
            } as TravelProduct);
          }
        });
        
        setProducts(fetchedProducts.slice(0, 4)); // 최대 4개만 표시
      } catch (error) {
        console.error('상품 가져오기 오류:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [currentProductId]);

  if (loading) {
    return (
      <div className="mt-12 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">이 상품과 비슷한 상품 보기</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2 w-2/3"></div>
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">이 상품과 비슷한 상품 보기</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <Link href={`/travel/free_travel/${product.id}`}>
                <div className="relative h-48">
                  <Image 
                    src={product.images[0]?.src || product.images[0]?.localPath || "/images/travel-placeholder.jpg"} 
                    alt={product.title} 
                    fill 
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800 line-clamp-1">{product.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-1">{product.description}</p>
                  <p className="text-lg font-bold text-[#14b8a6]">₩ {product.price.adult.toLocaleString()}</p>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <div className="col-span-4 text-center py-8 text-gray-500">
            현재 다른 여행 상품이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
