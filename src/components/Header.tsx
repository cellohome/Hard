/**
 * Hard - Top Header Navigation Component
 * Adheres strictly to the 3-Zone Top Bar Contract
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  ShieldAlert,
  Search,
  Sun,
  Moon,
  Terminal,
  HelpCircle,
  Lock,
  Unlock,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    t,
    theme,
    setTheme,
    safeMode,
    setSafeMode,
    isAdmin,
    setIsAdmin,
    moleStatus,
    setIsCommandPaletteOpen,
    setIsSafetyOnboardingOpen,
    setActivePage,
  } = useApp();

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-5 flex items-center justify-between gap-6 shrink-0 select-none z-30">
      {/* Zone 1: Brand Wordmark (Single element) */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-700/80 flex items-center justify-center p-1 shadow-sm">
          <svg viewBox="0 0 256 256" className="w-full h-full" fill="none">
            <rect x="54" y="48" width="44" height="150" rx="10" fill="#2dd4bf" />
            <rect x="158" y="48" width="44" height="150" rx="10" fill="#2dd4bf" />
            <rect x="98" y="108" width="60" height="30" fill="#5eead4" />
          </svg>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold tracking-tight text-white font-sans">
            Hard
          </span>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            v1.0.0
          </span>
        </div>
      </div>

      {/* Zone 2: Contextual Status Affordances & Quick Search */}
      <div className="flex items-center gap-3 max-w-xl w-full justify-center">
        {/* Ctrl+K Search Trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center justify-between gap-3 px-3 py-1.5 w-72 text-xs bg-slate-950/60 hover:bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-md transition-colors shadow-inner"
          title="Global Search & Quick Actions (Ctrl+K)"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span className="truncate">{t.searchPlaceholder}</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700 shrink-0">
            Ctrl+K
          </kbd>
        </button>

        {/* Safe Mode Indicator Toggle */}
        <button
          onClick={() => setSafeMode(!safeMode)}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-all ${
            safeMode
              ? 'bg-teal-950/40 text-teal-300 border-teal-800/60 hover:bg-teal-900/40'
              : 'bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-900/40'
          }`}
          title={safeMode ? 'Safe Mode enforces protected paths and Recycle Bin' : 'Safe Mode is disabled'}
        >
          {safeMode ? (
            <Shield className="w-3.5 h-3.5 text-teal-400" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="hidden sm:inline font-medium">
            {safeMode ? t.safeModeActive : t.safeModeOff}
          </span>
        </button>

        {/* Administrator Elevation Toggle */}
        <button
          onClick={() => setIsAdmin(!isAdmin)}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-all ${
            isAdmin
              ? 'bg-indigo-950/40 text-indigo-300 border-indigo-800/60'
              : 'bg-slate-800/40 text-slate-400 border-slate-700/60'
          }`}
          title="Click to simulate standard user or administrator elevation"
        >
          {isAdmin ? (
            <Unlock className="w-3.5 h-3.5 text-indigo-400" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span className="hidden md:inline font-mono">
            {isAdmin ? t.adminElevation : t.userElevation}
          </span>
        </button>

        {/* Mole CLI Bridge Status */}
        <button
          onClick={() => setActivePage('settings')}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-all ${
            moleStatus.isInstalled
              ? 'bg-slate-950 text-slate-300 border-slate-800 hover:border-teal-700'
              : 'bg-rose-950/40 text-rose-300 border-rose-800'
          }`}
          title={moleStatus.isInstalled ? `Mole CLI Connected (${moleStatus.version})` : 'Mole CLI not connected'}
        >
          <Terminal className={`w-3.5 h-3.5 ${moleStatus.isInstalled ? 'text-teal-400' : 'text-rose-400'}`} />
          <span className="hidden lg:inline font-mono">
            mo {moleStatus.isInstalled ? 'connected' : 'offline'}
          </span>
        </button>
      </div>

      {/* Zone 3: Quick Utilities */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Onboarding Help Guide */}
        <button
          onClick={() => setIsSafetyOnboardingOpen(true)}
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors"
          title="Safety Philosophy & Onboarding Guide"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Theme Switch */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-300" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-300" />
          )}
        </button>
      </div>
    </header>
  );
};
