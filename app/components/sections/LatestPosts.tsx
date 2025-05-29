'use client';

import { useState, useEffect } from 'react';
import { Section } from '../../types/section';

interface LatestPostsProps {
  section: Section;
}

interface Post {
  id: string;
  title: string;
  author: string;
  date: string;
  url: string;
}

export default function LatestPosts({ section }: LatestPostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 실제 구현 시 API로 게시물 데이터를 가져오도록 수정
    const fetchLatestPosts = async () => {
      try {
        // const boardId = section.boardId;
        // const limit = section.config.limit || 5;
        // const response = await fetch(`/api/boards/${boardId}/posts?limit=${limit}`);
        // const data = await response.json();
        // setPosts(data.posts);

        // 임시 데이터
        const dummyPosts = Array.from({ length: section.config.limit || 5 }, (_, i) => ({
          id: `post-${i + 1}`,
          title: `${section.config.title || '게시판'} 게시글 ${i + 1}`,
          author: `작성자${i + 1}`,
          date: `2023-06-${10 + i}`,
          url: `/${section.boardId || 'board'}/${i + 1}`,
        }));

        setPosts(dummyPosts);
      } catch (error) {
        console.error('Error fetching latest posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPosts();
  }, [section]);

  const renderPosts = () => {
    const layout = section.config.layout || 'list';

    if (layout === 'list') {
      return (
        <div className="divide-y rounded border">
          {posts.map(post => (
            <div key={post.id} className="p-3 hover:bg-gray-50">
              <a href={post.url} className="block">
                <h3 className="font-medium">{post.title}</h3>
                <div className="mt-1 flex justify-between text-sm text-gray-500">
                  <span>{post.author}</span>
                  <span>{post.date}</span>
                </div>
              </a>
            </div>
          ))}
        </div>
      );
    }

    if (layout === 'card') {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {posts.map(post => (
            <div key={post.id} className="rounded border p-4 transition-shadow hover:shadow-md">
              <a href={post.url} className="block">
                <h3 className="mb-2 font-medium">{post.title}</h3>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{post.author}</span>
                  <span>{post.date}</span>
                </div>
              </a>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {posts.map(post => (
          <div key={post.id} className="p-3">
            <a href={post.url} className="block">
              <h3 className="font-medium">{post.title}</h3>
              <span className="text-sm text-gray-500">{post.date}</span>
            </a>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="p-4 text-center">게시물을 불러오는 중...</div>;
  }

  return (
    <div className="latest-posts-section">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">{section.config.title || '최신 게시물'}</h2>
        {section.boardId && (
          <a href={`/${section.boardId}`} className="text-sm text-blue-500 hover:underline">
            더보기
          </a>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="rounded border p-4 text-center">게시물이 없습니다.</div>
      ) : (
        renderPosts()
      )}
    </div>
  );
}
