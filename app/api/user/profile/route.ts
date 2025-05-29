import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { z } from 'zod';

// 프로필 업데이트 스키마
const profileSchema = z.object({
  name: z.string().min(2, { message: '이름은 2글자 이상이어야 합니다.' }),
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().max(500, { message: '자기소개는 500자 이내로 작성해주세요.' }).optional(),
});

export async function PUT(req: NextRequest) {
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
    const data = await req.json();
    
    // 데이터 유효성 검사
    try {
      profileSchema.parse(data);
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: '입력 데이터가 유효하지 않습니다.', details: error.errors },
        { status: 400 }
      );
    }
    
    // 사용자 문서 참조
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 프로필 업데이트
    const updateData = {
      displayName: data.name,
      phoneNumber: data.phone || null,
      address: data.address || null,
      bio: data.bio || null,
      updatedAt: new Date()
    };
    
    await updateDoc(userRef, updateData);
    
    return NextResponse.json({
      success: true,
      message: '프로필이 성공적으로 업데이트되었습니다.'
    });
  } catch (error: any) {
    console.error('프로필 업데이트 오류:', error);
    
    return NextResponse.json(
      { success: false, error: '프로필 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
