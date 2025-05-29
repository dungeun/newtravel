'use client';

import { storage } from '@/firebase/config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * 이미지 파일을 Firebase Storage에 업로드하는 함수
 * @param file 업로드할 파일
 * @param path 저장 경로 (예: 'logos', 'banners', 'hero-slides')
 * @param fileName 파일 이름 (생략 시 타임스탬프와 원본 파일명 사용)
 * @returns 업로드된 파일의 다운로드 URL
 */
export async function uploadImageToStorage(
  file: File, 
  path: string, 
  fileName?: string
): Promise<string> {
  if (!file) {
    throw new Error('업로드할 파일이 없습니다.');
  }
  
  // 파일 형식 확인
  if (!file.type.startsWith('image/')) {
    throw new Error(`지원되지 않는 파일 형식입니다: ${file.type}`);
  }
  
  // 파일 크기 제한 (10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(`파일 크기가 너무 큽니다. 최대 10MB까지 업로드 가능합니다.`);
  }
  
  try {
    console.log(`[Storage Helper] 이미지 업로드 시작: ${path}/${fileName || file.name}`);
    
    // 파일명 생성 (타임스탬프 추가)
    const timestamp = Date.now();
    const finalFileName = fileName || `${timestamp}_${file.name.replace(/[^a-zA-Z0-9_.]/g, '_')}`;
    const fullPath = `${path}/${finalFileName}`;
    
    // Storage 참조 생성
    const storageRef = ref(storage, fullPath);
    
    // 파일 업로드
    console.log(`[Storage Helper] 업로드 중...`);
    const uploadResult = await uploadBytes(storageRef, file);
    console.log(`[Storage Helper] 업로드 완료:`, uploadResult);
    
    // 다운로드 URL 가져오기
    const downloadURL = await getDownloadURL(uploadResult.ref);
    console.log(`[Storage Helper] 다운로드 URL:`, downloadURL);
    
    return downloadURL;
  } catch (error: any) {
    console.error(`[Storage Helper] 업로드 오류:`, error);
    
    // 상세 오류 정보 로깅
    if (error.code) {
      console.error(`[Storage Helper] 오류 코드: ${error.code}`);
    }
    
    throw new Error(`이미지 업로드 실패: ${error.message || '알 수 없는 오류'}`);
  }
}

/**
 * Firebase Storage에서 이미지 파일을 삭제하는 함수
 * @param url 삭제할 이미지의 URL
 */
export async function deleteImageFromStorage(url: string): Promise<void> {
  try {
    // URL에서 경로 추출
    const decodedUrl = decodeURIComponent(url);
    const pathRegex = /([^/]+)%2F([^?]+)/; // %2F는 URL 인코딩된 '/'
    const match = decodedUrl.match(pathRegex);
    
    if (!match) {
      throw new Error('유효한 Storage URL이 아닙니다.');
    }
    
    const [, folder, fileName] = match;
    const fullPath = `${folder}/${fileName}`;
    
    console.log(`[Storage Helper] 이미지 삭제 시작: ${fullPath}`);
    
    // Storage 참조 생성
    const imageRef = ref(storage, fullPath);
    
    // 파일 삭제
    await deleteObject(imageRef);
    console.log(`[Storage Helper] 이미지 삭제 완료: ${fullPath}`);
  } catch (error: any) {
    console.error(`[Storage Helper] 삭제 오류:`, error);
    throw new Error(`이미지 삭제 실패: ${error.message || '알 수 없는 오류'}`);
  }
}

/**
 * Firebase Storage 권한 우회 업로드 함수 (개발 환경용)
 * @param file 업로드할 파일
 * @param path 저장 경로
 * @returns 업로드된 파일의 다운로드 URL
 */
export async function devModeUpload(file: File, path: string): Promise<string> {
  if (!file) {
    throw new Error('업로드할 파일이 없습니다.');
  }
  
  try {
    // 개발 환경용 임시 경로 사용
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9_.]/g, '_');
    const fullPath = `dev/${path}/${timestamp}_${safeFileName}`;
    
    console.log(`[Dev Mode] 이미지 업로드 시작: ${fullPath}`);
    
    // Storage 참조 생성
    const storageRef = ref(storage, fullPath);
    
    // 파일 업로드
    const uploadResult = await uploadBytes(storageRef, file);
    console.log(`[Dev Mode] 업로드 완료`);
    
    // 다운로드 URL 가져오기
    const downloadURL = await getDownloadURL(uploadResult.ref);
    console.log(`[Dev Mode] 다운로드 URL: ${downloadURL}`);
    
    return downloadURL;
  } catch (error: any) {
    console.error(`[Dev Mode] 업로드 오류:`, error);
    throw new Error(`개발 모드 업로드 실패: ${error.message || '알 수 없는 오류'}`);
  }
}
