'use client';

import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination,
  Checkbox,
  IconButton,
  Chip,
  Button,
  Menu,
  MenuItem,
  Typography,
  Box,
  Tooltip
} from '@mui/material';
import Link from 'next/link';
import { 
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { Order, OrderStatus } from '@/types/order';

// 주문 상태별 색상 정의
const statusColors: Record<OrderStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  'pending': 'default',
  'confirmed': 'info',
  'paid': 'primary',
  'processing': 'warning',
  'ready': 'secondary',
  'completed': 'success',
  'cancelled': 'error',
  'refunded': 'error'
};

// 주문 상태 한글 표시
const statusLabels: Record<OrderStatus, string> = {
  'pending': '대기중',
  'confirmed': '확인됨',
  'paid': '결제완료',
  'processing': '처리중',
  'ready': '준비완료',
  'completed': '완료됨',
  'cancelled': '취소됨',
  'refunded': '환불됨'
};

interface OrdersTableProps {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onBulkStatusChange: (orderIds: string[], newStatus: string) => void;
}

export default function OrdersTable({ 
  orders, 
  pagination, 
  onPageChange,
  onBulkStatusChange
}: OrdersTableProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [statusMenuAnchorEl, setStatusMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<Record<string, HTMLElement | null>>({});
  
  // 체크박스 선택 핸들러
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = orders.map((order) => order.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };
  
  // 개별 체크박스 선택 핸들러
  const handleSelectClick = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];
    
    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter((item) => item !== id);
    }
    
    setSelected(newSelected);
  };
  
  // 상태 변경 메뉴 열기
  const handleStatusMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setStatusMenuAnchorEl(event.currentTarget);
  };
  
  // 상태 변경 메뉴 닫기
  const handleStatusMenuClose = () => {
    setStatusMenuAnchorEl(null);
  };
  
  // 주문 상태 일괄 변경
  const handleStatusChange = (status: string) => {
    if (selected.length > 0) {
      onBulkStatusChange(selected, status);
      setSelected([]);
    }
    handleStatusMenuClose();
  };
  
  // 개별 주문 액션 메뉴 열기
  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, orderId: string) => {
    setActionMenuAnchorEl({
      ...actionMenuAnchorEl,
      [orderId]: event.currentTarget
    });
  };
  
  // 개별 주문 액션 메뉴 닫기
  const handleActionMenuClose = (orderId: string) => {
    setActionMenuAnchorEl({
      ...actionMenuAnchorEl,
      [orderId]: null
    });
  };
  
  // 페이지 변경 핸들러
  const handleChangePage = (event: unknown, newPage: number) => {
    onPageChange(newPage + 1); // MUI는 0-based, API는 1-based
  };
  
  // 날짜 포맷팅 함수
  const formatDate = (dateValue: any) => {
    try {
      // Firebase Timestamp 객체 처리
      if (dateValue && typeof dateValue === 'object' && 'toDate' in dateValue) {
        const date = dateValue.toDate();
        return date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      // 일반 Date 객체나 문자열 처리
      const date = new Date(dateValue);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('날짜 변환 오류:', error);
      return '날짜 정보 없음';
    }
  };
  
  // 금액 포맷팅 함수
  const formatCurrency = (amount: number, currency: string = 'KRW') => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  return (
    <>
      {/* 선택된 주문 액션 */}
      {selected.length > 0 && (
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            {selected.length}개 선택됨
          </Typography>
          <Button
            variant="outlined"
            onClick={handleStatusMenuOpen}
            size="small"
          >
            상태 변경
          </Button>
          <Menu
            anchorEl={statusMenuAnchorEl}
            open={Boolean(statusMenuAnchorEl)}
            onClose={handleStatusMenuClose}
          >
            <MenuItem onClick={() => handleStatusChange('confirmed')}>확인됨</MenuItem>
            <MenuItem onClick={() => handleStatusChange('paid')}>결제완료</MenuItem>
            <MenuItem onClick={() => handleStatusChange('processing')}>처리중</MenuItem>
            <MenuItem onClick={() => handleStatusChange('ready')}>준비완료</MenuItem>
            <MenuItem onClick={() => handleStatusChange('completed')}>완료됨</MenuItem>
            <MenuItem onClick={() => handleStatusChange('cancelled')}>취소됨</MenuItem>
            <MenuItem onClick={() => handleStatusChange('refunded')}>환불됨</MenuItem>
          </Menu>
        </Box>
      )}
      
      {/* 주문 테이블 */}
      <TableContainer>
        <Table stickyHeader aria-label="주문 목록 테이블">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < orders.length}
                  checked={orders.length > 0 && selected.length === orders.length}
                  onChange={handleSelectAllClick}
                  inputProps={{ 'aria-label': '모든 주문 선택' }}
                />
              </TableCell>
              <TableCell>주문번호</TableCell>
              <TableCell>주문일시</TableCell>
              <TableCell>고객명</TableCell>
              <TableCell>상품</TableCell>
              <TableCell align="right">금액</TableCell>
              <TableCell>상태</TableCell>
              <TableCell>결제방법</TableCell>
              <TableCell align="right">액션</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => {
              const isSelected = selected.indexOf(order.id) !== -1;
              
              return (
                <TableRow
                  hover
                  role="checkbox"
                  aria-checked={isSelected}
                  tabIndex={-1}
                  key={order.id}
                  selected={isSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onClick={() => handleSelectClick(order.id)}
                      inputProps={{ 'aria-labelledby': `order-${order.id}` }}
                    />
                  </TableCell>
                  <TableCell component="th" id={`order-${order.id}`} scope="row">
                    <Link href={`/admin/orders/${order.id}`}>
                      <Typography variant="body2" sx={{ color: 'primary.main', textDecoration: 'underline' }}>
                        {order.orderNumber}
                      </Typography>
                    </Link>
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <Tooltip title={`${order.customer.email} / ${order.customer.phone}`}>
                      <Typography variant="body2">{order.customer.name}</Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={order.items.map(item => item.productTitle).join(', ')}>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {order.items[0]?.productTitle}
                        {order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : ''}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">{formatCurrency(order.totalAmount, order.currency)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={statusLabels[order.status] || order.status} 
                      color={statusColors[order.status] || 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{order.payment?.method || '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      aria-label="더 보기"
                      onClick={(e) => handleActionMenuOpen(e, order.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={actionMenuAnchorEl[order.id]}
                      open={Boolean(actionMenuAnchorEl[order.id])}
                      onClose={() => handleActionMenuClose(order.id)}
                    >
                      <MenuItem component={Link} href={`/admin/orders/${order.id}`}>
                        <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
                        상세보기
                      </MenuItem>
                      <MenuItem component={Link} href={`/admin/orders/${order.id}/edit`}>
                        <EditIcon fontSize="small" sx={{ mr: 1 }} />
                        수정하기
                      </MenuItem>
                      <MenuItem onClick={() => handleStatusChange('confirmed')}>
                        상태: 확인됨
                      </MenuItem>
                      <MenuItem onClick={() => handleStatusChange('paid')}>
                        상태: 결제완료
                      </MenuItem>
                      <MenuItem onClick={() => handleStatusChange('processing')}>
                        상태: 처리중
                      </MenuItem>
                      <MenuItem onClick={() => handleStatusChange('completed')}>
                        상태: 완료됨
                      </MenuItem>
                      <MenuItem onClick={() => handleStatusChange('cancelled')}>
                        상태: 취소됨
                      </MenuItem>
                      <MenuItem onClick={() => handleStatusChange('refunded')}>
                        상태: 환불됨
                      </MenuItem>
                      <MenuItem component={Link} href={`/admin/orders/${order.id}?action=cancel`}>
                        취소 처리
                      </MenuItem>
                      <MenuItem component={Link} href={`/admin/orders/${order.id}?action=refund`}>
                        환불 처리
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* 페이지네이션 */}
      <TablePagination
        rowsPerPageOptions={[10]}
        component="div"
        count={pagination.total}
        rowsPerPage={pagination.limit}
        page={pagination.page - 1} // MUI는 0-based, API는 1-based
        onPageChange={handleChangePage}
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
      />
    </>
  );
}
