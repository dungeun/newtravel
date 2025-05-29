'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/firebase/config';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import SettingsLayout from '../components/SettingsLayout';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin';
  lastLogin?: string;
}

export default function AdminSettingsPage() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [newAdmin, setNewAdmin] = useState<{ email: string; name: string; role: 'admin' | 'superadmin' }>({ 
    email: '', 
    name: '', 
    role: 'admin' 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    try {
      const adminCollection = collection(db, 'users');
      const querySnapshot = await getDocs(adminCollection);
      
      const admins: AdminUser[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.role === 'admin' || userData.role === 'superadmin') {
          admins.push({
            id: doc.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            lastLogin: userData.lastLogin,
          });
        }
      });

      setAdminUsers(admins);
    } catch (error) {
      console.error('관리자 목록을 불러오는 중 오류 발생:', error);
      setStatusMessage('관리자 목록을 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage('');

    try {
      if (!newAdmin.email || !newAdmin.name) {
        setStatusMessage('이메일과 이름을 모두 입력해주세요.');
        setIsLoading(false);
        return;
      }

      // 이메일을 ID로 사용하여 문서 생성 (실제 환경에서는 UID 사용)
      const adminId = newAdmin.email.replace(/[^a-zA-Z0-9]/g, '-');
      
      await setDoc(doc(db, 'users', adminId), {
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role,
        createdAt: new Date().toISOString(),
      });

      setStatusMessage('관리자가 성공적으로 추가되었습니다.');
      setNewAdmin({ email: '', name: '', role: 'admin' });
      fetchAdminUsers();
    } catch (error) {
      console.error('관리자 추가 중 오류 발생:', error);
      setStatusMessage('관리자 추가 중 오류가 발생했습니다.');
    }

    setIsLoading(false);
  };

  const handleRemoveAdmin = async (adminId: string) => {
    if (!confirm('정말로 이 관리자를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', adminId));
      setStatusMessage('관리자가 성공적으로 삭제되었습니다.');
      fetchAdminUsers();
    } catch (error) {
      console.error('관리자 삭제 중 오류 발생:', error);
      setStatusMessage('관리자 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <SettingsLayout title="관리자 설정">
      <div className="space-y-8">
        {/* 현재 관리자 목록 */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">관리자 목록</h2>
          <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">이름</th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">이메일</th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">권한</th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">마지막 로그인</th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {adminUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-center text-sm text-slate-500 dark:text-slate-400">
                      등록된 관리자가
                      없습니다.
                    </td>
                  </tr>
                ) : (
                  adminUsers.map((admin) => (
                    <tr key={admin.id} className="bg-white dark:bg-slate-900">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">{admin.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{admin.email}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                        <span className={`inline-flex rounded-full ${
                          admin.role === 'superadmin' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        } px-2 py-1 text-xs`}>
                          {admin.role === 'superadmin' ? '최고 관리자' : '관리자'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                        {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : '없음'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button 
                          onClick={() => handleRemoveAdmin(admin.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 관리자 추가 폼 */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">관리자 추가</h2>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="adminName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  이름
                </label>
                <input
                  type="text"
                  id="adminName"
                  value={newAdmin.name}
                  onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label htmlFor="adminEmail" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  이메일
                </label>
                <input
                  type="email"
                  id="adminEmail"
                  value={newAdmin.email}
                  onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label htmlFor="adminRole" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  권한
                </label>
                <select
                  id="adminRole"
                  value={newAdmin.role}
                  onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value as 'admin' | 'superadmin' })}
                  className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="admin">관리자</option>
                  <option value="superadmin">최고 관리자</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              {statusMessage && (
                <p className={`text-sm ${statusMessage.includes('오류') ? 'text-red-500' : 'text-green-500'}`}>
                  {statusMessage}
                </p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? '추가 중...' : '관리자 추가'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </SettingsLayout>
  );
}
