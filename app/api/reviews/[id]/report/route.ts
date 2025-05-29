import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { reviewReportSchema } from '@/lib/validations/review';

// 오류 응답 생성 함수
const createErrorResponse = (message: string, status: number = 400) => {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
};

// 인증 확인 함수
const checkAuth = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { authenticated: false, error: '로그인이 필요합니다.', status: 401 };
  }
  return { authenticated: true, userId: session.user.id };
};

// 신고 사유 유형
const reportReasons = [
  '부적절한 내용',
  '음란성 내용',
  '허위 정보',
  '광고성 내용',
  '저작권 침해',
  '기타'
];

// 리뷰 신고 API
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 확인
    const authResult = await checkAuth(req);
    if (!authResult.authenticated) {
      return createErrorResponse(authResult.error, authResult.status);
    }
    
    const userId = authResult.userId;
    const reviewId = params.id;
    
    if (!reviewId) {
      return createErrorResponse('리뷰 ID가 필요합니다.');
    }
    
    // 요청 데이터 파싱 및 검증
    const requestData = await req.json();
    
    try {
      reviewReportSchema.parse({
        reviewId,
        reason: requestData.reason
      });
    } catch (validationError: any) {
      return createErrorResponse(validationError.errors?.[0]?.message || '유효하지 않은 데이터입니다.');
    }
    
    // 신고 사유 확인
    if (!reportReasons.includes(requestData.reason) && requestData.reason !== '기타') {
      return createErrorResponse('유효하지 않은 신고 사유입니다.');
    }
    
    // 리뷰 존재 여부 확인
    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewSnap = await getDoc(reviewRef);
    
    if (!reviewSnap.exists()) {
      return createErrorResponse('존재하지 않는 리뷰입니다.', 404);
    }
    
    // 승인된 리뷰인지 확인
    const reviewData = reviewSnap.data();
    if (reviewData.status !== 'approved') {
      return createErrorResponse('승인되지 않은 리뷰는 신고할 수 없습니다.', 403);
    }
    
    // 자기 자신의 리뷰를 신고하는지 확인
    if (reviewData.userId === userId) {
      return createErrorResponse('자신의 리뷰는 신고할 수 없습니다.', 403);
    }
    
    // 트랜잭션을 사용하여 신고 처리
    return await runTransaction(db, async (transaction) => {
      // 이미 신고했는지 확인
      const reportsRef = collection(db, 'reviewReports');
      const reportQuery = query(
        reportsRef,
        where('reviewId', '==', reviewId),
        where('userId', '==', userId)
      );
      const reportSnapshot = await getDocs(reportQuery);
      
      if (!reportSnapshot.empty) {
        return createErrorResponse('이미 신고한 리뷰입니다.');
      }
      
      // 신고 데이터 생성
      const reportData = {
        reviewId,
        userId,
        reviewUserId: reviewData.userId,
        productId: reviewData.productId,
        productName: reviewData.productName || '',
        reviewTitle: reviewData.title || '',
        reason: requestData.reason,
        reasonDetail: requestData.reasonDetail || '',
        status: 'pending', // pending, reviewed, rejected
        createdAt: serverTimestamp()
      };
      
      // 신고 저장
      const reportRef = doc(collection(db, 'reviewReports'));
      transaction.set(reportRef, reportData);
      
      // 신고 수가 일정 수준 이상이면 리뷰 자동 비활성화 로직 추가 가능
    
      return NextResponse.json({
        success: true,
        message: '리뷰가 신고되었습니다. 검토 후 조치하겠습니다.'
      });
    });
  } catch (error: any) {
    console.error('리뷰 신고 오류:', error);
    return createErrorResponse(error.message || '리뷰 신고 처리 중 오류가 발생했습니다.', 500);
  }
}
