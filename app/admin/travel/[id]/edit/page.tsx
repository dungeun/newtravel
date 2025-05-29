'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Link from 'next/link';
import Image from 'next/image';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface TravelProduct {
  id: string;
  title: string;
  description: string;
  price: {
    adult: number;
    child: number;
    infant: number;
    fuelSurcharge: number;
  };
  images: {
    src: string;
    alt: string;
    localPath: string;
    thumbnails: {
      medium: string;
    };
    name: string;
  }[];
  schedule: any[];
  luggage: any;
  insurance: any;
  notice: any;
  createdAt: string;
}

export default function EditTravelProduct({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<TravelProduct>>({
    title: '',
    description: '',
    price: {
      adult: 0,
      child: 0,
      infant: 0,
      fuelSurcharge: 0,
    },
    images: [],
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'travel_products', params.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            id: docSnap.id,
            title: data.title || '',
            description: data.description || '',
            price: {
              adult: data.price?.adult || 0,
              child: data.price?.child || 0,
              infant: data.price?.infant || 0,
              fuelSurcharge: data.price?.fuelSurcharge || 0,
            },
            images: data.images || [],
          });
        } else {
          alert('상품을 찾을 수 없습니다.');
          router.push('/travel/free_travel');
        }
      } catch (error) {
        console.error('Error fetching travel product:', error);
        alert('상품 정보를 불러오는 중 오류가 발생했습니다.');
        router.push('/travel/free_travel');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const uploadPromises = Array.from(files).map(async file => {
        const storageRef = ref(storage, `travel_products/${params.id}/${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        return {
          src: downloadURL,
          alt: file.name,
          localPath: downloadURL,
          thumbnails: {
            medium: downloadURL,
          },
          name: file.name,
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedImages],
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || [],
    }));
  };

  const formatPrice = (value: string) => {
    const number = value.replace(/[^0-9]/g, '');
    return number ? parseInt(number).toLocaleString() : '';
  };

  const handlePriceChange = (field: keyof TravelProduct['price'], value: string) => {
    const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
    setFormData(prev => ({
      ...prev,
      price: {
        ...prev.price!,
        [field]: numericValue,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      alert('제목과 설명을 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      const docRef = doc(db, 'travel_products', params.id);
      await updateDoc(docRef, {
        title: formData.title,
        description: formData.description,
        price: {
          adult: Number(formData.price?.adult),
          child: Number(formData.price?.child),
          infant: Number(formData.price?.infant),
          fuelSurcharge: Number(formData.price?.fuelSurcharge),
        },
        images: formData.images,
      });

      alert('상품이 수정되었습니다.');
      router.push(`/travel/free_travel/${params.id}`);
    } catch (error) {
      console.error('Error updating travel product:', error);
      alert('상품 수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-y-2 border-blue-500"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <Link href={`/travel/free_travel/${params.id}`} className="text-blue-600 hover:underline">
          ← 상세 페이지로 돌아가기
        </Link>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-2xl font-bold">여행 상품 수정</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">제목</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">설명</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">이미지</label>
            <div className="mb-4 rounded-lg border border-dashed border-gray-300 p-4">
              <label className="flex cursor-pointer flex-col items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="flex flex-col items-center gap-2">
                  <PlusIcon className="size-8 text-gray-400" />
                  <span className="text-gray-600">
                    이미지를 여기에 끌어다 놓거나 클릭하여 업로드하세요
                  </span>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
              {formData.images?.map((image, index) => (
                <div key={index} className="group relative aspect-square">
                  <Image
                    src={image.thumbnails.medium}
                    alt={image.name}
                    fill
                    className="rounded-lg object-cover"
                  />
                  <div className="absolute inset-0 rounded-lg bg-black bg-opacity-0 transition-opacity group-hover:bg-opacity-20" />
                  <div className="absolute inset-x-0 bottom-0 truncate bg-black bg-opacity-50 p-2 text-sm text-white">
                    {image.name}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute right-2 top-2 rounded-full bg-black bg-opacity-50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <XMarkIcon className="size-5" />
                  </button>
                </div>
              ))}
            </div>
            {uploading && <p className="mt-2 text-sm text-gray-500">이미지 업로드 중...</p>}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">성인 가격</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.price?.adult.toLocaleString()}
                  onChange={e => handlePriceChange('adult', e.target.value)}
                  className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">원</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">아동 가격</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.price?.child.toLocaleString()}
                  onChange={e => handlePriceChange('child', e.target.value)}
                  className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">원</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">유아 가격</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.price?.infant.toLocaleString()}
                  onChange={e => handlePriceChange('infant', e.target.value)}
                  className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">원</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">유류할증료</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.price?.fuelSurcharge.toLocaleString()}
                  onChange={e => handlePriceChange('fuelSurcharge', e.target.value)}
                  className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">원</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link
              href={`/travel/free_travel/${params.id}`}
              className="rounded-lg border px-4 py-2 hover:bg-gray-50"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
