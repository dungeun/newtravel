'use client';

import React, { useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Checkbox } from './checkbox';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Textarea } from './textarea';
import { Badge } from './badge';
import { TravelCard } from './TravelCard';
import { Navbar, NavbarMobileMenuButton, NavbarSearch } from './navbar';
import { Sidebar, SidebarSection, SidebarItem } from './sidebar';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './table';
import { Modal, ModalFooter } from './modal';
import { CustomTabs, Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { useToast } from '@/components/ui/use-toast';
import { toast } from '@/components/ui/use-toast';

export const StyleGuide = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();

  return (
    <div className="container mx-auto p-6 space-y-10">
      <div>
        <h1 className="text-3xl font-bold mb-6">통합 스타일 가이드</h1>
        <p className="text-muted-foreground">
          이 페이지는 통합된 디자인 시스템 컴포넌트와 스타일을 보여줍니다.
          모든 컴포넌트는 스타일 가이드 컬러를 사용합니다.
        </p>
      </div>

      {/* 색상 팔레트 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">컬러 팔레트</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="h-20 bg-primary rounded-md"></div>
            <p className="text-sm font-medium">Primary</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-secondary rounded-md"></div>
            <p className="text-sm font-medium">Secondary</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-accent rounded-md"></div>
            <p className="text-sm font-medium">Accent</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-muted rounded-md"></div>
            <p className="text-sm font-medium">Muted</p>
          </div>
        </div>
      </section>

      {/* 버튼 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">버튼</h2>
        <div className="flex flex-wrap gap-4">
          <Button>기본</Button>
          <Button variant="secondary">보조</Button>
          <Button variant="outline">외곽선</Button>
          <Button variant="ghost">고스트</Button>
          <Button variant="link">링크</Button>
          <Button variant="destructive">삭제</Button>
          <Button variant="teal">티일</Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button size="sm">작은 버튼</Button>
          <Button>기본 크기</Button>
          <Button size="lg">큰 버튼</Button>
          <Button size="icon"><span className="text-xl">+</span></Button>
        </div>
      </section>

      {/* 카드 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">카드</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>카드 제목</CardTitle>
              <CardDescription>카드에 대한 간단한 설명입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>카드 콘텐츠가 여기에 들어갑니다. 다양한 콘텐츠를 포함할 수 있습니다.</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">취소</Button>
              <Button>저장</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>두 번째 카드</CardTitle>
              <CardDescription>기본 사용 예시입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input placeholder="이름을 입력하세요" />
                <Textarea placeholder="상세 내용을 입력하세요" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">제출하기</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* 폼 요소 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">폼 요소</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">입력 필드</label>
              <Input placeholder="텍스트를 입력하세요" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">텍스트 영역</label>
              <Textarea placeholder="장문의 텍스트를 입력하세요" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">체크박스</label>
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  이용약관에 동의합니다
                </label>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">선택 메뉴</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="옵션을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">옵션 1</SelectItem>
                  <SelectItem value="option2">옵션 2</SelectItem>
                  <SelectItem value="option3">옵션 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">라디오 그룹</label>
              <RadioGroup defaultValue="option1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option1" id="option1" />
                  <label htmlFor="option1">옵션 1</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option2" id="option2" />
                  <label htmlFor="option2">옵션 2</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option3" id="option3" />
                  <label htmlFor="option3">옵션 3</label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      </section>

      {/* 배지 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">배지</h2>
        <div className="flex flex-wrap gap-4">
          <Badge>기본</Badge>
          <Badge variant="secondary">보조</Badge>
          <Badge variant="outline">외곽선</Badge>
          <Badge variant="destructive">삭제</Badge>
          <Badge variant="teal">티일</Badge>
        </div>
      </section>
      
      {/* 네비게이션 바 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">네비게이션 바</h2>
        <div className="border rounded-lg overflow-hidden">
          <Navbar
            logo={<div className="text-xl font-bold">로고</div>}
            items={[
              { href: '#', label: '홈', active: true },
              { href: '#', label: '상품' },
              { href: '#', label: '서비스' },
              { href: '#', label: '고객센터' },
            ]}
            rightItems={<NavbarSearch placeholder="검색어를 입력하세요" />}
            mobileMenuButton={<NavbarMobileMenuButton onClick={() => {}} />}
          />
        </div>
        <div className="mt-4 border rounded-lg overflow-hidden">
          <Navbar
            variant="subtle"
            logo={<div className="text-xl font-bold">로고</div>}
            items={[
              { href: '#', label: '홈' },
              { href: '#', label: '상품', active: true },
              { href: '#', label: '서비스' },
              { href: '#', label: '고객센터' },
            ]}
            rightItems={<Button size="sm">로그인</Button>}
            mobileMenuButton={<NavbarMobileMenuButton onClick={() => {}} />}
          />
        </div>
      </section>

      {/* 사이드바 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">사이드바</h2>
        <div className="border rounded-lg overflow-hidden h-[400px] flex">
          <Sidebar 
            variant="bordered" 
            collapsible
            collapsed={sidebarCollapsed}
            onCollapseToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-64"
          >
            <SidebarSection title="메인 메뉴">
              <SidebarItem href="#" label="대시보드" active />
              <SidebarItem href="#" label="통계" />
              <SidebarItem href="#" label="설정" />
            </SidebarSection>
            <SidebarSection title="관리">
              <SidebarItem href="#" label="사용자" />
              <SidebarItem href="#" label="권한" />
              <SidebarItem href="#" label="시스템" disabled />
            </SidebarSection>
          </Sidebar>
          <div className="flex-1 p-4">
            <h3 className="text-lg font-medium">콘텐츠 영역</h3>
            <p className="text-muted-foreground mt-2">사이드바와 함께 사용되는 메인 콘텐츠 영역입니다.</p>
          </div>
        </div>
      </section>

      {/* 테이블 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">테이블</h2>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>역할</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>홍길동</TableCell>
                <TableCell>hong@example.com</TableCell>
                <TableCell>관리자</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">수정</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>김철수</TableCell>
                <TableCell>kim@example.com</TableCell>
                <TableCell>사용자</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">수정</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>이영희</TableCell>
                <TableCell>lee@example.com</TableCell>
                <TableCell>사용자</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">수정</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      {/* 모달 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">모달</h2>
        <div className="flex gap-4">
          <Button onClick={() => setModalOpen(true)}>모달 열기</Button>
        </div>
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="모달 제목"
          description="모달에 대한 간단한 설명입니다."
          footer={
            <ModalFooter
              onCancel={() => setModalOpen(false)}
              onConfirm={() => {
                toast({
                  title: "완료",
                  description: "작업이 완료되었습니다.",
                  variant: "success",
                });
                setModalOpen(false);
              }}
            />
          }
        >
          <div className="space-y-4">
            <p>모달 내용이 여기에 들어갑니다.</p>
            <Input placeholder="이름을 입력하세요" />
          </div>
        </Modal>
      </section>

      {/* 탭 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">탭</h2>
        <div className="border rounded-lg p-4">
          <Tabs defaultValue="account">
            <TabsList>
              <TabsTrigger value="account">계정</TabsTrigger>
              <TabsTrigger value="password">비밀번호</TabsTrigger>
              <TabsTrigger value="settings">설정</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <div className="p-4">
                <h3 className="text-lg font-medium">계정 정보</h3>
                <p className="text-muted-foreground mt-2">계정 정보를 관리합니다.</p>
              </div>
            </TabsContent>
            <TabsContent value="password">
              <div className="p-4">
                <h3 className="text-lg font-medium">비밀번호 변경</h3>
                <p className="text-muted-foreground mt-2">비밀번호를 변경합니다.</p>
              </div>
            </TabsContent>
            <TabsContent value="settings">
              <div className="p-4">
                <h3 className="text-lg font-medium">일반 설정</h3>
                <p className="text-muted-foreground mt-2">앱 설정을 구성합니다.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <h3 className="text-lg font-medium mt-6">커스텀 탭 스타일</h3>
        <div className="border rounded-lg p-4">
          <CustomTabs
            variant="underline"
            items={[
              {
                id: "tab1",
                title: "첫 번째 탭",
                content: <div className="p-4">첫 번째 탭 내용입니다.</div>
              },
              {
                id: "tab2",
                title: "두 번째 탭",
                content: <div className="p-4">두 번째 탭 내용입니다.</div>
              },
              {
                id: "tab3",
                title: "세 번째 탭",
                content: <div className="p-4">세 번째 탭 내용입니다.</div>
              },
            ]}
          />
        </div>
      </section>
      
      {/* 토스트 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">토스트/알림</h2>
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={() => {
              toast({
                title: "알림",
                description: "일반 알림 메시지입니다.",
              });
            }}
          >
            기본 알림
          </Button>
          <Button
            variant="teal"
            onClick={() => {
              toast({
                title: "성공",
                description: "작업이 성공적으로 완료되었습니다.",
                variant: "success",
              });
            }}
          >
            성공 알림
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              toast({
                title: "오류",
                description: "작업 중 오류가 발생했습니다.",
                variant: "destructive",
              });
            }}
          >
            오류 알림
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              toast({
                title: "경고",
                description: "주의가 필요한 상황입니다.",
                variant: "warning",
              });
            }}
          >
            경고 알림
          </Button>
        </div>
      </section>

      {/* 여행 카드 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">커스텀 여행 카드</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TravelCard
            id="1"
            title="제주도 3박 4일 패키지"
            image="/bg_1.jpg"
            price={550000}
            location="제주도"
            duration="3박 4일"
            rating={4.8}
            hasTimeSale={true}
            onClick={() => alert('여행 상세 페이지로 이동')}
          />
          <TravelCard
            id="2"
            title="방콕 5박 6일 자유여행"
            image="/bg_2.jpg"
            price={750000}
            location="태국, 방콕"
            duration="5박 6일"
            rating={4.5}
            isConfirmed={true}
            onClick={() => alert('여행 상세 페이지로 이동')}
          />
          <TravelCard
            id="3"
            title="파리 일주일 투어 프리미엄"
            image="/bg_3.jpg"
            price={1250000}
            location="프랑스, 파리"
            duration="7박 8일"
            rating={4.9}
            hasTimeSale={true}
            isConfirmed={true}
            onClick={() => alert('여행 상세 페이지로 이동')}
          />
        </div>
      </section>
    </div>
  );
}; 