'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import BoardLayout from '@/components/layout/BoardLayout';
import Link from 'next/link';

// React Quill을 클라이언트 사이드에서만 로드하도록 설정
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>로딩중...</p>,
});

import 'react-quill/dist/quill.snow.css';

export default function WritePage({ params }: { params: { boardUrl: string } }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 게시글 저장 로직 구현
    console.log({ title, content });
  };

  // Quill 에디터 설정
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  return (
    <BoardLayout boardName="글쓰기">
      <div className="bg-white shadow sm:rounded-lg">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {/* 제목 입력 */}
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* 에디터 */}
            <div className="mt-4">
              <ReactQuill
                value={content}
                onChange={setContent}
                modules={modules}
                className="mb-12 h-[500px]"
                theme="snow"
              />
            </div>

            {/* 버튼 영역 */}
            <div className="mt-16 flex justify-end space-x-2">
              <Link
                href={`/boards/${params.boardUrl}`}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                취소
              </Link>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                등록
              </button>
            </div>
          </div>
        </form>
      </div>
    </BoardLayout>
  );
}
