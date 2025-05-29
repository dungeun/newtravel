import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// 필터 타입 정의
interface FilterValues {
  region: string;
  minPrice: string;
  maxPrice: string;
  duration: string;
  theme: string;
  startDate: string;
  sortBy: string;
}

interface SearchFilterProps {
  regions: string[];
  themes?: string[];
  onChange: (filters: FilterValues) => void;
  initialValues?: Partial<FilterValues>;
}

const DURATION_OPTIONS = [
  { value: '', label: '모든 기간' },
  { value: '1-3', label: '1-3일' },
  { value: '4-7', label: '4-7일' },
  { value: '8-14', label: '8-14일' },
  { value: '15+', label: '15일 이상' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: '최신순' },
  { value: 'oldest', label: '오래된순' },
  { value: 'priceAsc', label: '가격 낮은순' },
  { value: 'priceDesc', label: '가격 높은순' }
];

// 테마 필터 옵션 매핑 추가
const THEME_LABELS: Record<string, string> = {
  'bestSeller': '인기 상품',
  'timeDeal': '타임딜',
  // 추가 테마가 있다면 여기에 추가
};

export default function SearchFilter({ 
  regions, 
  themes = [], 
  onChange,
  initialValues = {} 
}: SearchFilterProps) {
  // 초기값 설정
  const [filters, setFilters] = useState<FilterValues>({
    region: initialValues.region || '',
    minPrice: initialValues.minPrice || '',
    maxPrice: initialValues.maxPrice || '',
    duration: initialValues.duration || '',
    theme: initialValues.theme || '',
    startDate: initialValues.startDate || '',
    sortBy: initialValues.sortBy || 'newest',
  });

  // 필터 변경 처리
  const handleChange = (name: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onChange(newFilters);
  };

  // 모든 필터 초기화
  const handleReset = () => {
    const resetFilters: FilterValues = {
      region: '',
      minPrice: '',
      maxPrice: '',
      duration: '',
      theme: '',
      startDate: '',
      sortBy: 'newest',
    };
    setFilters(resetFilters);
    onChange(resetFilters);
  };

  // 선택된 필터 카운트 (정렬은 필터 카운트에서 제외)
  const selectedFilterCount = Object.entries(filters)
    .filter(([key, value]) => key !== 'sortBy' && value !== '')
    .length;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-lg">여행 상품 검색</h3>
          {selectedFilterCount > 0 && (
            <Badge variant="outline" className="gap-1">
              필터 {selectedFilterCount}개 적용 중
              <button 
                onClick={handleReset} 
                className="ml-2 text-xs text-gray-500 hover:text-gray-800"
              >
                초기화
              </button>
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 지역 필터 */}
          <div>
            <Label htmlFor="region-filter" className="text-sm font-medium mb-1.5 block">
              지역
            </Label>
            <select
              id="region-filter"
              className="w-full h-10 px-3 py-2 border rounded-md"
              value={filters.region}
              onChange={(e) => handleChange('region', e.target.value)}
            >
              <option value="">모든 지역</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          {/* 최소 가격 필터 */}
          <div>
            <Label htmlFor="min-price-filter" className="text-sm font-medium mb-1.5 block">
              최소 가격
            </Label>
            <Input
              id="min-price-filter"
              type="number"
              placeholder="0"
              min="0"
              value={filters.minPrice}
              onChange={(e) => handleChange('minPrice', e.target.value)}
              className="w-full"
            />
          </div>

          {/* 최대 가격 필터 */}
          <div>
            <Label htmlFor="max-price-filter" className="text-sm font-medium mb-1.5 block">
              최대 가격
            </Label>
            <Input
              id="max-price-filter"
              type="number"
              placeholder="무제한"
              min={filters.minPrice ? parseInt(filters.minPrice) : 0}
              value={filters.maxPrice}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              className="w-full"
            />
          </div>

          {/* 여행 기간 필터 */}
          <div>
            <Label htmlFor="duration-filter" className="text-sm font-medium mb-1.5 block">
              여행 기간
            </Label>
            <select
              id="duration-filter"
              className="w-full h-10 px-3 py-2 border rounded-md"
              value={filters.duration}
              onChange={(e) => handleChange('duration', e.target.value)}
            >
              {DURATION_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* 테마 필터 */}
          {themes.length > 0 && (
            <div>
              <Label htmlFor="theme-filter" className="text-sm font-medium mb-1.5 block">
                테마
              </Label>
              <select
                id="theme-filter"
                className="w-full h-10 px-3 py-2 border rounded-md"
                value={filters.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
              >
                <option value="">모든 테마</option>
                {themes.map(theme => (
                  <option key={theme} value={theme}>
                    {THEME_LABELS[theme] || theme}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 출발 날짜 필터 */}
          <div>
            <Label htmlFor="start-date-filter" className="text-sm font-medium mb-1.5 block">
              출발 날짜
            </Label>
            <Input
              id="start-date-filter"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full"
            />
          </div>

          {/* 정렬 옵션 */}
          <div>
            <Label htmlFor="sort-by-filter" className="text-sm font-medium mb-1.5 block">
              정렬
            </Label>
            <select
              id="sort-by-filter"
              className="w-full h-10 px-3 py-2 border rounded-md"
              value={filters.sortBy}
              onChange={(e) => handleChange('sortBy', e.target.value)}
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 