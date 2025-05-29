import { NextRequest, NextResponse } from 'next/server';
import { withUserAuth } from '@/middleware/userAuth';
import { getToken } from 'next-auth/jwt';
import { createErrorResponse, ErrorType, withErrorHandling } from '@/lib/errorHandler';
import { db, storage } from '@/firebase/config';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const USERS_COLLECTION = 'users';
const PROFILE_IMAGES_PATH = 'profile-images';

// 최대 파일 크기 (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// 허용된 이미지 타입
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * 프로필 이미지 업로드 API
 */
async function handler(request: NextRequest) {
  // JWT 토큰에서 사용자 ID 가져오기
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const userId = token?.sub;
  
  if (!userId) {
    return createErrorResponse(ErrorType.UNAUTHORIZED, '유효한 사용자 ID를 찾을 수 없습니다.');
  }
  
  // 사용자 프로필 존재 확인
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return createErrorResponse(
      ErrorType.NOT_FOUND, 
      '프로필을 찾을 수 없습니다. 프로필 정보를 먼저 조회해주세요.'
    );
  }
  
  try {
    // multipart/form-data 요청 처리
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    // 파일 유효성 검사
    if (!file) {
      return createErrorResponse(
        ErrorType.BAD_REQUEST, 
        '이미지 파일이 제공되지 않았습니다.'
      );
    }
    
    // 파일 크기 검사
    if (file.size > MAX_FILE_SIZE) {
      return createErrorResponse(
        ErrorType.VALIDATION_ERROR, 
        `파일 크기가 너무 큽니다. 최대 허용 크기: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      );
    }
    
    // 파일 타입 검사
    if (!ALLOWED_TYPES.includes(file.type)) {
      return createErrorResponse(
        ErrorType.VALIDATION_ERROR, 
        `지원되지 않는 파일 형식입니다. 지원되는 형식: ${ALLOWED_TYPES.join(', ')}`
      );
    }
    
    // 파일 데이터를 ArrayBuffer로 변환
    const fileBuffer = await file.arrayBuffer();
    
    // 파일 이름 생성 (userId_timestamp.확장자)
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${userId}_${Date.now()}.${fileExtension}`;
    
    // Firebase Storage에 업로드
    const storageRef = ref(storage, `${PROFILE_IMAGES_PATH}/${fileName}`);
    await uploadBytes(storageRef, new Uint8Array(fileBuffer), {
      contentType: file.type
    });
    
    // 업로드된 이미지의 URL 가져오기
    const imageUrl = await getDownloadURL(storageRef);
    
    // 사용자 프로필 업데이트
    await updateDoc(userRef, {
      profileImage: imageUrl,
      updatedAt: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      message: '프로필 이미지가 성공적으로 업로드되었습니다.',
      profileImage: imageUrl
    });
  } catch (error: any) {
    console.error('프로필 이미지 업로드 오류:', error);
    
    // 특정 오류에 대한 처리
    if (error.code === 'storage/unauthorized') {
      return createErrorResponse(
        ErrorType.FORBIDDEN, 
        '이미지 업로드 권한이 없습니다.'
      );
    }
    
    if (error.code === 'storage/quota-exceeded') {
      return createErrorResponse(
        ErrorType.SERVICE_UNAVAILABLE, 
        '스토리지 할당량이 초과되었습니다. 나중에 다시 시도해주세요.'
      );
    }
    
    return createErrorResponse(
      ErrorType.INTERNAL_ERROR, 
      '이미지 업로드 중 오류가 발생했습니다.'
    );
  }
}

// 인증 및 오류 처리 미들웨어 적용
export const POST = withUserAuth(withErrorHandling(handler));
