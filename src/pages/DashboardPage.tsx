/**
 * Hard - Dashboard Page
 * System overview, hardware status, non-alarmist attention summary, and quick actions.
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import {
  HardDrive,
  Cpu,
  Zap,
  Sparkles,
  Layers,
  Wrench,
  PieChart,
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { formatBytes, formatTransferRate } from '../utils/formatters';

export const DashboardPage: React.FC = () => {
  const { systemMetrics, cleanCategories, setActivePage, t, safeMode, moleStatus } = useApp();

  const totalReclaimable = cleanCategories.reduce((acc, cat) => acc + cat.totalBytes, 0);
  const sysDisk = systemMetrics.disks.find((d) => d.isSystemDrive) || systemMetrics.disks[0];

  const diskUsedPct = sysDisk ? Math.round((sysDisk.usedBytes / sysDisk.totalBytes) * 100) : 0;
  const memUsedPct = Math.round((systemMetrics.memoryUsedBytes / systemMetrics.memoryTotalBytes) * 100);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Top Banner / System Health Overview */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider font-mono">
              System Assessment
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono">
              Windows 11 (24H2) x64
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            PC Status: Stable &amp; Nominal
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {t.systemHealthSummary}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActivePage('clean')}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm shadow-teal-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            <span>Analyze Reclaimable Space</span>
          </button>
        </div>
      </div>

      {/* Non-Alarmist Attention Summary */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-teal-400" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              {t.attentionItems}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            No destructive operations will ever occur without explicit user review.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Card 1 */}
          <div
            onClick={() => setActivePage('clean')}
            className="p-3 bg-slate-950/50 hover:bg-slate-950 border border-slate-800/80 rounded-lg cursor-pointer transition-colors space-y-1 group"
          >
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-medium">Stale Cache &amp; Temp Files</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 transition-colors" />
            </div>
            <div className="text-lg font-bold text-teal-400 font-mono tabular-nums">
              {formatBytes(totalReclaimable)}
            </div>
            <p className="text-[11px] text-slate-400">
              Safe candidates identified in browser caches and %TEMP%.
            </p>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => setActivePage('startup')}
            className="p-3 bg-slate-950/50 hover:bg-slate-950 border border-slate-800/80 rounded-lg cursor-pointer transition-colors space-y-1 group"
          >
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-medium">Startup Applications</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 transition-colors" />
            </div>
            <div className="text-lg font-bold text-slate-200 font-mono tabular-nums">
              4 items with impact
            </div>
            <p className="text-[11px] text-slate-400">
              Non-critical apps slowing boot time can be safely delayed.
            </p>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => setActivePage('apps')}
            className="p-3 bg-slate-950/50 hover:bg-slate-950 border border-slate-800/80 rounded-lg cursor-pointer transition-colors space-y-1 group"
          >
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-medium">Application Updates</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 transition-colors" />
            </div>
            <div className="text-lg font-bold text-slate-200 font-mono tabular-nums">
              2 updates pending
            </div>
            <p className="text-[11px] text-slate-400">
              Verified through official winget channels.
            </p>
          </div>
        </div>
      </div>

      {/* Hardware Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Drive Storage */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <HardDrive className="w-4 h-4 text-teal-400" />
              <span>{sysDisk?.mount} Drive (OS)</span>
            </span>
            <span className="font-mono tabular-nums">{diskUsedPct}% used</span>
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono tabular-nums">
              {formatBytes(sysDisk?.freeBytes || 0)} Free
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              of {formatBytes(sysDisk?.totalBytes || 0)} total
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                diskUsedPct > 85 ? 'bg-amber-500' : 'bg-teal-500'
              }`}
              style={{ width: `${diskUsedPct}%` }}
            />
          </div>
        </div>

        {/* Memory */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Cpu className="w-4 h-4 text-teal-400" />
              <span>Memory (RAM)</span>
            </span>
            <span className="font-mono tabular-nums">{memUsedPct}%</span>
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono tabular-nums">
              {formatBytes(systemMetrics.memoryUsedBytes, 1)}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              of {formatBytes(systemMetrics.memoryTotalBytes, 0)} total ({formatBytes(systemMetrics.memoryCachedBytes, 1)} cached)
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 transition-all duration-500"
              style={{ width: `${memUsedPct}%` }}
            />
          </div>
        </div>

        {/* CPU Utilization */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Activity className="w-4 h-4 text-teal-400" />
              <span>CPU Load</span>
            </span>
            <span className="font-mono tabular-nums text-teal-400">
              {systemMetrics.cpuUsagePercent}%
            </span>
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono tabular-nums">
              {systemMetrics.cpuFreqGhz} GHz
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5" title={systemMetrics.cpuModel}>
              {systemMetrics.cpuCores} Cores · {systemMetrics.cpuModel.split(' ')[0]}
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 transition-all duration-500"
              style={{ width: `${systemMetrics.cpuUsagePercent}%` }}
            />
          </div>
        </div>

        {/* Network Throughput */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <span>Network I/O</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400 truncate max-w-[100px]">
              {systemMetrics.network.activeInterface.split(' ')[0]}
            </span>
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono tabular-nums">
              ↓ {formatTransferRate(systemMetrics.network.downloadBytesPerSec)}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              ↑ {formatTransferRate(systemMetrics.network.uploadBytesPerSec)}
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500/80 w-1/3" />
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-white tracking-tight uppercase">
          Quick Modules
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Action 1 */}
          <button
            onClick={() => setActivePage('clean')}
            className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-all group flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-400 group-hover:bg-teal-500 group-hover:text-slate-950 transition-colors shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors">
                Smart Clean
              </h3>
              <p className="text-[11.5px] text-slate-400 leading-snug">
                Scan browser caches, user %TEMP%, and developer build artifacts with transparent dry run.
              </p>
            </div>
          </button>

          {/* Action 2 */}
          <button
            onClick={() => setActivePage('apps')}
            className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-all group flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-slate-950 transition-colors shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                Application Leftovers
              </h3>
              <p className="text-[11.5px] text-slate-400 leading-snug">
                Detect residual app data, uncleaned caches, and official winget updates.
              </p>
            </div>
          </button>

          {/* Action 3 */}
          <button
            onClick={() => setActivePage('startup')}
            className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-all group flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                Startup Manager
              </h3>
              <p className="text-[11.5px] text-slate-400 leading-snug">
                Review startup impact, background tasks, and safely disable non-essential launchers.
              </p>
            </div>
          </button>

          {/* Action 4 */}
          <button
            onClick={() => setActivePage('disk')}
            className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-all group flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors shrink-0">
              <PieChart className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                Disk Analyzer
              </h3>
              <p className="text-[11.5px] text-slate-400 leading-snug">
                Interactive treemap breakdown of space by directory and large archive detector.
              </p>
            </div>
          </button>

          {/* Action 5 */}
          <button
            onClick={() => setActivePage('maintenance')}
            className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-all group flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                System Maintenance
              </h3>
              <p className="text-[11.5px] text-slate-400 leading-snug">
                Flush DNS resolver, rebuild thumbnail cache, and manage Storage Sense safely.
              </p>
            </div>
          </button>

          {/* Action 6 */}
          <button
            onClick={() => setActivePage('monitor')}
            className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-all group flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 group-hover:bg-rose-500 group-hover:text-slate-950 transition-colors shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                Live Hardware Monitor
              </h3>
              <p className="text-[11.5px] text-slate-400 leading-snug">
                Real-time CPU cores, memory allocation, GPU sensor telemetry, and process inspection.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
