"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { TravelProduct } from "@/app/types/product"
import { ArrowUpDown, Edit, Eye, Trash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export type ProductColumns = {
  onDelete: (product: TravelProduct) => void
}

export const getProductColumns = ({
  onDelete,
}: ProductColumns): ColumnDef<TravelProduct>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          상품명
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const title = row.getValue("title") as string
      return (
        <div className="max-w-[500px] truncate font-medium">
          {title}
        </div>
      )
    },
  },
  {
    accessorKey: "price",
    header: "가격",
    cell: ({ row }) => {
      const price = row.original.price;
      return new Intl.NumberFormat('ko-KR', { 
        style: 'currency', 
        currency: price.currency || 'KRW' 
      }).format(price.adult);
    },
  },
  {
    accessorKey: "region",
    header: "지역",
    cell: ({ row }) => {
      const region = row.getValue("region") as string;
      return region || "-";
    },
  },
  {
    accessorKey: "status",
    header: "상태",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      
      return (
        <Badge variant={status === 'published' ? 'default' : 'secondary'}>
          {status === 'published' ? '공개' : 
          status === 'draft' ? '임시저장' : '비공개'}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          등록일
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt")
      
      if (!createdAt) return "-"
      
      const date = new Date(createdAt as string | Date)
      return date.toLocaleDateString()
    },
  },
  {
    id: "actions",
    header: "관리",
    cell: ({ row }) => {
      const product = row.original

      return (
        <div className="flex items-center justify-end gap-2">
          <Link href={`/admin/travel/${product.id}`} passHref>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              보기
            </Button>
          </Link>
          <Link href={`/admin/travel/${product.id}/edit`} passHref>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              편집
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={() => onDelete(product)}>
            <Trash className="h-4 w-4 mr-1" />
            삭제
          </Button>
        </div>
      )
    },
  },
] 