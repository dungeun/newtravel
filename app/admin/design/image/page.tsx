'use client';

import { useState, useEffect } from 'react';
import { db, storage } from '@/firebase/config';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Header from '@/components/layout/Header';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ThumbnailSize {
  width: number;
  height: number;
  name: string;
}

interface ThumbnailSettings {
  sizes: ThumbnailSize[];
}

export default function ImageManagementPage() {
  const [thumbnailSizes, setThumbnailSizes] = useState<ThumbnailSize[]>([
    { width: 150, height: 150, name: 'small' },
    { width: 300, height: 300, name: 'medium' },
    { width: 600, height: 600, name: 'large' },
  ]);
  const [isAddingSize, setIsAddingSize] = useState(false);
  const [newSize, setNewSize] = useState({ width: 0, height: 0, name: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadThumbnailSettings();
  }, []);

  const loadThumbnailSettings = async () => {
    try {
      const settingsRef = doc(db, 'settings', 'thumbnails');
      const settingsDoc = await getDocs(settingsRef);

      if (settingsDoc.exists()) {
        const settings = settingsDoc.data() as ThumbnailSettings;
        setThumbnailSizes(settings.sizes);
      }
    } catch (error) {
      console.error('썸네일 설정을 불러오는 중 오류가 발생했습니다:', error);
    }
  };

  const saveThumbnailSettings = async () => {
    try {
      setIsLoading(true);
      const settingsRef = doc(db, 'settings', 'thumbnails');
      await updateDoc(settingsRef, {
        sizes: thumbnailSizes,
      });
      alert('썸네일 설정이 저장되었습니다.');
    } catch (error) {
      console.error('썸네일 설정 저장 중 오류가 발생했습니다:', error);
      alert('설정 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSize = () => {
    if (newSize.width <= 0 || newSize.height <= 0 || !newSize.name) {
      alert('유효한 크기와 이름을 입력해주세요.');
      return;
    }

    if (thumbnailSizes.some(size => size.name === newSize.name)) {
      alert('이미 존재하는 이름입니다.');
      return;
    }

    setThumbnailSizes([...thumbnailSizes, newSize]);
    setNewSize({ width: 0, height: 0, name: '' });
    setIsAddingSize(false);
  };

  const handleRemoveSize = (index: number) => {
    setThumbnailSizes(thumbnailSizes.filter((_, i) => i !== index));
  };

  const handleUpdateSize = (
    index: number,
    field: 'width' | 'height' | 'name',
    value: number | string
  ) => {
    const newSizes = [...thumbnailSizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    setThumbnailSizes(newSizes);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header siteName="월급루팡" onSidebarOpen={() => {}} />
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-xl bg-white shadow-sm">
          <div className="border-b border-dotted border-green-500 p-6">
            <h1 className="text-3xl font-bold">이미지 관리</h1>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h2 className="mb-4 text-xl font-bold">썸네일 크기 설정</h2>
              <div className="space-y-4">
                {thumbnailSizes.map((size, index) => (
                  <div key={index} className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
                    <div className="grid flex-1 grid-cols-3 gap-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">이름</label>
                        <input
                          type="text"
                          value={size.name}
                          onChange={e => handleUpdateSize(index, 'name', e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          너비 (px)
                        </label>
                        <input
                          type="number"
                          value={size.width}
                          onChange={e => handleUpdateSize(index, 'width', parseInt(e.target.value))}
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          높이 (px)
                        </label>
                        <input
                          type="number"
                          value={size.height}
                          onChange={e =>
                            handleUpdateSize(index, 'height', parseInt(e.target.value))
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveSize(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="size-5" />
                    </button>
                  </div>
                ))}

                {isAddingSize ? (
                  <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
                    <div className="grid flex-1 grid-cols-3 gap-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">이름</label>
                        <input
                          type="text"
                          value={newSize.name}
                          onChange={e => setNewSize({ ...newSize, name: e.target.value })}
                          placeholder="예: thumbnail"
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          너비 (px)
                        </label>
                        <input
                          type="number"
                          value={newSize.width}
                          onChange={e =>
                            setNewSize({ ...newSize, width: parseInt(e.target.value) })
                          }
                          placeholder="너비"
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          높이 (px)
                        </label>
                        <input
                          type="number"
                          value={newSize.height}
                          onChange={e =>
                            setNewSize({ ...newSize, height: parseInt(e.target.value) })
                          }
                          placeholder="높이"
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddSize}
                        className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800"
                      >
                        추가
                      </button>
                      <button
                        onClick={() => setIsAddingSize(false)}
                        className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingSize(true)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    <PlusIcon className="size-5" />
                    <span>새로운 크기 추가</span>
                  </button>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={saveThumbnailSettings}
                  disabled={isLoading}
                  className="rounded-lg bg-black px-6 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {isLoading ? '저장 중...' : '설정 저장'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
