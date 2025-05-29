'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  getDocs,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  where,
  updateDoc,
} from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
// Removed DashboardLayout import to prevent duplicate sidebar
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { Identifier, XYCoord } from 'dnd-core';
import Link from 'next/link';

interface MenuItem {
  id: string;
  title: string;
  description: string;
  type: 'banner' | 'menu';
  link: string;
  imageUrl: string;
  order: number;
  parentId: null;
  isVisible: boolean;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const menuTypes = [
  { name: '최상위메뉴', color: 'bg-gray-100 text-gray-800', description: '최상위 메뉴입니다.' },
  { name: '서브메뉴', color: 'bg-blue-100 text-blue-800', description: '하위 메뉴입니다.' },
  { name: '외부링크', color: 'bg-green-100 text-green-800', description: '외부 링크입니다.' },
];

const defaultMenuItem: MenuItem = {
  id: '',
  title: '',
  description: '',
  type: 'menu',
  link: '',
  imageUrl: '',
  order: 0,
  parentId: null,
  isVisible: true,
};

export default function MenusPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newMenu, setNewMenu] = useState({
    title: '',
    description: '',
    type: 'menu',
    link: '',
    imageUrl: '',
    order: 0,
    parentId: null,
    isVisible: true,
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMenu, setEditMenu] = useState<MenuItem>(defaultMenuItem);
  const itemsPerPage = 30;

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    const menuQuery = query(collection(db, 'menus'), orderBy('order', 'asc'));
    const snapshot = await getDocs(menuQuery);
    const menuData = snapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as MenuItem
    );
    setMenus(menuData);
  };

  const handleSave = async (menu: Partial<MenuItem>) => {
    try {
      if (editMenu.id) {
        // 수정
        await updateDoc(doc(db, 'menus', editMenu.id), menu);
      } else {
        // 새로 추가
        const newMenu = {
          ...defaultMenuItem,
          ...menu,
          createdAt: serverTimestamp(),
        };
        await addDoc(collection(db, 'menus'), newMenu);
      }

      setIsEditModalOpen(false);
      fetchMenus(); // 메뉴 목록 새로고침
    } catch (error) {
      console.error('메뉴 저장 중 오류 발생:', error);
      alert('메뉴 저장에 실패했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'menus', id));
    fetchMenus();
  };

  const handleOrderChange = async (dragIndex: number, hoverIndex: number) => {
    const newMenus = [...menus];
    const draggedItem = newMenus[dragIndex];
    newMenus.splice(dragIndex, 1);
    newMenus.splice(hoverIndex, 0, draggedItem);

    // 순서 업데이트
    const updates = newMenus.map((menu, index) =>
      updateDoc(doc(db, 'menus', menu.id), { order: index + 1 })
    );
    await Promise.all(updates);
    fetchMenus();
  };

  const handleViewMenu = (menu: MenuItem) => {
    if (!menu) return;
    setSelectedMenu(menu);
    setIsSlideOverOpen(true);
  };

  const filteredMenus = menus.filter(
    menu =>
      menu.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      menu.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      menu.id.toString().includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredMenus.length / itemsPerPage);
  const currentMenus = filteredMenus.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const dashboardMenus = [
    {
      title: '게시판 관리',
      description: '게시판을 생성하고 관리합니다.',
      href: '/dashboard/boards',
    },
    {
      title: '디자인 관리',
      description: '메인 페이지 템플릿과 디자인을 관리합니다.',
      href: '/dashboard/design',
    },
  ];

  return (
      <div className="py-6">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* 브레드크럼 네비게이션 */}
          <div className="mb-4">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <div className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300">관리자</div>
                </li>
                <li>
                  <span className="mx-2 text-gray-400 dark:text-slate-500">/</span>
                  <span className="text-gray-900 dark:text-slate-100">메뉴 관리</span>
                </li>
              </ol>
            </nav>
          </div>

          {/* 헤더와 검색 영역 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">메뉴 관리</h1>
              <p className="mt-2 text-sm text-gray-700 dark:text-slate-300">
                웹사이트의 메뉴를 관리합니다. 드래그 앤 드롭으로 순서를 변경할 수 있습니다.
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* 메뉴 생성 버튼 */}
              <button
                onClick={() => {
                  setEditMenu(defaultMenuItem);
                  setIsEditModalOpen(true);
                }}
                className="ml-3 inline-flex items-center rounded-md border border-transparent bg-black dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-slate-400 focus:ring-offset-2"
              >
                <PlusIcon className="size-5" />
                <span>메뉴 생성</span>
              </button>

              {/* 검색 필터 */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="검색어를 입력하세요"
                    className="rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSearch()}
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                </div>
                <button
                  onClick={handleSearch}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  검색
                </button>
              </div>
            </div>
          </div>

          {/* 테이블 */}
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  <DndProvider backend={HTML5Backend}>
                    <div className="space-y-4">
                      {currentMenus.map((menu, index) => (
                        <MenuCard
                          key={menu.id}
                          menu={menu}
                          index={index}
                          onEdit={() => {
                            setEditMenu(menu);
                            setIsEditModalOpen(true);
                          }}
                          onDelete={() => handleDelete(menu.id)}
                          onOrderChange={handleOrderChange}
                        />
                      ))}
                    </div>
                  </DndProvider>
                </div>
              </div>
            </div>
          </div>

          {/* 페이지네이션 */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              총 <span className="font-medium">{filteredMenus.length}</span> 개의 메뉴
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                이전
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = currentPage - 2 + i;
                if (pageNum > 0 && pageNum <= totalPages) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`rounded-md px-3 py-1 text-sm font-medium ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                다음
              </button>
            </div>
          </div>

          {/* 메뉴 수정 모달 */}
          <Transition.Root show={isEditModalOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={setIsEditModalOpen}>
              <div className="fixed inset-0" />

              <div className="fixed inset-0 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                  <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                    <Transition.Child
                      as={Fragment}
                      enter="transform transition ease-in-out duration-500 sm:duration-700"
                      enterFrom="translate-x-full"
                      enterTo="translate-x-0"
                      leave="transform transition ease-in-out duration-500 sm:duration-700"
                      leaveFrom="translate-x-0"
                      leaveTo="translate-x-full"
                    >
                      <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                        <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                          <div className="px-4 py-6 sm:px-6">
                            <div className="flex items-start justify-between">
                              <h2 className="text-lg font-semibold leading-6 text-gray-900">
                                메뉴 수정
                              </h2>
                              <div className="ml-3 flex h-7 items-center">
                                <button
                                  type="button"
                                  className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                                  onClick={() => setIsEditModalOpen(false)}
                                >
                                  <span className="sr-only">Close panel</span>
                                  <XMarkIcon className="size-6" aria-hidden="true" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* 메뉴 수정 폼 */}
                          <div className="relative flex-1 px-4 sm:px-6">
                            <div className="space-y-6">
                              <div>
                                <label
                                  htmlFor="edit-menu-title"
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  제목
                                </label>
                                <input
                                  type="text"
                                  id="edit-menu-title"
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                  value={editMenu.title}
                                  onChange={e =>
                                    setEditMenu({ ...editMenu, title: e.target.value })
                                  }
                                  placeholder="제목을 입력하세요"
                                />
                              </div>

                              <div>
                                <label
                                  htmlFor="edit-menu-description"
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  설명
                                </label>
                                <textarea
                                  id="edit-menu-description"
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                  value={editMenu.description}
                                  onChange={e =>
                                    setEditMenu({ ...editMenu, description: e.target.value })
                                  }
                                  rows={3}
                                />
                              </div>

                              <div>
                                <label
                                  htmlFor="edit-menu-type"
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  유형
                                </label>
                                <select
                                  id="edit-menu-type"
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                  value={editMenu.type}
                                  onChange={e =>
                                    setEditMenu({
                                      ...editMenu,
                                      type: e.target.value as 'banner' | 'menu',
                                    })
                                  }
                                >
                                  <option value="banner">배너</option>
                                  <option value="menu">메뉴 박스</option>
                                </select>
                              </div>

                              <div>
                                <label
                                  htmlFor="edit-menu-link"
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  링크
                                </label>
                                <input
                                  type="text"
                                  id="edit-menu-link"
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                  value={editMenu.link}
                                  onChange={e => setEditMenu({ ...editMenu, link: e.target.value })}
                                  placeholder="링크를 입력하세요"
                                />
                              </div>

                              <div>
                                <label
                                  htmlFor="edit-menu-imageUrl"
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  이미지 URL
                                </label>
                                <input
                                  type="text"
                                  id="edit-menu-imageUrl"
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                  value={editMenu.imageUrl}
                                  onChange={e =>
                                    setEditMenu({ ...editMenu, imageUrl: e.target.value })
                                  }
                                  placeholder="이미지 URL을 입력하세요"
                                />
                              </div>

                              <div className="flex gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleSave(editMenu)}
                                  disabled={isLoading}
                                  className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
                                >
                                  {isLoading ? '수정 중...' : '수정'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIsEditModalOpen(false)}
                                  className="flex-1 rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                                >
                                  취소
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </div>
            </Dialog>
          </Transition.Root>

          {/* 메뉴 상세 정보 슬라이드 오버 */}
          <Transition.Root show={isSlideOverOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={setIsSlideOverOpen}>
              <div className="fixed inset-0" />

              <div className="fixed inset-0 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                  <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                    <Transition.Child
                      as={Fragment}
                      enter="transform transition ease-in-out duration-500 sm:duration-700"
                      enterFrom="translate-x-full"
                      enterTo="translate-x-0"
                      leave="transform transition ease-in-out duration-500 sm:duration-700"
                      leaveFrom="translate-x-0"
                      leaveTo="translate-x-full"
                    >
                      <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                        <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                          <div className="px-4 py-6 sm:px-6">
                            <div className="flex items-start justify-between">
                              <h2 className="text-lg font-semibold leading-6 text-gray-900">
                                메뉴 상세 정보
                              </h2>
                              <div className="ml-3 flex h-7 items-center">
                                <button
                                  type="button"
                                  className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                                  onClick={() => setIsSlideOverOpen(false)}
                                >
                                  <span className="sr-only">Close panel</span>
                                  <XMarkIcon className="size-6" aria-hidden="true" />
                                </button>
                              </div>
                            </div>
                          </div>
                          {/* 메뉴 상세 정보 */}
                          <div className="relative flex-1 px-4 sm:px-6">
                            {selectedMenu && (
                              <div className="space-y-6">
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">제목</h3>
                                  <p className="mt-1 text-sm text-gray-900">{selectedMenu.title}</p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">설명</h3>
                                  <p className="mt-1 text-sm text-gray-900">
                                    {selectedMenu.description}
                                  </p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">유형</h3>
                                  <span
                                    className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${selectedMenu.type === 'banner' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}`}
                                  >
                                    {selectedMenu.type === 'banner' ? '배너' : '메뉴 박스'}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">링크</h3>
                                  <p className="mt-1 text-sm text-gray-900">
                                    {selectedMenu.link || '-'}
                                  </p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">이미지 URL</h3>
                                  <p className="mt-1 text-sm text-gray-900">
                                    {selectedMenu.imageUrl || '-'}
                                  </p>
                                </div>
                                <div className="flex gap-3">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditMenu(selectedMenu);
                                      setIsSlideOverOpen(false);
                                    }}
                                    className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                  >
                                    <PencilSquareIcon className="mr-1 inline-block size-5" />
                                    수정
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(selectedMenu.id)}
                                    className="flex-1 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                                  >
                                    <TrashIcon className="mr-1 inline-block size-5" />
                                    삭제
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </div>
            </Dialog>
          </Transition.Root>

          <div className="p-6">
            <h1 className="mb-6 text-2xl font-bold">관리자 메뉴</h1>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {dashboardMenus.map(menu => (
                <Link
                  key={menu.title}
                  href={menu.href}
                  className="block rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <h2 className="mb-2 text-xl font-semibold">{menu.title}</h2>
                  <p className="text-gray-600">{menu.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}

interface MenuCardProps {
  menu: MenuItem;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onOrderChange: (dragIndex: number, hoverIndex: number) => void;
}

function MenuCard({ menu, index, onEdit, onDelete, onOrderChange }: MenuCardProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'MENU',
    item: { index, id: menu.id, type: 'MENU' },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: 'MENU',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover: (item: DragItem, monitor) => {
      if (!item || item.index === index) {
        return;
      }
      onOrderChange(item.index, index);
      item.index = index;
    },
  });

  const dragDropRef = (node: HTMLDivElement | null) => {
    drag(drop(node));
  };

  return (
    <div
      ref={dragDropRef}
      className={`rounded-lg bg-white p-4 shadow ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">#{menu.order}</span>
            <h3 className="text-lg font-semibold">{menu.title}</h3>
            <span className="rounded bg-gray-100 px-2 py-1 text-sm">
              {menu.type === 'banner' ? '배너' : '메뉴 박스'}
            </span>
          </div>
          <p className="mt-1 text-gray-600">{menu.description}</p>
          {menu.link && <p className="mt-1 text-sm text-blue-500">링크: {menu.link}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} className="text-blue-500 hover:text-blue-600">
            수정
          </button>
          <button onClick={onDelete} className="text-red-500 hover:text-red-600">
            삭제
          </button>
        </div>
      </div>
      {menu.imageUrl && (
        <img
          src={menu.imageUrl}
          alt={menu.title}
          className="mt-2 h-32 w-full rounded object-cover"
        />
      )}
    </div>
  );
}
