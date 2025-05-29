'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Order } from '../types/order';
import Link from 'next/link';
import { Loader2, AlertCircle, Heart, User, ShoppingBag } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';

// 주문 상태별 색상 정의
const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  paid: 'bg-green-100 text-green-800 border-green-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  ready: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  refunded: 'bg-red-100 text-red-800 border-red-200'
};

// 주문 상태별 라벨 정의
const statusLabels: Record<string, string> = {
  pending: '대기중',
  confirmed: '확인됨',
  paid: '결제완료',
  processing: '처리중',
  ready: '준비완료',
  completed: '완료됨',
  cancelled: '취소됨',
  refunded: '환불됨'
};

// 페이지네이션 컴포넌트
const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button 
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        이전
      </button>
      
      <div className="flex gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${currentPage === page ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
          >
            {page}
          </button>
        ))}
      </div>
      
      <button 
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        다음
      </button>
    </div>
  );
};

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  nickname?: string | undefined;
  role?: string | undefined;
}

interface LikedProduct {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  destination: string;
  likedAt: Date;
}

export default function MyPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [likedProducts, setLikedProducts] = useState<LikedProduct[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('profile');
  const ordersPerPage = 5;

  // 사용자 프로필 정보 가져오기
  useEffect(() => {
    if (user?.id) {
      fetchOrders();
      fetchUserProfile();
      fetchLikedProducts();
    }
  }, [user, page]);
  
  // Firebase에서 사용자 프로필 정보 가져오기
  const fetchUserProfile = async () => {
    try {
      if (!user?.id) return;
      
      // Firebase에서 사용자 정보 가져오기
      const userDoc = await getDoc(doc(db, 'users', user.id));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile({
          uid: user.id,
          email: user.email || null,
          displayName: user.name || null,
          photoURL: user.image || null,
          nickname: userData.nickname || user.name || null,
          role: userData.role
        });
      } else {
        setUserProfile({
          uid: user.id,
          email: user.email || null,
          displayName: user.name || null,
          photoURL: user.image || null
        });
      }
    } catch (err: any) {
      console.error('사용자 프로필 정보 조회 오류:', err);
    }
  };
  
  // 찜한 상품 가져오기
  const fetchLikedProducts = async () => {
    try {
      if (!user?.id) return;
      
      // Firebase에서 찜한 상품 정보 가져오기
      const likesRef = collection(db, 'likes');
      const q = query(likesRef, where('userId', '==', user.id));
      const querySnapshot = await getDocs(q);
      
      const likes: LikedProduct[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        likes.push({
          id: data.productId,
          title: data.productTitle || '상품명 없음',
          price: data.productPrice || 0,
          imageUrl: data.productImage || '',
          destination: data.destination || '',
          likedAt: data.createdAt?.toDate() || new Date()
        });
      });
      
      setLikedProducts(likes);
    } catch (err: any) {
      console.error('찜한 상품 조회 오류:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // API 엔드포인트 호출
      const response = await fetch(`/api/mypage/orders?page=${page}&limit=${ordersPerPage}`);
      
      if (!response.ok) {
        throw new Error('주문 내역을 불러오는 데 실패했습니다.');
      }
      
      const data = await response.json();
      setOrders(data.orders);
      setTotalPages(data.pagination.totalPages);
    } catch (err: any) {
      console.error('주문 내역 조회 오류:', err);
      setError(err.message || '주문 내역을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (value: number) => {
    setPage(value);
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 금액 포맷팅 함수
  const formatCurrency = (amount: number, currency: string = 'KRW') => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-3">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 사용자 프로필 헤더 */}
      <div className="mb-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-600">
              {userProfile?.photoURL ? (
                <img src={userProfile.photoURL} alt="프로필" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <User className="h-10 w-10" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{userProfile?.nickname || userProfile?.displayName || '사용자'} 님</h1>
              <p className="text-gray-500">{userProfile?.email}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 탭 메뉴 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8 grid w-full grid-cols-3 md:w-auto">
          <TabsTrigger value="profile" className="flex gap-2">
            <User className="h-4 w-4" />
            <span>프로필</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span>주문 내역</span>
          </TabsTrigger>
          <TabsTrigger value="likes" className="flex gap-2">
            <Heart className="h-4 w-4" />
            <span>찜한 상품</span>
          </TabsTrigger>
        </TabsList>
        
        {/* 프로필 탭 */}
        <TabsContent value="profile" className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">내 프로필</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">이메일</h3>
                <p className="mt-1">{userProfile?.email || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">닉네임</h3>
                <p className="mt-1">{userProfile?.nickname || userProfile?.displayName || '-'}</p>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/profile/complete" className="text-teal-600 hover:text-teal-800">
                추가 정보 입력/수정
              </Link>
            </div>
          </div>
        </TabsContent>
        
        {/* 주문 내역 탭 */}
        <TabsContent value="orders" className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">주문 내역</h2>
            
            {orders.length === 0 ? (
              <div className="py-3 text-center">
                <p className="text-gray-600 mb-4">
                  여행 상품을 구매하면 이곳에서 주문 내역을 확인할 수 있습니다.
                </p>
                <div className="mt-3">
                  <Link href="/travel/free_travel" className="text-teal-600 hover:text-teal-800">
                    여행 상품 둘러보기
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Link href={`/mypage/orders/${order.id}`} key={order.id} className="block text-inherit no-underline">
                    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 hover:translate-y-[-2px]">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        <div className="sm:col-span-8">
                          <h3 className="font-semibold text-base">
                            {order.items[0]?.productTitle}
                            {order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : ''}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            주문번호: {order.orderNumber} | 주문일자: {formatDate(order.createdAt)}
                          </p>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                            {statusLabels[order.status] || order.status}
                          </span>
                        </div>
                        <div className="sm:col-span-4 text-left sm:text-right">
                          <p className="text-lg font-semibold text-teal-600">
                            {formatCurrency(order.totalAmount, order.currency)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.payment?.method === 'credit_card' ? '신용카드' : 
                             order.payment?.method === 'bank_transfer' ? '계좌이체' : 
                             order.payment?.method === 'virtual_account' ? '가상계좌' : 
                             '기타'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                
                <Pagination 
                  currentPage={page} 
                  totalPages={totalPages} 
                  onPageChange={handlePageChange} 
                />
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* 찜한 상품 탭 */}
        <TabsContent value="likes" className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">찜한 상품</h2>
            
            {likedProducts.length === 0 ? (
              <div className="py-3 text-center">
                <p className="text-gray-600 mb-4">
                  관심 있는 여행 상품을 찜하면 이곳에서 확인할 수 있습니다.
                </p>
                <div className="mt-3">
                  <Link href="/travel/free_travel" className="text-teal-600 hover:text-teal-800">
                    여행 상품 둘러보기
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {likedProducts.map((product) => (
                  <Link href={`/travel/free_travel/${product.id}`} key={product.id} className="block text-inherit no-underline">
                    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
                      {product.imageUrl ? (
                        <div className="h-40 overflow-hidden">
                          <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-40 bg-gray-100 flex items-center justify-center">
                          <p className="text-gray-400">이미지 없음</p>
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-base mb-1">{product.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{product.destination}</p>
                        <p className="text-lg font-semibold text-teal-600">
                          {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(product.price)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
