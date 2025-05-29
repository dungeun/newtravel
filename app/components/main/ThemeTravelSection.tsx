import { TravelProduct } from '@/types';
import { FaMapMarkerAlt } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

interface ThemeTravelSectionProps {
  themeProducts: TravelProduct[];
  loading: boolean;
}

const ThemeTravelSection = ({ themeProducts, loading }: ThemeTravelSectionProps) => {
  return (
    <section className="section-themes bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-4xl font-bold text-teal-700">테마별 여행</h2>
          <p className="mx-auto max-w-2xl text-gray-600">
            관심사와 취향에 맞는 특별한 테마여행을 찾아보세요
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          {loading ? (
            <div className="col-span-3 flex justify-center py-12">
              <div className="size-12 animate-spin rounded-full border-y-2 border-teal-500"></div>
            </div>
          ) : themeProducts.length > 0 ? (
            themeProducts.map(product => (
              <div
                key={product.id}
                className="theme-card overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <Link href={`/travel/free_travel/${product.id}`} className="block">
                  <div className="relative h-56">
                    <Image
                      src={product.images[0]?.src || product.images[0]?.localPath || '/img/placeholder.jpg'}
                      alt={product.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEggJ/j7KPJAAAAABJRU5ErkJggg=="
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                      <div className="mb-2 inline-block rounded-full bg-teal-600 px-3 py-1 text-xs font-semibold">
                        {product.theme || '모험여행'}
                      </div>
                      <h3 className="mb-1 line-clamp-1 text-xl font-bold">{product.title}</h3>
                      <p className="line-clamp-2 text-sm opacity-90">{product.description}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaMapMarkerAlt className="text-teal-600" />
                        <span>{product.region}</span>
                      </div>
                      <div className="text-lg font-bold text-teal-700">
                        {product.price.adult.toLocaleString()}원~
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <span className="inline-block w-full rounded bg-teal-600 py-2 font-medium text-white transition-colors hover:bg-teal-700">
                        상세보기
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-12 text-center">
              <p className="text-gray-500">현재 테마별 여행 상품이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ThemeTravelSection;
