import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import KakaoProvider from 'next-auth/providers/kakao';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_SECRET || '',
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_ID || '',
      clientSecret: process.env.KAKAO_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    async session({ session, token }) {
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
});
