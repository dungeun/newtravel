import { db } from '@/firebase/config';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

interface HeroSlide {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  order: number;
  isActive: boolean;
  createdAt?: any;
}

// 히어로 슬라이드 문제 해결 유틸리티 함수
export async function fixHeroSlides() {
  try {
    console.log('히어로 슬라이드 수정 시작...');
    
    // 모든 슬라이드 가져오기
    const slidesCollection = collection(db, 'heroSlides');
    const slidesSnapshot = await getDocs(slidesCollection);
    
    if (slidesSnapshot.empty) {
      console.log('수정할 슬라이드가 없습니다.');
      return { success: false, message: '수정할 슬라이드가 없습니다.' };
    }
    
    const slides = slidesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as HeroSlide[];
    
    console.log(`총 ${slides.length}개의 슬라이드 발견.`);
    
    // 1. 모든 슬라이드 활성화
    let activatedCount = 0;
    for (const slide of slides) {
      if (!slide.isActive) {
        await updateDoc(doc(db, 'heroSlides', slide.id), { isActive: true });
        activatedCount++;
      }
    }
    
    // 2. 슬라이드 순서 재설정 (0부터 시작)
    const sortedSlides = [...slides].sort((a, b) => {
      // 순서 정보가 없는 경우 기본 순서 부여
      const orderA = typeof a.order === 'number' ? a.order : 999;
      const orderB = typeof b.order === 'number' ? b.order : 999;
      return orderA - orderB;
    });
    
    let reorderedCount = 0;
    for (let i = 0; i < sortedSlides.length; i++) {
      const slide = sortedSlides[i];
      if (slide.order !== i) {
        await updateDoc(doc(db, 'heroSlides', slide.id), { order: i });
        reorderedCount++;
      }
    }
    
    console.log(`수정 완료: ${activatedCount}개 활성화, ${reorderedCount}개 재정렬.`);
    
    return { 
      success: true, 
      message: `${slides.length}개의 슬라이드를 수정했습니다: ${activatedCount}개 활성화, ${reorderedCount}개 재정렬.`,
      fixed: { total: slides.length, activated: activatedCount, reordered: reorderedCount }
    };
    
  } catch (error) {
    console.error('히어로 슬라이드 수정 중 오류 발생:', error);
    return { 
      success: false, 
      message: `오류 발생: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
} 