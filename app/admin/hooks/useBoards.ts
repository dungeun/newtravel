import { useState, useEffect } from 'react';
import { db } from '@/firebase/config';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { Board } from '@/types/board';

export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 게시판 목록 불러오기
  const fetchBoards = async () => {
    setIsLoading(true);
    try {
      const boardsRef = collection(db, 'boards');
      const q = query(boardsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const boardsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          slug: data.slug || '',
          isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
        };
      }) as Board[];
      setBoards(boardsData);
    } catch (error) {
      console.error('게시판 목록을 불러오는 중 오류가 발생했습니다:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  // URL 유효성 검사
  const validateUrl = async (url: string) => {
    if (!url.trim()) {
      return '게시판 URL을 입력해주세요.';
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(url)) {
      return 'URL은 영문자, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능합니다.';
    }
    const boardsRef = collection(db, 'boards');
    const q = query(boardsRef, where('slug', '==', url));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return '이미 사용 중인 URL입니다.';
    }
    return '';
  };

  return {
    boards,
    isLoading,
    fetchBoards,
    validateUrl,
  };
} 