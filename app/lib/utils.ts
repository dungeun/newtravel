import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 

/**
 * 파일 크기가 지정된 MB를 초과하는지 확인
 * @param file 확인할 파일
 * @param maxSizeMB 최대 허용 크기(MB)
 * @returns 파일 크기가 초과하면 true, 아니면 false
 */
export function isFileSizeExceeded(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size > maxSizeBytes;
}