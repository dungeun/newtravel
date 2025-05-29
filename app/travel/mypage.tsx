"use client";

import { useState } from "react";
import Link from "next/link";

// Mock order data (replace with real data fetching in production)
const mockOrders = [
  {
    id: "order1",
    email: "test@example.com",
    createdAt: "2024-06-01",
    items: [
      { title: "동남아 패키지", startDate: "2024-07-01", endDate: "2024-07-05", adult: 2, child: 1, subtotal: 1200000 },
      { title: "제주 자유여행", startDate: "2024-08-10", endDate: "2024-08-13", adult: 1, child: 0, subtotal: 450000 },
    ],
    total: 1650000,
    status: "완료"
  },
  {
    id: "order2",
    email: "test@example.com",
    createdAt: "2024-05-15",
    items: [
      { title: "일본 온천여행", startDate: "2024-06-20", endDate: "2024-06-23", adult: 2, child: 0, subtotal: 980000 },
    ],
    total: 980000,
    status: "완료"
  }
];

export default function MyPage() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrders([]);
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "주문 조회 실패");
        setOrders([]);
      } else {
        setOrders(result.orders || []);
      }
    } catch (err) {
      setError("주문 조회 중 오류가 발생했습니다.");
      setOrders([]);
    }
    setSearched(true);
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">마이페이지 - 주문 조회</h2>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="email"
          placeholder="이메일 입력"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">조회</button>
      </form>
      {loading && <div className="text-center text-gray-500">조회 중...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}
      {searched && !loading && !error && orders.length === 0 && (
        <div className="text-center text-gray-500">주문 내역이 없습니다.</div>
      )}
      {orders.map(order => (
        <div key={order.id} className="mb-6 border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="font-semibold">주문번호: {order.id}</div>
            <div className="text-sm text-gray-500">{order.createdAt}</div>
          </div>
          <div className="mb-2 text-sm">상태: <span className="font-bold text-green-600">{order.status}</span></div>
          <div className="mb-2">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between text-sm mb-1">
                <div>
                  <span className="font-medium">{item.title}</span> ({item.startDate}~{item.endDate})
                  <span className="ml-2">성인 {item.adult}, 아동 {item.child}</span>
                </div>
                <div className="text-blue-600 font-bold">{item.subtotal.toLocaleString()}원</div>
              </div>
            ))}
          </div>
          <div className="text-right font-bold">총합계: {order.total.toLocaleString()}원</div>
        </div>
      ))}
      <div className="mt-8 text-center">
        <Link href="/travel" className="text-blue-600 underline">메인으로 돌아가기</Link>
      </div>
    </div>
  );
} 