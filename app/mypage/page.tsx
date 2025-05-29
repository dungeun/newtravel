'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import OrderList from './OrderList';
import { 
  Loader2, 
  AlertCircle, 
  Heart, 
  User, 
  Calendar, 
  Phone, 
  FileText, 
  HelpCircle, 
  MessageCircle 
} from 'lucide-react';

// 사용자 프로필 인터페이스
interface UserProfile {
  name?: string;
  email?: string;
  image?: string;
}

export default function MyPage() {
  const { user, loading } = useAuth();
  const [activeSection, setActiveSection] = useState('favorites');
  
  // 로딩 상태 처리
  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <span className="ml-2 text-lg">로딩 중...</span>
      </div>
    );
  }

  // 로그인하지 않은 경우
  if (!user) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <div className="flex items-center">
          <AlertCircle className="h-8 w-8 text-yellow-500" />
          <span className="ml-2 text-lg font-medium">로그인이 필요합니다</span>
        </div>
        <p className="mt-2 text-gray-600">마이페이지를 이용하려면 로그인해주세요.</p>
        <Link href="/login" className="mt-4 rounded-md bg-teal-600 px-4 py-2 text-white hover:bg-teal-700">
          로그인하러 가기
        </Link>
      </div>
    );
  }

  // 사용자 프로필 정보
  const userProfile: UserProfile = {
    name: user.name || '사용자',
    email: user.email || '',
    image: user.image || ''
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 사용자 프로필 헤더 */}
      <div className="mb-8 bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-600">
              {userProfile.image ? (
                <img src={userProfile.image} alt="프로필" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <User className="h-10 w-10" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{userProfile.name} 님</h1>
              <p className="text-gray-500">{userProfile.email}</p>
            </div>
          </div>
          <Link href="/mypage/edit" className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors">
            프로필 수정
          </Link>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* 왼쪽 메뉴 - 사이드바 하나만 남기고 너비 확대 */}
        <div className="md:w-1/3">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-6">마이페이지</h2>
            
            <div className="space-y-4">
              <Link href="#"
                className={`flex items-center p-3 rounded-md transition-colors ${activeSection === 'favorites' ? 'bg-teal-50 text-teal-700 font-medium' : 'hover:bg-gray-50'}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection('favorites');
                }}
              >
                <Heart className={`h-5 w-5 mr-3 ${activeSection === 'favorites' ? 'text-teal-600' : 'text-gray-500'}`} />
                <span>좋아요</span>
              </Link>
              
              <Link href="#"
                className={`flex items-center p-3 rounded-md transition-colors ${activeSection === 'orders' ? 'bg-teal-50 text-teal-700 font-medium' : 'hover:bg-gray-50'}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection('orders');
                }}
              >
                <Calendar className={`h-5 w-5 mr-3 ${activeSection === 'orders' ? 'text-teal-600' : 'text-gray-500'}`} />
                <span>예약</span>
              </Link>
              
              <Link href="#"
                className={`flex items-center p-3 rounded-md transition-colors ${activeSection === 'support' ? 'bg-teal-50 text-teal-700 font-medium' : 'hover:bg-gray-50'}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection('support');
                }}
              >
                <Phone className={`h-5 w-5 mr-3 ${activeSection === 'support' ? 'text-teal-600' : 'text-gray-500'}`} />
                <span>고객센터</span>
              </Link>
              
              <Link href="#"
                className={`flex items-center p-3 rounded-md transition-colors ${activeSection === 'bookings' ? 'bg-teal-50 text-teal-700 font-medium' : 'hover:bg-gray-50'}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection('bookings');
                }}
              >
                <FileText className={`h-5 w-5 mr-3 ${activeSection === 'bookings' ? 'text-teal-600' : 'text-gray-500'}`} />
                <span>예약내역</span>
              </Link>
              
              <Link href="#"
                className={`flex items-center p-3 rounded-md transition-colors ${activeSection === 'faq' ? 'bg-teal-50 text-teal-700 font-medium' : 'hover:bg-gray-50'}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection('faq');
                }}
              >
                <HelpCircle className={`h-5 w-5 mr-3 ${activeSection === 'faq' ? 'text-teal-600' : 'text-gray-500'}`} />
                <span>자주하는질문</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* 오른쪽 콘텐츠 */}
        <div className="md:w-2/3">
          {/* 좋아요 섹션 */}
          {activeSection === 'favorites' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">좋아요 목록</h2>
              
              <div className="py-3 text-center">
                <p className="text-gray-600 mb-4">
                  관심 있는 여행 상품을 좋아요 하면 이곳에서 확인할 수 있습니다.
                </p>
                <div className="mt-3">
                  <Link href="/travel/free_travel" className="text-teal-600 hover:text-teal-800">
                    여행 상품 둘러보기
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {/* 예약 섹션 */}
          {activeSection === 'orders' && (
            <OrderList />
          )}
          
          {/* 고객센터 섹션 */}
          {activeSection === 'support' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">고객센터</h2>
              
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium mb-2">문의하기</h3>
                  <p className="text-gray-600 mb-4">여행 상품 또는 예약에 관한 문의를 남겨주세요.</p>
                  <Link href="/support/inquiry" className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors inline-block">
                    1:1 문의하기
                  </Link>
                </div>
                
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium mb-2">연락처</h3>
                  <div className="space-y-2">
                    <p className="flex items-center"><Phone className="h-5 w-5 mr-2" /> 전화: 02-1234-5678</p>
                    <p className="flex items-center"><MessageCircle className="h-5 w-5 mr-2" /> 이메일: support@travel.com</p>
                    <p>운영시간: 평일 09:00 - 18:00 (주말, 공휴일 휴무)</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* 예약내역 섹션 */}
          {activeSection === 'bookings' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">예약내역</h2>
              
              <div className="py-3 text-center">
                <p className="text-gray-600 mb-4">
                  여행 상품을 예약하면 이곳에서 예약 내역을 확인할 수 있습니다.
                </p>
                <div className="mt-3">
                  <Link href="/travel/free_travel" className="text-teal-600 hover:text-teal-800">
                    여행 상품 둘러보기
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {/* 자주하는 질문 섹션 */}
          {activeSection === 'faq' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">자주하는 질문</h2>
              
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium mb-2">예약 관련</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">Q: 예약 취소는 어떻게 하나요?</p>
                      <p className="text-gray-600 mt-1">A: 마이페이지 &gt; 예약내역에서 취소하실 예약을 선택하신 후 취소 버튼을 클릭하시면 됩니다.</p>
                    </div>
                    <div>
                      <p className="font-medium">Q: 예약 변경이 가능한가요?</p>
                      <p className="text-gray-600 mt-1">A: 예약 변경은 기존 예약 취소 후 재예약으로 진행됩니다. 취소 수수료가 발생할 수 있으니 고객센터로 문의해주세요.</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium mb-2">결제 관련</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">Q: 어떤 결제 방식을 지원하나요?</p>
                      <p className="text-gray-600 mt-1">A: 신용카드, 계좌이체, 가상계좌 등 다양한 결제 방식을 지원합니다.</p>
                    </div>
                    <div>
                      <p className="font-medium">Q: 환불은 얼마나 걸리나요?</p>
                      <p className="text-gray-600 mt-1">A: 카드 결제의 경우 취소 후 3-5일, 계좌이체의 경우 5-7일 정도 소요됩니다.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
