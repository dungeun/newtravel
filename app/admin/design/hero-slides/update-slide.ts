import { db, storage } from '@/firebase/config';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function updateHeroSlide(slideId: string, slideData: any, imageFile?: File) {
  try {
    // Get the current slide data
    const slideRef = doc(db, 'heroSlides', slideId);
    const slideDoc = await getDoc(slideRef);
    
    if (!slideDoc.exists()) {
      throw new Error('슬라이드를 찾을 수 없습니다.');
    }
    
    // Prepare the update data
    const updateData: any = {
      title: slideData.title,
      description: slideData.description,
      buttonText: slideData.buttonText || '자세히 보기',
      buttonUrl: slideData.buttonUrl || '#',
      isActive: slideData.isActive
    };
    
    // If there's a new image, upload it
    if (imageFile) {
      const storageRef = ref(storage, `hero-slides/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      updateData.imageUrl = await getDownloadURL(storageRef);
    }
    
    // Update the slide
    await updateDoc(slideRef, updateData);
    
    return { 
      success: true, 
      message: '슬라이드가 성공적으로 업데이트되었습니다.',
      slideId,
      ...(updateData.imageUrl && { imageUrl: updateData.imageUrl })
    };
  } catch (error) {
    console.error('슬라이드 업데이트 중 오류 발생:', error);
    return { 
      success: false, 
      message: `슬라이드 업데이트 실패: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
} 