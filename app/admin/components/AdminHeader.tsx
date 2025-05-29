"use client"

import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Home as HomeIcon, Layout, ChevronDown } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminHeader() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-20 bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-950 dark:to-slate-900 shadow-lg">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-primary">여행 상품 관리자</h1>
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-sm font-medium text-slate-200 hover:text-primary transition-colors flex items-center gap-1">
              <HomeIcon className="w-4 h-4" />
              <span>메인으로</span>
            </Link>
            
            {/* 디자인 섹션 드롭다운 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-sm font-medium text-slate-200 hover:text-primary transition-colors flex items-center gap-1">
                  <Layout className="w-4 h-4" />
                  <span>디자인</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href="/admin/design/hero-slides">히어로 슬라이드</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/design/section-manager">섹션 관리</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link href="/admin/styleguide" className="text-sm font-medium text-slate-200 hover:text-primary transition-colors">
              스타일 가이드
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="flex items-center gap-2">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name ?? "프로필"}
                className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-400 dark:bg-slate-700 flex items-center justify-center text-white">
                <UserIcon className="w-5 h-5" />
              </div>
            )}
            <span className="font-medium text-sm text-slate-200">
              {user?.name || "로그인"}
            </span>
            {user ? (
              <Button
                variant="outline"
                size="sm"
                className="ml-2 text-slate-200 hover:text-white border-slate-600 hover:border-slate-500"
                onClick={() => signOut()}
              >
                로그아웃
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="ml-2 text-slate-200 hover:text-white border-slate-600 hover:border-slate-500"
                asChild
              >
                <Link href="/api/auth/signin">로그인</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 