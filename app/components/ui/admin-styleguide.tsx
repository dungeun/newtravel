'use client';

import React from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Checkbox } from './checkbox';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Textarea } from './textarea';
import { Badge } from './badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { useToast } from '@/components/ui/use-toast';

/**
 * 어드민 UI 스타일 가이드
 * 
 * 이 컴포넌트는 어드민 페이지에서 사용할 수 있는 모든 UI 컴포넌트를 보여주고
 * 일관된 스타일링을 위한 가이드라인을 제공합니다.
 */
export const AdminStyleGuide = () => {
  const { toast } = useToast();

  return (
    <div className="container mx-auto p-6 space-y-10 dark:bg-slate-900 dark:text-white">
      <div>
        <h1 className="text-3xl font-bold mb-6">어드민 UI 스타일 가이드</h1>
        <p className="text-muted-foreground dark:text-slate-400">
          이 페이지는 어드민 페이지에서 사용되는 통일된 디자인 시스템 컴포넌트와 스타일을 보여줍니다.
          모든 어드민 페이지는 이 가이드를 따라야 합니다.
        </p>
      </div>

      {/* 타이포그래피 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">타이포그래피</h2>
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold">제목 1 (text-3xl)</h1>
              <p className="text-sm text-muted-foreground dark:text-slate-400">페이지 메인 제목에 사용</p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold">제목 2 (text-2xl)</h2>
              <p className="text-sm text-muted-foreground dark:text-slate-400">섹션 제목에 사용</p>
            </div>
            <div>
              <h3 className="text-xl font-medium">제목 3 (text-xl)</h3>
              <p className="text-sm text-muted-foreground dark:text-slate-400">서브 섹션 제목에 사용</p>
            </div>
            <div>
              <h4 className="text-lg font-medium">제목 4 (text-lg)</h4>
              <p className="text-sm text-muted-foreground dark:text-slate-400">카드 제목 등에 사용</p>
            </div>
            <div>
              <p className="text-base">본문 텍스트 (text-base)</p>
              <p className="text-sm text-muted-foreground dark:text-slate-400">일반 텍스트에 사용</p>
            </div>
            <div>
              <p className="text-sm">작은 텍스트 (text-sm)</p>
              <p className="text-sm text-muted-foreground dark:text-slate-400">보조 텍스트에 사용</p>
            </div>
            <div>
              <p className="text-xs">매우 작은 텍스트 (text-xs)</p>
              <p className="text-sm text-muted-foreground dark:text-slate-400">메타 정보, 날짜 등에 사용</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 색상 팔레트 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">색상 팔레트</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-20 bg-primary rounded-md"></div>
                <p className="text-sm font-medium">Primary</p>
                <p className="text-xs text-muted-foreground dark:text-slate-400">주요 액션, 강조</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-secondary rounded-md"></div>
                <p className="text-sm font-medium">Secondary</p>
                <p className="text-xs text-muted-foreground dark:text-slate-400">보조 액션</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-destructive rounded-md"></div>
                <p className="text-sm font-medium">Destructive</p>
                <p className="text-xs text-muted-foreground dark:text-slate-400">삭제, 경고</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-muted rounded-md dark:bg-slate-800"></div>
                <p className="text-sm font-medium">Muted</p>
                <p className="text-xs text-muted-foreground dark:text-slate-400">배경, 비활성화</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 버튼 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">버튼</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-medium">기본 버튼</h3>
                <div className="flex flex-wrap gap-4">
                  <Button variant="default">기본</Button>
                  <Button variant="secondary">보조</Button>
                  <Button variant="destructive">삭제</Button>
                  <Button variant="outline">아웃라인</Button>
                  <Button variant="ghost">고스트</Button>
                  <Button variant="link">링크</Button>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-medium">크기</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-medium">상태</h3>
                <div className="flex flex-wrap gap-4">
                  <Button disabled>비활성화</Button>
                  <Button variant="outline" disabled>비활성화 아웃라인</Button>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-medium">아이콘 버튼</h3>
                <div className="flex flex-wrap gap-4">
                  <Button>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M5 12h14"></path>
                      <path d="M12 5v14"></path>
                    </svg>
                    추가
                  </Button>
                  <Button variant="outline">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    다운로드
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 폼 요소 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">폼 요소</h2>
        <Card>
          <CardContent className="pt-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-medium">입력 필드</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="default-input" className="text-sm font-medium">기본 입력</label>
                    <Input id="default-input" placeholder="입력해주세요" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="disabled-input" className="text-sm font-medium">비활성화 입력</label>
                    <Input id="disabled-input" placeholder="비활성화" disabled />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-medium">텍스트 영역</h3>
                <div className="space-y-2">
                  <label htmlFor="textarea" className="text-sm font-medium">설명</label>
                  <Textarea id="textarea" placeholder="내용을 입력해주세요" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-medium">체크박스</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      이용약관에 동의합니다
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="newsletter" disabled />
                    <label htmlFor="newsletter" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      뉴스레터 구독 (비활성화)
                    </label>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-medium">라디오 버튼</h3>
                <RadioGroup defaultValue="option-one">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-one" id="option-one" />
                    <label htmlFor="option-one" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      옵션 1
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-two" id="option-two" />
                    <label htmlFor="option-two" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      옵션 2
                    </label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-medium">선택 메뉴</h3>
                <div className="space-y-2">
                  <label htmlFor="select" className="text-sm font-medium">카테고리 선택</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="선택해주세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="option-1">옵션 1</SelectItem>
                      <SelectItem value="option-2">옵션 2</SelectItem>
                      <SelectItem value="option-3">옵션 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 테이블 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">테이블</h2>
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>1</TableCell>
                  <TableCell>제주도 여행</TableCell>
                  <TableCell>
                    <Badge variant="success">활성</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">보기</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2</TableCell>
                  <TableCell>서울 시티투어</TableCell>
                  <TableCell>
                    <Badge variant="secondary">대기</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">보기</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>3</TableCell>
                  <TableCell>부산 해운대</TableCell>
                  <TableCell>
                    <Badge variant="destructive">중단</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">보기</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* 탭 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">탭</h2>
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">개요</TabsTrigger>
                <TabsTrigger value="analytics">통계</TabsTrigger>
                <TabsTrigger value="reports">보고서</TabsTrigger>
                <TabsTrigger value="settings">설정</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="p-4">
                <h3 className="text-lg font-medium mb-2">개요</h3>
                <p>이 탭에는 개요 정보가 표시됩니다.</p>
              </TabsContent>
              <TabsContent value="analytics" className="p-4">
                <h3 className="text-lg font-medium mb-2">통계</h3>
                <p>이 탭에는 통계 정보가 표시됩니다.</p>
              </TabsContent>
              <TabsContent value="reports" className="p-4">
                <h3 className="text-lg font-medium mb-2">보고서</h3>
                <p>이 탭에는 보고서가 표시됩니다.</p>
              </TabsContent>
              <TabsContent value="settings" className="p-4">
                <h3 className="text-lg font-medium mb-2">설정</h3>
                <p>이 탭에는 설정이 표시됩니다.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>

      {/* 카드 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">카드</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>기본 카드</CardTitle>
              <CardDescription>카드 설명 텍스트입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>카드 내용이 여기에 표시됩니다.</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost">취소</Button>
              <Button>저장</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>통계 카드</CardTitle>
              <CardDescription>주요 통계 정보</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-5xl font-bold">2,543</p>
                <p className="text-sm text-muted-foreground mt-2">총 주문 수</p>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground w-full text-center">
                <span className="text-green-500 font-medium">↑ 12%</span> 지난 달 대비
              </p>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* 알림 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">알림</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Button 
                onClick={() => 
                  toast({
                    title: "성공!",
                    description: "작업이 성공적으로 완료되었습니다.",
                    variant: "default",
                  })
                }
              >
                성공 알림
              </Button>
              <Button 
                variant="destructive"
                onClick={() => 
                  toast({
                    title: "오류 발생!",
                    description: "작업 중 오류가 발생했습니다.",
                    variant: "destructive",
                  })
                }
              >
                오류 알림
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 사용 가이드라인 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">사용 가이드라인</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium mb-2">1. 일관된 타이포그래피</h3>
                <p>모든 어드민 페이지에서 동일한 폰트 크기와 스타일을 사용하세요.</p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                  <li>페이지 제목: text-3xl font-bold</li>
                  <li>섹션 제목: text-2xl font-semibold</li>
                  <li>서브 섹션: text-xl font-medium</li>
                  <li>본문: text-base</li>
                  <li>보조 텍스트: text-sm text-muted-foreground</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">2. 색상 사용</h3>
                <p>정의된 색상 변수를 사용하여 일관된 색상 체계를 유지하세요.</p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                  <li>주요 액션: bg-primary text-primary-foreground</li>
                  <li>보조 액션: bg-secondary text-secondary-foreground</li>
                  <li>위험 액션: bg-destructive text-destructive-foreground</li>
                  <li>중립 배경: bg-muted text-muted-foreground</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">3. 레이아웃 구조</h3>
                <p>일관된 레이아웃 구조를 사용하세요.</p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                  <li>페이지 제목과 액션 버튼은 상단에 배치</li>
                  <li>관련 요소는 카드로 그룹화</li>
                  <li>일관된 여백 사용 (p-6, gap-6, space-y-6 등)</li>
                  <li>반응형 그리드 사용 (grid-cols-1 md:grid-cols-2 등)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">4. 다크 모드 지원</h3>
                <p>모든 컴포넌트는 다크 모드를 지원해야 합니다.</p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                  <li>다크 모드 변형 클래스 사용 (dark:bg-slate-900, dark:text-white 등)</li>
                  <li>충분한 대비를 유지하여 가독성 확보</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default AdminStyleGuide;
