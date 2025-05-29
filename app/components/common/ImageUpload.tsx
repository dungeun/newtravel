'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { Trash } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  onImageRemove?: () => void;
  currentImageUrl?: string;
  label?: string;
  height?: number;
  width?: number;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  onImageRemove,
  currentImageUrl,
  label = '이미지 업로드',
  height = 200,
  width = 200,
  className = '',
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    // 이미지 타입 확인
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 미리보기 URL 생성
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 상위 컴포넌트로 파일 전달
    onImageUpload(file);
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageRemove) {
      onImageRemove();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div
        className={`relative flex items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
        }`}
        style={{ height: `${height}px`, width: `${width}px` }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {previewUrl ? (
          <div className="relative h-full w-full">
            <Image
              src={previewUrl}
              alt="업로드 이미지"
              fill
              className="rounded-md object-contain"
              sizes={`${Math.max(width, height)}px`}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white shadow-md hover:bg-red-600"
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <svg
              className="mb-2 h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-gray-600">
              드래그 앤 드롭 또는 <span className="font-medium text-blue-600">찾아보기</span>
            </p>
            <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF (최대 10MB)</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload; 