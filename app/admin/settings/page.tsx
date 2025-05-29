'use client';

export default function SettingsHomePage() {
  return (
    <div className="h-full">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">설정</h1>
      <p className="text-slate-600 dark:text-slate-300 mb-8">
        사이트 관리에 필요한 다양한 설정을 변경할 수 있습니다. 왼쪽 메뉴에서 원하는 설정 카테고리를 선택하세요.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">기본 설정</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">사이트 이름, 설명, SEO 정보 등의 기본 설정을 관리합니다.</p>
          <a 
            href="/admin/settings/basic" 
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            기본 설정으로 이동 →
          </a>
        </div>
        
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">관리자 설정</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">관리자 계정 및
          접근 권한을 설정합니다.</p>
          <a 
            href="/admin/settings/admin" 
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            관리자 설정으로 이동 →
          </a>
        </div>
        
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">시스템 설정</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">서버 설정, 캐시, 성능 최적화 등 시스템 관련 설정을 관리합니다.</p>
          <a 
            href="/admin/settings/system" 
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            시스템 설정으로 이동 →
          </a>
        </div>
      </div>
    </div>
  );
} 