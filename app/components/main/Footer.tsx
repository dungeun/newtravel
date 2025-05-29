const Footer = () => {
  return (
    <>
      {/* 뉴스레터 섹션 */}
      <section className="newsletter bg-teal-700 py-12 text-center text-white">
        <div className="container mx-auto px-4">
          <h2 className="mb-3 text-3xl font-bold">몽골 여행 소식 받기</h2>
          <p className="mb-6">특별한 프로모션과 여행 팁을 이메일로 받아보세요</p>
          <form className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="이메일 주소를 입력하세요"
              className="flex-1 rounded-md px-4 py-3 text-gray-800"
              required
            />
            <button
              type="submit"
              className="rounded-md bg-amber-600 px-6 py-3 font-bold transition-colors hover:bg-amber-700"
            >
              구독하기
            </button>
          </form>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h3 className="mb-2 text-2xl font-bold">초원의별</h3>
            <p className="text-gray-400">주식회사 초원의별이 제공하는 특별한 몽골 여행</p>
          </div>

          <div className="grid grid-cols-1 gap-8 border-t border-gray-700 pt-8 md:grid-cols-3">
            <div>
              <h4 className="mb-4 text-lg font-bold">공지사항</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="block transition-colors hover:text-teal-400">
                    <span className="block">
                      [당첨자 발표] 4.24 이지타임딜 첫방송(튀르키예) 이벤트 당첨자 공지
                    </span>
                    <span className="text-sm text-gray-400">2025-04-22</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="block transition-colors hover:text-teal-400">
                    <span className="block">[공지] 몽골 여행 일정 변경 안내</span>
                    <span className="text-sm text-gray-400">2025-04-15</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="block transition-colors hover:text-teal-400">
                    <span className="block">[안내] 2025년 나담축제 패키지 사전 예약 오픈</span>
                    <span className="text-sm text-gray-400">2025-04-10</span>
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-lg font-bold">고객센터</h4>
              <ul className="space-y-3">
                <li>
                  <p className="text-lg font-bold text-teal-400">1588-1234</p>
                  <p className="text-sm text-gray-400">평일 09:00 - 18:00 (점심시간 12:00 - 13:00)</p>
                </li>
                <li>
                  <p className="text-sm">이메일: info@chowonesstar.com</p>
                </li>
                <li>
                  <p className="text-sm">카카오톡: @초원의별</p>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-lg font-bold">회사정보</h4>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>상호명: 주식회사 초원의별</li>
                <li>대표: 홍길동</li>
                <li>사업자등록번호: 123-45-67890</li>
                <li>통신판매업신고: 제2025-서울강남-1234호</li>
                <li>관광사업자등록번호: 제2025-01호</li>
                <li>주소: 서울특별시 강남구 테헤란로 123, 7층</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 초원의별 All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
