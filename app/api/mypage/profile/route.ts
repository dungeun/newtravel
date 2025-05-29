import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/config';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { withUserAuth } from '@/middleware/userAuth';
import { getToken } from 'next-auth/jwt';
import { createErrorResponse, ErrorType, withErrorHandling } from '@/lib/errorHandler';

// 동적 렌더링 강제
export const dynamic = 'force-dynamic';

const USERS_COLLECTION = 'users';

// 사용자 프로필 조회 API
async function getHandler(request: NextRequest) {
  // JWT 토큰에서 사용자 ID 가져오기
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const userId = token?.sub;
  const userName = token?.name || '';
  const userEmail = token?.email || '';
  
  if (!userId) {
    return createErrorResponse(ErrorType.UNAUTHORIZED, '유효한 사용자 ID를 찾을 수 없습니다.');
  }
  
  // Firestore에서 사용자 프로필 정보 조회
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    // 사용자 프로필이 없는 경우 기본 정보로 생성
    const defaultProfile = {
      id: userId,
      name: userName,
      email: userEmail,
      phone: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(userRef, defaultProfile);
    
    return NextResponse.json({
      success: true,
      profile: defaultProfile,
      isNewProfile: true
    });
  }
  
  // 프로필 정보 반환
  const userData = userSnap.data();
  return NextResponse.json({
    success: true,
    profile: { id: userSnap.id, ...userData },
    isNewProfile: false
  });
}

// 사용자 프로필 업데이트 API
async function putHandler(request: NextRequest) {
  // JWT 토큰에서 사용자 ID 가져오기
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const userId = token?.sub;
  const userEmail = token?.email || '';
  
  if (!userId) {
    return createErrorResponse(ErrorType.UNAUTHORIZED, '유효한 사용자 ID를 찾을 수 없습니다.');
  }
  
  // 요청 본문 파싱
  let profileData;
  try {
    profileData = await request.json();
  } catch (error) {
    return createErrorResponse(
      ErrorType.BAD_REQUEST, 
      '잘못된 요청 형식입니다. 유효한 JSON 데이터를 전송해주세요.'
    );
  }
  
  // 필수 필드 검증
  if (!profileData.name || !profileData.email || !profileData.phone) {
    return createErrorResponse(
      ErrorType.VALIDATION_ERROR, 
      '이름, 이메일, 전화번호는 필수 입력 항목입니다.',
      { 
        requiredFields: ['name', 'email', 'phone'],
        providedFields: Object.keys(profileData)
      }
    );
  }
  
  // 이메일 변경 방지 (보안상 이유로)
  if (profileData.email !== userEmail) {
    return createErrorResponse(
      ErrorType.FORBIDDEN, 
      '이메일은 변경할 수 없습니다. 이메일 변경은 별도의 인증 과정을 통해 처리해야 합니다.'
    );
  }
  
  // 전화번호 형식 검증
  const phoneRegex = /^\d{2,3}-?\d{3,4}-?\d{4}$/;
  if (!phoneRegex.test(profileData.phone)) {
    return createErrorResponse(
      ErrorType.VALIDATION_ERROR, 
      '전화번호 형식이 잘못되었습니다. 예: 010-1234-5678',
      { providedPhone: profileData.phone }
    );
  }
  
  // 업데이트할 데이터 준비
  const updateData = {
    ...profileData,
    updatedAt: new Date().toISOString()
  };
  
  // ID 필드 제거 (Firestore에서는 문서 ID로 사용)
  delete updateData.id;
  
  // Firestore에서 사용자 프로필 정보 업데이트
  const userRef = doc(db, USERS_COLLECTION, userId);
  
  // 사용자 프로필 존재 확인
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    return createErrorResponse(
      ErrorType.NOT_FOUND, 
      '프로필을 찾을 수 없습니다. 프로필 정보를 먼저 조회해주세요.'
    );
  }
  
  await updateDoc(userRef, updateData);
  
  return NextResponse.json({ 
    success: true, 
    message: '프로필이 성공적으로 업데이트되었습니다.',
    profile: { id: userId, ...updateData }
  });
}

// 인증 및 오류 처리 미들웨어 적용
export const GET = withUserAuth(withErrorHandling(getHandler));
export const PUT = withUserAuth(withErrorHandling(putHandler));
