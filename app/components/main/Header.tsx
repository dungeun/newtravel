'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { MdAdminPanelSettings } from 'react-icons/md';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { 
  ArrowRightOnRectangleIcon, 
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  HeartIcon,
  ClipboardDocumentCheckIcon,
  UserIcon
} from '@heroicons/react/24/outline';

// 네비게이션 아이템 컴포넌트
interface NavItemProps {
  title: string;
  submenu?: { title: string; link: string }[];
}

const NavItem = ({ title, submenu }: NavItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <li
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a href="#" className="block px-4 py-3 font-medium hover:bg-teal-600">
        {title}
      </a>
      {submenu && (
        <div
          className={`absolute left-0 z-50 w-48 bg-white text-gray-800 shadow-lg transition-all ${
            isHovered ? 'visible opacity-100' : 'invisible opacity-0'
          }`}
        >
          <ul>
            {submenu.map((item, index) => (
              <li key={index}>
                <a
                  href={item.link}
                  className="block border-b border-gray-100 px-4 py-2 hover:bg-teal-50"
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};

// 모바일 네비게이션 아이템 컴포넌트
interface MobileNavItemProps {
  title: string;
  link: string;
}

const MobileNavItem = ({ title, link }: MobileNavItemProps) => (
  <li>
    <a href={link} className="block px-4 py-2 hover:bg-gray-100">
      {title}
    </a>
  </li>
);

interface Logo {
  imageUrl: string;
  darkModeImageUrl?: string;
  altText: string;
  linkUrl: string;
}

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logo, setLogo] = useState<Logo | null>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  // 스크롤 효과
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 로고 정보 가져오기
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const logoDoc = await getDoc(doc(db, 'settings', 'logo'));
        if (logoDoc.exists()) {
          setLogo(logoDoc.data() as Logo);
        }
      } catch (error) {
        console.error('로고 정보를 불러오는데 실패했습니다:', error);
      }
    };

    fetchLogo();
  }, []);

  return (
    <header className={`sticky top-0 z-50 bg-white shadow-md transition-all mb-0 ${scrolled ? 'py-1' : 'py-2'}`}>
      <div className="container mx-auto">
        {/* 메인 헤더 */}
        <div className="flex items-center justify-between p-4">
          {/* 로고 */}
          <div className="flex items-center">
            <a href="/" className="block">
              {logo ? (
                <img 
                  src={logo.imageUrl} 
                  alt={logo.altText || "초원의별"} 
                  className="h-14 w-auto" 
                />
              ) : (
                <img src="/img/logo.png" alt="초원의별" className="h-14 w-auto" />
              )}
            </a>
          </div>

          {/* 검색바 */}
          <div className="mx-8 hidden w-72 md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="여행지, 상품명, 출발일 검색..."
                className="w-full rounded-full border border-gray-300 p-2.5 pl-4 pr-10 text-gray-700 bg-white placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* 헤더 아이콘 */}
          <div className="hidden items-center gap-4 md:flex">
            {/* 좋아요 목록 */}
            <button
              onClick={() => {
                if (!user) router.push('/login');
                else router.push('/mypage/favorites');
              }}
              className="flex items-center justify-center rounded-full p-2 text-gray-600 transition-all hover:-translate-y-0.5 hover:text-teal-600"
              title="좋아요 목록"
            >
              <HeartIcon className="h-6 w-6 stroke-1" />
            </button>
            
            {/* 예약확인 */}
            <button
              onClick={() => {
                if (!user) router.push('/login');
                else router.push('/mypage/orders');
              }}
              className="flex items-center justify-center rounded-full p-2 text-gray-600 transition-all hover:-translate-y-0.5 hover:text-teal-600"
              title="예약확인"
            >
              <ClipboardDocumentCheckIcon className="h-6 w-6 stroke-1" />
            </button>
            {/* 관리자 아이콘: 어드민만 노출 */}
            {user?.role === 'admin' && (
              <button
                onClick={() => router.push('/admin')}
                className="flex size-10 items-center justify-center rounded-full bg-gray-100 text-indigo-600 transition-all hover:-translate-y-0.5 hover:bg-indigo-100 hover:text-indigo-800"
                title="관리자 페이지"
              >
                <MdAdminPanelSettings className="text-2xl" />
              </button>
            )}
            {/* 로그인/로그아웃/마이페이지 */}
            {!user ? (
              <button
                onClick={() => router.push('/login')}
                className="flex items-center justify-center rounded-full p-2 text-gray-600 transition-all hover:-translate-y-0.5 hover:text-teal-600"
                title="로그인"
              >
                <UserIcon className="h-6 w-6 stroke-1" />
              </button>
            ) : (
              <>
                {/* 닉네임(이름) 표시 */}
                <span className="font-medium text-gray-700">{user.displayName || '이름 없음'}님</span>
                {/* 로그아웃 */}
                <button
                  onClick={logout}
                  className="flex items-center justify-center rounded-full p-2 text-gray-600 transition-all hover:-translate-y-0.5 hover:text-teal-600"
                  title="로그아웃"
                >
                  <ArrowLeftOnRectangleIcon className="h-6 w-6 stroke-1" />
                </button>
              </>
            )}
          </div>

          {/* 모바일 메뉴 토글 버튼 */}
          <button
            className="text-gray-600 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* 메인 네비게이션 */}
      <nav className="bg-teal-500 text-white">
        <div className="container mx-auto">
          <div className="hidden md:block">
            <ul className="flex">
              <NavItem title="홈" />
              <NavItem
                title="여행상품"
                submenu={[
                  { title: '지역별 여행', link: '#' },
                  { title: '테마별 여행', link: '#' },
                  { title: '일정별 여행', link: '#' },
                  { title: '시즌별 여행', link: '#' },
                ]}
              />
              <NavItem
                title="특가/프로모션"
                submenu={[
                  { title: '타임딜', link: '#' },
                  { title: '얼리버드', link: '#' },
                  { title: '시즌 특가', link: '#' },
                ]}
              />
              <NavItem
                title="여행정보"
                submenu={[
                  { title: '몽골 소개', link: '#' },
                  { title: '여행 준비', link: '#' },
                  { title: '현지 정보', link: '#' },
                  { title: '주의사항', link: '#' },
                ]}
              />
              <NavItem
                title="커뮤니티"
                submenu={[
                  { title: '여행 후기', link: '#' },
                  { title: '여행 Q&A', link: '#' },
                  { title: '동행 찾기', link: '#' },
                ]}
              />
              <NavItem
                title="예약/고객센터"
                submenu={[
                  { title: '예약 관리', link: '#' },
                  { title: '고객 지원', link: '#' },
                  { title: '연락처', link: '#' },
                ]}
              />
            </ul>
          </div>
        </div>
      </nav>

      {/* 모바일 메뉴 - 모바일에서만 표시 */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <ul className="py-2">
            <MobileNavItem title="홈" link="#" />
            <MobileNavItem title="여행상품" link="#" />
            <MobileNavItem title="특가/프로모션" link="#" />
            <MobileNavItem title="여행정보" link="#" />
            <MobileNavItem title="커뮤니티" link="#" />
            <MobileNavItem title="예약/고객센터" link="#" />
            {!user ? (
              <li>
                <button 
                  onClick={() => router.push('/login')}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-gray-100"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 stroke-1" />
                  <span>로그인</span>
                </button>
              </li>
            ) : (
              <>
                <li>
                  <button 
                    onClick={() => router.push('/mypage/favorites')}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-gray-100"
                  >
                    <HeartIcon className="h-5 w-5 stroke-1" />
                    <span>좋아요 목록</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => router.push('/mypage/orders')}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-gray-100"
                  >
                    <ClipboardDocumentCheckIcon className="h-5 w-5 stroke-1" />
                    <span>예약확인</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={logout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-gray-100"
                  >
                    <ArrowLeftOnRectangleIcon className="h-5 w-5 stroke-1" />
                    <span>로그아웃</span>
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
