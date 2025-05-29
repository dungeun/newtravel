'use client';

import { useState } from 'react';
import { FaSearch, FaCalendarAlt, FaUsers } from 'react-icons/fa';

export default function SearchBox() {
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [travelers, setTravelers] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 검색 로직 구현
  };

  return (
    <div className="my-8 rounded-lg bg-white p-6 shadow-lg">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center space-x-2 rounded-lg border p-3">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="여행지를 입력하세요"
              className="w-full outline-none"
              value={destination}
              onChange={e => setDestination(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2 rounded-lg border p-3">
            <FaCalendarAlt className="text-gray-400" />
            <input
              type="date"
              className="w-full outline-none"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2 rounded-lg border p-3">
            <FaUsers className="text-gray-400" />
            <select
              className="w-full outline-none"
              value={travelers}
              onChange={e => setTravelers(e.target.value)}
            >
              <option value="">인원 선택</option>
              <option value="1">1명</option>
              <option value="2">2명</option>
              <option value="3">3명</option>
              <option value="4">4명 이상</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-3 text-white transition-colors hover:bg-blue-700"
        >
          여행 검색하기
        </button>
      </form>
    </div>
  );
}
