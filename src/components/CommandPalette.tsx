/**
 * Hard - Global Command Palette (Ctrl+K)
 * Fast navigation and executable quick actions
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp, ActivePage } from '../context/AppContext';
import {
  Search,
  LayoutDashboard,
  Sparkles,
  Layers,
  Zap,
  PieChart,
  Wrench,
  Activity,
  ScrollText,
  Settings,
  Shield,
  RotateCcw,
  Terminal,
} from 'lucide-react';

interface PaletteItem {
  id: string;
  title: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setActivePage,
    safeMode,
    setSafeMode,
    refreshMoleStatus,
    showToast,
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items: PaletteItem[] = [
    {
      id: 'nav_dashboard',
      title: 'Go to Dashboard',
      category: 'Navigation',
      icon: LayoutDashboard,
      action: () => {
        setActivePage('dashboard');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav_clean',
      title: 'Smart Clean & Dry Run Review',
      category: 'Actions',
      icon: Sparkles,
      action: () => {
        setActivePage('clean');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav_apps',
      title: 'Manage Applications & Residual Leftovers',
      category: 'Navigation',
      icon: Layers,
      action: () => {
        setActivePage('apps');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav_startup',
      title: 'Startup Apps & Background Tasks Manager',
      category: 'Navigation',
      icon: Zap,
      action: () => {
        setActivePage('startup');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav_disk',
      title: 'Explore Disk Treemap & Large Files',
      category: 'Navigation',
      icon: PieChart,
      action: () => {
        setActivePage('disk');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav_maintenance',
      title: 'Run Safe Windows Maintenance Actions',
      category: 'Navigation',
      icon: Wrench,
      action: () => {
        setActivePage('maintenance');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav_monitor',
      title: 'Live Hardware & Performance Monitor',
      category: 'Navigation',
      icon: Activity,
      action: () => {
        setActivePage('monitor');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'act_toggle_safemode',
      title: safeMode ? 'Disable Safe Mode (Caution)' : 'Enable Safe Mode (Recommended)',
      category: 'Security',
      icon: Shield,
      action: () => {
        setSafeMode(!safeMode);
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'act_probe_mole',
      title: 'Probe Mole CLI Bridge Status',
      category: 'CLI Diagnostics',
      icon: Terminal,
      action: async () => {
        await refreshMoleStatus();
        showToast('Mole CLI status refreshed', 'info');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav_activity_log',
      title: 'View Local Activity Log & Export CSV',
      category: 'Audit',
      icon: ScrollText,
      action: () => {
        setActivePage('activity_log');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav_settings',
      title: 'Open Settings & Legal Notices',
      category: 'Navigation',
      icon: Settings,
      action: () => {
        setActivePage('settings');
        setIsCommandPaletteOpen(false);
      },
    },
  ];

  const filtered = items.filter(
    (i) =>
      i.title.toLowerCase().includes(query.toLowerCase()) ||
      i.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      setIsCommandPaletteOpen(false);
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-100"
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center px-4 py-3 border-b border-slate-800 bg-slate-950/50">
          <Search className="w-4 h-4 text-teal-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or module name..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        <div className="max-h-72 overflow-y-auto p-1.5 space-y-0.5">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No matching actions or commands found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSel = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                    isSel
                      ? 'bg-teal-500/10 text-teal-300 font-medium border border-teal-500/20'
                      : 'text-slate-300 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-3.5 h-3.5 ${isSel ? 'text-teal-400' : 'text-slate-500'}`} />
                    <span>{item.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
