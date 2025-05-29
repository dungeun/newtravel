'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { isFileSizeExceeded } from '@/lib/utils';
import { resizeImage } from '@/lib/imageUtils';

interface ImageUploaderProps {
  onImagesChange: (files: File[]) => void;
  initialImages?: File[];
}

export default function ImageUploader({ onImagesChange, initialImages = [] }: ImageUploaderProps) {
  const [images, setImages] = useState<File[]>(initialImages);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
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
      
      // 이미지 리사이징 처리
      const processedFiles = await Promise.all(
        validFiles.map(async (file) => {
          if (file.size > 1024 * 1024) { // 1MB 이상인 경우에만 리사이징
            try {
              const resizedFile = await resizeImage(file, 1200, 1200);
              return new File([resizedFile], file.name, { type: resizedFile.type });
            } catch (error) {
              console.error('이미지 리사이징 오류:', error);
              return file;
            }
          }
          return file;
        })
      );
      
      const newImages = [...images, ...processedFiles];
      setImages(newImages);
      onImagesChange(newImages);
    },
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp', '.gif'] },
    multiple: true
  });

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    onImagesChange(newImages);
  };

  return (
    <div className="mt-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer text-center
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <ImageIcon className="h-12 w-12 text-gray-400" />
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
      
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={URL.createObjectURL(image)}
                alt={`상품 이미지 ${index + 1}`}
                className="w-full h-32 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
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
