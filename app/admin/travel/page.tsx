'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, deleteDoc, setDoc, query, updateDoc, arrayUnion } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

// UI 컴포넌트
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { AdminPageLayout } from '../components/AdminPageLayout';
import { Grid, List, PlusCircle, Trash2, Copy, X, Eye, Pencil, ImageIcon, FolderCog } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface TravelProduct {
  id: string;
  title: string;
  description: string;
  price: {
    adult: number;
    child: number;
    infant: number;
    fuelSurcharge: number;
  };
  images: {
    src: string;
    alt: string;
  }[];
  createdAt: string;
}

interface TravelCategory {
  id: string;
  name: string;
  description?: string;
  url: string;
  type: number;
  imageUrl?: string;
  products?: string[];
}

type ViewMode = 'grid' | 'list';

export default function TravelProductList() {
  const [products, setProducts] = useState<TravelProduct[]>([]);
  const [categories, setCategories] = useState<TravelCategory[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const { toast } = useToast();

  // 여행 상품 데이터 가져오기
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const productsCollection = collection(db, 'travel_products');
      const productsQuery = query(productsCollection);
      const querySnapshot = await getDocs(productsQuery);
      
      const productsData: TravelProduct[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as TravelProduct;
        productsData.push({
          ...data,
          id: doc.id
        });
      });
      
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: '오류',
        description: '상품을 불러오는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 여행 카테고리 데이터 가져오기
  const fetchCategories = async () => {
    try {
      const categoriesCollection = collection(db, 'travel_board_categories');
      const categoriesQuery = query(categoriesCollection);
      const querySnapshot = await getDocs(categoriesQuery);
      
      const categoriesData: TravelCategory[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as TravelCategory;
        categoriesData.push({
          ...data,
          id: doc.id
        });
      });
      
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: '오류',
        description: '카테고리를 불러오는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 선택된 상품 토글
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // 선택된 상품 삭제
  const deleteSelectedProducts = async () => {
    try {
      setIsLoading(true);
      
      for (const productId of selectedProducts) {
        await deleteDoc(doc(db, 'travel_products', productId));
      }
      
      toast({
        title: '성공',
        description: `${selectedProducts.length}개의 상품이 삭제되었습니다.`,
      });
      
      setSelectedProducts([]);
      fetchProducts();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting products:', error);
      toast({
        title: '오류',
        description: '상품 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 선택된 상품 복제
  const copySelectedProducts = async () => {
    try {
      setIsLoading(true);
      
      for (const productId of selectedProducts) {
        const productToCopy = products.find(p => p.id === productId);
        if (productToCopy) {
          const newProductId = uuidv4();
          const newProduct = {
            ...productToCopy,
            id: newProductId,
            title: `${productToCopy.title} (복사본)`,
            createdAt: new Date().toISOString()
          };
          
          await setDoc(doc(db, 'travel_products', newProductId), newProduct);
        }
      }
      
      toast({
        title: '성공',
        description: `${selectedProducts.length}개의 상품이 복제되었습니다.`,
      });
      
      fetchProducts();
      setIsCopyDialogOpen(false);
    } catch (error) {
      console.error('Error copying products:', error);
      toast({
        title: '오류',
        description: '상품 복제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 선택된 상품을 카테고리로 복사
  const copyToCategory = async () => {
    if (!selectedCategory) {
      toast({
        title: '선택 필요',
        description: '카테고리를 선택해주세요.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);
      
      if (!selectedCategoryData) {
        throw new Error('선택한 카테고리를 찾을 수 없습니다.');
      }
      
      // 카테고리 문서 참조
      const categoryRef = doc(db, 'travel_board_categories', selectedCategory);
      
      // 선택된 각 상품에 대해
      for (const productId of selectedProducts) {
        const productToCopy = products.find(p => p.id === productId);
        if (productToCopy) {
          // products 필드가 없다면 초기화
          if (!selectedCategoryData.products) {
            await updateDoc(categoryRef, {
              products: [productId]
            });
          } else {
            // 이미 있다면 배열에 추가
            await updateDoc(categoryRef, {
              products: arrayUnion(productId)
            });
          }
        }
      }
      
      toast({
        title: '성공',
        description: `${selectedProducts.length}개의 상품이 "${selectedCategoryData.name}" 카테고리로 복사되었습니다.`,
      });
      
      setIsCategoryDialogOpen(false);
      setSelectedCategory('');
    } catch (error) {
      console.error('Error copying products to category:', error);
      toast({
        title: '오류',
        description: '카테고리로 상품 복사 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 그리드 뷰 렌더링
  const renderGridView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            {product.images && product.images.length > 0 && (
              <div className="relative w-full h-48">
                <Image 
                  src={product.images[0].src} 
                  alt={product.images[0].alt || product.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg truncate" title={product.title}>{product.title}</CardTitle>
                <Checkbox 
                  checked={selectedProducts.includes(product.id)}
                  onCheckedChange={() => toggleProductSelection(product.id)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-muted-foreground truncate mb-2" title={product.description}>
                {product.description}
              </p>
              <div className="flex justify-between items-center">
                <Badge variant="outline">
                  {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' })
                    .format(product.price.adult)}
                </Badge>
                <div className="flex space-x-1">
                  <Button size="icon" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // 리스트 뷰 렌더링
  const renderListView = () => {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedProducts.length > 0 && selectedProducts.length === products.length}
                  onCheckedChange={(checked: boolean) => {
                    if (checked) {
                      setSelectedProducts(products.map(p => p.id));
                    } else {
                      setSelectedProducts([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead>상품명</TableHead>
              <TableHead>가격</TableHead>
              <TableHead>생성일</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={() => toggleProductSelection(product.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {product.images && product.images.length > 0 ? (
                      <div className="relative w-10 h-10 rounded overflow-hidden">
                        <Image 
                          src={product.images[0].src} 
                          alt={product.images[0].alt || product.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <span>{product.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' })
                    .format(product.price.adult)}
                </TableCell>
                <TableCell>
                  {new Date(product.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    <Button size="icon" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  // 삭제 확인 다이얼로그
  const DeleteConfirmDialog = () => (
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>상품 삭제 확인</DialogTitle>
        </DialogHeader>
        <p>
          선택한 {selectedProducts.length}개의 상품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
            취소
          </Button>
          <Button variant="destructive" onClick={deleteSelectedProducts} disabled={isLoading}>
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // 복제 확인 다이얼로그
  const CopyConfirmDialog = () => (
    <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>상품 복제 확인</DialogTitle>
        </DialogHeader>
        <p>
          선택한 {selectedProducts.length}개의 상품을 복제하시겠습니까?
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsCopyDialogOpen(false)}>
            취소
          </Button>
          <Button onClick={copySelectedProducts} disabled={isLoading}>
            복제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // 카테고리로 복사 다이얼로그
  const CategoryCopyDialog = () => (
    <Dialog open={isCategoryDialogOpen} onOpenChange={(open) => {
      setIsCategoryDialogOpen(open);
      if (!open) {
        // 다이얼로그가 닫힐 때 선택된 카테고리 초기화
        setSelectedCategory('');
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>카테고리로 상품 복사</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-4">선택한 {selectedProducts.length}개의 상품을 어떤 카테고리로 복사하시겠습니까?</p>
          
          {categories.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {categories.map((category) => (
                <div 
                  key={category.id} 
                  className={`flex items-center space-x-2 rounded-md border p-3 ${
                    selectedCategory === category.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <input
                    type="radio"
                    id={`category-${category.id}`}
                    name="category"
                    value={category.id}
                    checked={selectedCategory === category.id}
                    onChange={() => setSelectedCategory(category.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor={`category-${category.id}`} className="flex-grow cursor-pointer">
                    <div className="font-medium">{category.name}</div>
                    {category.description && (
                      <div className="text-sm text-muted-foreground">{category.description}</div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">URL: /travel/{category.url}</div>
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">등록된 카테고리가 없습니다.</p>
              <Button asChild className="mt-2">
                <Link href="/admin/travel/categories">카테고리 관리로 이동</Link>
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
            취소
          </Button>
          <Button onClick={copyToCategory} disabled={isLoading || !selectedCategory}>
            복사
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // 액션 버튼 렌더링
  const renderActions = () => (
    <div className="flex items-center space-x-2">
      <Button
        onClick={() => setViewMode('grid')}
        variant={viewMode === 'grid' ? 'default' : 'outline'}
        size="icon"
        className="h-8 w-8"
      >
        <Grid className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => setViewMode('list')}
        variant={viewMode === 'list' ? 'default' : 'outline'}
        size="icon"
        className="h-8 w-8"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => setIsCategoryDialogOpen(true)}
        variant="outline"
        size="sm"
        disabled={selectedProducts.length === 0}
      >
        <FolderCog className="h-4 w-4 mr-2" />
        카테고리로 복사
      </Button>
      <Button
        onClick={() => setIsCopyDialogOpen(true)}
        variant="outline"
        size="sm"
        disabled={selectedProducts.length === 0}
      >
        <Copy className="h-4 w-4 mr-2" />
        복제
      </Button>
      <Button
        onClick={() => setIsDeleteDialogOpen(true)}
        variant="destructive"
        size="sm"
        disabled={selectedProducts.length === 0}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        삭제
      </Button>
      <Button size="sm" asChild>
        <Link href="/admin/travel/create">
          <PlusCircle className="h-4 w-4 mr-2" />
          새 상품
        </Link>
      </Button>
    </div>
  );

  return (
    <>
      <AdminPageLayout
        title="여행 상품 관리"
        description="여행 상품을 관리하고 편집할 수 있습니다."
        actions={renderActions()}
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>로딩 중...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 border rounded-md bg-muted/10">
            <p className="text-muted-foreground mb-4">등록된 여행 상품이 없습니다.</p>
            <Button asChild>
              <Link href="/admin/travel/create">
                <PlusCircle className="h-4 w-4 mr-2" />
                새 상품 등록
              </Link>
            </Button>
          </div>
        ) : (
          viewMode === 'grid' ? renderGridView() : renderListView()
        )}
      </AdminPageLayout>

      <DeleteConfirmDialog />
      <CopyConfirmDialog />
      <CategoryCopyDialog />
    </>
  );
}
