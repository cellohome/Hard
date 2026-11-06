/**
 * Hard - Sidebar Navigation
 * Windows 11 style high-density navigation panel
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp, ActivePage } from '../context/AppContext';
import {
  LayoutDashboard,
  Sparkles,
  Layers,
  Zap,
  PieChart,
  Wrench,
  Activity,
  ScrollText,
  Settings,
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';

interface NavItem {
  id: ActivePage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeTone?: 'teal' | 'slate';
}

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage, t, cleanCategories } = useApp();

  const totalReclaimable = cleanCategories.reduce((acc, cat) => acc + cat.totalBytes, 0);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
    {
      id: 'clean',
      label: t.navClean,
      icon: Sparkles,
      badge: totalReclaimable > 0 ? formatBytes(totalReclaimable, 1) : undefined,
      badgeTone: 'teal',
    },
    { id: 'apps', label: t.navApps, icon: Layers },
    { id: 'startup', label: t.navStartup, icon: Zap },
    { id: 'disk', label: t.navDisk, icon: PieChart },
    { id: 'maintenance', label: t.navMaintenance, icon: Wrench },
    { id: 'monitor', label: t.navMonitor, icon: Activity },
    { id: 'activity_log', label: t.navActivityLog, icon: ScrollText },
    { id: 'settings', label: t.navSettings, icon: Settings },
  ];

  return (
    <aside className="w-60 border-r border-slate-800 bg-slate-900/60 backdrop-blur-md flex flex-col justify-between p-3 shrink-0 select-none">
      <nav className="space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          System Overview
        </div>
        {navItems.slice(0, 7).map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                isActive
                  ? 'bg-teal-500/10 text-teal-300 font-semibold border border-teal-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-950/60 text-teal-300 border border-teal-800/50">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-3 px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Governance & Logs
        </div>
        {navItems.slice(7).map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                isActive
                  ? 'bg-teal-500/10 text-teal-300 font-semibold border border-teal-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-teal-400' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Safety Policy Compact Footnote */}
      <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between text-slate-300 font-medium">
          <span>Safety Policy</span>
          <span className="text-teal-400 font-mono text-[10px]">VERIFIED</span>
        </div>
        <p className="leading-tight text-slate-400 text-[10.5px]">
          Mandatory Dry Run. Deletions routed to Recycle Bin.
        </p>
      </div>
    </aside>
  );
};
