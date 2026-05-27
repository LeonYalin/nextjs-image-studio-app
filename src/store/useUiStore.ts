import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type TabType = 'photos' | 'albums';

interface UiState {
  activeTab: TabType,
  setActiveTab: (tab: TabType) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const UiStore = create<UiState>()(
  persist(
    immer(
      (set) => ({
        activeTab: 'photos',
        setActiveTab: (tab) => set({ activeTab: tab }),
        isSidebarOpen: true,
        toggleSidebar: () => set((state) => {
          state.isSidebarOpen = !state.isSidebarOpen;
        })
      })
    ),
    {
      name: 'ui-storage',
      partialize: (state) => ({ activeTab: state.activeTab }),
    }
  )
);
