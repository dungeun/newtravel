'use client';

import React, { useState, useEffect } from 'react';
import BoardLayout from '@/components/layout/BoardLayout';
import { MagnifyingGlassIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface Post {
  id: number;
  title: string;
  author: string;
  createdAt: string;
  views: number;
  comments: number;
  likes: number;
  isLiked: boolean;
  preview: string;
}

export default function BoardPage({ params }: { params: { boardUrl: string } }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const itemsPerPage = 20;

  useEffect(() => {
    setPosts(generatePosts());
  }, []);

  // 임시 데이터 생성
  const generatePosts = () => {
    const totalPosts = 100;
    return Array.from({ length: totalPosts }, (_, index) => ({
      id: totalPosts - index,
      title: `${index + 1}번째 게시글입니다. 이것은 조금 더 긴 제목의 게시글 입니다. 게시글의 내용을 미리 확인할 수 있습니다.`,
      author: `작성자 ${totalPosts - index}`,
      createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toLocaleDateString(),
      views: Math.floor(Math.random() * 1000),
      comments: Math.floor(Math.random() * 50),
      likes: Math.floor(Math.random() * 100),
      isLiked: Math.random() > 0.5,
      preview:
        '이 게시글은 게시판의 새로운 포스트입니다. 여러분들의 많은 관심과 참여 부탁드립니다...',
    }));
  };

  const toggleLike = (postId: number) => {
    setPosts(
      posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked,
          };
        }
        return post;
      })
    );
  };

  const filteredPosts = posts.filter(
    post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = () => {
    setCurrentPage(1);
  };

  // boardUrl에 따른 게시판 이름 매핑
  const getBoardName = (url: string) => {
    const boardTypes = {
      free: '자유게시판',
      notice: '공지사항',
      gallery: '갤러리',
      sns: 'SNS',
      qna: 'Q&A',
      data: '자료실',
    };
    return boardTypes[url as keyof typeof boardTypes] || '게시판';
  };

  return (
    <BoardLayout boardName={getBoardName(params.boardUrl)}>
      {/* 검색 영역 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="검색어를 입력하세요"
                className="rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSearch()}
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={handleSearch}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              검색
            </button>
          </div>
          <Link
            href={`/boards/${params.boardUrl}/write`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            글쓰기
          </Link>
        </div>
      </div>

      {/* 게시글 목록 */}
      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-16 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                번호
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                제목
              </th>
              <th className="w-24 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                작성자
              </th>
              <th className="w-24 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                작성일
              </th>
              <th className="w-20 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                조회
              </th>
              <th className="w-20 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                좋아요
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {currentPosts.map(post => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{post.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  <div>
                    <Link
                      href={`/boards/${params.boardUrl}/${post.id}`}
                      className="block hover:text-blue-600"
                    >
                      {post.title}
                    </Link>
                    <p className="mt-1 truncate text-xs text-gray-500">{post.preview}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-gray-500">댓글 {post.comments}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">조회 {post.views}</span>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{post.author}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {post.createdAt}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{post.views}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className="group flex items-center gap-1"
                  >
                    {post.isLiked ? (
                      <HeartSolidIcon className="size-5 text-red-500" />
                    ) : (
                      <HeartIcon className="size-5 text-gray-400 group-hover:text-red-500" />
                    )}
                    <span
                      className={`${post.isLiked ? 'text-red-500' : 'text-gray-500 group-hover:text-red-500'}`}
                    >
                      {post.likes}
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          총 <span className="font-medium">{filteredPosts.length}</span> 개의 게시글
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
    </BoardLayout>
  );
}
