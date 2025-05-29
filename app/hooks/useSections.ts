import { useState, useEffect } from 'react';
import { Section, SectionType } from '../types';

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
    id: 'regionalTravel',
    type: SectionType.REGIONAL_TRAVEL,
    title: '지역별 여행',
    isFixed: false,
    isVisible: true,
    order: 3
  },
  {
    id: 'timeDeal',
    type: SectionType.TIME_DEAL,
    title: '타임딜',
    isFixed: false,
    isVisible: true,
    order: 4
  },
  {
    id: 'themeTravel',
    type: SectionType.THEME_TRAVEL,
    title: '테마별 여행',
    isFixed: false,
    isVisible: true,
    order: 5
  },
  {
    id: 'promotion',
    type: SectionType.PROMOTION,
    title: '특가 프로모션',
    isFixed: false,
    isVisible: true,
    order: 6
  },
  {
    id: 'review',
    type: SectionType.REVIEW,
    title: '여행 후기',
    isFixed: false,
    isVisible: true,
    order: 7
  },
  {
    id: 'footer',
    type: SectionType.FOOTER,
    title: '푸터',
    isFixed: true,
    isVisible: true,
    order: 8
  }
];

export const useSections = () => {
  const [sections, setSections] = useState<Section[]>(defaultSections);
  
  // 로컬 스토리지에서 섹션 설정 불러오기
  useEffect(() => {
    try {
      const savedSections = localStorage.getItem('mainPageSections');
      if (savedSections) {
        setSections(JSON.parse(savedSections));
      }
    } catch (error) {
      console.error('섹션 설정을 불러오는데 실패했습니다:', error);
    }
  }, []);

  // 섹션 설정 저장하기
  const saveSections = (newSections: Section[]) => {
    try {
      localStorage.setItem('mainPageSections', JSON.stringify(newSections));
      setSections(newSections);
    } catch (error) {
      console.error('섹션 설정을 저장하는데 실패했습니다:', error);
    }
  };

  // 섹션 순서 변경
  const reorderSections = (sourceIndex: number, destinationIndex: number) => {
    const reorderedSections = [...sections];
    const [movedSection] = reorderedSections.splice(sourceIndex, 1);
    reorderedSections.splice(destinationIndex, 0, movedSection);
    
    // 순서 번호 업데이트
    const updatedSections = reorderedSections.map((section, index) => ({
      ...section,
      order: index
    }));
    
    saveSections(updatedSections);
  };

  // 섹션 가시성 토글
  const toggleSectionVisibility = (sectionId: string) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          isVisible: !section.isVisible
        };
      }
      return section;
    });
    
    saveSections(updatedSections);
  };

  // 섹션 초기화
  const resetSections = () => {
    saveSections(defaultSections);
  };

  return {
    sections,
    reorderSections,
    toggleSectionVisibility,
    resetSections
  };
};
