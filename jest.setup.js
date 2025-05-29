// jest-dom은 DOM 노드에 대한 assertion을 위한 custom matchers를 추가합니다.
import '@testing-library/jest-dom';

// 테스트 시 Window 속성 모킹
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// 테스트 타임아웃 설정
jest.setTimeout(10000);

// 전역 객체에 필요한 속성을 모킹합니다.
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// 모든 콘솔 경고 및 오류는 테스트 실패로 처리되지만 특정 상황에서는 무시 가능합니다.
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  // 테스트 시 무시할 특정 에러 메시지가 있으면 여기에 조건 추가
  if (
    args[0]?.includes('Warning:') || 
    args[0]?.includes('React does not recognize the') || 
    args[0]?.includes('Invalid DOM property')
  ) {
    return;
  }
  originalConsoleError(...args);
};

console.warn = (...args) => {
  // 테스트 시 무시할 특정 경고 메시지가 있으면 여기에 조건 추가
  if (
    args[0]?.includes('Warning:') || 
    args[0]?.includes('React does not recognize the') || 
    args[0]?.includes('Invalid DOM property')
  ) {
    return;
  }
  originalConsoleWarn(...args);
}; 