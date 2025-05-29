'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useTheme } from 'next-themes';
import { AdminPageLayout } from '../../components/AdminPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon, Loader2, Trash2, Pencil, ArrowUp, ArrowDown, Wand2, X, ArrowUpDown } from 'lucide-react';

// Types
type HeroSlide = {
  id?: string;
  imageUrl: string;
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  order: number;
  isActive: boolean;
  createdAt?: any;
};

export default function HeroSlidesPage() {
  const { toast = () => {} } = useToast();
  useTheme(); // 다크모드 지원을 위해 유지
  
  const [isLoading, setIsLoading] = useState(true);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [previewUrl, setPreviewUrl] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [newSlide, setNewSlide] = useState<HeroSlide>({
    imageUrl: '',
    title: '',
    description: '',
    buttonText: '자세히 보기',
    buttonUrl: '',
    order: 0,
    isActive: true,
  });

  // Load initial data
  useEffect(() => {
    const loadHeroSlides = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API call
        // const response = await fetch('/api/hero-slides');
        // const data = await response.json();
        // setHeroSlides(data);
        
        // Mock data for now
        setHeroSlides([
          {
            id: '1',
            imageUrl: '/images/hero/hero1.jpg',
            title: '첫 번째 슬라이드',
            description: '첫 번째 슬라이드 설명입니다.',
            buttonText: '자세히 보기',
            buttonUrl: '/tours/1',
            order: 1,
            isActive: true,
          },
        ]);
      } catch (error) {
        console.error('Error loading hero slides:', error);
        toast({
          title: '오류',
          description: '슬라이드를 불러오는 중 오류가 발생했습니다.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadHeroSlides();
  }, [toast]);

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: '지원되지 않는 파일 형식',
        description: '이미지 파일만 업로드 가능합니다.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: '파일 크기 초과',
        description: '파일 크기는 10MB 이하여야 합니다.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // TODO: Replace with actual image upload function
      // const result = await uploadImage(file, 'hero-slides');
      const result = {
        url: URL.createObjectURL(file),
        thumbnailUrl: URL.createObjectURL(file),
      };
      
      setPreviewUrl(result.thumbnailUrl);
      setNewSlide(prev => ({
        ...prev,
        imageUrl: result.url,
      }));
      
      toast({
        title: '이미지 업로드 완료',
        description: '이미지가 성공적으로 업로드되었습니다.',
      });
    } catch (error: any) {
      console.error('이미지 업로드 오류:', error);
      toast({
        title: '이미지 업로드 실패',
        description: error.message || '이미지 업로드 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSlide.imageUrl) {
      toast({
        title: '이미지 필요',
        description: '슬라이드에 사용할 이미지를 업로드해주세요.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (editMode && editId) {
        // Update existing slide
        // TODO: Replace with actual API call
        // await fetch(`/api/hero-slides/${editId}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(newSlide),
        // });
        
        setHeroSlides(prev => 
          prev.map(slide => 
            slide.id === editId ? { ...newSlide, id: editId } : slide
          )
        );
        
        toast({
          title: '성공',
          description: '슬라이드가 성공적으로 수정되었습니다.',
        });
      } else {
        // Add new slide
        // TODO: Replace with actual API call
        // const response = await fetch('/api/hero-slides', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     ...newSlide,
        //     order: heroSlides.length + 1,
        //   }),
        // });
        // const data = await response.json();
        
        const newId = Math.random().toString(36).substr(2, 9);
        const newSlideWithId = {
          ...newSlide,
          id: newId,
          order: heroSlides.length + 1,
        };
        
        setHeroSlides(prev => [...prev, newSlideWithId]);
        
        toast({
          title: '성공',
          description: '새 슬라이드가 추가되었습니다.',
        });
      }
      
      // Reset form
      setNewSlide({
        imageUrl: '',
        title: '',
        description: '',
        buttonText: '자세히 보기',
        buttonUrl: '',
        order: heroSlides.length + 1,
        isActive: true,
      });
      setPreviewUrl('');
      setEditMode(false);
      setEditId(null);
      
    } catch (error) {
      console.error('슬라이드 저장 중 오류:', error);
      toast({
        title: '오류',
        description: '슬라이드를 저장하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete slide
  const deleteSlide = async (id: string) => {
    if (!confirm('정말 이 슬라이드를 삭제하시겠습니까?')) return;
    
    try {
      setIsLoading(true);
      
      // TODO: Replace with actual API call
      // await fetch(`/api/hero-slides/${id}`, { method: 'DELETE' });
      
      setHeroSlides(prev => prev.filter(slide => slide.id !== id));
      
      toast({
        title: '삭제 완료',
        description: '슬라이드가 삭제되었습니다.',
      });
    } catch (error) {
      console.error('슬라이드 삭제 중 오류:', error);
      toast({
        title: '오류',
        description: '슬라이드 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle slide status
  const toggleSlideStatus = async (id: string, currentStatus: boolean) => {
    try {
      setIsLoading(true);
      
      // TODO: Replace with actual API call
      // await fetch(`/api/hero-slides/${id}/status`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ isActive: !currentStatus }),
      // });
      
      setHeroSlides(prev =>
        prev.map(slide =>
          slide.id === id ? { ...slide, isActive: !currentStatus } : slide
        )
      );
      
      toast({
        title: '상태 업데이트',
        description: `슬라이드가 ${!currentStatus ? '활성화' : '비활성화'}되었습니다.`,
      });
    } catch (error) {
      console.error('슬라이드 상태 업데이트 중 오류:', error);
      toast({
        title: '오류',
        description: '슬라이드 상태를 업데이트하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Move slide up or down
  const moveSlide = async (id: string, direction: 'up' | 'down') => {
    try {
      setIsLoading(true);
      
      const currentIndex = heroSlides.findIndex(slide => slide.id === id);
      if (currentIndex === -1) return;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      // Validate new index
      if (newIndex < 0 || newIndex >= heroSlides.length) {
        return;
      }
      
      // Create new array with updated order
      const newSlides = [...heroSlides];
      const [movedSlide] = newSlides.splice(currentIndex, 1);
      newSlides.splice(newIndex, 0, movedSlide);
      
      // Update order property
      const updatedSlides = newSlides.map((slide, index) => ({
        ...slide,
        order: index + 1,
      }));
      
      // TODO: Replace with actual API call to update order
      // await fetch('/api/hero-slides/reorder', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     slides: updatedSlides.map(slide => ({
      //       id: slide.id,
      //       order: slide.order,
      //     })),
      //   }),
      // });
      
      setHeroSlides(updatedSlides);
      
      toast({
        title: '순서 업데이트',
        description: '슬라이드 순서가 업데이트되었습니다.',
      });
    } catch (error) {
      console.error('슬라이드 순서 변경 중 오류:', error);
      toast({
        title: '오류',
        description: '슬라이드 순서를 변경하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Edit slide
  const editSlide = (slide: HeroSlide) => {
    setNewSlide({
      imageUrl: slide.imageUrl,
      title: slide.title,
      description: slide.description,
      buttonText: slide.buttonText,
      buttonUrl: slide.buttonUrl,
      order: slide.order,
      isActive: slide.isActive,
    });
    
    setPreviewUrl(slide.imageUrl);
    setEditMode(true);
    setEditId(slide.id || null);
    
    // Scroll to form
    document.getElementById('slide-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Cancel edit
  const cancelEdit = () => {
    setNewSlide({
      imageUrl: '',
      title: '',
      description: '',
      buttonText: '자세히 보기',
      buttonUrl: '',
      order: heroSlides.length + 1,
      isActive: true,
    });
    setPreviewUrl('');
    setEditMode(false);
    setEditId(null);
  };

  // Diagnose slides
  const diagnoseSlides = async () => {
    try {
      setIsLoading(true);
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/hero-slides/diagnose', { method: 'POST' });
      // const { issues, fixedSlides } = await response.json();
      
      // Mock response
      const issues: string[] = [];
      
      if (issues.length > 0) {
        toast({
          title: '슬라이드 진단 완료',
          description: `${issues.length}개의 문제가 발견되었습니다. 자동 수정을 시도합니다.`,
          variant: 'destructive',
        });
        
        // TODO: Auto-fix issues
        // await fetch('/api/hero-slides/fix', { method: 'POST' });
        
        // Refresh slides
        // const response = await fetch('/api/hero-slides');
        // const data = await response.json();
        // setHeroSlides(data);
        
        toast({
          title: '자동 수정 완료',
          description: '발견된 문제가 자동으로 수정되었습니다.',
        });
      } else {
        toast({
          title: '진단 완료',
          description: '문제가 발견되지 않았습니다.',
        });
      }
    } catch (error) {
      console.error('슬라이드 진단 중 오류:', error);
      toast({
        title: '오류',
        description: '슬라이드 진단 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reorder all slides
  const reorderAllSlides = async () => {
    try {
      setIsLoading(true);
      
      const updatedSlides = heroSlides.map((slide, index) => ({
        ...slide,
        order: index + 1,
      }));
      
      // TODO: Replace with actual API call
      // await fetch('/api/hero-slides/reorder', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     slides: updatedSlides.map(slide => ({
      //       id: slide.id,
      //       order: slide.order,
      //     })),
      //   }),
      // });
      
      setHeroSlides(updatedSlides);
      
      toast({
        title: '순서 재정렬 완료',
        description: '모든 슬라이드의 순서가 재정렬되었습니다.',
      });
    } catch (error) {
      console.error('슬라이드 순서 재정렬 중 오류:', error);
      toast({
        title: '오류',
        description: '슬라이드 순서를 재정렬하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminPageLayout 
      title="히어로 슬라이드 관리"
      description="메인 페이지에 표시되는 히어로 슬라이드를 관리합니다."
    >
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">슬라이드 목록</TabsTrigger>
            <TabsTrigger value="add">슬라이드 {editMode ? '수정' : '추가'}</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={diagnoseSlides}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    슬라이드 진단
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={reorderAllSlides}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  <>
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    순서 재정렬
                  </>
                )}
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : heroSlides.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  등록된 슬라이드가 없습니다.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {[...heroSlides]
                  .sort((a, b) => a.order - b.order)
                  .map((slide, index) => (
                    <Card key={slide.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="relative w-full md:w-1/3 h-48 bg-muted">
                          {slide.imageUrl ? (
                            <img
                              src={slide.imageUrl}
                              alt={slide.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <ImageIcon className="h-12 w-12" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <Badge variant={slide.isActive ? 'default' : 'secondary'}>
                              {slide.isActive ? '활성화됨' : '비활성화됨'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{slide.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {slide.description}
                              </p>
                              <div className="mt-2">
                                <a 
                                  href={slide.buttonUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline"
                                >
                                  {slide.buttonText || '자세히 보기'}
                                </a>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-muted-foreground">
                                순서: {slide.order}
                              </span>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => moveSlide(slide.id!, 'up')}
                                  disabled={index === 0 || isLoading}
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => moveSlide(slide.id!, 'down')}
                                  disabled={index === heroSlides.length - 1 || isLoading}
                                >
                                  <ArrowDown className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleSlideStatus(slide.id!, slide.isActive)}
                              disabled={isLoading}
                            >
                              {slide.isActive ? '비활성화' : '활성화'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => editSlide(slide)}
                              disabled={isLoading}
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              수정
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteSlide(slide.id!)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              삭제
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="add" id="slide-form">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editMode ? '슬라이드 수정' : '새 슬라이드 추가'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      이미지 업로드 <span className="text-destructive">*</span>
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {previewUrl ? (
                          <div className="relative">
                            <img
                              src={previewUrl}
                              alt="미리보기"
                              className="mx-auto max-h-48 rounded-md"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                              onClick={() => setPreviewUrl('')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                            <div className="flex text-sm text-muted-foreground">
                              <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer rounded-md bg-white font-medium text-primary hover:text-primary/90 focus-within:outline-none"
                              >
                                <span>이미지 업로드</span>
                                <input
                                  id="file-upload"
                                  name="file-upload"
                                  type="file"
                                  className="sr-only"
                                  accept="image/*"
                                  onChange={handleFileSelect}
                                />
                              </label>
                              <p className="pl-1">또는 파일을 여기로 드래그하세요.</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              PNG, JPG, GIF 최대 10MB
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm font-medium">
                      제목 <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newSlide.title}
                      onChange={(e) =>
                        setNewSlide({ ...newSlide, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-medium">
                      설명
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newSlide.description}
                      onChange={(e) =>
                        setNewSlide({ ...newSlide, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="buttonText" className="block text-sm font-medium">
                        버튼 텍스트
                      </label>
                      <input
                        type="text"
                        id="buttonText"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newSlide.buttonText}
                        onChange={(e) =>
                          setNewSlide({ ...newSlide, buttonText: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="buttonUrl" className="block text-sm font-medium">
                        버튼 링크
                      </label>
                      <input
                        type="url"
                        id="buttonUrl"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newSlide.buttonUrl}
                        onChange={(e) =>
                          setNewSlide({ ...newSlide, buttonUrl: e.target.value })
                        }
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={newSlide.isActive}
                      onChange={(e) =>
                        setNewSlide({ ...newSlide, isActive: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      활성화 상태
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    {editMode && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelEdit}
                        disabled={isLoading}
                      >
                        취소
                      </Button>
                    )}
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          처리 중...
                        </>
                      ) : editMode ? (
                        '수정 완료'
                      ) : (
                        '추가하기'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageLayout>
  );
}
