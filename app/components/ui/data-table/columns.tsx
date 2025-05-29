"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ProductCategory } from "@/app/types/category"
import { ArrowUpDown, Edit, Trash } from "lucide-react"

export type CategoryColumns = {
  onEdit: (category: ProductCategory) => void
  onDelete: (category: ProductCategory) => void
}

export const getCategoryColumns = ({
  onEdit,
  onDelete,
}: CategoryColumns): ColumnDef<ProductCategory>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          카테고리명
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "description",
    header: "설명",
    cell: ({ row }) => row.getValue("description") || "-",
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
      const category = row.original

      return (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(category)}>
            <Edit className="h-4 w-4 mr-1" />
            편집
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(category)}>
            <Trash className="h-4 w-4 mr-1" />
            삭제
          </Button>
        </div>
      )
    },
  },
] 