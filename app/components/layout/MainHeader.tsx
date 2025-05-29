'use client';

import React, { useState, Fragment } from 'react';
import Link from 'next/link';
import { Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Navbar, NavbarMobileMenuButton, NavbarSearch } from '@/components/ui/navbar';
import { Button } from '@/components/ui/button';
import UserProfileMenu from './UserProfileMenu';

export default function MainHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 모바일 메뉴가 열렸을 때 body 스크롤 방지
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // 컴포넌트 언마운트 시 스크롤 복원
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // 네비게이션 아이템
  const navItems = [
    { href: '/', label: '홈', active: true },
    { href: '/travel/free_travel', label: '여행상품' },
    { href: '/promotion', label: '특가/프로모션' },
    { href: '/info', label: '여행정보' },
    { href: '/community', label: '커뮤니티' },
    { href: '/support', label: '예약/고객센터' },
  ];

  // 로고 컴포넌트
  const logo = (
    <Link href="/" className="text-2xl font-bold">
      <img src="/img/logo.png" alt="로고" style={{ height: 36, width: 'auto', display: 'block' }} />
    </Link>
  );

  // 오른쪽 아이템
  const rightItems = (
    <>
      <NavbarSearch placeholder="여행지, 상품명, 출발일 검색..." />
      <UserProfileMenu />
    </>
  );

  return (
    <>
      <Navbar
        logo={logo}
        items={navItems}
        rightItems={rightItems}
        mobileMenuButton={
          <NavbarMobileMenuButton onClick={() => setMobileMenuOpen(true)} />
        }
      />

      {/* 모바일 슬라이드 메뉴 */}
      <Transition show={mobileMenuOpen} as={Fragment}>
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* 오버레이 */}
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setMobileMenuOpen(false)}
            />
          </Transition.Child>

          {/* 슬라이드 메뉴 패널 */}
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-background">
              {/* 닫기 버튼 */}
              <div className="absolute right-0 top-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex size-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <XMarkIcon className="size-6 text-white" aria-hidden="true" />
                </button>
              </div>

              {/* 메뉴 내용 */}
              <div className="h-0 flex-1 overflow-y-auto pb-4 pt-5">
                <div className="flex shrink-0 items-center px-4">
                  <Link
                    href="/"
                    className="text-2xl font-bold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <img src="/img/logo.png" alt="로고" style={{ height: 36, width: 'auto', display: 'block' }} />
                  </Link>
                </div>
                
                {/* 모바일 네비게이션 메뉴 */}
                <div className="mt-5 px-2">
                  {navItems.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      className={`flex items-center rounded-md p-2 mb-1 text-sm font-medium ${
                        item.active 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="mt-6 border-t pt-4">
                  <nav className="space-y-1 px-2">
                    {session ? (
                      <>
                        <Link
                          href="/dashboard"
                          className="flex items-center rounded-md p-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <UserCircleIcon className="mr-3 size-5" />
                          내 정보
                        </Link>
                        <button
                          onClick={() => {
                            signOut();
                            setMobileMenuOpen(false);
                          }}
                          className="flex w-full items-center rounded-md p-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          <ArrowRightOnRectangleIcon className="mr-3 size-5" />
                          로그아웃
                        </button>
                      </>
                    ) : (
                      <Link
                        href="/login"
                        className="flex items-center rounded-md p-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <ArrowRightOnRectangleIcon className="mr-3 size-5" />
                        로그인
                      </Link>
                    )}
                  </nav>
                </div>
              </div>
            </div>
          </Transition.Child>
          <div className="w-14 shrink-0" aria-hidden="true">
            {/* Dummy element to force sidebar to shrink to fit close icon */}
          </div>
        </div>
      </Transition>
    </>
  );
}
