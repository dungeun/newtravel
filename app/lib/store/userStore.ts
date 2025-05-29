import { create } from 'zustand';
import { User } from 'firebase/auth';
import { persist, createJSONStorage } from 'zustand/middleware';

// Define the store state type
interface UserState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userPreferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setUserPreferences: (preferences: Partial<UserState['userPreferences']>) => void;
  logout: () => void;
}

// Create the store with persist middleware
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isLoading: true,
      isAuthenticated: false,
      userPreferences: {
        theme: 'light',
        notifications: true,
        language: 'ko',
      },
      
      // Actions
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false,
      }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setUserPreferences: (preferences) => set((state) => ({
        userPreferences: {
          ...state.userPreferences,
          ...preferences,
        },
      })),
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false,
      }),
    }),
    {
      name: 'user-storage', // unique name for localStorage
      storage: createJSONStorage(() => localStorage),
      // Only persist these fields
      partialize: (state) => ({
        userPreferences: state.userPreferences,
      }),
    }
  )
); 