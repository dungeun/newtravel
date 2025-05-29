'use client';

import { useState, useEffect } from 'react';
import { 
  getPublishedProducts, 
  getProductsByCategory, 
  getProductsByRegion,
  getBestSellerProducts, 
  getTimeDealProducts,
  getUserCartItems,
  addToCart,
  removeFromCart,
  getUserOrders,
  createOrder,
  addProductReview,
  updateOrderStatus,
  getAvailableProductsForDate,
  Product,
  CartItem
} from './utils';
import { Timestamp } from 'firebase/firestore';

/**
 * 여행 상품 목록 예제 컴포넌트
 */
export function ProductListExample() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        // 게시된 상품 목록 가져오기 (최신순 20개)
        const data = await getPublishedProducts(20);
        setProducts(data);
      } catch (err) {
        setError('상품을 불러오는 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, []);
  
  // 특정 카테고리의 상품 가져오기
  async function handleCategoryClick(categoryId: string) {
    try {
      setLoading(true);
      const data = await getProductsByCategory(categoryId);
      setProducts(data);
    } catch (err) {
      setError('카테고리별 상품을 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  
  // 특정 지역의 상품 가져오기 (가격순 정렬)
  async function handleRegionClick(region: string) {
    try {
      setLoading(true);
      const data = await getProductsByRegion(region, 'price.adult', 'asc');
      setProducts(data);
    } catch (err) {
      setError('지역별 상품을 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  
  // 베스트셀러 상품 가져오기 
  async function handleBestSellerClick() {
    try {
      setLoading(true);
      const data = await getBestSellerProducts();
      setProducts(data);
    } catch (err) {
      setError('베스트셀러 상품을 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  
  // 타임딜 상품 가져오기
  async function handleTimeDealClick() {
    try {
      setLoading(true);
      const data = await getTimeDealProducts();
      setProducts(data);
    } catch (err) {
      setError('타임딜 상품을 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  
  // 특정 날짜에 이용 가능한 상품 가져오기
  async function handleDateSelection(date: Date) {
    try {
      setLoading(true);
      const data = await getAvailableProductsForDate(date);
      setProducts(data);
    } catch (err) {
      setError('날짜별 상품을 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  
  if (loading) return <div>상품을 불러오는 중...</div>;
  if (error) return <div>{error}</div>;
  
  return (
    <div>
      <h2>여행 상품 목록</h2>
      
      <div className="filters">
        <button onClick={() => handleCategoryClick('beach')}>해변 여행</button>
        <button onClick={() => handleCategoryClick('mountain')}>산악 여행</button>
        <button onClick={() => handleRegionClick('Jeju')}>제주도</button>
        <button onClick={() => handleRegionClick('Seoul')}>서울</button>
        <button onClick={handleBestSellerClick}>베스트셀러</button>
        <button onClick={handleTimeDealClick}>타임딜</button>
        <button onClick={() => handleDateSelection(new Date())}>오늘 가능한 여행</button>
      </div>
      
      <div className="product-list">
        {products.length === 0 ? (
          <p>상품이 없습니다.</p>
        ) : (
          products.map(product => (
            <div key={product.id} className="product-card">
              <img 
                src={product.mainImage?.url || '/placeholder.jpg'} 
                alt={product.mainImage?.alt || product.title} 
              />
              <h3>{product.title}</h3>
              <p>{product.shortDescription}</p>
              <div className="price">
                {product.price?.currency} {product.price?.adult}
              </div>
              <div className="region">{product.region}</div>
              {product.reviewCount > 0 && (
                <div className="rating">
                  평점: {product.averageRating?.toFixed(1)} ({product.reviewCount}건)
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * 장바구니 예제 컴포넌트
 */
export function CartExample({ userId }: { userId: string }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!userId) return;
    
    async function fetchCart() {
      try {
        setLoading(true);
        const items = await getUserCartItems(userId);
        setCartItems(items);
      } catch (err) {
        setError('장바구니를 불러오는 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCart();
  }, [userId]);
  
  async function handleAddToCart(product: Product) {
    try {
      // 예시: 기본 옵션으로 추가
      const defaultOptions = {
        adult: 1,
        child: 0,
        infant: 0
      };
      
      // 오늘부터 3일 후까지의 여행 날짜
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 3);
      
      const dates = {
        startDate: today,
        endDate: endDate
      };
      
      const newItem = await addToCart(
        userId,
        product,
        1, // 수량
        defaultOptions,
        dates
      );
      
      setCartItems(prev => [...prev, newItem]);
    } catch (err) {
      setError('장바구니에 추가하는 중 오류가 발생했습니다.');
      console.error(err);
    }
  }
  
  async function handleRemoveFromCart(cartItemId: string) {
    try {
      await removeFromCart(userId, cartItemId);
      setCartItems(prev => prev.filter(item => item.id !== cartItemId));
    } catch (err) {
      setError('장바구니에서 제거하는 중 오류가 발생했습니다.');
      console.error(err);
    }
  }
  
  // 주문 생성 예제
  async function handleCheckout() {
    if (cartItems.length === 0) {
      setError('장바구니가 비어 있습니다.');
      return;
    }
    
    try {
      // 예시 고객 정보
      const customer = {
        id: userId,
        name: '홍길동',
        email: 'user@example.com',
        phone: '010-1234-5678',
        address: {
          street: '서울시 강남구 테헤란로 123',
          city: '서울',
          state: '서울특별시',
          postalCode: '06123',
          country: '대한민국'
        }
      };
      
      // 주문 생성
      await createOrder(
        userId,
        customer,
        cartItems,
        'credit_card' // 결제 방법
      );
      
      // 장바구니 비우기 (이미 createOrder 내부에서 비워짐)
      setCartItems([]);
      
      alert('주문이 성공적으로 완료되었습니다!');
    } catch (err) {
      setError('주문 처리 중 오류가 발생했습니다.');
      console.error(err);
    }
  }
  
  if (loading) return <div>장바구니를 불러오는 중...</div>;
  if (error) return <div>{error}</div>;
  
  // 장바구니 합계 계산
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  return (
    <div>
      <h2>장바구니</h2>
      
      {cartItems.length === 0 ? (
        <p>장바구니가 비어 있습니다.</p>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.mainImage || '/placeholder.jpg'} alt={item.title} />
                <div className="item-details">
                  <h3>{item.title}</h3>
                  <p>가격: {item.price}</p>
                  <p>수량: {item.quantity}</p>
                  <p>
                    여행 날짜: {item.dates?.startDate.toDate().toLocaleDateString()} ~ 
                    {item.dates?.endDate.toDate().toLocaleDateString()}
                  </p>
                  <p>
                    인원: 성인 {item.options?.adult}명
                    {item.options?.child > 0 && `, 아동 ${item.options.child}명`}
                    {item.options?.infant > 0 && `, 유아 ${item.options.infant}명`}
                  </p>
                </div>
                <button onClick={() => handleRemoveFromCart(item.id)}>제거</button>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <p>합계: {subtotal}</p>
            <button onClick={handleCheckout}>결제하기</button>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * 주문 내역 예제 컴포넌트
 */
export function OrderHistoryExample({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!userId) return;
    
    async function fetchOrders() {
      try {
        setLoading(true);
        const userOrders = await getUserOrders(userId);
        setOrders(userOrders);
      } catch (err) {
        setError('주문 내역을 불러오는 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrders();
  }, [userId]);
  
  // 주문 상태 업데이트 예제 (관리자용)
  async function handleUpdateOrderStatus(orderId: string, newStatus: string) {
    try {
      await updateOrderStatus(
        orderId,
        newStatus,
        `주문 상태가 ${newStatus}로 변경되었습니다.`,
        userId // 관리자 ID
      );
      
      // 주문 상태 업데이트
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, updatedAt: Timestamp.now() } 
            : order
        )
      );
      
      alert(`주문 상태가 ${newStatus}로 업데이트되었습니다.`);
    } catch (err) {
      setError('주문 상태 업데이트 중 오류가 발생했습니다.');
      console.error(err);
    }
  }
  
  if (loading) return <div>주문 내역을 불러오는 중...</div>;
  if (error) return <div>{error}</div>;
  
  return (
    <div>
      <h2>주문 내역</h2>
      
      {orders.length === 0 ? (
        <p>주문 내역이 없습니다.</p>
      ) : (
        <div className="order-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <h3>주문 번호: {order.orderNumber}</h3>
              <p>
                주문 일자: {order.createdAt.toDate().toLocaleDateString()} 
                {order.createdAt.toDate().toLocaleTimeString()}
              </p>
              <p>상태: {order.status}</p>
              <p>결제 상태: {order.paymentStatus}</p>
              <p>결제 방법: {order.paymentMethod}</p>
              <p>합계: {order.total}</p>
              
              {/* 관리자용 상태 업데이트 버튼 */}
              <div className="admin-controls">
                <button onClick={() => handleUpdateOrderStatus(order.id, 'processing')}>
                  처리 중으로 변경
                </button>
                <button onClick={() => handleUpdateOrderStatus(order.id, 'completed')}>
                  완료로 변경
                </button>
                <button onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}>
                  취소로 변경
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 리뷰 작성 예제 컴포넌트
 */
export function ReviewFormExample({ userId, productId }: { userId: string; productId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    
    if (!comment.trim()) {
      setError('리뷰 내용을 입력해주세요.');
      return;
    }
    
    try {
      setLoading(true);
      // 임시 사용자 정보
      const userName = '홍길동';
      const userAvatar = '/avatar-placeholder.jpg';
      
      await addProductReview(
        productId,
        userId,
        userName,
        userAvatar,
        rating,
        comment
      );
      
      setSuccess(true);
      setComment('');
    } catch (err) {
      setError('리뷰 등록 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div>
      <h2>리뷰 작성</h2>
      
      {success ? (
        <div className="success-message">
          <p>리뷰가 성공적으로 등록되었습니다!</p>
          <button onClick={() => setSuccess(false)}>다른 리뷰 작성하기</button>
        </div>
      ) : (
        <form onSubmit={handleSubmitReview}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>평점</label>
            <select 
              value={rating} 
              onChange={(e) => setRating(Number(e.target.value))}
            >
              <option value="5">5점 - 최고예요!</option>
              <option value="4">4점 - 좋아요</option>
              <option value="3">3점 - 보통이에요</option>
              <option value="2">2점 - 별로예요</option>
              <option value="1">1점 - 실망했어요</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>리뷰 내용</label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              placeholder="여행 경험에 대한 리뷰를 작성해주세요."
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? '제출 중...' : '리뷰 등록하기'}
          </button>
        </form>
      )}
    </div>
  );
} 