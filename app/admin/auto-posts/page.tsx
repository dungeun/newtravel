'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/firebase/config';
import { collection, addDoc, getDocs, writeBatch, doc } from 'firebase/firestore';
import { format } from 'date-fns';
import { UserIcon, ChatBubbleLeftIcon, EyeIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

interface Board {
  id: string;
  name: string;
  url: string;
}

interface SearchResult {
  title: string;
  content: string;
  author: string;
  source: 'naver' | 'tistory';
}

interface AutoPost {
  id?: string;
  title: string;
  content: string;
  author: string;
  boardId: string;
  views: number;
  comments: {
    id: string;
    content: string;
    createdAt: Date;
    author: string;
  }[];
  createdAt: Date;
}

interface ProgressStep {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  message?: string;
}

export default function AutoPostsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [postCount, setPostCount] = useState<number>(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<AutoPost[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([
    { id: 'naver', title: '네이버 블로그 검색', status: 'pending' },
    { id: 'tistory', title: '티스토리 검색', status: 'pending' },
    { id: 'generate', title: '게시글 생성', status: 'pending' },
    { id: 'upload', title: '자료 업로드', status: 'pending' },
  ]);
  const [progress, setProgress] = useState({
    naver: false,
    tistory: false,
    creating: false,
    uploading: false,
  });

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const boardsRef = collection(db, 'boards');
        const snapshot = await getDocs(boardsRef);
        const boardsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Board[];
        setBoards(boardsData);
      } catch (error) {
        console.error('게시판 목록 가져오기 실패:', error);
        setError('게시판 목록을 가져오는데 실패했습니다.');
      }
    };

    fetchBoards();
  }, []);

  const handleBoardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const boardId = e.target.value;
    setSelectedBoard(boardId);

    const selectedBoard = boards.find(board => board.id === boardId);
    if (selectedBoard) {
      setSearchKeyword(selectedBoard.name);
    }
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKeyword = e.target.value;
    setSearchKeyword(newKeyword);
  };

  const getSearchKeywords = () => {
    return searchKeyword
      .split(',')
      .map(keyword => keyword.trim())
      .filter(keyword => keyword);
  };

  const updateProgressStep = (id: string, status: ProgressStep['status'], message?: string) => {
    setProgressSteps(prev =>
      prev.map(step => (step.id === id ? { ...step, status, message } : step))
    );
  };

  const fetchNaverBlog = async (keyword: string): Promise<SearchResult[]> => {
    try {
      console.log('네이버 블로그 검색 시작:', keyword);
      updateProgressStep('naver', 'in-progress', '네이버 블로그 검색 중...');
      const response = await axios.get(
        `/api/crawl?keyword=${encodeURIComponent(keyword)}&source=naver`
      );
      console.log('네이버 블로그 검색 응답:', response.data);
      const results = response.data;
      updateProgressStep('naver', 'completed', `${results.length}개의 결과를 찾았습니다.`);
      return results;
    } catch (error) {
      console.error('네이버 블로그 검색 실패:', error);
      if (error instanceof Error) {
        console.error('에러 상세:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }
      updateProgressStep('naver', 'error', '검색 중 오류가 발생했습니다.');
      return [];
    }
  };

  const fetchTistory = async (keyword: string): Promise<SearchResult[]> => {
    try {
      console.log('티스토리 검색 시작:', keyword);
      updateProgressStep('tistory', 'in-progress', '티스토리 검색 중...');
      const response = await axios.get(
        `/api/crawl?keyword=${encodeURIComponent(keyword)}&source=tistory`
      );
      console.log('티스토리 검색 응답:', response.data);
      const results = response.data;
      updateProgressStep('tistory', 'completed', `${results.length}개의 결과를 찾았습니다.`);
      return results;
    } catch (error) {
      console.error('티스토리 검색 실패:', error);
      if (error instanceof Error) {
        console.error('에러 상세:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }
      updateProgressStep('tistory', 'error', '검색 중 오류가 발생했습니다.');
      return [];
    }
  };

  const generateRandomComments = (count: number) => {
    const comments = [];
    const commentContents = [
      '좋은 글 감사합니다!',
      '정말 유용한 정보네요.',
      '추가로 이런 내용도 있으면 좋을 것 같아요.',
      '잘 읽었습니다. 도움이 많이 되었어요.',
      '이 부분은 조금 더 자세히 설명해주실 수 있을까요?',
      '실제로 적용해보니 효과가 좋았습니다.',
      '다른 방법도 있을 것 같은데, 어떻게 생각하시나요?',
      '이전에 비슷한 경험이 있었는데, 이렇게 해결했어요.',
      '좋은 정보 공유 감사합니다.',
      '다음 글도 기대됩니다!',
    ];

    for (let i = 0; i < count; i++) {
      comments.push({
        id: `comment-${i}`,
        content: commentContents[Math.floor(Math.random() * commentContents.length)],
        createdAt: new Date(),
        author: `사용자${Math.floor(Math.random() * 1000)}`,
      });
    }

    return comments;
  };

  const handleGeneratePosts = async () => {
    if (!selectedBoard || !searchKeyword) {
      setError('게시판과 검색어를 모두 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setProgress({
      naver: false,
      tistory: false,
      creating: false,
      uploading: false,
    });

    try {
      // 네이버 블로그 크롤링
      setProgress(prev => ({ ...prev, naver: true }));
      const naverResults = await fetchNaverBlog(searchKeyword);
      setProgress(prev => ({ ...prev, naver: false }));

      // 티스토리 크롤링
      setProgress(prev => ({ ...prev, tistory: true }));
      const tistoryResults = await fetchTistory(searchKeyword);
      setProgress(prev => ({ ...prev, tistory: false }));

      // 결과 합치기
      const allResults = [...naverResults, ...tistoryResults];
      const selectedResults = allResults.slice(0, postCount);

      // 게시물 생성
      setProgress(prev => ({ ...prev, creating: true }));
      const posts = selectedResults.map(result => ({
        title: result.title,
        content: result.content,
        author: result.author,
        boardId: selectedBoard,
        views: Math.floor(Math.random() * 1000),
        comments: generateRandomComments(Math.floor(Math.random() * 10)),
        createdAt: new Date(),
      }));
      setProgress(prev => ({ ...prev, creating: false }));

      // 데이터 업로드
      setProgress(prev => ({ ...prev, uploading: true }));
      const batch = writeBatch(db);
      posts.forEach(post => {
        const postRef = doc(collection(db, 'boards', selectedBoard, 'posts'));
        batch.set(postRef, post);
      });
      await batch.commit();
      setProgress(prev => ({ ...prev, uploading: false }));

      setGeneratedPosts(
        posts.map(post => ({
          ...post,
          id: '',
          viewCount: post.views,
          commentCount: post.comments.length,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : '게시물 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const extractNaverResults = (html: string): SearchResult[] => {
    const titleRegex = /<a class="title_link".*?>(.*?)<\/a>/g;
    const contentRegex = /<div class="dsc_txt">(.*?)<\/div>/g;
    const authorRegex = /<span class="sub_txt">(.*?)<\/span>/g;

    const titles = Array.from(html.matchAll(titleRegex)).map((match: RegExpMatchArray) => match[1]);
    const contents = Array.from(html.matchAll(contentRegex)).map(
      (match: RegExpMatchArray) => match[1]
    );
    const authors = Array.from(html.matchAll(authorRegex)).map(
      (match: RegExpMatchArray) => match[1]
    );

    return titles.map((title, index) => ({
      title: title.replace(/<[^>]*>/g, '').trim(),
      content: contents[index]?.replace(/<[^>]*>/g, '').trim() || '',
      author: authors[index]?.replace(/<[^>]*>/g, '').trim() || '블로거',
      source: 'naver',
    }));
  };

  const extractTistoryResults = (html: string): SearchResult[] => {
    const titleRegex = /<a class="link_post".*?>(.*?)<\/a>/g;
    const contentRegex = /<p class="desc">(.*?)<\/p>/g;
    const authorRegex = /<span class="author">(.*?)<\/span>/g;

    const titles = Array.from(html.matchAll(titleRegex)).map((match: RegExpMatchArray) => match[1]);
    const contents = Array.from(html.matchAll(contentRegex)).map(
      (match: RegExpMatchArray) => match[1]
    );
    const authors = Array.from(html.matchAll(authorRegex)).map(
      (match: RegExpMatchArray) => match[1]
    );

    return titles.map((title, index) => ({
      title: title.replace(/<[^>]*>/g, '').trim(),
      content: contents[index]?.replace(/<[^>]*>/g, '').trim() || '',
      author: authors[index]?.replace(/<[^>]*>/g, '').trim() || '티스토리 블로거',
      source: 'tistory',
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">게시물 자동 생성</h1>

        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <div className="space-y-4">
            {error && (
              <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-600">
                {error}
              </div>
            )}

            {/* Progress Steps */}
            <div className="space-y-4">
              {progressSteps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-4">
                  <div
                    className={`flex size-8 items-center justify-center rounded-full ${
                      step.status === 'completed'
                        ? 'bg-green-500'
                        : step.status === 'in-progress'
                          ? 'bg-blue-500'
                          : step.status === 'error'
                            ? 'bg-red-500'
                            : 'bg-gray-300'
                    }`}
                  >
                    {step.status === 'completed'
                      ? '✓'
                      : step.status === 'in-progress'
                        ? '⟳'
                        : step.status === 'error'
                          ? '✕'
                          : index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{step.title}</div>
                    {step.message && <div className="text-sm text-gray-500">{step.message}</div>}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">게시판 선택</label>
              <select
                value={selectedBoard}
                onChange={handleBoardChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">게시판을 선택하세요</option>
                {boards.map(board => (
                  <option key={board.id} value={board.id}>
                    {board.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                검색 키워드 (쉼표로 구분하여 여러 키워드 입력 가능)
              </label>
              <input
                type="text"
                value={searchKeyword}
                onChange={handleKeywordChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="검색할 키워드를 입력하세요 (쉼표로 구분)"
              />
              <p className="mt-1 text-sm text-gray-500">
                예: {boards.find(board => board.id === selectedBoard)?.name || '게시판 이름'},
                추가키워드1, 추가키워드2
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                생성할 게시물 수
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={postCount}
                onChange={e => setPostCount(Number(e.target.value))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleGeneratePosts}
              disabled={isGenerating}
              className="w-full rounded-md bg-blue-600 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isGenerating ? '생성 중...' : '게시물 생성하기'}
            </button>
          </div>
        </div>

        {isGenerating && (
          <div className="flex items-center justify-between space-x-4 py-2">
            <div className="flex items-center space-x-2">
              <div
                className={`size-3 rounded-full ${progress.naver ? 'bg-blue-500' : 'bg-gray-200'}`}
              />
              <span className="text-xs">네이버 블로그</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`size-3 rounded-full ${progress.tistory ? 'bg-blue-500' : 'bg-gray-200'}`}
              />
              <span className="text-xs">티스토리</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`size-3 rounded-full ${progress.creating ? 'bg-blue-500' : 'bg-gray-200'}`}
              />
              <span className="text-xs">게시물 생성</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`size-3 rounded-full ${progress.uploading ? 'bg-blue-500' : 'bg-gray-200'}`}
              />
              <span className="text-xs">데이터 업로드</span>
            </div>
          </div>
        )}

        {generatedPosts.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold">생성된 게시물</h2>
            <div className="space-y-4">
              {generatedPosts.map(post => (
                <div key={post.id} className="border-b pb-4 last:border-b-0">
                  <h3 className="mb-2 text-lg font-semibold">{post.title}</h3>
                  <div className="mb-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <UserIcon className="mr-1 size-3" />
                      {post.author}
                    </span>
                    <span className="flex items-center">
                      <EyeIcon className="mr-1 size-3" />
                      {post.views}
                    </span>
                    <span className="flex items-center">
                      <ChatBubbleLeftIcon className="mr-1 size-3" />
                      {post.comments.length}
                    </span>
                    <span>{format(post.createdAt, 'yyyy.MM.dd HH:mm')}</span>
                  </div>
                  <p className="line-clamp-2 text-gray-700">{post.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
