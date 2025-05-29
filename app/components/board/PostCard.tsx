'use client';

import { Post } from '../../types/board';

interface PostCardProps {
  post: Post;
  boardUrl: string;
  layout: 'list' | 'card' | 'grid';
}

export default function PostCard({ post, boardUrl, layout }: PostCardProps) {
  const postUrl = `/${boardUrl}/${post.id}`;

  if (layout === 'card') {
    return (
      <div className="overflow-hidden rounded-lg border transition-shadow hover:shadow-md">
        <div className="p-4">
          <a href={postUrl} className="block">
            <h3 className="mb-2 text-lg font-semibold transition-colors hover:text-blue-600">
              {post.title}
            </h3>
            {post.content && (
              <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                {post.content.substring(0, 100)}
              </p>
            )}
            <div className="flex justify-between text-xs text-gray-500">
              <span>{post.author}</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </a>
        </div>
        <div className="flex justify-between bg-gray-50 px-4 py-2 text-xs text-gray-500">
          <div className="flex space-x-3">
            <span>조회 {post.viewCount}</span>
            <span>댓글 {post.commentCount}</span>
          </div>
          <span>좋아요 {post.likeCount}</span>
        </div>
      </div>
    );
  }

  if (layout === 'grid') {
    return (
      <div className="rounded border p-4 transition-colors hover:bg-gray-50">
        <a href={postUrl} className="block">
          <h3 className="font-medium transition-colors hover:text-blue-600">{post.title}</h3>
          {post.content && (
            <p className="mb-2 mt-1 line-clamp-1 text-sm text-gray-600">
              {post.content.substring(0, 50)}
            </p>
          )}
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <div>
              <span className="mr-3">{post.author}</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex space-x-2">
              <span>조회 {post.viewCount}</span>
              <span>댓글 {post.commentCount}</span>
            </div>
          </div>
        </a>
      </div>
    );
  }

  // 기본 목록 레이아웃
  return (
    <div className="p-4 transition-colors hover:bg-gray-50">
      <a href={postUrl} className="block">
        <div className="flex items-start justify-between">
          <h3 className="font-medium transition-colors hover:text-blue-600">{post.title}</h3>
          <div className="ml-4 flex items-center text-xs text-gray-500">
            <span className="mr-2">조회 {post.viewCount}</span>
            <span>댓글 {post.commentCount}</span>
          </div>
        </div>
        <div className="mt-2 flex justify-between text-sm text-gray-500">
          <span>{post.author}</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
      </a>
    </div>
  );
}
