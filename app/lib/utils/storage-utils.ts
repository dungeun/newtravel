'use client';

/**
 * 세션 스토리지 유틸리티 함수
 * 
 * 이 파일은 세션 스토리지와 관련된 유틸리티 함수들을 제공합니다.
 * Zustand persist 미들웨어와 함께 사용하여 상태 관리의 지속성을 보장합니다.
 */

/**
 * 세션 스토리지에 데이터 저장
 * @param key 저장할 데이터의 키
 * @param value 저장할 데이터의 값
 */
export const setSessionItem = <T>(key: string, value: T): void => {
  try {
    if (typeof window !== 'undefined') {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
    }
  } catch (error) {
    console.error(`세션 스토리지 저장 오류 (${key}):`, error);
  }
};

/**
 * 세션 스토리지에서 데이터 조회
 * @param key 조회할 데이터의 키
 * @param defaultValue 기본값 (데이터가 없을 경우 반환)
 * @returns 조회된 데이터 또는 기본값
 */
export const getSessionItem = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof window !== 'undefined') {
      const serializedValue = sessionStorage.getItem(key);
      if (serializedValue === null) {
        return defaultValue;
      }
      return JSON.parse(serializedValue) as T;
    }
    return defaultValue;
  } catch (error) {
    console.error(`세션 스토리지 조회 오류 (${key}):`, error);
    return defaultValue;
  }
};

/**
 * 세션 스토리지에서 데이터 삭제
 * @param key 삭제할 데이터의 키
 */
export const removeSessionItem = (key: string): void => {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(key);
    }
  } catch (error) {
    console.error(`세션 스토리지 삭제 오류 (${key}):`, error);
  }
};

/**
 * 세션 스토리지 전체 초기화
 */
export const clearSessionStorage = (): void => {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }
  } catch (error) {
    console.error('세션 스토리지 초기화 오류:', error);
  }
};

/**
 * 세션 스토리지 동기화 함수
 * 여러 탭 간의 세션 스토리지 동기화를 위한 함수
 * @param callback 동기화 이벤트 발생 시 호출될 콜백 함수
 */
export const setupStorageSync = (callback: () => void): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }
  
  // 스토리지 이벤트 리스너
  const handleStorageChange = (event: StorageEvent) => {
    // 세션 스토리지 변경 이벤트 처리
    if (event.storageArea === sessionStorage) {
      callback();
    }
  };
  
  // 이벤트 리스너 등록
  window.addEventListener('storage', handleStorageChange);
  
  // 클린업 함수 반환
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

/**
 * 세션 스토리지 사용 가능 여부 확인
 * @returns 세션 스토리지 사용 가능 여부
 */
export const isSessionStorageAvailable = (): boolean => {
  try {
    if (typeof window === 'undefined') {
      return false;
    }
    
    const testKey = '__storage_test__';
    sessionStorage.setItem(testKey, testKey);
    sessionStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * 세션 스토리지 폴백 (대체) 객체
 * 세션 스토리지를 사용할 수 없는 환경에서 사용
 */
export class MemoryStorage {
  private storage: Record<string, string> = {};
  
  getItem(key: string): string | null {
    return key in this.storage ? this.storage[key] : null;
  }
  
  setItem(key: string, value: string): void {
    this.storage[key] = value;
  }
  
  removeItem(key: string): void {
    delete this.storage[key];
  }
  
  clear(): void {
    this.storage = {};
  }
}

/**
 * 세션 스토리지 또는 대체 스토리지 반환
 * 세션 스토리지를 사용할 수 없는 환경에서는 메모리 스토리지 반환
 */
export const getStorage = (): Storage => {
  if (isSessionStorageAvailable()) {
    return sessionStorage;
  }
  
  // 세션 스토리지를 사용할 수 없는 경우 메모리 스토리지 반환
  return new MemoryStorage() as unknown as Storage;
};
