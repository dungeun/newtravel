import { NextRequest, NextResponse } from 'next/server';
import { Section } from '../../types/section';

// 임시 데이터 - 실제 구현 시 데이터베이스 연동
const dummySections: Section[] = [
  {
    id: '1',
    type: 'latest-posts',
    position: 0,
    boardId: 'notice-board',
    config: {
      title: '공지사항',
      limit: 5,
      layout: 'list',
    },
    isActive: true,
  },
  {
    id: '2',
    type: 'banner',
    position: 1,
    config: {
      title: '메인 배너',
    },
    isActive: true,
  },
  {
    id: '3',
    type: 'latest-posts',
    position: 2,
    boardId: 'free-board',
    config: {
      title: '자유게시판',
      limit: 6,
      layout: 'grid',
    },
    isActive: true,
  },
  {
    id: '4',
    type: 'content',
    position: 3,
    config: {
      title: '소개글',
    },
    isActive: true,
  },
];

// GET /api/sections
export async function GET(request: NextRequest) {
  try {
    // 실제 구현 시 데이터베이스에서 섹션 정보를 가져오도록 수정
    // 필터링 및 정렬 구현
    const activeOnly = request.nextUrl.searchParams.get('activeOnly') === 'true';

    let sections = dummySections;

    if (activeOnly) {
      sections = sections.filter(section => section.isActive);
    }

    // 위치(position) 기준으로 정렬
    sections = sections.sort((a, b) => a.position - b.position);

    return NextResponse.json({
      sections,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}

// POST /api/sections
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 요청 데이터 검증
    if (!body.type || !body.config) {
      return NextResponse.json({ success: false, error: 'Invalid section data' }, { status: 400 });
    }

    // 실제 구현 시 데이터베이스에 섹션 추가
    // 여기서는 임시로 처리
    const newSection: Section = {
      id: Date.now().toString(), // 임시 ID 생성
      type: body.type,
      position: body.position || dummySections.length,
      boardId: body.boardId,
      config: body.config,
      isActive: body.isActive !== undefined ? body.isActive : true,
    };

    // 임시 데이터에 추가
    dummySections.push(newSection);

    return NextResponse.json({
      section: newSection,
      success: true,
    });
  } catch (error) {
    console.error('Error creating section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create section' },
      { status: 500 }
    );
  }
}

// PUT /api/sections?id={sectionId}
export async function PUT(request: NextRequest) {
  try {
    const sectionId = request.nextUrl.searchParams.get('id');

    if (!sectionId) {
      return NextResponse.json(
        { success: false, error: 'Section ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // 실제 구현 시 데이터베이스에서 섹션 업데이트
    // 여기서는 임시로 처리
    const sectionIndex = dummySections.findIndex(section => section.id === sectionId);

    if (sectionIndex === -1) {
      return NextResponse.json({ success: false, error: 'Section not found' }, { status: 404 });
    }

    // 기존 데이터와 병합
    const updatedSection = {
      ...dummySections[sectionIndex],
      ...body,
      id: sectionId, // ID는 변경 불가
      config: {
        ...dummySections[sectionIndex].config,
        ...body.config,
      },
    };

    dummySections[sectionIndex] = updatedSection;

    return NextResponse.json({
      section: updatedSection,
      success: true,
    });
  } catch (error) {
    console.error('Error updating section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update section' },
      { status: 500 }
    );
  }
}

// DELETE /api/sections?id={sectionId}
export async function DELETE(request: NextRequest) {
  try {
    const sectionId = request.nextUrl.searchParams.get('id');

    if (!sectionId) {
      return NextResponse.json(
        { success: false, error: 'Section ID is required' },
        { status: 400 }
      );
    }

    // 실제 구현 시 데이터베이스에서 섹션 삭제
    // 여기서는 임시로 처리
    const sectionIndex = dummySections.findIndex(section => section.id === sectionId);

    if (sectionIndex === -1) {
      return NextResponse.json({ success: false, error: 'Section not found' }, { status: 404 });
    }

    dummySections.splice(sectionIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Section deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete section' },
      { status: 500 }
    );
  }
}
