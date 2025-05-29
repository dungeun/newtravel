'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { AdminPageLayout } from '../components/AdminPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Send, Users, Calendar, BellRing } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PushAd {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  targetType: 'all' | 'segment' | 'specific';
  targetSegment?: string;
  targetUserIds?: string[];
  scheduledDate: string | null;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  sentCount?: number;
  createdAt: string;
}

export default function PushAdsPage() {
  const [pushAds, setPushAds] = useState<PushAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    targetType: 'all' as 'all' | 'segment' | 'specific',
    targetSegment: '전체 사용자',
    scheduledDate: '',
    status: 'draft' as 'draft' | 'scheduled' | 'sent' | 'failed',
  });

  useEffect(() => {
    fetchPushAds();
  }, []);

  const fetchPushAds = async () => {
    setLoading(true);
    try {
      const pushAdsQuery = query(
        collection(db, 'push_ads'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(pushAdsQuery);
      
      const pushAdsData: PushAd[] = [];
      querySnapshot.forEach((doc) => {
        pushAdsData.push({
          id: doc.id,
          ...doc.data()
        } as PushAd);
      });
      
      setPushAds(pushAdsData);
    } catch (error) {
      console.error('Error fetching push ads:', error);
      toast({
        title: '오류',
        description: '광고 목록을 불러오는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.title || !formData.content) {
        toast({
          title: '입력 오류',
          description: '제목과 내용을 모두 입력해주세요.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // 예약 발송 여부에 따라 상태 설정
      const status = formData.scheduledDate ? 'scheduled' : 'draft';
      
      const newPushAd = {
        ...formData,
        status,
        sentCount: 0,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'push_ads'), newPushAd);
      
      toast({
        title: '등록 완료',
        description: formData.scheduledDate 
          ? '광고가 예약 발송 대기 중입니다.' 
          : '광고가 등록되었습니다.',
      });
      
      setFormData({
        title: '',
        content: '',
        imageUrl: '',
        targetType: 'all',
        targetSegment: '전체 사용자',
        scheduledDate: '',
        status: 'draft',
      });
      
      setIsDialogOpen(false);
      fetchPushAds();
    } catch (error) {
      console.error('Error adding push ad:', error);
      toast({
        title: '오류',
        description: '광고 등록 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendNow = async (id: string) => {
    if (!confirm('지금 이 광고를 발송하시겠습니까?')) return;
    
    // 실제 구현에서는 여기에 FCM 또는 다른 푸시 서비스 연동 코드가 들어갑니다
    // 지금은 시뮬레이션만 합니다
    
    try {
      // 실제 발송 로직 대신 상태만 변경
      const updatedAds = pushAds.map(ad => {
        if (ad.id === id) {
          return {
            ...ad,
            status: 'sent' as 'sent',
            sentCount: Math.floor(Math.random() * 1000) + 100, // 임의의 발송 수
          };
        }
        return ad;
      });
      
      setPushAds(updatedAds);
      
      toast({
        title: '발송 완료',
        description: '광고가 성공적으로 발송되었습니다.',
      });
    } catch (error) {
      console.error('Error sending push ad:', error);
      toast({
        title: '오류',
        description: '광고 발송 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return { label: '임시저장', color: 'bg-gray-500' };
      case 'scheduled':
        return { label: '예약발송', color: 'bg-yellow-500' };
      case 'sent':
        return { label: '발송완료', color: 'bg-green-500' };
      case 'failed':
        return { label: '발송실패', color: 'bg-red-500' };
      default:
        return { label: '기타', color: 'bg-gray-500' };
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <AdminPageLayout
      title="PWA 광고 발송 관리"
      description="앱 사용자에게 푸시 알림을 통해 광고를 발송합니다."
      actions={(
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              새 광고 등록
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>새 광고 등록</DialogTitle>
              <DialogDescription>
                사용자에게 발송할 푸시 알림 광고를 등록합니다.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="광고 제목"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="광고 내용"
                  rows={3}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="imageUrl">이미지 URL (선택사항)</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="grid gap-2">
                <Label>발송 대상</Label>
                <RadioGroup 
                  value={formData.targetType} 
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    targetType: value as 'all' | 'segment' | 'specific' 
                  })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all">전체 사용자</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="segment" id="segment" />
                    <Label htmlFor="segment">세그먼트</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {formData.targetType === 'segment' && (
                <div className="grid gap-2">
                  <Label htmlFor="targetSegment">세그먼트 선택</Label>
                  <select
                    id="targetSegment"
                    value={formData.targetSegment}
                    onChange={(e) => setFormData({ ...formData, targetSegment: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="전체 사용자">전체 사용자</option>
                    <option value="활성 사용자">활성 사용자 (최근 30일 이내 접속)</option>
                    <option value="휴면 사용자">휴면 사용자 (30일 이상 미접속)</option>
                    <option value="구매 이력 있음">구매 이력 있음</option>
                    <option value="신규 가입자">신규 가입자 (최근 7일 이내)</option>
                  </select>
                </div>
              )}
              
              <div className="grid gap-2">
                <Label htmlFor="scheduledDate">예약 발송 (선택사항)</Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                />
                <p className="text-xs text-gray-500">비워두면 수동으로 발송해야 합니다.</p>
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? '등록 중...' : '등록하기'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    >
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="draft">임시저장</TabsTrigger>
          <TabsTrigger value="scheduled">예약발송</TabsTrigger>
          <TabsTrigger value="sent">발송완료</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>광고 목록</CardTitle>
            </CardHeader>
            <CardContent>
              {renderAdsList(pushAds)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="draft" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>임시저장 광고</CardTitle>
            </CardHeader>
            <CardContent>
              {renderAdsList(pushAds.filter(ad => ad.status === 'draft'))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="scheduled" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>예약발송 광고</CardTitle>
            </CardHeader>
            <CardContent>
              {renderAdsList(pushAds.filter(ad => ad.status === 'scheduled'))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sent" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>발송완료 광고</CardTitle>
            </CardHeader>
            <CardContent>
              {renderAdsList(pushAds.filter(ad => ad.status === 'sent'))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
  
  function renderAdsList(ads: PushAd[]) {
    if (loading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 rounded-full"></div>
        </div>
      );
    }
    
    if (ads.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <BellRing className="mx-auto h-12 w-12 text-gray-300 mb-2" />
          <p>등록된 광고가 없습니다.</p>
        </div>
      );
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>제목</TableHead>
            <TableHead>대상</TableHead>
            <TableHead>예약일시</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>발송수</TableHead>
            <TableHead className="text-right">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ads.map((ad) => {
            const statusInfo = getStatusLabel(ad.status);
            return (
              <TableRow key={ad.id}>
                <TableCell className="font-medium">{ad.title}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{ad.targetType === 'all' ? '전체' : ad.targetSegment}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {ad.scheduledDate ? (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(ad.scheduledDate)}</span>
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={statusInfo.color + " text-white"}>
                    {statusInfo.label}
                  </Badge>
                </TableCell>
                <TableCell>{ad.sentCount || 0}</TableCell>
                <TableCell className="text-right">
                  {(ad.status === 'draft' || ad.status === 'scheduled') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendNow(ad.id)}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      지금 발송
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  }
}
