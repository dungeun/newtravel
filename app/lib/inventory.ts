import { db } from './firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, runTransaction, Timestamp } from 'firebase/firestore';
import { Inventory } from '@/types/inventory';

const INVENTORY_COLLECTION = 'inventory';

// 재고 생성
export async function createInventory(inventory: Omit<Inventory, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, INVENTORY_COLLECTION), inventory);
  return docRef.id;
}

// 재고 단건 조회
export async function getInventoryById(id: string): Promise<Inventory | null> {
  const docRef = doc(db, INVENTORY_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Inventory;
}

// 특정 상품의 재고 목록 조회
export async function getInventoryByProduct(productId: string): Promise<Inventory[]> {
  const q = query(collection(db, INVENTORY_COLLECTION), where('productId', '==', productId), orderBy('date', 'asc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inventory));
}

// 재고 수정
export async function updateInventory(id: string, update: Partial<Inventory>): Promise<void> {
  const docRef = doc(db, INVENTORY_COLLECTION, id);
  await updateDoc(docRef, {
    ...update,
    updatedAt: new Date()
  });
}

// 재고 삭제
export async function deleteInventory(id: string): Promise<void> {
  const docRef = doc(db, INVENTORY_COLLECTION, id);
  await deleteDoc(docRef);
}

// 트랜잭션을 사용한 재고 감소 (주문 생성 시)
export async function decreaseInventory(inventoryId: string, quantity: number): Promise<boolean> {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const inventoryRef = doc(db, INVENTORY_COLLECTION, inventoryId);
      const inventoryDoc = await transaction.get(inventoryRef);
      
      if (!inventoryDoc.exists()) {
        throw new Error('재고 정보를 찾을 수 없습니다.');
      }
      
      const inventory = inventoryDoc.data() as Omit<Inventory, 'id'>;
      
      if (inventory.availableStock < quantity) {
        return false; // 재고 부족
      }
      
      const newAvailableStock = inventory.availableStock - quantity;
      const newReservedStock = inventory.reservedStock + quantity;
      
      transaction.update(inventoryRef, {
        availableStock: newAvailableStock,
        reservedStock: newReservedStock,
        updatedAt: Timestamp.now()
      });
      
      return true;
    });
    
    return result;
  } catch (error) {
    console.error('재고 감소 트랜잭션 오류:', error);
    return false;
  }
}

// 트랜잭션을 사용한 재고 복원 (주문 취소 시)
export async function restoreInventory(inventoryId: string, quantity: number): Promise<boolean> {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const inventoryRef = doc(db, INVENTORY_COLLECTION, inventoryId);
      const inventoryDoc = await transaction.get(inventoryRef);
      
      if (!inventoryDoc.exists()) {
        throw new Error('재고 정보를 찾을 수 없습니다.');
      }
      
      const inventory = inventoryDoc.data() as Omit<Inventory, 'id'>;
      const newAvailableStock = inventory.availableStock + quantity;
      const newReservedStock = Math.max(0, inventory.reservedStock - quantity);
      
      transaction.update(inventoryRef, {
        availableStock: newAvailableStock,
        reservedStock: newReservedStock,
        updatedAt: Timestamp.now()
      });
      
      return true;
    });
    
    return result;
  } catch (error) {
    console.error('재고 복원 트랜잭션 오류:', error);
    return false;
  }
} 