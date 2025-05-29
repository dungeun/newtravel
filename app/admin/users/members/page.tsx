'use client';

import React, { useState, useEffect, Fragment } from 'react';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
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
  deleteDoc,
} from 'firebase/firestore';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Edit, Trash2, UserPlus } from 'lucide-react';

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

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  joinDate: string;
  lastLogin: string;
  level: string;
  status: string;
  loginCount?: number;
  role?: string;
  updatedAt?: string;
  uid: string;
  createdAt: Date;
}

export default function MembersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: 'asc' | 'desc';
  }>({ key: 'id', direction: 'desc' });
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const usersPerPage = 30;

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching users from Firestore...');
      const usersCollection = collection(db, 'users');
      const querySnapshot = await getDocs(query(usersCollection, orderBy('joinDate', 'desc')));

      console.log('Total users found:', querySnapshot.size);

      const fetchedUsers = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          joinDate: data.joinDate
            ? new Date(data.joinDate.seconds * 1000).toLocaleDateString('ko-KR')
            : '날짜 없음',
          lastLogin: data.lastLogin
            ? new Date(data.lastLogin.seconds * 1000).toLocaleDateString('ko-KR')
            : '로그인 기록 없음',
          level: data.level?.toString() || '1',
          status: data.status || 'active',
          loginCount: data.loginCount || 0,
          uid: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      }) as User[];

      console.log('Processed users data:', fetchedUsers);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('사용자 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Component mounted, fetching users...');
    fetchUsers();
  }, []);

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

  const filteredUsers = sortedUsers.filter(user =>
    Object.values(user).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  // 총 페이지 수 계산
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = () => {
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setEditedUser(user);
    setIsDetailOpen(true);
  };

  const handleEditChange = (field: keyof User, value: string) => {
    if (editedUser) {
      setEditedUser({ ...editedUser, [field]: value });
    }
  };

  const handleSave = async () => {
    if (editedUser) {
      try {
        // uid를 사용하여 문서 참조
        const userRef = doc(db, 'users', editedUser.uid);

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
        setUsers(users.map(user => (user.uid === editedUser.uid ? editedUser : user)));
        setSelectedUser(editedUser);
        setIsEditing(false);
      } catch (error) {
        console.error('사용자 정보 업데이트 중 오류 발생:', error);
        alert('사용자 정보 업데이트에 실패했습니다.');
      }
    }
  };

  const requestSort = (key: keyof User) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handlePhoneNumberChange = async (userId: string, newPhone: string) => {
    if (!validatePhoneNumber(newPhone)) return;

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        phoneNumber: newPhone,
      });

      // 로컬 상태 업데이트
      setUsers(prevUsers =>
        prevUsers.map(user => (user.id === userId ? { ...user, phoneNumber: newPhone } : user))
      );
      if (editedUser) {
        setEditedUser({ ...editedUser, phoneNumber: newPhone });
      }
    } catch (error) {
      console.error('Error updating phone number:', error);
      alert('전화번호 업데이트에 실패했습니다.');
    }
  };

  const handleStatusChange = async (userId: string, newStatus: User['status']) => {
    try {
      await updateDoc(doc(db, 'users', userId), { status: newStatus });
      setUsers(users.map(user => (user.id === userId ? { ...user, status: newStatus } : user)));
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="size-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">회원 목록</h1>
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <p className="mt-2 text-sm text-gray-700">
              사용자 목록을 관리하고 권한을 설정할 수 있습니다.
            </p>
          </div>
          {/* 검색 필터 */}
          <div className="flex items-center gap-2">
            <div className="relative rounded-full shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="size-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSearch()}
                className="block w-full rounded-full border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                placeholder="아이디, 이름, 이메일 검색"
              />
            </div>
            <button
              onClick={fetchUsers}
              className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              검색
            </button>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                {error && <div className="bg-red-50 p-4 text-sm text-red-700">{error}</div>}
                {isLoading ? (
                  <div className="flex h-32 items-center justify-center">
                    <div className="size-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">사용자 데이터가 없습니다.</div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
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
                            className="cursor-pointer px-3 py-3.5 text-left text-sm font-semibold text-gray-900 hover:bg-gray-100"
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
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          관리
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {currentUsers.map(user => (
                        <tr
                          key={user.id}
                          onClick={() => handleUserClick(user)}
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {user.id}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
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
                            {user.joinDate}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {user.lastLogin}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {user.loginCount}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span
                              className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                user.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {user.status === 'active' ? '활성' : '비활성'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm font-medium">
                            <button className="mr-3 text-blue-600 hover:text-blue-900">
                              <Edit className="size-5" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={e => {
                                e.stopPropagation();
                                handleDeleteUser(user.id);
                              }}
                            >
                              <Trash2 className="size-5" />
                            </button>
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
          <div className="text-sm text-gray-700">
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
                      <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                        <div className="px-4 py-6 sm:px-6">
                          <div className="flex items-start justify-between">
                            <h2 className="text-lg font-semibold leading-6 text-gray-900">
                              사용자 상세 정보
                            </h2>
                            <div className="ml-3 flex h-7 items-center">
                              <button
                                type="button"
                                className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                                onClick={() => setIsDetailOpen(false)}
                              >
                                <span className="sr-only">Close panel</span>
                                <XMarkIcon className="size-6" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </div>
                        {/* 사용자 상세 정보 내용 */}
                        <div className="relative flex-1 px-4 sm:px-6">
                          {selectedUser && (
                            <div className="space-y-6">
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">ID</h3>
                                <p className="mt-1 text-sm text-gray-900">{selectedUser.id}</p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">이름</h3>
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editedUser?.name}
                                    onChange={e => handleEditChange('name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                  />
                                ) : (
                                  <p className="mt-1 text-sm text-gray-900">{selectedUser.name}</p>
                                )}
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">이메일</h3>
                                {isEditing ? (
                                  <input
                                    type="email"
                                    value={editedUser?.email}
                                    onChange={e => handleEditChange('email', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                  />
                                ) : (
                                  <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                                )}
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">전화번호</h3>
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
                                  <p className="mt-1 text-sm text-gray-900">
                                    {formatPhoneNumber(selectedUser.phoneNumber || '없음')}
                                  </p>
                                )}
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">레벨</h3>
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
                                  <p className="mt-1 text-sm text-gray-900">{selectedUser.level}</p>
                                )}
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">가입일</h3>
                                <p className="mt-1 text-sm text-gray-900">
                                  {selectedUser.joinDate}
                                </p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">최근 로그인</h3>
                                <p className="mt-1 text-sm text-gray-900">
                                  {selectedUser.lastLogin}
                                </p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">상태</h3>
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
                                      className="flex-1 rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
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
    </div>
  );
}
