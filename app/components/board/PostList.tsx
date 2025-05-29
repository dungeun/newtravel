'use client';

import { useState, useEffect } from 'react';
import PostCard from './PostCard';
import { Post } from '../../types/board';

interface PostListProps {
  boardUrl: string;
  layout?: 'list' | 'card' | 'grid';
  limit?: number;
  showPagination?: boolean;
}

export default function PostList({
  boardUrl,
  layout = 'list',
  limit = 10,
  showPagination = true,
}: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // 실제 구현 시 API로 게시물 데이터를 가져오도록 수정
    const fetchPosts = async () => {
      try {
        // API 호출
        // const response = await fetch(`/api/boards/posts?boardUrl=${boardUrl}&page=${currentPage}&limit=${limit}`);
        // const data = await response.json();
        // setPosts(data.posts);
        // setTotalPages(data.totalPages);

        // 임시 데이터
        const dummyPosts: Post[] = Array.from({ length: limit }, (_, i) => ({
          id: `post-${i + 1}`,
          title: `게시글 제목 예시 ${i + 1}`,
          content:
            '게시글 내용의 일부분이 여기에 표시됩니다. 실제 구현 시 게시글 내용의 일부를 발췌하여 표시합니다.',
          author: `작성자${i + 1}`,
          createdAt: new Date(2023, 5, 10 + i).toISOString(),
          viewCount: Math.floor(Math.random() * 100) + 10,
          commentCount: Math.floor(Math.random() * 10),
          likeCount: Math.floor(Math.random() * 20),
        }));

        setPosts(dummyPosts);
        setTotalPages(5); // 임시로 5페이지로 설정
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [boardUrl, currentPage, limit]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <div className="p-4 text-center">게시물을 불러오는 중...</div>;
  }

  return (
    <div className="post-list">
      {posts.length === 0 ? (
        <div className="rounded border p-8 text-center">게시물이 없습니다.</div>
      ) : (
        <>
          {layout === 'card' ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {posts.map(post => (
                <PostCard key={post.id} post={post} boardUrl={boardUrl} layout="card" />
              ))}
            </div>
          ) : layout === 'grid' ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {posts.map(post => (
                <PostCard key={post.id} post={post} boardUrl={boardUrl} layout="grid" />
              ))}
            </div>
          ) : (
            <div className="divide-y rounded border">
              {posts.map(post => (
                <PostCard key={post.id} post={post} boardUrl={boardUrl} layout="list" />
              ))}
            </div>
          )}

          {showPagination && totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`rounded border px-4 py-2 ${
                      page === currentPage
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
