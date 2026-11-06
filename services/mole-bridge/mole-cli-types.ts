/**
 * Hard - System & Mole CLI Bridge Types
 * SPDX-License-Identifier: Apache-2.0
 */

export type RiskLevel = 'safe' | 'low' | 'moderate' | 'high' | 'critical';

export interface CleanCategory {
  id: string;
  name: string;
  description: string;
  source: string;
  defaultSelected: boolean;
  risk: RiskLevel;
  items: CleanItem[];
  totalBytes: number;
}

export interface CleanItem {
  id: string;
  categoryId: string;
  path: string;
  name: string;
  sizeBytes: number;
  lastModified: string;
  risk: RiskLevel;
  reason: string;
  selected: boolean;
  isProtected?: boolean;
  canSendToRecycleBin: boolean;
  sourceApp?: string;
  fileCount?: number;
}

export interface DryRunSummary {
  scannedCategoriesCount: number;
  scannedFilesCount: number;
  totalReclaimableBytes: number;
  selectedBytes: number;
  selectedCount: number;
  protectedSkippedCount: number;
  protectedSkippedBytes: number;
  riskDistribution: Record<RiskLevel, number>;
  moleCliUsed: boolean;
  scanDurationMs: number;
}

export interface MoleCliStatus {
  isInstalled: boolean;
  version: string | null;
  path: string | null;
  detectionSource: 'path' | 'localappdata' | 'custom' | 'not_found';
  error: string | null;
  lastChecked: string;
}

export interface MoleExecutionResult {
  command: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  executionTimeMs: number;
  wasCancelled: boolean;
  dryRun: boolean;
}

export interface InstalledApplication {
  id: string;
  name: string;
  publisher: string;
  version: string;
  installDate: string;
  estimatedSizeBytes: number;
  installLocation?: string;
  uninstallCommand: string;
  isSystemComponent: boolean;
  wingetId?: string;
  updateAvailable?: {
    latestVersion: string;
    source: string;
    releaseUrl?: string;
  };
  leftovers?: ApplicationLeftover[];
}

export interface ApplicationLeftover {
  id: string;
  path: string;
  type: 'cache' | 'logs' | 'registry_key' | 'temp' | 'preferences' | 'scheduled_task';
  sizeBytes: number;
  risk: RiskLevel;
  description: string;
  selected: boolean;
}

export interface StartupItem {
  id: string;
  name: string;
  publisher: string;
  command: string;
  location: 'Registry:CurrentUser' | 'Registry:LocalMachine' | 'Folder:Startup' | 'TaskScheduler';
  impact: 'High' | 'Medium' | 'Low' | 'None';
  enabled: boolean;
  isCriticalSystem: boolean;
  recommendation: 'Safe to disable' | 'Keep enabled' | 'User choice' | 'Critical system item';
}

export interface SystemMaintenanceAction {
  id: string;
  title: string;
  description: string;
  category: 'Network' | 'Graphics & Cache' | 'Windows System' | 'Storage';
  requiresAdmin: boolean;
  expectedBenefit: string;
  potentialImpact: string;
  rollbackBehavior: string;
  safetyRating: 'Safe' | 'Moderate';
  lastRun?: string;
}

export interface SystemMetrics {
  cpuUsagePercent: number;
  cpuModel: string;
  cpuCores: number;
  cpuFreqGhz: number;
  
  memoryUsedBytes: number;
  memoryTotalBytes: number;
  memoryCachedBytes: number;
  
  disks: Array<{
    mount: string;
    label: string;
    totalBytes: number;
    usedBytes: number;
    freeBytes: number;
    fileSystem: string;
    isSystemDrive: boolean;
  }>;

  gpu?: {
    name: string;
    utilizationPercent: number;
    vramUsedBytes: number;
    vramTotalBytes: number;
    temperatureC?: number;
  };

  network: {
    downloadBytesPerSec: number;
    uploadBytesPerSec: number;
    activeInterface: string;
  };

  diskIo: {
    readBytesPerSec: number;
    writeBytesPerSec: number;
  };

  topProcesses: Array<{
    pid: number;
    name: string;
    cpuPercent: number;
    memoryBytes: number;
    diskIoBytesPerSec: number;
    user: string;
    isSystem: boolean;
    path: string;
  }>;

  battery?: {
    percent: number;
    isCharging: boolean;
    powerState: string;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  module: 'clean' | 'apps' | 'startup' | 'disk' | 'maintenance' | 'cli';
  targetPaths: string[];
  reclaimedBytes: number;
  itemsAffectedCount: number;
  result: 'success' | 'partial' | 'failed' | 'cancelled';
  usedRecycleBin: boolean;
  dryRunOnly: boolean;
  userConfirmed: boolean;
  notes?: string;
}

export interface DiskTreemapNode {
  name: string;
  path: string;
  size: number;
  type: 'folder' | 'file';
  category?: 'Apps' | 'Media' | 'Documents' | 'Archives' | 'Development' | 'Temporary' | 'System';
  isProtected?: boolean;
  children?: DiskTreemapNode[];
}
