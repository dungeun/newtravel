'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db, auth } from '@/firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  addDoc,
  serverTimestamp,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from 'firebase/firestore';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Editor from '@/components/Editor';
import { getUserRole } from '@/firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';

interface Comment {
  id: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: any;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: any;
  updatedAt: any;
  viewCount: number;
  commentCount: number;
  likeCount: number;
  likes: string[];
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [boardId, setBoardId] = useState('');
  const [userLevel, setUserLevel] = useState<number>(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // 게시판 ID 가져오기
        const boardsRef = collection(db, 'boards');
        const q = query(boardsRef, where('url', '==', params.boardUrl));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const boardDocId = querySnapshot.docs[0].id;
          setBoardId(boardDocId);

          // 게시글 가져오기
          const postRef = doc(db, 'boards', boardDocId, 'posts', params.postId as string);
          const postDoc = await getDoc(postRef);

          if (postDoc.exists()) {
            const postData = { id: postDoc.id, ...postDoc.data() } as Post;
            setPost(postData);
            setEditTitle(postData.title);
            setEditContent(postData.content);
            setIsLiked(postData.likes?.includes(auth.currentUser?.uid || ''));

            // 조회수 증가
            await updateDoc(postRef, {
              viewCount: increment(1),
            });

            // 댓글 가져오기
            const commentsRef = collection(postRef, 'comments');
            const commentsQuery = query(commentsRef, limit(10));
            const commentsSnapshot = await getDocs(commentsQuery);
            const commentsData = commentsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            })) as Comment[];
            setComments(commentsData);
          }
        }
      } catch (error) {
        console.error('게시글 가져오기 실패:', error);
      }
    };

    if (params.postId) {
      fetchPost();
    }
  }, [params.postId, params.boardUrl]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        getUserRole(user).then(role => {
          setUserLevel(role?.level || 0);
        });
      } else {
        setUserLevel(0);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.currentUser) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      const postRef = doc(db, 'boards', boardId, 'posts', params.postId as string);
      const commentsRef = collection(postRef, 'comments');

      await addDoc(commentsRef, {
        content: newComment,
        author: auth.currentUser.email,
        authorId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      await updateDoc(postRef, {
        commentCount: increment(1),
      });

      setNewComment('');

      // 댓글 목록 새로고침
      const commentsQuery = query(commentsRef, limit(10));
      const commentsSnapshot = await getDocs(commentsQuery);
      const commentsData = commentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];
      setComments(commentsData);
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  const handleEdit = () => {
    if (!auth.currentUser || auth.currentUser.email !== post?.author) {
      alert('게시글 작성자만 수정할 수 있습니다.');
      return;
    }
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      const postRef = doc(db, 'boards', boardId, 'posts', params.postId as string);
      await updateDoc(postRef, {
        title: editTitle,
        content: editContent,
        updatedAt: new Date(),
      });

      setPost(prev =>
        prev
          ? {
              ...prev,
              title: editTitle,
              content: editContent,
              updatedAt: new Date(),
            }
          : null
      );
      setIsEditing(false);
    } catch (error) {
      console.error('게시글 수정 실패:', error);
      alert('게시글 수정에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!auth.currentUser || auth.currentUser.email !== post?.author) {
      alert('게시글 작성자만 삭제할 수 있습니다.');
      return;
    }

    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, 'boards', boardId, 'posts', params.postId as string));
        router.push(`/board/${params.boardUrl}`);
      } catch (error) {
        console.error('게시글 삭제 실패:', error);
        alert('게시글 삭제에 실패했습니다.');
      }
    }
  };

  const handleLike = async () => {
    if (!auth.currentUser) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    try {
      const postRef = doc(db, 'boards', boardId, 'posts', params.postId as string);
      if (isLiked) {
        await updateDoc(postRef, {
          likeCount: increment(-1),
          likes: arrayRemove(auth.currentUser.uid),
        });
      } else {
        await updateDoc(postRef, {
          likeCount: increment(1),
          likes: arrayUnion(auth.currentUser.uid),
        });
      }
      setIsLiked(!isLiked);
      setPost(prev =>
        prev
          ? {
              ...prev,
              likeCount: isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
              likes: isLiked
                ? prev.likes.filter(id => id !== auth.currentUser?.uid)
                : [...(prev.likes || []), auth.currentUser?.uid || ''],
            }
          : null
      );
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <p>게시글을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-white p-6 shadow">
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="제목을 입력하세요"
              />
              <Editor content={editContent} onChange={setEditContent} />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleSaveEdit}
                  className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                  저장
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 border-b border-gray-200 pb-4">
                <h1 className="text-2xl font-bold">{post.title}</h1>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                  <div>
                    <span>작성자: {post.author}</span>
                    <span className="mx-2">|</span>
                    <span>작성일: {post.createdAt.toDate().toLocaleDateString()}</span>
                    {post.updatedAt && post.updatedAt !== post.createdAt && (
                      <>
                        <span className="mx-2">|</span>
                        <span>수정일: {post.updatedAt.toDate().toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span>조회 {post.viewCount}</span>
                    <span>댓글 {post.commentCount}</span>
                    <button
                      onClick={handleLike}
                      className="flex items-center text-gray-600 hover:text-red-500"
                    >
                      {isLiked ? (
                        <HeartIconSolid className="size-5 text-red-500" />
                      ) : (
                        <HeartIcon className="size-5" />
                      )}
                      <span className="ml-1">{post.likeCount || 0}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div
                className="prose mb-6 max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <div className="mb-6 flex justify-end space-x-2">
                {auth.currentUser?.email === post.author && (
                  <button
                    onClick={handleEdit}
                    className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  >
                    수정
                  </button>
                )}
                {(auth.currentUser?.email === post.author || userLevel >= 8) && (
                  <button
                    onClick={handleDelete}
                    className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                  >
                    삭제
                  </button>
                )}
                <button
                  onClick={() => router.push(`/board/${params.boardUrl}`)}
                  className="rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                >
                  목록
                </button>
              </div>

              {/* 댓글 섹션 */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="mb-4 text-lg font-bold">댓글 {comments.length}개</h2>

                {/* 댓글 작성 폼 */}
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <textarea
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="댓글을 입력하세요"
                    className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    >
                      댓글 작성
                    </button>
                  </div>
                </form>

                {/* 댓글 목록 */}
                <div className="space-y-4">
                  {comments.map(comment => (
                    <div key={comment.id} className="border-b border-gray-200 pb-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium">{comment.author}</span>
                        <span className="text-sm text-gray-500">
                          {comment.createdAt.toDate().toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
