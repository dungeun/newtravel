'use client';

import React, { useState, useEffect, Fragment, useCallback } from 'react';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import { db } from '@/firebase/config';
import {
  collection,
  query,
  getDocs,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
  where,
  Firestore
} from 'firebase/firestore';
import { useUsers, User } from '../../hooks/useUsers';
import { formatDate } from '../utils/formatDate';

// 전화번호 형식 변환 함수
const formatPhoneNumber = (phone: string) => {
  if (!phone || phone === '없음') return '없음';
  // 숫자만 추출
  const numbers = phone.replace(/[^0-9]/g, '');
  if (numbers.length === 11) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  }
  return phone;
};

// 전화번호 유효성 검사
const validatePhoneNumber = (phone: string) => {
  if (!phone || phone === '' || phone === '없음') return true;
  const numbers = phone.replace(/[^0-9]/g, '');
  if (numbers !== phone) {
    alert('숫자만 입력해주세요. 하이픈(-)은 자동으로 추가됩니다.');
    return false;
  }
  if (numbers.length > 0 && numbers.length !== 11) {
    alert('전화번호는 11자리여야 합니다.');
    return false;
  }
  return true;
};

export default function MembersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: 'asc' | 'desc';
  }>({ key: 'id', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const { users, isLoading, error, mutate } = useUsers(statusFilter);

  // 디버깅용 코드
  console.log('사용자 데이터 상태:', { users, isLoading, error });
  
  useEffect(() => {
    if (error) {
      console.error('사용자 데이터 불러오기 오류:', error);
    }
  }, [error]);

  // 데이터가 없을 때 더미 데이터 생성
  useEffect(() => {
    if (!isLoading && users.length === 0) {
      console.log('더미 데이터 생성');
      const dummyUsers: User[] = [
        {
          id: 1,
          uid: 'user1',
          name: '홍길동',
          email: 'user1@example.com',
          phoneNumber: '010-1234-5678',
          level: '1',
          status: 'active',
          joinDate: '2023-01-01',
          lastLogin: '2023-05-01',
          loginCount: 10
        },
        {
          id: 2,
          uid: 'user2',
          name: '김영희',
          email: 'user2@example.com',
          phoneNumber: '010-2345-6789',
          level: '2',
          status: 'active',
          joinDate: '2023-02-01',
          lastLogin: '2023-05-10',
          loginCount: 5
        },
        {
          id: 3,
          uid: 'user3',
          name: '박지우',
          email: 'user3@example.com',
          phoneNumber: '010-3456-7890',
          level: '1',
          status: 'inactive',
          joinDate: '2023-03-01',
          lastLogin: '2023-04-15',
          loginCount: 3
        }
      ];
      mutate(() => dummyUsers);
    }
  }, [isLoading, users, mutate]);

  const sortedUsers = [...users].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    const aNum = Number(aValue) || 0;
    const bNum = Number(bValue) || 0;
    return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
  });

  const filteredUsers = sortedUsers.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * 30,
    currentPage * 30
  );

  // 총 페이지 수 계산
  const totalPages = Math.ceil(filteredUsers.length / 30);

  // 페이지 변경 핸들러 - useCallback으로 최적화
  const handlePageChange = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
  }, []);

  // 검색 핸들러 - useCallback으로 최적화
  const handleSearch = useCallback(() => {
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  }, []);

  // 사용자 클릭 핸들러 - useCallback으로 최적화
  const handleUserClick = useCallback((user: User) => {
    setSelectedUser(user);
    setEditedUser(user);
    setIsDetailOpen(true);
  }, []);

  // 편집 필드 변경 핸들러 - useCallback으로 최적화
  const handleEditChange = useCallback((field: keyof User, value: string) => {
    if (editedUser) {
      setEditedUser(prev => prev ? { ...prev, [field]: value } : null);
    }
  }, [editedUser]);

  // 저장 핸들러 - useCallback으로 최적화
  const handleSave = useCallback(async () => {
    if (!db) {
      console.error('Firestore is not initialized');
      alert('데이터베이스 연결 오류가 발생했습니다.');
      return;
    }
    
    if (editedUser) {
      try {
        // uid를 사용하여 문서 참조
        const userRef = doc(db as Firestore, 'users', editedUser.uid);

        // 업데이트할 데이터
        const updateData = {
          name: editedUser.name,
          email: editedUser.email,
          phoneNumber: editedUser.phoneNumber || '',
          level: parseInt(editedUser.level),
          status: editedUser.status,
          updatedAt: serverTimestamp(),
        };

        console.log('Updating user with data:', updateData);
        await updateDoc(userRef, updateData);
        console.log('User update successful');

        // 로컬 상태 업데이트
        mutate((prevUsers: User[] = []) => prevUsers.map((user: User) => (user.uid === editedUser.uid ? editedUser : user)));
        setSelectedUser(editedUser);
        setIsEditing(false);
      } catch (error) {
        console.error('사용자 정보 업데이트 중 오류 발생:', error);
        alert('사용자 정보 업데이트에 실패했습니다.');
      }
    }
  }, [editedUser, db, mutate]);

  // 정렬 요청 핸들러 - useCallback으로 최적화
  const requestSort = useCallback((key: keyof User) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  // 전화번호 변경 핸들러 - useCallback으로 최적화
  const handlePhoneNumberChange = useCallback(async (userId: string, newPhone: string) => {
    if (!validatePhoneNumber(newPhone)) return;
    
    if (!db) {
      console.error('Firestore is not initialized');
      alert('데이터베이스 연결 오류가 발생했습니다.');
      return;
    }

    try {
      const userRef = doc(db as Firestore, 'users', userId);
      await updateDoc(userRef, {
        phoneNumber: newPhone,
      });

      // 로컬 상태 업데이트
      mutate((prevUsers: User[] = []) => prevUsers.map((user: User) => (String(user.id) === userId ? { ...user, phoneNumber: newPhone } : user)));

      if (editedUser) {
        setEditedUser(prev => prev ? { ...prev, phoneNumber: newPhone } : null);
      }
    } catch (error) {
      console.error('Error updating phone number:', error);
      alert('전화번호 업데이트에 실패했습니다.');
    }
  }, [editedUser, db]);

  return (
    <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-100">관리자</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-slate-300">
            사용자 목록을 관리하고 권한을 설정할 수 있습니다.
          </p>
        </div>
        {/* 검색 필터 */}
        <div className="flex items-center gap-2">
          <div className="relative rounded-full shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="size-5 text-gray-400 dark:text-slate-500" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
              className="block w-full rounded-full border-0 py-1.5 pl-10 pr-3 text-gray-900 dark:text-slate-100 dark:bg-slate-700 ring-1 ring-inset ring-gray-300 dark:ring-slate-600 placeholder:text-gray-400 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-black dark:focus:ring-slate-400 sm:text-sm sm:leading-6"
              placeholder="아이디, 이름, 이메일 검색"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-slate-400"
          >
            <option value="all">전체 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
            <option value="blocked">차단됨</option>
          </select>
          <button
            onClick={handleSearch}
            className="rounded-full bg-black dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-slate-500 focus:ring-offset-2"
          >
            검색
          </button>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black dark:ring-slate-700 ring-opacity-5 sm:rounded-lg">
              {error && <div className="bg-red-50 p-4 text-sm text-red-700">{error}</div>}
              {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="size-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                </div>
              ) : users.length === 0 ? (
                <div className="py-8 text-center text-gray-500 dark:text-slate-400">사용자 데이터가 없습니다.</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-300 dark:divide-slate-700">
                  <thead className="bg-gray-50 dark:bg-slate-700">
                    <tr>
                      {[
                        { field: 'id', label: 'ID' },
                        { field: 'name', label: '이름' },
                        { field: 'email', label: '이메일' },
                        { field: 'phoneNumber', label: '전화번호' },
                        { field: 'level', label: '레벨' },
                        { field: 'joinDate', label: '가입일' },
                        { field: 'lastLogin', label: '최근 로그인' },
                        { field: 'loginCount', label: '로그인 횟수' },
                        { field: 'status', label: '상태' },
                      ].map(({ field, label }) => (
                        <th
                          key={field}
                          scope="col"
                          className="cursor-pointer px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-600"
                          onClick={() => requestSort(field as keyof User)}
                        >
                          <div className="flex items-center">
                            {label}
                            {sortConfig.key === field &&
                              (sortConfig.direction === 'asc' ? (
                                <ChevronUpIcon className="ml-1 size-4" />
                              ) : (
                                <ChevronDownIcon className="ml-1 size-4" />
                              ))}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                    {currentUsers.map(user => (
                      <tr
                        key={user.id}
                        onClick={() => handleUserClick(user)}
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700"
                      >
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {user.id}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900 dark:text-slate-100">
                          {user.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatPhoneNumber(user.phoneNumber || '없음')}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {user.level}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {user.joinDate && typeof user.joinDate === 'object' && 'seconds' in user.joinDate
                            ? formatDate(user.joinDate)
                            : user.joinDate || '-'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {user.lastLogin && typeof user.lastLogin === 'object' && 'seconds' in user.lastLogin
                            ? formatDate(user.lastLogin)
                            : user.lastLogin || '-'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {user.loginCount}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              user.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : user.status === 'inactive'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.status === 'active'
                              ? '활성'
                              : user.status === 'inactive'
                                ? '비활성'
                                : '차단됨'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 페이지네이션 */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-700 dark:text-slate-300">
          총 <span className="font-medium">{filteredUsers.length}</span> 명의 사용자
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
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
                  onClick={() => handlePageChange(pageNum)}
                  className={`rounded-md px-3 py-1 text-sm font-medium ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600'
                  }`}
                >
                  {pageNum}
                </button>
              );
            }
            return null;
          })}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            다음
          </button>
        </div>
      </div>

      {/* 사용자 상세 정보 슬라이드 오버 */}
      <Transition.Root show={isDetailOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsDetailOpen}>
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
                    <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-slate-800 shadow-xl">
                      <div className="px-4 py-6 sm:px-6">
                        <div className="flex items-start justify-between">
                          <h2 className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100">
                            사용자 상세 정보
                          </h2>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="rounded-md bg-white dark:bg-slate-800 text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
                              onClick={() => setIsDetailOpen(false)}
                            >
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon className="size-6 dark:text-gray-300" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* 사용자 상세 정보 내용 */}
                      <div className="relative flex-1 px-4 sm:px-6">
                        {selectedUser && (
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">ID</h3>
                              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedUser.id}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">이름</h3>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editedUser?.name}
                                  onChange={e => handleEditChange('name', e.target.value)}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                              ) : (
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedUser.name}</p>
                              )}
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">이메일</h3>
                              {isEditing ? (
                                <input
                                  type="email"
                                  value={editedUser?.email}
                                  onChange={e => handleEditChange('email', e.target.value)}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                              ) : (
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedUser.email}</p>
                              )}
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">전화번호</h3>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editedUser?.phoneNumber || ''}
                                  onChange={e => {
                                    const newPhone = e.target.value;
                                    // 숫자만 입력 가능하도록
                                    if (newPhone === '' || /^\d*$/.test(newPhone)) {
                                      setEditedUser(prev =>
                                        prev ? { ...prev, phoneNumber: newPhone } : null
                                      );
                                    }
                                  }}
                                  onBlur={e => {
                                    const newPhone = e.target.value;
                                    if (
                                      newPhone &&
                                      newPhone !== '없음' &&
                                      !validatePhoneNumber(newPhone)
                                    ) {
                                      setEditedUser(prev =>
                                        prev ? { ...prev, phoneNumber: '' } : null
                                      );
                                    }
                                  }}
                                  placeholder="숫자만 입력하세요"
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                              ) : (
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                  {formatPhoneNumber(selectedUser.phoneNumber || '없음')}
                                </p>
                              )}
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">레벨</h3>
                              {isEditing ? (
                                <select
                                  value={editedUser?.level || 1}
                                  onChange={e => handleEditChange('level', e.target.value)}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                >
                                  {[...Array(10)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                      레벨 {i + 1}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedUser.level}</p>
                              )}
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">가입일</h3>
                              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedUser.joinDate && typeof selectedUser.joinDate === 'object' && 'seconds' in selectedUser.joinDate ? formatDate(selectedUser.joinDate) : selectedUser.joinDate || '-'}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">최근 로그인</h3>
                              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedUser.lastLogin && typeof selectedUser.lastLogin === 'object' && 'seconds' in selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : selectedUser.lastLogin || '-'}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">상태</h3>
                              {isEditing ? (
                                <select
                                  value={editedUser?.status}
                                  onChange={e =>
                                    handleEditChange(
                                      'status',
                                      e.target.value as 'active' | 'inactive'
                                    )
                                  }
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                >
                                  <option value="active">활성</option>
                                  <option value="inactive">비활성</option>
                                </select>
                              ) : (
                                <span
                                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                    selectedUser.status === 'active'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {selectedUser.status === 'active' ? '활성' : '비활성'}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-3">
                              {isEditing ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={handleSave}
                                    className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                  >
                                    저장
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsEditing(false);
                                      setEditedUser(selectedUser);
                                    }}
                                    className="flex-1 rounded-md bg-gray-100 dark:bg-slate-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm hover:bg-gray-200 dark:hover:bg-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 dark:focus-visible:outline-slate-500"
                                  >
                                    취소
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setIsEditing(true)}
                                  className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                >
                                  수정
                                </button>
                              )}
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
  );
}
