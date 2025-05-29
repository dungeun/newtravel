import { TravelProduct } from '@/types';
import Image from 'next/image';

interface RegionalTravelSectionProps {
  travelProducts: TravelProduct[];
  loading: boolean;
}

const RegionalTravelSection = ({ travelProducts, loading }: RegionalTravelSectionProps) => {
  return (
    <section className="section-destinations bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-4xl font-bold text-teal-700">지역별 여행</h2>
          <p className="mx-auto max-w-2xl text-gray-600">
            몽골의 다양한 지역별 특색 있는 여행 상품을 만나보세요
          </p>
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <div className="col-span-4 flex justify-center py-12">
              <div className="size-12 animate-spin rounded-full border-y-2 border-teal-500"></div>
            </div>
          ) : travelProducts.length > 0 ? (
            travelProducts.map(product => (
              <div
                key={product.id}
                className="destination-card overflow-hidden rounded-lg bg-white shadow-md transition-transform hover:-translate-y-1"
              >
                <a href={`/travel/free_travel/${product.id}`} className="block">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={product.images[0]?.src || product.images[0]?.localPath || '/img/placeholder.jpg'}
                      alt={product.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover"
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEggJ/j7KPJAAAAABJRU5ErkJggg=="
                    />
                    <div className="absolute bottom-2 right-2 rounded-full bg-teal-600 px-2 py-1 text-xs font-semibold text-white">
                      {product.region}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="mb-2 text-xl font-bold text-teal-700">{product.title}</h3>
                    <p className="mb-2 line-clamp-2 text-sm text-gray-600">{product.description}</p>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-gray-500">지역:</span> {product.region}
                      </div>
                      <div className="font-bold text-red-600">
                        {product.price.adult.toLocaleString()}원~
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div className="flex items-center text-sm">
                        {product.theme && (
                          <span className="mr-2 rounded-full bg-teal-100 px-2 py-0.5 text-xs text-teal-800">
                            {product.theme}
                          </span>
                        )}
                      </div>
                      <span className="rounded-md bg-teal-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-teal-700">
                        상세보기
                      </span>
                    </div>
                  </div>
                </a>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-12 text-center">
              <p className="text-lg text-gray-500">현재 등록된 여행 상품이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RegionalTravelSection;
