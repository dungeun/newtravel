'use client';

import Image from 'next/image';
import { signInWithPopup, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { getUserRole, createUserWithRole } from '@/firebase/auth';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase/config';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';

export default function LoginPage() {
  const router = useRouter();

  const getNextUserId = async () => {
    try {
      if (!db) throw new Error('Firestore 인스턴스가 null입니다.');
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('id', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('No users found, starting with ID 1');
        return 1; // 첫 번째 사용자
      }

      const lastUser = querySnapshot.docs[0].data();
      const nextId = (lastUser.id || 0) + 1;
      console.log('Next user ID will be:', nextId);
      return nextId;
    } catch (error) {
      console.error('Error getting next user ID:', error);
      return 1; // 에러 발생 시 기본값 1
    }
  };

  const saveUserToFirestore = async (user: any) => {
    try {
      if (!db) throw new Error('Firestore 인스턴스가 null입니다.');
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // 새로운 사용자인 경우에만 데이터 저장
        const nextId = await getNextUserId();
        const timestamp = serverTimestamp();

        const userData = {
          id: nextId,
          uid: user.uid,
          email: user.email,
          name: user.displayName || '이름 없음',
          phoneNumber: '',
          photoURL: user.photoURL || '',
          joinDate: timestamp,
          lastLogin: timestamp,
          status: 'active',
          level: 1,
          loginCount: 1,
          createdAt: timestamp,
        };

        console.log('Saving new user with data:', userData);
        await setDoc(userRef, userData);
      } else {
        // 기존 사용자는 마지막 로그인 시간과 로그인 횟수 업데이트
        const userData = userDoc.data();
        await setDoc(
          userRef,
          {
            lastLogin: serverTimestamp(),
            loginCount: (userData?.loginCount || 0) + 1,
          },
          { merge: true }
        );
      }
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const saveLoginHistory = async (user: any) => {
    try {
      if (!db) throw new Error('Firestore 인스턴스가 null입니다.');
      const loginHistoryRef = collection(db, 'loginHistory');
      await setDoc(doc(loginHistoryRef), {
        userId: user.uid,
        email: user.email,
        name: user.displayName || '이름 없음',
        timestamp: serverTimestamp(),
        deviceInfo: {
          userAgent: window.navigator.userAgent,
          platform: window.navigator.platform,
          language: window.navigator.language,
        },
        status: 'success',
      });
    } catch (error) {
      console.error('Error saving login history:', error);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    try {
      if (!auth) throw new Error('Auth 인스턴스가 null입니다.');
      
      let result;
      let user;
      
      if (provider === 'google') {
        const googleProvider = new GoogleAuthProvider();
        result = await signInWithPopup(auth, googleProvider);
        user = result.user;
        console.log('Google 로그인 성공:', user);
      } else if (provider === 'kakao') {
        // 카카오 로그인 처리
        const kakaoProvider = new OAuthProvider('oidc.kakao');
        result = await signInWithPopup(auth, kakaoProvider);
        user = result.user;
        console.log('카카오 로그인 성공:', user);
        
        // 카카오 로그인 정보에서 닉네임 가져오기
        const additionalUserInfo = (result as any).additionalUserInfo;
        const kakaoProfile = additionalUserInfo?.profile;
        const nickname = kakaoProfile?.nickname || kakaoProfile?.properties?.nickname || user.displayName;
        
        // 닉네임이 있는 경우 사용자 정보 업데이트
        if (nickname) {
          await setDoc(doc(db, 'users', user.uid), {
            nickname: nickname,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
        
        // 카카오 로그인 후 추가 정보 입력 필요 확인
        const userDoc = await getDoc(doc(db, 'user_details', user.uid));
        if (!userDoc.exists()) {
          // 추가 정보가 없는 경우 추가 정보 입력 페이지로 이동
          sessionStorage.setItem('redirectAfterLogin', '/profile/complete');
        }
      } else {
        throw new Error('지원되지 않는 로그인 공급자');
      }
      
      // Firestore에 사용자 정보 저장
      await saveUserToFirestore(user);
      console.log('사용자 정보 저장 완료');

      // 로그인 기록 저장
      await saveLoginHistory(user);
      console.log('로그인 기록 저장 완료');

      // 사용자 역할 확인 및 설정
      let userRole = await getUserRole(user);
      if (!userRole) {
        userRole = await createUserWithRole(user);
        console.log('새로운 사용자 역할 생성:', userRole);
      }

      console.log('로그인 완료, 리다이렉트 시작');
      
      // 세션 스토리지에서 리다이렉트 경로 확인
      const redirectPath = typeof window !== 'undefined' ? sessionStorage.getItem('redirectAfterLogin') : null;
      
      if (userRole.role === 'admin') {
        router.push('/admin');
      } else if (redirectPath) {
        // 세션 스토리지에서 리다이렉트 경로 삭제
        sessionStorage.removeItem('redirectAfterLogin');
        console.log('리다이렉트 경로:', redirectPath);
        router.push(redirectPath);
      } else {
        router.push('/');
      }
    } catch (error: any) {
      console.error('로그인 실패:', error);
      // 로그인 실패 기록 저장
      try {
        if (!db) throw new Error('Firestore 인스턴스가 null입니다.');
        const loginHistoryRef = collection(db, 'loginHistory');
        await setDoc(doc(loginHistoryRef), {
          timestamp: serverTimestamp(),
          deviceInfo: {
            userAgent: window.navigator.userAgent,
            platform: window.navigator.platform,
            language: window.navigator.language,
          },
          status: 'failed',
          error: error.message,
        });
      } catch (historyError) {
        console.error('로그인 실패 기록 저장 오류:', historyError);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-white">
      <div className="m-4 w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 shadow-lg">
        {/* 로고 및 타이틀 */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-teal-700">몽골 여행</h1>
          <p className="text-sm text-gray-600">소셜 계정으로 간편하게 로그인하세요</p>
        </div>

        {/* 소셜 로그인 버튼 */}
        <div className="space-y-4">
          <button
            onClick={() => handleSocialLogin('google')}
            className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50"
          >
            <Image src="/icons/google.svg" alt="Google" width={20} height={20} className="mr-3" />
            Google로 로그인
          </button>
          
          <button
            onClick={() => handleSocialLogin('kakao')}
            className="flex w-full items-center justify-center rounded-lg border border-yellow-400 bg-yellow-300 px-6 py-3 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-yellow-400"
          >
            <Image src="/icons/kakao.svg" alt="Kakao" width={20} height={20} className="mr-3" />
            카카오로 로그인
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">로그인하면 이용약관과 개인정보 처리방침에 동의하는 것으로 간주합니다.</p>
        </div>
      </div>
    </div>
  );
}
