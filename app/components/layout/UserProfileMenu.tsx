'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { auth, db } from '@/firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Avatar } from '@/components/ui/avatar';

interface UserInfo {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  nickname?: string;
}

export default function UserProfileMenu() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // 기본 사용자 정보 설정
        const userInfo: UserInfo = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        };

        try {
          // Firestore에서 추가 정보 가져오기 (닉네임 등)
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userInfo.nickname = userData.nickname;
          }
        } catch (error) {
          console.error('사용자 추가 정보 로드 오류:', error);
        }

        setUser(userInfo);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsOpen(false);
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // 사용자 이름 표시 (닉네임 > 표시 이름 > 이메일 > 기본값)
  const displayName = user?.nickname || user?.displayName || user?.email?.split('@')[0] || '사용자';

  if (loading) {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
    );
  }

  if (!user) {
    return (
      <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-teal-600">
        로그인
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-2 focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-teal-100 text-teal-800 overflow-hidden">
          {user.photoURL ? (
            <Avatar>
              <img src={user.photoURL} alt={displayName} className="h-full w-full object-cover" />
            </Avatar>
          ) : (
            <span className="text-sm font-medium">{displayName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <span className="text-sm font-medium hidden md:block">{displayName}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Link
            href="/mypage"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            <UserCircleIcon className="mr-2 h-4 w-4" />
            마이페이지
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
