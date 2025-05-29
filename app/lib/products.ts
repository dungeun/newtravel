import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc, orderBy, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { TravelProduct } from '../types/product';

const PRODUCTS_COLLECTION = 'products';

// 모든 상품 가져오기
export async function getAllProducts(): Promise<TravelProduct[]> {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error('상품 목록 가져오기 실패');
    }
    return response.json();
  } catch (error) {
    console.error('상품 목록 조회 오류:', error);
    return [];
  }
}

// 특정 ID의 상품 가져오기
export async function getProductById(productId: string): Promise<TravelProduct | null> {
  try {
    const response = await fetch(`/api/products/${productId}`);
    if (!response.ok) {
      throw new Error('상품 상세 정보 가져오기 실패');
    }
    return response.json();
  } catch (error) {
    console.error('상품 조회 오류:', error);
    return null;
  }
}

// 베스트셀러 상품 가져오기
export async function getBestSellerProducts(count: number = 6): Promise<TravelProduct[]> {
  const q = query(
    collection(db, PRODUCTS_COLLECTION),
    where("status", "==", "published"),
    where("isBestSeller", "==", true),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as TravelProduct));
}

// 타임딜 상품 가져오기
export async function getTimeDealProducts(count: number = 6): Promise<TravelProduct[]> {
  const q = query(
    collection(db, PRODUCTS_COLLECTION),
    where("status", "==", "published"),
    where("isTimeDeal", "==", true),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as TravelProduct));
}

// 상품 이미지 업로드
export async function uploadProductImage(file: File, productId: string, index: number): Promise<string> {
  const fileExtension = file.name.split('.').pop();
  const fileName = `${productId}_${index}.${fileExtension}`;
  const storageRef = ref(storage, `products/${fileName}`);
  
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// 상품 생성
export async function createProduct(productData: Partial<TravelProduct>): Promise<{ productId: string } | null> {
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
      throw new Error('상품 생성 실패');
    }
    
    return response.json();
  } catch (error) {
    console.error('상품 생성 오류:', error);
    return null;
  }
}

// 상품 업데이트
export async function updateProduct(productId: string, productData: Partial<TravelProduct>): Promise<TravelProduct | null> {
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
      throw new Error('상품 업데이트 실패');
    }
    
    return response.json();
  } catch (error) {
    console.error('상품 업데이트 오류:', error);
    return null;
  }
}

// 상품 삭제
export async function deleteProduct(productId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
    });
    
    return response.ok;
  } catch (error) {
    console.error('상품 삭제 오류:', error);
    return false;
  }
}

// 카테고리별 상품 가져오기
export async function getProductsByCategory(categoryId: string): Promise<TravelProduct[]> {
  const q = query(
    collection(db, PRODUCTS_COLLECTION),
    where("status", "==", "published"),
    where("categories", "array-contains", categoryId),
    orderBy("createdAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as TravelProduct));
}

// 지역별 상품 가져오기
export async function getProductsByRegion(region: string): Promise<TravelProduct[]> {
  const q = query(
    collection(db, PRODUCTS_COLLECTION),
    where("status", "==", "published"),
    where("region", "==", region),
    orderBy("createdAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as TravelProduct));
} 