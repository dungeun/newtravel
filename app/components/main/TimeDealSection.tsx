import { TravelProduct } from '@/types';
import { FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

interface TimeDealSectionProps {
  timeDealProducts: TravelProduct[];
  loading: boolean;
}

const TimeDealSection = ({ timeDealProducts, loading }: TimeDealSectionProps) => {
  return (
    <section className="section-time-deals bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-4xl font-bold text-teal-700">타임딜</h2>
          <p className="mx-auto max-w-2xl text-gray-600">
            지금 이 순간만 만날 수 있는 특별한 가격의 한정 상품
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-3 flex justify-center py-12">
              <div className="size-12 animate-spin rounded-full border-y-2 border-teal-500"></div>
            </div>
          ) : timeDealProducts.length > 0 ? (
            timeDealProducts.map(product => (
              <div
                key={product.id}
                className="time-deal-card relative overflow-hidden rounded-lg bg-white shadow-md transition-transform hover:-translate-y-1"
              >
                <Link href={`/travel/free_travel/${product.id}`} className="block">
                  <div className="absolute right-4 top-4 z-10 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase text-white">
                    타임딜
                  </div>
                  <div className="absolute left-4 top-4 z-10 flex items-center rounded-md bg-white/90 px-2 py-1 text-sm text-gray-800 shadow-sm backdrop-blur-sm">
                    <FaClock className="mr-1 text-amber-600" />
                    <span>12:34:56</span>
                  </div>
                  <div className="relative h-48">
                    <Image
                      src={product.images[0]?.src || product.images[0]?.localPath || '/img/placeholder.jpg'}
                      alt={product.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEggJ/j7KPJAAAAABJRU5ErkJggg=="
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="mb-2 line-clamp-1 text-xl font-bold text-gray-800">
                      {product.title}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-sm text-gray-600">{product.description}</p>
                    <div className="mb-4">
                      <div className="mb-1 flex items-center gap-1 text-sm">
                        <FaMapMarkerAlt className="text-teal-600" />
                        <span>{product.region}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-500 line-through">1,550,000원</div>
                        <div className="text-lg font-bold text-red-600">
                          {product.price.adult.toLocaleString()}원~
                        </div>
                      </div>
                      <span className="rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-amber-700">
                        예약하기
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-500">현재 진행 중인 타임딜 상품이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TimeDealSection;
