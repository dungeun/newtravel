'use client';

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface MongoliaSubscriptionBannerProps {
  backgroundColor?: string;
  className?: string;
}

export default function MongoliaSubscriptionBanner({
  backgroundColor = '#5ce1e6',
  className = ''
}: MongoliaSubscriptionBannerProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setMessage('유효한 이메일 주소를 입력해주세요.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setMessage('');
      
      // Firestore에 구독 정보 저장
      await addDoc(collection(db, 'subscriptions'), {
        email,
        createdAt: serverTimestamp(),
        source: 'Mongolia travel banner'
      });
      
      setEmail('');
      setMessage('구독 신청이 완료되었습니다!');
      
    } catch (error) {
      console.error('구독 신청 중 오류가 발생했습니다:', error);
      setMessage('구독 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className={`w-full h-[200px] flex items-center justify-center ${className}`}
      style={{ backgroundColor }}
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-center">
        <div className="w-full max-w-3xl flex flex-col md:flex-row items-center justify-between gap-4 py-4">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-white mb-2">몽골 여행 소식 받기</h3>
            <p className="text-white opacity-90">특별한 프로모션과 여행 팁을 이메일로 받아보세요</p>
          </div>
          
          <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row w-full md:w-auto">
            <div className="flex flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소를 입력하세요"
                className="px-4 py-2 w-full md:w-64 rounded-l outline-none text-gray-700"
                disabled={isSubmitting}
                required
              />
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r transition duration-200 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? '처리 중...' : '구독하기'}
              </button>
            </div>
            
            {message && (
              <p className={`mt-2 md:ml-2 text-sm ${message.includes('오류') ? 'text-red-100' : 'text-white'}`}>
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
} 