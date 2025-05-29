'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { defaultTheme } from '@/types/design';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface ThemeContextType {
  currentTheme: typeof defaultTheme;
  setTheme: (theme: typeof defaultTheme) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [currentTheme, setCurrentTheme] = useState(defaultTheme);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const themeDoc = await getDoc(doc(db, 'settings', 'theme'));
        if (themeDoc.exists()) {
          setCurrentTheme(themeDoc.data() as typeof defaultTheme);
        }
      } catch (error) {
        console.error('테마 정보를 불러오는 중 오류가 발생했습니다:', error);
      }
    };

    fetchTheme();
  }, []);

  const setTheme = async (theme: typeof defaultTheme) => {
    try {
      await setDoc(doc(db, 'settings', 'theme'), theme);
      setCurrentTheme(theme);
    } catch (error) {
      console.error('테마 저장 중 오류가 발생했습니다:', error);
      throw error;
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>{children}</ThemeContext.Provider>
  );
};

export default ThemeContext;
