import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/firebase/config';
import { 
  getDoc, 
  doc,
  collection,
  getDocs,
  query,
  where,
  setDoc
} from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';

// Firebase가 초기화되어 있지 않으면 초기화합니다
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Firebase 초기화
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

// Auth 인스턴스 가져오기
const auth = getAuth();

// 테스트용 사용자 (실제 환경에서는 제거해야 합니다)
const testUsers = [
  {
    id: 'admin-user-1',  // 이메일이 아닌 고유 ID 사용
    email: 'admin@example.com',
    name: '관리자',
    password: 'admin1234',
    role: 'admin',
  },
  {
    id: 'normal-user-1',  // 이메일이 아닌 고유 ID 사용
    email: 'user@example.com',
    name: '일반 사용자',
    password: 'user1234',
    role: 'user',
  }
];

// 로그인 처리 핸들러
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Firebase',
      credentials: {
        email: { label: '이메일', type: 'email', placeholder: 'example@example.com' },
        password: { label: '비밀번호', type: 'password' },
        firebaseUid: { label: 'Firebase UID', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('NextAuth: 이메일 또는 비밀번호 누락');
          return null;
        }
        
        // Firebase Google 인증 후 로그인 처리
        if (credentials.password === 'firebase-google-auth' && credentials.firebaseUid) {
          console.log('NextAuth: Firebase Google 인증 후 로그인 처리', credentials.email);
          
          try {
            // Firestore에서 사용자 정보 가져오기
            const userDoc = await getDoc(doc(db, 'users', credentials.firebaseUid as string));
            let userData = null;
            
            if (userDoc.exists()) {
              userData = userDoc.data();
              console.log('NextAuth: Firebase Google 인증 사용자 정보 조회 성공', userData.role);
            } else {
              // 사용자 정보가 없는 경우 기본 사용자로 생성
              userData = {
                role: 'user',
                name: credentials.email.split('@')[0],
                email: credentials.email,
              };
              
              // 사용자 정보 저장
              await setDoc(doc(db, 'users', credentials.firebaseUid as string), {
                ...userData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
              
              console.log('NextAuth: Firebase Google 인증 사용자 생성 성공');
            }
            
            return {
              id: credentials.firebaseUid as string,
              email: credentials.email,
              name: userData.name,
              image: userData.image,
              role: userData.role || 'user',
            };
          } catch (error) {
            console.error('NextAuth: Firebase Google 인증 사용자 처리 오류', error);
            return null;
          }
        }

        try {
          // 테스트 계정으로 로그인 시도 (개발 환경에서만)
          if (process.env.NODE_ENV === 'development') {
            const testUser = testUsers.find(user => 
              user.email === credentials.email && user.password === credentials.password
            );
            
            if (testUser) {
              console.log('NextAuth: 테스트 계정으로 로그인 성공', testUser.email, testUser.role, 'ID:', testUser.id);
              return {
                id: testUser.id,  // 이메일이 아닌 고유 ID 사용
                email: testUser.email,
                name: testUser.name,
                role: testUser.role,
              };
            }
          }
          
          // Firebase Authentication으로 로그인
          console.log('NextAuth: Firebase 인증 시도', credentials.email);
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );

          if (!userCredential.user) {
            console.log('NextAuth: Firebase 인증 성공했으나 사용자 정보 없음');
            return null;
          }
          
          const userId = userCredential.user.uid;
          console.log('NextAuth: Firebase 인증 성공', userCredential.user.email, 'ID:', userId);

          // Firestore에서 추가 사용자 정보 가져오기
          let userData = null;
          
          if (db) {
            console.log('NextAuth: Firestore에서 사용자 정보 조회', userId);
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
              userData = userDoc.data();
              console.log('NextAuth: Firestore 사용자 정보 조회 성공', userData.role, 'ID:', userId);
            } else {
              console.log('NextAuth: Firestore에 사용자 정보 없음');
            }
          }
          
          if (!userData) {
            console.log('NextAuth: 기본 사용자 정보로 응답', 'ID:', userId);
            return {
              id: userId, // Firebase User UID 사용
              email: userCredential.user.email,
              name: userCredential.user.displayName,
              role: 'user', // 기본 역할
            };
          }

          console.log('NextAuth: 사용자 정보와 역할 응답', userData.role, 'ID:', userId);
          return {
            id: userId, // Firebase User UID 사용
            email: userCredential.user.email,
            name: userData.name || userCredential.user.displayName,
            image: userData.image || userCredential.user.photoURL,
            role: userData.role || 'user', // 사용자 역할
          };
        } catch (error: any) {
          console.error('NextAuth: Firebase 인증 오류', error.message);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Firebase에 사용자 정보 저장 또는 업데이트
          if (db && user.id) {
            const userRef = doc(db, 'users', user.id);
            const userDoc = await getDoc(userRef);
            
            if (!userDoc.exists()) {
              // 새 사용자 생성
              await setDoc(userRef, {
                name: user.name,
                email: user.email,
                image: user.image,
                role: 'user',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            } else {
              // 기존 사용자 정보 업데이트
              const userData = userDoc.data();
              await setDoc(userRef, {
                ...userData,
                name: user.name,
                email: user.email,
                image: user.image,
                updatedAt: new Date().toISOString(),
              }, { merge: true });
            }
          }
          return true;
        } catch (error) {
          console.error('Google 로그인 후 사용자 정보 저장 오류:', error);
          return true; // 오류가 있어도 로그인은 허용
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      console.log('NextAuth 콜백: jwt 처리 시작');
      console.log('NextAuth 콜백: jwt 토큰 현재 값', { id: token.id, role: token.role });
      console.log('NextAuth 콜백: jwt user 파라미터', user ? { id: user.id, role: user.role } : '없음');
      
      if (user) {
        // 사용자 데이터가 있으면 토큰에 추가 정보를 저장합니다
        token.role = user.role as string;
        token.id = user.id;
        console.log('NextAuth 콜백: jwt 토큰에 역할 추가', token.role, 'ID:', token.id);
      }
      
      console.log('NextAuth 콜백: jwt 처리 완료', { id: token.id, role: token.role });
      return token;
    },
    async session({ session, token }) {
      console.log('NextAuth 콜백: 세션 처리 시작');
      console.log('NextAuth 콜백: 세션 현재 값', session.user ? { id: session.user.id, role: session.user.role } : '사용자 정보 없음');
      console.log('NextAuth 콜백: 세션 토큰 값', { id: token.id, role: token.role });
      
      if (token && session.user) {
        // 토큰에서 세션으로 정보를 복사합니다
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        console.log('NextAuth 콜백: 세션에 ID와 역할 추가됨', session.user.id, session.user.role);
      }
      
      console.log('NextAuth 콜백: 세션 처리 완료');
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  secret: process.env.NEXTAUTH_SECRET || 'd81ef9fc5f96ca44ba3a3e7e26bb385ab71686d70cf11a69f69b99c0b8c0c28e',
  debug: process.env.NODE_ENV === 'development',
  theme: {
    logo: '/img/logo.png', // 로고 경로 추가
    brandColor: '#4285F4', // 브랜드 색상
    colorScheme: 'auto' // 자동 색상 스킴 (라이트/다크 모드)
  }
};

// 콘솔에 환경 변수 값 출력 (디버깅 용도)
console.log('NextAuth 설정: NEXTAUTH_SECRET 환경변수 확인:', process.env.NEXTAUTH_SECRET ? '설정됨' : '미설정');
console.log('NextAuth 설정: 개발 환경 여부', process.env.NODE_ENV === 'development' ? '개발 환경' : '프로덕션 환경');

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 