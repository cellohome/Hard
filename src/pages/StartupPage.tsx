/**
 * Hard - Startup & Background Tasks Manager
 * Safe management of startup programs, scheduled tasks, and background services.
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Zap,
  Shield,
  ShieldAlert,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { StartupItem } from '../../services/mole-bridge/mole-cli-types';
import { windowsNative } from '../../services/mole-bridge/windows-native-bridge';
import { auditLogger } from '../../services/mole-bridge/audit-logger';

export const StartupPage: React.FC = () => {
  const { startupItems, refreshStartupData, refreshAuditLogs, showToast } = useApp();
  const [filter, setFilter] = useState<'all' | 'high_impact' | 'safe_to_disable'>('all');
  const [actionHistory, setActionHistory] = useState<Array<{ id: string; name: string; wasEnabled: boolean; timestamp: string }>>([]);

  const filteredItems = startupItems.filter((item) => {
    if (filter === 'high_impact') return item.impact === 'High';
    if (filter === 'safe_to_disable') return item.recommendation === 'Safe to disable';
    return true;
  });

  const handleToggle = async (item: StartupItem) => {
    if (item.isCriticalSystem) {
      showToast(`Security safeguard: ${item.name} is a critical Windows system component and cannot be disabled.`, 'error');
      return;
    }

    const nextState = !item.enabled;
    try {
      await windowsNative.toggleStartupItem(item.id, nextState);
      await refreshStartupData();

      // Record in reversal history
      setActionHistory((prev) => [
        { id: item.id, name: item.name, wasEnabled: item.enabled, timestamp: new Date().toLocaleTimeString() },
        ...prev.slice(0, 9),
      ]);

      // Record in persistent audit log
      auditLogger.record({
        module: 'startup',
        action: `Startup Toggle: ${item.name} -> ${nextState ? 'Enabled' : 'Disabled'}`,
        targetPaths: [item.location, item.command],
        reclaimedBytes: 0,
        itemsAffectedCount: 1,
        result: 'success',
        usedRecycleBin: false,
        dryRunOnly: false,
        userConfirmed: true,
        notes: `User changed autostart state for ${item.name}.`,
      });
      refreshAuditLogs();

      showToast(`${item.name} autostart ${nextState ? 'enabled' : 'disabled'}.`, 'success');
    } catch (err: unknown) {
      showToast((err as Error).message || 'Failed to toggle startup item', 'error');
    }
  };

  const handleUndo = async (historyEntry: { id: string; name: string; wasEnabled: boolean }) => {
    try {
      await windowsNative.toggleStartupItem(historyEntry.id, historyEntry.wasEnabled);
      await refreshStartupData();
      setActionHistory((prev) => prev.filter((h) => h !== historyEntry));
      showToast(`Reversed: ${historyEntry.name} restored to ${historyEntry.wasEnabled ? 'Enabled' : 'Disabled'}.`, 'info');
    } catch (err: unknown) {
      showToast('Failed to revert change', 'error');
    }
  };

  const getImpactBadge = (impact: StartupItem['impact']) => {
    switch (impact) {
      case 'High':
        return 'text-rose-400 font-semibold';
      case 'Medium':
        return 'text-amber-400 font-medium';
      case 'Low':
        return 'text-teal-400 font-medium';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Startup Applications &amp; Background Services
            </h1>
            <span className="text-xs font-mono text-slate-400">
              {startupItems.length} registered entries
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Control which software boots with Windows. System-critical drivers and security services are permanently locked against accidental disabling.
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Items ({startupItems.length})
          </button>
          <button
            onClick={() => setFilter('safe_to_disable')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === 'safe_to_disable'
                ? 'bg-slate-800 text-teal-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Safe to Disable
          </button>
          <button
            onClick={() => setFilter('high_impact')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === 'high_impact'
                ? 'bg-slate-800 text-rose-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            High Impact
          </button>
        </div>
      </div>

      {/* Startup Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 grid grid-cols-12 text-xs font-semibold text-slate-400">
          <div className="col-span-5">Application &amp; Publisher</div>
          <div className="col-span-3">Startup Location</div>
          <div className="col-span-2">Boot Impact</div>
          <div className="col-span-2 text-right">Status / Action</div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 grid grid-cols-12 items-center text-xs transition-colors ${
                item.enabled ? 'hover:bg-slate-850/60' : 'bg-slate-950/30 opacity-75'
              }`}
            >
              <div className="col-span-5 space-y-1 pr-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">
                    {item.name}
                  </span>
                  {item.isCriticalSystem && (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-teal-400 bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-800">
                      <Lock className="w-2.5 h-2.5" />
                      Critical OS
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>{item.publisher}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-500 font-mono text-[10.5px] truncate max-w-[280px]" title={item.command}>
                    {item.command}
                  </span>
                </div>
              </div>

              <div className="col-span-3 text-[11px] font-mono text-slate-400">
                {item.location}
              </div>

              <div className="col-span-2 space-y-0.5">
                <div className={`font-mono text-xs ${getImpactBadge(item.impact)}`}>
                  {item.impact} Impact
                </div>
                <div className="text-[10px] text-slate-500">
                  {item.recommendation}
                </div>
              </div>

              <div className="col-span-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleToggle(item)}
                  disabled={item.isCriticalSystem}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all ${
                    item.isCriticalSystem
                      ? 'bg-slate-800/50 text-slate-500 border-slate-700/50 cursor-not-allowed'
                      : item.enabled
                      ? 'bg-teal-500/10 text-teal-300 border-teal-500/30 hover:bg-teal-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title={item.isCriticalSystem ? 'Critical system component' : 'Toggle startup state'}
                >
                  {item.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action History & Reversal Strip */}
      {actionHistory.length > 0 && (
        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>Recent Startup Modifications (Session Reversal)</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {actionHistory.map((h, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-slate-300"
              >
                <span>{h.name}</span>
                <span className="text-slate-500 font-mono text-[10px]">{h.timestamp}</span>
                <button
                  onClick={() => handleUndo(h)}
                  className="text-teal-400 hover:text-teal-300 font-medium text-[11px] flex items-center gap-1 hover:underline ml-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Undo
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
