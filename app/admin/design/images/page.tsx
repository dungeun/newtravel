'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';

interface ThumbnailSize {
  name: string;
  width: number;
  height: number;
}

interface ThumbnailSettings {
  sizes: ThumbnailSize[];
}

const defaultSizes: ThumbnailSize[] = [
  { name: 'small', width: 150, height: 150 },
  { name: 'medium', width: 300, height: 300 },
  { name: 'large', width: 600, height: 600 },
];

const ImageManagementPage = () => {
  const [thumbnailSizes, setThumbnailSizes] = useState<ThumbnailSize[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newSize, setNewSize] = useState<ThumbnailSize>({
    name: '',
    width: 150,
    height: 150,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchThumbnailSettings();
  }, []);

  const fetchThumbnailSettings = async () => {
    try {
      setIsLoading(true);
      const settingsRef = doc(db, 'settings', 'thumbnails');
      const docSnap = await getDoc(settingsRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as ThumbnailSettings;
        if (data.sizes && data.sizes.length > 0) {
          setThumbnailSizes(data.sizes);
        } else {
          // 저장된 설정이 없거나 빈 배열인 경우 기본값 저장
          await setDoc(settingsRef, {
            sizes: defaultSizes,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          setThumbnailSizes(defaultSizes);
        }
      } else {
        // 문서가 없는 경우 기본값으로 생성
        await setDoc(settingsRef, {
          sizes: defaultSizes,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        setThumbnailSizes(defaultSizes);
      }
    } catch (error) {
      console.error('썸네일 설정을 불러오는 중 오류 발생:', error);
      alert('설정을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const settingsRef = doc(db, 'settings', 'thumbnails');
      await setDoc(settingsRef, {
        sizes: thumbnailSizes,
        updatedAt: new Date(),
      });
      alert('설정이 저장되었습니다.');
    } catch (error) {
      console.error('설정 저장 중 오류 발생:', error);
      if (error instanceof FirebaseError) {
        alert(`설정 저장에 실패했습니다. 오류: ${error.message}`);
      } else {
        alert('설정 저장에 실패했습니다. 알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  const handleAddSize = () => {
    if (!newSize.name) {
      alert('썸네일 이름을 입력해주세요.');
      return;
    }
    if (thumbnailSizes.some(size => size.name === newSize.name)) {
      alert('이미 존재하는 이름입니다.');
      return;
    }
    const updatedSizes = [...thumbnailSizes, newSize];
    setThumbnailSizes(updatedSizes);
    setNewSize({ name: '', width: 150, height: 150 });
    setIsAddingNew(false);

    // 자동 저장
    handleSave();
  };

  const handleUpdateSize = (index: number, field: keyof ThumbnailSize, value: string | number) => {
    const newSizes = [...thumbnailSizes];
    newSizes[index] = {
      ...newSizes[index],
      [field]: field === 'name' ? value : Number(value),
    };
    setThumbnailSizes(newSizes);

    // 자동 저장
    handleSave();
  };

  const handleRemoveSize = (index: number) => {
    const updatedSizes = thumbnailSizes.filter((_, i) => i !== index);
    setThumbnailSizes(updatedSizes);

    // 자동 저장
    handleSave();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex h-64 items-center justify-center">
            <div className="text-gray-500">설정을 불러오는 중...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h1 className="mb-6 border-b border-dotted border-green-500 pb-6 text-2xl font-bold">
          이미지 관리
        </h1>

        <div className="space-y-8">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">썸네일 크기 설정</h2>
              <button
                onClick={() => setIsAddingNew(true)}
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                새 크기 추가
              </button>
            </div>

            {/* 기존 썸네일 크기 목록 */}
            <div className="space-y-4">
              {thumbnailSizes.map((size, index) => (
                <div key={size.name} className="flex items-center space-x-4 rounded-lg border p-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={size.name}
                      onChange={e => handleUpdateSize(index, 'name', e.target.value)}
                      className="mb-2 w-full rounded border p-2"
                      placeholder="썸네일 이름"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium">너비 (px)</label>
                        <input
                          type="number"
                          value={size.width}
                          onChange={e => handleUpdateSize(index, 'width', e.target.value)}
                          className="w-full rounded border p-2"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">높이 (px)</label>
                        <input
                          type="number"
                          value={size.height}
                          onChange={e => handleUpdateSize(index, 'height', e.target.value)}
                          className="w-full rounded border p-2"
                          min="1"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveSize(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>

            {/* 새 썸네일 크기 추가 폼 */}
            {isAddingNew && (
              <div className="mt-6 rounded-lg border p-4">
                <h3 className="mb-4 text-lg font-medium">새 썸네일 크기 추가</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">썸네일 이름</label>
                    <input
                      type="text"
                      value={newSize.name}
                      onChange={e => setNewSize({ ...newSize, name: e.target.value })}
                      className="w-full rounded border p-2"
                      placeholder="예: small, medium, large"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">너비 (px)</label>
                      <input
                        type="number"
                        value={newSize.width}
                        onChange={e => setNewSize({ ...newSize, width: Number(e.target.value) })}
                        className="w-full rounded border p-2"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">높이 (px)</label>
                      <input
                        type="number"
                        value={newSize.height}
                        onChange={e => setNewSize({ ...newSize, height: Number(e.target.value) })}
                        className="w-full rounded border p-2"
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setIsAddingNew(false)}
                      className="rounded border px-4 py-2 hover:bg-gray-50"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleAddSize}
                      className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    >
                      추가
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageManagementPage;
