'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Utensils,
  Bed,
  Plane,
  Bus,
  Train,
  Ship,
} from 'lucide-react';

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  meals: string[];
  accommodation: string;
}

export default function WriteTravelProduct() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([
    {
      day: 1,
      title: '',
      description: '',
      meals: [],
      accommodation: '',
    },
  ]);

  const [formData, setFormData] = useState({
    title: '',
    departureDate: '',
    returnDate: '',
    price: '',
    maxParticipants: '',
    destination: '',
    duration: '',
    meals: {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
    },
    accommodation: {
      type: '',
      description: '',
    },
    transportation: {
      type: 'plane',
      description: '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const handleItineraryChange = (index: number, field: keyof ItineraryDay, value: any) => {
    const newItinerary = [...itinerary];
    newItinerary[index] = {
      ...newItinerary[index],
      [field]: value,
    };
    setItinerary(newItinerary);
  };

  const addItineraryDay = () => {
    setItinerary(prev => [
      ...prev,
      {
        day: prev.length + 1,
        title: '',
        description: '',
        meals: [],
        accommodation: '',
      },
    ]);
  };

  const removeItineraryDay = (index: number) => {
    setItinerary(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // 이미지 업로드
      const imageUrls = await Promise.all(
        images.map(async image => {
          const imageId = uuidv4();
          const imageRef = ref(storage, `travel/${imageId}`);
          await uploadBytes(imageRef, image);
          return getDownloadURL(imageRef);
        })
      );

      // Firestore에 데이터 저장
      const productData = {
        ...formData,
        images: imageUrls,
        itinerary,
        currentParticipants: 0,
        status: 'available',
        author: {
          id: user.uid,
          name: user.displayName || 'Anonymous',
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'boards', 'travel', 'posts'), productData);
      router.push(`/board/travel/${docRef.id}`);
    } catch (error) {
      console.error('Error creating product:', error);
      alert('상품 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">여행 상품 등록</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">기본 정보</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">상품명</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full rounded border p-2"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">출발일</label>
                <input
                  type="date"
                  value={formData.departureDate}
                  onChange={e => setFormData(prev => ({ ...prev, departureDate: e.target.value }))}
                  className="w-full rounded border p-2"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">도착일</label>
                <input
                  type="date"
                  value={formData.returnDate}
                  onChange={e => setFormData(prev => ({ ...prev, returnDate: e.target.value }))}
                  className="w-full rounded border p-2"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">여행지</label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={e => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                  className="w-full rounded border p-2"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">여행기간 (일)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={e => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full rounded border p-2"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">가격 (원)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full rounded border p-2"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">최대 인원</label>
                <input
                  type="number"
                  value={formData.maxParticipants}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, maxParticipants: e.target.value }))
                  }
                  className="w-full rounded border p-2"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* 숙박 정보 */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">숙박 정보</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">숙박 유형</label>
              <input
                type="text"
                value={formData.accommodation.type}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    accommodation: { ...prev.accommodation, type: e.target.value },
                  }))
                }
                className="w-full rounded border p-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">숙박 설명</label>
              <textarea
                value={formData.accommodation.description}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    accommodation: { ...prev.accommodation, description: e.target.value },
                  }))
                }
                className="w-full rounded border p-2"
                rows={3}
                required
              />
            </div>
          </div>
        </div>

        {/* 식사 정보 */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">식사 정보</h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">아침 식사 횟수</label>
              <input
                type="number"
                value={formData.meals.breakfast}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    meals: { ...prev.meals, breakfast: parseInt(e.target.value) },
                  }))
                }
                className="w-full rounded border p-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">점심 식사 횟수</label>
              <input
                type="number"
                value={formData.meals.lunch}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    meals: { ...prev.meals, lunch: parseInt(e.target.value) },
                  }))
                }
                className="w-full rounded border p-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">저녁 식사 횟수</label>
              <input
                type="number"
                value={formData.meals.dinner}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    meals: { ...prev.meals, dinner: parseInt(e.target.value) },
                  }))
                }
                className="w-full rounded border p-2"
                required
              />
            </div>
          </div>
        </div>

        {/* 교통 정보 */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">교통 정보</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">교통 수단</label>
              <select
                value={formData.transportation.type}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    transportation: { ...prev.transportation, type: e.target.value },
                  }))
                }
                className="w-full rounded border p-2"
                required
              >
                <option value="plane">항공</option>
                <option value="bus">버스</option>
                <option value="train">기차</option>
                <option value="ship">선박</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">교통 설명</label>
              <textarea
                value={formData.transportation.description}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    transportation: { ...prev.transportation, description: e.target.value },
                  }))
                }
                className="w-full rounded border p-2"
                rows={3}
                required
              />
            </div>
          </div>
        </div>

        {/* 일정 정보 */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">일정 정보</h2>

          <div className="space-y-4">
            {itinerary.map((day, index) => (
              <div key={index} className="rounded-lg border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">Day {day.day}</h3>
                  <button
                    type="button"
                    onClick={() => removeItineraryDay(index)}
                    className="text-red-600"
                  >
                    삭제
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">제목</label>
                    <input
                      type="text"
                      value={day.title}
                      onChange={e => handleItineraryChange(index, 'title', e.target.value)}
                      className="w-full rounded border p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">설명</label>
                    <textarea
                      value={day.description}
                      onChange={e => handleItineraryChange(index, 'description', e.target.value)}
                      className="w-full rounded border p-2"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">식사</label>
                    <input
                      type="text"
                      value={day.meals.join(', ')}
                      onChange={e =>
                        handleItineraryChange(
                          index,
                          'meals',
                          e.target.value.split(',').map(m => m.trim())
                        )
                      }
                      className="w-full rounded border p-2"
                      placeholder="아침, 점심, 저녁"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">숙박</label>
                    <input
                      type="text"
                      value={day.accommodation}
                      onChange={e => handleItineraryChange(index, 'accommodation', e.target.value)}
                      className="w-full rounded border p-2"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addItineraryDay}
              className="w-full rounded-lg border border-dashed p-2 text-gray-600 hover:bg-gray-50"
            >
              + 일정 추가
            </button>
          </div>
        </div>

        {/* 이미지 업로드 */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">이미지 업로드</h2>

          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full"
            />

            <div className="grid grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="h-32 w-full rounded object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border px-4 py-2 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '등록 중...' : '상품 등록'}
          </button>
        </div>
      </form>
    </div>
  );
}
