/**
 * UI Store
 * Manages UI state including theme, sidebar, and panel visibility
 */

import { create } from 'zustand';
import { StorageService } from '@/lib/utils/storage';

/**
 * Theme type
 */
export type Theme = 'dark' | 'light' | 'system';

/**
 * UI store state interface
 */
interface UIStore {
  theme: Theme;
  sidebarCollapsed: boolean;
  rightPanelVisible: boolean;
  
  // Actions
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleRightPanel: () => void;
  setRightPanelVisible: (visible: boolean) => void;
}

/**
 * Load theme from StorageService
 */
const loadTheme = (): Theme => {
  // Prevent SSR hydration mismatch
  if (typeof window === 'undefined') {
    return 'dark';
  }
  const saved = StorageService.getPreference('theme');
  if (saved === 'dark' || saved === 'light' || saved === 'system') {
    return saved;
  }
  return 'dark'; // Default to dark theme
};

/**
 * Load sidebar collapsed state from StorageService
 */
const loadSidebarCollapsed = (): boolean => {
  // Prevent SSR hydration mismatch
  if (typeof window === 'undefined') {
    return false;
  }
  const saved = StorageService.getPreference('sidebarCollapsed');
  return saved === true;
};

/**
 * Load right panel visibility from StorageService
 */
const loadRightPanelVisible = (): boolean => {
  // Prevent SSR hydration mismatch
  if (typeof window === 'undefined') {
    return false;
  }
  const saved = StorageService.getPreference('rightPanelVisible');
  return saved === true;
};

/**
 * UI store using Zustand
 */
export const useUIStore = create<UIStore>((set) => ({
  theme: loadTheme(),
  sidebarCollapsed: loadSidebarCollapsed(),
  rightPanelVisible: loadRightPanelVisible(),

  /**
   * Set theme and persist using StorageService
   */
  setTheme: (theme: Theme) => {
    set({ theme });
    StorageService.updatePreference('theme', theme);
  },

  /**
   * Toggle sidebar collapsed state
   */
  toggleSidebar: () => {
    set((state) => {
      const collapsed = !state.sidebarCollapsed;
      StorageService.updatePreference('sidebarCollapsed', collapsed);
      return { sidebarCollapsed: collapsed };
    });
  },

  /**
   * Set sidebar collapsed state and persist using StorageService
   */
  setSidebarCollapsed: (collapsed: boolean) => {
    set({ sidebarCollapsed: collapsed });
    StorageService.updatePreference('sidebarCollapsed', collapsed);
  },

  /**
   * Toggle right panel visibility
   */
  toggleRightPanel: () => {
    set((state) => {
      const visible = !state.rightPanelVisible;
      StorageService.updatePreference('rightPanelVisible', visible);
      return { rightPanelVisible: visible };
    });
  },

  /**
   * Set right panel visibility and persist using StorageService
   */
  setRightPanelVisible: (visible: boolean) => {
    set({ rightPanelVisible: visible });
    StorageService.updatePreference('rightPanelVisible', visible);
  },
}));
