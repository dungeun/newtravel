'use client';

import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// 클라이언트 사이드에서만 analytics 가져오기
let analytics = null;

// 환경 변수에서 Firebase 설정 가져오기
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDDYRt630hao8lYxTzJ_zYaCZaB2r3xAmU",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "codebcms-c1934.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "codebcms-c1934",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "codebcms-c1934.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "368480453510",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:368480453510:web:9b42daa71ca876c88ca207",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-CGBK6ZFPWN",
};

// 설정 로그 출력
console.log('Firebase 설정:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '설정됨' : '미설정',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '설정됨' : '미설정',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '설정됨' : '미설정',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '설정됨' : '미설정',
});

// Firebase 초기화 (싱글톤 패턴)
let app: FirebaseApp | undefined = undefined;
if (typeof window !== 'undefined') {
  try {
    if (!getApps().length) {
      console.log('Firebase 앱 초기화 시작');
      app = initializeApp(firebaseConfig);
      console.log('Firebase 앱 초기화 완료');
    } else {
      app = getApp();
      console.log('Firebase 앱 재사용');
    }

    // Analytics는 클라이언트 사이드에서만 초기화
    try {
      const { getAnalytics } = require('firebase/analytics');
      if (app) {
        analytics = getAnalytics(app);
        console.log('Firebase Analytics 초기화 완료');
      }
    } catch (error) {
      console.error('Analytics could not be loaded', error);
    }
  } catch (error) {
    console.error('Firebase 초기화 오류:', error);
  }
}

// 서버 사이드에서는 빈 객체를 반환하도록 수정
// auth와 db는 항상 존재하는 인스턴스로 가정하고 사용
const auth: Auth = typeof window !== 'undefined' && app ? getAuth(app) : {} as Auth;
const db: Firestore = typeof window !== 'undefined' && app ? getFirestore(app) : {} as Firestore;

// Storage 초기화
let storage: FirebaseStorage;
if (typeof window !== 'undefined' && app) {
  try {
    console.log('Firebase Storage 초기화 시작');
    storage = getStorage(app);
    
    // Storage 버킷 정보 확인
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket;
    console.log('Firebase Storage 초기화 완료 - 버킷:', storageBucket);
    
    // 인증 상태 확인
    const currentUser = auth.currentUser;
    console.log('Firebase 인증 상태:', currentUser ? '로그인 됨' : '로그인 안됨');
    
    // 게스트 인증 상태로 설정 (개발 환경용)
    if (!currentUser) {
      console.log('게스트 인증 상태로 설정 (개발 환경용)');
    }
  } catch (error) {
    console.error('Firebase Storage 초기화 오류:', error);
    storage = {} as FirebaseStorage;
  }
} else {
  storage = {} as FirebaseStorage;
}

export { app, auth, db, analytics, storage };
