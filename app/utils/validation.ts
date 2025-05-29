import { z } from 'zod';

// 로그인 폼 검증 스키마
export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요.'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
});

// 회원가입 폼 검증 스키마
export const signupSchema = z.object({
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.'),
  email: z.string().email('올바른 이메일 주소를 입력해주세요.'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
  confirmPassword: z.string().min(6, '비밀번호 확인은 최소 6자 이상이어야 합니다.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다.',
  path: ['confirmPassword'],
});

// 결제 정보 검증 스키마
export const paymentSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, '유효한 카드번호 16자리를 입력해주세요.'),
  cardHolder: z.string().min(2, '카드 소유자 이름을 입력해주세요.'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, '유효기간을 MM/YY 형식으로 입력해주세요.'),
  cvv: z.string().regex(/^\d{3}$/, '3자리 CVV 번호를 입력해주세요.'),
});

// 여행 예약 정보 검증 스키마
export const bookingSchema = z.object({
  travelDate: z.date({
    required_error: '여행 날짜를 선택해주세요.',
    invalid_type_error: '올바른 날짜 형식이 아닙니다.',
  }),
  adultCount: z.number().min(1, '성인은 최소 1명 이상이어야 합니다.').max(10, '성인은 최대 10명까지 가능합니다.'),
  childCount: z.number().min(0, '유효한 숫자를 입력해주세요.').max(10, '아동은 최대 10명까지 가능합니다.'),
  specialRequests: z.string().optional(),
});

// 장바구니 항목 검증 스키마
export const cartItemSchema = z.object({
  productId: z.string().nonempty('상품 ID가 필요합니다.'),
  quantity: z.number().min(1, '최소 1개 이상 선택해주세요.'),
  options: z.record(z.string()).optional(),
});

// 주소 정보 검증 스키마
export const addressSchema = z.object({
  recipientName: z.string().min(2, '수령인 이름을 입력해주세요.'),
  phoneNumber: z.string().regex(/^\d{2,3}-\d{3,4}-\d{4}$/, '올바른 전화번호 형식을 입력해주세요.'),
  zipCode: z.string().regex(/^\d{5}$/, '올바른 우편번호 5자리를 입력해주세요.'),
  address1: z.string().min(5, '주소를 입력해주세요.'),
  address2: z.string().optional(),
});

// export 타입 정의 (TypeScript와 함께 사용)
export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type PaymentFormValues = z.infer<typeof paymentSchema>;
export type BookingFormValues = z.infer<typeof bookingSchema>;
export type CartItemValues = z.infer<typeof cartItemSchema>;
export type AddressFormValues = z.infer<typeof addressSchema>; 