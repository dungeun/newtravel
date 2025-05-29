import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { z } from 'zod';
import { auth } from '@/lib/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

// 비밀번호 변경 스키마
const passwordSchema = z.object({
  currentPassword: z.string().min(6, { message: '현재 비밀번호를 입력해주세요.' }),
  newPassword: z.string().min(8, { message: '새 비밀번호는 8자 이상이어야 합니다.' }),
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
    
    const data = await req.json();
    
    // 데이터 유효성 검사
    try {
      passwordSchema.parse(data);
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: '입력 데이터가 유효하지 않습니다.', details: error.errors },
        { status: 400 }
      );
    }
    
    // 현재 로그인된 사용자 가져오기
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: '사용자 인증 정보를 찾을 수 없습니다.' },
        { status: 401 }
      );
    }
    
    // 이메일 확인
    if (!currentUser.email) {
      return NextResponse.json(
        { success: false, error: '사용자 이메일 정보를 찾을 수 없습니다.' },
        { status: 400 }
      );
    }
    
    try {
      // 현재 비밀번호로 재인증
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        data.currentPassword
      );
      
      await reauthenticateWithCredential(currentUser, credential);
      
      // 비밀번호 변경
      await updatePassword(currentUser, data.newPassword);
      
      return NextResponse.json({
        success: true,
        message: '비밀번호가 성공적으로 변경되었습니다.'
      });
    } catch (error: any) {
      console.error('비밀번호 변경 오류:', error);
      
      // Firebase 인증 오류 처리
      if (error.code === 'auth/wrong-password') {
        return NextResponse.json(
          { success: false, error: '현재 비밀번호가 올바르지 않습니다.' },
          { status: 400 }
        );
      } else if (error.code === 'auth/weak-password') {
        return NextResponse.json(
          { success: false, error: '새 비밀번호가 너무 약합니다. 더 강력한 비밀번호를 사용하세요.' },
          { status: 400 }
        );
      } else if (error.code === 'auth/requires-recent-login') {
        return NextResponse.json(
          { success: false, error: '보안을 위해 다시 로그인한 후 시도해주세요.' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: '비밀번호 변경 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('비밀번호 변경 오류:', error);
    
    return NextResponse.json(
      { success: false, error: '비밀번호 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
