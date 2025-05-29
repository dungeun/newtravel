import { db } from "@/app/firebase/config";
import { 
  doc, collection, query, where, orderBy, limit, 
  getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  arrayUnion, arrayRemove, writeBatch, Timestamp,
  DocumentReference, DocumentData, WhereFilterOp, QueryConstraint
} from "firebase/firestore";

/**
 * 장바구니 항목 타입
 */
export interface CartItem {
  id: string;
  productId: string;
  title: string;
  mainImage: string;
  price: number;
  quantity: number;
  options?: {
    adult: number;
    child: number;
    infant: number;
  };
  dates?: {
    startDate: Timestamp;
    endDate: Timestamp;
  };
  addedAt?: Timestamp;
  updatedAt?: Timestamp;
  [key: string]: any;
}

/**
 * 제품 타입
 */
export interface Product {
  id: string;
  title: string;
  shortDescription?: string;
  description?: string;
  price?: {
    adult: number;
    child: number;
    infant: number;
    currency: string;
  };
  mainImage?: {
    url: string;
    alt: string;
  };
  status?: string;
  region?: string;
  [key: string]: any;
}

/**
 * 주문 항목 타입
 */
export interface OrderItem {
  id: string;
  productId: string;
  title: string;
  mainImage: string;
  price: number;
  quantity: number;
  options?: {
    adult: number;
    child: number;
    infant: number;
  };
  dates?: {
    startDate: Timestamp;
    endDate: Timestamp;
  };
  [key: string]: any;
}

/**
 * 고객 정보 타입
 */
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  [key: string]: any;
}

/**
 * 제품 컬렉션 참조 가져오기
 */
export const productsCollection = collection(db, "products");

/**
 * 사용자 컬렉션 참조 가져오기
 */
export const usersCollection = collection(db, "users");

/**
 * 주문 컬렉션 참조 가져오기
 */
export const ordersCollection = collection(db, "orders");

/**
 * 카테고리 컬렉션 참조 가져오기
 */
export const categoriesCollection = collection(db, "categories");

/**
 * 프로모션 컬렉션 참조 가져오기
 */
export const promotionsCollection = collection(db, "promotions");

/**
 * 특정 사용자의 장바구니 문서 참조 가져오기
 */
export const getUserCartRef = (userId: string) => {
  return doc(db, "carts", userId);
};

/**
 * 특정 사용자의 장바구니 항목 컬렉션 참조 가져오기
 */
export const getUserCartItemsRef = (userId: string) => {
  return collection(db, "carts", userId, "items");
};

/**
 * 특정 제품의 리뷰 컬렉션 참조 가져오기
 */
export const getProductReviewsRef = (productId: string) => {
  return collection(db, "products", productId, "reviews");
};

/**
 * 특정 제품의 이미지 컬렉션 참조 가져오기
 */
export const getProductImagesRef = (productId: string) => {
  return collection(db, "products", productId, "images");
};

/**
 * 특정 제품의 일정 컬렉션 참조 가져오기
 */
export const getProductItineraryRef = (productId: string) => {
  return collection(db, "products", productId, "itinerary");
};

/**
 * 특정 제품의 재고 컬렉션 참조 가져오기
 */
export const getProductInventoryRef = (productId: string) => {
  return collection(db, "products", productId, "inventory");
};

/**
 * 특정 주문의 항목 컬렉션 참조 가져오기
 */
export const getOrderItemsRef = (orderId: string) => {
  return collection(db, "orders", orderId, "items");
};

/**
 * 특정 주문의 이력 컬렉션 참조 가져오기
 */
export const getOrderHistoryRef = (orderId: string) => {
  return collection(db, "orders", orderId, "history");
};

/**
 * 표준화된 쿼리 생성 함수
 * @param collectionRef 컬렉션 참조
 * @param filters 필터 배열 [필드, 연산자, 값]
 * @param sorts 정렬 배열 [필드, 방향]
 * @param limitCount 결과 제한 수
 */
export const createQuery = (
  collectionRef: any,
  filters: [string, WhereFilterOp, any][] = [],
  sorts: [string, "asc" | "desc"][] = [],
  limitCount?: number
) => {
  const constraints: QueryConstraint[] = [];
  
  // 필터 추가
  filters.forEach(([field, operator, value]) => {
    constraints.push(where(field, operator, value));
  });
  
  // 정렬 추가
  sorts.forEach(([field, direction]) => {
    constraints.push(orderBy(field, direction));
  });
  
  // 결과 제한 추가
  if (limitCount) {
    constraints.push(limit(limitCount));
  }
  
  return query(collectionRef, ...constraints);
};

/**
 * 공개된 제품 가져오기 (최신순)
 * @param limitCount 결과 제한 수
 */
export const getPublishedProducts = async (limitCount = 20): Promise<Product[]> => {
  const q = createQuery(
    productsCollection,
    [["status", "==", "published"]],
    [["createdAt", "desc"]],
    limitCount
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Product));
};

/**
 * 카테고리별 제품 가져오기
 * @param categoryId 카테고리 ID
 * @param limitCount 결과 제한 수
 */
export const getProductsByCategory = async (categoryId: string, limitCount = 20): Promise<Product[]> => {
  const q = createQuery(
    productsCollection,
    [
      ["status", "==", "published"],
      ["categoryIds", "array-contains", categoryId]
    ],
    [["createdAt", "desc"]],
    limitCount
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Product));
};

/**
 * 지역별 제품 가져오기
 * @param region 지역명
 * @param sortBy 정렬 기준
 * @param limitCount 결과 제한 수
 */
export const getProductsByRegion = async (
  region: string, 
  sortBy: "createdAt" | "price.adult" = "createdAt", 
  direction: "asc" | "desc" = "desc",
  limitCount = 20
): Promise<Product[]> => {
  const q = createQuery(
    productsCollection,
    [
      ["status", "==", "published"],
      ["region", "==", region]
    ],
    [[sortBy, direction]],
    limitCount
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Product));
};

/**
 * 사용자의 장바구니 항목 가져오기
 * @param userId 사용자 ID
 */
export const getUserCartItems = async (userId: string): Promise<CartItem[]> => {
  const cartItemsRef = getUserCartItemsRef(userId);
  const snapshot = await getDocs(cartItemsRef);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as CartItem));
};

/**
 * 장바구니에 항목 추가하기
 * @param userId 사용자 ID
 * @param product 제품 정보
 * @param quantity 수량
 * @param options 옵션
 */
export const addToCart = async (
  userId: string,
  product: Product,
  quantity: number,
  options: {
    adult: number;
    child: number;
    infant: number;
  },
  dates?: {
    startDate: Date;
    endDate: Date;
  }
): Promise<CartItem> => {
  const cartRef = getUserCartRef(userId);
  const cartItemsRef = getUserCartItemsRef(userId);
  
  // 장바구니 문서가 없으면 생성
  const cartDoc = await getDoc(cartRef);
  if (!cartDoc.exists()) {
    await updateDoc(cartRef, {
      id: userId,
      lastUpdated: Timestamp.now(),
      itemCount: 0,
      subtotal: 0,
      discountAmount: 0,
      total: 0
    });
  }
  
  // 장바구니 항목 추가
  const newItem: CartItem = {
    id: '', // 생성될 때 ID가 할당됨
    productId: product.id,
    title: product.title,
    mainImage: product.mainImage?.url || "",
    price: product.price?.adult || 0,
    quantity,
    options,
    dates: dates ? {
      startDate: Timestamp.fromDate(dates.startDate),
      endDate: Timestamp.fromDate(dates.endDate)
    } : undefined,
    addedAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  
  const docRef = await addDoc(cartItemsRef, newItem);
  
  // 장바구니 문서 업데이트 (합계 및 항목 수)
  const allItems = await getUserCartItems(userId);
  const itemCount = allItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = allItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  await updateDoc(cartRef, {
    lastUpdated: Timestamp.now(),
    itemCount,
    subtotal,
    total: subtotal // 할인 로직 구현 시 반영
  });
  
  return {
    ...newItem,
    id: docRef.id
  };
};

/**
 * 장바구니에서 항목 제거하기
 * @param userId 사용자 ID
 * @param cartItemId 장바구니 항목 ID
 */
export const removeFromCart = async (userId: string, cartItemId: string) => {
  const cartRef = getUserCartRef(userId);
  const cartItemRef = doc(db, "carts", userId, "items", cartItemId);
  
  await deleteDoc(cartItemRef);
  
  // 장바구니 문서 업데이트 (합계 및 항목 수)
  const allItems = await getUserCartItems(userId);
  const itemCount = allItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = allItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  await updateDoc(cartRef, {
    lastUpdated: Timestamp.now(),
    itemCount,
    subtotal,
    total: subtotal // 할인 로직 구현 시 반영
  });
  
  return { success: true };
};

/**
 * 사용자의 주문 가져오기
 * @param userId 사용자 ID
 * @param limitCount 결과 제한 수
 */
export const getUserOrders = async (userId: string, limitCount = 10) => {
  const q = createQuery(
    ordersCollection,
    [["userId", "==", userId]],
    [["createdAt", "desc"]],
    limitCount
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/**
 * 주문 생성하기
 * @param userId 사용자 ID
 * @param customer 고객 정보
 * @param cartItems 장바구니 항목
 * @param paymentMethod 결제 방법
 */
export const createOrder = async (
  userId: string,
  customer: Customer,
  cartItems: CartItem[],
  paymentMethod: string
) => {
  // 배치 작업으로 여러 문서 업데이트
  const batch = writeBatch(db);
  
  // 주문 문서 생성
  const orderRef = doc(ordersCollection);
  const orderId = orderRef.id;
  
  // 주문 합계 계산
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discountAmount = 0; // 할인 로직 구현 시 반영
  const tax = 0; // 세금 로직 구현 시 반영
  const total = subtotal - discountAmount + tax;
  
  const orderData = {
    id: orderId,
    userId,
    orderNumber: `ORD-${orderId.substring(0, 8).toUpperCase()}`,
    status: "pending",
    
    paymentStatus: "pending",
    paymentMethod,
    paymentId: "",
    
    subtotal,
    discountAmount,
    tax,
    total,
    
    customer,
    
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    completedAt: null
  };
  
  batch.set(orderRef, orderData);
  
  // 주문 항목 생성
  const orderItemsRef = getOrderItemsRef(orderId);
  cartItems.forEach(item => {
    const itemRef = doc(orderItemsRef);
    batch.set(itemRef, {
      id: itemRef.id,
      productId: item.productId,
      title: item.title,
      mainImage: item.mainImage,
      price: item.price,
      quantity: item.quantity,
      options: item.options,
      dates: item.dates
    });
  });
  
  // 주문 이력 생성
  const historyRef = doc(getOrderHistoryRef(orderId));
  batch.set(historyRef, {
    id: historyRef.id,
    status: "pending",
    timestamp: Timestamp.now(),
    note: "주문 생성됨",
    performedBy: "system"
  });
  
  // 사용자 문서 업데이트 (주문 수, 총 지출)
  const userRef = doc(usersCollection, userId);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    const userData = userDoc.data();
    batch.update(userRef, {
      orderCount: (userData.orderCount || 0) + 1,
      totalSpent: (userData.totalSpent || 0) + total
    });
  }
  
  // 장바구니 비우기
  const cartItemsRef = getUserCartItemsRef(userId);
  const cartItemsSnapshot = await getDocs(cartItemsRef);
  cartItemsSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  // 장바구니 문서 업데이트
  const cartRef = getUserCartRef(userId);
  batch.update(cartRef, {
    lastUpdated: Timestamp.now(),
    itemCount: 0,
    subtotal: 0,
    discountAmount: 0,
    total: 0
  });
  
  // 배치 커밋
  await batch.commit();
  
  return orderData;
};

/**
 * 제품에 리뷰 추가하기
 * @param productId 제품 ID
 * @param userId 사용자 ID
 * @param userName 사용자 이름
 * @param userAvatar 사용자 아바타
 * @param rating 평점
 * @param comment 리뷰 내용
 */
export const addProductReview = async (
  productId: string,
  userId: string,
  userName: string,
  userAvatar: string,
  rating: number,
  comment: string
) => {
  const batch = writeBatch(db);
  
  // 리뷰 추가
  const reviewsRef = getProductReviewsRef(productId);
  const reviewRef = doc(reviewsRef);
  const reviewData = {
    id: reviewRef.id,
    userId,
    userName,
    userAvatar,
    rating,
    comment,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  
  batch.set(reviewRef, reviewData);
  
  // 제품 문서의 평점 정보 업데이트
  const productRef = doc(productsCollection, productId);
  const productDoc = await getDoc(productRef);
  
  if (productDoc.exists()) {
    const productData = productDoc.data();
    const currentReviewCount = productData.reviewCount || 0;
    const currentAverageRating = productData.averageRating || 0;
    
    // 새로운 평균 평점 계산
    const newReviewCount = currentReviewCount + 1;
    const newAverageRating = 
      ((currentAverageRating * currentReviewCount) + rating) / newReviewCount;
    
    batch.update(productRef, {
      reviewCount: newReviewCount,
      averageRating: newAverageRating
    });
  }
  
  await batch.commit();
  
  return reviewData;
};

/**
 * 주문 상태 업데이트
 * @param orderId 주문 ID
 * @param newStatus 새 상태
 * @param note 메모
 * @param performedBy 수행자
 */
export const updateOrderStatus = async (
  orderId: string,
  newStatus: string,
  note: string,
  performedBy: string
) => {
  const orderRef = doc(ordersCollection, orderId);
  const historyRef = getOrderHistoryRef(orderId);
  
  const batch = writeBatch(db);
  
  // 주문 상태 업데이트
  batch.update(orderRef, {
    status: newStatus,
    updatedAt: Timestamp.now(),
    ...(newStatus === "completed" ? { completedAt: Timestamp.now() } : {})
  });
  
  // 이력 추가
  const historyDoc = doc(historyRef);
  batch.set(historyDoc, {
    id: historyDoc.id,
    status: newStatus,
    timestamp: Timestamp.now(),
    note,
    performedBy
  });
  
  await batch.commit();
  
  return { success: true };
};

/**
 * 베스트셀러 제품 가져오기
 * @param limitCount 결과 제한 수
 */
export const getBestSellerProducts = async (limitCount = 10): Promise<Product[]> => {
  const q = createQuery(
    productsCollection,
    [
      ["status", "==", "published"],
      ["isBestSeller", "==", true]
    ],
    [["createdAt", "desc"]],
    limitCount
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Product));
};

/**
 * 타임딜 제품 가져오기
 * @param limitCount 결과 제한 수
 */
export const getTimeDealProducts = async (limitCount = 10): Promise<Product[]> => {
  const q = createQuery(
    productsCollection,
    [
      ["status", "==", "published"],
      ["isTimeDeal", "==", true]
    ],
    [["createdAt", "desc"]],
    limitCount
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Product));
};

/**
 * 특정 날짜에 이용 가능한 제품 가져오기
 * @param date 날짜
 * @param limitCount 결과 제한 수
 */
export const getAvailableProductsForDate = async (date: Date, limitCount = 20): Promise<Product[]> => {
  const dateTimestamp = Timestamp.fromDate(date);
  const dayName = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][date.getDay()];
  
  const q = createQuery(
    productsCollection,
    [
      ["status", "==", "published"],
      ["availableFrom", "<=", dateTimestamp],
      ["availableTo", ">=", dateTimestamp],
      ["availableDays", "array-contains", dayName]
    ],
    [["createdAt", "desc"]],
    limitCount
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Product));
}; 