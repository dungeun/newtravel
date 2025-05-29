'use client';

import { useState, useEffect } from 'react';
import { AdminPageLayout } from '../../components/AdminPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Section, SectionType } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import DraggableSectionList from '../DraggableSectionList';

// 기본 섹션 구성
const defaultSections = [
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

export default function SectionManagerPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // 로컬 스토리지에서 섹션 설정 불러오기
  useEffect(() => {
    try {
      const savedSections = localStorage.getItem('mainPageSections');
      if (savedSections) {
        try {
          const parsedSections = JSON.parse(savedSections);
          if (Array.isArray(parsedSections) && parsedSections.length > 0) {
            setSections(parsedSections);
          } else {
            setSections(defaultSections);
          }
        } catch (error) {
          console.error('JSON 파싱 오류:', error);
          setSections(defaultSections);
        }
      } else {
        setSections(defaultSections);
      }
    } catch (error) {
      console.error('섹션 설정을 불러오는데 실패했습니다:', error);
      setSections(defaultSections);
    }
  }, []);

  // 섹션 재정렬 처리
  const handleSectionReorder = (sourceIndex: number, destinationIndex: number) => {
    const updatedSections = [...sections];
    
    // 이동할 항목 가져오기
    const [movedItem] = updatedSections.splice(sourceIndex, 1);
    
    // 새 위치에 삽입
    updatedSections.splice(destinationIndex, 0, movedItem);
    
    // order 속성 업데이트
    const reorderedSections = updatedSections.map((section, index) => ({
      ...section,
      order: index
    }));
    
    setSections(reorderedSections);
  };

  // 섹션 표시 여부 토글
  const toggleSectionVisibility = (sectionId: string) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        return { ...section, isVisible: !section.isVisible };
      }
      return section;
    });
    
    setSections(updatedSections);
  };

  // 변경사항 저장
  const saveSectionChanges = () => {
    try {
      setIsLoading(true);
      localStorage.setItem('mainPageSections', JSON.stringify(sections));
      toast({
        title: '저장 완료',
        description: '섹션 변경사항이 저장되었습니다.',
        variant: 'default',
      });
    } catch (error) {
      console.error('섹션 저장 중 오류 발생:', error);
      toast({
        title: '저장 오류',
        description: '섹션 저장 중 문제가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 기본값으로 초기화
  const resetToDefault = () => {
    setSections(defaultSections);
    toast({
      title: '초기화 완료',
      description: '모든 섹션이 기본값으로 재설정되었습니다.',
      variant: 'default',
    });
  };

  return (
    <AdminPageLayout title="섹션 관리">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">섹션 관리</h1>
          <div className="flex items-center gap-4">
            <Button 
              onClick={resetToDefault} 
              variant="outline" 
              disabled={isLoading}
            >
              초기화
            </Button>
            <Button 
              onClick={saveSectionChanges} 
              className="bg-blue-600 hover:bg-blue-700 text-white" 
              disabled={isLoading}
            >
              {isLoading ? '저장 중...' : '변경사항 저장'}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>메인 페이지 섹션 관리</CardTitle>
            <CardDescription>
              섹션의 표시 여부와 순서를 설정하세요.
              <br />
              고정된 섹션은 순서를 변경할 수 없으며, 배너를 제외한 고정 섹션은 숨길 수 없습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DraggableSectionList 
              sections={sections} 
              onReorder={handleSectionReorder} 
              onToggleVisibility={toggleSectionVisibility} 
            />
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  );
} 