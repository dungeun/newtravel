'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import Link from 'next/link';
import { UserCircleIcon, PencilSquareIcon, ShieldCheckIcon, CalendarIcon, HeartIcon } from '@heroicons/react/24/outline';
import { Avatar } from '@/components/ui/avatar';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  nickname?: string;
  role?: string;
  createdAt?: string;
}

interface UserDetails {
  name: string;
  phone: string;
  address: string;
  addressDetail: string;
  postalCode: string;
  birthdate: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 기본 사용자 프로필 정보 설정
        const profile: UserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        };

        try {
          // 사용자 역할 및 닉네임 정보 가져오기
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            profile.nickname = userData.nickname;
            profile.role = userData.role;
            profile.createdAt = userData.createdAt || userData.updatedAt;
          }

          // 사용자 상세 정보 가져오기
          const detailsDoc = await getDoc(doc(db, 'user_details', user.uid));
          if (detailsDoc.exists()) {
            setUserDetails(detailsDoc.data() as UserDetails);
          }

          setUserProfile(profile);
        } catch (error) {
          console.error('사용자 정보 로드 오류:', error);
        }
        
        setLoading(false);
      } else {
        // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // 사용자 이름 표시 (닉네임 > 표시 이름 > 이메일 > 기본값)
  const displayName = userProfile?.nickname || userProfile?.displayName || userProfile?.email?.split('@')[0] || '사용자';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow overflow-hidden rounded-lg">
          {/* 프로필 헤더 */}
          <div className="px-4 py-5 sm:px-6 bg-teal-50">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-teal-100 flex items-center justify-center">
                  {userProfile?.photoURL ? (
                    <Avatar className="h-24 w-24">
                      <img src={userProfile.photoURL} alt={displayName} className="h-full w-full object-cover" />
                    </Avatar>
                  ) : (
                    <UserCircleIcon className="h-16 w-16 text-teal-500" />
                  )}
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
                <p className="text-sm text-gray-500">{userProfile?.email}</p>
                {userProfile?.role && (
                  <div className="mt-1 flex items-center">
                    <ShieldCheckIcon className="h-4 w-4 text-teal-500 mr-1" />
                    <span className="text-xs font-medium text-teal-700">
                      {userProfile.role === 'admin' ? '관리자' : '일반 회원'}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-auto">
                <Link
                  href="/profile/complete"
                  className="inline-flex items-center px-4 py-2 border border-teal-300 text-sm font-medium rounded-md text-teal-700 bg-white hover:bg-teal-50"
                >
                  <PencilSquareIcon className="h-4 w-4 mr-2" />
                  정보 수정
                </Link>
              </div>
            </div>
          </div>

          {/* 프로필 정보 */}
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {userDetails ? (
                <>
                  <div className="col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">기본 정보</h3>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">이름</h4>
                    <p className="mt-1 text-sm text-gray-900">{userDetails.name}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">생년월일</h4>
                    <p className="mt-1 text-sm text-gray-900">{userDetails.birthdate}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">전화번호</h4>
                    <p className="mt-1 text-sm text-gray-900">{userDetails.phone}</p>
                  </div>
                  
                  <div className="col-span-2">
                    <h4 className="text-sm font-medium text-gray-500">주소</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      [{userDetails.postalCode}] {userDetails.address} {userDetails.addressDetail}
                    </p>
                  </div>
                </>
              ) : (
                <div className="col-span-2 text-center py-8">
                  <p className="text-gray-500 mb-4">추가 정보가 없습니다.</p>
                  <Link
                    href="/profile/complete"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
                  >
                    추가 정보 입력하기
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* 계정 정보 */}
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-4">계정 정보</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <h4 className="text-sm font-medium text-gray-500">가입일</h4>
                </div>
                <p className="mt-1 text-sm text-gray-900">
                  {userProfile?.createdAt 
                    ? new Date(userProfile.createdAt).toLocaleDateString('ko-KR')
                    : '정보 없음'}
                </p>
              </div>
              
              <div>
                <div className="flex items-center">
                  <HeartIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <h4 className="text-sm font-medium text-gray-500">찜한 상품</h4>
                </div>
                <p className="mt-1 text-sm text-gray-900">
                  <Link href="/profile/likes" className="text-teal-600 hover:text-teal-800">
                    찜 목록 보기
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
