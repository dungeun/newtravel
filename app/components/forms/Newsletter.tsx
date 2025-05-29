'use client';

import { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 여기에 실제 뉴스레터 구독 로직 구현
    if (email) {
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setStatus('error');
    }
  };

  return (
    <section className="bg-blue-600 py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">뉴스레터 구독</h2>
          <p className="mb-8">특별한 프로모션과 새로운 여행 상품 소식을 가장 먼저 받아보세요!</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <input
                type="email"
                placeholder="이메일 주소를 입력하세요"
                className="w-full rounded-lg px-4 py-3 text-gray-900"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-lg bg-yellow-500 px-8 py-3 text-white transition-colors hover:bg-yellow-600"
            >
              <FaPaperPlane />
              구독하기
            </button>
          </form>
          {status === 'success' && <p className="mt-4 text-green-300">구독해 주셔서 감사합니다!</p>}
          {status === 'error' && <p className="mt-4 text-red-300">이메일 주소를 입력해 주세요.</p>}
        </div>
      </div>
    </section>
  );
}
