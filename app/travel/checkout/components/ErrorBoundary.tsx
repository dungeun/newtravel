'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clearAllCheckoutData } from '@/lib/checkout/checkoutSync';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * 체크아웃 시스템의 오류를 처리하는 ErrorBoundary 컴포넌트
 * 
 * 체크아웃 과정에서 발생하는 예외를 캐치하고 사용자 친화적인 오류 메시지를 표시합니다.
 * 오류 발생 시 세션 복구, 페이지 새로고침 등의 기능을 제공합니다.
 */
class CheckoutErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // 다음 렌더링에서 폴백 UI를 표시하도록 상태 업데이트
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 오류 정보 로깅
    console.error('체크아웃 오류:', error, errorInfo);
    this.setState({
      errorInfo
    });
    
    // 필요한 경우 오류 모니터링 서비스에 오류 보고
    // reportError(error, errorInfo);
  }

  // 체크아웃 세션 초기화 및 페이지 새로고침
  handleReset = (): void => {
    clearAllCheckoutData();
    window.location.reload();
  };

  // 이전 단계로 돌아가기
  handleGoBack = (): void => {
    window.history.back();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // 사용자 정의 폴백 UI가 제공된 경우 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 오류 UI
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">오류가 발생했습니다</h2>
          <p className="mb-6 text-gray-600">
            체크아웃 과정에서 예상치 못한 오류가 발생했습니다. 
            다시 시도하거나 고객센터에 문의해주세요.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              오류 코드: {this.state.error?.name || 'Unknown'}
            </p>
            <p className="text-sm text-gray-500">
              {this.state.error?.message || '알 수 없는 오류가 발생했습니다.'}
            </p>
          </div>
          <div className="mt-6 flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Button variant="outline" onClick={this.handleGoBack}>
              이전 페이지로 돌아가기
            </Button>
            <Button onClick={this.handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              체크아웃 다시 시작하기
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default CheckoutErrorBoundary;
