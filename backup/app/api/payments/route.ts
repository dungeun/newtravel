import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import crypto from 'crypto';

// 이니시스 결제 모의 처리
interface InicisPaymentRequest {
  mid: string; // 가맹점 ID
  orderNumber: string; // 주문번호
  amount: number; // 결제금액
  buyerName: string; // 구매자명
  buyerEmail: string; // 구매자 이메일
  buyerTel: string; // 구매자 전화번호
  productName: string; // 상품명
  cardNumber: string; // 카드번호
  expiry: string; // 유효기간
  cvv: string; // CVV
  installment: number; // 할부개월 (0: 일시불)
  paymentMethod: 'CARD' | 'TRANS' | 'VBANK' | 'PHONE'; // 결제수단
}

// 결제 요청 및 응답 모의 함수
async function mockedInicisPayment(paymentData: InicisPaymentRequest) {
  // 실제 구현에서는 이니시스 API와 통신
  // 이 함수는 테스트를 위한 모의 구현입니다.
  
  // 1. 결제 요청 유효성 검사
  if (!paymentData.mid || !paymentData.orderNumber || !paymentData.amount) {
    return { success: false, error: 'INVALID_PARAMETER', message: '필수 파라미터가 누락되었습니다.' };
  }
  
  // 2. 카드정보 유효성 검사 (간단한 체크만 수행)
  if (paymentData.paymentMethod === 'CARD') {
    if (!paymentData.cardNumber || !paymentData.expiry || !paymentData.cvv) {
      return { success: false, error: 'INVALID_CARD_INFO', message: '카드 정보가 유효하지 않습니다.' };
    }
    
    // 카드번호 검증 (기본적인 Luhn 알고리즘 체크)
    if (!isValidCardNumber(paymentData.cardNumber)) {
      return { success: false, error: 'INVALID_CARD_NUMBER', message: '유효하지 않은 카드번호입니다.' };
    }
    
    // 만료일 검증 (MMYY 형식)
    if (!isValidExpiry(paymentData.expiry)) {
      return { success: false, error: 'EXPIRED_CARD', message: '만료된 카드입니다.' };
    }
  }
  
  // 3. 가상 결제 진행 및 응답 (테스트 용도)
  // 테스트 카드번호: 4111111111111111은 항상 성공, 4222222222222220은 항상 실패
  if (paymentData.cardNumber === '4222222222222220') {
    return { 
      success: false, 
      error: 'PAYMENT_FAILED', 
      message: '결제가 승인되지 않았습니다. 카드사에 문의하세요.',
      errorCode: 'CARD_DECLINED'
    };
  }
  
  // 4. 성공 응답
  const tid = generateTransactionId(); // 거래 ID 생성
  
  return {
    success: true,
    message: '결제가 성공적으로 처리되었습니다.',
    tid: tid,
    amount: paymentData.amount,
    orderNumber: paymentData.orderNumber,
    approvedAt: new Date().toISOString(),
    payMethod: paymentData.paymentMethod,
    // PG사 응답에 포함될 추가 정보들
    pgProvider: 'INICIS',
    authCode: crypto.randomBytes(8).toString('hex').toUpperCase()
  };
}

// 카드번호 유효성 검사 (Luhn 알고리즘)
function isValidCardNumber(cardNumber: string): boolean {
  // 공백, 대시 제거
  const digitsOnly = cardNumber.replace(/\D/g, '');
  if (digitsOnly.length < 13 || digitsOnly.length > 19) return false;
  
  // 테스트 카드번호는 무조건 통과
  if (digitsOnly === '4111111111111111' || digitsOnly === '4222222222222220') {
    return true;
  }
  
  // Luhn 알고리즘 체크
  let sum = 0;
  let shouldDouble = false;

  for (let i = digitsOnly.length - 1; i >= 0; i--) {
    let digit = parseInt(digitsOnly.charAt(i));
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
}

// 카드 만료일 유효성 검사
function isValidExpiry(expiry: string): boolean {
  // MMYY 형식 체크
  const pattern = /^(0[1-9]|1[0-2])(\d{2})$/;
  if (!pattern.test(expiry)) return false;
  
  const month = parseInt(expiry.substring(0, 2));
  const year = parseInt('20' + expiry.substring(2, 4));
  
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // getMonth()는 0-11 반환
  const currentYear = now.getFullYear();
  
  // 현재 연도가 만료 연도보다 큰 경우
  if (currentYear > year) return false;
  
  // 현재 연도와 만료 연도가 같고, 현재 월이 만료 월보다 큰 경우
  if (currentYear === year && currentMonth > month) return false;
  
  return true;
}

// 거래 ID 생성
function generateTransactionId(): string {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(4).toString('hex');
  return `INI${timestamp}${random}`.toUpperCase();
}

// POST /api/payments - 결제 요청 처리
export async function POST(req: NextRequest) {
  try {
    // 1. 세션 확인
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.', success: false }, { status: 401 });
    }
    
    // 2. 결제 요청 데이터 파싱
    const data = await req.json();
    
    // 3. 필수 필드 검증
    if (!data.items || data.items.length === 0 || !data.payment) {
      return NextResponse.json({ 
        error: '필수 정보가 누락되었습니다.',
        success: false 
      }, { status: 400 });
    }
    
    // 4. 상품명 생성 (첫 번째 상품명 + 추가 상품 갯수)
    const firstItemTitle = data.items[0].title || '여행 상품';
    const productName = data.items.length > 1 
      ? `${firstItemTitle} 외 ${data.items.length - 1}건` 
      : firstItemTitle;
    
    // 5. 이니시스 결제 요청 데이터 준비
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const paymentRequest: InicisPaymentRequest = {
      mid: process.env.INICIS_MERCHANT_ID || 'testMID', // 테스트 MID
      orderNumber: orderNumber,
      amount: data.totalAmount || data.payment.amount,
      buyerName: data.customer?.name || session.user?.name || '구매자',
      buyerEmail: data.customer?.email || session.user?.email || '',
      buyerTel: data.customer?.phone || '',
      productName: productName,
      cardNumber: data.payment.cardNumber || '',
      expiry: data.payment.expiryDate?.replace(/\D/g, '') || '',
      cvv: data.payment.cvv || '',
      installment: data.payment.installment || 0,
      paymentMethod: data.payment.method || 'CARD'
    };
    
    // 6. 결제 처리 (모의 함수 호출)
    const paymentResult = await mockedInicisPayment(paymentRequest);
    
    // 7. 결제 실패 시 오류 반환
    if (!paymentResult.success) {
      return NextResponse.json({ 
        error: paymentResult.message || '결제 처리 중 오류가 발생했습니다.',
        errorCode: paymentResult.error,
        success: false 
      }, { status: 400 });
    }
    
    // 8. 결제 성공 시 주문 생성 요청
    const orderData = {
      orderNumber: orderNumber,
      customer: {
        id: session.user?.id || '',
        name: data.customer?.name || session.user?.name || '',
        email: data.customer?.email || session.user?.email || '',
        phone: data.customer?.phone || '',
        address: data.customer?.address || {}
      },
      items: data.items,
      totalAmount: data.totalAmount,
      currency: data.currency || 'KRW',
      payment: {
        method: data.payment.method || 'CARD',
        status: 'PAID',
        tid: paymentResult.tid,
        pgProvider: 'INICIS',
        approvedAt: paymentResult.approvedAt,
        cardInfo: {
          issuer: getCardIssuer(data.payment.cardNumber || ''),
          installment: data.payment.installment || 0,
          last4: (data.payment.cardNumber || '').slice(-4)
        }
      },
      status: 'paid',
      createdAt: new Date(),
      specialRequests: data.specialRequests || '',
      notes: data.notes
    };
    
    // 9. 내부 API 호출로 주문 생성
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (req.headers.get('host') ? `https://${req.headers.get('host')}` : 'http://localhost:3000');
    const orderRes = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // 세션 쿠키나 토큰을 전달해야 할 수 있음
        Cookie: req.headers.get('cookie') || ''
      },
      body: JSON.stringify(orderData),
    });
    
    const orderResult = await orderRes.json();
    if (!orderRes.ok) {
      // 결제는 성공했지만 주문 생성에 실패한 경우
      // 실제 환경에서는 취소 로직이 필요할 수 있음
      return NextResponse.json({ 
        error: orderResult.error || '주문 생성 실패',
        paymentSuccess: true,
        orderCreationFailed: true,
        paymentData: {
          tid: paymentResult.tid,
          amount: paymentResult.amount,
          orderNumber: paymentResult.orderNumber
        },
        success: false 
      }, { status: 500 });
    }
    
    // 10. 최종 응답
    return NextResponse.json({ 
      orderId: orderResult.orderId,
      orderNumber: orderResult.orderNumber,
      paymentInfo: {
        tid: paymentResult.tid,
        approvedAt: paymentResult.approvedAt,
        amount: paymentResult.amount
      },
      message: '결제 및 주문이 성공적으로 처리되었습니다.',
      success: true 
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('결제 처리 오류:', error);
    return NextResponse.json({ 
      error: '결제 처리 중 오류가 발생했습니다.',
      errorDetail: error.message,
      success: false 
    }, { status: 500 });
  }
}

// GET /api/payments/:tid - 결제 상태 조회
export async function GET(req: NextRequest) {
  try {
    // URL에서 거래 ID 추출
    const url = new URL(req.url);
    const tid = url.searchParams.get('tid');
    
    if (!tid) {
      return NextResponse.json({ 
        error: '거래 ID가 필요합니다.', 
        success: false 
      }, { status: 400 });
    }
    
    // 세션 확인
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ 
        error: '인증이 필요합니다.', 
        success: false 
      }, { status: 401 });
    }
    
    // 실제로는 이니시스 API를 호출하여 결제 상태 조회
    // 여기서는 모의 응답을 반환
    const paymentStatus = {
      tid: tid,
      status: 'PAID', // PAID, CANCELLED, PARTIAL_CANCELLED, FAILED 등
      payMethod: 'CARD',
      amount: 100000, // 실제로는 DB에서 조회
      orderNumber: 'ORD-TEST-123',
      approvedAt: new Date().toISOString(),
      pgProvider: 'INICIS'
    };
    
    return NextResponse.json({ 
      payment: paymentStatus,
      success: true 
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('결제 상태 조회 오류:', error);
    return NextResponse.json({ 
      error: '결제 상태 조회 중 오류가 발생했습니다.',
      errorDetail: error.message,
      success: false 
    }, { status: 500 });
  }
}

// 카드 발급사 추출 함수
function getCardIssuer(cardNumber: string): string {
  if (!cardNumber) return 'UNKNOWN';
  
  // 첫 자리로 카드사 구분 (간단한 예시)
  const firstDigit = cardNumber.charAt(0);
  
  switch (firstDigit) {
    case '3': 
      return 'AMEX';
    case '4': 
      return 'VISA';
    case '5': 
      return 'MASTERCARD';
    case '6': 
      return 'DISCOVER';
    case '9': 
      return 'HYUNDAI'; // 국내 카드사 예시
    default: 
      return 'OTHER';
  }
} 