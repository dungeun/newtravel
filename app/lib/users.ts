import { db } from './firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { User } from '@/types/user';

const USERS_COLLECTION = 'users';

// 유저 생성
export async function createUser(user: Omit<User, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, USERS_COLLECTION), user);
  return docRef.id;
}

// 유저 단건 조회
export async function getUserById(id: string): Promise<User | null> {
  const docRef = doc(db, USERS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as User;
}

// 전체 유저 목록 조회
export async function getAllUsers(): Promise<User[]> {
  const q = query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
}

// 유저 수정
export async function updateUser(id: string, update: Partial<User>): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, id);
  await updateDoc(docRef, update);
}

// 유저 삭제
export async function deleteUser(id: string): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, id);
  await deleteDoc(docRef);
} 