'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-2">
          <Link href="/" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            홈으로 돌아가기
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">이용 약관</h1>
        <p className="text-gray-500 mt-2">최종 업데이트: 2025년 5월 28일</p>
      </div>

      <div className="prose max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. 서비스 이용 약관</h2>
          <p>
            본 이용 약관은 트래블 서비스(이하 &quot;서비스&quot;)의 이용 조건을 정의합니다. 서비스를 이용함으로써 귀하는 본 약관에 동의하게 됩니다.
          </p>
          <p>
            당사는 서비스의 품질 향상을 위해 사전 통지 없이 서비스의 일부 또는 전체를 수정, 변경, 중단할 수 있습니다. 이로 인해 발생하는 문제에 대해 당사는 책임을 지지 않습니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. 회원 가입 및 계정</h2>
          <p>
            서비스 이용을 위해서는 회원 가입이 필요할 수 있으며, 가입 시 정확한 개인 정보를 제공해야 합니다. 회원은 계정 정보의 보안을 유지할 책임이 있으며, 계정 활동에 대한 모든 책임을 집니다.
          </p>
          <p>
            다음과 같은 경우 당사는 회원 자격을 정지하거나 해지할 수 있습니다:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>허위 정보 제공</li>
            <li>타인의 서비스 이용 방해</li>
            <li>서비스의 운영을 방해하는 행위</li>
            <li>관련 법령, 약관, 정책을 위반하는 행위</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. 결제 및 환불 정책</h2>
          <p>
            서비스 이용 요금은 상품 페이지에 명시된 금액을 기준으로 합니다. 결제는 신용카드, 무통장 입금, 카카오페이, 토스페이 등 당사가 지정한 방법으로 이루어집니다.
          </p>
          <p>
            환불 정책은 다음과 같습니다:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>여행 상품: 출발 7일 전 취소 시 100% 환불, 3-6일 전 70% 환불, 1-2일 전 50% 환불, 당일 취소 환불 불가</li>
            <li>숙박 상품: 체크인 3일 전 취소 시 100% 환불, 1-2일 전 70% 환불, 당일 취소 환불 불가</li>
            <li>기타 상품: 각 상품별 페이지에 명시된 환불 정책을 따름</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. 개인정보 처리방침</h2>
          <p>
            당사는 개인정보보호법에 따라 이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하게 처리할 것입니다.
          </p>
          <p>
            수집하는 개인정보 항목:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>필수항목: 이름, 이메일 주소, 전화번호, 생년월일</li>
            <li>선택항목: 성별, 여권번호, 여권만료일, 국적</li>
          </ul>
          <p className="mt-2">
            개인정보의 수집 및 이용 목적:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>서비스 제공 및 계약 이행</li>
            <li>회원 관리</li>
            <li>마케팅 및 광고에 활용 (선택적 동의 시)</li>
          </ul>
          <p className="mt-2">
            개인정보의 보유 및 이용 기간: 회원 탈퇴 시까지 또는 법정 보유기간
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. 책임 제한</h2>
          <p>
            당사는 천재지변, 전쟁, 테러, 폭동, 노동쟁의, 감염병 등 불가항력적인 사유로 인한 서비스 제공 중단에 대해 책임을 지지 않습니다.
          </p>
          <p>
            당사는 이용자가 서비스를 이용하여 기대하는 수익을 상실한 것에 대한 책임과 그 밖에 서비스를 통해 얻은 자료로 인한 손해에 대하여 책임을 지지 않습니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">6. 준거법 및 분쟁 해결</h2>
          <p>
            본 약관은 대한민국 법률에 따라 규율되고 해석됩니다. 서비스 이용과 관련하여 당사와 이용자 간에 발생한 분쟁은 우선 양 당사자 간의 협의를 통해 해결하며, 협의가 이루어지지 않을 경우 관련 법령에 따라 처리합니다.
          </p>
        </section>
      </div>

      <div className="mt-8 border-t pt-6">
        <p className="text-sm text-gray-500">
          본 이용 약관에 동의하시면 서비스 이용이 가능합니다. 약관에 동의하지 않는 경우 서비스 이용이 제한될 수 있습니다.
        </p>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => window.close()}>
            확인 및 창 닫기
          </Button>
        </div>
      </div>
    </div>
  );
}
