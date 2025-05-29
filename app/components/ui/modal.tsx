import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  contentClassName?: string;
  closeOnOutsideClick?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
  contentClassName,
  closeOnOutsideClick = true,
}: ModalProps) {
  // 모달이 닫혀있을 때는 렌더링하지 않음
  if (!isOpen) return null;

  // 배경 클릭 핸들러
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // 사이즈별 클래스
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full m-4',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className={cn(
          'relative flex flex-col rounded-lg bg-background shadow-lg',
          sizeClasses[size],
          'w-full animate-in fade-in-0 zoom-in-95 duration-300',
          className
        )}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="닫기"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* 헤더 */}
        {(title || description) && (
          <div className="border-b px-6 py-4">
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}

        {/* 본문 */}
        <div
          className={cn(
            'flex-1 overflow-auto p-6',
            !title && !description && 'pt-8',
            contentClassName
          )}
        >
          {children}
        </div>

        {/* 푸터 */}
        {footer && (
          <div className="border-t px-6 py-4">
            <div className="flex flex-wrap items-center justify-end gap-2">
              {footer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 기본 모달 사용 예시를 위한 버튼이 포함된 푸터
export function ModalFooter({
  onCancel,
  onConfirm,
  cancelText = '취소',
  confirmText = '확인',
  danger = false,
}: {
  onCancel?: () => void;
  onConfirm: () => void;
  cancelText?: string;
  confirmText?: string;
  danger?: boolean;
}) {
  return (
    <>
      {onCancel && (
        <Button variant="outline" onClick={onCancel}>
          {cancelText}
        </Button>
      )}
      <Button
        variant={danger ? 'destructive' : 'default'}
        onClick={onConfirm}
      >
        {confirmText}
      </Button>
    </>
  );
} 