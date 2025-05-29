'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { AdminPageLayout } from '../components/AdminPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Trash2, Bell } from 'lucide-react';
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

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'notice' | 'event' | 'update';
  createdAt: string;
  isPublished: boolean;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'notice' as 'notice' | 'event' | 'update',
    isPublished: true
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(notificationsQuery);
      
      const notificationsData: Notification[] = [];
      querySnapshot.forEach((doc) => {
        notificationsData.push({
          id: doc.id,
          ...doc.data()
        } as Notification);
      });
      
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: '오류',
        description: '알림 목록을 불러오는 중 오류가 발생했습니다.',
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

      const newNotification = {
        ...formData,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'notifications'), newNotification);
      
      toast({
        title: '등록 완료',
        description: '새 알림이 등록되었습니다.',
      });
      
      setFormData({
        title: '',
        content: '',
        type: 'notice',
        isPublished: true
      });
      
      setIsDialogOpen(false);
      fetchNotifications();
    } catch (error) {
      console.error('Error adding notification:', error);
      toast({
        title: '오류',
        description: '알림 등록 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 알림을 삭제하시겠습니까?')) return;
    
    try {
      await deleteDoc(doc(db, 'notifications', id));
      toast({
        title: '삭제 완료',
        description: '알림이 삭제되었습니다.',
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: '오류',
        description: '알림 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'notice':
        return { label: '공지사항', color: 'bg-blue-500' };
      case 'event':
        return { label: '이벤트', color: 'bg-green-500' };
      case 'update':
        return { label: '업데이트', color: 'bg-purple-500' };
      default:
        return { label: '기타', color: 'bg-gray-500' };
    }
  };

  const formatDate = (dateString: string) => {
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
      title="알림 및 소식 관리"
      description="여행 앱의 알림과 소식을 관리합니다."
      actions={(
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              새 알림 등록
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 알림 등록</DialogTitle>
              <DialogDescription>
                사용자에게 전달할 알림이나 소식을 등록합니다.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="알림 제목"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="알림 내용"
                  rows={5}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">유형</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="notice">공지사항</option>
                  <option value="event">이벤트</option>
                  <option value="update">업데이트</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="isPublished">즉시 게시</Label>
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
      <Card>
        <CardHeader>
          <CardTitle>알림 및 소식 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 rounded-full"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="mx-auto h-12 w-12 text-gray-300 mb-2" />
              <p>등록된 알림이 없습니다.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>유형</TableHead>
                  <TableHead>제목</TableHead>
                  <TableHead>등록일</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => {
                  const typeInfo = getTypeLabel(notification.type);
                  return (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <Badge className={typeInfo.color + " text-white"}>
                          {typeInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{notification.title}</TableCell>
                      <TableCell>{formatDate(notification.createdAt)}</TableCell>
                      <TableCell>
                        {notification.isPublished ? (
                          <Badge variant="default">게시중</Badge>
                        ) : (
                          <Badge variant="outline">미게시</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(notification.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}
