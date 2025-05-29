'use client';

/**
 * 로컬 서버 이미지 업로드 유틸리티
 * 파이어베이스 대신 자체 서버에 이미지를 저장하기 위한 함수들
 */

/**
 * 이미지 파일을 로컬 서버에 업로드
 * @param file 업로드할 파일
 * @param category 이미지 카테고리 (logos, hero-slides, banners, products 등)
 * @returns 업로드된 이미지 정보 (URL, 썸네일 URL 등)
 */
export async function uploadImage(file: File, category: string = 'misc') {
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
    console.log(`[Local Upload] 이미지 업로드 시작: ${category}/${file.name}`);
    
    // FormData 생성
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    
    // API 요청
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '업로드 중 오류가 발생했습니다.');
    }
    
    const data = await response.json();
    console.log(`[Local Upload] 업로드 완료:`, data);
    
    return {
      url: data.url,
      thumbnailUrl: data.thumbnailUrl,
      fileName: data.fileName,
      originalName: data.originalName,
      size: data.size,
      type: data.type
    };
  } catch (error: any) {
    console.error(`[Local Upload] 업로드 오류:`, error);
    throw new Error(`이미지 업로드 실패: ${error.message || '알 수 없는 오류'}`);
  }
}

/**
 * 서버에서 이미지 삭제
 * @param imagePath 삭제할 이미지 경로 (URL 또는 경로)
 */
export async function deleteImage(imagePath: string): Promise<void> {
  if (!imagePath) {
    throw new Error('삭제할 이미지 경로가 없습니다.');
  }
  
  try {
    console.log(`[Local Upload] 이미지 삭제 시작: ${imagePath}`);
    
    // URL에서 경로 추출
    const path = imagePath.startsWith('http')
      ? new URL(imagePath).pathname
      : imagePath;
    
    // API 요청
    const response = await fetch(`/api/upload?path=${encodeURIComponent(path)}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '이미지 삭제 중 오류가 발생했습니다.');
    }
    
    const data = await response.json();
    console.log(`[Local Upload] 삭제 완료:`, data);
  } catch (error: any) {
    console.error(`[Local Upload] 삭제 오류:`, error);
    throw new Error(`이미지 삭제 실패: ${error.message || '알 수 없는 오류'}`);
  }
}

/**
 * 이미지 URL이 로컬 서버 URL인지 확인
 * @param url 확인할 URL
 * @returns 로컬 서버 URL이면 true, 아니면 false
 */
export function isLocalImageUrl(url: string): boolean {
  if (!url) return false;
  
  // 로컬 서버 이미지 URL 패턴 확인
  return url.includes('/uploads/images/') || url.startsWith('/uploads/');
}

/**
 * 이미지 URL에서 썸네일 URL 생성
 * @param imageUrl 원본 이미지 URL
 * @returns 썸네일 URL
 */
export function getThumbnailUrl(imageUrl: string): string {
  if (!imageUrl) return '';
  
  // 이미 썸네일 URL이면 그대로 반환
  if (imageUrl.includes('/thumbnails/')) {
    return imageUrl;
  }
  
  // 로컬 서버 이미지가 아니면 원본 반환
  if (!isLocalImageUrl(imageUrl)) {
    return imageUrl;
  }
  
  // 원본 URL에서 파일명 추출
  const parts = imageUrl.split('/');
  const fileName = parts[parts.length - 1];
  
  // 썸네일 URL 생성
  return `/uploads/images/thumbnails/${fileName}`;
}
