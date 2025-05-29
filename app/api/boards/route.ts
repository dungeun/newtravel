import { NextRequest, NextResponse } from 'next/server';
import { Board } from '../../types/board';

// 임시 데이터 - 실제 구현 시 데이터베이스 연동
const dummyBoards: Board[] = [
  {
    id: 'notice-board',
    name: '공지사항',
    description: '중요한 공지사항을 확인하세요.',
    slug: 'notice-board',
    isActive: true,
  },
  {
    id: 'free-board',
    name: '자유게시판',
    description: '자유롭게 의견을 나눠보세요.',
    slug: 'free-board',
    isActive: true,
  },
  {
    id: 'qna-board',
    name: 'Q&A',
    description: '질문과 답변을 공유하세요.',
    slug: 'qna-board',
    isActive: true,
  },
];

// GET /api/boards
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');

    // 특정 slug로 게시판 조회
    if (slug) {
      const board = dummyBoards.find(board => board.slug === slug);

      if (!board) {
        return NextResponse.json({ success: false, error: 'Board not found' }, { status: 404 });
      }

      return NextResponse.json({
        board,
        success: true,
      });
    }

    // 모든 게시판 목록 조회
    return NextResponse.json({
      boards: dummyBoards,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch boards' }, { status: 500 });
  }
}

// POST /api/boards
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 요청 데이터 검증
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { success: false, error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // slug 중복 확인
    const existingBoard = dummyBoards.find(board => board.slug === body.slug);
    if (existingBoard) {
      return NextResponse.json(
        { success: false, error: 'Board slug already exists' },
        { status: 400 }
      );
    }

    // 새 게시판 생성
    const newBoard: Board = {
      id: Date.now().toString(),
      name: body.name,
      description: body.description || '',
      slug: body.slug,
      isActive: body.isActive !== undefined ? body.isActive : true,
    };

    dummyBoards.push(newBoard);

    return NextResponse.json(
      {
        board: newBoard,
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating board:', error);
    return NextResponse.json({ success: false, error: 'Failed to create board' }, { status: 500 });
  }
}
