'use client';

import { useState } from 'react';
import DataTable from './index';
import { DataTableColumn } from './types';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

/**
 * 샘플 사용자 데이터 타입
 */
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: Date;
  loginCount: number;
}

/**
 * DataTable 컴포넌트 사용 예제
 */
export default function DataTableExample() {
  // 샘플 데이터
  const users: User[] = [
    {
      id: 1,
      name: '김철수',
      email: 'kim@example.com',
      role: '관리자',
      status: 'active',
      lastLogin: new Date('2023-08-15T09:30:00'),
      loginCount: 58,
    },
    {
      id: 2,
      name: '이영희',
      email: 'lee@example.com',
      role: '일반 사용자',
      status: 'active',
      lastLogin: new Date('2023-08-14T14:22:00'),
      loginCount: 32,
    },
    {
      id: 3,
      name: '박지민',
      email: 'park@example.com',
      role: '모더레이터',
      status: 'inactive',
      lastLogin: new Date('2023-07-25T11:15:00'),
      loginCount: 47,
    },
    {
      id: 4,
      name: '최동훈',
      email: 'choi@example.com',
      role: '일반 사용자',
      status: 'pending',
      lastLogin: new Date('2023-08-16T08:05:00'),
      loginCount: 12,
    },
    {
      id: 5,
      name: '정민준',
      email: 'jung@example.com',
      role: '일반 사용자',
      status: 'active',
      lastLogin: new Date('2023-08-10T16:45:00'),
      loginCount: 24,
    },
  ];

  // 선택된 사용자들
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  // 테이블 컬럼 정의
  const columns: DataTableColumn<User>[] = [
    {
      id: 'id',
      header: '번호',
      accessor: 'id',
      width: '70px',
      align: 'center',
    },
    {
      id: 'name',
      header: '이름',
      accessor: 'name',
    },
    {
      id: 'email',
      header: '이메일',
      accessor: 'email',
    },
    {
      id: 'role',
      header: '역할',
      accessor: 'role',
    },
    {
      id: 'status',
      header: '상태',
      cell: (user) => {
        const statusStyles = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-gray-100 text-gray-800',
          pending: 'bg-yellow-100 text-yellow-800',
        };
        
        const statusLabels = {
          active: '활성',
          inactive: '비활성',
          pending: '대기 중',
        };
        
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[user.status]}`}>
            {statusLabels[user.status]}
          </span>
        );
      },
    },
    {
      id: 'lastLogin',
      header: '마지막 로그인',
      cell: (user) => user.lastLogin.toLocaleString('ko-KR'),
      sortable: true,
    },
    {
      id: 'loginCount',
      header: '로그인 횟수',
      accessor: 'loginCount',
      align: 'right',
    },
    {
      id: 'actions',
      header: '액션',
      cell: (user) => (
        <div className="flex space-x-2">
          <button 
            className="text-blue-600 hover:text-blue-900" 
            onClick={(e) => {
              e.stopPropagation();
              handleViewUser(user.id);
            }}
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          <button 
            className="text-gray-600 hover:text-gray-900" 
            onClick={(e) => {
              e.stopPropagation();
              handleEditUser(user.id);
            }}
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button 
            className="text-red-600 hover:text-red-900" 
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteUser(user.id);
            }}
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ),
      align: 'center',
    },
  ];

  // 행 클릭 핸들러
  const handleRowClick = (user: User) => {
    console.log('사용자 행 클릭:', user);
  };

  // 사용자 보기 핸들러
  const handleViewUser = (userId: number) => {
    console.log('사용자 보기:', userId);
  };

  // 사용자 편집 핸들러
  const handleEditUser = (userId: number) => {
    console.log('사용자 편집:', userId);
  };

  // 사용자 삭제 핸들러
  const handleDeleteUser = (userId: number) => {
    console.log('사용자 삭제:', userId);
  };

  // 선택 변경 핸들러
  const handleSelectionChange = (selectedIds: number[]) => {
    setSelectedUsers(selectedIds);
    console.log('선택된 사용자들:', selectedIds);
  };

  // 엑셀 다운로드 핸들러
  const handleExportExcel = () => {
    console.log('엑셀 내보내기');
  };

  // 사용자 삭제 핸들러 (선택된 항목)
  const handleDeleteSelected = () => {
    console.log('선택된 사용자 삭제:', selectedUsers);
  };

  // 테이블 액션 버튼
  const tableActions = (
    <>
      <button
        className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        onClick={handleExportExcel}
      >
        <ArrowDownTrayIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" />
        엑셀 내보내기
      </button>
      <button
        className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        onClick={handleDeleteSelected}
        disabled={selectedUsers.length === 0}
      >
        <TrashIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
        선택 삭제 ({selectedUsers.length})
      </button>
    </>
  );

  return (
    <div className="p-6">
      <DataTable<User>
        title="사용자 관리"
        description="시스템의 모든 사용자를 관리합니다."
        data={users}
        columns={columns}
        sortable={true}
        initialSort={{ id: 'id', direction: 'asc' }}
        pagination={true}
        initialPagination={{ pageSize: 10 }}
        selectable={true}
        onSelectionChange={handleSelectionChange as (ids: string[] | number[]) => void}
        onRowClick={handleRowClick}
        emptyMessage="사용자 데이터가 없습니다."
        striped={true}
        bordered={true}
        hover={true}
        actions={tableActions}
      />
    </div>
  );
} 