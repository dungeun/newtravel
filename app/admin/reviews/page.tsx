'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Star, Search, Eye, Check, X, AlertTriangle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';

export default function AdminReviewsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  
  const itemsPerPage = 10;
  
  // 관리자 권한 확인
  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);
  
  // 리뷰 목록 조회
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        
        // 필터링 및 정렬 조건 설정
        const status = activeTab !== 'all' ? activeTab : '';
        const sort = sortBy === 'recent' ? 'createdAt' : 'rating';
        const order = sortBy === 'recent' ? 'desc' : 'desc';
        
        const response = await axios.get('/api/admin/reviews', {
          params: {
            status,
            search: searchTerm,
            sort,
            order,
            page: currentPage,
            limit: itemsPerPage
          }
        });
        
        if (response.data.success) {
          setReviews(response.data.reviews || []);
          setTotalPages(Math.ceil(response.data.pagination.total / itemsPerPage));
        } else {
          setError(response.data.error || '리뷰를 불러오는데 실패했습니다.');
        }
      } catch (err: any) {
        console.error('리뷰 조회 오류:', err);
        setError(err.response?.data?.error || err.message || '리뷰를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user && user.isAdmin) {
      fetchReviews();
    }
  }, [user, activeTab, searchTerm, sortBy, currentPage]);
  
  // 리뷰 상세 조회
  const handleViewReview = async (reviewId: string) => {
    try {
      const response = await axios.get(`/api/reviews/${reviewId}`);
      
      if (response.data.success) {
        setSelectedReview(response.data.review);
      } else {
        toast({
          title: "리뷰 조회 실패",
          description: response.data.error || '리뷰를 불러오는데 실패했습니다.',
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error('리뷰 상세 조회 오류:', err);
      
      toast({
        title: "리뷰 조회 실패",
        description: err.response?.data?.error || err.message || '리뷰를 불러오는데 실패했습니다.',
        variant: "destructive",
      });
    }
  };
  
  // 리뷰 상태 변경
  const handleUpdateReviewStatus = async (reviewId: string, status: string) => {
    try {
      setIsUpdating(true);
      
      const response = await axios.put(`/api/admin/reviews/${reviewId}/status`, {
        status
      });
      
      if (response.data.success) {
        // 리뷰 목록 업데이트
        setReviews(reviews.map(review => {
          if (review.id === reviewId) {
            return { ...review, status };
          }
          return review;
        }));
        
        // 선택된 리뷰가 있는 경우 업데이트
        if (selectedReview && selectedReview.id === reviewId) {
          setSelectedReview({ ...selectedReview, status });
        }
        
        toast({
          title: "리뷰 상태 변경 완료",
          description: `리뷰 상태가 '${status}'로 변경되었습니다.`,
        });
      } else {
        throw new Error(response.data.error || '리뷰 상태 변경에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('리뷰 상태 변경 오류:', err);
      
      toast({
        title: "리뷰 상태 변경 실패",
        description: err.response?.data?.error || err.message || '리뷰 상태 변경 중 오류가 발생했습니다.',
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // 리뷰 삭제 확인
  const handleConfirmDelete = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setShowDeleteDialog(true);
  };
  
  // 리뷰 삭제 처리
  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;
    
    try {
      setIsUpdating(true);
      
      const response = await axios.delete(`/api/reviews/${reviewToDelete}`);
      
      if (response.data.success) {
        // 리뷰 목록에서 삭제된 리뷰 제거
        setReviews(reviews.filter(review => review.id !== reviewToDelete));
        
        // 선택된 리뷰가 삭제된 경우 초기화
        if (selectedReview && selectedReview.id === reviewToDelete) {
          setSelectedReview(null);
        }
        
        toast({
          title: "리뷰 삭제 완료",
          description: "리뷰가 성공적으로 삭제되었습니다.",
        });
      } else {
        throw new Error(response.data.error || '리뷰 삭제에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('리뷰 삭제 오류:', err);
      
      toast({
        title: "리뷰 삭제 실패",
        description: err.response?.data?.error || err.message || '리뷰 삭제 중 오류가 발생했습니다.',
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setShowDeleteDialog(false);
      setReviewToDelete(null);
    }
  };
  
  // 검색 처리
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };
  
  // 로딩 상태 표시
  if (loading) {
    return (
      <div className="container mx-auto flex h-[60vh] items-center justify-center px-4 py-8">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          <h2 className="text-xl font-semibold">로딩 중...</h2>
        </div>
      </div>
    );
  }
  
  // 관리자가 아닌 경우
  if (!user || !user.isAdmin) {
    return null; // 로그인 페이지로 리다이렉트 처리됨
  }
  
  // 리뷰 상태에 따른 배지 색상
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">검토중</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700">승인됨</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700">거부됨</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">리뷰 관리</h1>
        <p className="text-gray-500">고객 리뷰를 검토하고 관리합니다.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 리뷰 목록 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>리뷰 목록</CardTitle>
              <CardDescription>
                총 {reviews.length}개의 리뷰가 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* 검색 및 필터링 */}
              <div className="mb-6 space-y-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="리뷰 검색 (제목, 내용, 사용자명)"
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button type="submit">검색</Button>
                </form>
                
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <Label htmlFor="status-filter" className="mr-2">상태</Label>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList>
                        <TabsTrigger value="all">전체</TabsTrigger>
                        <TabsTrigger value="pending">검토중</TabsTrigger>
                        <TabsTrigger value="approved">승인됨</TabsTrigger>
                        <TabsTrigger value="rejected">거부됨</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  <div>
                    <Label htmlFor="sort-by" className="mr-2">정렬</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="정렬 기준" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">최신순</SelectItem>
                        <SelectItem value="rating">평점순</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* 리뷰 테이블 */}
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                </div>
              ) : error ? (
                <div className="rounded-md bg-red-50 p-4 text-red-600">
                  <p>{error}</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="rounded-lg border p-8 text-center">
                  <p className="text-gray-500">리뷰가 없습니다.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>상태</TableHead>
                          <TableHead>평점</TableHead>
                          <TableHead>제목</TableHead>
                          <TableHead>작성자</TableHead>
                          <TableHead>작성일</TableHead>
                          <TableHead>액션</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reviews.map((review) => (
                          <TableRow key={review.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleViewReview(review.id)}>
                            <TableCell>{getStatusBadge(review.status)}</TableCell>
                            <TableCell>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      review.rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{review.title}</TableCell>
                            <TableCell>{review.userName}</TableCell>
                            <TableCell>{format(new Date(review.createdAt), 'yyyy.MM.dd', { locale: ko })}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewReview(review.id);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* 페이지네이션 */}
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = currentPage <= 3
                            ? i + 1
                            : currentPage >= totalPages - 2
                              ? totalPages - 4 + i
                              : currentPage - 2 + i;
                          
                          if (pageNum <= 0 || pageNum > totalPages) return null;
                          
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                isActive={currentPage === pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* 리뷰 상세 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>리뷰 상세</CardTitle>
              <CardDescription>
                선택한 리뷰의 상세 정보를 확인하고 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedReview ? (
                <div className="rounded-lg border p-8 text-center">
                  <p className="text-gray-500">리뷰를 선택해주세요.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{selectedReview.productName || '상품명'}</h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(selectedReview.createdAt), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                      </p>
                    </div>
                    <div>
                      {getStatusBadge(selectedReview.status)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700">
                      {selectedReview.userName?.slice(0, 2) || '익명'}
                    </div>
                    <div>
                      <div className="font-medium">{selectedReview.userName}</div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              selectedReview.rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">{selectedReview.title}</h4>
                    <p className="mt-2 whitespace-pre-line text-gray-700">{selectedReview.comment}</p>
                  </div>
                  
                  {selectedReview.images && selectedReview.images.length > 0 && (
                    <div>
                      <h4 className="mb-2 font-medium">첨부 이미지</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedReview.images.map((image: string, index: number) => (
                          <div
                            key={index}
                            className="relative h-20 w-20 cursor-pointer overflow-hidden rounded-md"
                            onClick={() => window.open(image, '_blank')}
                          >
                            <img
                              src={image}
                              alt={`리뷰 이미지 ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">리뷰 관리</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedReview.status !== 'approved' && (
                        <Button
                          variant="outline"
                          className="gap-1 text-green-600 hover:bg-green-50 hover:text-green-700"
                          onClick={() => handleUpdateReviewStatus(selectedReview.id, 'approved')}
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          승인
                        </Button>
                      )}
                      
                      {selectedReview.status !== 'rejected' && (
                        <Button
                          variant="outline"
                          className="gap-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleUpdateReviewStatus(selectedReview.id, 'rejected')}
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                          거부
                        </Button>
                      )}
                      
                      {selectedReview.status !== 'pending' && (
                        <Button
                          variant="outline"
                          className="gap-1 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
                          onClick={() => handleUpdateReviewStatus(selectedReview.id, 'pending')}
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <AlertTriangle className="h-4 w-4" />
                          )}
                          검토중
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        className="gap-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleConfirmDelete(selectedReview.id)}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                        삭제
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* 삭제 확인 대화상자 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>리뷰 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 리뷰를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReview}
              disabled={isUpdating}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  삭제 중...
                </>
              ) : (
                '삭제'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
