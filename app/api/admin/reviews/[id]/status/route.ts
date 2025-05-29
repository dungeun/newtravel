import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { z } from 'zod';

// 리뷰 상태 변경 스키마
const statusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected'])
});

// 관리자용 리뷰 상태 변경 API
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;
    
    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: '리뷰 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 현재 로그인한 사용자 정보
    const session = await getServerSession(authOptions);
    
    // 관리자 권한 확인
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }
    
    // 리뷰 조회
    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewSnap = await getDoc(reviewRef);
    
    if (!reviewSnap.exists()) {
      return NextResponse.json(
        { success: false, error: '존재하지 않는 리뷰입니다.' },
        { status: 404 }
      );
    }
    
    // 요청 데이터 파싱 및 검증
    const requestData = await req.json();
    
    try {
      const validatedData = statusSchema.parse(requestData);
      
      // 리뷰 상태 업데이트
      await updateDoc(reviewRef, {
        status: validatedData.status,
        updatedAt: serverTimestamp()
      });
      
      return NextResponse.json({
        success: true,
        message: `리뷰 상태가 '${validatedData.status}'로 변경되었습니다.`
      });
    } catch (validationError: any) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 상태값입니다.' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('리뷰 상태 변경 오류:', error);
    
    return NextResponse.json(
      { success: false, error: error.message || '리뷰 상태 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
