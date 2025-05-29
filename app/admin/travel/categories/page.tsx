'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  getDocs,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  where,
  updateDoc,
} from 'firebase/firestore';
import { AdminPageLayout } from '../../components/AdminPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BadgeCheck, Edit, Trash, ExternalLink } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface TravelCategory {
  id: string;
  name: string;
  description?: string;
  url: string;
  type: number;
  imageUrl?: string;
  createdAt: any;
}

// 카테고리 타입 정의
const categoryTypes = [
  {
    id: 1,
    name: '패키지 여행',
    color: 'bg-blue-100 text-blue-800',
    description: '항공, 숙박, 관광이 포함된 패키지 여행',
  },
  {
    id: 2,
    name: '자유 여행',
    color: 'bg-green-100 text-green-800',
    description: '개인이 자유롭게 여행 일정을 조정할 수 있는 상품',
  },
  {
    id: 3,
    name: '테마 여행',
    color: 'bg-purple-100 text-purple-800',
    description: '특정 테마에 맞춘 여행 상품',
  },
  {
    id: 4,
    name: '특가 프로모션',
    color: 'bg-red-100 text-red-800',
    description: '한정 기간 특별 가격으로 제공되는 상품',
  },
  {
    id: 5,
    name: '크루즈 여행',
    color: 'bg-indigo-100 text-indigo-800',
    description: '크루즈 선박을 이용한 여행 상품',
  },
  {
    id: 6,
    name: '허니문',
    color: 'bg-pink-100 text-pink-800',
    description: '신혼여행 특화 상품',
  },
  {
    id: 7,
    name: '골프 여행',
    color: 'bg-green-100 text-green-800',
    description: '골프를 즐길 수 있는 특화 상품',
  },
  {
    id: 8,
    name: '기타',
    color: 'bg-gray-100 text-gray-800',
    description: '기타 여행 상품',
  },
];

// 날짜 포맷팅 함수
const formatDate = (timestamp: any) => {
  if (!timestamp) return '-';
  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
  return new Date(timestamp).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export default function TravelCategories() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<TravelCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TravelCategory | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // 새 카테고리 상태
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    url: '',
    urlError: '',
    type: 1,
    imageUrl: '',
  });
  
  // 수정할 카테고리 상태
  const [editCategory, setEditCategory] = useState({
    id: '',
    name: '',
    description: '',
    url: '',
    urlError: '',
    type: 1,
    imageUrl: '',
  });
  
  const itemsPerPage = 10;

  // 카테고리 목록 불러오기
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const categoriesRef = collection(db, 'travel_board_categories');
      const q = query(categoriesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const categoriesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          url: data.url || '',
          type: data.type || 1,
          imageUrl: data.imageUrl || '',
          createdAt: data.createdAt || null,
        };
      }) as TravelCategory[];

      setCategories(categoriesData);
    } catch (error) {
      console.error('카테고리 목록을 불러오는 중 오류가 발생했습니다:', error);
      toast({
        title: '오류',
        description: '카테고리 목록을 불러오는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // URL 유효성 검사
  const validateUrl = async (url: string, categoryId?: string) => {
    if (!url.trim()) {
      return '카테고리 URL을 입력해주세요.';
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(url)) {
      return 'URL은 영문자, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능합니다.';
    }

    // URL 중복 검사
    const categoriesRef = collection(db, 'travel_board_categories');
    const q = query(categoriesRef, where('url', '==', url));
    const querySnapshot = await getDocs(q);

    // 수정할 때는 자기 자신의 URL은 제외
    if (!querySnapshot.empty && categoryId) {
      let isDuplicate = false;
      querySnapshot.forEach(doc => {
        if (doc.id !== categoryId) {
          isDuplicate = true;
        }
      });
      if (isDuplicate) {
        return '이미 사용 중인 URL입니다.';
      }
    } else if (!querySnapshot.empty && !categoryId) {
      return '이미 사용 중인 URL입니다.';
    }

    return '';
  };

  // 새 카테고리 URL 변경 핸들러
  const handleNewUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    const error = await validateUrl(url);
    setNewCategory({ ...newCategory, url, urlError: error });
  };

  // 수정할 카테고리 URL 변경 핸들러
  const handleEditUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    const error = await validateUrl(url, editCategory.id);
    setEditCategory({ ...editCategory, url, urlError: error });
  };

  // 카테고리 생성 핸들러
  const handleCreateCategory = async () => {
    // 유효성 검사
    if (!newCategory.name.trim()) {
      toast({
        title: '입력 오류',
        description: '카테고리 이름은 필수 입력 항목입니다.',
        variant: 'destructive',
      });
      return;
    }

    const urlError = await validateUrl(newCategory.url);
    if (urlError) {
      setNewCategory({ ...newCategory, urlError });
      return;
    }

    setIsLoading(true);
    try {
      const categoriesRef = collection(db, 'travel_board_categories');
      const selectedType = categoryTypes.find(type => type.id === newCategory.type);

      const categoryData = {
        name: newCategory.name.trim(),
        description: newCategory.description.trim(),
        url: newCategory.url.trim(),
        type: newCategory.type,
        imageUrl: newCategory.imageUrl.trim(),
        createdAt: serverTimestamp(),
      };

      await addDoc(categoriesRef, categoryData);

      setIsCreateDialogOpen(false);
      setNewCategory({
        name: '',
        description: '',
        url: '',
        urlError: '',
        type: 1,
        imageUrl: '',
      });
      fetchCategories();
      toast({
        title: '성공',
        description: '카테고리가 성공적으로 생성되었습니다.',
      });
    } catch (error) {
      console.error('카테고리 생성 실패:', error);
      toast({
        title: '오류',
        description: '카테고리 생성에 실패했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 카테고리 수정 핸들러
  const handleEditCategory = (category: TravelCategory) => {
    setEditCategory({
      id: category.id,
      name: category.name,
      description: category.description || '',
      url: category.url,
      urlError: '',
      type: category.type,
      imageUrl: category.imageUrl || '',
    });
    setIsEditDialogOpen(true);
  };

  // 카테고리 수정 제출
  const handleEditSubmit = async () => {
    // 유효성 검사
    if (!editCategory.name.trim()) {
      toast({
        title: '입력 오류',
        description: '카테고리 이름은 필수 입력 항목입니다.',
        variant: 'destructive',
      });
      return;
    }

    const urlError = await validateUrl(editCategory.url, editCategory.id);
    if (urlError) {
      setEditCategory({ ...editCategory, urlError });
      return;
    }

    setIsLoading(true);
    try {
      const categoryRef = doc(db, 'travel_board_categories', editCategory.id);

      const categoryData = {
        name: editCategory.name.trim(),
        description: editCategory.description.trim(),
        url: editCategory.url.trim(),
        type: editCategory.type,
        imageUrl: editCategory.imageUrl.trim(),
      };

      await updateDoc(categoryRef, categoryData);
      setIsEditDialogOpen(false);
      fetchCategories();
      toast({
        title: '성공',
        description: '카테고리가 성공적으로 수정되었습니다.',
      });
    } catch (error) {
      console.error('카테고리 수정 실패:', error);
      toast({
        title: '오류',
        description: '카테고리 수정에 실패했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 카테고리 삭제 핸들러
  const handleDeleteCategory = (category: TravelCategory) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  // 카테고리 삭제 확인
  const handleConfirmDelete = async () => {
    if (!selectedCategory) return;

    setIsLoading(true);
    try {
      await deleteDoc(doc(db, 'travel_board_categories', selectedCategory.id));
      setIsDeleteDialogOpen(false);
      fetchCategories();
      toast({
        title: '성공',
        description: '카테고리가 성공적으로 삭제되었습니다.',
      });
    } catch (error) {
      console.error('카테고리 삭제 실패:', error);
      toast({
        title: '오류',
        description: '카테고리 삭제에 실패했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 검색 필터링
  const filteredCategories = categories.filter(category => {
    if (!searchTerm.trim()) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    return (
      category.name.toLowerCase().includes(searchTermLower) ||
      (category.description && category.description.toLowerCase().includes(searchTermLower)) ||
      category.url.toLowerCase().includes(searchTermLower)
    );
  });

  // 페이지네이션
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const currentCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AdminPageLayout
      title="여행 카테고리 관리"
      description="여행 상품 카테고리를 생성하고 관리할 수 있습니다."
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="relative">
          <Input
            type="search"
            placeholder="카테고리 검색..."
            className="w-64 pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>카테고리 추가</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 카테고리 추가</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">카테고리 이름</Label>
                <Input
                  id="name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="카테고리 이름을 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">카테고리 URL</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">/travel/</span>
                  <Input
                    id="url"
                    value={newCategory.url}
                    onChange={handleNewUrlChange}
                    placeholder="url-slug"
                    className={newCategory.urlError ? 'border-red-500' : ''}
                  />
                </div>
                {newCategory.urlError && (
                  <p className="text-sm text-red-500">{newCategory.urlError}</p>
                )}
                <p className="text-xs text-gray-500">영문자, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">카테고리 타입</Label>
                <Select
                  value={newCategory.type.toString()}
                  onValueChange={(value) => setNewCategory({ ...newCategory, type: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 타입 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name} - {type.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="카테고리에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">이미지 URL</Label>
                <Input
                  id="imageUrl"
                  value={newCategory.imageUrl}
                  onChange={(e) => setNewCategory({ ...newCategory, imageUrl: e.target.value })}
                  placeholder="카테고리 이미지 URL을 입력하세요"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleCreateCategory} disabled={isLoading}>
                {isLoading ? '생성 중...' : '생성하기'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: '50px' }}>No.</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>타입</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead style={{ width: '150px' }}>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    등록된 카테고리가 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                currentCategories.map((category, index) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {filteredCategories.length - (currentPage - 1) * itemsPerPage - index}
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{category.url}</span>
                        <Link
                          href={`/travel/${category.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={categoryTypes.find(t => t.id === category.type)?.color || 'bg-gray-100'}>
                        {categoryTypes.find(t => t.id === category.type)?.name || '기타'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(category.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category)}>
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              이전
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNumber = currentPage - 2 + i;
              if (pageNumber > 0 && pageNumber <= totalPages) {
                return (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              }
              return null;
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              다음
            </Button>
          </div>
        </div>
      )}

      {/* 카테고리 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>카테고리 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">카테고리 이름</Label>
              <Input
                id="edit-name"
                value={editCategory.name}
                onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                placeholder="카테고리 이름을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-url">카테고리 URL</Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">/travel/</span>
                <Input
                  id="edit-url"
                  value={editCategory.url}
                  onChange={handleEditUrlChange}
                  placeholder="url-slug"
                  className={editCategory.urlError ? 'border-red-500' : ''}
                />
              </div>
              {editCategory.urlError && (
                <p className="text-sm text-red-500">{editCategory.urlError}</p>
              )}
              <p className="text-xs text-gray-500">영문자, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">카테고리 타입</Label>
              <Select
                value={editCategory.type.toString()}
                onValueChange={(value) => setEditCategory({ ...editCategory, type: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  {categoryTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name} - {type.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">설명</Label>
              <Textarea
                id="edit-description"
                value={editCategory.description}
                onChange={(e) => setEditCategory({ ...editCategory, description: e.target.value })}
                placeholder="카테고리에 대한 설명을 입력하세요"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-imageUrl">이미지 URL</Label>
              <Input
                id="edit-imageUrl"
                value={editCategory.imageUrl}
                onChange={(e) => setEditCategory({ ...editCategory, imageUrl: e.target.value })}
                placeholder="카테고리 이미지 URL을 입력하세요"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleEditSubmit} disabled={isLoading}>
              {isLoading ? '저장 중...' : '저장하기'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 카테고리 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>카테고리 삭제</DialogTitle>
          </DialogHeader>
          <p>
            정말로 "{selectedCategory?.name}" 카테고리를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isLoading}>
              {isLoading ? '삭제 중...' : '삭제하기'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
}
