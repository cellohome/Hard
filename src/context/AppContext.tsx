/**
 * Hard - Global Application State & Provider
 * Powered by Zustand stores and React Context for seamless state management.
 * Includes page switching, toast notification queue management,
 * and safe-mode architecture initialization.
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { create } from 'zustand';
import {
  SystemMetrics,
  CleanCategory,
  CleanItem,
  InstalledApplication,
  StartupItem,
  SystemMaintenanceAction,
  AuditLogEntry,
  MoleCliStatus,
} from '../../services/mole-bridge/mole-cli-types';
import { windowsNative } from '../../services/mole-bridge/windows-native-bridge';
import { moleClient } from '../../services/mole-bridge/mole-bridge-client';
import { auditLogger } from '../../services/mole-bridge/audit-logger';
import { defaultSafetyEngine } from '../../services/mole-bridge/safety-engine';
import { SupportedLanguage, translations } from '../localization';

export type ActivePage =
  | 'dashboard'
  | 'clean'
  | 'apps'
  | 'startup'
  | 'disk'
  | 'maintenance'
  | 'monitor'
  | 'settings'
  | 'activity_log';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  timestamp: number;
}

export interface ConfirmationConfig {
  isOpen: boolean;
  title: string;
  description: string;
  items: CleanItem[];
  riskSummary: string;
  onConfirm: () => Promise<void>;
}

// ==========================================
// 1. Navigation Zustand Store
// ==========================================
interface NavigationState {
  activePage: ActivePage;
  pageHistory: ActivePage[];
  setActivePage: (page: ActivePage) => void;
  goBack: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activePage: 'dashboard',
  pageHistory: ['dashboard'],
  setActivePage: (page) =>
    set((state) => {
      if (state.activePage === page) return state;
      return {
        activePage: page,
        pageHistory: [...state.pageHistory.slice(-15), page],
      };
    }),
  goBack: () =>
    set((state) => {
      if (state.pageHistory.length <= 1) return state;
      const newHistory = state.pageHistory.slice(0, -1);
      const prevPage = newHistory[newHistory.length - 1];
      return {
        activePage: prevPage,
        pageHistory: newHistory,
      };
    }),
}));

// ==========================================
// 2. Toast Notification Queue Zustand Store
// ==========================================
interface ToastState {
  toasts: ToastItem[];
  toast: ToastItem | null; // Topmost active toast for immediate display
  addToast: (message: string, type?: ToastType, duration?: number) => string;
  showToast: (message: string, type?: ToastType, duration?: number) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  toast: null,
  addToast: (message, type = 'info', duration = 4000) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastItem = {
      id,
      message,
      type,
      duration,
      timestamp: Date.now(),
    };

    set((state) => {
      const updated = [...state.toasts.slice(-4), newToast]; // Keep at most 5 concurrent toasts
      return {
        toasts: updated,
        toast: newToast,
      };
    });

    if (duration > 0) {
      setTimeout(() => {
        get().dismissToast(id);
      }, duration);
    }

    return id;
  },
  showToast: (message, type = 'info', duration = 4000) => {
    return get().addToast(message, type, duration);
  },
  dismissToast: (id) =>
    set((state) => {
      const remaining = state.toasts.filter((t) => t.id !== id);
      return {
        toasts: remaining,
        toast: remaining.length > 0 ? remaining[remaining.length - 1] : null,
      };
    }),
  clearToasts: () => set({ toasts: [], toast: null }),
}));

// ==========================================
// 3. Settings & Safe Mode Architecture Zustand Store
// ==========================================
interface SettingsState {
  safeMode: boolean;
  isAdmin: boolean;
  useRecycleBin: boolean;
  language: SupportedLanguage;
  theme: 'dark' | 'light';
  isCommandPaletteOpen: boolean;
  isSafetyOnboardingOpen: boolean;
  initialized: boolean;

  setSafeMode: (enabled: boolean) => void;
  setIsAdmin: (admin: boolean) => void;
  setUseRecycleBin: (val: boolean) => void;
  setLanguage: (lang: SupportedLanguage) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setIsCommandPaletteOpen: (open: boolean) => void;
  setIsSafetyOnboardingOpen: (open: boolean) => void;
  initializeSafeModeArchitecture: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  safeMode: true,
  isAdmin: false,
  useRecycleBin: true,
  language: 'en',
  theme: 'dark',
  isCommandPaletteOpen: false,
  isSafetyOnboardingOpen: false,
  initialized: false,

  setSafeMode: (enabled) => {
    set({ safeMode: enabled });
    defaultSafetyEngine.setSafeMode(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hard_safe_mode', String(enabled));
    }
    useToastStore.getState().showToast(
      enabled
        ? 'Safe Mode active: Windows system paths, user documents, and credentials protected.'
        : 'Safe Mode disabled. Caution advised during cleanup operations.',
      enabled ? 'info' : 'warning'
    );
  },

  setIsAdmin: (admin) => {
    set({ isAdmin: admin });
    useToastStore.getState().showToast(
      admin ? 'Elevated to Administrator privileges.' : 'Switched to Standard User mode.',
      'info'
    );
  },

  setUseRecycleBin: (val) => {
    set({ useRecycleBin: val });
    if (typeof window !== 'undefined') {
      localStorage.setItem('hard_recycle_bin', String(val));
    }
  },

  setLanguage: (lang) => {
    set({ language: lang });
    if (typeof window !== 'undefined') {
      localStorage.setItem('hard_language', lang);
    }
  },

  setTheme: (t) => {
    set({ theme: t });
    if (typeof window !== 'undefined') {
      localStorage.setItem('hard_theme', t);
      const root = document.documentElement;
      if (t === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  },

  setIsCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  setIsSafetyOnboardingOpen: (open) => set({ isSafetyOnboardingOpen: open }),

  initializeSafeModeArchitecture: () => {
    if (get().initialized) return;

    if (typeof window !== 'undefined') {
      // 1. Safe Mode preference
      const savedSafeMode = localStorage.getItem('hard_safe_mode');
      const isSafeModeActive = savedSafeMode !== null ? savedSafeMode === 'true' : true;
      defaultSafetyEngine.setSafeMode(isSafeModeActive);

      // 2. Recycle Bin preference
      const savedRecycle = localStorage.getItem('hard_recycle_bin');
      const isRecycleActive = savedRecycle !== null ? savedRecycle === 'true' : true;

      // 3. Language preference
      const savedLang = localStorage.getItem('hard_language') as SupportedLanguage;
      const lang = savedLang === 'pt-BR' ? 'pt-BR' : 'en';

      // 4. Theme preference
      const savedTheme = localStorage.getItem('hard_theme') as 'dark' | 'light';
      const currentTheme = savedTheme === 'light' ? 'light' : 'dark';
      const root = document.documentElement;
      if (currentTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      // 5. Check onboarding
      const onboarded = localStorage.getItem('hard_onboarded_v1');
      const showOnboarding = !onboarded;

      set({
        safeMode: isSafeModeActive,
        useRecycleBin: isRecycleActive,
        language: lang,
        theme: currentTheme,
        isSafetyOnboardingOpen: showOnboarding,
        initialized: true,
      });
    }
  },
}));

// ==========================================
// 4. Unified App Context Type for Components
// ==========================================
export interface AppContextType {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  pageHistory: ActivePage[];
  goBack: () => void;

  systemMetrics: SystemMetrics;
  cleanCategories: CleanCategory[];
  setCleanCategories: React.Dispatch<React.SetStateAction<CleanCategory[]>>;
  installedApps: InstalledApplication[];
  startupItems: StartupItem[];
  maintenanceActions: SystemMaintenanceAction[];
  auditLogs: AuditLogEntry[];
  moleStatus: MoleCliStatus;
  refreshMoleStatus: () => Promise<void>;

  safeMode: boolean;
  setSafeMode: (enabled: boolean) => void;
  isAdmin: boolean;
  setIsAdmin: (admin: boolean) => void;
  useRecycleBin: boolean;
  setUseRecycleBin: (val: boolean) => void;

  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: typeof translations['en'];

  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;

  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;

  isSafetyOnboardingOpen: boolean;
  setIsSafetyOnboardingOpen: (open: boolean) => void;

  confirmationModal: ConfirmationConfig | null;
  requestConfirmation: (config: Omit<ConfirmationConfig, 'isOpen'>) => void;
  closeConfirmation: () => void;

  refreshCleanData: () => Promise<void>;
  refreshAppsData: () => Promise<void>;
  refreshStartupData: () => Promise<void>;
  refreshAuditLogs: () => void;

  // Toast Queue
  toasts: ToastItem[];
  toast: ToastItem | null;
  showToast: (message: string, type?: ToastType, duration?: number) => string;
  addToast: (message: string, type?: ToastType, duration?: number) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ==========================================
// 5. AppProvider Component
// ==========================================
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation store
  const activePage = useNavigationStore((s) => s.activePage);
  const setActivePage = useNavigationStore((s) => s.setActivePage);
  const pageHistory = useNavigationStore((s) => s.pageHistory);
  const goBack = useNavigationStore((s) => s.goBack);

  // Toast store
  const toasts = useToastStore((s) => s.toasts);
  const toast = useToastStore((s) => s.toast);
  const showToast = useToastStore((s) => s.showToast);
  const addToast = useToastStore((s) => s.addToast);
  const dismissToast = useToastStore((s) => s.dismissToast);
  const clearToasts = useToastStore((s) => s.clearToasts);

  // Settings store
  const safeMode = useSettingsStore((s) => s.safeMode);
  const setSafeMode = useSettingsStore((s) => s.setSafeMode);
  const isAdmin = useSettingsStore((s) => s.isAdmin);
  const setIsAdmin = useSettingsStore((s) => s.setIsAdmin);
  const useRecycleBin = useSettingsStore((s) => s.useRecycleBin);
  const setUseRecycleBin = useSettingsStore((s) => s.setUseRecycleBin);
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const isCommandPaletteOpen = useSettingsStore((s) => s.isCommandPaletteOpen);
  const setIsCommandPaletteOpen = useSettingsStore((s) => s.setIsCommandPaletteOpen);
  const isSafetyOnboardingOpen = useSettingsStore((s) => s.isSafetyOnboardingOpen);
  const setIsSafetyOnboardingOpen = useSettingsStore((s) => s.setIsSafetyOnboardingOpen);
  const initializeSafeModeArchitecture = useSettingsStore((s) => s.initializeSafeModeArchitecture);

  // Local state for live system telemetry & datasets
  const [systemMetrics, setSystemMetrics] = React.useState<SystemMetrics>(windowsNative.getSystemMetrics());
  const [cleanCategories, setCleanCategories] = React.useState<CleanCategory[]>([]);
  const [installedApps, setInstalledApps] = React.useState<InstalledApplication[]>([]);
  const [startupItems, setStartupItems] = React.useState<StartupItem[]>([]);
  const [maintenanceActions] = React.useState<SystemMaintenanceAction[]>(windowsNative.getMaintenanceActions());
  const [auditLogs, setAuditLogs] = React.useState<AuditLogEntry[]>(auditLogger.getEntries());
  const [confirmationModal, setConfirmationModal] = React.useState<ConfirmationConfig | null>(null);

  const [moleStatus, setMoleStatus] = React.useState<MoleCliStatus>({
    isInstalled: true,
    version: '1.14.2',
    path: 'mo.cmd',
    detectionSource: 'path',
    error: null,
    lastChecked: new Date().toISOString(),
  });

  // Initialize Safe Mode Architecture and preferences on mount
  useEffect(() => {
    initializeSafeModeArchitecture();
  }, [initializeSafeModeArchitecture]);

  // Global Keyboard listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!useSettingsStore.getState().isCommandPaletteOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsCommandPaletteOpen]);

  // Poll system performance metrics every 1.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(windowsNative.getSystemMetrics());
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Data fetching routines
  const refreshCleanData = async () => {
    const cats = await windowsNative.getCleanCategories();
    setCleanCategories(cats);
  };

  const refreshAppsData = async () => {
    const apps = await windowsNative.getInstalledApps();
    setInstalledApps(apps);
  };

  const refreshStartupData = async () => {
    const items = await windowsNative.getStartupItems();
    setStartupItems(items);
  };

  const refreshAuditLogs = () => {
    setAuditLogs(auditLogger.getEntries());
  };

  const refreshMoleStatus = async () => {
    const status = await moleClient.detectCli();
    setMoleStatus(status);
  };

  useEffect(() => {
    refreshCleanData();
    refreshAppsData();
    refreshStartupData();
    refreshMoleStatus();
  }, []);

  const requestConfirmation = (config: Omit<ConfirmationConfig, 'isOpen'>) => {
    setConfirmationModal({
      ...config,
      isOpen: true,
    });
  };

  const closeConfirmation = () => {
    setConfirmationModal(null);
  };

  const t = translations[language] || translations.en;

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        pageHistory,
        goBack,

        systemMetrics,
        cleanCategories,
        setCleanCategories,
        installedApps,
        startupItems,
        maintenanceActions,
        auditLogs,
        moleStatus,
        refreshMoleStatus,

        safeMode,
        setSafeMode,
        isAdmin,
        setIsAdmin,
        useRecycleBin,
        setUseRecycleBin,

        language,
        setLanguage,
        t,

        theme,
        setTheme,

        isCommandPaletteOpen,
        setIsCommandPaletteOpen,

        isSafetyOnboardingOpen,
        setIsSafetyOnboardingOpen,

        confirmationModal,
        requestConfirmation,
        closeConfirmation,

        refreshCleanData,
        refreshAppsData,
        refreshStartupData,
        refreshAuditLogs,

        toasts,
        toast,
        showToast,
        addToast,
        dismissToast,
        clearToasts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
