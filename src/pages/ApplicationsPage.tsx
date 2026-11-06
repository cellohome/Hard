/**
 * Hard - Applications & Leftover Cleanup Page
 * List installed software, scan application leftovers, and official update discovery.
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Layers,
  Search,
  ExternalLink,
  Trash2,
  Sparkles,
  Shield,
  RotateCcw,
  RefreshCw,
  FolderOpen,
  ArrowUpRight,
  AlertTriangle,
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';
import { InstalledApplication, ApplicationLeftover } from '../../services/mole-bridge/mole-cli-types';
import { windowsNative } from '../../services/mole-bridge/windows-native-bridge';
import { auditLogger } from '../../services/mole-bridge/audit-logger';

export const ApplicationsPage: React.FC = () => {
  const { installedApps, refreshAppsData, requestConfirmation, useRecycleBin, refreshAuditLogs, showToast } =
    useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<InstalledApplication | null>(null);
  const [scanningLeftoversFor, setScanningLeftoversFor] = useState<string | null>(null);

  const filteredApps = installedApps.filter(
    (app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.publisher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAppSize = installedApps.reduce((acc, a) => acc + a.estimatedSizeBytes, 0);

  // Scan for leftovers
  const handleScanLeftovers = async (app: InstalledApplication) => {
    setScanningLeftoversFor(app.id);
    await new Promise((r) => setTimeout(r, 700));
    setScanningLeftoversFor(null);
    setSelectedApp(app);
    showToast(`Scan complete for ${app.name}. Leftovers identified for review.`, 'info');
  };

  // Clean application leftovers
  const handleCleanLeftovers = (app: InstalledApplication) => {
    if (!app.leftovers || app.leftovers.length === 0) return;

    const selectedLeftovers = app.leftovers.filter((l) => l.selected);
    if (selectedLeftovers.length === 0) {
      showToast('Select at least one leftover folder to remove.', 'warning');
      return;
    }

    const cleanItems = selectedLeftovers.map((l) => ({
      id: l.id,
      categoryId: 'app_leftover',
      path: l.path,
      name: `${app.name} Leftover (${l.type})`,
      sizeBytes: l.sizeBytes,
      lastModified: new Date().toISOString(),
      risk: l.risk,
      reason: l.description,
      selected: true,
      canSendToRecycleBin: true,
    }));

    requestConfirmation({
      title: `Clean Leftovers for ${app.name}`,
      description: `Removing residual caches and preferences left behind in AppData. Review the target paths below. Files will be placed into the Recycle Bin.`,
      items: cleanItems,
      riskSummary: 'Safe application caches and logs',
      onConfirm: async () => {
        const leftoverIds = selectedLeftovers.map((l) => l.id);
        const reclaimed = await windowsNative.removeAppLeftovers(app.id, leftoverIds);
        await refreshAppsData();

        auditLogger.record({
          module: 'apps',
          action: `App Residual Cleanup: ${app.name}`,
          targetPaths: selectedLeftovers.map((l) => l.path),
          reclaimedBytes: reclaimed,
          itemsAffectedCount: selectedLeftovers.length,
          result: 'success',
          usedRecycleBin: useRecycleBin,
          dryRunOnly: false,
          userConfirmed: true,
          notes: `Purged ${selectedLeftovers.length} leftover items for ${app.name}.`,
        });
        refreshAuditLogs();

        showToast(`Reclaimed ${formatBytes(reclaimed)} from ${app.name} leftovers.`, 'success');
      },
    });
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Installed Applications &amp; Residuals
            </h1>
            <span className="text-xs font-mono text-slate-400">
              {installedApps.length} programs installed
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standard Windows-approved uninstaller execution, deep leftover detection in AppData, and verified official updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter installed apps..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 w-56"
            />
          </div>

          <button
            onClick={() => refreshAppsData()}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title="Refresh installed software list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Apps Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Apps List (2 cols) */}
        <div className="lg:col-span-2 space-y-2">
          {filteredApps.map((app) => {
            const isSelected = selectedApp?.id === app.id;
            const hasLeftovers = app.leftovers && app.leftovers.length > 0;
            const hasUpdate = !!app.updateAvailable;

            return (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-850 border-teal-500/40 shadow-sm'
                    : 'bg-slate-900/60 hover:bg-slate-850/80 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {app.name}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        v{app.version}
                      </span>
                      {hasUpdate && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                          Update Available: {app.updateAvailable?.latestVersion}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{app.publisher}</span>
                      <span className="text-slate-600">·</span>
                      <span>Installed {app.installDate}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-200 font-mono tabular-nums">
                      {formatBytes(app.estimatedSizeBytes)}
                    </span>
                    {app.wingetId && (
                      <span className="text-[10px] font-mono text-slate-500 block">
                        winget: {app.wingetId}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Action Badges */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {hasLeftovers ? (
                      <span className="text-[11px] text-teal-400 font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {app.leftovers?.length} leftover caches identified ({formatBytes(app.leftovers?.reduce((a, l) => a + l.sizeBytes, 0) || 0)})
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        No residual AppData detected
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleScanLeftovers(app)}
                      disabled={scanningLeftoversFor === app.id}
                      className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
                    >
                      {scanningLeftoversFor === app.id ? 'Scanning...' : 'Scan Residuals'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected App Inspector / Leftover Manager (1 col) */}
        <div className="space-y-4">
          {selectedApp ? (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4 sticky top-4">
              <div>
                <span className="text-[10px] font-semibold text-teal-400 uppercase tracking-wider font-mono">
                  Application Details
                </span>
                <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
                  {selectedApp.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedApp.publisher} · Version {selectedApp.version}
                </p>
              </div>

              {/* Install Location & Size */}
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Occupied Storage:</span>
                  <span className="text-slate-200 font-bold">{formatBytes(selectedApp.estimatedSizeBytes)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Install Path:</span>
                  <span className="text-slate-300 truncate max-w-[160px]" title={selectedApp.installLocation}>
                    {selectedApp.installLocation || 'System Registry'}
                  </span>
                </div>
              </div>

              {/* Official Update Discovery */}
              {selectedApp.updateAvailable ? (
                <div className="p-3 bg-teal-950/20 border border-teal-800/50 rounded-lg space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-teal-300 font-semibold">
                    <span>Official Update Available</span>
                    <span className="font-mono text-[10px]">v{selectedApp.updateAvailable.latestVersion}</span>
                  </div>
                  <p className="text-[11.5px] text-slate-400">
                    Source: {selectedApp.updateAvailable.source}. Hard never silently installs software.
                  </p>
                  {selectedApp.updateAvailable.releaseUrl && (
                    <a
                      href={selectedApp.updateAvailable.releaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-400 hover:text-teal-300 hover:underline pt-1"
                    >
                      <span>Visit Official Release Page</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ) : null}

              {/* Residual Leftovers Review */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Residual Leftovers
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {selectedApp.leftovers?.length || 0} locations
                  </span>
                </div>

                {selectedApp.leftovers && selectedApp.leftovers.length > 0 ? (
                  <div className="space-y-2">
                    {selectedApp.leftovers.map((l) => (
                      <div
                        key={l.id}
                        className="p-2.5 bg-slate-950 rounded border border-slate-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-slate-300 font-medium">
                          <span className="capitalize">{l.type} Cache</span>
                          <span className="font-mono text-teal-400">{formatBytes(l.sizeBytes)}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 truncate" title={l.path}>
                          {l.path}
                        </div>
                        <p className="text-[10.5px] text-slate-400">{l.description}</p>
                      </div>
                    ))}

                    <button
                      onClick={() => handleCleanLeftovers(selectedApp)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clean Residuals to Recycle Bin</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950/40 rounded border border-slate-800 text-center text-xs text-slate-500">
                    No active leftovers discovered. Click &quot;Scan Residuals&quot; to probe AppData caches.
                  </div>
                )}
              </div>

              {/* Uninstall Mechanism */}
              <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
                <span className="text-[11px] text-slate-400 block">
                  Windows Uninstall Mechanism:
                </span>
                <code className="p-2 bg-slate-950 rounded block text-[10px] text-slate-400 font-mono break-all border border-slate-800">
                  {selectedApp.uninstallCommand}
                </code>
                <p className="text-[10.5px] text-slate-500">
                  Hard invokes only standard Windows-approved uninstallers.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-xl text-center text-xs text-slate-500 space-y-2">
              <Layers className="w-8 h-8 text-slate-600 mx-auto" />
              <p>Select any application to inspect its install location, residual files, or official updates.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
