'use client';

import { useState } from 'react';
import {
  FaUtensils,
  FaHotel,
  FaShieldAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaUserFriends,
  FaClock,
  FaCalendarAlt,
  FaCircle,
} from 'react-icons/fa';

interface TravelProduct {
  id: string;
  title: string;
  price: {
    adult: number;
    child: number;
    infant: number;
    fuelSurcharge: number;
  };
  description: string;
  images: {
    src: string;
    alt: string;
    localPath: string;
  }[];
  schedule: {
    day: string;
    content: string;
    images?: {
      src: string;
      alt: string;
      localPath: string;
    }[];
  }[];
  luggage: {
    airline: string;
    economy: {
      weight: string;
      size: string;
      extraFee: string;
    };
    carryOn: {
      weight: string;
      size: string;
      standardSize: string;
    };
  };
  insurance: {
    content: string;
  };
  notice: {
    reservation: {
      category: string;
      content: string;
    };
    terms: {
      category: string;
      content: string;
    };
    safety: {
      category: string;
      content: string;
    };
  };
  highlights?: {
    meals?: {
      title: string;
      description: string;
    }[];
    accommodations?: {
      title: string;
      description: string;
    }[];
    insurance?: {
      title: string;
      description: string;
      details?: string;
    };
    included?: string[];
    excluded?: string[];
    guide?: {
      title: string;
      description: string;
    };
    freeTime?: {
      title: string;
      description: string;
    };
  };
  createdAt: string;
}

type TabType = 'highlights' | 'schedule' | 'luggage' | 'insurance' | 'notice';

interface TravelDetailTabsProps {
  product: TravelProduct;
}

export default function TravelDetailTabs({ product }: TravelDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('highlights');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  // Sample highlight data (in real application, this would come from the database)
  const highlightData = {
    meals: [
      {
        title: '허르헉',
        description: '양고기와 야채를 달궈진 돌과 함께 냄비에 넣어 쪄내는 몽골의 전통 음식',
      },
      {
        title: '샤브샤브(Nagomi)',
        description: '고급 샤브샤브 전문점',
      },
    ],
    accommodations: [
      {
        title: '프리미엄 게르',
        description: '테를지 리조트 5성급 게르',
      },
    ],
    insurance: {
      title: '여행자보험',
      description: '해외 여행자보험(최대1억원/KB손해보험)',
      details: '보장내용 및 금액 상세보기',
    },
    included: [
      '[왕복항공권]',
      '[TAX]인천공항세, 현지공항세, 관광기금, 제세공과금',
      '[유류할증료]',
      '[일정표상의 숙박]프리미엄 게르 2인1실',
      '[일정표상의 관광지 입장료]',
      '[전용차량]',
      '[여행자 보험]',
      '[일정표상의 식사]',
      '[가이드/기사 경비]',
    ],
    excluded: ['[싱글룸 사용료]1박당 150,000원'],
    guide: {
      title: '인솔자/가이드 정보',
      description: '본 상품은 인솔자가 없으며 현지공항에서 가이드와 미팅 후 진행되는 상품입니다.',
    },
    freeTime: {
      title: '자유일정',
      description: '자유일정이 포함되지 않은 상품입니다.',
    },
  };

  return (
    <div className="mt-8">
      {/* Tab Menu */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('highlights')}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'highlights'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            상품 핵심포인트
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'schedule'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            여행 일정
          </button>
          <button
            onClick={() => setActiveTab('luggage')}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'luggage'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            수하물 안내
          </button>
          <button
            onClick={() => setActiveTab('insurance')}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'insurance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            보험 정보
          </button>
          <button
            onClick={() => setActiveTab('notice')}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'notice'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            안내 사항
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'highlights' && (
          <div className="space-y-8">
            {/* Meals */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <FaUtensils className="text-xl text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-600">식사</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {highlightData.meals.map((meal, index) => (
                  <div key={index} className="rounded-lg bg-gray-50 p-4">
                    <h4 className="mb-2 font-medium">{meal.title}</h4>
                    <p className="text-sm text-gray-600">{meal.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Accommodations */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <FaHotel className="text-xl text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-600">숙박</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {highlightData.accommodations.map((accommodation, index) => (
                  <div key={index} className="rounded-lg bg-gray-50 p-4">
                    <h4 className="mb-2 font-medium">{accommodation.title}</h4>
                    <p className="text-sm text-gray-600">{accommodation.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Insurance */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <FaShieldAlt className="text-xl text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-600">여행자보험</h3>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 font-medium">{highlightData.insurance.title}</h4>
                <p className="mb-2 text-sm text-gray-600">{highlightData.insurance.description}</p>
                <button
                  className="cursor-pointer text-sm text-blue-600 underline"
                  onClick={() => alert('보험 상세 정보는 현재 준비중입니다.')}
                >
                  {highlightData.insurance.details}
                </button>
              </div>
            </div>

            {/* Included Items */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <FaCheckCircle className="text-xl text-green-600" />
                <h3 className="text-lg font-semibold text-green-600">포함 사항</h3>
              </div>
              <ul className="list-none space-y-2">
                {highlightData.included.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <FaCheckCircle className="mt-0.5 shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Excluded Items */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <FaTimesCircle className="text-xl text-red-600" />
                <h3 className="text-lg font-semibold text-red-600">불포함 사항</h3>
              </div>
              <ul className="list-none space-y-2">
                {highlightData.excluded.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <FaTimesCircle className="mt-0.5 shrink-0 text-red-500" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Guide Info */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <FaUserFriends className="text-xl text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-600">{highlightData.guide.title}</h3>
              </div>
              <p className="text-sm text-gray-700">{highlightData.guide.description}</p>
            </div>

            {/* Free Time */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <FaClock className="text-xl text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-600">
                  {highlightData.freeTime.title}
                </h3>
              </div>
              <p className="text-sm text-gray-700">{highlightData.freeTime.description}</p>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div>
            {product.schedule && product.schedule.length > 0 ? (
              <div className="relative space-y-0">
                {/* 타임라인 세로선 */}
                <div className="absolute inset-y-10 left-6 z-0 ml-0.5 w-0.5 bg-blue-200"></div>

                {product.schedule.map((day, index) => (
                  <div key={index} className="relative z-10 pb-8">
                    <div className="flex items-start">
                      {/* 타임라인 원형 아이콘 */}
                      <div className="mt-1 shrink-0">
                        <div className="flex size-8 items-center justify-center rounded-full bg-blue-500 text-white">
                          {index + 1}
                        </div>
                      </div>

                      {/* 일정 내용 */}
                      <div className="ml-6 w-full rounded-lg bg-white p-6 shadow-sm">
                        <div className="mb-3 flex items-center gap-3">
                          <FaCalendarAlt className="text-blue-500" />
                          <h3 className="text-lg font-semibold text-blue-600">{day.day}일차</h3>
                        </div>
                        <p className="mb-4 whitespace-pre-line text-gray-700">{day.content}</p>
                        {day.images && day.images.length > 0 && (
                          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                            {day.images.map((image, imageIndex) => (
                              <div
                                key={imageIndex}
                                className="relative h-48 overflow-hidden rounded-md border border-gray-100 shadow-sm"
                              >
                                <img
                                  src={image.localPath || '/images/placeholder.jpg'}
                                  alt={image.alt || `일정 이미지 ${imageIndex + 1}`}
                                  className="size-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <p className="text-gray-500">여행 일정 정보가 없습니다.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'luggage' && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            {product.luggage && Object.keys(product.luggage).length > 0 ? (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-blue-600">
                  항공사: {product.luggage.airline}
                </h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="mb-3 font-medium text-blue-600">일반 수하물</h4>
                    <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                      <p>
                        <span className="font-medium">무게:</span> {product.luggage.economy.weight}
                      </p>
                      <p>
                        <span className="font-medium">크기:</span> {product.luggage.economy.size}
                      </p>
                      <p>
                        <span className="font-medium">추가 요금:</span>{' '}
                        {product.luggage.economy.extraFee}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 font-medium text-blue-600">기내 수하물</h4>
                    <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                      <p>
                        <span className="font-medium">무게:</span> {product.luggage.carryOn.weight}
                      </p>
                      <p>
                        <span className="font-medium">크기:</span> {product.luggage.carryOn.size}
                      </p>
                      <p>
                        <span className="font-medium">규격 표준:</span>{' '}
                        {product.luggage.carryOn.standardSize}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">수하물 정보가 없습니다.</p>
            )}
          </div>
        )}

        {activeTab === 'insurance' && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            {product.insurance && product.insurance.content ? (
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <FaShieldAlt className="text-xl text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-600">여행자 보험</h3>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="whitespace-pre-line text-gray-700">{product.insurance.content}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">보험 정보가 없습니다.</p>
            )}
          </div>
        )}

        {activeTab === 'notice' && (
          <div className="space-y-6">
            {product.notice && (
              <>
                {product.notice.reservation && (
                  <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-blue-600">
                      {product.notice.reservation.category}
                    </h3>
                    <p className="whitespace-pre-line text-gray-700">
                      {product.notice.reservation.content}
                    </p>
                  </div>
                )}

                {product.notice.terms && (
                  <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-blue-600">
                      {product.notice.terms.category}
                    </h3>
                    <p className="whitespace-pre-line text-gray-700">
                      {product.notice.terms.content}
                    </p>
                  </div>
                )}

                {product.notice.safety && (
                  <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-blue-600">
                      {product.notice.safety.category}
                    </h3>
                    <p className="whitespace-pre-line text-gray-700">
                      {product.notice.safety.content}
                    </p>
                  </div>
                )}
              </>
            )}
            {(!product.notice || Object.keys(product.notice).length === 0) && (
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <p className="text-gray-500">안내 사항이 없습니다.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
