'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// React-Quill을 클라이언트 사이드에서만 동적으로 로드
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse rounded"></div>,
});

// Quill 에디터에 필요한 스타일 로드
import 'react-quill/dist/quill.snow.css';

interface EditorProps {
  value: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ color: [] }, { background: [] }],
    ['link', 'image'],
    ['clean'],
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'link', 'image',
  'color', 'background',
];

const Editor: React.FC<EditorProps> = ({
  value,
  onChange,
  readOnly = false,
  placeholder = '내용을 입력하세요...'
}) => {
  const [mounted, setMounted] = useState(false);

  // 클라이언트 사이드에서만 렌더링
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-64 w-full bg-gray-100 animate-pulse rounded"></div>;
  }

  return (
    <div className="editor-container">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
        className="min-h-[200px]"
      />
    </div>
  );
};

export default Editor; 