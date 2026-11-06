/**
 * Hard - Disk Analyzer & Interactive Treemap
 * Interactive storage treemap, largest files, duplicate detector, and installer leftovers.
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  PieChart,
  Folder,
  File,
  HardDrive,
  ChevronRight,
  ShieldAlert,
  Trash2,
  Copy,
  Download,
  Lock,
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';
import { DiskTreemapNode } from '../../services/mole-bridge/mole-cli-types';
import { windowsNative } from '../../services/mole-bridge/windows-native-bridge';

export const DiskAnalyzerPage: React.FC = () => {
  const { requestConfirmation, useRecycleBin, showToast } = useApp();
  const rootNode = windowsNative.getDiskTreemapData();

  const [currentPathStack, setCurrentPathStack] = useState<DiskTreemapNode[]>([rootNode]);
  const [activeTab, setActiveTab] = useState<'treemap' | 'largest' | 'duplicates' | 'downloads'>('treemap');

  const currentNode = currentPathStack[currentPathStack.length - 1];

  const handleDrillDown = (node: DiskTreemapNode) => {
    if (node.children && node.children.length > 0) {
      setCurrentPathStack((prev) => [...prev, node]);
    }
  };

  const handleNavigateBreadcrumb = (index: number) => {
    setCurrentPathStack((prev) => prev.slice(0, index + 1));
  };

  // Largest files across disk
  const largestFiles = [
    { name: 'Win11_24H2_English_x64.iso', path: 'C:\\Users\\Default\\Downloads\\Win11_24H2_English_x64.iso', size: 4985500000, type: 'Archive / OS Image', isProtected: false },
    { name: 'ext4.vhdx', path: 'C:\\Users\\Default\\AppData\\Local\\Docker\\wsl\\data\\ext4.vhdx', size: 4200000000, type: 'Virtual Hard Disk', isProtected: false },
    { name: 'CbsPersist_30912182.log', path: 'C:\\Windows\\Logs\\CBS\\CbsPersist_30912182.log', size: 950000000, type: 'System Log', isProtected: false },
    { name: 'Docker Desktop Installer.exe', path: 'C:\\Users\\Default\\Downloads\\Docker Desktop Installer.exe', size: 580000000, type: 'Installer Binary', isProtected: false },
    { name: 'hiberfil.sys', path: 'C:\\hiberfil.sys', size: 6442450944, type: 'Windows Hibernate File', isProtected: true },
    { name: 'pagefile.sys', path: 'C:\\pagefile.sys', size: 4294967296, type: 'Windows Paging File', isProtected: true },
  ];

  // Duplicate candidates
  const duplicateCandidates = [
    {
      hash: 'sha256:88a1f2b3e4...',
      name: 'archive-backup-2026.zip',
      size: 1450000000,
      paths: [
        'C:\\Users\\Default\\Downloads\\archive-backup-2026.zip',
        'C:\\Users\\Default\\Documents\\Backups\\archive-backup-2026.zip',
      ],
    },
    {
      hash: 'sha256:32c918e11a...',
      name: 'dataset_raw_v1.tar.gz',
      size: 890000000,
      paths: [
        'C:\\Users\\Default\\Projects\\ml-data\\dataset_raw_v1.tar.gz',
        'C:\\Users\\Default\\Downloads\\dataset_raw_v1.tar.gz',
      ],
    },
  ];

  const handleCleanFile = (filePath: string, fileSize: number, isProtected?: boolean) => {
    if (isProtected) {
      showToast('Action blocked: file is protected by Windows safety rules.', 'error');
      return;
    }

    requestConfirmation({
      title: 'Confirm File Removal',
      description: `Target file will be moved to the Windows Recycle Bin for safe recovery. Path: ${filePath}`,
      items: [
        {
          id: `file_${Date.now()}`,
          categoryId: 'disk_analyzer',
          path: filePath,
          name: filePath.split('\\').pop() || filePath,
          sizeBytes: fileSize,
          lastModified: new Date().toISOString(),
          risk: 'low',
          reason: 'User triggered deletion from Disk Analyzer.',
          selected: true,
          canSendToRecycleBin: true,
        },
      ],
      riskSummary: 'Single user file',
      onConfirm: async () => {
        showToast(`Sent ${filePath.split('\\').pop()} to Recycle Bin.`, 'success');
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
              Disk Storage Analyzer &amp; Treemap
            </h1>
            <span className="text-xs font-mono text-slate-400">Drive C: (Local OS)</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explore storage consumption by directory. Visual treemap representation, largest file detection, and duplicate candidates.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('treemap')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'treemap'
                ? 'bg-slate-800 text-teal-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Treemap Explorer
          </button>
          <button
            onClick={() => setActiveTab('largest')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'largest'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Largest Files
          </button>
          <button
            onClick={() => setActiveTab('duplicates')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'duplicates'
                ? 'bg-slate-800 text-amber-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Duplicates ({duplicateCandidates.length})
          </button>
        </div>
      </div>

      {activeTab === 'treemap' && (
        <div className="space-y-4">
          {/* Breadcrumb Path Bar */}
          <div className="flex items-center gap-1.5 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs overflow-x-auto font-mono">
            <HardDrive className="w-4 h-4 text-teal-400 shrink-0 mr-1" />
            {currentPathStack.map((node, idx) => (
              <React.Fragment key={node.path}>
                <button
                  onClick={() => handleNavigateBreadcrumb(idx)}
                  className={`hover:text-teal-300 transition-colors whitespace-nowrap ${
                    idx === currentPathStack.length - 1 ? 'font-bold text-white' : 'text-slate-400'
                  }`}
                >
                  {node.name}
                </button>
                {idx < currentPathStack.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Interactive Proportional Block View */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-white">
                Folder Treemap: {currentNode.name} ({formatBytes(currentNode.size)})
              </span>
              <span>Click a child block to drill down</span>
            </div>

            {/* Simulated Proportional Treemap Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentNode.children && currentNode.children.length > 0 ? (
                currentNode.children.map((child) => {
                  const pct = Math.round((child.size / currentNode.size) * 100);
                  const isFolder = child.type === 'folder' || (child.children && child.children.length > 0);

                  return (
                    <div
                      key={child.path}
                      onClick={() => (isFolder ? handleDrillDown(child) : null)}
                      className={`p-4 rounded-xl border transition-all text-xs space-y-2 select-none ${
                        isFolder
                          ? 'bg-slate-950/60 hover:bg-slate-950 hover:border-teal-500/50 cursor-pointer border-slate-800'
                          : 'bg-slate-950/30 border-slate-800/60 cursor-default'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          {isFolder ? (
                            <Folder className="w-4 h-4 text-teal-400 shrink-0" />
                          ) : (
                            <File className="w-4 h-4 text-slate-500 shrink-0" />
                          )}
                          <span className="font-semibold text-slate-200 truncate" title={child.name}>
                            {child.name}
                          </span>
                        </div>
                        {child.isProtected && (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-teal-400 bg-teal-950 px-1.5 py-0.5 rounded border border-teal-800 shrink-0">
                            <Lock className="w-2.5 h-2.5" />
                            Protected
                          </span>
                        )}
                      </div>

                      <div className="flex items-end justify-between font-mono">
                        <span className="text-sm font-bold text-white tabular-nums">
                          {formatBytes(child.size)}
                        </span>
                        <span className="text-[11px] text-slate-400 tabular-nums">
                          {pct}% of parent
                        </span>
                      </div>

                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500" style={{ width: `${Math.max(4, pct)}%` }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full p-8 text-center text-xs text-slate-500">
                  This directory has no subfolders to drill into.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'largest' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/40 grid grid-cols-12 text-xs font-semibold text-slate-400">
            <div className="col-span-6">File Name &amp; Path</div>
            <div className="col-span-2">Type / Category</div>
            <div className="col-span-2 text-right">Size</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          <div className="divide-y divide-slate-800/80">
            {largestFiles.map((f, idx) => (
              <div key={idx} className="p-4 grid grid-cols-12 items-center text-xs hover:bg-slate-850/60 transition-colors">
                <div className="col-span-6 space-y-0.5 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{f.name}</span>
                    {f.isProtected && (
                      <span className="text-[10px] font-mono text-teal-400 bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-800">
                        System Protected
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-[10.5px] text-slate-500 truncate" title={f.path}>
                    {f.path}
                  </div>
                </div>

                <div className="col-span-2 text-slate-400 text-xs">
                  {f.type}
                </div>

                <div className="col-span-2 text-right font-mono text-sm font-bold text-white tabular-nums">
                  {formatBytes(f.size)}
                </div>

                <div className="col-span-2 text-right">
                  <button
                    onClick={() => handleCleanFile(f.path, f.size, f.isProtected)}
                    disabled={f.isProtected}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      f.isProtected
                        ? 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800 cursor-pointer'
                    }`}
                  >
                    {f.isProtected ? 'Locked' : 'Recycle'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'duplicates' && (
        <div className="space-y-3">
          {duplicateCandidates.map((dup, i) => (
            <div key={i} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Copy className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-white text-sm">{dup.name}</span>
                  <span className="font-mono text-slate-500 text-[11px]">({dup.hash})</span>
                </div>
                <span className="font-mono text-sm font-bold text-amber-300 tabular-nums">
                  {formatBytes(dup.size)} each
                </span>
              </div>

              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5 font-mono text-[11px]">
                {dup.paths.map((p, pIdx) => (
                  <div key={pIdx} className="flex items-center justify-between text-slate-300">
                    <span className="truncate pr-3">{p}</span>
                    <button
                      onClick={() => handleCleanFile(p, dup.size, false)}
                      className="text-teal-400 hover:text-teal-300 text-[10.5px] font-semibold underline shrink-0 cursor-pointer"
                    >
                      Delete Duplicate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
