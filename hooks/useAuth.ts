import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: 실제 인증 로직으로 대체
    const fetchUser = async () => {
      try {
        // 임시 사용자 데이터
        const mockUser: User = {
          id: '1',
          name: '테스트 사용자',
          email: 'test@example.com',
          avatar: '/placeholder-user.jpg',
        };
        setUser(mockUser);
      } catch (error) {
        console.error('사용자 인증 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    // TODO: 실제 로그인 로직 구현
    return { success: true };
  };

  const logout = async () => {
    // TODO: 실제 로그아웃 로직 구현
    setUser(null);
    return { success: true };
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
