'use client';

import React, { useEffect, useState } from 'react';
import { db, auth } from '@/firebase/config';
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ScaleIcon,
  PuzzlePieceIcon,
  MapIcon,
  FilmIcon,
  BeakerIcon,
  ChevronRightIcon,
  TrophyIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

interface Board {
  id: string;
  name: string;
  description: string;
  url: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  likes: number;
  comments: number;
  boardId: string;
  views: number;
}

interface User {
  id: string;
  name: string;
  points: number;
  searchCount: number;
}

interface TemplateSettings {
  settings: {
    group1: {
      block1: string;
      block2: string;
      banner: string;
    };
    group2: {
      block1: string;
      block2: string;
      banner: string;
    };
  };
}

interface BoardContent {
  id: string;
  title: string;
  content: string;
  boardId: string;
  boardName: string;
}

const renderBoardSection = (
  boardId: string,
  posts: { [key: string]: Post[] },
  boards: { [key: string]: Board },
  icon: React.ReactNode
) => {
  if (!boardId || !boards[boardId]) return null;
  const board = boards[boardId];

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <span className="size-6 text-black">{icon}</span>
          <span className="font-bold">{board.name}</span>
        </h2>
        <Link
          href={`/board/${board.url}`}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          더보기
          <ChevronRightIcon className="ml-1 size-4" />
        </Link>
      </div>
      {renderPosts(boardId, posts)}
    </div>
  );
};

const renderPosts = (boardId: string, posts: { [key: string]: Post[] }) => {
  const boardPosts = posts[boardId] || [];

  if (boardPosts.length === 0) {
    return <p className="text-gray-500">게시물이 없습니다.</p>;
  }

  return (
    <ul className="space-y-2">
      {boardPosts.map(post => (
        <li key={post.id} className="flex flex-col border-b py-2 last:border-b-0">
          <div className="flex items-center justify-between">
            <Link
              href={`/board/${boardId}/${post.id}`}
              className="flex-1 cursor-pointer truncate text-gray-900 hover:text-blue-600"
            >
              {post.title}
            </Link>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{format(post.createdAt, 'M.d')}</span>
              <span className="flex items-center">
                <UserIcon className="mr-1 size-4" />
                {post.views || 0}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default function Template1Page() {
  const [templateSettings, setTemplateSettings] = useState<TemplateSettings | null>(null);
  const [boards, setBoards] = useState<{ [key: string]: Board }>({});
  const [posts, setPosts] = useState<{ [key: string]: Post[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('구글 로그인 실패:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 템플릿 설정 가져오기
        const templateDoc = doc(db, 'settings', 'template1');
        const templateSnapshot = await getDoc(templateDoc);

        if (templateSnapshot.exists()) {
          const settings = templateSnapshot.data() as TemplateSettings;
          setTemplateSettings(settings);

          // 게시판 목록 가져오기
          const boardsQuery = query(collection(db, 'boards'));
          const boardsSnapshot = await getDocs(boardsQuery);
          const boardsData: { [key: string]: Board } = {};

          boardsSnapshot.forEach(doc => {
            boardsData[doc.id] = { id: doc.id, ...doc.data() } as Board;
          });
          setBoards(boardsData);

          // 각 게시판의 최신 게시물 가져오기
          const postsData: { [key: string]: Post[] } = {};

          // 모든 블록의 게시판 ID 수집
          const allBoardIds = new Set(
            [
              settings.settings.group1.block1,
              settings.settings.group1.block2,
              settings.settings.group1.banner,
              settings.settings.group2.block1,
              settings.settings.group2.block2,
              settings.settings.group2.banner,
            ].filter(Boolean)
          );

          for (const boardId of allBoardIds) {
            try {
              const postsRef = collection(db, 'boards', boardId, 'posts');
              const postsQuery = query(postsRef, orderBy('createdAt', 'desc'), limit(5));
              const postsSnapshot = await getDocs(postsQuery);
              const fetchedPosts = postsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                views: doc.data().viewCount || 0,
                likes: doc.data().likes || 0,
                comments: doc.data().commentCount || 0,
              })) as Post[];

              postsData[boardId] = fetchedPosts;
            } catch (error) {
              console.error(`게시판 ${boardId}의 게시물을 불러오는 중 오류 발생:`, error);
              postsData[boardId] = [];
            }
          }
          setPosts(postsData);

          // 상위 사용자 가져오기
          try {
            const usersQuery = query(collection(db, 'users'), orderBy('points', 'desc'), limit(10));
            const usersSnapshot = await getDocs(usersQuery);
            const usersData = usersSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            })) as User[];
            setTopUsers(usersData);
          } catch (error) {
            console.error('사용자 데이터를 불러오는 중 오류 발생:', error);
            setTopUsers([]);
          }
        } else {
          setError('템플릿 설정을 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('데이터 로딩 중 오류 발생:', error);
        setError('데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 검색 로직 구현
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-32 animate-spin rounded-full border-y-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 메인 배너 */}
      <section className="relative mb-8 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto px-4">
          <div className="py-12 text-center">
            <h1 className="mb-2 text-2xl font-bold text-white md:text-4xl">
              CodeB 커뮤니티에 오신 것을 환영합니다
            </h1>
            <p className="text-lg text-white/90 md:text-xl">
              개발자들을 위한 지식 공유 및 커뮤니티 플랫폼
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        {/* 모바일 검색창 */}
        <div className="mb-4 block md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="검색어를 입력하세요..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
              <MagnifyingGlassIcon className="size-5 text-gray-500" />
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* 메인 컨텐츠 */}
          <div className="flex-1">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {templateSettings && (
                <>
                  {/* 첫 번째 그룹 */}
                  <div className="space-y-6">
                    {renderBoardSection(
                      templateSettings.settings.group1.block1,
                      posts,
                      boards,
                      <ScaleIcon />
                    )}
                    {renderBoardSection(
                      templateSettings.settings.group1.block2,
                      posts,
                      boards,
                      <PuzzlePieceIcon />
                    )}
                  </div>

                  {/* 두 번째 그룹 */}
                  <div className="space-y-6">
                    {renderBoardSection(
                      templateSettings.settings.group2.block1,
                      posts,
                      boards,
                      <MapIcon />
                    )}
                    {renderBoardSection(
                      templateSettings.settings.group2.block2,
                      posts,
                      boards,
                      <FilmIcon />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 사이드바 */}
          <div className="hidden w-80 space-y-6 lg:block">
            {/* 로그인 섹션 */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold">로그인</h2>
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="size-10 rounded-full"
                      />
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-full bg-gray-200">
                        <UserIcon className="size-6 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{user.displayName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center space-x-2 rounded-md bg-red-600 py-2 text-white transition-colors hover:bg-red-700"
                  >
                    <ArrowRightOnRectangleIcon className="size-5" />
                    <span>로그아웃</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={handleGoogleLogin}
                    className="flex w-full items-center justify-center space-x-2 rounded-md border border-gray-300 bg-white py-2 text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <img src="/google-logo.png" alt="Google" className="size-5" />
                    <span>Google로 로그인</span>
                  </button>
                  <div className="flex justify-between text-sm">
                    <Link href="#" className="text-blue-600 hover:text-blue-800">
                      회원가입
                    </Link>
                    <Link href="#" className="text-gray-600 hover:text-gray-800">
                      아이디/비밀번호 찾기
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 포인트 랭킹 */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 flex items-center text-lg font-bold">
                <TrophyIcon className="mr-2 size-5 text-yellow-500" />
                포인트 랭킹
              </h2>
              <div className="space-y-2">
                {topUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-md p-2 hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <span className="w-6 text-gray-500">{index + 1}</span>
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <span className="text-blue-600">{user.points}P</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 검색 랭킹 */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 flex items-center text-lg font-bold">
                <FireIcon className="mr-2 size-5 text-red-500" />
                검색 랭킹
              </h2>
              <div className="space-y-2">
                {topUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-md p-2 hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <span className="w-6 text-gray-500">{index + 1}</span>
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <span className="text-gray-600">{user.searchCount}회</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
