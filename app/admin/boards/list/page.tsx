'use client';

import React, { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { Transition, Dialog } from '@headlessui/react';
import { db } from '@/firebase/config';
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
import DashboardLayout from '@/components/layout/DashboardLayout';

interface Board {
  id: string;
  name: string;
  url: string;
  type: number;
  adminLevel: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  viewCount: number;
  postCount: number;
  description: string;
}

const boardTypes = [
  {
    id: 1,
    name: '맛집 게시판',
    color: 'bg-orange-100 text-orange-800',
    description: '맛집 정보를 공유하는 게시판입니다.',
  },
  {
    id: 2,
    name: '뉴스 게시판',
    color: 'bg-blue-100 text-blue-800',
    description: '최신 뉴스를 공유하는 게시판입니다.',
  },
  {
    id: 3,
    name: '유튜브 게시판',
    color: 'bg-red-100 text-red-800',
    description: '유튜브 컨텐츠를 공유하는 게시판입니다.',
  },
  {
    id: 4,
    name: '자유 게시판',
    color: 'bg-green-100 text-green-800',
    description: '자유로운 주제로 소통하는 게시판입니다.',
  },
  {
    id: 5,
    name: '질문 게시판',
    color: 'bg-purple-100 text-purple-800',
    description: '질문과 답변을 나누는 게시판입니다.',
  },
  {
    id: 6,
    name: '정보 게시판',
    color: 'bg-yellow-100 text-yellow-800',
    description: '유용한 정보를 공유하는 게시판입니다.',
  },
  {
    id: 7,
    name: '후기 게시판',
    color: 'bg-pink-100 text-pink-800',
    description: '다양한 후기를 공유하는 게시판입니다.',
  },
  {
    id: 8,
    name: '공지사항',
    color: 'bg-gray-100 text-gray-800',
    description: '공지사항을 전달하는 게시판입니다.',
  },
  {
    id: 9,
    name: '이벤트',
    color: 'bg-indigo-100 text-indigo-800',
    description: '이벤트 정보를 공유하는 게시판입니다.',
  },
  {
    id: 10,
    name: '기타',
    color: 'bg-teal-100 text-teal-800',
    description: '기타 주제의 게시판입니다.',
  },
];

// 날짜 포맷팅 함수 추가
const formatDate = (timestamp: Timestamp | null) => {
  if (!timestamp) return '-';
  return timestamp.toDate().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export default function BoardsListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newBoard, setNewBoard] = useState({
    name: '',
    type: 1,
    url: '',
    urlError: '',
    adminLevel: 1,
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editBoard, setEditBoard] = useState({
    id: '',
    name: '',
    type: 1,
    url: '',
    urlError: '',
    adminLevel: 1,
  });
  const itemsPerPage = 30;

  // 게시판 목록 불러오기
  const fetchBoards = async () => {
    try {
      const boardsRef = collection(db, 'boards');
      const q = query(boardsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const boardsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          url: data.url || '',
          type: data.type || 1,
          adminLevel: data.adminLevel || 1,
          createdAt: data.createdAt || null,
          updatedAt: data.updatedAt || null,
          viewCount: data.viewCount || 0,
          postCount: data.postCount || 0,
          description: data.description || '',
        };
      }) as Board[];

      setBoards(boardsData);
    } catch (error) {
      console.error('게시판 목록을 불러오는 중 오류가 발생했습니다:', error);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const validateUrl = async (url: string) => {
    if (!url.trim()) {
      return '게시판 URL을 입력해주세요.';
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(url)) {
      return 'URL은 영문자, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능합니다.';
    }

    // URL 중복 검사
    const boardsRef = collection(db, 'boards');
    const q = query(boardsRef, where('url', '==', url));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return '이미 사용 중인 URL입니다.';
    }

    return '';
  };

  const handleUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    const error = await validateUrl(url);
    setNewBoard({ ...newBoard, url, urlError: error });
  };

  const handleCreateBoard = async () => {
    const urlError = await validateUrl(newBoard.url);
    if (urlError) {
      setNewBoard({ ...newBoard, urlError });
      return;
    }

    if (!newBoard.name.trim()) {
      alert('게시판 제목을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const boardsRef = collection(db, 'boards');
      const selectedType = boardTypes.find(type => type.id === newBoard.type);

      const boardData = {
        name: newBoard.name.trim(),
        url: newBoard.url.trim(),
        type: newBoard.type,
        adminLevel: Number(newBoard.adminLevel),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        viewCount: 0,
        postCount: 0,
        description: selectedType?.description || '',
      };

      await addDoc(boardsRef, boardData);

      setIsCreateModalOpen(false);
      setNewBoard({
        name: '',
        type: 1,
        url: '',
        urlError: '',
        adminLevel: 1,
      });
      fetchBoards();
      alert('게시판이 성공적으로 생성되었습니다.');
    } catch (error) {
      console.error('게시판 생성 실패:', error);
      alert('게시판 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    if (!window.confirm('정말로 이 게시판을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'boards', boardId));
      fetchBoards();
      setIsSlideOverOpen(false);
    } catch (error) {
      console.error('게시판 삭제 실패:', error);
      alert('게시판 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleEditBoard = (board: Board) => {
    setEditBoard({
      id: board.id,
      name: board.name,
      type: board.type,
      url: board.url,
      urlError: '',
      adminLevel: board.adminLevel,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    // URL 유효성 검사 (수정)
    if (!editBoard.url.trim()) {
      setEditBoard({ ...editBoard, urlError: '게시판 URL을 입력해주세요.' });
      return;
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(editBoard.url)) {
      setEditBoard({
        ...editBoard,
        urlError: 'URL은 영문자, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능합니다.',
      });
      return;
    }

    // URL 중복 검사 (현재 수정 중인 게시판 제외)
    const boardsRef = collection(db, 'boards');
    const q = query(boardsRef, where('url', '==', editBoard.url.trim()));
    const querySnapshot = await getDocs(q);

    let isDuplicate = false;
    querySnapshot.forEach(doc => {
      if (doc.id !== editBoard.id) {
        isDuplicate = true;
      }
    });

    if (isDuplicate) {
      setEditBoard({ ...editBoard, urlError: '이미 사용 중인 URL입니다.' });
      return;
    }
    // 유효성 검사 통과 시 에러 메시지 초기화
    setEditBoard({ ...editBoard, urlError: '' });

    if (!editBoard.name.trim()) {
      alert('게시판 제목을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const boardRef = doc(db, 'boards', editBoard.id);
      const selectedType = boardTypes.find(type => type.id === editBoard.type);

      const boardData = {
        name: editBoard.name.trim(),
        url: editBoard.url.trim(),
        type: editBoard.type,
        adminLevel: Number(editBoard.adminLevel),
        updatedAt: serverTimestamp(),
        description: selectedType?.description || '',
      };

      await updateDoc(boardRef, boardData);
      setIsEditModalOpen(false);
      fetchBoards();
      alert('게시판이 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('게시판 수정 실패:', error);
      alert('게시판 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewBoard = (board: Board) => {
    if (!board) return;
    setSelectedBoard(board);
    setIsSlideOverOpen(true);
  };

  const filteredBoards = boards.filter(board => {
    if (!board) return false;

    const searchTermLower = searchTerm.toLowerCase();
    const nameMatch = board.name ? board.name.toLowerCase().includes(searchTermLower) : false;
    const adminLevelMatch = board.adminLevel
      ? board.adminLevel.toString().includes(searchTerm)
      : false;
    const typeMatch = board.type ? board.type.toString().includes(searchTerm) : false;
    const idMatch = board.id ? board.id.toString().includes(searchTerm) : false;

    return nameMatch || adminLevelMatch || typeMatch || idMatch;
  });

  const totalPages = Math.ceil(filteredBoards.length / itemsPerPage);
  const currentBoards = filteredBoards.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = () => {
    setCurrentPage(1);
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">전체 게시판</h1>
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">게시판 관리</h1>
            <p className="mt-2 text-sm text-gray-700">게시판을 생성하고 관리할 수 있습니다.</p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex w-[160px] items-center justify-center rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              <PlusIcon className="mr-2 size-5" />
              게시판 생성
            </button>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden rounded-2xl shadow ring-1 ring-black ring-opacity-5">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="w-20 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900"
                      >
                        번호
                      </th>
                      <th
                        scope="col"
                        className="w-1/4 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900"
                      >
                        제목
                      </th>
                      <th
                        scope="col"
                        className="w-1/8 px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        URL
                      </th>
                      <th
                        scope="col"
                        className="w-1/8 px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        타입
                      </th>
                      <th
                        scope="col"
                        className="w-1/8 px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        관리자레벨
                      </th>
                      <th
                        scope="col"
                        className="w-1/8 px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        생성일
                      </th>
                      <th
                        scope="col"
                        className="w-1/8 px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        조회수
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {currentBoards.map((board, index) => (
                      <tr key={board.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                          {filteredBoards.length - (currentPage - 1) * itemsPerPage - index}
                        </td>
                        <td className="flex items-center gap-2 whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                          <span
                            onClick={() => handleViewBoard(board)}
                            className="cursor-pointer hover:text-blue-600"
                          >
                            {board.name}
                          </span>
                          <Link
                            href={`/board/${board.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-600"
                          >
                            <ArrowTopRightOnSquareIcon className="size-4" />
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {board.url}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${boardTypes.find(type => type.id === board.type)?.color || 'bg-gray-100 text-gray-800'}`}
                          >
                            {boardTypes.find(type => type.id === board.type)?.name || '미지정'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {board.adminLevel}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatDate(board.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {board.viewCount}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <button
                            onClick={() => handleEditBoard(board)}
                            className="mr-4 text-blue-600 hover:text-blue-900"
                          >
                            <PencilSquareIcon className="size-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBoard(board.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="size-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            총 <span className="font-medium">{filteredBoards.length}</span> 개의 게시판
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

        {/* 게시판 생성 모달 */}
        <Transition.Root show={isCreateModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={setIsCreateModalOpen}>
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
                              새 게시판 생성
                            </h2>
                            <div className="ml-3 flex h-7 items-center">
                              <button
                                type="button"
                                className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                                onClick={() => setIsCreateModalOpen(false)}
                              >
                                <span className="sr-only">Close panel</span>
                                <XMarkIcon className="size-6" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="relative flex-1 px-4 sm:px-6">
                          <div className="space-y-6">
                            <div>
                              <label
                                htmlFor="board-name"
                                className="block text-sm font-medium text-gray-700"
                              >
                                게시판 제목
                              </label>
                              <input
                                type="text"
                                id="board-name"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                value={newBoard.name}
                                onChange={e => setNewBoard({ ...newBoard, name: e.target.value })}
                                placeholder="게시판 제목을 입력하세요"
                              />
                            </div>

                            <div>
                              <label
                                htmlFor="board-url"
                                className="block text-sm font-medium text-gray-700"
                              >
                                게시판 URL (영문, 숫자, -, _ 만 가능)
                              </label>
                              <div className="relative mt-1 rounded-md shadow-sm">
                                <input
                                  type="text"
                                  id="board-url"
                                  className={`block w-full min-w-0 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${newBoard.urlError ? 'border-red-500' : ''}`}
                                  value={newBoard.url}
                                  onChange={handleUrlChange}
                                  placeholder="example-board"
                                />
                              </div>
                              {newBoard.urlError && (
                                <p className="mt-1 text-sm text-red-600">{newBoard.urlError}</p>
                              )}
                            </div>

                            <div>
                              <label
                                htmlFor="board-type"
                                className="block text-sm font-medium text-gray-700"
                              >
                                게시판 타입
                              </label>
                              <select
                                id="board-type"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                value={newBoard.type}
                                onChange={e =>
                                  setNewBoard({ ...newBoard, type: Number(e.target.value) })
                                }
                              >
                                {boardTypes.map(type => (
                                  <option key={type.id} value={type.id}>
                                    {type.id}. {type.name} - {type.description}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label
                                htmlFor="admin-level"
                                className="block text-sm font-medium text-gray-700"
                              >
                                관리자 레벨 (1-10)
                              </label>
                              <input
                                type="number"
                                id="admin-level"
                                min="1"
                                max="10"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                value={newBoard.adminLevel}
                                onChange={e => {
                                  const level = parseInt(e.target.value, 10);
                                  if (!isNaN(level) && level >= 1 && level <= 10) {
                                    setNewBoard({ ...newBoard, adminLevel: level });
                                  } else if (e.target.value === '') {
                                    setNewBoard({ ...newBoard, adminLevel: '' } as any);
                                  }
                                }}
                                placeholder="1"
                              />
                            </div>

                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={handleCreateBoard}
                                disabled={isLoading}
                                className="flex-1 rounded-full bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50"
                              >
                                {isLoading ? '생성 중...' : '생성하기'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="flex-1 rounded-full bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
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

        {/* 게시판 수정 모달 */}
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
                              게시판 수정
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

                        <div className="relative flex-1 px-4 sm:px-6">
                          <div className="space-y-6">
                            <div>
                              <label
                                htmlFor="edit-board-name"
                                className="block text-sm font-medium text-gray-700"
                              >
                                게시판 제목
                              </label>
                              <input
                                type="text"
                                id="edit-board-name"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                value={editBoard.name}
                                onChange={e => setEditBoard({ ...editBoard, name: e.target.value })}
                                placeholder="게시판 제목을 입력하세요"
                              />
                            </div>

                            <div>
                              <label
                                htmlFor="edit-board-url"
                                className="block text-sm font-medium text-gray-700"
                              >
                                게시판 URL (영문, 숫자, -, _ 만 가능)
                              </label>
                              <div className="relative mt-1 rounded-md shadow-sm">
                                <input
                                  type="text"
                                  name="edit-board-url"
                                  id="edit-board-url"
                                  value={editBoard.url}
                                  onChange={e =>
                                    setEditBoard({
                                      ...editBoard,
                                      url: e.target.value,
                                      urlError: '',
                                    })
                                  }
                                  className={`block w-full min-w-0 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${editBoard.urlError ? 'border-red-500' : ''}`}
                                  placeholder="example-board"
                                />
                              </div>
                              {editBoard.urlError && (
                                <p className="mt-1 text-sm text-red-600">{editBoard.urlError}</p>
                              )}
                            </div>

                            <div>
                              <label
                                htmlFor="edit-board-type"
                                className="block text-sm font-medium text-gray-700"
                              >
                                게시판 타입
                              </label>
                              <select
                                id="edit-board-type"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                value={editBoard.type}
                                onChange={e =>
                                  setEditBoard({ ...editBoard, type: Number(e.target.value) })
                                }
                              >
                                {boardTypes.map(type => (
                                  <option key={type.id} value={type.id}>
                                    {type.id}. {type.name} - {type.description}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label
                                htmlFor="edit-admin-level"
                                className="block text-sm font-medium text-gray-700"
                              >
                                관리자 레벨
                              </label>
                              <select
                                id="edit-admin-level"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                value={editBoard.adminLevel}
                                onChange={e =>
                                  setEditBoard({ ...editBoard, adminLevel: Number(e.target.value) })
                                }
                              >
                                {[...Array(10)].map((_, i) => (
                                  <option key={i + 1} value={i + 1}>
                                    레벨 {i + 1}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={handleEditSubmit}
                                disabled={isLoading}
                                className="flex-1 rounded-full bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50"
                              >
                                {isLoading ? '수정 중...' : '수정'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 rounded-full bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
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

        {/* 게시판 상세 정보 슬라이드 오버 */}
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
                              게시판 상세 정보
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
                        <div className="relative flex-1 px-4 sm:px-6">
                          {selectedBoard && (
                            <div className="space-y-6">
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">게시판 ID</h3>
                                <p className="mt-1 text-sm text-gray-900">{selectedBoard.id}</p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">게시판 제목</h3>
                                <p className="mt-1 text-sm text-gray-900">{selectedBoard.name}</p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">게시판 타입</h3>
                                <span
                                  className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${boardTypes.find(type => type.id === selectedBoard.type)?.color || 'bg-gray-100 text-gray-800'}`}
                                >
                                  {boardTypes.find(type => type.id === selectedBoard.type)?.name ||
                                    '미지정'}
                                </span>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">관리자레벨</h3>
                                <p className="mt-1 text-sm text-gray-900">
                                  {selectedBoard.adminLevel}
                                </p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">작성일</h3>
                                <p className="mt-1 text-sm text-gray-900">
                                  {formatDate(selectedBoard.createdAt)}
                                </p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">통계</h3>
                                <div className="mt-1 grid grid-cols-2 gap-4">
                                  <div className="rounded-lg bg-gray-50 p-3">
                                    <p className="text-xs text-gray-500">조회수</p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {selectedBoard.viewCount}
                                    </p>
                                  </div>
                                  <div className="rounded-lg bg-gray-50 p-3">
                                    <p className="text-xs text-gray-500">게시글 수</p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {selectedBoard.postCount}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleEditBoard(selectedBoard)}
                                  className="flex-1 rounded-full bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                                >
                                  <PencilSquareIcon className="mr-1 inline-block size-5" />
                                  수정
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBoard(selectedBoard.id)}
                                  className="flex-1 rounded-full bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
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
      </div>
    </div>
  );
}
