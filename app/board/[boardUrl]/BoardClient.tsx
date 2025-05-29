'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
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
import { getUserRole } from '@/firebase/auth';

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: any;
  viewCount: number;
  commentCount: number;
}

export default function BoardClient() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const boardUrl = params.boardUrl as string;
  const [posts, setPosts] = useState<Post[]>([]);
  const [boardTitle, setBoardTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [userLevel, setUserLevel] = useState<number>(0);
  const [boardId, setBoardId] = useState<string>('');

  const handleWriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
    router.push(`/board/${boardUrl}/write`);
  };

  useEffect(() => {
    if (auth.currentUser) {
      getUserRole(auth.currentUser).then(role => {
        setUserLevel(role?.level || 0);
      });
    }
  }, []);

  useEffect(() => {
    if (!boardUrl) return;

    const fetchBoardData = async () => {
      setIsLoading(true);
      try {
        // 1. 게시판 정보 가져오기
        const boardsRef = collection(db, 'boards');
        const boardQuery = query(boardsRef, where('url', '==', boardUrl), limit(1));
        const boardSnapshot = await getDocs(boardQuery);

        if (boardSnapshot.empty) {
          console.error('해당 URL의 게시판을 찾을 수 없습니다.');
          setBoardTitle('게시판 없음');
          setPosts([]);
          return;
        }

        const boardDoc = boardSnapshot.docs[0];
        const boardData = boardDoc.data();
        setBoardTitle(boardData.name);
        setBoardId(boardDoc.id);

        // 2. 총 게시글 수 가져오기
        const postsRef = collection(db, 'boards', boardDoc.id, 'posts');
        const countSnapshot = await getCountFromServer(postsRef);
        setTotalPosts(countSnapshot.data().count);

        // 3. 페이지네이션된 게시글 가져오기
        const page = Number(searchParams.get('page')) || 1;
        setCurrentPage(page);

        const postsQuery = query(postsRef, orderBy('createdAt', 'desc'), limit(postsPerPage));

        // 이전 페이지의 마지막 문서를 가져오기
        let lastVisible = null;
        if (page > 1) {
          const previousQuery = query(
            postsRef,
            orderBy('createdAt', 'desc'),
            limit((page - 1) * postsPerPage)
          );
          const previousSnapshot = await getDocs(previousQuery);
          lastVisible = previousSnapshot.docs[previousSnapshot.docs.length - 1];
        }

        // 현재 페이지의 게시글 가져오기
        const currentPageQuery = lastVisible
          ? query(
              postsRef,
              orderBy('createdAt', 'desc'),
              startAfter(lastVisible),
              limit(postsPerPage)
            )
          : postsQuery;

        const postsSnapshot = await getDocs(currentPageQuery);

        const postsData = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Post[];
        setPosts(postsData);
      } catch (error) {
        console.error('게시판 데이터 로딩 실패:', error);
        setBoardTitle('데이터 로딩 오류');
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoardData();
  }, [boardUrl, searchParams]);

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const handlePageChange = (page: number) => {
    router.push(`/board/${boardUrl}?page=${page}`);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header siteName="월급루팡" onSidebarOpen={() => {}} />
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-xl bg-white shadow-sm">
          {/* 게시판 제목 영역 */}
          <div
            className="border-b border-dotted border-green-500 p-6"
            style={{ borderStyle: 'dotted', borderWidth: '0 0 1px 0', borderSpacing: '1px' }}
          >
            <h1 className="text-3xl font-bold">{boardTitle || '게시판'}</h1>
          </div>

          <div className="p-6">
            <div className="mb-4 text-right">
              <button
                onClick={handleWriteClick}
                className="rounded-full bg-black px-4 py-2 text-white hover:bg-gray-800"
              >
                글쓰기
              </button>
              {userLevel >= 8 && (
                <button
                  onClick={handleDeleteSelected}
                  className="ml-2 rounded-full bg-red-500 px-4 py-2 text-white hover:bg-red-700"
                  disabled={selectedPosts.length === 0}
                >
                  전체 삭제
                </button>
              )}
            </div>

            {isLoading ? (
              <p>게시글을 불러오는 중...</p>
            ) : posts.length === 0 ? (
              <p>게시글이 없습니다.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        {userLevel >= 8 && (
                          <th>
                            <input
                              type="checkbox"
                              checked={selectedPosts.length === posts.length && posts.length > 0}
                              onChange={handleSelectAll}
                            />
                          </th>
                        )}
                        <th
                          scope="col"
                          className="w-24 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700"
                        >
                          번호
                        </th>
                        <th
                          scope="col"
                          className="w-auto px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700"
                        >
                          제목
                        </th>
                        <th
                          scope="col"
                          className="w-32 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700"
                        >
                          작성자
                        </th>
                        <th
                          scope="col"
                          className="w-40 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700"
                        >
                          작성일
                        </th>
                        <th
                          scope="col"
                          className="w-24 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700"
                        >
                          조회수
                        </th>
                        <th
                          scope="col"
                          className="w-24 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700"
                        >
                          댓글
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {posts.map((post, index) => (
                        <tr key={post.id} className="hover:bg-gray-50">
                          {userLevel >= 8 && (
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedPosts.includes(post.id)}
                                onChange={() => handleSelectPost(post.id)}
                              />
                            </td>
                          )}
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {totalPosts - (currentPage - 1) * postsPerPage - index}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                            <Link
                              href={`/board/${boardUrl}/${post.id}`}
                              className="hover:text-black"
                            >
                              {post.title}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {post.author}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {post.createdAt?.toDate().toLocaleDateString()}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {post.viewCount}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {post.commentCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 페이지네이션 */}
                <div className="mt-6 flex justify-center pb-4">
                  <nav
                    className="relative z-0 inline-flex overflow-hidden rounded-full"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      이전
                    </button>
                    {(() => {
                      const pages = [];
                      const startPage = Math.max(1, currentPage - 4);
                      const endPage = Math.min(totalPages, startPage + 9);

                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => handlePageChange(i)}
                            className={`relative inline-flex items-center border border-gray-300 px-4 py-2 text-sm font-medium ${
                              currentPage === i
                                ? 'z-10 border-black bg-black text-white'
                                : 'bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }
                      return pages;
                    })()}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      다음
                    </button>
                  </nav>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
