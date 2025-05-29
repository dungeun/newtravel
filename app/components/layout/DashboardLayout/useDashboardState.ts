import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';

/**
 * 대시보드 레이아웃 상태 관리 훅
 * 사이드바 확장/축소 상태와 메뉴 열림/닫힘 상태를 관리합니다.
 */
export function useDashboardState() {
  const pathname = usePathname();
  
  // 사이드바 상태
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // 메뉴 확장 상태
  const [isDesignOpen, setDesignOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isUsersOpen, setUsersOpen] = useState(false);
  const [isBoardsOpen, setBoardsOpen] = useState(false);

  // 메뉴 상태 localStorage에서 불러오기
  useEffect(() => {
    const savedDesignState = localStorage.getItem('designMenuOpen');
    const savedSettingsState = localStorage.getItem('settingsMenuOpen');
    const savedUsersState = localStorage.getItem('usersMenuOpen');
    const savedBoardsState = localStorage.getItem('boardsMenuOpen');
    const savedSidebarState = localStorage.getItem('sidebarCollapsed');

    if (savedDesignState !== null) setDesignOpen(JSON.parse(savedDesignState));
    if (savedSettingsState !== null) setSettingsOpen(JSON.parse(savedSettingsState));
    if (savedUsersState !== null) setUsersOpen(JSON.parse(savedUsersState));
    if (savedBoardsState !== null) setBoardsOpen(JSON.parse(savedBoardsState));
    if (savedSidebarState !== null) setSidebarCollapsed(JSON.parse(savedSidebarState));
  }, []);

  // 화면 크기 변경에 따른 사이드바 자동 접기/펼치기
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setSidebarCollapsed(window.innerWidth < 768);
      }
    };

    // 초기 실행
    handleResize();

    // 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);

    // 클린업
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 메뉴 상태 변경 처리 (useCallback으로 최적화)
  const handleMenuToggle = useCallback((menu: 'design' | 'settings' | 'users' | 'boards') => {
    switch (menu) {
      case 'design':
        setDesignOpen(prev => {
          const newState = !prev;
          localStorage.setItem('designMenuOpen', JSON.stringify(newState));
          return newState;
        });
        break;
      case 'settings':
        setSettingsOpen(prev => {
          const newState = !prev;
          localStorage.setItem('settingsMenuOpen', JSON.stringify(newState));
          return newState;
        });
        break;
      case 'users':
        setUsersOpen(prev => {
          const newState = !prev;
          localStorage.setItem('usersMenuOpen', JSON.stringify(newState));
          return newState;
        });
        break;
      case 'boards':
        setBoardsOpen(prev => {
          const newState = !prev;
          localStorage.setItem('boardsMenuOpen', JSON.stringify(newState));
          return newState;
        });
        break;
    }
  }, []);

  // 사이드바 접기/펼치기 처리 (useCallback으로 최적화)
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
      return newState;
    });
  }, []);

  // 현재 경로가 지정된 경로와 일치하는지 확인 (useCallback으로 최적화)
  const isActive = useCallback((path: string) => {
    if (!pathname) return false;
    return pathname.startsWith(path);
  }, [pathname]);

  // 메뉴 항목 데이터 (useMemo로 최적화)
  const menuItems = useMemo(() => [
    {
      title: '대시보드',
      path: '/dashboard',
      icon: 'chart',
    },
    {
      title: '게시판 관리',
      path: '/dashboard/boards',
      icon: 'clipboard',
    },
    {
      title: '회원 관리',
      path: '/dashboard/users',
      icon: 'users',
    },
    {
      title: '여행 상품 관리',
      path: '/dashboard/travel',
      icon: 'airplane',
    },
    {
      title: '디자인 관리',
      icon: 'paint',
      subItems: [
        {
          title: '템플릿 관리',
          path: '/dashboard/design',
        },
        {
          title: '이미지 관리',
          path: '/dashboard/design/image',
        },
      ],
    },
    {
      title: '설정',
      icon: 'settings',
      subItems: [
        {
          title: '기본 설정',
          path: '/dashboard/settings/basic',
        },
        {
          title: '알림 설정',
          path: '/dashboard/settings/notification',
        },
        {
          title: '보안 설정',
          path: '/dashboard/settings/security',
        },
        {
          title: '시스템 설정',
          path: '/dashboard/settings/system',
        },
      ],
    },
  ], []);

  return {
    // 상태
    isSidebarCollapsed,
    isDesignOpen,
    isSettingsOpen,
    isUsersOpen,
    isBoardsOpen,
    
    // 메서드
    toggleSidebar,
    handleMenuToggle,
    isActive,
    
    // 데이터
    menuItems,
  };
} 