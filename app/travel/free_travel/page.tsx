'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, setDoc, query } from 'firebase/firestore';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { v4 as uuidv4 } from 'uuid';

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
  }[];
  createdAt: string;
}

interface BoardOption {
  id: string;
  name: string;
}

type ViewMode = 'grid' | 'list';

export default function TravelProductList() {
  const [products, setProducts] = useState<TravelProduct[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [targetBoard, setTargetBoard] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [boardOptions, setBoardOptions] = useState<BoardOption[]>([
    // 기본값으로 하드코딩된 게시판 옵션 제공
    { id: 'special_promotion', name: '특가프로모션' },
    { id: 'time_deal', name: '타임딜' },
    { id: 'theme_travel', name: '테마별 여행' },
  ]);

  // 게시판 목록을 DB에서 가져오기 시도
  useEffect(() => {
    const fetchBoardOptions = async () => {
      try {
        // 관리자 트래블 콜렉션에서 게시판 정보 가져오기 시도
        const travelBoardsQuery = query(collection(db, 'travel_board_categories'));
        const travelBoardsSnapshot = await getDocs(travelBoardsQuery);

        if (!travelBoardsSnapshot.empty) {
          const boards = travelBoardsSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || doc.id,
          }));

          if (boards.length > 0) {
            console.log('게시판 목록 로드 성공:', boards);
            setBoardOptions(boards);
          }
        }
      } catch (error) {
        console.error('게시판 목록 로드 실패:', error);
        // 오류 발생 시 기본 옵션은 이미 useState에 설정되어 있으므로 따로 처리하지 않음
      }
    };

    fetchBoardOptions();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'travel_products'));
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as TravelProduct[];
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      }
    };

    fetchProducts();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      // 모두 선택되어 있으면 모두 해제
      setSelectedProducts(new Set());
    } else {
      // 아니면 모두 선택
      const allIds = products.map(p => p.id);
      setSelectedProducts(new Set(allIds));
    }
  };

  const handleCopy = async () => {
    if (selectedProducts.size === 0 || !targetBoard) {
      alert('복사할 상품과 대상 게시판을 선택해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      for (const productId of selectedProducts) {
        // 원본 상품 데이터 가져오기
        const productDoc = doc(db, 'travel_products', productId);
        const productSnap = await getDoc(productDoc);

        if (productSnap.exists()) {
          // 새 ID 생성
          const newId = uuidv4();

          // 새 게시판에 복사
          const targetCollection = `${targetBoard}_products`;
          const newProductRef = doc(db, targetCollection, newId);

          // 상품 데이터 복사 (id 제외)
          const productData = productSnap.data();
          await setDoc(newProductRef, {
            ...productData,
            createdAt: new Date().toISOString(), // 현재 시간으로 생성 시간 업데이트
          });
        }
      }

      alert(
        `선택한 ${selectedProducts.size}개의 상품이 ${boardOptions.find(b => b.id === targetBoard)?.name || targetBoard} 게시판으로 복사되었습니다.`
      );
      setIsCopyModalOpen(false);
      setSelectedProducts(new Set());
      setTargetBoard('');
    } catch (error) {
      console.error('Error copying products:', error);
      alert('상품 복사 중 오류가 발생했습니다.');
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">여행 카테고리</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/travel/products/create"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            상품 등록
          </Link>
          <button
            onClick={() => setIsCopyModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            disabled={selectedProducts.size === 0}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z"
              />
            </svg>
            선택 복사 ({selectedProducts.size})
          </button>
          <Link
            href="/admin/travel/categories"
            className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
            title="게시판 관리"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.214 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
            <span>게시판 관리</span>
          </Link>
          <div className="flex items-center gap-2 rounded-lg border p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg p-2 ${
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="썸네일 보기"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-lg p-2 ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="목록 보기"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 선택 관련 컨트롤 */}
      {products.length > 0 && (
        <div className="mb-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="select-all"
              className="size-4 rounded"
              checked={selectedProducts.size === products.length && products.length > 0}
              onChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm text-gray-600">
              전체 선택
            </label>
          </div>
          <span className="text-sm text-gray-500">
            {selectedProducts.size > 0 ? `${selectedProducts.size}개 선택됨` : ''}
          </span>
        </div>
      )}

      {products.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-500">등록된 여행 상품이 없습니다.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map(product => (
            <div
              key={product.id}
              className="relative overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
            >
              <div className="absolute left-2 top-2 z-10">
                <input
                  type="checkbox"
                  id={`select-${product.id}`}
                  className="size-5 rounded border-gray-300"
                  checked={selectedProducts.has(product.id)}
                  onChange={() => toggleProductSelection(product.id)}
                  onClick={e => e.stopPropagation()}
                />
              </div>
              <Link href={`/travel/categories/${product.id}`} className="block">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={product.images[0]?.localPath || '/placeholder.jpg'}
                    alt={product.images[0]?.alt || product.title}
                    className="h-48 w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h2 className="mb-2 line-clamp-2 text-xl font-semibold">{product.title}</h2>
                  <p className="mb-4 line-clamp-2 text-gray-600">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-blue-600">
                        {formatPrice(product.price.adult)}원
                      </p>
                      <p className="text-sm text-gray-500">성인 기준</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {products.map(product => (
            <div
              key={product.id}
              className="relative overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
            >
              <div className="absolute left-2 top-2 z-10">
                <input
                  type="checkbox"
                  id={`select-list-${product.id}`}
                  className="size-5 rounded border-gray-300"
                  checked={selectedProducts.has(product.id)}
                  onChange={() => toggleProductSelection(product.id)}
                  onClick={e => e.stopPropagation()}
                />
              </div>
              <Link href={`/travel/categories/${product.id}`} className="block">
                <div className="flex">
                  <div className="h-32 w-48 shrink-0">
                    <img
                      src={product.images[0]?.localPath || '/placeholder.jpg'}
                      alt={product.images[0]?.alt || product.title}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="mb-2 text-xl font-semibold">{product.title}</h2>
                        <p className="mb-2 line-clamp-2 text-gray-600">{product.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">
                          {formatPrice(product.price.adult)}원
                        </p>
                        <p className="text-sm text-gray-500">성인 기준</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>아동: {formatPrice(product.price.child)}원</span>
                        <span>유아: {formatPrice(product.price.infant)}원</span>
                        <span>유류할증료: {formatPrice(product.price.fuelSurcharge)}원</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* 복사 모달 */}
      <Transition appear show={isCopyModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsCopyModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    선택한 상품 복사
                  </Dialog.Title>
                  <div className="mt-4">
                    <p className="mb-4 text-sm text-gray-500">
                      선택한 {selectedProducts.size}개의 상품을 복사할 게시판을 선택해주세요.
                    </p>

                    <div className="mb-4">
                      <label
                        htmlFor="target-board"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        대상 게시판
                      </label>
                      <select
                        id="target-board"
                        className="w-full rounded-md border border-gray-300 p-2"
                        value={targetBoard}
                        onChange={e => setTargetBoard(e.target.value)}
                      >
                        <option value="">대상 게시판 선택</option>
                        {boardOptions.map(board => (
                          <option key={board.id} value={board.id}>
                            {board.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none"
                      onClick={() => setIsCopyModalOpen(false)}
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none disabled:bg-blue-300"
                      onClick={handleCopy}
                      disabled={isLoading || !targetBoard}
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="-ml-1 mr-2 size-4 animate-spin text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          복사 중...
                        </>
                      ) : (
                        '복사하기'
                      )}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

// 동적 페이지로 설정 (정적 생성 방지)
export const dynamic = 'force-dynamic';
export const revalidate = false;
