import { NextAuthOptions } from 'next-auth';
import { FirestoreAdapter } from '@next-auth/firebase-adapter';
import { cert } from 'firebase-admin/app';

// NextAuth 설정
export const authOptions: NextAuthOptions = {
  adapter: process.env.FIREBASE_PROJECT_ID ? FirestoreAdapter({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
    }),
  }) : undefined,
  providers: [
    // 여기에 OAuth 프로바이더들을 추가할 수 있습니다
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || 'user';
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};

// 임시 인증 함수입니다. 실제로는 NextAuth 또는 다른 인증 서비스를 사용해야 합니다.
export async function auth() {
  // 임시로 인증된 사용자를 반환합니다.
  return {
    user: {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
    }
  };
} 