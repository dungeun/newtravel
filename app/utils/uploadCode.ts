import { storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface CodeFile {
  name: string;
  content: string;
  language: string;
  createdAt: Date;
}

export const uploadCode = async (code: CodeFile) => {
  try {
    // 파일 이름 생성 (타임스탬프 추가하여 고유성 보장)
    const timestamp = new Date().getTime();
    const fileName = `${code.name}_${timestamp}.${code.language}`;

    // Storage 참조 생성
    const storageRef = ref(storage, `codes/${fileName}`);

    // 코드 내용을 Blob으로 변환
    const blob = new Blob([code.content], { type: 'text/plain' });

    // 파일 업로드
    const snapshot = await uploadBytes(storageRef, blob);

    // 다운로드 URL 가져오기
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      fileName,
      downloadURL,
      uploadTime: new Date(),
      success: true,
    };
  } catch (error) {
    console.error('코드 업로드 중 오류 발생:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
};
