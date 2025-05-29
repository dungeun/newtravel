'use client';

import React, { useState, useEffect } from 'react';
import BoardLayout from '@/components/layout/BoardLayout';
import { HeartIcon, ChatBubbleLeftIcon, ShareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface PostDetail {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  views: number;
  likes: number;
  isLiked: boolean;
}

interface Comment {
  id: number;
  content: string;
  author: string;
  createdAt: string;
}

export default function PostDetailPage({
  params,
}: {
  params: { boardUrl: string; postId: string };
}) {
  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    // 임시 데이터 설정
    setPost({
      id: parseInt(params.postId),
      title: '게시글 제목입니다.',
      content: '게시글 내용입니다.',
      author: '작성자',
      createdAt: new Date().toISOString(),
      views: 100,
      likes: 10,
      isLiked: false,
    });

    setComments([
      {
        id: 1,
        content: '댓글 내용입니다.',
        author: '댓글 작성자',
        createdAt: new Date().toISOString(),
      },
      // 더 많은 댓글...
    ]);
  }, [params.postId]);

  const handleLike = () => {
    if (!post) return;
    setPost({
      ...post,
      likes: post.likes + (post.isLiked ? -1 : 1),
      isLiked: !post.isLiked,
    });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newCommentObj: Comment = {
      id: comments.length + 1,
      content: newComment,
      author: '현재 사용자',
      createdAt: new Date().toISOString(),
    };

    setComments(prev => [...prev, newCommentObj]);
    setNewComment('');
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <BoardLayout boardName="자유게시판">
      <div className="bg-white shadow sm:rounded-lg">
        {/* 게시글 헤더 */}
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{post?.title}</h1>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <span>{post?.author}</span>
                <span className="mx-2">•</span>
                <span>{post?.createdAt}</span>
                <span className="mx-2">•</span>
                <span>조회 {post?.views}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href={`/boards/${params.boardUrl}`}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                목록으로
              </Link>
            </div>
          </div>
        </div>

        {/* 게시글 본문 */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: post?.content || '' }}
          />
        </div>

        {/* 게시글 하단 액션 */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="flex justify-center space-x-8">
            <button
              onClick={handleLike}
              className="flex items-center space-x-2 text-gray-500 hover:text-red-500"
            >
              {post?.isLiked ? (
                <HeartSolidIcon className="size-6 text-red-500" />
              ) : (
                <HeartIcon className="size-6" />
              )}
              <span className={post?.isLiked ? 'text-red-500' : ''}>좋아요 {post?.likes}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
              <ChatBubbleLeftIcon className="size-6" />
              <span>댓글 {comments.length}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
              <ShareIcon className="size-6" />
              <span>공유하기</span>
            </button>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">댓글 {comments.length}개</h2>

          {/* 댓글 작성 폼 */}
          <form onSubmit={handleCommentSubmit} className="mt-4">
            <textarea
              rows={3}
              className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="댓글을 작성하세요..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                댓글 작성
              </button>
            </div>
          </form>

          {/* 댓글 목록 */}
          <div className="mt-6 space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">{comment.author}</span>
                    <span className="ml-2 text-sm text-gray-500">{comment.createdAt}</span>
                  </div>
                  <button className="text-sm text-gray-500 hover:text-gray-700">답글</button>
                </div>
                <p className="mt-2 text-gray-700">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BoardLayout>
  );
}
