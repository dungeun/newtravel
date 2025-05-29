import { create } from 'zustand';

interface UIState {
  // Sidebar state
  isSidebarOpen: boolean;
  
  // Modal states
  activeModal: string | null;
  modalData: Record<string, any> | null;
  
  // Search and filters
  searchQuery: string;
  activeFilters: Record<string, any>;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  
  openModal: (modalId: string, data?: Record<string, any> | null) => void;
  closeModal: () => void;
  
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Record<string, any>) => void;
  resetFilters: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Sidebar state
  isSidebarOpen: false,
  
  // Modal states
  activeModal: null,
  modalData: null,
  
  // Search and filters
  searchQuery: '',
  activeFilters: {},
  
  // Sidebar actions
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  
  // Modal actions
  openModal: (modalId, data = null) => set({ 
    activeModal: modalId,
    modalData: data
  }),
  closeModal: () => set({ 
    activeModal: null,
    modalData: null
  }),
  
  // Search and filter actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilters: (filters) => set((state) => ({ 
    activeFilters: { ...state.activeFilters, ...filters }
  })),
  resetFilters: () => set({ activeFilters: {} })
})); 