/**
 * Hard - First-Run Safety Onboarding Modal
 * Explains permissions, review-before-delete guarantee, Recycle Bin, and GPL-3.0 attribution
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  RotateCcw,
  Eye,
  Terminal,
  CheckCircle,
  FileText,
  Lock,
} from 'lucide-react';

export const SafetyOnboardingModal: React.FC = () => {
  const { isSafetyOnboardingOpen, setIsSafetyOnboardingOpen } = useApp();

  if (!isSafetyOnboardingOpen) return null;

  const handleDismiss = () => {
    localStorage.setItem('hard_onboarded_v1', 'true');
    setIsSafetyOnboardingOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center p-2">
            <ShieldCheck className="w-8 h-8 text-teal-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Welcome to Hard
            </h2>
            <p className="text-xs text-teal-300">
              Clean, optimize, and understand your Windows PC safely.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[68vh] text-xs leading-relaxed text-slate-300">
          <p className="text-slate-200 text-sm">
            Hard is an independent Windows 10/11 desktop utility built around a strict
            <span className="text-teal-400 font-semibold"> Review-Before-Delete</span> and
            <span className="text-teal-400 font-semibold"> Least-Privilege</span> philosophy.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {/* Tenet 1 */}
            <div className="p-3.5 bg-slate-950/50 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Eye className="w-4 h-4 text-teal-400" />
                <span>Mandatory Dry Run</span>
              </div>
              <p className="text-slate-400 text-[11.5px]">
                Hard always scans and presents exact itemized file paths and sizes first. Nothing is removed without your explicit review and confirmation checkbox.
              </p>
            </div>

            {/* Tenet 2 */}
            <div className="p-3.5 bg-slate-950/50 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-white font-semibold">
                <RotateCcw className="w-4 h-4 text-teal-400" />
                <span>Recycle Bin Staging</span>
              </div>
              <p className="text-slate-400 text-[11.5px]">
                By default, deleted cache and temp files are routed directly to the Windows Recycle Bin so you can restore any item instantly.
              </p>
            </div>

            {/* Tenet 3 */}
            <div className="p-3.5 bg-slate-950/50 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Lock className="w-4 h-4 text-teal-400" />
                <span>Protected System Paths</span>
              </div>
              <p className="text-slate-400 text-[11.5px]">
                System32, WinSxS, boot files, .git repositories, SSH keys, and user documents are permanently protected by our built-in Safety Engine.
              </p>
            </div>

            {/* Tenet 4 */}
            <div className="p-3.5 bg-slate-950/50 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Terminal className="w-4 h-4 text-teal-400" />
                <span>Mole CLI &amp; GPL-3.0</span>
              </div>
              <p className="text-slate-400 text-[11.5px]">
                Hard integrates with the open-source Mole CLI (<code className="text-teal-300">mo</code>) via typed external process execution. Hard is an independent frontend and not affiliated with Mole/tw93.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-slate-400 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-200 font-medium">
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span>Full Audit Trail &amp; Transparency</span>
            </div>
            <p>
              Every action taken by Hard is recorded locally in your Activity Log with timestamps, target paths, and confirmation status, exportable to JSON and CSV.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            You can reopen this guide anytime from the top bar (?)
          </span>
          <button
            onClick={handleDismiss}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20 transition-all cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>I Understand, Let&apos;s Start</span>
          </button>
        </div>
      </div>
    </div>
  );
};
