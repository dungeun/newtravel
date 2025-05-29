import { db } from './firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { ProductCategory } from '@/types/category';

const CATEGORIES_COLLECTION = 'categories';

// 카테고리 생성
export async function createCategory(category: Omit<ProductCategory, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), category);
  return docRef.id;
}

// 카테고리 단건 조회
export async function getCategoryById(id: string): Promise<ProductCategory | null> {
  const docRef = doc(db, CATEGORIES_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as ProductCategory;
}

// 전체 카테고리 목록 조회
export async function getAllCategories(): Promise<ProductCategory[]> {
  const q = query(collection(db, CATEGORIES_COLLECTION), orderBy('order', 'asc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductCategory));
}

// 카테고리 수정
export async function updateCategory(id: string, update: Partial<ProductCategory>): Promise<void> {
  const docRef = doc(db, CATEGORIES_COLLECTION, id);
  await updateDoc(docRef, update);
}

// 카테고리 삭제
export async function deleteCategory(id: string): Promise<void> {
  const docRef = doc(db, CATEGORIES_COLLECTION, id);
  await deleteDoc(docRef);
} 