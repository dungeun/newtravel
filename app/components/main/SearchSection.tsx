import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaSearch } from 'react-icons/fa';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';

// 여행지 카테고리 타입 정의
interface TravelCategory {
  id: string;
  name: string;
  code?: string;
}

const SearchSection = () => {
  const [categories, setCategories] = useState<TravelCategory[]>([
    { id: 'all', name: '전체' },
    { id: 'ulaanbaatar', name: '울란바토르' },
    { id: 'gobi', name: '고비사막' },
    { id: 'terelj', name: '테를지 국립공원' },
    { id: 'khuvsgul', name: '홉스굴 호수' },
  ]);
  
  // 카테고리 데이터 가져오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRef = collection(db, 'categories');
        const snapshot = await getDocs(categoriesRef);
        
        if (!snapshot.empty) {
          const fetchedCategories = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() as TravelCategory
          }));
          
          // '전체' 옵션을 맨 앞에 추가
          const allCategories = [{ id: 'all', name: '전체' }, ...fetchedCategories];
          setCategories(allCategories);
        }
      } catch (error) {
        console.error('카테고리 데이터 가져오기 실패:', error);
      }
    };
    
    fetchCategories();
  }, []);
  return (
    <section className="search-box relative z-10 -mt-12 bg-white py-8 shadow-md">
      <div className="container mx-auto px-4">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[180px] flex-1">
              <label className="mb-2 block font-bold text-teal-600">여행지</label>
              <select className="w-full rounded-md border border-gray-300 bg-gray-50 p-3">
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-[180px] flex-1">
              <label className="mb-2 block font-bold text-teal-600">출발일</label>
              <div className="relative">
                <select className="w-full rounded-md border border-gray-300 bg-gray-50 p-3 pr-10">
                  <option value="all">전체 상품</option>
                  <option value="2025-06">2025년 6월</option>
                  <option value="2025-07">2025년 7월</option>
                  <option value="2025-08">2025년 8월</option>
                  <option value="2025-09">2025년 9월</option>
                  <option value="custom">날짜 직접 선택</option>
                </select>
                <FaCalendarAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            <div className="min-w-[180px] flex-1">
              <label className="mb-2 block font-bold text-teal-600">여행 기간</label>
              <select className="w-full rounded-md border border-gray-300 bg-gray-50 p-3">
                <option>전체</option>
                <option>3~4일</option>
                <option>5~7일</option>
                <option>8~10일</option>
                <option>11일 이상</option>
              </select>
            </div>

            <div className="min-w-[180px] flex-1">
              <label className="mb-2 block font-bold text-teal-600">가격대</label>
              <select className="w-full rounded-md border border-gray-300 bg-gray-50 p-3">
                <option>전체</option>
                <option>100만원 이하</option>
                <option>100~150만원</option>
                <option>150~200만원</option>
                <option>200만원 이상</option>
              </select>
            </div>

            <div className="min-w-[120px] flex-initial">
              <button className="w-full rounded-md bg-amber-600 px-5 py-3 font-bold text-white transition-colors hover:bg-amber-700 flex items-center justify-center gap-2">
                <FaSearch />
                검색
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;
