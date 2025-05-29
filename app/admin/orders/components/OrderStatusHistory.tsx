'use client';

import {
  Paper,
  Typography,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  Chip
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { Order, OrderStatus } from '@/types/order';

interface OrderStatusHistoryProps {
  order: Order;
}

// 주문 상태별 아이콘 정의
const statusIcons: Record<OrderStatus, React.ReactNode> = {
  'pending': <PendingIcon />,
  'confirmed': <ReceiptIcon />,
  'paid': <PaymentIcon />,
  'processing': <ShippingIcon />,
  'ready': <ShippingIcon />,
  'completed': <CheckCircleIcon />,
  'cancelled': <CancelIcon />,
  'refunded': <CancelIcon />
};

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

export default function OrderStatusHistory({ order }: OrderStatusHistoryProps) {
  // 날짜 포맷팅 함수
  const formatDateTime = (dateString: string | Date) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 상태 변경 이력이 없는 경우 현재 상태만 표시
  const statusHistory = order.statusHistory && order.statusHistory.length > 0
    ? order.statusHistory
    : [{ 
        status: order.status, 
        timestamp: order.createdAt, 
        note: '주문 생성' 
      }];

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" component="h3" gutterBottom>
        주문 상태 이력
      </Typography>
      
      <Timeline position="alternate">
        {statusHistory.map((history, index) => (
          <TimelineItem key={index}>
            <TimelineOppositeContent color="text.secondary">
              {formatDateTime(history.timestamp)}
            </TimelineOppositeContent>
            
            <TimelineSeparator>
              <TimelineDot color={statusColors[history.status as OrderStatus]}>
                {statusIcons[history.status as OrderStatus]}
              </TimelineDot>
              {index < statusHistory.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            
            <TimelineContent>
              <Typography variant="body1" component="span">
                <Chip 
                  label={statusLabels[history.status as OrderStatus]} 
                  color={statusColors[history.status as OrderStatus]}
                  size="small"
                  sx={{ mr: 1 }}
                />
                {history.note && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {history.note}
                  </Typography>
                )}
              </Typography>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Paper>
  );
}
