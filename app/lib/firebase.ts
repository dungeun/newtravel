// Firebase 설정
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase 구성 정보
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef123456',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-XXXXXXXXXX'
};

// 프로덕션 환경에서만 환경변수 체크
if (process.env.NODE_ENV === 'production') {
  for (const [key, value] of Object.entries(firebaseConfig)) {
    if (!value || value.startsWith('demo-')) {
      console.error(`[Firebase] 환경변수 누락: ${key}`);
      throw new Error(`[Firebase] 환경변수 누락: ${key}`);
    }
  }
}

// Firebase 앱 초기화 (이미 초기화되지 않았을 경우에만)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Firebase 서비스 내보내기
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app; 