import { auth, db } from './config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

// Firebase Auth 인스턴스를 내보냅니다
export const firebaseAuth = auth;

export interface UserRole {
  role: string;
  level: number;
  name: string;
  email: string;
}

export async function getUserRole(user: User): Promise<UserRole | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserRole;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
}

export async function setUserRole(user: User, role: UserRole) {
  try {
    await setDoc(doc(db, 'users', user.uid), {
      role: role.role,
      level: role.level,
      name: user.displayName || role.name,
      email: user.email || role.email,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error setting user role:', error);
    throw error;
  }
}

export async function createUserWithRole(user: User) {
  const userRole: UserRole = {
    role: 'user', // 기본 역할은 'user'로 설정
    level: 1, // 기본 레벨은 1로 설정
    name: user.displayName || '',
    email: user.email || '',
  };
  await setUserRole(user, userRole);
  return userRole;
}
