'use client';

import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Grid, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  IconButton,
  InputAdornment,
  Collapse
} from '@mui/material';
import { 
  Search as SearchIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { OrderStatus } from '@/types/order';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';

interface OrdersFilterProps {
  filters: {
    status: string;
    startDate: string;
    endDate: string;
    search: string;
    minAmount?: string;
    maxAmount?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    productId?: string;
    sortBy?: string;
    sortOrder?: string;
  };
  onFilterChange: (filters: any) => void;
}

export default function OrdersFilter({ filters, onFilterChange }: OrdersFilterProps) {
  const [expanded, setExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    status: filters.status,
    startDate: filters.startDate ? new Date(filters.startDate) : null,
    endDate: filters.endDate ? new Date(filters.endDate) : null,
    search: filters.search,
    minAmount: filters.minAmount || '',
    maxAmount: filters.maxAmount || '',
    paymentMethod: filters.paymentMethod || '',
    paymentStatus: filters.paymentStatus || '',
    productId: filters.productId || '',
    sortBy: filters.sortBy || 'createdAt',
    sortOrder: filters.sortOrder || 'desc'
  });
  
  // 필터 변경 핸들러
  const handleFilterChange = (name: string, value: any) => {
    setLocalFilters({
      ...localFilters,
      [name]: value
    });
  };
  
  // 검색어 변경 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange('search', e.target.value);
  };
  
  // 검색어 초기화 핸들러
  const handleClearSearch = () => {
    handleFilterChange('search', '');
  };
  
  // 필터 적용 핸들러
  const handleApplyFilters = () => {
    onFilterChange({
      status: localFilters.status,
      startDate: localFilters.startDate ? localFilters.startDate.toISOString().split('T')[0] : '',
      endDate: localFilters.endDate ? localFilters.endDate.toISOString().split('T')[0] : '',
      search: localFilters.search,
      minAmount: localFilters.minAmount,
      maxAmount: localFilters.maxAmount,
      paymentMethod: localFilters.paymentMethod,
      paymentStatus: localFilters.paymentStatus,
      productId: localFilters.productId,
      sortBy: localFilters.sortBy,
      sortOrder: localFilters.sortOrder
    });
  };
  
  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    setLocalFilters({
      status: '',
      startDate: null,
      endDate: null,
      search: '',
      minAmount: '',
      maxAmount: '',
      paymentMethod: '',
      paymentStatus: '',
      productId: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    
    onFilterChange({
      status: '',
      startDate: '',
      endDate: '',
      search: '',
      minAmount: '',
      maxAmount: '',
      paymentMethod: '',
      paymentStatus: '',
      productId: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };
  
  // 필터 확장/축소 토글
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  return (
    <Box>
      {/* 검색창 */}
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="주문번호, 고객명, 이메일 또는 전화번호로 검색"
            value={localFilters.search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: localFilters.search && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearSearch} edge="end" size="small">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="status-filter-label">주문 상태</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={localFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              label="주문 상태"
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="pending">대기중</MenuItem>
              <MenuItem value="confirmed">확인됨</MenuItem>
              <MenuItem value="paid">결제완료</MenuItem>
              <MenuItem value="processing">처리중</MenuItem>
              <MenuItem value="ready">준비완료</MenuItem>
              <MenuItem value="completed">완료됨</MenuItem>
              <MenuItem value="cancelled">취소됨</MenuItem>
              <MenuItem value="refunded">환불됨</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleApplyFilters}
          >
            필터 적용
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="text"
              color="primary"
              onClick={toggleExpanded}
              startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              {expanded ? '고급 필터 닫기' : '고급 필터 열기'}
            </Button>
            <Button
              variant="text"
              color="secondary"
              onClick={handleResetFilters}
            >
              필터 초기화
            </Button>
          </Box>
        </Grid>
      </Grid>
      
      {/* 고급 필터 */}
      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* 날짜 필터 */}
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="시작 날짜"
                  value={localFilters.startDate}
                  onChange={(date: Date | null) => handleFilterChange('startDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="종료 날짜"
                  value={localFilters.endDate}
                  onChange={(date: Date | null) => handleFilterChange('endDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined'
                    }
                  }}
                />
              </Grid>
            </LocalizationProvider>
            
            {/* 금액 필터 */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="최소 금액"
                type="number"
                variant="outlined"
                value={localFilters.minAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('minAmount', e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">원</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="최대 금액"
                type="number"
                variant="outlined"
                value={localFilters.maxAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('maxAmount', e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">원</InputAdornment>,
                }}
              />
            </Grid>
            
            {/* 결제 관련 필터 */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="payment-method-label">결제 방법</InputLabel>
                <Select
                  labelId="payment-method-label"
                  id="payment-method"
                  value={localFilters.paymentMethod}
                  onChange={(e: React.ChangeEvent<{ value: unknown }>) => handleFilterChange('paymentMethod', e.target.value)}
                  label="결제 방법"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="card">카드</MenuItem>
                  <MenuItem value="bank">계좌이체</MenuItem>
                  <MenuItem value="vbank">가상계좌</MenuItem>
                  <MenuItem value="phone">휴대폰</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="payment-status-label">결제 상태</InputLabel>
                <Select
                  labelId="payment-status-label"
                  id="payment-status"
                  value={localFilters.paymentStatus}
                  onChange={(e: React.ChangeEvent<{ value: unknown }>) => handleFilterChange('paymentStatus', e.target.value)}
                  label="결제 상태"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="ready">결제 준비</MenuItem>
                  <MenuItem value="paid">결제 완료</MenuItem>
                  <MenuItem value="cancelled">결제 취소</MenuItem>
                  <MenuItem value="failed">결제 실패</MenuItem>
                  <MenuItem value="refunded">환불 완료</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* 정렬 기준 */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="sort-by-label">정렬 기준</InputLabel>
                <Select
                  labelId="sort-by-label"
                  id="sort-by"
                  value={localFilters.sortBy}
                  onChange={(e: React.ChangeEvent<{ value: unknown }>) => handleFilterChange('sortBy', e.target.value)}
                  label="정렬 기준"
                >
                  <MenuItem value="createdAt">주문일</MenuItem>
                  <MenuItem value="updatedAt">업데이트일</MenuItem>
                  <MenuItem value="totalAmount">주문금액</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="sort-order-label">정렬 방향</InputLabel>
                <Select
                  labelId="sort-order-label"
                  id="sort-order"
                  value={localFilters.sortOrder}
                  onChange={(e: React.ChangeEvent<{ value: unknown }>) => handleFilterChange('sortOrder', e.target.value)}
                  label="정렬 방향"
                >
                  <MenuItem value="desc">내림차순</MenuItem>
                  <MenuItem value="asc">오름차순</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Box>
  );
}
