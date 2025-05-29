'use client';

import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { useAuth } from './useAuth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  increment
} from 'firebase/firestore';

interface UseLikeReturn {
  likes: number;
  isLiked: boolean;
  loading: boolean;
  toggleLike: () => Promise<void>;
}

export function useLike(productId: string): UseLikeReturn {
  const [likes, setLikes] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  // 좋아요 수와 사용자의 좋아요 상태 가져오기
  useEffect(() => {
    const fetchLikes = async () => {
      if (!productId) return;
      
      try {
        setLoading(true);
        
        // 상품의 좋아요 수 가져오기
        const productRef = doc(db, 'travel_products', productId);
        const productSnap = await getDoc(productRef);
        
        if (productSnap.exists()) {
          const productData = productSnap.data();
          setLikes(productData.likes || 0);
        }
        
        // 사용자가 로그인한 경우, 좋아요 상태 확인
        if (user?.id) {
          const userLikesRef = doc(db, 'user_likes', user.id);
          const userLikesSnap = await getDoc(userLikesRef);
          
          if (userLikesSnap.exists()) {
            const likedProducts = userLikesSnap.data().products || [];
            setIsLiked(likedProducts.includes(productId));
          }
        }
      } catch (error) {
        console.error('좋아요 정보를 가져오는 중 오류 발생:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLikes();
  }, [productId, user?.id]);

  // 좋아요 토글 함수
  const toggleLike = async () => {
    if (!user?.id) {
      alert('좋아요 기능은 로그인 후 이용 가능합니다.');
      return;
    }
    
    if (!productId) return;
    
    try {
      const productRef = doc(db, 'travel_products', productId);
      const userLikesRef = doc(db, 'user_likes', user.id);
      
      // 사용자의 좋아요 목록 문서가 있는지 확인
      const userLikesSnap = await getDoc(userLikesRef);
      
      if (isLiked) {
        // 좋아요 취소
        if (userLikesSnap.exists()) {
          await updateDoc(userLikesRef, {
            products: arrayRemove(productId)
          });
        }
        
        // 상품의 좋아요 수 감소
        await updateDoc(productRef, {
          likes: increment(-1)
        });
        
        setLikes(prev => Math.max(0, prev - 1));
        setIsLiked(false);
      } else {
        // 좋아요 추가
        if (userLikesSnap.exists()) {
          await updateDoc(userLikesRef, {
            products: arrayUnion(productId)
          });
        } else {
          // 사용자의 좋아요 문서가 없으면 생성
          await setDoc(userLikesRef, {
            products: [productId],
            userId: user.id
          });
        }
        
        // 상품의 좋아요 수 증가
        await updateDoc(productRef, {
          likes: increment(1)
        });
        
        setLikes(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('좋아요 토글 중 오류 발생:', error);
    }
  };

  return { likes, isLiked, loading, toggleLike };
}
