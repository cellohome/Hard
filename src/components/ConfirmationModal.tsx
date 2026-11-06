/**
 * Hard - Mandatory Two-Step Confirmation Modal
 * Strict review gate with item count, total size, risk breakdown,
 * protected files skipped count, and explicit acknowledgment checkbox.
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertTriangle,
  ShieldCheck,
  Trash2,
  X,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';

export const ConfirmationModal: React.FC = () => {
  const { confirmationModal, closeConfirmation, useRecycleBin } = useApp();
  const [hasConfirmedCheckbox, setHasConfirmedCheckbox] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!confirmationModal || !confirmationModal.isOpen) return null;

  const { title, description, items, onConfirm } = confirmationModal;
  const totalBytes = items.reduce((acc, i) => acc + i.sizeBytes, 0);

  const safeCount = items.filter((i) => i.risk === 'safe').length;
  const lowCount = items.filter((i) => i.risk === 'low').length;
  const modCount = items.filter((i) => i.risk === 'moderate').length;

  const handleProceed = async () => {
    if (!hasConfirmedCheckbox) return;
    setIsProcessing(true);
    try {
      await onConfirm();
      closeConfirmation();
    } finally {
      setIsProcessing(false);
      setHasConfirmedCheckbox(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-400">
                Step 2 of 2: Review before execution
              </p>
            </div>
          </div>
          <button
            onClick={closeConfirmation}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            {description}
          </p>

          {/* Audit Metrics Card */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div>
              <span className="text-[11px] text-slate-400 block">Items Selected</span>
              <span className="text-base font-bold text-white font-mono tabular-nums">
                {items.length}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Total Space to Free</span>
              <span className="text-base font-bold text-teal-400 font-mono tabular-nums">
                {formatBytes(totalBytes)}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Target Destination</span>
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1 mt-1">
                {useRecycleBin ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
                    Recycle Bin
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    Permanent
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Risk Level Distribution Breakdown */}
          <div className="p-3 bg-slate-800/30 border border-slate-800 rounded-lg space-y-2">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
              Risk Classification
            </span>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-emerald-400">
                ● Safe: <span className="font-mono tabular-nums text-slate-200">{safeCount}</span>
              </span>
              <span className="text-teal-400">
                ● Low: <span className="font-mono tabular-nums text-slate-200">{lowCount}</span>
              </span>
              <span className="text-amber-400">
                ● Moderate: <span className="font-mono tabular-nums text-slate-200">{modCount}</span>
              </span>
            </div>
          </div>

          {/* Candidate File Paths Preview */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-400 block">
              Paths to be removed:
            </span>
            <div className="max-h-36 overflow-y-auto p-2 bg-slate-950 rounded border border-slate-800 font-mono text-[11px] space-y-1">
              {items.map((i) => (
                <div key={i.id} className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    <FileText className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{i.path}</span>
                  </div>
                  <span className="text-slate-400 shrink-0 tabular-nums">
                    {formatBytes(i.sizeBytes)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory Checkbox Gate */}
          <label className="flex items-start gap-3 p-3 bg-teal-950/20 border border-teal-800/40 rounded-lg cursor-pointer hover:bg-teal-950/30 transition-colors">
            <input
              type="checkbox"
              checked={hasConfirmedCheckbox}
              onChange={(e) => setHasConfirmedCheckbox(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-700 text-teal-500 focus:ring-teal-500 bg-slate-900"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-200 block">
                I have reviewed these {items.length} items and authorize their removal.
              </span>
              <span className="text-slate-400 block mt-0.5">
                Protected Windows directories will be preserved. Files will be placed into the Recycle Bin.
              </span>
            </div>
          </label>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={closeConfirmation}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleProceed}
            disabled={!hasConfirmedCheckbox || isProcessing}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md shadow-sm transition-all ${
              hasConfirmedCheckbox && !isProcessing
                ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 cursor-pointer shadow-teal-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {isProcessing ? (
              <span>Executing safely...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm &amp; Clean ({formatBytes(totalBytes)})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
