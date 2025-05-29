import { promises as fs } from 'fs';
import path from 'path';

// 업로드 디렉토리 구조 정의
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const IMAGE_DIR = path.join(UPLOAD_DIR, 'images');
const THUMBNAIL_DIR = path.join(IMAGE_DIR, 'thumbnails');

// 필요한 카테고리 디렉토리 목록
const CATEGORY_DIRS = [
  'hero-slides',
  'products',
  'banners',
  'misc'
];

/**
 * 업로드에 필요한 모든 디렉토리를 생성합니다.
 * 서버 시작 시 호출되어야 합니다.
 */
export async function ensureUploadDirs() {
  try {
    // 루트 업로드 디렉토리 생성
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    
    // 이미지 및 썸네일 디렉토리 생성
    await fs.mkdir(IMAGE_DIR, { recursive: true });
    await fs.mkdir(THUMBNAIL_DIR, { recursive: true });
    
    // 카테고리별 디렉토리 생성
    for (const category of CATEGORY_DIRS) {
      const categoryDir = path.join(IMAGE_DIR, category);
      await fs.mkdir(categoryDir, { recursive: true });
      
      // 각 카테고리별 썸네일 디렉토리도 생성
      const categoryThumbnailDir = path.join(THUMBNAIL_DIR, category);
      await fs.mkdir(categoryThumbnailDir, { recursive: true });
    }
    
    console.log('[Upload] All upload directories are ready');
  } catch (error) {
    console.error('[Upload] Failed to create upload directories:', error);
    throw error;
  }
}

// 개발 환경에서만 즉시 실행
if (process.env.NODE_ENV === 'development') {
  ensureUploadDirs().catch(console.error);
}
