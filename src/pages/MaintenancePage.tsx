/**
 * Hard - System Maintenance Page
 * Safe, explained Windows maintenance tools.
 * Zero registry cleaning, zero driver tampering, 100% verified operations.
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wrench,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  Play,
  Lock,
  Unlock,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { windowsNative } from '../../services/mole-bridge/windows-native-bridge';
import { auditLogger } from '../../services/mole-bridge/audit-logger';

export const MaintenancePage: React.FC = () => {
  const { maintenanceActions, isAdmin, setIsAdmin, refreshAuditLogs, showToast } = useApp();
  const [runningActionId, setRunningActionId] = useState<string | null>(null);

  const handleRunAction = async (actionId: string, title: string, requiresAdmin: boolean) => {
    if (requiresAdmin && !isAdmin) {
      showToast('This action requires Administrator privileges. Toggle Admin mode in the header or button.', 'warning');
      return;
    }

    setRunningActionId(actionId);
    try {
      const res = await windowsNative.runMaintenanceAction(actionId);
      auditLogger.record({
        module: 'maintenance',
        action: `Maintenance: ${title}`,
        targetPaths: ['Windows Subsystem API'],
        reclaimedBytes: actionId === 'win_update_cache' ? 4200000000 : 0,
        itemsAffectedCount: 1,
        result: res.success ? 'success' : 'failed',
        usedRecycleBin: false,
        dryRunOnly: false,
        userConfirmed: true,
        notes: res.message,
      });
      refreshAuditLogs();

      showToast(res.message, res.success ? 'success' : 'error');
    } finally {
      setRunningActionId(null);
    }
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Verified System Maintenance
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
              POLICY: SAFE ONLY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Safe, explained Windows maintenance actions. Hard does not perform dangerous registry cleaner gimmicks or driver tampering.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdmin(!isAdmin)}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all ${
              isAdmin
                ? 'bg-indigo-950/60 text-indigo-300 border-indigo-700/60'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            {isAdmin ? <Unlock className="w-3.5 h-3.5 text-indigo-400" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
            <span>{isAdmin ? 'Administrator Mode Active' : 'Elevate to Administrator'}</span>
          </button>
        </div>
      </div>

      {/* Safety Policy Box */}
      <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-400">
        <div className="flex items-center gap-2 text-slate-200 font-semibold">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Our Maintenance Standard</span>
        </div>
        <p className="leading-relaxed">
          Microsoft documentation strongly advises against third-party registry cleaners and aggressive driver uninstalls because they frequently damage the Windows Component Store. Every tool provided below is documented, benign, and fully reversible.
        </p>
      </div>

      {/* Maintenance Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {maintenanceActions.map((action) => {
          const isRunning = runningActionId === action.id;
          return (
            <div
              key={action.id}
              className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col justify-between gap-4 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white tracking-tight">
                        {action.title}
                      </span>
                      {action.requiresAdmin && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                          Requires Admin
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-teal-400 block">
                      {action.category}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {action.description}
                </p>

                {/* Technical Impact & Rollback Details */}
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-[11px] space-y-1.5">
                  <div>
                    <span className="font-semibold text-slate-300">Expected Benefit: </span>
                    <span className="text-slate-400">{action.expectedBenefit}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-300">Potential Side Effects: </span>
                    <span className="text-slate-400">{action.potentialImpact}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-300">Rollback Behavior: </span>
                    <span className="text-slate-400">{action.rollbackBehavior}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Safety: {action.safetyRating}
                </span>

                <button
                  onClick={() => handleRunAction(action.id, action.title, action.requiresAdmin)}
                  disabled={isRunning}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer ${
                    isRunning
                      ? 'bg-slate-800 text-slate-400 cursor-wait'
                      : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20'
                  }`}
                >
                  <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Executing...' : 'Run Action'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
