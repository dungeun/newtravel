import { Timestamp } from 'firebase/firestore';

/**
 * Firestore Timestamp를 한국어 날짜 문자열로 변환
 */
export function formatDate(timestamp: Timestamp | null): string {
  if (!timestamp) return '-';
  return timestamp.toDate().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
} 