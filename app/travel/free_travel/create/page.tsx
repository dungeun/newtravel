'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

type Step = 'basic' | 'schedule' | 'luggage' | 'insurance' | 'notice' | 'highlights';

interface ScheduleItem {
  day: string;
  content: string;
  images: File[];
}

interface NoticeItem {
  category: string;
  content: string;
}

interface FormData {
  title: string;
  description: string;
  price: {
    adult: string;
    child: string;
    infant: string;
    fuelSurcharge: string;
  };
  schedule: ScheduleItem[];
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
    reservation: NoticeItem;
    terms: NoticeItem;
    safety: NoticeItem;
  };
  highlights: {
    meals: {
      title: string;
      description: string;
    }[];
    accommodations: {
      title: string;
      description: string;
    }[];
    insurance: {
      title: string;
      description: string;
      details: string;
    };
    included: string[];
    excluded: string[];
    guide: {
      title: string;
      description: string;
    };
    freeTime: {
      title: string;
      description: string;
    };
  };
}

const initialFormData: FormData = {
  title: '',
  description: '',
  price: {
    adult: '',
    child: '',
    infant: '',
    fuelSurcharge: '',
  },
  schedule: [{ day: '', content: '', images: [] }],
  luggage: {
    airline: '',
    economy: {
      weight: '',
      size: '',
      extraFee: '',
    },
    carryOn: {
      weight: '',
      size: '',
      standardSize: '',
    },
  },
  insurance: {
    content: '',
  },
  notice: {
    reservation: {
      category: '예약 안내',
      content: '',
    },
    terms: {
      category: '약관 정보',
      content: '',
    },
    safety: {
      category: '해외 안전 정보',
      content: '',
    },
  },
  highlights: {
    meals: [
      {
        title: '',
        description: '',
      },
    ],
    accommodations: [
      {
        title: '',
        description: '',
      },
    ],
    insurance: {
      title: '',
      description: '',
      details: '',
    },
    included: [''],
    excluded: [''],
    guide: {
      title: '',
      description: '',
    },
    freeTime: {
      title: '',
      description: '',
    },
  },
};

const exampleData = {
  basic: {
    title: '몽골 울란바토르 테를지초원 2박3일 [6인출발/제주항공] VIP게르2박+노팁노쇼핑노옵션',
    description:
      '몽골의 수도 울란바토르와 테를지 국립공원을 방문하는 2박 3일 여행입니다. VIP 게르에서의 숙박과 함께 몽골의 전통 문화를 체험할 수 있습니다.',
    price: {
      adult: '1309000',
      child: '1309000',
      infant: '150000',
      fuelSurcharge: '135000',
    },
  },
  schedule: [
    {
      day: '1일차',
      content: `09:40 인천(ICN) 출발
12:20 울란바토르(UBN) 도착
수흐바타르 광장 방문
몽골 국립 역사박물관 관람
자이승 승전탑 방문
샤브샤브(Nagomi) 석식
테를지 리조트로 이동
프리미엄 게르 투숙`,
      images: [],
    },
    {
      day: '2일차',
      content: `리조트 조식
징기스칸 기마상 내부관람
허르헉 중식
거북바위 방문
아리야발 사원 방문
승마 트레킹 체험
몽골 유목민 체험
몽골 전통 의상 입고 사진 촬영
리조트 귀환 및 석식
프리미엄 게르 투숙`,
      images: [],
    },
    {
      day: '3일차',
      content: `리조트 조식
공항 이동 및 출국 수속
13:20 울란바토르(UBN) 출발
17:40 인천(ICN) 도착`,
      images: [],
    },
  ],
  luggage: {
    airline: '제주항공',
    economy: {
      weight: '15kg (일반석), 30kg (비즈니스라이트석)',
      size: '3면의 합 203cm 이내 (23kg이하(1개)-괌/사이판)',
      extraFee: '16,000원/kg',
    },
    carryOn: {
      weight: '10kg',
      size: '가로+세로+높이 합이 115cm 이내',
      standardSize: '가로 40cm * 세로 55cm * 높이 20cm',
    },
  },
  insurance: {
    content: `보험관련 내용은 고객센터에 문의 바랍니다.
- 여행자보험 가입 필수
- 보험 미가입 시 여행 참가 불가
- 보험 가입은 출발 7일 전까지 완료해야 합니다.`,
  },
  notice: {
    reservation: {
      category: '예약 안내',
      content: `-예약 후 24시간 이내에 예약금 1인 20만원 처리 부탁드립니다.
(예약금 미입금 시 가예약으로 간주되어 자동취소 처리될 수 있습니다.)
-카드 결제 시 담당자에게 연락주시면 ARS결제 문자 넣어드립니다.
- 잔금은 출발 21일 전까지 완납해 주셔야 하며 현금납부, 카드결제 가능합니다.
(단.일부특가상품현금결제조건)
- 입금계좌: 신한 100-028-395202 (주)교원투어
- 현금결제시 현금영수증 처리 가능합니다. 처리하실 번호 부탁 드립니다.`,
    },
    terms: {
      category: '약관 정보',
      content: `여행 해지에 관한 일반적인 사항

당사는 여행계약 이후 다음 명기되는 사유에 의한 경우는 여행계약을 해제할 수 있다.
① 천재지변, 불의의 재해, 정변, 전란, 파업, 항공기 납치 등 부득이한 사유에 의해 여행실시가 불가능하게 된 경우
② 여행참가자 수가 미달된 경우로서, 여행을 중지하는 사항을 적어도 출발 7일전까지는 여행자에게 통지한 경우

본 여행상품은 계약금 지불 시점부터 계약이 체결되며, 계약해제 요청 시 귀책사유에 따라 취소수수료가 부과됩니다.`,
    },
    safety: {
      category: '해외 안전 정보',
      content: `몽골 입국시 주의사항

- 신발(운동화), 간단한 세면도구, 개인 상비약, 모자, 선글라스 등
- 전자 제품의 경우 대부분의 220V 사용가능 합니다.
- 시차: 한국 시간 -1시간(예:한국이 09:00 / 몽골은 08:00)
- 현지에서는 반드시 투숙 중인 호텔과 가이드 연락처를 숙지해야 합니다.
- 공항에서 로밍 써비스를 받으시면 여행지에서도 핸드폰 사용이 가능합니다.
- 게르숙박시 모기향, 썬크림, 세면도구/수건, 물티슈 등`,
    },
  },
  highlights: {
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
  },
};

export default function CreateTravelProduct() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [loading, setLoading] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [images, setImages] = useState<File[]>([]);

  const steps = [
    { id: 'basic', label: '기본 정보' },
    { id: 'schedule', label: '여행 일정' },
    { id: 'luggage', label: '수하물 안내' },
    { id: 'insurance', label: '보험 정보' },
    { id: 'notice', label: '안내 사항' },
    { id: 'highlights', label: '여행 강조 사항' },
  ] as const;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleScheduleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newSchedule = [...formData.schedule];
      newSchedule[index] = {
        ...newSchedule[index],
        images: Array.from(e.target.files),
      };
      setFormData({ ...formData, schedule: newSchedule });
    }
  };

  const handleApplyExample = () => {
    switch (currentStep) {
      case 'basic':
        setFormData({
          ...formData,
          title: exampleData.basic.title,
          description: exampleData.basic.description,
          price: exampleData.basic.price,
        });
        break;
      case 'schedule':
        setFormData({
          ...formData,
          schedule: exampleData.schedule,
        });
        break;
      case 'luggage':
        setFormData({
          ...formData,
          luggage: exampleData.luggage,
        });
        break;
      case 'insurance':
        setFormData({
          ...formData,
          insurance: exampleData.insurance,
        });
        break;
      case 'notice':
        setFormData({
          ...formData,
          notice: exampleData.notice,
        });
        break;
      case 'highlights':
        setFormData({
          ...formData,
          highlights: exampleData.highlights,
        });
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload main images
      const imageUrls = await Promise.all(
        images.map(async image => {
          const storageRef = ref(storage, `travel_products/${Date.now()}_${image.name}`);
          const snapshot = await uploadBytes(storageRef, image);
          const downloadURL = await getDownloadURL(snapshot.ref);
          return {
            src: downloadURL,
            alt: image.name,
            localPath: downloadURL,
          };
        })
      );

      // Upload schedule images
      const scheduleWithImages = await Promise.all(
        formData.schedule.map(async item => {
          const scheduleImageUrls = await Promise.all(
            item.images.map(async image => {
              const storageRef = ref(
                storage,
                `travel_products/schedule/${Date.now()}_${image.name}`
              );
              const snapshot = await uploadBytes(storageRef, image);
              const downloadURL = await getDownloadURL(snapshot.ref);
              return {
                src: downloadURL,
                alt: image.name,
                localPath: downloadURL,
              };
            })
          );
          return {
            day: item.day,
            content: item.content,
            images: scheduleImageUrls,
          };
        })
      );

      // Prepare data for Firestore
      const productData = {
        title: formData.title,
        description: formData.description,
        price: {
          adult: Number(formData.price.adult),
          child: Number(formData.price.child),
          infant: Number(formData.price.infant),
          fuelSurcharge: Number(formData.price.fuelSurcharge),
        },
        images: imageUrls,
        schedule: scheduleWithImages,
        luggage: {
          airline: formData.luggage.airline,
          economy: {
            weight: formData.luggage.economy.weight,
            size: formData.luggage.economy.size,
            extraFee: formData.luggage.economy.extraFee,
          },
          carryOn: {
            weight: formData.luggage.carryOn.weight,
            size: formData.luggage.carryOn.size,
            standardSize: formData.luggage.carryOn.standardSize,
          },
        },
        insurance: {
          content: formData.insurance.content,
        },
        notice: {
          reservation: {
            category: formData.notice.reservation.category,
            content: formData.notice.reservation.content,
          },
          terms: {
            category: formData.notice.terms.category,
            content: formData.notice.terms.content,
          },
          safety: {
            category: formData.notice.safety.category,
            content: formData.notice.safety.content,
          },
        },
        highlights: formData.highlights,
        createdAt: new Date().toISOString(),
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'travel_products'), productData);

      router.push(`/travel/free_travel/${docRef.id}`);
    } catch (error) {
      console.error('Error creating travel product:', error);
      alert('여행 상품 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">상품명</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">상품 설명</label>
              <textarea
                required
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">성인 가격</label>
                <input
                  type="number"
                  required
                  value={formData.price.adult}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      price: { ...formData.price, adult: e.target.value },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">아동 가격</label>
                <input
                  type="number"
                  required
                  value={formData.price.child}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      price: { ...formData.price, child: e.target.value },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">유아 가격</label>
                <input
                  type="number"
                  required
                  value={formData.price.infant}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      price: { ...formData.price, infant: e.target.value },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">유류할증료</label>
                <input
                  type="number"
                  required
                  value={formData.price.fuelSurcharge}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      price: { ...formData.price, fuelSurcharge: e.target.value },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">이미지</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-4">
            {formData.schedule.map((item, index) => (
              <div key={index} className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-1/4">
                    <label className="block text-sm font-medium text-gray-700">일차</label>
                    <input
                      type="text"
                      value={item.day}
                      onChange={e => {
                        const newSchedule = [...formData.schedule];
                        newSchedule[index] = { ...item, day: e.target.value };
                        setFormData({ ...formData, schedule: newSchedule });
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">일정</label>
                    <textarea
                      value={item.content}
                      onChange={e => {
                        const newSchedule = [...formData.schedule];
                        newSchedule[index] = { ...item, content: e.target.value };
                        setFormData({ ...formData, schedule: newSchedule });
                      }}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    일정 이미지 (최대 3장)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={e => handleScheduleImageChange(index, e)}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {item.images && item.images.length > 0 && (
                    <div className="mt-2 flex gap-2">
                      {item.images.map((image, imageIndex) => (
                        <div key={imageIndex} className="relative size-24">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`${item.day} 이미지 ${imageIndex + 1}`}
                            className="size-full rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newSchedule = [...formData.schedule];
                              newSchedule[index].images = item.images.filter(
                                (_, i) => i !== imageIndex
                              );
                              setFormData({ ...formData, schedule: newSchedule });
                            }}
                            className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  schedule: [...formData.schedule, { day: '', content: '', images: [] }],
                })
              }
              className="mt-4 rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
            >
              일정 추가
            </button>
          </div>
        );

      case 'luggage':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">항공사</label>
              <input
                type="text"
                value={formData.luggage.airline}
                onChange={e =>
                  setFormData({
                    ...formData,
                    luggage: { ...formData.luggage, airline: e.target.value },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="mb-2 text-lg font-medium">위탁 수하물</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">무게 제한</label>
                    <input
                      type="text"
                      value={formData.luggage.economy.weight}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          luggage: {
                            ...formData.luggage,
                            economy: { ...formData.luggage.economy, weight: e.target.value },
                          },
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">크기 제한</label>
                    <input
                      type="text"
                      value={formData.luggage.economy.size}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          luggage: {
                            ...formData.luggage,
                            economy: { ...formData.luggage.economy, size: e.target.value },
                          },
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">초과 요금</label>
                    <input
                      type="text"
                      value={formData.luggage.economy.extraFee}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          luggage: {
                            ...formData.luggage,
                            economy: { ...formData.luggage.economy, extraFee: e.target.value },
                          },
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-medium">기내 수하물</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">무게 제한</label>
                    <input
                      type="text"
                      value={formData.luggage.carryOn.weight}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          luggage: {
                            ...formData.luggage,
                            carryOn: { ...formData.luggage.carryOn, weight: e.target.value },
                          },
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">크기 제한</label>
                    <input
                      type="text"
                      value={formData.luggage.carryOn.size}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          luggage: {
                            ...formData.luggage,
                            carryOn: { ...formData.luggage.carryOn, size: e.target.value },
                          },
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">표준 규격</label>
                    <input
                      type="text"
                      value={formData.luggage.carryOn.standardSize}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          luggage: {
                            ...formData.luggage,
                            carryOn: { ...formData.luggage.carryOn, standardSize: e.target.value },
                          },
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'insurance':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700">보험 정보</label>
            <textarea
              value={formData.insurance.content}
              onChange={e =>
                setFormData({
                  ...formData,
                  insurance: { ...formData.insurance, content: e.target.value },
                })
              }
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        );

      case 'notice':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-medium">예약 안내</h3>
              <textarea
                value={formData.notice.reservation.content}
                onChange={e =>
                  setFormData({
                    ...formData,
                    notice: {
                      ...formData.notice,
                      reservation: {
                        ...formData.notice.reservation,
                        content: e.target.value,
                      },
                    },
                  })
                }
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <h3 className="mb-2 text-lg font-medium">약관 정보</h3>
              <textarea
                value={formData.notice.terms.content}
                onChange={e =>
                  setFormData({
                    ...formData,
                    notice: {
                      ...formData.notice,
                      terms: {
                        ...formData.notice.terms,
                        content: e.target.value,
                      },
                    },
                  })
                }
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <h3 className="mb-2 text-lg font-medium">해외 안전 정보</h3>
              <textarea
                value={formData.notice.safety.content}
                onChange={e =>
                  setFormData({
                    ...formData,
                    notice: {
                      ...formData.notice,
                      safety: {
                        ...formData.notice.safety,
                        content: e.target.value,
                      },
                    },
                  })
                }
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'highlights':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-medium">음식</h3>
              {formData.highlights.meals.map((meal, index) => (
                <div key={index} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">제목</label>
                  <input
                    type="text"
                    value={meal.title}
                    onChange={e => {
                      const newMeals = [...formData.highlights.meals];
                      newMeals[index] = { ...meal, title: e.target.value };
                      setFormData({
                        ...formData,
                        highlights: { ...formData.highlights, meals: newMeals },
                      });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <label className="block text-sm font-medium text-gray-700">설명</label>
                  <textarea
                    value={meal.description}
                    onChange={e => {
                      const newMeals = [...formData.highlights.meals];
                      newMeals[index] = { ...meal, description: e.target.value };
                      setFormData({
                        ...formData,
                        highlights: { ...formData.highlights, meals: newMeals },
                      });
                    }}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    highlights: {
                      ...formData.highlights,
                      meals: [...formData.highlights.meals, { title: '', description: '' }],
                    },
                  })
                }
                className="mt-4 rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
              >
                음식 추가
              </button>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-medium">숙박</h3>
              {formData.highlights.accommodations.map((accommodation, index) => (
                <div key={index} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">제목</label>
                  <input
                    type="text"
                    value={accommodation.title}
                    onChange={e => {
                      const newAccommodations = [...formData.highlights.accommodations];
                      newAccommodations[index] = { ...accommodation, title: e.target.value };
                      setFormData({
                        ...formData,
                        highlights: { ...formData.highlights, accommodations: newAccommodations },
                      });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <label className="block text-sm font-medium text-gray-700">설명</label>
                  <textarea
                    value={accommodation.description}
                    onChange={e => {
                      const newAccommodations = [...formData.highlights.accommodations];
                      newAccommodations[index] = { ...accommodation, description: e.target.value };
                      setFormData({
                        ...formData,
                        highlights: { ...formData.highlights, accommodations: newAccommodations },
                      });
                    }}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    highlights: {
                      ...formData.highlights,
                      accommodations: [
                        ...formData.highlights.accommodations,
                        { title: '', description: '' },
                      ],
                    },
                  })
                }
                className="mt-4 rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
              >
                숙박 추가
              </button>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-medium">보험</h3>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">제목</label>
                <input
                  type="text"
                  value={formData.highlights.insurance.title}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      highlights: {
                        ...formData.highlights,
                        insurance: { ...formData.highlights.insurance, title: e.target.value },
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <label className="block text-sm font-medium text-gray-700">설명</label>
                <textarea
                  value={formData.highlights.insurance.description}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      highlights: {
                        ...formData.highlights,
                        insurance: {
                          ...formData.highlights.insurance,
                          description: e.target.value,
                        },
                      },
                    })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <label className="block text-sm font-medium text-gray-700">상세</label>
                <textarea
                  value={formData.highlights.insurance.details}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      highlights: {
                        ...formData.highlights,
                        insurance: { ...formData.highlights.insurance, details: e.target.value },
                      },
                    })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-medium">포함 항목</h3>
              {formData.highlights.included.map((item, index) => (
                <div key={index} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">항목</label>
                  <input
                    type="text"
                    value={item}
                    onChange={e => {
                      const newIncluded = [...formData.highlights.included];
                      newIncluded[index] = e.target.value;
                      setFormData({
                        ...formData,
                        highlights: { ...formData.highlights, included: newIncluded },
                      });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    highlights: {
                      ...formData.highlights,
                      included: [...formData.highlights.included, ''],
                    },
                  })
                }
                className="mt-4 rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
              >
                포함 항목 추가
              </button>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-medium">제외 항목</h3>
              {formData.highlights.excluded.map((item, index) => (
                <div key={index} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">항목</label>
                  <input
                    type="text"
                    value={item}
                    onChange={e => {
                      const newExcluded = [...formData.highlights.excluded];
                      newExcluded[index] = e.target.value;
                      setFormData({
                        ...formData,
                        highlights: { ...formData.highlights, excluded: newExcluded },
                      });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    highlights: {
                      ...formData.highlights,
                      excluded: [...formData.highlights.excluded, ''],
                    },
                  })
                }
                className="mt-4 rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
              >
                제외 항목 추가
              </button>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-medium">가이드</h3>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">제목</label>
                <input
                  type="text"
                  value={formData.highlights.guide.title}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      highlights: {
                        ...formData.highlights,
                        guide: { ...formData.highlights.guide, title: e.target.value },
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <label className="block text-sm font-medium text-gray-700">설명</label>
                <textarea
                  value={formData.highlights.guide.description}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      highlights: {
                        ...formData.highlights,
                        guide: { ...formData.highlights.guide, description: e.target.value },
                      },
                    })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-medium">자유일정</h3>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">제목</label>
                <input
                  type="text"
                  value={formData.highlights.freeTime.title}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      highlights: {
                        ...formData.highlights,
                        freeTime: { ...formData.highlights.freeTime, title: e.target.value },
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <label className="block text-sm font-medium text-gray-700">설명</label>
                <textarea
                  value={formData.highlights.freeTime.description}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      highlights: {
                        ...formData.highlights,
                        freeTime: { ...formData.highlights.freeTime, description: e.target.value },
                      },
                    })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );
    }
  };

  const renderExample = () => {
    if (!showExample) return null;

    switch (currentStep) {
      case 'basic':
        return (
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-medium">예시</h3>
            <p className="mb-2 text-sm text-gray-600">{exampleData.basic.title}</p>
            <p className="text-sm text-gray-600">{exampleData.basic.description}</p>
          </div>
        );
      case 'schedule':
        return (
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-medium">예시</h3>
            {exampleData.schedule.map((item, index) => (
              <div key={index} className="mb-2">
                <p className="text-sm font-medium">{item.day}</p>
                <p className="whitespace-pre-line text-sm text-gray-600">{item.content}</p>
              </div>
            ))}
          </div>
        );
      case 'luggage':
        return (
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-medium">예시</h3>
            <p className="mb-1 text-sm font-medium">{exampleData.luggage.airline}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">위탁 수하물</p>
                <p className="text-sm text-gray-600">무게: {exampleData.luggage.economy.weight}</p>
                <p className="text-sm text-gray-600">크기: {exampleData.luggage.economy.size}</p>
                <p className="text-sm text-gray-600">
                  초과요금: {exampleData.luggage.economy.extraFee}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">기내 수하물</p>
                <p className="text-sm text-gray-600">무게: {exampleData.luggage.carryOn.weight}</p>
                <p className="text-sm text-gray-600">크기: {exampleData.luggage.carryOn.size}</p>
                <p className="text-sm text-gray-600">
                  표준규격: {exampleData.luggage.carryOn.standardSize}
                </p>
              </div>
            </div>
          </div>
        );
      case 'insurance':
        return (
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-medium">예시</h3>
            <p className="whitespace-pre-line text-sm text-gray-600">
              {exampleData.insurance.content}
            </p>
          </div>
        );
      case 'notice':
        return (
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-medium">예시</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">{exampleData.notice.reservation.category}</p>
                <p className="whitespace-pre-line text-sm text-gray-600">
                  {exampleData.notice.reservation.content}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">{exampleData.notice.terms.category}</p>
                <p className="whitespace-pre-line text-sm text-gray-600">
                  {exampleData.notice.terms.content}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">{exampleData.notice.safety.category}</p>
                <p className="whitespace-pre-line text-sm text-gray-600">
                  {exampleData.notice.safety.content}
                </p>
              </div>
            </div>
          </div>
        );
      case 'highlights':
        return (
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-medium">예시</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">음식</p>
                {exampleData.highlights.meals.map((meal, index) => (
                  <div key={index} className="space-y-2">
                    <p className="text-sm font-medium">{meal.title}</p>
                    <p className="whitespace-pre-line text-sm text-gray-600">{meal.description}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium">숙박</p>
                {exampleData.highlights.accommodations.map((accommodation, index) => (
                  <div key={index} className="space-y-2">
                    <p className="text-sm font-medium">{accommodation.title}</p>
                    <p className="whitespace-pre-line text-sm text-gray-600">
                      {accommodation.description}
                    </p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium">보험</p>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{exampleData.highlights.insurance.title}</p>
                  <p className="whitespace-pre-line text-sm text-gray-600">
                    {exampleData.highlights.insurance.description}
                  </p>
                  <p className="whitespace-pre-line text-sm text-gray-600">
                    {exampleData.highlights.insurance.details}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">포함 항목</p>
                {exampleData.highlights.included.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <p className="text-sm font-medium">{item}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium">제외 항목</p>
                {exampleData.highlights.excluded.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <p className="text-sm font-medium">{item}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium">가이드</p>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{exampleData.highlights.guide.title}</p>
                  <p className="whitespace-pre-line text-sm text-gray-600">
                    {exampleData.highlights.guide.description}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">자유일정</p>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{exampleData.highlights.freeTime.title}</p>
                  <p className="whitespace-pre-line text-sm text-gray-600">
                    {exampleData.highlights.freeTime.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">여행 상품 등록</h1>

      {/* Step Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-4">
          {steps.map(step => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`rounded-lg px-4 py-2 ${
                currentStep === step.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {step.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex gap-8">
        <form onSubmit={handleSubmit} className="flex-1 space-y-6">
          <div className="rounded-lg bg-white p-6 shadow-md">{renderStepContent()}</div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            {currentStep !== 'basic' && (
              <button
                type="button"
                onClick={() => {
                  const currentIndex = steps.findIndex(step => step.id === currentStep);
                  setCurrentStep(steps[currentIndex - 1].id);
                }}
                className="rounded-lg bg-gray-100 px-6 py-2 text-gray-700 hover:bg-gray-200"
              >
                이전
              </button>
            )}
            {currentStep !== 'highlights' ? (
              <button
                type="button"
                onClick={() => {
                  const currentIndex = steps.findIndex(step => step.id === currentStep);
                  setCurrentStep(steps[currentIndex + 1].id);
                }}
                className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
              >
                다음
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:bg-blue-400"
              >
                {loading ? '등록 중...' : '등록하기'}
              </button>
            )}
          </div>
        </form>

        {/* Example Panel */}
        <div className="w-96">
          <div className="sticky top-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium">예시 보기</h2>
              <button
                onClick={() => setShowExample(!showExample)}
                className="text-gray-500 hover:text-gray-700"
              >
                {showExample ? '숨기기' : '보기'}
              </button>
            </div>
            {showExample && (
              <div className="space-y-4">
                {renderExample()}
                <button
                  onClick={handleApplyExample}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  예시 적용하기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 동적 페이지로 설정 (정적 생성 방지)
export const dynamic = 'force-dynamic';
// ISR 비활성화
export const revalidate = 0;
