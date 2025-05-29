import { NextRequest, NextResponse } from 'next/server';
import { Post } from '../../../types/board';

// 임시 데이터 - 실제 구현 시 데이터베이스 연동
const dummyPosts: Record<string, Post[]> = {
  'notice-board': Array.from({ length: 20 }, (_, i) => ({
    id: `notice-${i + 1}`,
    title: `공지사항 ${i + 1}`,
    content: `이것은 공지사항 ${i + 1}의 내용입니다.`,
    author: `관리자`,
    createdAt: new Date(2023, 5, 10 + i).toISOString(),
    viewCount: Math.floor(Math.random() * 100) + 10,
    commentCount: Math.floor(Math.random() * 10),
    likeCount: Math.floor(Math.random() * 20),
  })),
  'free-board': Array.from({ length: 20 }, (_, i) => ({
    id: `free-${i + 1}`,
    title: `자유게시판 글 ${i + 1}`,
    content: `이것은 자유게시판 글 ${i + 1}의 내용입니다.`,
    author: `사용자${i + 1}`,
    createdAt: new Date(2023, 5, 10 + i).toISOString(),
    viewCount: Math.floor(Math.random() * 100) + 10,
    commentCount: Math.floor(Math.random() * 10),
    likeCount: Math.floor(Math.random() * 20),
  })),
  'qna-board': Array.from({ length: 20 }, (_, i) => ({
    id: `qna-${i + 1}`,
    title: `Q&A 질문 ${i + 1}`,
    content: `이것은 Q&A 질문 ${i + 1}의 내용입니다.`,
    author: `질문자${i + 1}`,
    createdAt: new Date(2023, 5, 10 + i).toISOString(),
    viewCount: Math.floor(Math.random() * 100) + 10,
    commentCount: Math.floor(Math.random() * 10),
    likeCount: Math.floor(Math.random() * 20),
  })),
};

// GET /api/boards/posts
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const boardUrl = url.searchParams.get('boardUrl');
    const postId = url.searchParams.get('postId');
    const page = Number(url.searchParams.get('page') || '1');
    const limit = Number(url.searchParams.get('limit') || '10');

    // 특정 게시판의 특정 게시글 조회
    if (boardUrl && postId) {
      const boardPosts = dummyPosts[boardUrl];

      if (!boardPosts) {
        return NextResponse.json({ success: false, error: 'Board not found' }, { status: 404 });
      }

      const post = boardPosts.find(post => post.id === postId);

      if (!post) {
        return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
      }

      return NextResponse.json({
        post,
        success: true,
      });
    }

    // 특정 게시판의 게시글 목록 조회
    if (boardUrl) {
      const boardPosts = dummyPosts[boardUrl];

      if (!boardPosts) {
        return NextResponse.json({ success: false, error: 'Board not found' }, { status: 404 });
      }

      // 페이지네이션
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedPosts = boardPosts.slice(startIndex, endIndex);

      return NextResponse.json({
        posts: paginatedPosts,
        totalPosts: boardPosts.length,
        totalPages: Math.ceil(boardPosts.length / limit),
        currentPage: page,
        success: true,
      });
    }

    // 모든 게시판의 최신 게시글 조회 (각 게시판별 최신 5개)
    const latestPosts: Record<string, Post[]> = {};

    for (const [slug, posts] of Object.entries(dummyPosts)) {
      latestPosts[slug] = posts.slice(0, 5);
    }

    return NextResponse.json({
      latestPosts,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST /api/boards/posts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 요청 데이터 검증
    if (!body.title || !body.content || !body.boardUrl) {
      return NextResponse.json(
        { success: false, error: 'Title, content and boardUrl are required' },
        { status: 400 }
      );
    }

    const boardUrl = body.boardUrl as string;

    // 게시판 존재 확인
    if (!dummyPosts[boardUrl]) {
      return NextResponse.json({ success: false, error: 'Board not found' }, { status: 404 });
    }

    // 새 게시글 생성
    const newPost: Post = {
      id: `${boardUrl}-${Date.now()}`,
      title: body.title,
      content: body.content,
      author: body.author || '익명',
      createdAt: new Date().toISOString(),
      viewCount: 0,
      commentCount: 0,
      likeCount: 0,
    };

    dummyPosts[boardUrl].unshift(newPost);

    return NextResponse.json(
      {
        post: newPost,
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ success: false, error: 'Failed to create post' }, { status: 500 });
  }
}
