import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

// 이미지 업로드 API
export async function POST(req: NextRequest) {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const url = new URL(req.url);
    const productId = url.searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: '상품 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // FormData 파싱
    const formData = await req.formData();
    const images = formData.getAll('images');
    
    if (!images || images.length === 0) {
      return NextResponse.json(
        { success: false, error: '업로드할 이미지가 없습니다.' },
        { status: 400 }
      );
    }
    
    // 최대 5개까지만 업로드 가능
    if (images.length > 5) {
      return NextResponse.json(
        { success: false, error: '최대 5개까지 업로드할 수 있습니다.' },
        { status: 400 }
      );
    }
    
    const uploadPromises = [];
    const imageUrls = [];
    
    // 각 이미지 업로드
    for (const image of images) {
      if (!(image instanceof File)) {
        continue;
      }
      
      // 파일 크기 제한 (5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (image.size > maxSize) {
        return NextResponse.json(
          { success: false, error: `파일 크기는 5MB를 초과할 수 없습니다.` },
          { status: 400 }
        );
      }
      
      // 이미지 파일 타입 확인
      if (!image.type.startsWith('image/')) {
        return NextResponse.json(
          { success: false, error: '이미지 파일만 업로드할 수 있습니다.' },
          { status: 400 }
        );
      }
      
      // 파일 확장자 추출
      const fileExtension = image.name.split('.').pop() || 'jpg';
      
      // 고유한 파일명 생성
      const fileName = `reviews/${productId}/${userId}/${uuidv4()}.${fileExtension}`;
      
      // Firebase Storage에 업로드
      const storageRef = ref(storage, fileName);
      
      const uploadPromise = uploadBytes(storageRef, image)
        .then(() => getDownloadURL(storageRef))
        .then(downloadURL => {
          imageUrls.push(downloadURL);
          return downloadURL;
        });
      
      uploadPromises.push(uploadPromise);
    }
    
    // 모든 업로드 완료 대기
    await Promise.all(uploadPromises);
    
    return NextResponse.json({
      success: true,
      message: '이미지가 성공적으로 업로드되었습니다.',
      imageUrls
    });
  } catch (error: any) {
    console.error('이미지 업로드 오류:', error);
    
    return NextResponse.json(
      { success: false, error: '이미지 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
