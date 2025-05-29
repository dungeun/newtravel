'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { AdminPageLayout } from '../../components/AdminPageLayout';
import { Trash2, Pencil } from 'lucide-react';

// 배너 타입 정의
interface Banner {
  id: string;
  title: string;
  backgroundColor: string;
  imageUrl: string;
  link: string;
  isActive: boolean;
  createdAt: any;
}

export default function BannersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [newBanner, setNewBanner] = useState({
    title: '',
    backgroundColor: '#f3f4f6',
    imageUrl: '',
    link: '',
    isActive: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [editMode, setEditMode] = useState(false);
  const [editBannerId, setEditBannerId] = useState<string | null>(null);

  // 배너 목록 불러오기
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const bannersCollection = collection(db, 'banners');
      const bannersSnapshot = await getDocs(bannersCollection);
      const bannersList = bannersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Banner[];
      
      // 생성일 기준 내림차순 정렬
      bannersList.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log('불러온 배너 목록:', bannersList.length);
      setBanners(bannersList);
    } catch (error) {
      console.error('배너 목록을 불러오는데 실패했습니다:', error);
      toast({
        title: '오류',
        description: '배너 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchBanners();
  }, []);

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 체크 (10MB 제한)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: '파일 크기 초과',
          description: '파일 크기가 10MB를 초과할 수 없습니다.',
          variant: 'destructive',
        });
        return;
      }
      
      setSelectedFile(file);
      
      // 미리보기 URL 생성
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  // 새 배너 추가 또는 기존 배너 수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBanner.title) {
      toast({
        title: '유효성 검사 실패',
        description: '배너 제목은 필수 항목입니다.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setLoading(true);
      let imageUrl = newBanner.imageUrl;
      
      // 새 이미지 파일이 선택된 경우 Storage에 업로드
      if (selectedFile) {
        // 수정 모드에서 기존 이미지 삭제
        if (editMode && newBanner.imageUrl && newBanner.imageUrl.includes('firebase')) {
          try {
            // 전체 URL에서 경로 부분만 추출
            const urlPath = decodeURIComponent(newBanner.imageUrl.split('/o/')[1].split('?')[0]);
            const oldImageRef = ref(storage, urlPath);
            await deleteObject(oldImageRef);
            console.log('기존 이미지 삭제 성공');
          } catch (error) {
            console.error('기존 이미지 삭제 실패:', error);
            // 이미지 삭제 실패해도 계속 진행
          }
        }
        
        // 고유한 파일명으로 저장
        const timestamp = Date.now();
        const fileName = `banners/${timestamp}_${selectedFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const storageRef = ref(storage, fileName);
        
        // 업로드 진행
        await uploadBytes(storageRef, selectedFile);
        imageUrl = await getDownloadURL(storageRef);
        console.log('이미지 업로드 성공:', imageUrl);
      }
      
      // 배너 데이터 준비
      const bannerData = {
        title: newBanner.title,
        backgroundColor: newBanner.backgroundColor,
        imageUrl,
        link: newBanner.link,
        isActive: newBanner.isActive,
        createdAt: serverTimestamp(),
      };
      
      if (editMode && editBannerId) {
        // 기존 배너 수정
        const bannerRef = doc(db, 'banners', editBannerId);
        await updateDoc(bannerRef, bannerData);
        toast({
          title: '성공',
          description: '배너가 성공적으로 수정되었습니다.',
        });
      } else {
        // 새 배너 추가
        await addDoc(collection(db, 'banners'), bannerData);
        toast({
          title: '성공',
          description: '새 배너가 성공적으로 추가되었습니다.',
        });
      }
      
      // 폼 초기화
      setNewBanner({
        title: '',
        backgroundColor: '#f3f4f6',
        imageUrl: '',
        link: '',
        isActive: true,
      });
      setSelectedFile(null);
      setPreviewUrl('');
      setEditMode(false);
      setEditBannerId(null);
      
      // 배너 목록 다시 불러오기
      fetchBanners();
    } catch (error) {
      console.error('배너 저장 중 오류 발생:', error);
      toast({
        title: '오류',
        description: '배너를 저장하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 배너 삭제
  const deleteBanner = async (id: string, imageUrl: string) => {
    if (window.confirm('정말로 이 배너를 삭제하시겠습니까?')) {
      try {
        setLoading(true);
        
        // Firestore에서 배너 문서 삭제
        await deleteDoc(doc(db, 'banners', id));
        
        // Storage에서 이미지 삭제
        if (imageUrl && imageUrl.includes('firebase')) {
          try {
            // 전체 URL에서 경로 부분만 추출
            const urlPath = decodeURIComponent(imageUrl.split('/o/')[1].split('?')[0]);
            const imageRef = ref(storage, urlPath);
            await deleteObject(imageRef);
            console.log('이미지 삭제 성공');
          } catch (imageError) {
            console.error('이미지 삭제 실패:', imageError);
            // 이미지 삭제 실패해도 계속 진행
          }
        }
        
        toast({
          title: '성공',
          description: '배너가 성공적으로 삭제되었습니다.',
        });
        
        // 배너 목록 갱신
        fetchBanners();
      } catch (error) {
        console.error('배너 삭제 중 오류 발생:', error);
        toast({
          title: '오류',
          description: '배너를 삭제하는 중 오류가 발생했습니다.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // 배너 활성화 상태 토글
  const toggleBannerStatus = async (id: string, currentStatus: boolean) => {
    try {
      setLoading(true);
      const bannerRef = doc(db, 'banners', id);
      await updateDoc(bannerRef, {
        isActive: !currentStatus
      });
      
      toast({
        title: '성공',
        description: `배너가 ${!currentStatus ? '활성화' : '비활성화'} 되었습니다.`,
      });
      
      // 배너 목록 갱신
      fetchBanners();
    } catch (error) {
      console.error('배너 상태 변경 중 오류 발생:', error);
      toast({
        title: '오류',
        description: '배너 상태를 변경하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 배너 편집 모드 설정
  const editBanner = (banner: Banner) => {
    setNewBanner({
      title: banner.title,
      backgroundColor: banner.backgroundColor,
      imageUrl: banner.imageUrl,
      link: banner.link,
      isActive: banner.isActive,
    });
    setPreviewUrl(banner.imageUrl);
    setEditMode(true);
    setEditBannerId(banner.id);
  };

  // 편집 취소
  const cancelEdit = () => {
    setNewBanner({
      title: '',
      backgroundColor: '#f3f4f6',
      imageUrl: '',
      link: '',
      isActive: true,
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setEditMode(false);
    setEditBannerId(null);
  };

  return (
    <AdminPageLayout
      title="배너 관리"
      description="메인 페이지에 표시될 배너를 관리합니다. 배너는 1000 x 200 픽셀 크기가 권장됩니다."
      actions={
        <Button
          onClick={() => {
            if (editMode) {
              cancelEdit();
            } else {
              router.push('/admin/design');
            }
          }}
          variant="outline"
        >
          {editMode ? '편집 취소' : '디자인 메뉴로 돌아가기'}
        </Button>
      }
    >
      <Tabs defaultValue="banners" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="banners">배너 목록</TabsTrigger>
          <TabsTrigger value="add">{editMode ? '배너 수정' : '배너 추가'}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="banners">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <p>배너 목록을 불러오는 중...</p>
            ) : banners.length === 0 ? (
              <p className="col-span-full text-center py-8 text-muted-foreground">
                등록된 배너가 없습니다. 새 배너를 추가해주세요.
              </p>
            ) : (
              banners.map(banner => (
                <Card key={banner.id} className={`${!banner.isActive ? 'opacity-70' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">{banner.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={banner.isActive}
                          onCheckedChange={() => toggleBannerStatus(banner.id, banner.isActive)}
                        />
                        <span className="text-xs text-muted-foreground">
                          {banner.isActive ? '활성화' : '비활성화'}
                        </span>
                      </div>
                    </div>
                    <CardDescription>
                      {banner.createdAt?.toDate 
                        ? banner.createdAt.toDate().toLocaleDateString() 
                        : '날짜 정보 없음'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="w-full h-[200px] rounded overflow-hidden flex items-center justify-center"
                      style={{ backgroundColor: banner.backgroundColor || '#f3f4f6' }}
                    >
                      {banner.imageUrl ? (
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="max-h-[200px] max-w-full object-contain mx-auto"
                          onError={(e) => {
                            console.error('이미지 로드 실패:', banner.imageUrl);
                            (e.target as HTMLImageElement).src = '/images/placeholder.png';
                          }}
                        />
                      ) : (
                        <p className="text-muted-foreground">이미지 없음</p>
                      )}
                    </div>
                    {banner.link && (
                      <div className="mt-2 text-xs text-muted-foreground truncate">
                        링크: {banner.link}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editBanner(banner)}
                    >
                      <Pencil className="h-4 w-4 mr-1" /> 편집
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteBanner(banner.id, banner.imageUrl)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> 삭제
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="add">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>{editMode ? '배너 수정' : '새 배너 추가'}</CardTitle>
                <CardDescription>
                  배너 이미지는 1000 x 200 픽셀 크기가 권장됩니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="title">배너 제목</Label>
                  <Input
                    id="title"
                    type="text"
                    value={newBanner.title}
                    onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                    placeholder="배너 제목"
                    required
                  />
                </div>
                
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="backgroundColor">배경색</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={newBanner.backgroundColor}
                      onChange={(e) => setNewBanner({ ...newBanner, backgroundColor: e.target.value })}
                      className="w-16 h-8 p-1"
                    />
                    <Input
                      type="text"
                      value={newBanner.backgroundColor}
                      onChange={(e) => setNewBanner({ ...newBanner, backgroundColor: e.target.value })}
                      className="flex-1"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
                
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="image">배너 이미지</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    권장 크기: 1000 x 200 픽셀, 최대 파일 크기: 10MB
                  </p>
                </div>
                
                {(previewUrl || editMode) && (
                  <div className="mt-4">
                    <Label>미리보기</Label>
                    <div 
                      className="w-full h-[200px] mt-2 rounded flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: newBanner.backgroundColor }}
                    >
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="미리보기"
                          className="max-h-[200px] max-w-full object-contain mx-auto"
                        />
                      ) : (
                        <p className="text-muted-foreground">이미지 없음</p>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="link">배너 링크 (선택사항)</Label>
                  <Input
                    id="link"
                    type="url"
                    value={newBanner.link}
                    onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
                    placeholder="https://"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={newBanner.isActive}
                    onCheckedChange={(checked: boolean) => setNewBanner({ ...newBanner, isActive: checked })}
                  />
                  <Label htmlFor="isActive">활성화</Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={cancelEdit}
                >
                  취소
                </Button>
                <Button 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? '처리 중...' : editMode ? '배너 수정' : '배너 추가'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
} 