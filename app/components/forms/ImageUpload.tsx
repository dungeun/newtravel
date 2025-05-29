'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  currentImageUrl?: string;
  label: string;
  accept?: string;
  maxSize?: number; // MB 단위
}

export default function ImageUpload({
  onImageUpload,
  currentImageUrl,
  label,
  accept = 'image/*',
  maxSize = 5, // 기본 5MB
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(currentImageUrl || '');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 검사
    if (file.size > maxSize * 1024 * 1024) {
      setError(`파일 크기는 ${maxSize}MB 이하여야 합니다.`);
      return;
    }

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 부모 컴포넌트에 파일 전달
    onImageUpload(file);
    setError('');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > maxSize * 1024 * 1024) {
      setError(`파일 크기는 ${maxSize}MB 이하여야 합니다.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onImageUpload(file);
    setError('');
  };

  const handleRemove = () => {
    setPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div
        className={`relative rounded-lg border-2 border-dashed p-4 ${
          preview ? 'border-gray-300' : 'border-gray-400'
        } transition-colors duration-150 ease-in-out hover:border-gray-500`}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative">
            <Image
              src={preview}
              alt="Preview"
              width={200}
              height={200}
              className="mx-auto object-contain"
            />
            <button
              onClick={handleRemove}
              className="absolute right-0 top-0 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
            >
              <XMarkIcon className="size-4" />
            </button>
          </div>
        ) : (
          <div className="p-6 text-center">
            <ArrowUpTrayIcon className="mx-auto size-12 text-gray-400" />
            <div className="mt-4 flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500"
              >
                <span>파일 업로드</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept={accept}
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </label>
              <p className="pl-1">또는 드래그 앤 드롭</p>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {`${accept.replace('image/', '')} 파일 ${maxSize}MB 이하`}
            </p>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
