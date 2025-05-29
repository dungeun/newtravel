"use client";

import { useCartStore } from "@/app/lib/store/cartStore";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function OrderPage() {
  const { items, totalAmount, clearCart } = useCartStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [payment, setPayment] = useState("card");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0 && !success) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">주문할 상품이 없습니다.</h2>
        <Link href="/travel" className="text-blue-600 underline">상품 보러가기</Link>
      </div>
    );
  }

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !phone) {
      setError("이름, 이메일, 연락처를 모두 입력하세요.");
      return;
    }
    setSubmitting(true);
    // 모의 주문 생성 (실제 결제/주문 저장은 생략)
    setTimeout(() => {
      clearCart();
      setSuccess(true);
      setSubmitting(false);
    }, 1200);
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">주문이 완료되었습니다!</h2>
        <p className="mb-4">주문 내역은 마이페이지 또는 이메일로 확인하실 수 있습니다.</p>
        <Link href="/travel" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">메인으로</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">주문/결제</h2>
      <div className="mb-8 space-y-4">
        {items.map((item, idx) => (
          <div key={item.productId + idx} className="flex items-center gap-4 border rounded-lg p-3">
            <div className="w-20 h-16 relative flex-shrink-0">
              <Image src={item.product.images?.[0]?.url || "/no-image.png"} alt={item.product.images?.[0]?.alt ?? item.product.title} fill className="object-cover rounded" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{item.product.title}</div>
              <div className="text-sm text-gray-500">{item.travelDate.startDate} ~ {item.travelDate.endDate}</div>
              <div className="text-sm">성인 {item.quantity.adult}, 아동 {item.quantity.child}, 유아 {item.quantity.infant}</div>
            </div>
            <div className="font-bold text-blue-600">{item.subtotal.toLocaleString()}원</div>
          </div>
        ))}
      </div>
      <div className="mb-6 text-right text-xl font-bold">총 합계: {totalAmount.toLocaleString()}원</div>
      <form onSubmit={handleOrder} className="space-y-4">
        <div className="flex gap-4">
          <input type="text" placeholder="이름" value={name} onChange={e => setName(e.target.value)} className="border rounded px-3 py-2 flex-1" />
          <input type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} className="border rounded px-3 py-2 flex-1" />
        </div>
        <input type="tel" placeholder="연락처" value={phone} onChange={e => setPhone(e.target.value)} className="border rounded px-3 py-2 w-full" />
        <div className="flex gap-4 items-center">
          <label className="font-medium">결제수단</label>
          <select value={payment} onChange={e => setPayment(e.target.value)} className="border rounded px-2 py-1">
            <option value="card">신용/체크카드</option>
            <option value="bank">무통장입금</option>
            <option value="kakao">카카오페이</option>
          </select>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded text-lg font-bold hover:bg-blue-700 disabled:opacity-60" disabled={submitting}>{submitting ? "주문 처리 중..." : "결제하기"}</button>
      </form>
    </div>
  );
} 