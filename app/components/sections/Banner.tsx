'use client';

import { Section } from '../../types/section';

interface BannerProps {
  section: Section;
}

export default function Banner({ section }: BannerProps) {
  // 실제 구현 시 배너 설정에서 이미지, 링크 등을 가져오도록 수정
  const title = section.config.title || '배너';

  return (
    <div className="banner-section">
      <div className="overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="p-8 text-white">
          <h2 className="mb-4 text-2xl font-bold md:text-3xl">{title}</h2>
          <p className="mb-6 text-lg text-white/80">
            이곳은 배너 콘텐츠가 표시되는 영역입니다. 관리자 페이지에서 배너 내용을 설정할 수
            있습니다.
          </p>
          <a
            href="#"
            className="inline-block rounded-lg bg-white px-6 py-3 font-medium text-blue-600 transition-colors hover:bg-blue-50"
          >
            자세히 보기
          </a>
        </div>
      </div>
    </div>
  );
}
