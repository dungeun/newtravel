'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Heart, Trash2, ShoppingCart, AlertCircle } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

interface WishlistItemsProps {
  userId: string;
}

export default function WishlistItems({ userId }: WishlistItemsProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/wishlist');
        
        if (response.data.success) {
          setWishlistItems(response.data.items || []);
        } else {
          setError(response.data.error || '위시리스트를 불러오는데 실패했습니다.');
        }
      } catch (err: any) {
        console.error('위시리스트 조회 오류:', err);
        setError(err.response?.data?.error || err.message || '위시리스트를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchWishlist();
    }
  }, [userId]);
  
  // 위시리스트에서 제거
  const removeFromWishlist = async (itemId: string) => {
    try {
      const response = await axios.delete(`/api/wishlist/${itemId}`);
      
      if (response.data.success) {
        // 위시리스트에서 해당 아이템 제거
        setWishlistItems(wishlistItems.filter(item => item.id !== itemId));
      } else {
        console.error('위시리스트 제거 오류:', response.data.error);
      }
    } catch (err) {
      console.error('위시리스트 제거 오류:', err);
    }
  };
  
  // 장바구니에 추가
  const handleAddToCart = async (item: any) => {
    try {
      // 장바구니에 추가할 기본 정보 설정
      const cartItem = {
        id: item.id,
        title: item.title,
        price: item.price,
        quantity: 1,
        image: item.image,
        options: {
          adult: 1,
          child: 0,
          infant: 0
        }
      };
      
      await addToCart(userId, cartItem);
      
      // 성공 메시지 표시
      alert('장바구니에 추가되었습니다.');
    } catch (err) {
      console.error('장바구니 추가 오류:', err);
    }
  };
  
  // 로딩 상태 표시
  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          <p className="text-gray-500">위시리스트를 불러오는 중...</p>
        </div>
      </div>
    );
  }
  
  // 에러 상태 표시
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-red-700">위시리스트를 불러올 수 없습니다</h3>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }
  
  // 위시리스트가 비어있는 경우
  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Heart className="mb-4 h-16 w-16 text-gray-300" />
          <h3 className="mb-2 text-xl font-semibold">위시리스트가 비어 있습니다</h3>
          <p className="mb-6 text-gray-500">마음에 드는 여행 상품을 찜해보세요.</p>
          <Button onClick={() => router.push('/travel')}>
            여행 상품 보러가기
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">위시리스트</h2>
        <span className="text-sm text-gray-500">총 {wishlistItems.length}개</span>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {wishlistItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="relative h-48 w-full">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100">
                  <p className="text-gray-400">이미지 없음</p>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="mb-2 line-clamp-2 font-medium">{item.title}</h3>
              <p className="mb-4 text-lg font-bold text-blue-600">{item.price.toLocaleString()}원</p>
              
              <div className="flex gap-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex-1 gap-1"
                  onClick={() => handleAddToCart(item)}
                >
                  <ShoppingCart className="h-4 w-4" />
                  장바구니
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => removeFromWishlist(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 w-full"
                onClick={() => router.push(`/travel/product/${item.id}`)}
              >
                상세 보기
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
