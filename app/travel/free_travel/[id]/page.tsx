'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import TravelDetailTabs from './TravelDetailTabs';
import SimilarProducts from './SimilarProducts';
import { CalendarIcon, HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/use-toast';
import { useTheme } from 'next-themes';
import { useLike } from '@/hooks/useLike';
// import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
  const [teenQuantity, setTeenQuantity] = useState(0);
  const [childQuantity, setChildQuantity] = useState(0);
  // const { data: session } = useSession();
  const { toast } = useToast();
  const { setTheme } = useTheme();
  const { likes, isLiked, toggleLike } = useLike(params.id);
  const { addItem } = useCart();
  
  // 명시적으로 라이트 모드 설정
  useEffect(() => {
    setTheme('light');
  }, [setTheme]);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        if (!db) {
          setProduct(null);
          setLoading(false);
          return;
        }
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

  // 상품 상태 관리

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseTeenQuantity = () => {
    setTeenQuantity(teenQuantity + 1);
  };

  const decreaseTeenQuantity = () => {
    if (teenQuantity > 0) {
      setTeenQuantity(teenQuantity - 1);
    }
  };

  const increaseChildQuantity = () => {
    setChildQuantity(childQuantity + 1);
  };

  const decreaseChildQuantity = () => {
    if (childQuantity > 0) {
      setChildQuantity(childQuantity - 1);
    }
  };

  const getTotalPrice = () => {
    if (!product) return 0;
    const adultTotal = product.price.adult * quantity;
    const teenTotal = Math.round(product.price.child * 0.7) * teenQuantity;
    const childTotal = product.price.child * childQuantity;
    return adultTotal + teenTotal + childTotal;
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    try {
      console.log('장바구니 추가 시작:', product.id);
      
      const img = product.images?.[0] as any;
      const imageUrl = img?.url || img?.src || img?.localPath || '';
      
      // 사용자에게 알림 메시지 준비
      const peopleText = [];
      if (quantity > 0) peopleText.push(`성인 ${quantity}명`);
      if (teenQuantity > 0) peopleText.push(`청소년 ${teenQuantity}명`);
      if (childQuantity > 0) peopleText.push(`아동 ${childQuantity}명`);
      
      // 장바구니 아이템 생성
      const cartItem = {
        productId: product.id,
        title: product.title,
        mainImage: imageUrl,
        price: product.price.adult,
        quantity: quantity + teenQuantity + childQuantity,
        options: {
          adult: quantity,
          child: childQuantity,
          infant: 0
        },
      };
      
      console.log('장바구니에 추가할 아이템:', cartItem);
      
      // 장바구니에 추가
      addItem(cartItem);
      
      // 추가 완료 메시지 출력
      console.log('장바구니 추가 완료');
      
      // 토스트 메시지 표시
      toast({
        title: `${product.title}`,
        description: `${peopleText.join(', ')} 장바구니에 추가되었습니다.`,
      });
      
      // 장바구니 페이지로 이동
      setTimeout(() => {
        router.push('/travel/cart');
      }, 500); // 0.5초 후 이동
      
    } catch (error) {
      console.error('장바구니 추가 중 오류 발생:', error);
      toast({
        title: '오류 발생',
        description: '장바구니에 추가하는 중 문제가 발생했습니다.',
        variant: 'destructive',
      });
    }
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
    <div className="container mx-auto px-4 py-8 bg-white">
      <div className="mb-8">
        <Link href="/travel/free_travel" className="text-[#14b8a6] hover:underline">
          ← 목록으로 돌아가기
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg bg-white border border-gray-100">
        {/* Product Header Section with Image Slider and Info */}
        <div className="flex flex-col md:flex-row">
          {/* Image Slider - Takes full width on mobile, 2/3 on desktop */}
          <div className="w-full md:w-2/3">
            <div className="bg-gray-50">
              {product.images.length > 0 ? (
                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  spaceBetween={0}
                  slidesPerView={1}
                  navigation
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 5000, disableOnInteraction: false }}
                >
                  {product.images.map((img, idx) => (
                    <SwiperSlide key={idx}>
                      <Image
                        src={img.src || img.localPath || ''}
                        alt={img.alt || '여행 상품 이미지'}
                        width={600}
                        height={400}
                        className="h-[400px] w-[600px] object-cover mx-auto"
                        priority={idx === 0}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <div className="flex h-64 items-center justify-center bg-gray-100 text-gray-400 md:h-96">
                  이미지 없음
                </div>
              )}
            </div>
            
            {/* 예약 가능 날짜 캘린더 - 상품 사진 아래로 이동 */}
            <div className="bg-white p-6 border-t border-gray-100">
              <div className="flex items-center mb-4">
                <CalendarIcon className="w-5 h-5 text-[#14b8a6] mr-2" />
                <h3 className="text-xl font-bold">예약 가능 날짜</h3>
              </div>
              
              {/* 달력 - 좌우로 배치하고 100% 너비로 설정 */}
              <div className="flex gap-4 overflow-x-auto pb-4 w-full">
                <div className="border border-gray-200 rounded-lg shadow-sm p-4 flex-1 min-w-[48%]">
                  <div className="text-center mb-3">
                    <span className="text-lg font-medium">5월</span>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                      <div key={i} className="text-center font-medium py-2">{day}</div>
                    ))}
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <div key={`may-${day}`} className="text-center hover:bg-gray-100 cursor-pointer rounded py-1">
                        <span className={`inline-flex items-center justify-center w-8 h-8 leading-none rounded-full text-sm ${day === new Date().getDate() ? 'bg-[#14b8a6] text-white' : ''}`}>{day}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg shadow-sm p-4 flex-1 min-w-[48%]">
                  <div className="text-center mb-3">
                    <span className="text-lg font-medium">6월</span>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                      <div key={i} className="text-center font-medium py-2">{day}</div>
                    ))}
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                      <div key={`june-${day}`} className="text-center hover:bg-gray-100 cursor-pointer rounded py-1">
                        <span className="inline-flex items-center justify-center w-8 h-8 leading-none rounded-full text-sm">{day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* 출발일 정보 (상품 설명란으로 이동) */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center mb-4">
                  <CalendarIcon className="w-6 h-6 text-[#14b8a6] mr-2" />
                  <h3 className="text-xl font-bold">출발일 정보</h3>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-md mb-4">
                  <CalendarIcon className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="text-lg">오늘로부터 2개월 내 출발 가능</span>
                </div>
                <p className="text-gray-600">예약 시 원하시는 출발일을 선택해주세요. 특정 날짜에 따라 가격이 변동될 수 있습니다.</p>
              </div>
              
              {/* 출발일/도착일 선택 UI - 캘린더 아래에 배치 */}
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h3 className="text-xl font-medium mb-4">출발일/도착일 선택</h3>
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center border border-gray-300 rounded-md p-3 hover:border-[#14b8a6] transition-colors">
                    <CalendarIcon className="w-5 h-5 text-[#14b8a6] mr-2" />
                    <span className="text-base">출발일: 날짜를 선택해주세요</span>
                  </div>
                  <div className="flex items-center border border-gray-300 rounded-md p-3 hover:border-[#14b8a6] transition-colors">
                    <CalendarIcon className="w-5 h-5 text-[#14b8a6] mr-2" />
                    <span className="text-base">도착일: 날짜를 선택해주세요</span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-500">원하시는 날짜를 선택하시면 해당 날짜의 가격 및 예약 가능 여부를 확인하실 수 있습니다.</p>
              </div>
            </div>
          </div>

          {/* Product Info - Takes 1/3 of the width on desktop */}
          <div className="w-full border-l border-gray-200 p-6 md:w-1/3">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">{product.title}</h1>
              <div className="flex items-center">
                <button 
                  onClick={toggleLike}
                  className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label={isLiked ? '좋아요 취소' : '좋아요'}
                >
                  {isLiked ? (
                    <HeartIconSolid className="w-6 h-6 text-red-500" />
                  ) : (
                    <HeartIconOutline className="w-6 h-6 text-gray-500" />
                  )}
                  <span className="text-sm font-medium">{likes}</span>
                </button>
              </div>
            </div>

            <div className="mb-4 border-t border-gray-200 pt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xl text-gray-600">상품 가격</span>
                <span className="text-2xl font-bold text-[#14b8a6]">
                  {product.price.adult.toLocaleString()}원 / 인
                </span>
              </div>
              <p className="mb-4 text-base text-gray-500">
                (유류할증료 {product.price.fuelSurcharge.toLocaleString()}원 포함)
              </p>
            </div>
            




            {/* Quantity Selector */}
            <div className="mb-6 border-t border-gray-200 pt-4">
              <h3 className="mb-3 text-xl font-medium">인원 선택</h3>
              
              {/* 성인 */}
              <div className="mb-4">
                <div className="mb-2 flex justify-between">
                  <span className="text-base">성인</span>
                  <span className="text-base text-gray-500">{product.price.adult.toLocaleString()}원</span>
                </div>
                <div className="flex items-center">
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
              
              {/* 청소년 */}
              <div className="mb-4">
                <div className="mb-2 flex justify-between">
                  <span className="text-base">청소년 (만 13-18세)</span>
                  <span className="text-base text-gray-500">{Math.round(product.price.child * 0.7).toLocaleString()}원</span>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={decreaseTeenQuantity}
                    className="flex size-10 items-center justify-center rounded-l bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    -
                  </button>
                  <div className="flex h-10 w-16 items-center justify-center border-y border-gray-200">
                    {teenQuantity}
                  </div>
                  <button
                    onClick={increaseTeenQuantity}
                    className="flex size-10 items-center justify-center rounded-r bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* 아동 */}
              <div className="mb-4">
                <div className="mb-2 flex justify-between">
                  <span className="text-base">아동 (만 12세 이하)</span>
                  <span className="text-base text-gray-500">{product.price.child.toLocaleString()}원</span>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={decreaseChildQuantity}
                    className="flex size-10 items-center justify-center rounded-l bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    -
                  </button>
                  <div className="flex h-10 w-16 items-center justify-center border-y border-gray-200">
                    {childQuantity}
                  </div>
                  <button
                    onClick={increaseChildQuantity}
                    className="flex size-10 items-center justify-center rounded-r bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Total Price */}
            <div className="mb-6 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xl font-medium">총 가격</span>
                <span className="text-3xl font-bold text-[#14b8a6]">
                  {getTotalPrice().toLocaleString()}원
                </span>
              </div>
            </div>

            {/* Booking Button and Favorite Button */}
            <div className="flex gap-3 mt-4 mb-6">
              <button
                className="flex-1 rounded-full bg-[#14b8a6] px-6 py-4 text-xl font-bold text-white hover:bg-teal-700"
                onClick={handleAddToCart}
              >
                여행 예약하기
              </button>
              <button
                onClick={toggleLike}
                className="flex items-center justify-center w-16 h-16 rounded-full border-2 border-gray-200 hover:border-red-500 transition-colors"
                aria-label={isLiked ? '좋아요 취소' : '좋아요'}
              >
                {isLiked ? (
                  <HeartIconSolid className="w-8 h-8 text-red-500" />
                ) : (
                  <HeartIconOutline className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>

            {/* Map Image */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h3 className="mb-3 text-xl font-medium">여행 지도</h3>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <Image
                  src="/images/mongolia-map-placeholder.svg"
                  alt="몽골 여행 지도"
                  width={400}
                  height={300}
                  className="h-auto w-full object-contain"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">주요 여행지: 울란바타르, 훕스굴 호수, 테르지 국립공원</p>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
      {/* Product Tabs */}
      <TravelDetailTabs product={product} />
      
      {/* 이 상품과 비슷한 상품 보기 - SimilarProducts 컴포넌트 사용 */}
      <SimilarProducts currentProductId={params.id} />
    </div>
      </div>
    </div>
  );
}
