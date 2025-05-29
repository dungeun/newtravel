'use client';

import { storage } from '@/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Firebase Storage 디버깅 함수
export async function testStorageUpload() {
  console.log('=== Firebase Storage 테스트 시작 ===');
  
  try {
    // 1. Storage 객체 확인
    console.log('Storage 객체 확인:', storage);
    console.log('Storage ref 함수 확인:', typeof storage.ref === 'function' ? '정상' : '비정상');
    
    // 2. 테스트 파일 생성 (1x1 투명 PNG)
    const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const byteString = window.atob(base64Data);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    
    const testFile = new File([int8Array], 'test-image.png', { type: 'image/png' });
    console.log('테스트 파일 생성 완료:', testFile);
    
    // 3. 참조 생성
    const timestamp = Date.now();
    const testRef = ref(storage, `test/test-${timestamp}.png`);
    console.log('Storage 참조 생성 완료:', testRef);
    
    // 4. 업로드 시도
    console.log('파일 업로드 시작...');
    const uploadResult = await uploadBytes(testRef, testFile);
    console.log('파일 업로드 완료:', uploadResult);
    
    // 5. URL 가져오기
    console.log('다운로드 URL 가져오기 시작...');
    const downloadURL = await getDownloadURL(testRef);
    console.log('다운로드 URL 가져오기 완료:', downloadURL);
    
    return {
      success: true,
      url: downloadURL,
      message: '테스트 업로드 성공'
    };
  } catch (error: any) {
    console.error('Storage 테스트 실패:', error);
    return {
      success: false,
      error: error.message || '알 수 없는 오류',
      code: error.code || 'unknown',
      stack: error.stack
    };
  } finally {
    console.log('=== Firebase Storage 테스트 종료 ===');
  }
}

// Firebase Storage 구성 정보 확인
export function checkStorageConfig() {
  return {
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '설정 없음',
    hasStorage: !!storage,
    hasRefMethod: storage && typeof storage.ref === 'function',
    environment: process.env.NODE_ENV
  };
}
