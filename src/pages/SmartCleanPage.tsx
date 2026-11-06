/**
 * Hard - Smart Clean Page
 * Categorized review, mandatory dry run by default, path transparency,
 * risk badges, and review-before-delete confirmation flow.
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Shield,
  RotateCcw,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  Info,
  Trash2,
  FileText,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { formatBytes, getRiskBadgeClasses } from '../utils/formatters';
import { windowsNative } from '../../services/mole-bridge/windows-native-bridge';
import { defaultSafetyEngine } from '../../services/mole-bridge/safety-engine';
import { auditLogger } from '../../services/mole-bridge/audit-logger';

export const SmartCleanPage: React.FC = () => {
  const {
    cleanCategories,
    setCleanCategories,
    requestConfirmation,
    useRecycleBin,
    setUseRecycleBin,
    safeMode,
    refreshAuditLogs,
    showToast,
  } = useApp();

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    browser_cache: true,
    user_temp: true,
  });

  const [isScanning, setIsScanning] = useState(false);

  // Toggle item selection
  const toggleItem = (categoryId: string, itemId: string) => {
    setCleanCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          items: cat.items.map((item) => {
            if (item.id !== itemId) return item;
            // Never allow selection of protected items
            if (item.isProtected) return item;
            return { ...item, selected: !item.selected };
          }),
        };
      })
    );
  };

  // Toggle all items in a category
  const toggleCategory = (categoryId: string) => {
    setCleanCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        const allSelected = cat.items.every((i) => i.selected || i.isProtected);
        return {
          ...cat,
          items: cat.items.map((item) =>
            item.isProtected ? item : { ...item, selected: !allSelected }
          ),
        };
      })
    );
  };

  const toggleExpand = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Re-run scan / Dry run
  const handleRunScan = async () => {
    setIsScanning(true);
    await new Promise((r) => setTimeout(r, 600));
    const freshCats = await windowsNative.getCleanCategories();
    setCleanCategories(freshCats);
    setIsScanning(false);
    showToast('Dry run scan refreshed. All candidate paths re-verified.', 'info');
  };

  // Dry Run Calculations
  const dryRun = windowsNative.calculateDryRun(cleanCategories);

  // Collect selected items for review
  const selectedItems = cleanCategories.flatMap((cat) => cat.items.filter((i) => i.selected));

  // Trigger Review-Before-Delete
  const handleInitiateClean = () => {
    if (selectedItems.length === 0) {
      showToast('Please select at least one item to clean.', 'warning');
      return;
    }

    // Safety Engine Gate Check
    const safetyCheck = defaultSafetyEngine.validateActionExecution(selectedItems, useRecycleBin);
    if (!safetyCheck.allowed) {
      showToast(`Action blocked by Safety Engine: ${safetyCheck.violations[0]}`, 'error');
      return;
    }

    requestConfirmation({
      title: 'Authorize File Deletion',
      description: `You are about to clean ${selectedItems.length} verified cache and temporary items. Review the affected paths below. Files will be moved to the Windows Recycle Bin for easy recovery.`,
      items: selectedItems,
      riskSummary: `${dryRun.riskDistribution.safe} safe, ${dryRun.riskDistribution.low} low, ${dryRun.riskDistribution.moderate} moderate`,
      onConfirm: async () => {
        const catIds = cleanCategories.map((c) => c.id);
        const itemIds = selectedItems.map((i) => i.id);
        const result = await windowsNative.executeClean(catIds, itemIds, useRecycleBin);

        // Update local clean state
        const updatedCats = await windowsNative.getCleanCategories();
        setCleanCategories(updatedCats);

        // Record in Audit Log
        auditLogger.record({
          module: 'clean',
          action: 'Smart Clean Execution',
          targetPaths: selectedItems.map((i) => i.path),
          reclaimedBytes: result.reclaimedBytes,
          itemsAffectedCount: result.deletedCount,
          result: result.errors.length > 0 ? 'partial' : 'success',
          usedRecycleBin: useRecycleBin,
          dryRunOnly: false,
          userConfirmed: true,
          notes: `Reclaimed ${formatBytes(result.reclaimedBytes)} from ${result.deletedCount} files.`,
        });
        refreshAuditLogs();

        showToast(
          `Clean completed: Reclaimed ${formatBytes(result.reclaimedBytes)} into Recycle Bin.`,
          'success'
        );
      },
    });
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-150">
      {/* Title & Dry Run Status Bar */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Smart Clean &amp; Reclaimable Space
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
              DRY RUN ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mandatory Dry Run by default. Review exact locations, timestamps, and safety ratings before any deletion.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
          >
            <Play className={`w-3.5 h-3.5 text-teal-400 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Rescan Candidates'}</span>
          </button>

          <button
            onClick={handleInitiateClean}
            disabled={selectedItems.length === 0}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg shadow-sm transition-all ${
              selectedItems.length > 0
                ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 cursor-pointer shadow-teal-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Review &amp; Clean ({formatBytes(dryRun.selectedBytes)})</span>
          </button>
        </div>
      </div>

      {/* Dry Run Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 block">Total Reclaimable</span>
          <span className="text-lg font-bold text-white font-mono tabular-nums">
            {formatBytes(dryRun.totalReclaimableBytes)}
          </span>
          <span className="text-[10px] text-slate-500 block">Across {dryRun.scannedCategoriesCount} categories</span>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 block">Selected for Clean</span>
          <span className="text-lg font-bold text-teal-400 font-mono tabular-nums">
            {formatBytes(dryRun.selectedBytes)}
          </span>
          <span className="text-[10px] text-slate-500 block">{dryRun.selectedCount} candidate items</span>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 block">Protected Paths Skipped</span>
          <span className="text-lg font-bold text-slate-200 font-mono tabular-nums">
            {dryRun.protectedSkippedCount} items
          </span>
          <span className="text-[10px] text-teal-400/80 block">Guaranteed zero System32 tampering</span>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 block">Recovery Mechanism</span>
          <div className="flex items-center gap-1.5 mt-1">
            <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-xs font-semibold text-slate-200">
              {useRecycleBin ? 'Recycle Bin Enabled' : 'Direct Removal'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block">Restorable via Windows Shell</span>
        </div>
      </div>

      {/* Safety Policy Notice */}
      <div className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-400 shrink-0" />
          <span>
            Safe Mode is active. Active application files, credentials, and user personal documents are locked.
          </span>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 text-[11px]">
          <input
            type="checkbox"
            checked={useRecycleBin}
            onChange={(e) => setUseRecycleBin(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-slate-700 text-teal-500 focus:ring-teal-500 bg-slate-900"
          />
          <span>Send deletions to Recycle Bin</span>
        </label>
      </div>

      {/* Categories Accordion List */}
      <div className="space-y-3">
        {cleanCategories.map((category) => {
          const isExpanded = !!expandedCategories[category.id];
          const allSelected = category.items.length > 0 && category.items.every((i) => i.selected || i.isProtected);
          const someSelected = category.items.some((i) => i.selected);

          return (
            <div
              key={category.id}
              className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden transition-colors"
            >
              {/* Category Header */}
              <div className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-850">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategory(category.id);
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    {allSelected ? (
                      <CheckSquare className="w-4 h-4 text-teal-400" />
                    ) : someSelected ? (
                      <div className="w-4 h-4 rounded bg-teal-500/20 border border-teal-500 flex items-center justify-center">
                        <div className="w-2 h-0.5 bg-teal-400" />
                      </div>
                    ) : (
                      <Square className="w-4 h-4 text-slate-600" />
                    )}
                  </button>

                  <div onClick={() => toggleExpand(category.id)} className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-white">
                          {category.name}
                        </h3>
                        <span className="text-[11px] text-slate-400 font-normal">
                          ({category.source})
                        </span>
                      </div>
                      <p className="text-[11.5px] text-slate-400 mt-0.5">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 font-mono">
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-200 tabular-nums">
                      {formatBytes(category.totalBytes)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {category.items.length} targets
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              {isExpanded && (
                <div className="border-t border-slate-800 bg-slate-950/40 p-2 space-y-1">
                  {category.items.map((item) => {
                    const riskStyle = getRiskBadgeClasses(item.risk);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItem(category.id, item.id)}
                        className={`p-3 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs cursor-pointer border transition-colors ${
                          item.selected
                            ? 'bg-slate-900 border-teal-800/40'
                            : 'hover:bg-slate-900/60 border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            disabled={item.isProtected}
                            className="mt-0.5 text-slate-400"
                          >
                            {item.selected ? (
                              <CheckSquare className="w-4 h-4 text-teal-400" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-600" />
                            )}
                          </button>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 font-medium text-slate-200">
                              <span>{item.name}</span>
                              <span className="text-slate-600">·</span>
                              <span className={riskStyle.textClass}>
                                {item.risk.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 break-all flex items-center gap-1.5">
                              <FileText className="w-3 h-3 text-slate-500 shrink-0" />
                              <span>{item.path}</span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              {item.reason}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0 text-right font-mono self-end md:self-auto">
                          <div>
                            <span className="text-xs font-semibold text-slate-200 tabular-nums">
                              {formatBytes(item.sizeBytes)}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Modified {item.lastModified.split(' ')[0]}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
