'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db, auth } from '@/firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/outline';
import { getUserRole } from '@/firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';

interface Post {
  id: string;
  title: string;
  author: string;
  createdAt: any;
  viewCount: number;
  commentCount: number;
  likeCount: number;
  content?: string;
}

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const boardUrl = params.boardUrl as string;
  const [posts, setPosts] = useState<Post[]>([]);
  const [boardTitle, setBoardTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const postsPerPage = 10;
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [userLevel, setUserLevel] = useState<number>(0);
  const [boardId, setBoardId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        getUserRole(user).then(role => {
          setUserLevel(role?.level || 0);
          console.log('내 레벨:', role?.level, 'auth.currentUser:', user);
        });
      } else {
        setUserLevel(0);
        console.log('로그인 안됨');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        // 게시판 정보 가져오기
        const boardsRef = collection(db, 'boards');
        const q = query(boardsRef, where('url', '==', boardUrl));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const boardData = querySnapshot.docs[0].data();
          setBoardTitle(boardData.name);
          setBoardId(querySnapshot.docs[0].id);

          // 전체 게시글 수 가져오기
          const postsRef = collection(db, 'boards', querySnapshot.docs[0].id, 'posts');
          const countSnapshot = await getCountFromServer(postsRef);
          setTotalPosts(countSnapshot.data().count);

          // 게시글 목록 가져오기
          const postsQuery = query(postsRef, orderBy('createdAt', 'desc'), limit(postsPerPage));
          const postsSnapshot = await getDocs(postsQuery);

          const postsData = postsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Post[];

          setPosts(postsData);
        }
      } catch (error) {
        console.error('게시판 데이터 가져오기 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoardData();
  }, [boardUrl, currentPage]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPosts(posts);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredPosts(
        posts.filter(
          post =>
            post.title.toLowerCase().includes(lower) ||
            (post.content && post.content.toLowerCase().includes(lower))
        )
      );
    }
  }, [searchTerm, posts]);

  const handleWriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
    router.push(`/board/${boardUrl}/write`);
  };

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleSelectPost = (postId: string) => {
    setSelectedPosts(prev =>
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPosts.length === posts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(posts.map(post => post.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    for (const postId of selectedPosts) {
      await deleteDoc(doc(db, 'boards', boardId, 'posts', postId));
    }
    setSelectedPosts([]);
    // 새로고침
    location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header siteName="월급루팡" onSidebarOpen={() => {}} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex h-64 items-center justify-center">
            <div className="size-12 animate-spin rounded-full border-y-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header siteName="월급루팡" onSidebarOpen={() => {}} />
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-xl bg-white shadow-sm">
          <div className="border-b border-dotted border-green-500 p-6">
            <h1 className="text-3xl font-bold">{boardTitle || '게시판'}</h1>
          </div>
          <div className="p-6">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 justify-center md:justify-center">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="제목/본문 검색"
                  className="w-full rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black md:w-64"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={handleWriteClick}
                  className="rounded-full bg-black px-4 py-2 text-white hover:bg-gray-800"
                >
                  글쓰기
                </button>
                {userLevel >= 8 && selectedPosts.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="ml-2 rounded-full bg-red-500 px-4 py-2 text-white hover:bg-red-700"
                    disabled={selectedPosts.length === 0}
                  >
                    전체 삭제
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed">
                <colgroup>
                  {userLevel >= 8 && <col style={{ width: '32px' }} />}
                  <col style={{ width: '60px' }} />
                  <col />
                  <col style={{ width: '120px' }} />
                  <col style={{ width: '110px' }} />
                  <col style={{ width: '60px' }} />
                  <col style={{ width: '60px' }} />
                  <col style={{ width: '70px' }} />
                </colgroup>
                <thead className="bg-gray-50">
                  <tr>
                    {userLevel >= 8 && (
                      <th className="py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedPosts.length === posts.length && posts.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                    )}
                    <th className="py-3 text-center">번호</th>
                    <th className="py-3 text-left">제목</th>
                    <th className="w-[120px] min-w-[120px] py-3 text-center">작성자</th>
                    <th className="py-3 text-center">작성일</th>
                    <th className="py-3 text-center">조회</th>
                    <th className="py-3 text-center">댓글</th>
                    <th className="py-3 text-center">좋아요</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {(searchTerm.trim() === '' ? posts : filteredPosts).map((post, index) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      {userLevel >= 8 && (
                        <td className="py-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedPosts.includes(post.id)}
                            onChange={() => handleSelectPost(post.id)}
                          />
                        </td>
                      )}
                      <td className="py-3 text-center text-sm text-gray-500">
                        {totalPosts - (currentPage - 1) * postsPerPage - index}
                      </td>
                      <td className="truncate whitespace-nowrap py-3 text-left text-sm font-medium text-gray-900">
                        <Link
                          href={`/board/${boardUrl}/${post.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {post.title}
                        </Link>
                      </td>
                      <td className="w-[120px] min-w-[120px] py-3 text-center text-sm text-gray-500">
                        {post.author}
                      </td>
                      <td className="py-3 text-center text-sm text-gray-500">
                        {post.createdAt?.toDate().toLocaleDateString()}
                      </td>
                      <td className="py-3 text-center text-sm text-gray-500">{post.viewCount}</td>
                      <td className="py-3 text-center text-sm text-gray-500">
                        {post.commentCount}
                      </td>
                      <td className="py-3 text-center text-sm text-gray-500">
                        <div className="flex items-center justify-center">
                          <HeartIcon className="mr-1 size-4 text-red-500" />
                          {post.likeCount || 0}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                총 <span className="font-medium">{totalPosts}</span> 개의 게시글
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
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
                            ? 'bg-black text-white'
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
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  다음
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
