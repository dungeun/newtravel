/**
 * 이미지 리사이징 및 처리를 위한 유틸리티 함수
 */

/**
 * 이미지 파일을 리사이징하여 Blob 객체로 반환합니다.
 * @param file 원본 이미지 파일
 * @param maxWidth 최대 너비 (기본값: 1200px)
 * @param maxHeight 최대 높이 (기본값: 1200px)
 * @param quality 이미지 품질 (0-1, 기본값: 0.8)
 * @returns Promise<Blob> 리사이징된 이미지 Blob
 */
export const resizeImage = async (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // 이미지 로드를 위한 URL 생성
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      // 원본 이미지 크기
      const originalWidth = img.width;
      const originalHeight = img.height;
      
      // 리사이징이 필요한지 확인
      if (originalWidth <= maxWidth && originalHeight <= maxHeight && file.size <= 1024 * 1024) {
        // 리사이징이 필요 없으면 원본 파일 반환
        URL.revokeObjectURL(img.src); // 메모리 해제
        resolve(file);
        return;
      }
      
      // 비율 계산
      let width = originalWidth;
      let height = originalHeight;
      
      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
      }
      
      if (height > maxHeight) {
        const ratio = maxHeight / height;
        height = maxHeight;
        width = width * ratio;
      }
      
      // 캔버스 생성 및 이미지 그리기
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(img.src);
        reject(new Error('Canvas 2D context를 생성할 수 없습니다.'));
        return;
      }
      
      // 이미지 그리기
      ctx.drawImage(img, 0, 0, width, height);
      
      // 메모리 해제
      URL.revokeObjectURL(img.src);
      
      // 캔버스를 Blob으로 변환
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('이미지 변환 중 오류가 발생했습니다.'));
          }
        },
        file.type,
        quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('이미지 로드 중 오류가 발생했습니다.'));
    };
  });
};

/**
 * 파일 크기를 사람이 읽기 쉬운 형태로 변환합니다.
 * @param bytes 파일 크기 (바이트)
 * @returns 읽기 쉬운 형태의 파일 크기 문자열
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 이미지 파일의 크기가 지정된 크기보다 큰지 확인합니다.
 * @param file 이미지 파일
 * @param maxSizeInMB 최대 크기 (MB)
 * @returns 크기가 초과되었는지 여부
 */
export const isFileSizeExceeded = (file: File, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size > maxSizeInBytes;
};
