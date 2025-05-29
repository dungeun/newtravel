"use client";

import React, { useState } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Board {
  id: string;
  name: string;
  type: string;
}

const mockBoards: Board[] = [
  { id: "1", name: "맛집 게시판", type: "맛집" },
  { id: "2", name: "뉴스 게시판", type: "뉴스" },
];

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>(mockBoards);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">게시판 관리</h1>
        <button
          type="button"
          className="flex items-center rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          <PlusIcon className="mr-2 size-5" /> 게시판 생성
        </button>
      </div>
      <p className="mb-4 text-sm text-gray-700">게시판을 생성하고 관리할 수 있습니다.</p>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">타입</th>
              <th className="px-6 py-3"/>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {boards.map((board) => (
              <tr key={board.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{board.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{board.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{board.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-red-600 hover:text-red-900">
                    <TrashIcon className="size-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
