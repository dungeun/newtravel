'use client';

import { useState, useEffect } from 'react';
import { AdminPageLayout } from '../../components/AdminPageLayout';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, SaveIcon, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DaySettings {
  excludedDates: string[]; // ISO 형식의 날짜 (YYYY-MM-DD)
  updatedAt: any; // Firestore Timestamp
}

// 달력 헤더 (요일)
const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

// 주어진 월의 날짜 배열을 생성하는 함수
const getDaysInMonth = (year: number, month: number) => {
  // month는 0-11 범위
  const date = new Date(year, month, 1);
  const days = [];
  
  // 이전 달의 날짜로 첫 주 채우기
  const firstDay = date.getDay(); // 이번 달 1일의 요일 (0: 일요일, 6: 토요일)
  if (firstDay > 0) {
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const prevMonthDate = prevMonthLastDate - i;
      days.push({
        date: new Date(prevYear, prevMonth, prevMonthDate),
        isCurrentMonth: false
      });
    }
  }
  
  // 이번 달 날짜 채우기
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true
    });
  }
  
  // 다음 달의 날짜로 마지막 주 채우기
  const lastDay = new Date(year, month, daysInMonth).getDay();
  if (lastDay < 6) {
    for (let i = 1; i <= 6 - lastDay; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      days.push({
        date: new Date(nextYear, nextMonth, i),
        isCurrentMonth: false
      });
    }
  }
  
  return days;
};

// 여행 날짜 설정 페이지
export default function TravelDaySettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [excludedDates, setExcludedDates] = useState<string[]>([]);
  
  // 현재 날짜 설정
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  
  // 현재 월과 다음 월의 날짜 배열
  const daysCurrentMonth = getDaysInMonth(currentYear, currentMonth);
  
  // 다음달 계산
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  const daysNextMonth = getDaysInMonth(nextMonthYear, nextMonth);
  
  // 제외된 날짜 데이터 불러오기
  useEffect(() => {
    const fetchExcludedDates = async () => {
      try {
        setIsLoading(true);
        const daySettingsRef = doc(db, 'travel_settings', 'excluded_days');
        const daySettingsDoc = await getDoc(daySettingsRef);
        
        if (daySettingsDoc.exists()) {
          const data = daySettingsDoc.data() as DaySettings;
          setExcludedDates(data.excludedDates || []);
        } else {
          // 문서가 없으면 초기화
          setExcludedDates([]);
        }
      } catch (error) {
        console.error('제외 날짜 데이터 불러오기 실패:', error);
        toast({
          title: '오류',
          description: '날짜 설정을 불러오는 중 문제가 발생했습니다.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExcludedDates();
  }, [toast]);
  
  // 날짜 선택 토글
  const toggleDateSelection = (dateString: string) => {
    setExcludedDates(prev => {
      if (prev.includes(dateString)) {
        toast({
          description: `${new Date(dateString).toLocaleDateString('ko-KR')} 날짜가 제외 목록에서 제거되었습니다.`,
        });
        return prev.filter(d => d !== dateString);
      } else {
        toast({
          description: `${new Date(dateString).toLocaleDateString('ko-KR')} 날짜가 제외 목록에 추가되었습니다.`,
        });
        return [...prev, dateString];
      }
    });
  };
  
  // 날짜가 제외 목록에 있는지 확인
  const isDateExcluded = (dateString: string) => {
    return excludedDates.includes(dateString);
  };
  
  // 날짜 포맷 (YYYY-MM-DD)
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  // 제외 날짜 저장하기
  const saveExcludedDates = async () => {
    try {
      setIsLoading(true);
      
      const daySettingsRef = doc(db, 'travel_settings', 'excluded_days');
      await setDoc(daySettingsRef, {
        excludedDates: excludedDates,
        updatedAt: Timestamp.now()
      });
      
      toast({
        title: '성공',
        description: '여행 제외 날짜가 성공적으로 저장되었습니다.',
      });
    } catch (error) {
      console.error('제외 날짜 저장 실패:', error);
      toast({
        title: '오류',
        description: '날짜 설정을 저장하는 중 문제가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 이전 달로 이동
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  // 다음 달로 이동
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // 현재 월 이름
  const currentMonthName = new Date(currentYear, currentMonth).toLocaleString('ko-KR', { month: 'long' });
  const nextMonthName = new Date(nextMonthYear, nextMonth).toLocaleString('ko-KR', { month: 'long' });
  
  return (
    <AdminPageLayout
      title="여행 날짜 설정"
      description="여행 상품이 표시되지 않는 날짜를 설정합니다."
      actions={
        <Button 
          onClick={saveExcludedDates} 
          disabled={isLoading}
          className="flex gap-2 items-center"
        >
          <SaveIcon className="w-4 h-4" />
          저장하기
        </Button>
      }
    >
      <div className="space-y-6">
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              <span>날짜 선택 방법</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              아래 달력에서 여행 상품이 표시되지 않도록 설정할 날짜를 클릭하세요. 
              선택된 날짜(빨간색)에는 여행 상품이 표시되지 않습니다.
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>선택된 날짜는 여행 상품 등록 시 출발 불가능한 날짜로 처리됩니다.</li>
              <li>날짜를 다시 클릭하면 선택이 해제됩니다.</li>
              <li>날짜 설정 후 반드시 저장 버튼을 클릭해야 적용됩니다.</li>
            </ul>
          </CardContent>
        </Card>
        
        {/* 선택된 날짜 목록 - 상단으로 이동 */}
        {excludedDates.length > 0 && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-red-600 dark:text-red-400">선택된 여행 제외 날짜 ({excludedDates.length}개)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {excludedDates.sort().map(dateString => (
                  <div
                    key={dateString}
                    className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300 px-3 py-2 rounded-md flex items-center gap-2 text-sm shadow-sm"
                  >
                    <span>
                      {new Date(dateString).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short',
                      })}
                    </span>
                    <button
                      onClick={() => toggleDateSelection(dateString)}
                      className="hover:bg-red-200 dark:hover:bg-red-800/50 rounded-full h-5 w-5 inline-flex items-center justify-center transition-colors"
                      aria-label="날짜 제거"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 현재 월 달력 */}
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToPreviousMonth}
                  className="dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700"
                >
                  &lt;
                </Button>
                <CardTitle>
                  {currentYear}년 {currentMonthName}
                </CardTitle>
                <div className="w-10"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {/* 요일 헤더 */}
                {DAYS_OF_WEEK.map((day, index) => (
                  <div
                    key={day}
                    className={`text-center font-medium py-2 ${
                      index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : ''
                    }`}
                  >
                    {day}
                  </div>
                ))}
                
                {/* 날짜 */}
                {daysCurrentMonth.map(({ date, isCurrentMonth }, index) => {
                  const dateString = formatDate(date);
                  const isSelected = isDateExcluded(dateString);
                  const isToday = formatDate(today) === dateString;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => toggleDateSelection(dateString)}
                      disabled={!isCurrentMonth}
                      className={`
                        relative aspect-square flex items-center justify-center p-2 rounded-full text-sm
                        ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-slate-800'}
                        ${isSelected ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300 font-bold' : ''}
                        ${isToday ? 'ring-2 ring-blue-400 dark:ring-blue-500' : ''}
                      `}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* 다음 월 달력 */}
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-10"></div>
                <CardTitle>
                  {nextMonthYear}년 {nextMonthName}
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToNextMonth}
                  className="dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700"
                >
                  &gt;
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {/* 요일 헤더 */}
                {DAYS_OF_WEEK.map((day, index) => (
                  <div
                    key={day}
                    className={`text-center font-medium py-2 ${
                      index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : ''
                    }`}
                  >
                    {day}
                  </div>
                ))}
                
                {/* 날짜 */}
                {daysNextMonth.map(({ date, isCurrentMonth }, index) => {
                  const dateString = formatDate(date);
                  const isSelected = isDateExcluded(dateString);
                  const isToday = formatDate(today) === dateString;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => toggleDateSelection(dateString)}
                      disabled={!isCurrentMonth}
                      className={`
                        relative aspect-square flex items-center justify-center p-2 rounded-full text-sm
                        ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-slate-800'}
                        ${isSelected ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300 font-bold' : ''}
                        ${isToday ? 'ring-2 ring-blue-400 dark:ring-blue-500' : ''}
                      `}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={saveExcludedDates} 
            disabled={isLoading}
            className="flex gap-2 items-center"
          >
            <SaveIcon className="w-4 h-4" />
            저장하기
          </Button>
        </div>
      </div>
    </AdminPageLayout>
  );
} 