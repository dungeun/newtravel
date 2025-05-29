'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { isFileSizeExceeded } from '@/lib/utils';

interface ScheduleDropzoneProps {
  index: number;
  onDrop: (files: File[]) => void;
  files: File[];
  removeScheduleImage: (scheduleIndex: number, imageIndex: number) => void;
}

export default function ScheduleDropzone({ index, onDrop, files, removeScheduleImage }: ScheduleDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => {
      // 이미지 크기 검증 (10MB 이하만 허용)
      const validFiles = acceptedFiles.filter(file => {
        if (isFileSizeExceeded(file, 10)) {
          toast({
            title: '파일 크기 초과',
            description: `${file.name}의 크기가 10MB를 초과합니다. 자동으로 리사이징됩니다.`,
          });
        }
        return true; // 모든 파일 허용 (리사이징으로 처리)
      });
      
      onDrop(validFiles);
    },
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp', '.gif'] },
    multiple: true,
    maxFiles: 3
  });
  
  return (
    <div className="mt-4">
      <div 
        {...getRootProps()} 
        className={`mt-2 border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer text-center
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <ImageIcon className="h-8 w-8 text-gray-400" />
          {isDragActive ? (
            <p className="text-sm text-primary font-medium">이미지를 여기에 놓으세요...</p>
          ) : (
            <>
              <p className="text-sm font-medium">이미지를 이 영역에 드래그하세요</p>
              <p className="text-xs text-gray-500">또는 클릭하여 파일을 선택하세요</p>
            </>
          )}
        </div>
      </div>
      
      {files && files.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {files.map((image: File, imageIndex: number) => (
            <div key={imageIndex} className="relative group">
              <img
                src={URL.createObjectURL(image)}
                alt={`일정 이미지 ${imageIndex + 1}`}
                className="w-full h-24 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => removeScheduleImage(index, imageIndex)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
