'use client';

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

interface UserDetails {
  name: string;
  phone: string;
  address: string;
  addressDetail: string;
  postalCode: string;
  birthdate: string;
}

declare global {
  interface Window {
    daum: any;
  }
}

export default function CompleteProfile() {
  const scriptLoaded = useRef(false);
  const router = useRouter();
  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: '',
    phone: '',
    address: '',
    addressDetail: '',
    postalCode: '',
    birthdate: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        
        // 기존 정보가 있는지 확인
        try {
          // 카카오 닉네임 가져오기
          const userInfoDoc = await getDoc(doc(db, 'users', user.uid));
          const nickname = userInfoDoc.exists() ? userInfoDoc.data().nickname : user.displayName;
          
          const userDoc = await getDoc(doc(db, 'user_details', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserDetails;
            setUserDetails(userData);
          } else {
            // 카카오 닉네임을 이름으로 사용
            setUserDetails(prev => ({ ...prev, name: nickname || '' }));
          }
        } catch (err) {
          console.error('사용자 정보 조회 오류:', err);
        }
        
        setLoading(false);
      } else {
        // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({ ...prev, [name]: value }));
  };

  const openPostalCodeSearch = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data: any) => {
        // 선택한 주소 데이터를 폼에 반영
        setUserDetails(prev => ({
          ...prev,
          postalCode: data.zonecode,
          address: data.roadAddress || data.jibunAddress,
        }));
      }
    }).open();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      setError('로그인이 필요합니다.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Firestore에 사용자 상세 정보 저장
      await setDoc(doc(db, 'user_details', userId), {
        ...userDetails,
        updatedAt: new Date().toISOString()
      });
      
      // 메인 페이지 또는 이전 페이지로 리다이렉트
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath && redirectPath !== '/profile/complete') {
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(redirectPath);
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error('정보 저장 오류:', err);
      setError('정보를 저장하는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="lazyOnload"
        onLoad={() => {
          scriptLoaded.current = true;
        }}
      />
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            추가 정보 입력
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            여행 서비스 이용을 위해 추가 정보를 입력해주세요.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={userDetails.name}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder="이름을 입력하세요"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                전화번호
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={userDetails.phone}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder="전화번호를 입력하세요 (예: 010-1234-5678)"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                우편번호
              </label>
              <div className="flex">
                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  required
                  readOnly
                  value={userDetails.postalCode}
                  className="appearance-none rounded-l-md relative block w-1/3 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                  placeholder="우편번호"
                />
                <button
                  type="button"
                  onClick={openPostalCodeSearch}
                  className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-r-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                >
                  주소 검색
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                주소
              </label>
              <input
                id="address"
                name="address"
                type="text"
                required
                readOnly
                value={userDetails.address}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder="주소"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="addressDetail" className="block text-sm font-medium text-gray-700 mb-1">
                상세 주소
              </label>
              <input
                id="addressDetail"
                name="addressDetail"
                type="text"
                required
                value={userDetails.addressDetail}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder="상세 주소를 입력하세요"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-1">
                생년월일
              </label>
              <input
                id="birthdate"
                name="birthdate"
                type="date"
                required
                value={userDetails.birthdate}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              {loading ? '처리 중...' : '정보 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
