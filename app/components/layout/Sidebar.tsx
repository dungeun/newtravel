'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  HomeIcon,
  UsersIcon,
  FolderIcon,
  CalendarIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  XMarkIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronUpIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  Squares2X2Icon,
  SwatchIcon,
} from '@heroicons/react/24/solid';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface NavigationItem {
  name: string;
  href?: string;
  icon?: any;
  children?: NavigationItem[];
  submenu?: NavigationItem[];
}

const boardMenus: NavigationItem[] = [
  { name: '자유게시판', href: '/board/free' },
  { name: 'OTT 게시판', href: '/board/ott' },
  { name: '메인뉴스', href: '/board/mainnews' },
  { name: '이슈', href: '/board/Issue' },
];

const adminMenus: NavigationItem[] = [
  {
    name: '대시보드',
    href: '/dashboard',
    icon: Squares2X2Icon,
  },
  {
    name: '사용자 관리',
    href: '/dashboard/users',
    icon: UserGroupIcon,
  },
  {
    name: '게시판 관리',
    href: '/dashboard/boards',
    icon: ClipboardDocumentListIcon,
    submenu: boardMenus,
  },
  {
    name: '디자인 관리',
    href: '/dashboard/design',
    icon: SwatchIcon,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const toggleExpand = (name: string) => {
    setExpandedItems(prev =>
      prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name]
    );
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const renderNavigationItem = (item: NavigationItem) => {
    const isActive = pathname === item.href;
    const isExpanded = expandedItems.includes(item.name);
    const Icon = item.icon;

    return (
      <div key={item.name}>
        {item.href ? (
          <Link
            href={item.href}
            className={`group flex gap-x-3 rounded-xl p-2 text-sm leading-6 ${
              isActive ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            {Icon && (
              <Icon
                className={`size-6 shrink-0 ${isActive ? 'text-white' : 'text-gray-600'}`}
                aria-hidden="true"
              />
            )}
            {!isCollapsed && item.name}
          </Link>
        ) : (
          <button
            onClick={() => toggleExpand(item.name)}
            className="flex w-full items-center justify-between rounded-xl p-2 text-left text-sm leading-6 text-gray-700 hover:bg-gray-200"
          >
            <div className="flex gap-x-3">
              {Icon && <Icon className="size-6 shrink-0 text-gray-600" aria-hidden="true" />}
              {!isCollapsed && item.name}
            </div>
            {!isCollapsed && (
              <ChevronUpIcon
                className={`size-5 shrink-0 text-gray-600 transition-transform ${
                  isExpanded ? '' : 'rotate-180'
                }`}
              />
            )}
          </button>
        )}

        {item.submenu && isExpanded && !isCollapsed && (
          <ul role="list" className="mt-1 px-8">
            {item.submenu.map(subitem => (
              <li key={subitem.name}>
                <Link
                  href={subitem.href || '#'}
                  className={`block rounded-lg py-2 text-sm leading-6 ${
                    pathname === subitem.href
                      ? 'font-semibold text-black'
                      : 'text-gray-700 hover:text-black'
                  }`}
                >
                  {subitem.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <>
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-[250px] flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" className="-m-2.5 p-2.5" onClick={onClose}>
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="size-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>

                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-100 px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <button onClick={toggleSidebar} className="rounded-xl p-2 hover:bg-gray-200">
                      {isCollapsed ? (
                        <ChevronDoubleRightIcon className="size-8 text-gray-600" />
                      ) : (
                        <ChevronDoubleLeftIcon className="size-8 text-gray-600" />
                      )}
                    </button>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {adminMenus.map(renderNavigationItem)}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      <div
        className={`hidden transition-all duration-300 lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col ${
          isCollapsed ? 'lg:w-[80px]' : 'lg:w-[250px]'
        }`}
      >
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-gray-100 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center justify-center">
            <button onClick={toggleSidebar} className="rounded-xl p-2 hover:bg-gray-200">
              {isCollapsed ? (
                <ChevronDoubleRightIcon className="size-8 text-gray-600" />
              ) : (
                <ChevronDoubleLeftIcon className="size-8 text-gray-600" />
              )}
            </button>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {adminMenus.map(renderNavigationItem)}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
