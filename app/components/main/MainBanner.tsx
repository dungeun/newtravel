'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit, getDocs as getDocsNoQuery } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface Banner {
  id?: string;
  backgroundColor: string;
  imageUrl: string;
  link: string;
  title: string;
  isActive: boolean;
  createdAt?: any;
}

export default function MainBanner() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allBanners, setAllBanners] = useState<Banner[]>([]);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Firestore 연결 확인:', db ? '연결됨' : '연결 안됨');
        
        // 우선 모든 배너 데이터를 가져와서 디버깅용으로 상태에 저장
        const allBannersSnapshot = await getDocsNoQuery(collection(db, 'banners'));
        const allBannersData = allBannersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Banner[];
        
        const activeBanners = allBannersData.filter(b => b.isActive === true);
        setActiveCount(activeBanners.length);
        
        setAllBanners(allBannersData);
        console.log('모든 배너 데이터:', allBannersData);
        console.log('활성화된 배너 수:', activeBanners.length);
        
        // 활성화된 배너만 처리 - where 조건 문제 우회하기
        if (activeBanners.length > 0) {
          // 생성일 기준 정렬
          const sortedActiveBanners = [...activeBanners].sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(0);
            const dateB = b.createdAt?.toDate?.() || new Date(0);
            return dateB.getTime() - dateA.getTime();
          });
          
          console.log('직접 찾은 활성화 배너:', sortedActiveBanners[0]);
          setBanner(sortedActiveBanners[0]);
          return;
        }
        
        // 기존 쿼리 - 문제 찾기용으로만 유지
        try {
          const bannersRef = collection(db, 'banners');
          const q = query(
            bannersRef,
            where('isActive', '==', true),
            orderBy('createdAt', 'desc'),
            limit(1)
          );
          
          console.log('배너 쿼리 실행 중...');
          const querySnapshot = await getDocs(q);
          console.log('쿼리 결과:', querySnapshot.size, '개의 배너 찾음');
          
          if (!querySnapshot.empty) {
            const docId = querySnapshot.docs[0].id;
            const bannerData = querySnapshot.docs[0].data() as Banner;
            console.log('활성화된 배너 데이터(쿼리):', bannerData);
            setBanner({
              id: docId,
              ...bannerData
            });
          } else {
            console.log('활성화된 배너가 없습니다.');
            // 배너가 없으면 기본 배너 사용
            setBanner({
              backgroundColor: '#f3f4f6',
              imageUrl: '',
              link: '',
              title: '배너',
              isActive: true
            });
          }
        } catch (queryError) {
          console.error('배너 쿼리 오류:', queryError);
          setError(`쿼리 오류: ${queryError instanceof Error ? queryError.message : String(queryError)}`);
          
          // 쿼리 실패해도 이미 직접 가져온 배너가 있으면 그것을 표시
          if (activeBanners.length === 0) {
            setBanner({
              backgroundColor: '#f3f4f6',
              imageUrl: '',
              link: '',
              title: '배너',
              isActive: true
            });
          }
        }
        
      } catch (error) {
        console.error('배너 데이터를 불러오는 중 오류가 발생했습니다:', error);
        setError(`오류 발생: ${error instanceof Error ? error.message : String(error)}`);
        // 에러 발생시 기본 배너 사용
        setBanner({
          backgroundColor: '#f3f4f6',
          imageUrl: '',
          link: '',
          title: '배너',
          isActive: true
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, []);

  if (loading) {
    return (
      <div 
        className="w-full h-[200px] bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center"
      >
        <span className="text-gray-400 dark:text-gray-600">배너 로딩 중...</span>
      </div>
    );
  }

  // 디버깅 정보 표시 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development' && (error || allBanners.length === 0)) {
    return (
      <div className="w-full h-[200px] bg-red-50 flex flex-col items-center justify-center p-4 text-sm">
        <h3 className="font-bold text-red-800">배너 문제 발생</h3>
        {error && <p className="text-red-600">{error}</p>}
        <p className="mt-2">
          총 배너 수: {allBanners.length}개 
          {allBanners.length > 0 ? 
            ` (활성화된 배너: ${activeCount}개)` : 
            ' - 배너가 없습니다. 관리자 페이지에서 배너를 추가해주세요.'
          }
        </p>
        {allBanners.length > 0 && (
          <div className="mt-2 text-xs">
            <p>첫 번째 배너 정보:</p>
            <pre className="bg-white p-1 mt-1 max-h-20 overflow-auto">
              {JSON.stringify(allBanners[0], null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  }

  // 모든 배너는 항상 이미지 배너로 표시 (이미지가 없어도 배경색 표시)
  return (
    <div 
      className="w-full h-[200px] relative flex items-center justify-center"
      style={{ backgroundColor: banner?.backgroundColor || '#f3f4f6' }}
    >
      <a 
        href={banner?.link || '#'} 
        className="block w-full h-full"
        title={banner?.title || '배너'}
      >
        <div className="container mx-auto h-full flex items-center justify-center">
          {banner?.imageUrl ? (
            <img 
              src={banner.imageUrl} 
              alt={banner.title || '배너 이미지'} 
              className="max-h-[200px] max-w-full object-contain mx-auto"
            />
          ) : (
            <div className="text-gray-400 text-center">
              <p>관리자 페이지에서 배너 이미지를 업로드해주세요</p>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs mt-1">
                  배너 {allBanners.length > 0 ? `${allBanners.length}개 중 ${activeCount}개 활성화됨` : '없음'}
                </p>
              )}
            </div>
          )}
        </div>
      </a>
    </div>
  );
} 