import { TravelProduct } from '@/types';
import Image from 'next/image';

interface PromotionSectionProps {
  promotionProducts: TravelProduct[];
  loading: boolean;
}

const PromotionSection = ({ promotionProducts, loading }: PromotionSectionProps) => {
  return (
    <section className="section-promotions bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-4xl font-bold text-teal-700">특가 프로모션</h2>
          <p className="mx-auto max-w-2xl text-gray-600">
            놓치면 후회할 특별한 가격의 몽골 여행 상품
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="size-12 animate-spin rounded-full border-y-2 border-teal-500"></div>
            </div>
          ) : promotionProducts.length > 0 ? (
            <div className="overflow-hidden rounded-lg bg-white shadow-md">
              <div className="flex flex-col md:flex-row">
                <div className="relative h-64 md:h-auto md:w-1/2">
                  <Image
                    src={promotionProducts[0].images[0]?.src || promotionProducts[0].images[0]?.localPath || '/img/naadam.jpg'}
                    alt={promotionProducts[0].title || '나담축제 특가'}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEggJ/j7KPJAAAAABJRU5ErkJggg=="
                  />
                  <div className="absolute right-0 top-0 bg-red-600 px-3 py-1 text-sm font-bold text-white">
                    {promotionProducts[0].discountRate || 30}% OFF
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent md:hidden"></div>
                  <div className="absolute left-4 top-4 text-xl font-bold text-white md:hidden">
                    {promotionProducts[0].title || '나담축제 특가'}
                  </div>
                </div>
                <div className="flex flex-col justify-center p-6 md:w-1/2 md:p-8">
                  <h3 className="mb-3 text-2xl font-bold text-gray-800">
                    {promotionProducts[0].title || '나담축제 얼리버드 특가'}
                  </h3>
                  <p className="mb-4 text-gray-600">
                    {promotionProducts[0].description ||
                      '몽골 최대 축제인 나담축제를 경험할 수 있는 특별 패키지! 3개월 전 예약 시 30% 할인된 가격으로 제공됩니다.'}
                  </p>
                  <div className="mb-4 text-lg font-bold text-red-600">
                    <span className="mr-2 text-gray-500 line-through">
                      {(
                        promotionProducts[0].originalPrice ||
                        Math.round(promotionProducts[0].price.adult * 1.3)
                      ).toLocaleString()}
                      원
                    </span>
                    {promotionProducts[0].price.adult.toLocaleString()}원
                  </div>
                  <a
                    href={`/travel/free_travel/${promotionProducts[0].id}`}
                    className="self-start rounded-full bg-amber-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-amber-700"
                  >
                    지금 예약하기
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-lg text-gray-500">현재 등록된 특가 상품이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PromotionSection;
