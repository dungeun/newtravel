'use client';

import {
  Paper,
  Typography,
  Grid,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Avatar
} from '@mui/material';
import { 
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  Wc as WcIcon
} from '@mui/icons-material';
import { Order } from '@/types/order';

interface OrderCustomerInfoProps {
  order: Order;
}

export default function OrderCustomerInfo({ order }: OrderCustomerInfoProps) {
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

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={3}>
        {/* 주문자 정보 */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" component="h3" gutterBottom>
            주문자 정보
          </Typography>
          
          <List dense>
            <ListItem>
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                <PersonIcon />
              </Avatar>
              <ListItemText 
                primary="이름" 
                secondary={order.ordererInfo?.name || '-'} 
              />
            </ListItem>
            
            <Divider variant="inset" component="li" />
            
            <ListItem>
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                <EmailIcon />
              </Avatar>
              <ListItemText 
                primary="이메일" 
                secondary={order.ordererInfo?.email || '-'} 
              />
            </ListItem>
            
            <Divider variant="inset" component="li" />
            
            <ListItem>
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                <PhoneIcon />
              </Avatar>
              <ListItemText 
                primary="연락처" 
                secondary={order.ordererInfo?.phone || '-'} 
              />
            </ListItem>
          </List>
        </Grid>
        
        {/* 여행자 정보 */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" component="h3" gutterBottom>
            여행자 정보
          </Typography>
          
          {order.travelers && order.travelers.length > 0 ? (
            <List dense>
              {order.travelers.map((traveler, index) => (
                <Box key={traveler.id || index}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center">
                          <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="subtitle2">
                            {traveler.name} {index === 0 && <Chip size="small" label="대표" color="primary" />}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Grid container spacing={1} sx={{ mt: 0.5 }}>
                          <Grid item xs={6} display="flex" alignItems="center">
                            <CakeIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem', color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(traveler.birthdate)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} display="flex" alignItems="center">
                            <WcIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem', color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {traveler.gender}
                            </Typography>
                          </Grid>
                        </Grid>
                      }
                    />
                  </ListItem>
                  {index < order.travelers.length - 1 && (
                    <Divider component="li" />
                  )}
                </Box>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary">여행자 정보가 없습니다.</Typography>
          )}
        </Grid>
      </Grid>
      
      {/* 특별 요청 사항 */}
      {order.specialRequests && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            특별 요청 사항
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="body2">
              {order.specialRequests}
            </Typography>
          </Paper>
        </Box>
      )}
    </Paper>
  );
}
