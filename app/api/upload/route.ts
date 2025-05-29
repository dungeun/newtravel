import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

// 업로드 디렉토리 설정
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const IMAGE_DIR = path.join(UPLOAD_DIR, 'images');
const THUMBNAIL_DIR = path.join(IMAGE_DIR, 'thumbnails');

// 허용된 이미지 타입
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// 디렉토리 생성 함수 (없는 경우에만 생성)
async function ensureDirectoryExists(dirPath: string) {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
    console.log(`[Upload] Created directory: ${dirPath}`);
  }
}

// 썸네일 생성 함수
async function createThumbnail(
  buffer: Buffer, 
  filename: string, 
  category: string,
  width: number = 300
): Promise<string> {
  try {
    // 카테고리별 썸네일 디렉토리 생성
    const categoryThumbnailDir = path.join(THUMBNAIL_DIR, category);
    await ensureDirectoryExists(categoryThumbnailDir);
    
    const thumbnailPath = path.join(categoryThumbnailDir, filename);
    const thumbnailBuffer = await sharp(buffer)
      .resize(width)
      .toBuffer();
    
    await writeFile(thumbnailPath, thumbnailBuffer);
    return `/uploads/images/thumbnails/${category}/${filename}`;
  } catch (error) {
    console.error('썸네일 생성 오류:', error);
    throw new Error('썸네일 생성에 실패했습니다.');
  }
}

// 초기 디렉토리 생성
async function initializeDirectories() {
  try {
    await ensureDirectoryExists(UPLOAD_DIR);
    await ensureDirectoryExists(IMAGE_DIR);
    await ensureDirectoryExists(THUMBNAIL_DIR);
  } catch (error) {
    console.error('디렉토리 초기화 오류:', error);
    throw new Error('파일 시스템 초기화에 실패했습니다.');
  }
}

// 서버 시작 시 디렉토리 초기화
let isInitialized = false;
if (!isInitialized) {
  initializeDirectories().catch(console.error);
  isInitialized = true;
}

export async function POST(request: NextRequest) {
  try {
    // 폼 데이터 파싱
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'misc';
    
    // 파일 유효성 검사
    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다.' },
        { status: 400 }
      );
    }
    
    // 파일 타입 검사
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '지원되지 않는 파일 형식입니다. JPEG, PNG, WebP, GIF만 허용됩니다.' },
        { status: 400 }
      );
    }
    
    // 파일 크기 검사 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: '파일 크기는 10MB를 초과할 수 없습니다.' },
        { status: 400 }
      );
    }
    
    // 파일 이름 생성 (UUID + 원본 확장자)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const originalName = file.name;
    const fileExt = path.extname(originalName);
    const fileName = `${uuidv4()}${fileExt}`;
    
    // 카테고리 디렉토리 생성
    const categoryDir = path.join(IMAGE_DIR, category);
    await ensureDirectoryExists(categoryDir);
    
    // 파일 저장 경로
    const filePath = path.join(categoryDir, fileName);
    let thumbnailUrl = '';
    
    try {
      // 파일 저장
      await writeFile(filePath, buffer);
      console.log(`[Upload] File saved: ${filePath}`);
      
      // 썸네일 생성
      thumbnailUrl = await createThumbnail(buffer, fileName, category);
      console.log(`[Upload] Thumbnail created: ${thumbnailUrl}`);
    } catch (error) {
      console.error('파일 저장 오류:', error);
      throw new Error('파일 저장 중 오류가 발생했습니다.');
    }
    
    // 응답
    return NextResponse.json({
      success: true,
      url: `/uploads/images/${category}/${fileName}`,
      thumbnailUrl,
      fileName,
      originalName,
      size: file.size,
      type: file.type
    });
  } catch (error: any) {
    console.error('이미지 업로드 오류:', error);
    return NextResponse.json(
      { error: `이미지 업로드 중 오류가 발생했습니다: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    
    if (!filePath) {
      return NextResponse.json(
        { error: '삭제할 파일 경로가 지정되지 않았습니다.' },
        { status: 400 }
      );
    }
    
    // 파일 경로 정규화 및 검증
    const normalizedPath = path.normalize(filePath).replace(/^\/+/, '');
    
    // 보안: public/uploads 디렉토리 외부의 파일에 접근하지 못하도록 함
    if (!normalizedPath.startsWith('uploads/images/')) {
      return NextResponse.json(
        { error: '허용되지 않은 파일 경로입니다.' },
        { status: 403 }
      );
    }
    
    const fullPath = path.join(process.cwd(), 'public', normalizedPath);
    
    // 파일 삭제
    const fs = require('fs');
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      
      // 썸네일도 삭제 시도
      const fileName = path.basename(fullPath);
      const thumbnailPath = path.join(process.cwd(), 'public', 'uploads', 'images', 'thumbnails', fileName);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
      
      return NextResponse.json({ success: true, message: '파일이 삭제되었습니다.' });
    } else {
      return NextResponse.json(
        { error: '파일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('파일 삭제 오류:', error);
    return NextResponse.json(
      { error: `파일 삭제 중 오류가 발생했습니다: ${error.message}` },
      { status: 500 }
    );
  }
}
