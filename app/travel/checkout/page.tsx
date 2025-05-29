"use client";

import CheckoutLayout from './components/CheckoutLayout';

export default function CheckoutPage() {
  return <CheckoutLayout />;
}
// 카드 발급사 이름 추출 함수
function getCardIssuerName(firstDigit: string): string {
  switch (firstDigit) {
    case '3': return 'AMEX';
    case '4': return 'VISA';
    case '5': return 'MASTER';
    case '6': return 'DISCOVER';
    case '9': return '현대카드';
    default: return '카드';
  }
} 