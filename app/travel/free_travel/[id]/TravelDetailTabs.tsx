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

type TabType = 'description' | 'highlights' | 'schedule' | 'luggage' | 'insurance' | 'notice' | 'reviews' | 'likes';

interface TravelDetailTabsProps {
  product: TravelProduct;
}

export default function TravelDetailTabs({ product }: TravelDetailTabsProps) {
  // 일정 섹션이 중간에 나오도록 기본 탭 순서 변경
  const [activeTab, setActiveTab] = useState<TabType>('description');
  
  // 탭 순서 정의 (일정이 중간에 나오도록 설정)
  const tabOrder: TabType[] = ['description', 'highlights', 'schedule', 'luggage', 'insurance', 'notice', 'reviews', 'likes'];

  // 가격 포맷팅 함수는 필요한 경우 나중에 사용할 수 있도록 주석 처리
  // const formatPrice = (price: number) => {
  //   return new Intl.NumberFormat('ko-KR').format(price);
  // };

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


      <div className="border rounded-lg shadow-sm overflow-hidden">
        {/* Tab Buttons */}
      <div className="flex flex-nowrap overflow-x-auto">
        {/* 탭 버튼을 동적으로 생성 */}
        {tabOrder.map((tab) => {
          // 탭 이름에 따른 표시 텍스트 설정
          const tabLabels: Record<TabType, string> = {
            description: '상품 설명',
            highlights: '하이라이트',
            schedule: '일정',
            luggage: '수하물',
            insurance: '보험',
            notice: '유의사항',
            reviews: '리뷰',
            likes: '좋아요'
          };
          
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-5 py-4 text-xl font-bold ${activeTab === tab ? 'border-b-3 border-[#14b8a6] text-[#14b8a6] bg-white' : 'text-gray-600 hover:text-[#14b8a6]'}`}
            >
              {tabLabels[tab]}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6 border-t">
        {activeTab === 'description' && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold text-[#14b8a6]">상품 설명</h2>
            <div className="prose max-w-none">
              <p className="mb-4 text-lg text-gray-700">
                울란바타르의 분주함에서 출발해 야간 기차 여행, 몽골의 청정 호수 훕스굴, 승마 트레킹, 전통 유목민 게르 체험, 그리고 치유의 온천욕까지.
                이 여행은 단순한 관광이 아니라, 오감으로 자연을 느끼고, 마음을 정화하는 자연 치유형 힐링 루트입니다.
              </p>
              <p className="mb-4 text-lg text-gray-700">
                이 여행은 몽골의 자연을 깊이 호흡하고, 평소 잊고 지내던 자신의 중심을 되찾는 여정입니다.
                승마와 요가, 호수와 온천, 그리고 사람들과의 만남을 통해, 당신만의 특별한 몽골 이야기를 만들어보세요.
                일정이 상당히 알차게 짜여 있습니다. 북부 흡수골 일정은 이걸 기본으로 줄이거나(5박6일,6박7일) 늘일 (8박9일)수 있습니다.
              </p>
              <p className="whitespace-pre-line text-gray-700">{product.description}</p>
            </div>
          </div>
        )}
        
        {activeTab === 'highlights' && (
          <div className="space-y-8">
            {/* Meals */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <FaUtensils className="text-xl text-[#14b8a6]" />
                <h3 className="text-2xl font-semibold text-[#14b8a6]">식사</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {highlightData.meals.map((meal, index) => (
                  <div key={index} className="rounded-lg bg-gray-50 p-4">
                    <h4 className="mb-2 font-medium">{meal.title}</h4>
                    <p className="text-base text-gray-700">{meal.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Accommodations */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <FaHotel className="text-xl text-[#14b8a6]" />
                <h3 className="text-2xl font-semibold text-[#14b8a6]">숙박</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {highlightData.accommodations.map((accommodation, index) => (
                  <div key={index} className="rounded-lg bg-gray-50 p-4">
                    <h4 className="mb-2 font-medium">{accommodation.title}</h4>
                    <p className="text-base text-gray-700">{accommodation.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Insurance */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <FaShieldAlt className="text-xl text-[#14b8a6]" />
                <h3 className="text-2xl font-semibold text-[#14b8a6]">여행자보험</h3>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 font-medium">{highlightData.insurance.title}</h4>
                <p className="text-base text-gray-700">{highlightData.insurance.description}</p>
                <button
                  className="cursor-pointer text-sm text-[#14b8a6] underline"
                  onClick={() => alert('보험 상세 정보는 현재 준비중입니다.')}
                >
                  {highlightData.insurance.details}
                </button>
              </div>
            </div>

            {/* Included Items */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <FaCheckCircle className="text-xl text-[#14b8a6]" />
                <h3 className="text-2xl font-semibold text-[#14b8a6]">포함 사항</h3>
              </div>
              <ul className="list-none space-y-2">
                {highlightData.included.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <FaCheckCircle className="mt-0.5 shrink-0 text-[#14b8a6]" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Excluded Items */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <FaTimesCircle className="text-xl text-[#14b8a6]" />
                <h3 className="text-2xl font-semibold text-[#14b8a6]">불포함 사항</h3>
              </div>
              <ul className="list-none space-y-2">
                {highlightData.excluded.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <FaTimesCircle className="mt-0.5 shrink-0 text-[#14b8a6]" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Guide Info */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <FaUserFriends className="text-xl text-[#14b8a6]" />
                <h3 className="text-lg font-semibold text-[#14b8a6]">{highlightData.guide.title}</h3>
              </div>
              <p className="text-sm text-gray-700">{highlightData.guide.description}</p>
            </div>

            {/* Free Time */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <FaClock className="text-xl text-[#14b8a6]" />
                <h3 className="text-lg font-semibold text-[#14b8a6]">
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
                {/* 타임라인 세로선 - 점선으로 변경 */}
                <div className="absolute inset-y-10 left-6 z-0 ml-0.5 w-0.5 border-l-2 border-dashed border-[#14b8a6]"></div>

                {product.schedule.map((day, index) => (
                  <div key={index} className="relative z-10 pb-8">
                    <div className="flex items-start">
                      {/* GPS 포인트 아이콘 */}
                      <div className="mt-1 shrink-0">
                        <div className="flex size-8 items-center justify-center rounded-full bg-white border-2 border-[#14b8a6] text-[#14b8a6]">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>

                      {/* 일정 내용 */}
                      <div className="ml-6 w-full rounded-lg bg-white p-6 shadow-sm">
                        <div className="mb-3 flex items-center gap-3">
                          <FaCalendarAlt className="text-[#14b8a6]" />
                          <h3 className="text-lg font-semibold text-[#14b8a6]">{day.day}일차</h3>
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
                <h3 className="mb-4 text-lg font-semibold text-[#14b8a6]">
                  항공사: {product.luggage.airline}
                </h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="mb-3 font-medium text-[#14b8a6]">일반 수하물</h4>
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
                    <h4 className="mb-3 font-medium text-[#14b8a6]">기내 수하물</h4>
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
                  <FaShieldAlt className="text-xl text-[#14b8a6]" />
                  <h3 className="mb-4 text-lg font-semibold text-[#14b8a6]">여행 전 필독사항</h3>
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
    </div>
  );
}
