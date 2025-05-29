'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './hooks/useAuth';
import { db } from './firebase/config';
import { collection, query, getDocs, limit } from 'firebase/firestore';
import MainPageLayout from '@/components/main/MainPageLayout';

// 여행 상품 타입 정의
interface TravelProduct {
  id: string;
  title: string;
  description: string;
  region: string;
  theme?: string;
  price: {
    adult: number;
    child?: number;
    infant?: number;
  };
  discountRate?: number;
  originalPrice?: number;
  images: {
    localPath: string;
    alt?: string;
  }[];
  [key: string]: any;
}

const Home = () => {
  const [travelProducts, setTravelProducts] = useState<TravelProduct[]>([]);
  const [timeDealProducts, setTimeDealProducts] = useState<TravelProduct[]>([]);
  const [themeProducts, setThemeProducts] = useState<TravelProduct[]>([]);
  const [promotionProducts, setPromotionProducts] = useState<TravelProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  // 여행 상품 데이터 가져오기
  useEffect(() => {
    const fetchTravelProducts = async () => {
      try {
        console.log('🔍 Travel products 로딩 시작...');
        setLoading(true);

        // 데이터 컬렉션 이름 시도
        const collections = ['travel_products', 'travelProducts', 'products', 'travels', 'travel'];

        for (const collectionName of collections) {
          try {
            console.log(`🔍 ${collectionName} 컬렉션 접근 시도...`);
            if (!db) throw new Error('Firestore 인스턴스가 null입니다.');
            const productsRef = collection(db, collectionName);

            // 지역별 여행 상품 (일반)
            const productsQuery = query(productsRef);
            const querySnapshot = await getDocs(productsQuery);
            console.log(`✅ ${collectionName} 컬렉션에서 데이터 ${querySnapshot.size}개 발견!`);

            if (querySnapshot.size > 0) {
              // 데이터가 있으면 사용
              const fetchedProducts = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
              }));

              // 결과를 최대 4개까지만 가져옴 (각 섹션별로)
              const products = fetchedProducts.slice(0, 4) as TravelProduct[];
              // 타임딜용
              const timeDealProducts = fetchedProducts.slice(0, 3) as TravelProduct[];
              // 테마 여행용 (3개)
              const themeProducts = fetchedProducts.slice(0, 3) as TravelProduct[];
              // 특가 프로모션용 (1개)
              const promotionProduct = fetchedProducts[0] as TravelProduct;

              console.log('🎯 가져온 데이터:', {
                일반: products.length,
                타임딜: timeDealProducts.length,
                테마: themeProducts.length,
                특가: promotionProduct ? '1개' : '없음',
              });

              setTravelProducts(products);
              setTimeDealProducts(timeDealProducts);
              setThemeProducts(themeProducts);
              if (promotionProduct) {
                setPromotionProducts([promotionProduct]);
              }

              // 프로모션 상품 가져오기 시도 (생략 가능)
              try {
                if (!db) throw new Error('Firestore 인스턴스가 null입니다.');
                const promotionsRef = collection(db, 'promotions');
                const promotionsQuery = query(promotionsRef, limit(1));
                const promotionsSnapshot = await getDocs(promotionsQuery);

                if (promotionsSnapshot.size > 0) {
                  const promoProduct = {
                    id: promotionsSnapshot.docs[0].id,
                    ...promotionsSnapshot.docs[0].data(),
                    originalPrice: 0,
                    discountRate: 30,
                  } as TravelProduct;

                  if (promoProduct.price && typeof promoProduct.price.adult === 'number') {
                    promoProduct.originalPrice = Math.round(promoProduct.price.adult * 1.3);
                  }

                  setPromotionProducts([promoProduct]);
                  console.log('🎯 프로모션 데이터 발견!');
                }
              } catch (err) {
                console.log('❌ 프로모션 컬렉션 접근 중 오류:', err);
              }

              setLoading(false);
              return; // 데이터를 찾았으면 더 이상 진행하지 않음
            }
          } catch (err) {
            console.log(`❌ ${collectionName} 컬렉션 접근 중 오류:`, err);
          }
        }

        // 모든 컬렉션 시도 후 데이터가 없으면 로딩 상태 해제
        console.log('❌ 데이터를 가져오지 못했습니다.');
        setLoading(false);
      } catch (error) {
        console.error('Error fetching travel products:', error);
        setLoading(false);
      }
    };

    fetchTravelProducts();
  }, []);

  return (
    <MainPageLayout
      travelProducts={travelProducts}
      timeDealProducts={timeDealProducts}
      themeProducts={themeProducts}
      promotionProducts={promotionProducts}
      loading={loading}
    />
  );
};

export default Home;
