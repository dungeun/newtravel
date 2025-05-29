const ReviewSection = () => {
  return (
    <section className="section-reviews bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-4xl font-bold text-teal-700">여행 후기</h2>
          <p className="mx-auto max-w-2xl text-gray-600">
            실제 여행자들의 생생한 몽골 여행 이야기
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="review-card rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center">
              <div className="mr-3 flex size-12 items-center justify-center rounded-full bg-teal-100 text-xl font-bold text-teal-700">
                김
              </div>
              <div>
                <h4 className="font-bold text-gray-800">김지민</h4>
                <div className="text-amber-400">★★★★★</div>
              </div>
            </div>
            <p className="text-gray-600">
              고비사막 투어는 정말 환상적이었습니다. 가이드도 친절하고 전문적이었으며, 사막에서의
              하룻밤은 평생 잊지 못할 경험이 되었어요. 별이 쏟아지는 밤하늘은 정말 장관이었습니다.
            </p>
          </div>

          <div className="review-card rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center">
              <div className="mr-3 flex size-12 items-center justify-center rounded-full bg-teal-100 text-xl font-bold text-teal-700">
                이
              </div>
              <div>
                <h4 className="font-bold text-gray-800">이준호</h4>
                <div className="text-amber-400">★★★★★</div>
              </div>
            </div>
            <p className="text-gray-600">
              유목민 가정 홈스테이는 정말 특별한 경험이었습니다. 말 타기, 양 젖 짜기, 전통 음식
              만들기 등 다양한 체험을 할 수 있었고, 유목민들의 따뜻한 환대가 인상적이었어요.
            </p>
          </div>

          <div className="review-card rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center">
              <div className="mr-3 flex size-12 items-center justify-center rounded-full bg-teal-100 text-xl font-bold text-teal-700">
                박
              </div>
              <div>
                <h4 className="font-bold text-gray-800">박서연</h4>
                <div className="text-amber-400">★★★★☆</div>
              </div>
            </div>
            <p className="text-gray-600">
              나담축제 기간에 방문했는데, 몽골의 전통 스포츠와 문화를 한 번에 볼 수 있어서
              좋았습니다. 특히 말타기 경주와 씨름 대회는 정말 흥미진진했어요. 다만 사람이 너무
              많아 조금 불편했습니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
