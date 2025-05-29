'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight, FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import { FaPlane, FaCalendarAlt, FaSearch } from 'react-icons/fa';
import { collection, query, where, getDocs, orderBy, getDocs as getDocsSimple } from 'firebase/firestore';
import { db } from '@/firebase/config';

// 히어로 슬라이드 타입 정의
interface HeroSlide {
  id?: string;
  imageUrl: string;
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  order: number;
  isActive: boolean;
}

// 슬라이드 아이템 컴포넌트
interface SlideItemProps {
  isActive: boolean;
  slide: HeroSlide;
  index: number;
}

const SlideItem = ({ isActive, slide, index }: SlideItemProps) => (
  <div
    id={`slide-${index}`}
    className={`absolute inset-0 transition-opacity duration-1000 ${
      isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}
  >
    <div className="absolute inset-0 bg-black/40 z-10"></div>
    <div className="relative h-full w-full">
      <img 
        src={slide.imageUrl} 
        alt={slide.title}
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
    </div>
  </div>
);

// 텍스트 애니메이션 컴포넌트
interface TextAnimationProps {
  text: string;
  delay: number;
  isActive: boolean;
  isTitle?: boolean;
}

const TextAnimation = ({ text, delay, isActive, isTitle = false }: TextAnimationProps) => {
  return (
    <div 
      className={`overflow-hidden ${isTitle ? 'h-[70px] md:h-[90px]' : 'h-[40px] md:h-[50px]'}`}
      style={{ opacity: isActive ? 1 : 0 }}
    >
      <div
        className={`transform ${
          isActive 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-full opacity-0'
        } transition-all duration-1000 ease-out`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <span 
          className={`inline-block ${
            isTitle 
              ? 'text-[40px] md:text-[60px] font-bold leading-tight' 
              : 'text-[24px] md:text-[30px] font-medium'
          }`}
        >
          {text}
        </span>
      </div>
    </div>
  );
};

const Hero = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [allSlides, setAllSlides] = useState<HeroSlide[]>([]);
  
  // 기본 슬라이드 데이터 (Firestore에서 데이터를 가져오기 전에 표시)
  const defaultSlides: HeroSlide[] = [
    {
      imageUrl: '/img/bg_3.jpg',
      title: '고비사막 어드벤처',
      description: '광활한 사막에서의 짜릿한 모험',
      buttonText: '모험 떠나기',
      buttonUrl: '#',
      order: 0,
      isActive: true
    },
    {
      imageUrl: '/img/bg_1.jpg',
      title: '몽골의 아름다운 대자연을 경험하세요',
      description: '끝없는 초원, 고비 사막, 유목민의 전통 문화까지',
      buttonText: '여행 시작하기',
      buttonUrl: '#',
      order: 1,
      isActive: true
    },
    {
      imageUrl: '/img/bg_2.jpg',
      title: '나담축제 특별 패키지',
      description: '몽골 최대 축제인 나담축제를 경험할 수 있는 특별한 여행',
      buttonText: '축제 일정 보기',
      buttonUrl: '#',
      order: 2,
      isActive: true
    }
  ];
  
  // Firestore에서 슬라이드 데이터 가져오기
  useEffect(() => {
    const fetchHeroSlides = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 먼저 모든 슬라이드 가져오기 (디버깅용)
        const allSlidesCollection = collection(db, 'heroSlides');
        const allSlidesSnapshot = await getDocsSimple(allSlidesCollection);
        
        if (!allSlidesSnapshot.empty) {
          const allSlidesData = allSlidesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() as HeroSlide
          }));
          setAllSlides(allSlidesData);
          console.log("모든 히어로 슬라이드:", allSlidesData);
          
          // 활성화된 슬라이드 필터링 (인덱스 문제 우회)
          const activeSlides = allSlidesData.filter(slide => slide.isActive);
          console.log("활성화된 슬라이드:", activeSlides);
          
          if (activeSlides.length > 0) {
            // 순서대로 정렬
            activeSlides.sort((a, b) => a.order - b.order);
            setSlides(activeSlides);
            return; // 성공적으로 가져왔으니 함수 종료
          }
        }
        
        // 기존 쿼리 사용 시도 (인덱스 문제 식별용)
        try {
          const slidesCollection = collection(db, 'heroSlides');
          const slidesQuery = query(
            slidesCollection, 
            where('isActive', '==', true),
            orderBy('order', 'asc')
          );
          const slidesSnapshot = await getDocs(slidesQuery);
          
          if (!slidesSnapshot.empty) {
            const fetchedSlides = slidesSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data() as HeroSlide
            }));
            
            setSlides(fetchedSlides);
          } else {
            if (allSlides.length > 0) {
              setError("활성화된 슬라이드가 없습니다. 관리자 페이지에서 슬라이드를 활성화해주세요.");
            } else {
              // 데이터가 없으면 기본 슬라이드 사용
              setSlides(defaultSlides);
            }
          }
        } catch (queryError: any) {
          console.error('쿼리 오류:', queryError);
          
          // Firestore 인덱스 오류 확인
          if (queryError.message && queryError.message.includes('index')) {
            setError("Firestore 인덱스 문제: " + queryError.message);
          } else {
            setError("쿼리 실행 오류: " + queryError.message);
          }
          
          // 모든 슬라이드가 있으면 기본 슬라이드는 사용하지 않음
          if (allSlides.length === 0) {
            setSlides(defaultSlides);
          }
        }
      } catch (error: any) {
        console.error('히어로 슬라이드를 불러오는데 실패했습니다:', error);
        setError("슬라이드 불러오기 오류: " + error.message);
        // 오류 발생 시 기본 슬라이드 사용
        setSlides(defaultSlides);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHeroSlides();
  }, []);

  // 슬라이드 효과
  useEffect(() => {
    if (slides.length === 0) return;
    
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slides.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [slides]);

  // 다음 슬라이드
  const nextSlide = () => {
    if (slides.length === 0) return;
    setActiveSlide(prev => (prev + 1) % slides.length);
  };

  // 이전 슬라이드
  const prevSlide = () => {
    if (slides.length === 0) return;
    setActiveSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // 특정 슬라이드로 이동
  const goToSlide = (index: number) => {
    setActiveSlide(index);
  };

  // 디버깅 정보 표시 (관리자용, 개발 환경에서만 표시)
  const showDebugInfo = process.env.NODE_ENV === 'development';
  
  // 슬라이드가 없는 경우 로딩 표시
  if (loading) {
    return (
      <section className="hero relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">슬라이드를 불러오는 중...</p>
          </div>
        </div>
      </section>
    );
  }
  
  // 에러가 있거나 슬라이드가 없는 경우
  if ((error || slides.length === 0) && showDebugInfo) {
    return (
      <section className="hero relative h-[70vh] overflow-hidden bg-gray-800">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 p-8">
          <h2 className="text-xl font-bold text-red-700 mb-4">히어로 슬라이드 문제 발생</h2>
          {error && <p className="text-red-600 mb-2">{error}</p>}
          <div className="bg-white p-4 rounded shadow-md max-w-3xl w-full mt-4 overflow-auto max-h-[50vh]">
            <h3 className="font-bold mb-2">데이터베이스 슬라이드 ({allSlides.length}개)</h3>
            {allSlides.length > 0 ? (
              <ul className="space-y-4">
                {allSlides.map((slide, index) => (
                  <li key={index} className="border p-2 rounded">
                    <p><strong>제목:</strong> {slide.title}</p>
                    <p><strong>설명:</strong> {slide.description}</p>
                    <p><strong>순서:</strong> {slide.order}</p>
                    <p><strong>활성화:</strong> {slide.isActive ? '예' : '아니오'}</p>
                    <p><strong>이미지:</strong> {slide.imageUrl ? '있음' : '없음'}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>데이터베이스에 슬라이드가 없습니다.</p>
            )}
          </div>
          <div className="mt-4">
            <p className="font-medium">관리자 페이지에서 슬라이드를 확인해주세요:</p>
            <p className="text-blue-600">/admin/design/hero-slides</p>
          </div>
        </div>
      </section>
    );
  }
  
  // 슬라이드가 없는 경우 기본 섹션만 표시
  if (slides.length === 0) {
    return (
      <section className="hero relative h-[70vh] overflow-hidden bg-gray-800">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-[35px] font-bold leading-tight mb-4">몽골 여행의 모든 것</h1>
            <p className="text-[20px]">다양한 여행 상품을 확인해보세요</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hero relative h-[70vh] overflow-hidden mt-0 pt-0 -mt-[1px]">
      {/* 디버깅 정보 */}
      {showDebugInfo && error && (
        <div className="absolute top-2 left-2 z-50 max-w-md rounded bg-red-100 p-2 text-xs text-red-800">
          <p className="font-bold">디버깅 정보 (개발 환경에서만 표시):</p>
          <p>{error}</p>
          <p>총 슬라이드: {allSlides.length}</p>
          <p>사용 중인 슬라이드: {slides.length}</p>
        </div>
      )}

      {/* 슬라이드 */}
      <div className="relative h-full w-full">
        {slides.map((slide, index) => (
          <SlideItem 
            key={slide.id || index} 
            isActive={activeSlide === index} 
            slide={slide} 
            index={index} 
          />
        ))}
      </div>

      {/* 히어로 콘텐츠 */}
      <div className="hero-bottom absolute inset-x-0 bottom-10 z-20 p-12">
        <div className="hero-content container mx-auto">
          {/* 슬라이드별 텍스트 영역 */}
          {slides.map((slide, index) => (
            <div
              key={slide.id || index}
              className={`hero-text max-w-lg text-white ${activeSlide === index ? 'block' : 'hidden'}`}
            >
              <div className="mb-3">
                <TextAnimation 
                  text={slide.title}
                  delay={200}
                  isActive={activeSlide === index}
                  isTitle={true}
                />
              </div>
              
              <div className="mb-2">
                <TextAnimation 
                  text={slide.description}
                  delay={400}
                  isActive={activeSlide === index}
                />
              </div>
              
              <div
                className={`hero-cta mt-8 ${activeSlide === index ? 'animate-fade-in' : 'opacity-0'}`}
                style={{ animationDelay: '600ms' }}
              >
                <Link
                  href={slide.buttonUrl || '#'}
                  className="group relative inline-flex items-center gap-3 text-white transition-all duration-300 hover:translate-y-[-2px]"
                >
                  <span className="text-lg font-medium">{slide.buttonText}</span>
                  <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                  <span className="absolute bottom-[-4px] left-0 h-[2px] w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </div>
            </div>
          ))}

          {/* 중앙 슬라이드 인디케이터 */}
          <div className="hero-indicators mt-6 flex justify-center gap-4">
            {slides.map((_, index) => (
              <button key={index} className="focus:outline-none" onClick={() => goToSlide(index)}>
                <div
                  className={`rounded-full transition-all duration-300 ${
                    activeSlide === index
                      ? 'h-3 w-8 bg-white shadow-md'
                      : 'size-3 bg-white/40 hover:bg-white/70'
                  }`}
                ></div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 오른쪽 어디로 갈까요 픽토그램 섹션 */}
      <div
        className={`hero-sidebar absolute right-8 top-1/2 z-30 -translate-y-1/2 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <div className="sidebar-content w-[320px] rounded-2xl bg-white/90 p-6 shadow-lg backdrop-blur-md">
          <div className="sidebar-header mb-6 flex items-center justify-between">
            <h3 className="flex items-center text-lg font-bold text-gray-800">
              <FaMapMarkerAlt className="bounce mr-2 text-teal-500" />
              어디로 갈까요?
            </h3>
            <button
              className="flex size-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              onClick={() => setSidebarOpen(false)}
            >
              <FaTimes size={14} />
            </button>
          </div>

          <div className="sidebar-items mb-6 space-y-4">
            <div className="sidebar-item flex cursor-pointer items-center rounded-xl p-3 transition-colors hover:bg-blue-50">
              <div className="item-icon mr-3 flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                <FaPlane />
              </div>
              <div className="item-text">
                <p className="item-title font-medium text-gray-800">인기 여행지</p>
                <p className="item-subtitle text-sm text-gray-500">울란바토르, 고비사막</p>
              </div>
            </div>

            <div className="sidebar-item flex cursor-pointer items-center rounded-xl p-3 transition-colors hover:bg-green-50">
              <div className="item-icon mr-3 flex size-12 items-center justify-center rounded-full bg-green-100 text-green-500">
                <FaCalendarAlt />
              </div>
              <div className="item-text">
                <p className="item-title font-medium text-gray-800">시즌별 추천</p>
                <p className="item-subtitle text-sm text-gray-500">나담축제, 겨울여행</p>
              </div>
            </div>

            <div className="sidebar-item flex cursor-pointer items-center rounded-xl p-3 transition-colors hover:bg-purple-50">
              <div className="item-icon mr-3 flex size-12 items-center justify-center rounded-full bg-purple-100 text-purple-500">
                <FaSearch />
              </div>
              <div className="item-text">
                <p className="item-title font-medium text-gray-800">맞춤 여행</p>
                <p className="item-subtitle text-sm text-gray-500">나만의 몽골 찾기</p>
              </div>
            </div>
          </div>

          <button className="sidebar-button w-full rounded-lg bg-teal-500 py-3 font-medium text-white transition-colors hover:bg-teal-600">
            여행 검색하기
          </button>
        </div>
      </div>

      {/* 슬라이드 네비게이션 버튼 */}
      <button
        className="hero-nav prev absolute left-8 top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
        onClick={prevSlide}
      >
        <FaChevronLeft />
      </button>
      <button
        className="hero-nav next absolute right-8 top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
        onClick={nextSlide}
      >
        <FaChevronRight />
      </button>
    </section>
  );
};

export default Hero;
