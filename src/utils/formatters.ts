/**
 * Formatting and Helper Utilities
 * SPDX-License-Identifier: Apache-2.0
 */

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const safeI = Math.min(i, sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, safeI)).toFixed(dm))} ${sizes[safeI]}`;
}

export function formatTransferRate(bytesPerSec: number): string {
  if (bytesPerSec < 1024) return `${bytesPerSec} B/s`;
  if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
  return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
}

export function getRiskBadgeClasses(risk: 'safe' | 'low' | 'moderate' | 'high' | 'critical'): {
  textClass: string;
  dotClass: string;
} {
  switch (risk) {
    case 'safe':
      return { textClass: 'text-emerald-500 dark:text-emerald-400 font-medium', dotClass: 'bg-emerald-500' };
    case 'low':
      return { textClass: 'text-teal-600 dark:text-teal-400 font-medium', dotClass: 'bg-teal-500' };
    case 'moderate':
      return { textClass: 'text-amber-600 dark:text-amber-400 font-medium', dotClass: 'bg-amber-500' };
    case 'high':
      return { textClass: 'text-orange-600 dark:text-orange-400 font-medium', dotClass: 'bg-orange-500' };
    case 'critical':
      return { textClass: 'text-rose-600 dark:text-rose-400 font-medium', dotClass: 'bg-rose-500' };
  }
}
