/**
 * Hard - Activity Log & Audit Trail Page
 * Transparent, local, exportable ledger of all clean, startup, and maintenance actions.
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ScrollText,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileText,
  Search,
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';
import { auditLogger } from '../../services/mole-bridge/audit-logger';

export const ActivityLogPage: React.FC = () => {
  const { auditLogs, refreshAuditLogs, showToast } = useApp();
  const [filterModule, setFilterModule] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredLogs = auditLogs.filter((entry) => {
    if (filterModule !== 'all' && entry.module !== filterModule) return false;
    if (search && !entry.action.toLowerCase().includes(search.toLowerCase()) && !entry.targetPaths.some((p) => p.toLowerCase().includes(search.toLowerCase()))) {
      return false;
    }
    return true;
  });

  const handleExportJson = () => {
    const jsonStr = auditLogger.exportToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hard-audit-log-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported audit ledger to JSON.', 'success');
  };

  const handleExportCsv = () => {
    const csvStr = auditLogger.exportToCsv();
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hard-audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported audit ledger to CSV.', 'success');
  };

  const handleClearLogs = () => {
    auditLogger.clearLogs();
    refreshAuditLogs();
    showToast('Audit log history cleared.', 'info');
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Local Activity Log &amp; Audit Trail
            </h1>
            <span className="text-xs font-mono text-slate-400">
              {auditLogs.length} audit records
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete local record of all optimization operations, affected directories, reclaimed storage, and user authorizations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handleClearLogs}
            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors border border-transparent hover:border-rose-900"
            title="Clear local audit log"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs w-full sm:w-auto">
          {['all', 'clean', 'apps', 'startup', 'maintenance', 'cli'].map((m) => (
            <button
              key={m}
              onClick={() => setFilterModule(m)}
              className={`px-3 py-1 rounded capitalize transition-colors ${
                filterModule === m ? 'bg-slate-800 text-teal-300 font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search targets or notes..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Audit Log Entries List */}
      <div className="space-y-2.5">
        {filteredLogs.length === 0 ? (
          <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-xl text-center text-xs text-slate-500">
            No activity records matching your current filter.
          </div>
        ) : (
          filteredLogs.map((entry) => (
            <div
              key={entry.id}
              className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 text-xs hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">
                    {entry.action}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                    {entry.module}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      entry.result === 'success'
                        ? 'bg-teal-950 text-teal-300 border-teal-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}
                  >
                    {entry.result.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                  <span>{new Date(entry.timestamp).toLocaleString()}</span>
                </div>
              </div>

              {/* Target Paths & Notes */}
              <div className="space-y-1 text-[11.5px] text-slate-300">
                {entry.notes && (
                  <p className="text-slate-400">
                    {entry.notes}
                  </p>
                )}

                {entry.targetPaths.length > 0 && (
                  <div className="p-2 bg-slate-950 rounded border border-slate-800/80 font-mono text-[10.5px] text-slate-400 max-h-24 overflow-y-auto space-y-0.5">
                    {entry.targetPaths.map((p, idx) => (
                      <div key={idx} className="truncate">
                        → {p}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Badges strip */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <div className="flex items-center gap-3">
                  {entry.reclaimedBytes > 0 && (
                    <span className="text-teal-400 font-bold">
                      Reclaimed: {formatBytes(entry.reclaimedBytes)}
                    </span>
                  )}
                  {entry.usedRecycleBin && (
                    <span className="text-slate-300 flex items-center gap-1">
                      <RotateCcw className="w-3 h-3 text-teal-400" />
                      Recycle Bin
                    </span>
                  )}
                  {entry.dryRunOnly && (
                    <span className="text-amber-400">
                      [Dry Run Simulation]
                    </span>
                  )}
                </div>

                <span>
                  Authorized by User: {entry.userConfirmed ? 'YES' : 'NO'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
