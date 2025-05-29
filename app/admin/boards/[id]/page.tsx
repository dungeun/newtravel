'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  views: number;
  comments: number;
}

export default function BoardDetailPage({ params }: { params: { id: string } }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const generatePosts = () => {
      const totalPosts = 50;
      return Array.from({ length: totalPosts }, (_, index) => ({
        id: totalPosts - index,
        title: `게시글 ${totalPosts - index}`,
        content: `게시글 ${totalPosts - index}의 내용입니다...`,
        author: `작성자 ${Math.floor(Math.random() * 10) + 1}`,
        createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toLocaleDateString(),
        views: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 50),
      }));
    };

    setPosts(generatePosts());
  }, []);

  const totalPages = Math.ceil(posts.length / itemsPerPage);
  const currentPosts = posts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* 브레드크럼 네비게이션 */}
          <div className="mb-4">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                    관리자
                  </Link>
                </li>
                <li>
                  <span className="mx-2 text-gray-400">/</span>
                  <Link href="/dashboard/posts" className="text-gray-500 hover:text-gray-700">
                    게시판 관리
                  </Link>
                </li>
                <li>
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-900">게시판 {params.id}</span>
                </li>
              </ol>
            </nav>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">게시판 {params.id} 상세보기</h1>
          </div>

          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    제목
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    작성자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    작성일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    조회수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    댓글
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {currentPosts.map(post => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{post.id}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {post.title}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {post.author}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {post.createdAt}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {post.views}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {post.comments}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              총 <span className="font-medium">{posts.length}</span> 개의 게시글
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
        </div>
      </div>
    </DashboardLayout>
  );
}
