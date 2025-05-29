'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where, orderBy, addDoc, Firestore } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface Admin {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastLogin: string;
  permissions: string[];
  status: 'active' | 'inactive';
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    email: '',
    name: '',
    permissions: [] as string[],
  });

  // 관리자 데이터 가져오기 함수 - useCallback 으로 최적화
  const fetchAdmins = useCallback(async () => {
    try {
      if (!db) {
        console.error('Firestore is not initialized');
        setLoading(false);
        return;
      }
      
      const adminsRef = collection(db as Firestore, 'users');
      const q = query(adminsRef, where('role', '==', 'admin'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const adminsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt?.toDate()).toLocaleDateString(),
        lastLogin: doc.data().lastLogin
          ? new Date(doc.data().lastLogin.toDate()).toLocaleDateString()
          : '-',
      })) as Admin[];

      setAdmins(adminsData);
      setLoading(false);
    } catch (error) {
      console.error('관리자 데이터를 불러오는 중 오류가 발생했습니다:', error);
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // 새 관리자 추가 핸들러 - useCallback으로 최적화
  const handleAddAdmin = useCallback(async () => {
    try {
      if (!db) {
        console.error('Firestore is not initialized');
        return;
      }
      
      const adminData = {
        ...newAdminData,
        role: 'admin',
        status: 'active',
        createdAt: new Date(),
      };

      await addDoc(collection(db as Firestore, 'users'), adminData);
      setShowAddModal(false);
      fetchAdmins();
    } catch (error) {
      console.error('관리자 추가 중 오류가 발생했습니다:', error);
    }
  }, [db, fetchAdmins, newAdminData]);

  // 입력 필드 변경 핸들러 - useCallback으로 최적화
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAdminData(prev => ({ ...prev, [name]: value }));
  }, []);

  // 권한 변경 핸들러 - useCallback으로 최적화
  const handlePermissionChange = useCallback((permission: string) => {
    setNewAdminData(prev => {
      const newPermissions = prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission];
        
      return { ...prev, permissions: newPermissions };
    });
  }, []);

  // 필터링된 관리자 목록
  const filteredAdmins = admins.filter(
    admin =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">관리자 목록</h1>
      <div className="rounded-xl bg-white shadow-sm">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => setShowAddModal(true)}
              className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
            >
              관리자 추가
            </button>
          </div>

          {/* 검색 */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="이름 또는 이메일로 검색"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* 관리자 목록 테이블 */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    이름
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    이메일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    권한
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    가입일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    마지막 로그인
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      데이터를 불러오는 중...
                    </td>
                  </tr>
                ) : filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      관리자가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map(admin => (
                    <tr key={admin.id}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-500">{admin.email}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {admin.permissions.map((permission, index) => (
                            <span
                              key={index}
                              className="rounded-full bg-gray-100 px-2 py-1 text-xs"
                            >
                              {permission}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-500">{admin.createdAt}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-500">{admin.lastLogin}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5
                          ${admin.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {admin.status === 'active' ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <button className="mr-4 text-indigo-600 hover:text-indigo-900">
                          권한 수정
                        </button>
                        <button className="text-red-600 hover:text-red-900">비활성화</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 관리자 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">새 관리자 추가</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">이메일</label>
                <input
                  type="email"
                  value={newAdminData.email}
                  onChange={handleInputChange}
                  name="email"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">이름</label>
                <input
                  type="text"
                  value={newAdminData.name}
                  onChange={handleInputChange}
                  name="name"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">권한</label>
                <select
                  multiple
                  value={newAdminData.permissions}
                  onChange={e => handlePermissionChange(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="user_management">사용자 관리</option>
                  <option value="board_management">게시판 관리</option>
                  <option value="content_management">콘텐츠 관리</option>
                  <option value="system_settings">시스템 설정</option>
                </select>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleAddAdmin}
                  className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
