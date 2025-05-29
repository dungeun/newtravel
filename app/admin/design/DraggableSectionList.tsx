'use client';

import React, { useEffect, useRef } from 'react';
import Sortable from 'sortablejs';
import { LuEye, LuEyeOff, LuGripVertical } from 'react-icons/lu';

interface MainPageSection {
  id: string;
  type: string;
  title: string;
  isFixed: boolean;
  isVisible: boolean;
  order: number;
}

interface DraggableSectionListProps {
  sections: MainPageSection[];
  onReorder: (sourceIndex: number, destinationIndex: number) => void;
  onToggleVisibility: (sectionId: string) => void;
}

const DraggableSectionList = ({ 
  sections, 
  onReorder, 
  onToggleVisibility 
}: DraggableSectionListProps) => {
  const sortableRef = useRef<HTMLDivElement>(null);
  const sortableInstance = useRef<Sortable | null>(null);

  // SortableJS 초기화
  useEffect(() => {
    if (sortableRef.current) {
      if (sortableInstance.current) {
        sortableInstance.current.destroy();
      }
      
      sortableInstance.current = Sortable.create(sortableRef.current, {
        animation: 150,
        handle: '.drag-handle',
        filter: '.fixed-section', // 고정 섹션은 드래그 불가능
        onEnd: (evt) => {
          // 아이템이 이동된 경우
          if (evt.oldIndex !== evt.newIndex && evt.newIndex !== undefined && evt.oldIndex !== undefined) {
            onReorder(evt.oldIndex, evt.newIndex);
          }
        }
      });
    }
    
    return () => {
      if (sortableInstance.current) {
        sortableInstance.current.destroy();
        sortableInstance.current = null;
      }
    };
  }, [sections, onReorder]);

  // 섹션을 순서대로 정렬
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div ref={sortableRef} className="space-y-2 mb-6">
      {sortedSections.map((section) => (
        <div 
          key={section.id}
          className={`flex items-center justify-between rounded-md border p-4 ${
            section.isFixed ? 'fixed-section bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'
          }`}
          data-id={section.id}
        >
          <div className="flex items-center gap-3">
            {!section.isFixed && (
              <span className="drag-handle cursor-grab text-gray-400 hover:text-gray-700 dark:hover:text-gray-400">
                <LuGripVertical size={20} />
              </span>
            )}
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-600 rounded-full mr-2">
              {section.order + 1}
            </div>
            <span className="font-medium">{section.title}</span>
            {section.isFixed && (
              <span className="ml-2 rounded-full bg-blue-100 dark:bg-blue-800 px-2 py-1 text-xs text-blue-800 dark:text-blue-100">
                고정됨
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {section.isVisible ? (
                <LuEye className="text-green-500" />
              ) : (
                <LuEyeOff className="text-gray-400" />
              )}
              <button
                onClick={() => onToggleVisibility(section.id)}
                disabled={section.isFixed && section.type !== 'BANNER'} // 배너는 고정이지만 토글 가능
                className={`
                  inline-flex rounded-full px-3 py-1 text-xs font-semibold leading-none
                  ${section.isVisible 
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                    : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}
                  ${section.isFixed && section.type !== 'BANNER' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {section.isVisible ? '표시' : '숨김'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DraggableSectionList;
