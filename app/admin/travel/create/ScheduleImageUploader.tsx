import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { resizeImage, formatFileSize, isFileSizeExceeded } from '@/utils/imageUtils';
import { Label } from '@/components/ui/label';
import dynamic from 'next/dynamic';

// 이미지 아이콘 동적 임포트
const ImageIcon = dynamic(() => import('lucide-react').then(mod => mod.Image), { ssr: false });

const MAX_FILE_SIZE_MB = 5;
const MAX_FILES = 3;

export default function ScheduleImageUploader({ index, onImagesChange, initialImages = [] }) {
  const [images, setImages] = useState(initialImages || []);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles) => {
    // 최대 파일 개수 체크
    if (images.length + acceptedFiles.length > MAX_FILES) {
      toast({
        title: '최대 파일 개수 초과',
        description: `일정 이미지는 최대 ${MAX_FILES}개까지 업로드할 수 있습니다.`,
        variant: 'destructive',
      });
      return;
    }

    // 파일 크기 체크 및 리사이징
    try {
      const processedFiles = [];
      
      for (const file of acceptedFiles) {
        // 파일 크기 체크
        if (isFileSizeExceeded(file, MAX_FILE_SIZE_MB)) {
          toast({
            title: '이미지 리사이징',
            description: `${file.name}의 크기가 ${MAX_FILE_SIZE_MB}MB를 초과하여 자동으로 리사이징됩니다.`,
          });
        }
        
        // 이미지 리사이징 (일정 이미지는 더 작게 리사이징)
        const resizedBlob = await resizeImage(file, 800, 800, 0.8);
        
        // 리사이징된 Blob을 File 객체로 변환
        const resizedFile = new File(
          [resizedBlob], 
          file.name, 
          { type: file.type }
        );
        
        // 리사이징 결과 로그
        console.log(`일정 이미지 원본 크기: ${formatFileSize(file.size)}, 리사이징 후: ${formatFileSize(resizedFile.size)}`);
        
        processedFiles.push(resizedFile);
      }
      
      // 상태 업데이트
      const newImages = [...images, ...processedFiles];
      setImages(newImages);
      
      // 부모 컴포넌트에 변경사항 전달
      onImagesChange(index, newImages);
    } catch (error) {
      console.error('이미지 처리 중 오류:', error);
      toast({
        title: '이미지 처리 오류',
        description: '이미지를 처리하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  }, [images, index, toast, onImagesChange]);

  const removeImage = (imageIndex) => {
    const newImages = [...images];
    newImages.splice(imageIndex, 1);
    setImages(newImages);
    onImagesChange(index, newImages);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp', '.gif'] },
    multiple: true,
    maxFiles: MAX_FILES
  });

  return (
    <div>
      <Label>일정 이미지 (최대 {MAX_FILES}장)</Label>
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
              <p className="text-xs text-gray-500">최대 {MAX_FILES}개, 파일당 {MAX_FILE_SIZE_MB}MB 이하</p>
            </>
          )}
        </div>
      </div>
      
      {images.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {images.map((image, imageIndex) => (
            <div key={imageIndex} className="relative group">
              <img
                src={URL.createObjectURL(image)}
                alt={`일정 이미지 ${imageIndex + 1}`}
                className="w-full h-24 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(imageIndex)}
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
