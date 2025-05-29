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