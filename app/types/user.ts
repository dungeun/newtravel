// 유저 타입
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  role: 'user' | 'admin' | 'manager';
  createdAt: Date | string;
  updatedAt: Date | string;
  lastLoginAt?: Date | string;
  isActive: boolean;
} 