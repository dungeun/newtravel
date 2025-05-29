// 결제 관련 페이지 라우팅 설정 (Next.js 13+ App Router)
// 이 설정은 page.js에서 직접 내보내는 방식으로 대체되었습니다.
// 이 파일은 이제 사용되지 않을 수 있으며, page.js에서 직접 설정을 내보내는 방식을 권장합니다.

export const paymentConfig = {
  // 결제 관련 설정 값들
  paymentMethods: ['kakao', 'card', 'bank_transfer'],
  currency: 'KRW',
  // 기타 결제 관련 설정
};
