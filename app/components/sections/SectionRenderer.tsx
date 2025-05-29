'use client';

import { useState, useEffect } from 'react';
import { Section } from '../../types/section';
import LatestPosts from './LatestPosts';
import Banner from './Banner';
import dynamic from 'next/dynamic';

interface SectionRendererProps {
  section: Section;
}

export default function SectionRenderer({ section }: SectionRendererProps) {
  const [CustomComponent, setCustomComponent] = useState<any>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // custom 타입이고 customComponent가 지정된 경우에만 동적 로딩 시도
    if (section.type === 'custom' && section.config.customComponent) {
      const loadComponent = async () => {
        try {
          // 동적으로 컴포넌트 로드
          const DynamicComponent = dynamic(() =>
            import(`../custom/${section.config.customComponent}`).catch(() => {
              // 로딩 실패시 에러 상태 설정
              setIsError(true);
              // 기본 에러 컴포넌트 반환
              return () => (
                <div className="rounded border bg-red-50 p-4 text-red-600">
                  컴포넌트를 찾을 수 없습니다: {section.config.customComponent}
                </div>
              );
            })
          );
          setCustomComponent(() => DynamicComponent);
        } catch (error) {
          setIsError(true);
          console.error('컴포넌트 로딩 오류:', error);
        }
      };

      loadComponent();
    }
  }, [section]);

  if (!section.isActive) {
    return null;
  }

  switch (section.type) {
    case 'latest-posts':
      return <LatestPosts section={section} />;

    case 'banner':
      return <Banner section={section} />;

    case 'content':
      // 기본 콘텐츠 섹션
      return (
        <div className="content-section rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-bold">{section.config.title || '콘텐츠'}</h2>
          <div className="prose max-w-none">
            <p>이곳은 관리자가 편집 가능한 콘텐츠 영역입니다.</p>
            <p>실제 구현 시 관리자 페이지에서 편집한 HTML 콘텐츠가 표시됩니다.</p>
          </div>
        </div>
      );

    case 'custom':
      // 커스텀 컴포넌트
      if (CustomComponent) {
        return <CustomComponent section={section} />;
      }

      if (isError) {
        return (
          <div className="rounded border bg-red-50 p-4 text-red-600">
            컴포넌트를 로드하는 중 오류가 발생했습니다: {section.config.customComponent}
          </div>
        );
      }

      // 로딩 중 표시
      return (
        <div className="rounded border bg-gray-50 p-4 text-gray-500">
          <p>컴포넌트 로딩 중...</p>
        </div>
      );

    default:
      return (
        <div className="rounded border bg-yellow-50 p-4">
          <p className="text-yellow-700">알 수 없는 섹션 타입: {(section as any).type}</p>
        </div>
      );
  }
}
