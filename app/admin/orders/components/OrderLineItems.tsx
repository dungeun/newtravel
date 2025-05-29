'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip
} from '@mui/material';
import { Order } from '@/types/order';

interface OrderLineItemsProps {
  order: Order;
}

export default function OrderLineItems({ order }: OrderLineItemsProps) {
  // 날짜 포맷팅 함수
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };
  
  // 금액 포맷팅 함수
  const formatCurrency = (amount: number, currency: string = 'KRW') => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" component="h3" gutterBottom>
        주문 상품 정보
      </Typography>
      
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>상품명</TableCell>
              <TableCell align="center">옵션</TableCell>
              <TableCell align="center">여행 일정</TableCell>
              <TableCell align="right">단가</TableCell>
              <TableCell align="right">수량</TableCell>
              <TableCell align="right">금액</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  <Typography variant="body2" fontWeight="medium">
                    {item.title}
                  </Typography>
                  {item.productId && (
                    <Typography variant="caption" color="text.secondary">
                      상품 ID: {item.productId}
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  {item.options ? (
                    <Box>
                      {item.options.adult > 0 && (
                        <Chip 
                          label={`성인 ${item.options.adult}명`} 
                          size="small" 
                          variant="outlined" 
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      )}
                      {item.options.child > 0 && (
                        <Chip 
                          label={`아동 ${item.options.child}명`} 
                          size="small" 
                          variant="outlined" 
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      )}
                      {item.options.infant > 0 && (
                        <Chip 
                          label={`유아 ${item.options.infant}명`} 
                          size="small" 
                          variant="outlined" 
                          sx={{ mb: 0.5 }}
                        />
                      )}
                    </Box>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell align="center">
                  {item.dates ? (
                    <Typography variant="body2">
                      {formatDate(item.dates.startDate)} ~ {formatDate(item.dates.endDate)}
                    </Typography>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(item.price)}
                </TableCell>
                <TableCell align="right">
                  {item.quantity}
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold">
                    {formatCurrency(item.price * item.quantity)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={5} align="right">
                <Typography variant="subtitle2">총 주문금액</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" fontWeight="bold">
                  {formatCurrency(order.totalAmount)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
