import { NextRequest, NextResponse } from 'next/server';

// 임시 데이터 - 실제 구현 시 데이터베이스 연동
const designConfig = {
  theme: {
    primaryColor: '#3B82F6',
    secondaryColor: '#7C3AED',
    textColor: '#1F2937',
    backgroundColor: '#FFFFFF',
    footerColor: '#F3F4F6',
    fontFamily: 'system-ui, sans-serif',
  },
  layout: {
    headerStyle: 'default',
    sidebarEnabled: true,
    containerWidth: 'lg',
    footerStyle: 'simple',
  },
  logo: {
    text: '게시판 CMS',
    imageUrl: '',
    width: 180,
    height: 40,
  },
};

// GET /api/design
export async function GET() {
  try {
    // 실제 구현 시 데이터베이스에서 디자인 설정을 가져오도록 수정
    return NextResponse.json({
      config: designConfig,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching design config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch design configuration' },
      { status: 500 }
    );
  }
}

// PUT /api/design
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // 실제 구현 시 데이터베이스에 디자인 설정 업데이트
    // 여기서는 임시로 처리
    Object.assign(designConfig, body);

    return NextResponse.json({
      config: designConfig,
      success: true,
    });
  } catch (error) {
    console.error('Error updating design config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update design configuration' },
      { status: 500 }
    );
  }
}
