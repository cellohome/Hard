/**
 * Hard - Settings, Mole CLI Diagnostics, and Legal Attribution Page
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Shield,
  Terminal,
  RotateCcw,
  Globe,
  Sun,
  Moon,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileCode,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { moleClient } from '../../services/mole-bridge/mole-bridge-client';
import { MoleExecutionResult } from '../../services/mole-bridge/mole-cli-types';
import { runUnitTests } from '../../tests/safety-engine.test';

export const SettingsPage: React.FC = () => {
  const {
    safeMode,
    setSafeMode,
    useRecycleBin,
    setUseRecycleBin,
    language,
    setLanguage,
    theme,
    setTheme,
    moleStatus,
    refreshMoleStatus,
    showToast,
  } = useApp();

  const [customPath, setCustomPath] = useState(moleStatus.path || '');
  const [testCmd, setTestCmd] = useState('status');
  const [isExecuting, setIsExecuting] = useState(false);
  const [cmdResult, setCmdResult] = useState<MoleExecutionResult | null>(null);
  const [testSuiteResults, setTestSuiteResults] = useState<{ passed: number; failed: number; results: Array<{ name: string; success: boolean }> } | null>(null);

  const handleSavePath = () => {
    moleClient.setCustomCliPath(customPath.trim() || null);
    refreshMoleStatus();
    showToast('Saved custom Mole CLI path configuration.', 'success');
  };

  const handleRunDiagnostic = async () => {
    setIsExecuting(true);
    try {
      const res = await moleClient.executeCommand(testCmd, [], true);
      setCmdResult(res);
      showToast(`Diagnostic command executed (Exit code: ${res.exitCode})`, res.exitCode === 0 ? 'success' : 'warning');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRunUnitTests = () => {
    const results = runUnitTests();
    setTestSuiteResults(results);
    showToast(`Test suite complete: ${results.passed} passed, ${results.failed} failed.`, results.failed === 0 ? 'success' : 'error');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Settings &amp; Diagnostics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure safety gates, Mole CLI process bridge, UI localization, and view legal compliance notices.
          </p>
        </div>
      </div>

      {/* Safety & Protection Rules */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <Shield className="w-4 h-4 text-teal-400" />
          <span>Safety Architecture &amp; Protection Gates</span>
        </div>

        <div className="space-y-3 text-xs">
          {/* Safe Mode Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div>
              <span className="font-semibold text-slate-200 block">Enforce Safe Mode</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Permanently locks Windows system directories, credentials (.env, .ssh, .git), and personal user folders.
              </p>
            </div>
            <button
              onClick={() => setSafeMode(!safeMode)}
              className={`px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                safeMode
                  ? 'bg-teal-500 text-slate-950 hover:bg-teal-400 shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {safeMode ? 'Active (Recommended)' : 'Disabled'}
            </button>
          </div>

          {/* Recycle Bin Policy */}
          <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div>
              <span className="font-semibold text-slate-200 block">Recycle Bin Staging by Default</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Directs all file deletions through the Windows Shell Recycle Bin, ensuring accidental deletions can be restored.
              </p>
            </div>
            <button
              onClick={() => setUseRecycleBin(!useRecycleBin)}
              className={`px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                useRecycleBin
                  ? 'bg-teal-500 text-slate-950 hover:bg-teal-400 shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {useRecycleBin ? 'Enabled' : 'Direct Permanent Delete'}
            </button>
          </div>
        </div>
      </div>

      {/* Mole CLI Bridge Integration */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Terminal className="w-4 h-4 text-teal-400" />
            <span>Mole CLI Engine Bridge</span>
          </div>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              moleStatus.isInstalled
                ? 'bg-teal-950 text-teal-300 border-teal-800'
                : 'bg-rose-950 text-rose-300 border-rose-800'
            }`}
          >
            {moleStatus.isInstalled ? `ONLINE (v${moleStatus.version})` : 'CLI NOT FOUND'}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Hard interfaces with the free and open-source Mole CLI (<code className="text-teal-300">mo</code>) through external process execution over stdin/stdout. Hard is an independent frontend and does not bundle or modify proprietary software.
        </p>

        {/* Installation Instructions if CLI not detected */}
        {!moleStatus.isInstalled && (
          <div className="p-3.5 bg-amber-950/20 border border-amber-800/40 rounded-lg space-y-2 text-xs text-amber-200">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>How to Install or Connect Mole CLI</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              To enable extended CLI diagnostics, install the open-source CLI globally via Node.js or download its binary release:
            </p>
            <code className="p-2 bg-slate-950 text-teal-300 rounded block font-mono text-[11px] border border-slate-800">
              npm install -g @tw93/mole
            </code>
          </div>
        )}

        {/* Path Configuration */}
        <div className="space-y-2 text-xs">
          <label className="font-semibold text-slate-300 block">
            Custom Mole Executable Path (Optional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customPath}
              onChange={(e) => setCustomPath(e.target.value)}
              placeholder="e.g. C:\Users\User\AppData\Roaming\npm\mo.cmd"
              className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-teal-500"
            />
            <button
              onClick={handleSavePath}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold text-xs border border-slate-700 transition-colors"
            >
              Save Path
            </button>
            <button
              onClick={() => refreshMoleStatus()}
              className="px-4 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 rounded-lg font-semibold text-xs border border-teal-500/30 transition-colors"
            >
              Probe
            </button>
          </div>
        </div>

        {/* Diagnostic Command Tester */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
          <span className="font-semibold text-slate-300 block">
            Test Subprocess Invocation (Diagnostic Terminal)
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-400">mo</span>
            <input
              type="text"
              value={testCmd}
              onChange={(e) => setTestCmd(e.target.value)}
              placeholder="status / clean / clean --dry-run"
              className="w-48 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-white font-mono text-xs focus:outline-none focus:border-teal-500"
            />
            <button
              onClick={handleRunDiagnostic}
              disabled={isExecuting}
              className="flex items-center gap-1.5 px-3 py-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded transition-colors"
            >
              <Play className="w-3 h-3" />
              <span>{isExecuting ? 'Running...' : 'Execute Test'}</span>
            </button>
          </div>

          {/* Diagnostic Output View */}
          {cmdResult && (
            <div className="mt-2 p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1">
              <div className="flex justify-between text-slate-500 text-[10px]">
                <span>Command: {cmdResult.command}</span>
                <span>Exit Code: {cmdResult.exitCode} · Time: {cmdResult.executionTimeMs}ms</span>
              </div>
              <pre className="text-teal-300 overflow-x-auto whitespace-pre-wrap">
                {cmdResult.stdout || cmdResult.stderr}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Internal Unit Test Suite Verification */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <FileCode className="w-4 h-4 text-teal-400" />
            <span>Built-in Safety Verification Suite</span>
          </div>
          <button
            onClick={handleRunUnitTests}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 font-semibold"
          >
            <Play className="w-3 h-3 text-teal-400" />
            <span>Run Safety Tests</span>
          </button>
        </div>
        <p className="text-slate-400 text-[11.5px]">
          Executes automated assertions against the SafetyEngine path protection rules, credential blockers, and dry-run math.
        </p>

        {testSuiteResults && (
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-emerald-400 font-bold">
                ✓ {testSuiteResults.passed} Passed
              </span>
              {testSuiteResults.failed > 0 && (
                <span className="text-rose-400 font-bold">
                  ✗ {testSuiteResults.failed} Failed
                </span>
              )}
            </div>
            <div className="space-y-1 font-mono text-[11px] text-slate-400 max-h-36 overflow-y-auto">
              {testSuiteResults.results.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={r.success ? 'text-emerald-400' : 'text-rose-400'}>
                    {r.success ? '✓' : '✗'}
                  </span>
                  <span>{r.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Localization and Appearance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Language Selection */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 text-xs">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Globe className="w-4 h-4 text-teal-400" />
            <span>User Interface Language</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Extensible localization dictionary architecture.
          </p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                setLanguage('en');
                showToast('Switched to English', 'info');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                language === 'en'
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              English (en-US)
            </button>
            <button
              onClick={() => {
                setLanguage('pt-BR');
                showToast('Alterado para Português (Brasil)', 'info');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                language === 'pt-BR'
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              Português (pt-BR)
            </button>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 text-xs">
          <div className="flex items-center gap-2 text-white font-semibold">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
            <span>Visual Theme</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Accessible contrast adhering to Windows 11 Fluent and WCAG AA guidelines.
          </p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setTheme('dark')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              Dark Theme (Default)
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                theme === 'light'
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              Light Theme
            </button>
          </div>
        </div>
      </div>

      {/* Legal Attribution & GPL-3.0 Disclaimer */}
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5 text-xs text-slate-400">
        <div className="flex items-center justify-between text-slate-200 font-semibold">
          <span>About Hard &amp; Legal Attribution</span>
          <span className="font-mono text-[11px] text-teal-400">Version 1.0.0</span>
        </div>
        <p className="leading-relaxed">
          Hard is an independent Windows desktop utility. Hard is <strong>not affiliated with, endorsed by, or sponsored by Mole or tw93</strong>.
        </p>
        <p className="leading-relaxed text-slate-500 text-[11px]">
          Mole CLI is free software distributed under the GNU General Public License v3.0 (GPL-3.0). Hard communicates with the CLI via external process execution and preserves all license notices in compliance with GPL-3.0.
        </p>
      </div>
    </div>
  );
};
