'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db, auth } from '@/firebase/config';
import { collection, query, where, getDocs, addDoc, doc } from 'firebase/firestore';
import Header from '@/components/layout/Header';
import Editor from '@/components/Editor';

export default function WritePage() {
  const params = useParams();
  const router = useRouter();
  const boardUrl = params.boardUrl as string;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [boardId, setBoardId] = useState('');

  useEffect(() => {
    const fetchBoardId = async () => {
      const boardsRef = collection(db, 'boards');
      const q = query(boardsRef, where('url', '==', boardUrl));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setBoardId(querySnapshot.docs[0].id);
      } else {
        alert('게시판을 찾을 수 없습니다.');
        router.push('/');
      }
    };

    fetchBoardId();
  }, [boardUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.currentUser) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      const postsRef = collection(db, 'boards', boardId, 'posts');
      await addDoc(postsRef, {
        title,
        content,
        author: auth.currentUser.email,
        createdAt: new Date(),
        updatedAt: new Date(),
        viewCount: 0,
        commentCount: 0,
      });

      router.push(`/board/${boardUrl}`);
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      alert('게시글 작성에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header siteName="월급루팡" onSidebarOpen={() => {}} />
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h1 className="mb-6 border-b border-dotted border-green-500 pb-6 text-2xl font-bold">
            게시글 작성
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <Editor content={content} onChange={setContent} />

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-full bg-gray-500 px-6 py-2 text-white hover:bg-gray-600"
              >
                취소
              </button>
              <button
                type="submit"
                className="rounded-full bg-black px-6 py-2 text-white hover:bg-gray-800"
              >
                작성
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
