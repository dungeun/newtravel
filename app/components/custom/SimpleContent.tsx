'use client';

import { Section } from '../../types/section';

interface SimpleContentProps {
  section: Section;
}

export default function SimpleContent({ section }: SimpleContentProps) {
  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="mb-4 text-xl font-bold">{section.config.title || '커스텀 컨텐츠'}</h2>
      <div className="prose">
        <p>
          이것은 기본 커스텀 컴포넌트입니다. 실제 구현 시 관리자 페이지에서 자유롭게 구성할 수
          있습니다.
        </p>
        <p>
          이 컴포넌트는 <code>app/components/custom</code> 디렉토리에 위치하고 있으며,
          SectionRenderer에서 동적으로 불러올 수 있습니다.
        </p>
      </div>
    </div>
  );
}
