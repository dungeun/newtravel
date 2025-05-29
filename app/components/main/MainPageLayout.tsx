'use client';

import { useState, useEffect } from 'react';
import { Section, SectionType } from '@/types';
import Header from './Header';
import Hero from './Hero';
import MainBanner from './MainBanner';
import SearchSection from './SearchSection';
import RegionalTravelSection from './RegionalTravelSection';
import TimeDealSection from './TimeDealSection';
import ThemeTravelSection from './ThemeTravelSection';
import PromotionSection from './PromotionSection';
import ReviewSection from './ReviewSection';
import Footer from './Footer';
import { TravelProduct } from '@/types';

interface MainPageLayoutProps {
  travelProducts: TravelProduct[];
  timeDealProducts: TravelProduct[];
  themeProducts: TravelProduct[];
  promotionProducts: TravelProduct[];
  loading: boolean;
}

// 기본 섹션 구성
const defaultSections: Section[] = [
  {
    id: 'header',
    type: SectionType.HEADER,
    title: '헤더 네비게이션',
    isFixed: true,
    isVisible: true,
    order: 0
  },
  {
    id: 'hero',
    type: SectionType.HERO,
    title: '히어로 섹션',
    isFixed: true,
    isVisible: true,
    order: 1
  },
  {
    id: 'search',
    type: SectionType.SEARCH,
    title: '검색 섹션',
    isFixed: true,
    isVisible: true,
    order: 2
  },
  {
    id: 'banner',
    type: SectionType.BANNER,
    title: '메인 배너',
    isFixed: false,
    isVisible: true,
    order: 3
  },
  {
    id: 'regionalTravel',
    type: SectionType.REGIONAL_TRAVEL,
    title: '지역별 여행',
    isFixed: false,
    isVisible: true,
    order: 4
  },
  {
    id: 'timeDeal',
    type: SectionType.TIME_DEAL,
    title: '타임딜',
    isFixed: false,
    isVisible: true,
    order: 5
  },
  {
    id: 'themeTravel',
    type: SectionType.THEME_TRAVEL,
    title: '테마별 여행',
    isFixed: false,
    isVisible: true,
    order: 6
  },
  {
    id: 'promotion',
    type: SectionType.PROMOTION,
    title: '특가 프로모션',
    isFixed: false,
    isVisible: true,
    order: 7
  },
  {
    id: 'review',
    type: SectionType.REVIEW,
    title: '여행 후기',
    isFixed: false,
    isVisible: true,
    order: 8
  },
  {
    id: 'footer',
    type: SectionType.FOOTER,
    title: '푸터',
    isFixed: true,
    isVisible: true,
    order: 9
  }
];

const MainPageLayout = ({
  travelProducts,
  timeDealProducts,
  themeProducts,
  promotionProducts,
  loading
}: MainPageLayoutProps) => {
  const [sections, setSections] = useState<Section[]>(defaultSections);
  
  // 로컬 스토리지에서 섹션 설정 불러오기
  useEffect(() => {
    try {
      const savedSections = localStorage.getItem('mainPageSections');
      if (savedSections) {
        try {
          const parsedSections = JSON.parse(savedSections);
          
          // 파싱된 데이터가 배열인지 확인
          if (Array.isArray(parsedSections)) {
            // 필수 필드가 있는지 확인
            const validSections = parsedSections.filter(section => 
              section && section.id && section.type && typeof section.isVisible === 'boolean'
            );
            
            if (validSections.length > 0) {
              // 관리자 페이지에서 저장한 문자열 타입을 SectionType 열거형으로 변환
              const convertedSections = validSections.map(section => ({
                ...section,
                type: convertStringToSectionType(section.type)
              }));
              
              // 배너 섹션이 설정에 없으면 추가
              const bannerExists = convertedSections.some(section => section.id === 'banner');
              if (!bannerExists) {
                const bannerSection = defaultSections.find(section => section.id === 'banner');
                if (bannerSection) {
                  convertedSections.push(bannerSection);
                }
              }
              
              setSections(convertedSections);
            } else {
              console.warn('유효한 섹션이 없어 기본값을 사용합니다.');
            }
          } else {
            console.warn('저장된 섹션 데이터가 배열이 아닙니다. 기본값을 사용합니다.');
          }
        } catch (parseError) {
          console.error('JSON 파싱 오류:', parseError);
        }
      }
    } catch (error) {
      console.error('섹션 설정을 불러오는데 실패했습니다:', error);
    }
  }, []);
  
  // 문자열 타입을 SectionType 열거형으로 변환하는 함수
  const convertStringToSectionType = (typeString: string): SectionType => {
    switch (typeString) {
      case 'HEADER': return SectionType.HEADER;
      case 'BANNER': return SectionType.BANNER;
      case 'HERO': return SectionType.HERO;
      case 'SEARCH': return SectionType.SEARCH;
      case 'REGIONAL_TRAVEL': return SectionType.REGIONAL_TRAVEL;
      case 'TIME_DEAL': return SectionType.TIME_DEAL;
      case 'THEME_TRAVEL': return SectionType.THEME_TRAVEL;
      case 'PROMOTION': return SectionType.PROMOTION;
      case 'REVIEW': return SectionType.REVIEW;
      case 'FOOTER': return SectionType.FOOTER;
      default: 
        console.warn(`알 수 없는 섹션 타입: ${typeString}`);
        return SectionType.HEADER; // 기본값으로 헤더 반환
    }
  };

  // 섹션 컴포넌트 렌더링
  const renderSection = (section: Section) => {
    if (!section.isVisible) return null;

    switch (section.type) {
      case SectionType.HEADER:
        return <Header key={section.id} />;
      case SectionType.BANNER:
        return <MainBanner key={section.id} />;
      case SectionType.HERO:
        return <Hero key={section.id} />;
      case SectionType.SEARCH:
        return <SearchSection key={section.id} />;
      case SectionType.REGIONAL_TRAVEL:
        return <RegionalTravelSection key={section.id} travelProducts={travelProducts} loading={loading} />;
      case SectionType.TIME_DEAL:
        return <TimeDealSection key={section.id} timeDealProducts={timeDealProducts} loading={loading} />;
      case SectionType.THEME_TRAVEL:
        return <ThemeTravelSection key={section.id} themeProducts={themeProducts} loading={loading} />;
      case SectionType.PROMOTION:
        return <PromotionSection key={section.id} promotionProducts={promotionProducts} loading={loading} />;
      case SectionType.REVIEW:
        return <ReviewSection key={section.id} />;
      case SectionType.FOOTER:
        return <Footer key={section.id} />;
      default:
        return null;
    }
  };

  // 섹션 순서대로 정렬
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <>
      {/* 전역 스타일 */}
      <style jsx global>{`
        @font-face {
          font-family: 'GmarketSansMedium';
          src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff')
            format('woff');
          font-weight: normal;
          font-style: normal;
        }

        @keyframes slideInFromLeft {
          from {
            transform: translateX(-30px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideInFromRight {
          from {
            transform: translateX(30px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes bounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        .animate-slide-left {
          animation: slideInFromLeft 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-right {
          animation: slideInFromRight 0.8s ease-out forwards;
          opacity: 0;
        }

        .bounce {
          animation: bounce 2s infinite;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>

      {/* 정렬된 섹션을 순서대로 렌더링 */}
      <div className="flex flex-col">
        {sortedSections.map(section => renderSection(section))}
      </div>
    </>
  );
};

export default MainPageLayout;
