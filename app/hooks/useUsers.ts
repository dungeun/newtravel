import { useState, useEffect, useCallback } from 'react';
import { db } from '@/firebase/config';
import {
  collection,
  query,
  getDocs,
  orderBy,
  where,
  Firestore
} from 'firebase/firestore';

export type User = {
  id: number;
  uid: string;
  name: string;
  email: string;
  phoneNumber?: string;
  level: string;
  status: string;
  joinDate?: string;
  lastLogin?: string;
  loginCount?: number;
};

export function useUsers(statusFilter: string) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    console.log('Firestore DB 객체:', db);
    
    if (!db || !db.type) {
      console.error('Firestore가 초기화되지 않았습니다:', db);
      setUsers([]);
      setIsLoading(false);
      setError('Firestore is not initialized');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      let q = query(collection(db as Firestore, 'users'), orderBy('id', 'desc'));
      if (statusFilter && statusFilter !== 'all') {
        q = query(collection(db as Firestore, 'users'), where('status', '==', statusFilter), orderBy('id', 'desc'));
      }
      const snapshot = await getDocs(q);
      const userList: User[] = snapshot.docs.map(docSnap => ({
        ...(docSnap.data() as Omit<User, 'uid'>),
        uid: docSnap.id,
      }));
      setUsers(userList);
    } catch (err) {
      setError('유저 데이터를 불러오는 중 오류 발생');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // mutate: 로컬 상태를 직접 업데이트할 수 있게 함
  const mutate = (updater: (prev: User[]) => User[]) => {
    setUsers(updater);
  };

  return { users, isLoading, error, mutate };
} 