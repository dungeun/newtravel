import { db } from './firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Promotion } from '@/types/promotion';

const PROMOTIONS_COLLECTION = 'promotions';

// 프로모션 생성
export async function createPromotion(promotion: Omit<Promotion, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, PROMOTIONS_COLLECTION), promotion);
  return docRef.id;
}

// 프로모션 단건 조회
export async function getPromotionById(id: string): Promise<Promotion | null> {
  const docRef = doc(db, PROMOTIONS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Promotion;
}

// 전체 프로모션 목록 조회
export async function getAllPromotions(): Promise<Promotion[]> {
  const q = query(collection(db, PROMOTIONS_COLLECTION), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Promotion));
}

// 프로모션 수정
export async function updatePromotion(id: string, update: Partial<Promotion>): Promise<void> {
  const docRef = doc(db, PROMOTIONS_COLLECTION, id);
  await updateDoc(docRef, update);
}

// 프로모션 삭제
export async function deletePromotion(id: string): Promise<void> {
  const docRef = doc(db, PROMOTIONS_COLLECTION, id);
  await deleteDoc(docRef);
} 