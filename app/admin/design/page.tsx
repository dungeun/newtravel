'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { AdminPageLayout, AdminSection } from '../components/AdminPageLayout';
import dynamic from 'next/dynamic';
import { collection, doc, getDoc, updateDoc, setDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase/config';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DraggableSectionList from './DraggableSectionList';
import { testStorageUpload, checkStorageConfig } from './debug-storage';
import { uploadImage, deleteImage } from '@/utils/local-image-upload';

// 클라이언트 사이드에서만 아이콘 로드
const CheckCircle = dynamic(() => import('lucide-react').then(mod => mod.CheckCircle), { ssr: false });
const AlertTriangle = dynamic(() => import('lucide-react').then(mod => mod.AlertTriangle), { ssr: false });
const Save = dynamic(() => import('lucide-react').then(mod => mod.Save), { ssr: false });
const RefreshCw = dynamic(() => import('lucide-react').then(mod => mod.RefreshCw), { ssr: false });
const Sun = dynamic(() => import('lucide-react').then(mod => mod.Sun), { ssr: false });
const Moon = dynamic(() => import('lucide-react').then(mod => mod.Moon), { ssr: false });
const MoveVertical = dynamic(() => import('lucide-react').then(mod => mod.MoveVertical), { ssr: false });
const Upload = dynamic(() => import('lucide-react').then(mod => mod.Upload), { ssr: false });
const Image = dynamic(() => import('lucide-react').then(mod => mod.Image), { ssr: false });
const FileEdit = dynamic(() => import('lucide-react').then(mod => mod.FileEdit), { ssr: false });

interface MainPageSection {
  id: string;
  type: string;
  title: string;
  isFixed: boolean;
  isVisible: boolean;
  order: number;
}

interface HeroSlide {
  id?: string;
  imageUrl: string;
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  order: number;
  isActive: boolean;
}

interface Logo {
  id?: string;
  imageUrl: string;
  altText: string;
  linkUrl: string;
  darkModeImageUrl?: string;
}

interface TemplateSettings {
  theme: string;
  group1: {
    block1: string;
    block2: string;
    banner: string;
  };
  group2: {
    block1: string;
    block2: string;
    banner: string;
  };
}

type AlertType = { message: string; type: 'success' | 'error' } | null;

export default function DesignManagementPage() {
  const { currentTheme, setTheme } = useTheme();
  const { toast } = useToast();
  const [previewTheme, setPreviewTheme] = useState<string>(currentTheme.name);
  const [mainPageSections, setMainPageSections] = useState<MainPageSection[]>([]);
  const [alert, setAlert] = useState<AlertType>(null);
  const [templateSettings, setTemplateSettings] = useState<TemplateSettings>({
    theme: 'light',
    group1: { block1: '', block2: '', banner: '' },
    group2: { block1: '', block2: '', banner: '' }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [logo, setLogo] = useState<Logo | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [darkLogoFile, setDarkLogoFile] = useState<File | null>(null);
  const router = useRouter();

  // 기본 섹션 정의
  const getDefaultSections = (): MainPageSection[] => [
    { id: 'header', type: 'HEADER', title: '헤더 네비게이션', isFixed: true, isVisible: true, order: 0 },
    { id: 'hero', type: 'HERO', title: '히어로 섹션', isFixed: true, isVisible: true, order: 1 },
    { id: 'search', type: 'SEARCH', title: '검색 섹션', isFixed: true, isVisible: true, order: 2 },
    { id: 'banner', type: 'BANNER', title: '메인 배너', isFixed: false, isVisible: true, order: 3 },
    { id: 'regionalTravel', type: 'REGIONAL_TRAVEL', title: '지역별 여행', isFixed: false, isVisible: true, order: 4 },
    { id: 'timeDeal', type: 'TIME_DEAL', title: '타임딜', isFixed: false, isVisible: true, order: 5 },
    { id: 'themeTravel', type: 'THEME_TRAVEL', title: '테마별 여행', isFixed: false, isVisible: true, order: 6 },
    { id: 'promotion', type: 'PROMOTION', title: '특가 프로모션', isFixed: false, isVisible: true, order: 7 },
    { id: 'review', type: 'REVIEW', title: '여행 후기', isFixed: false, isVisible: true, order: 8 },
    { id: 'footer', type: 'FOOTER', title: '푸터', isFixed: true, isVisible: true, order: 9 },
  ];
  
  // 알림 표시 - toast와 함께 사용
  const showAlert = (message: string, type: 'success' | 'error') => {
    // Toast 표시
    toast({
      title: type === 'success' ? '성공' : '오류',
      description: message,
      variant: type === 'success' ? 'default' : 'destructive',
    });
    
    // 기존 알림 상태 업데이트 (호환성 유지)
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000); // 5초 후 알림 사라짐
  };
  
  // 메인페이지 섹션 로드
  const loadMainPageSections = () => {
    try {
      const savedSections = localStorage.getItem('mainPageSections');
      if (savedSections) {
        setMainPageSections(JSON.parse(savedSections));
      } else {
        const defaultSections = getDefaultSections();
        setMainPageSections(defaultSections);
        localStorage.setItem('mainPageSections', JSON.stringify(defaultSections));
      }
    } catch (error) {
      console.error('섹션 설정을 불러오는데 실패했습니다:', error);
      // 오류 발생 시 기본값으로 설정
      const defaultSections = getDefaultSections();
      setMainPageSections(defaultSections);
      localStorage.setItem('mainPageSections', JSON.stringify(defaultSections));
    }
  };
  
  // 히어로 섹션 슬라이드 로드
  const loadHeroSlides = async () => {
    try {
      const slidesRef = collection(db, 'heroSlides');
      const q = query(slidesRef, orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const slides: HeroSlide[] = [];
      querySnapshot.forEach((doc) => {
        slides.push({
          id: doc.id,
          ...doc.data() as HeroSlide
        });
      });
      
      setHeroSlides(slides);
    } catch (error) {
      console.error('히어로 슬라이드를 불러오는데 실패했습니다:', error);
      showAlert('히어로 슬라이드를 불러오는데 실패했습니다.', 'error');
    }
  };
  
  // 로고 정보 로드
  const loadLogo = async () => {
    try {
      const logoDoc = await getDoc(doc(db, 'settings', 'logo'));
      if (logoDoc.exists()) {
        setLogo(logoDoc.data() as Logo);
      }
    } catch (error) {
      console.error('로고 정보를 불러오는데 실패했습니다:', error);
      showAlert('로고 정보를 불러오는데 실패했습니다.', 'error');
    }
  };
  
  // 메인페이지 섹션 저장
  const saveMainPageSections = () => {
    try {
      localStorage.setItem('mainPageSections', JSON.stringify(mainPageSections));
      showAlert('섹션 설정이 저장되었습니다.', 'success');
    } catch (error) {
      console.error('섹션 설정 저장 중 오류 발생:', error);
      showAlert('섹션 설정 저장 중 오류가 발생했습니다.', 'error');
    }
  };
  
  // 로고 파일 업로드 처리
  const handleLogoUpload = async () => {
    if (!logoFile) {
      showAlert('업로드할 로고 파일을 선택해주세요.', 'error');
      return;
    }
    
    setIsLoading(true);
    console.log('로고 업로드 시작:', logoFile.name);
    
    try {
      // 로컬 서버에 로고 이미지 업로드
      console.log('로컬 서버 업로드 시작');
      const logoResult = await uploadImage(logoFile, 'logos');
      const logoUrl = logoResult.url;
      console.log('로고 업로드 완료:', logoUrl);
      
      // 다크모드 로고 처리
      let darkLogoUrl = '';
      if (darkLogoFile) {
        console.log('다크모드 로고 업로드 시작:', darkLogoFile.name);
        const darkLogoResult = await uploadImage(darkLogoFile, 'logos');
        darkLogoUrl = darkLogoResult.url;
        console.log('다크모드 로고 업로드 완료:', darkLogoUrl);
      }
      
      // 로고 데이터 업데이트
      const updatedLogo = {
        imageUrl: logoUrl,
        darkModeImageUrl: darkLogoUrl || (logo?.darkModeImageUrl || ''),
        altText: logo?.altText || '웹사이트 로고',
        linkUrl: logo?.linkUrl || '/',
        updatedAt: new Date().toISOString()
      };
      
      // 기존 로고 이미지 삭제 (로컬 서버)
      if (logo?.imageUrl && logo.imageUrl !== logoUrl) {
        try {
          await deleteImage(logo.imageUrl);
          console.log('기존 로고 이미지 삭제 완료');
        } catch (deleteError) {
          console.error('기존 로고 이미지 삭제 실패:', deleteError);
        }
      }
      
      // 기존 다크모드 로고 이미지 삭제
      if (darkLogoUrl && logo?.darkModeImageUrl && logo.darkModeImageUrl !== darkLogoUrl) {
        try {
          await deleteImage(logo.darkModeImageUrl);
          console.log('기존 다크모드 로고 이미지 삭제 완료');
        } catch (deleteError) {
          console.error('기존 다크모드 로고 이미지 삭제 실패:', deleteError);
        }
      }
      
      // Firestore에 저장
      console.log('Firestore에 로고 데이터 저장 시작');
      await setDoc(doc(db, 'settings', 'logo'), updatedLogo);
      console.log('Firestore에 로고 데이터 저장 완료');
      
      setLogo(updatedLogo);
      setLogoFile(null);
      setDarkLogoFile(null);
      
      // 폼 초기화
      const logoInput = document.getElementById('logoFile') as HTMLInputElement;
      const darkLogoInput = document.getElementById('darkLogoFile') as HTMLInputElement;
      if (logoInput) logoInput.value = '';
      if (darkLogoInput) darkLogoInput.value = '';
      
      showAlert('로고가 성공적으로 업로드되었습니다.', 'success');
    } catch (error: any) {
      console.error('로고 업로드 중 오류 발생:', error);
      
      // 상세 오류 메시지 표시
      const errorMessage = error?.message || '알 수 없는 오류';
      showAlert(`로고 업로드 실패: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 템플릿 설정 가져오기
  const fetchTemplateSettings = async () => {
    try {
      const templateRef = doc(collection(db, 'settings'), 'template');
      const templateDoc = await getDoc(templateRef);
      
      if (templateDoc.exists()) {
        setTemplateSettings(templateDoc.data() as TemplateSettings);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('템플릿 설정을 가져오는데 실패했습니다:', error);
      setIsLoading(false);
    }
  };
  
  // 파일 유효성 검사 함수
  const validateImageFile = (file: File): { isValid: boolean; message?: string } => {
    // 파일 유형 검사
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return { 
        isValid: false, 
        message: '지원되지 않는 파일 형식입니다. JPG, PNG, GIF, WEBP, SVG 형식만 업로드 가능합니다.' 
      };
    }
    
    // 파일 크기 검사 (2MB 제한)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return { 
        isValid: false, 
        message: '파일 크기가 너무 큽니다. 최대 2MB까지 업로드 가능합니다.' 
      };
    }
    
    return { isValid: true };
  };

  // 로고 파일 선택 핸들러
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateImageFile(file);
      
      if (!validation.isValid) {
        showAlert(validation.message || '파일 유효성 검사 실패', 'error');
        e.target.value = ''; // 입력 필드 초기화
        return;
      }
      
      setLogoFile(file);
    }
  };
  
  // 다크모드 로고 파일 선택 핸들러
  const handleDarkLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateImageFile(file);
      
      if (!validation.isValid) {
        showAlert(validation.message || '파일 유효성 검사 실패', 'error');
        e.target.value = ''; // 입력 필드 초기화
        return;
      }
      
      setDarkLogoFile(file);
    }
  };
  
  // 섹션 순서 변경 처리 함수
  const handleSectionReorder = (sourceIndex: number, destinationIndex: number) => {
    const updatedSections = [...mainPageSections];
    
    // 이동할 항목 가져오기
    const [movedItem] = updatedSections.splice(sourceIndex, 1);
    
    // 새 위치에 삽입
    updatedSections.splice(destinationIndex, 0, movedItem);
    
    // order 속성 업데이트
    const reorderedSections = updatedSections.map((section, index) => ({
      ...section,
      order: index
    }));
    
    setMainPageSections(reorderedSections);
  };
  
  // 섹션 가시성 토글
  const toggleSectionVisibility = (sectionId: string) => {
    const updatedSections = mainPageSections.map((section) => {
      if (section.id === sectionId) {
        return { ...section, isVisible: !section.isVisible };
      }
      return section;
    });
    
    setMainPageSections(updatedSections);
  };
  
  // 섹션 초기화
  const resetSections = () => {
    if (window.confirm('모든 섹션을 기본 설정으로 초기화하시겠습니까?')) {
      const defaultSections = getDefaultSections();
      setMainPageSections(defaultSections);
      localStorage.setItem('mainPageSections', JSON.stringify(defaultSections));
      showAlert('섹션이 기본 설정으로 초기화되었습니다.', 'success');
    }
  };
  
  // 테마 변경
  const handleThemeChange = (themeName: string) => {
    try {
      // 테마 객체 생성
      const newTheme = {
        ...currentTheme,
        name: themeName
      };
      
      setTheme(newTheme);
      setPreviewTheme(themeName);
      showAlert(`테마가 ${themeName === 'dark' ? '다크' : '라이트'} 모드로 변경되었습니다.`, 'success');
    } catch (error) {
      console.error('테마 변경 중 오류 발생:', error);
      showAlert('테마 변경 중 오류가 발생했습니다.', 'error');
    }
  };
  
  // 설정 저장
  const handleSave = async () => {
    try {
      // 테마 설정 적용
      setTheme({ ...currentTheme, name: previewTheme });
      
      // Firestore에 저장
      const templateRef = doc(collection(db, 'settings'), 'template');
      
      try {
        await updateDoc(templateRef, {
          ...templateSettings,
          theme: previewTheme
        });
      } catch (error: any) {
        if (error.name === 'FirebaseError') {
          // 문서가 없으면 새로 생성
          await setDoc(templateRef, {
            ...templateSettings,
            theme: previewTheme
          });
        } else {
          throw error;
        }
      }
      
      showAlert('설정이 저장되었습니다.', 'success');
    } catch (error) {
      console.error('설정 저장 중 오류 발생:', error);
      showAlert('설정 저장 중 오류가 발생했습니다.', 'error');
    }
  };
  
  // 초기 로드
  useEffect(() => {
    loadMainPageSections();
    fetchTemplateSettings();
    loadHeroSlides();
    loadLogo();
  }, []);

  // themeActions 정의
  const themeActions = (
    <div className="flex space-x-2">
      <Button
        variant={previewTheme === 'light' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleThemeChange('light')}
      >
        <Sun className="h-4 w-4 mr-2" />
        라이트 모드
      </Button>
      <Button
        variant={previewTheme === 'dark' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleThemeChange('dark')}
      >
        <Moon className="h-4 w-4 mr-2" />
        다크 모드
      </Button>
    </div>
  );

  // 섹션을 순서대로 정렬
  const sortedSections = [...mainPageSections].sort((a, b) => a.order - b.order);

  return (
    <AdminPageLayout 
      title="디자인 관리" 
      description="사이트 디자인과 메인 페이지 섹션을 관리합니다."
      actions={themeActions}
    >
      {alert && (
        <div className={`mb-6 p-4 rounded-lg border ${alert.type === 'success' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'}`} role="alert">
          <div className="flex items-center">
            {alert.type === 'success' ? <CheckCircle className="h-4 w-4 mr-2" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
            <h5 className="font-medium">{alert.type === 'success' ? '성공' : '오류'}</h5>
          </div>
          <div className="mt-2 text-sm">{alert.message}</div>
        </div>
      )}

      <Tabs defaultValue="sections" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="sections">메인 페이지 섹션</TabsTrigger>
          <TabsTrigger value="components">디자인 요소 관리</TabsTrigger>
          <TabsTrigger value="theme">테마 설정</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sections">
          <AdminSection 
            title="메인 페이지 섹션 관리" 
            description="메인 페이지에 표시될 섹션을 관리하고 순서를 변경할 수 있습니다."
          >
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>섹션 순서 및 노출 설정</CardTitle>
                <CardDescription>
                  섹션의 표시 여부와 순서를 설정하세요.
                  <br />
                  고정된 섹션은 순서를 변경할 수 없으며, 배너를 제외한 고정 섹션은 숨길 수 없습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DraggableSectionList 
                  sections={sortedSections} 
                  onReorder={handleSectionReorder} 
                  onToggleVisibility={toggleSectionVisibility} 
                />
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={saveMainPageSections} 
                    className="bg-primary hover:bg-primary/90 text-white" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        설정 저장
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={resetSections} 
                    variant="outline" 
                    disabled={isLoading}
                  >
                    초기화
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-4 text-right">
              <Button
                onClick={() => router.push('/admin/design/section-manager')}
                variant="outline"
              >
                <MoveVertical className="h-4 w-4 mr-2" />
                상세 섹션 관리 페이지로 이동
              </Button>
            </div>
          </AdminSection>
        </TabsContent>
        
        <TabsContent value="components">
          <AdminSection 
            title="디자인 요소 관리" 
            description="사이트의 디자인 요소를 관리합니다."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card className="bg-white dark:bg-slate-900">
                <CardHeader>
                  <CardTitle className="text-lg">로고 관리</CardTitle>
                  <CardDescription>웹사이트 헤더에 표시될 로고를 관리합니다.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {logo && (
                      <div className="flex flex-col gap-2">
                        <p className="text-sm text-muted-foreground">현재 로고:</p>
                        <div className="flex gap-4">
                          <div className="p-2 border rounded bg-white">
                            <img 
                              src={logo.imageUrl} 
                              alt={logo.altText} 
                              className="h-10 object-contain" 
                            />
                          </div>
                          {logo.darkModeImageUrl && (
                            <div className="p-2 border rounded bg-gray-800">
                              <img 
                                src={logo.darkModeImageUrl} 
                                alt={`${logo.altText} (다크모드)`} 
                                className="h-10 object-contain" 
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="logoFile">새 로고 업로드 (라이트모드)</Label>
                      <Input 
                        id="logoFile" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoFileChange}
                        className="cursor-pointer"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="darkLogoFile">다크모드용 로고 업로드 (선택사항)</Label>
                      <Input 
                        id="darkLogoFile" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleDarkLogoFileChange}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleLogoUpload}
                    disabled={isLoading || !logoFile}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isLoading ? '업로드 중...' : '로고 업로드'}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-white dark:bg-slate-900">
                <CardHeader>
                  <CardTitle className="text-lg">배너 관리</CardTitle>
                  <CardDescription>메인 페이지 상단에 표시될 배너를 관리합니다.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    배경색과 이미지(1000×200px)를 설정할 수 있는 배너를 관리할 수 있습니다.
                  </p>
                  <div className="mt-4 p-3 border border-yellow-300 bg-yellow-50 rounded-md">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">이미지 업로드 문제 해결</h4>
                    <p className="text-xs text-yellow-700 mb-2">
                      이미지 업로드가 작동하지 않는 경우 아래 버튼을 클릭하여 스토리지 연결을 테스트하세요.
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                        onClick={async () => {
                          try {
                            const config = checkStorageConfig();
                            toast({
                              title: 'Storage 구성 정보',
                              description: (
                                <pre className="text-xs whitespace-pre-wrap">
                                  {JSON.stringify(config, null, 2)}
                                </pre>
                              ),
                            });
                          } catch (error) {
                            toast({
                              title: '오류 발생',
                              description: `구성 확인 중 오류: ${error}`,
                              variant: 'destructive',
                            });
                          }
                        }}
                      >
                        구성 확인
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                        onClick={async () => {
                          try {
                            const result = await testStorageUpload();
                            if (result.success) {
                              toast({
                                title: '테스트 성공',
                                description: `이미지 업로드 테스트 성공. URL: ${result.url}`,
                              });
                            } else {
                              toast({
                                title: '테스트 실패',
                                description: `오류: ${result.error}`,
                                variant: 'destructive',
                              });
                            }
                          } catch (error: any) {
                            toast({
                              title: '테스트 실패',
                              description: `오류: ${error.message || '알 수 없는 오류'}`,
                              variant: 'destructive',
                            });
                          }
                        }}
                      >
                        업로드 테스트
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/admin/design/banners')}
                  >
                    <Image className="h-4 w-4 mr-2" />
                    배너 관리하기
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-white dark:bg-slate-900">
                <CardHeader>
                  <CardTitle className="text-lg">히어로 섹션 슬라이드</CardTitle>
                  <CardDescription>메인 페이지 히어로 섹션에 표시될 슬라이드를 관리합니다.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    최대 3개의 슬라이드를 설정하여 메인 이미지, 텍스트, 버튼을 관리할 수 있습니다.
                  </p>
                  {heroSlides.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-1">현재 슬라이드: {heroSlides.length}개</p>
                      <div className="grid grid-cols-3 gap-2">
                        {heroSlides.map((slide) => (
                          <div key={slide.id} className="aspect-video relative border rounded overflow-hidden">
                            <img 
                              src={slide.imageUrl} 
                              alt={slide.title} 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                              {slide.title}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/admin/design/hero-slides')}
                  >
                    <FileEdit className="h-4 w-4 mr-2" />
                    슬라이드 관리하기
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </AdminSection>
        </TabsContent>
        
        <TabsContent value="theme">
          <AdminSection 
            title="테마 설정" 
            description="사이트 전체에 적용될 테마를 설정할 수 있습니다."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border rounded-md bg-white dark:bg-transparent">
                <h3 className="text-lg font-medium mb-2">라이트 모드</h3>
                <div className="w-full h-32 bg-white border rounded-md flex items-center justify-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                </div>
              </div>
              <div className="p-4 border rounded-md">
                <h3 className="text-lg font-medium mb-2">다크 모드</h3>
                <div className="w-full h-32 bg-gray-800 border rounded-md flex items-center justify-center">
                  <div className="w-8 h-8 bg-blue-400 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Button className="w-full" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                모든 설정 저장하기
              </Button>
            </div>
          </AdminSection>
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
}
