/**
 * Hard Safety Engine
 * Enforces strict path protection, zero-unverified-deletion rules,
 * Recycle Bin mandate, and risk categorization.
 * SPDX-License-Identifier: Apache-2.0
 */

import { RiskLevel, CleanItem } from './mole-cli-types';

/**
 * Windows Protected System Locations.
 * Hard strictly blocks any direct removal or modification of these paths.
 */
export const PROTECTED_SYSTEM_DIRECTORIES = [
  'C:\\Windows',
  'C:\\Windows\\System32',
  'C:\\Windows\\SysWOW64',
  'C:\\Windows\\WinSxS',
  'C:\\Windows\\SystemResources',
  'C:\\Windows\\Boot',
  'C:\\Windows\\servicing',
  'C:\\Program Files\\Windows Defender',
  'C:\\Program Files (x86)\\Windows Defender',
  'C:\\System Volume Information',
  'C:\\Recovery',
  'C:\\$Recycle.Bin',
  'C:\\EFI',
  'C:\\Boot',
];

/**
 * Critical Root System Files
 */
export const PROTECTED_SYSTEM_FILES = [
  'pagefile.sys',
  'hiberfil.sys',
  'swapfile.sys',
  'bootmgr',
  'BOOTNXT',
  'ntldr',
  'ntoskrnl.exe',
  'hal.dll',
];

/**
 * User Personal & Project Folders Protected under Safe Mode
 */
export const PROTECTED_USER_FOLDERS = [
  '\\Documents',
  '\\Desktop',
  '\\Pictures',
  '\\Videos',
  '\\Music',
  '\\Saved Games',
  '\\Favorites',
  '\\Contacts',
  '\\OneDrive\\Documents',
  '\\OneDrive\\Desktop',
];

/**
 * Sensitive developer and security files that MUST NEVER be deleted by auto-cleaners
 */
export const PROTECTED_DEVELOPER_PATTERNS = [
  /\\\.git(\\|$)/i,
  /\\\.ssh(\\|$)/i,
  /\\\.gnupg(\\|$)/i,
  /id_rsa/i,
  /id_ed25519/i,
  /\.pem$/i,
  /\.key$/i,
  /\.env(\..+)?$/i,
  /secrets?\.(json|ya?ml|xml)$/i,
  /credentials(\.json)?$/i,
  /\.kdbx$/i,
];

export interface PathValidationResult {
  isSafe: boolean;
  reason: string;
  risk: RiskLevel;
  canSendToRecycleBin: boolean;
  isBlacklisted: boolean;
}

export class SafetyEngine {
  private safeModeEnabled: boolean = true;
  private customWhitelist: Set<string> = new Set();
  private customBlacklist: Set<string> = new Set();

  constructor(safeMode: boolean = true) {
    this.safeModeEnabled = safeMode;
  }

  public setSafeMode(enabled: boolean): void {
    this.safeModeEnabled = enabled;
  }

  public isSafeMode(): boolean {
    return this.safeModeEnabled;
  }

  /**
   * Evaluates any target file or folder path before scanning or scheduling deletion.
   */
  public evaluatePath(filePath: string): PathValidationResult {
    const normalized = filePath.replace(/\//g, '\\').trim();
    const normalizedLower = normalized.toLowerCase();

    // 1. Check against custom user blacklist
    for (const bl of this.customBlacklist) {
      if (normalizedLower.startsWith(bl.toLowerCase())) {
        return {
          isSafe: false,
          reason: 'Path is in user-defined exclusion list.',
          risk: 'critical',
          canSendToRecycleBin: false,
          isBlacklisted: true,
        };
      }
    }

    // 2. Check Windows Protected System Directories
    for (const sysDir of PROTECTED_SYSTEM_DIRECTORIES) {
      const sysDirLower = sysDir.toLowerCase();
      if (normalizedLower === sysDirLower || normalizedLower.startsWith(sysDirLower + '\\')) {
        // Exception: Windows\\Temp is permitted for temp cleaning only if within Temp folder
        if (normalizedLower.startsWith('c:\\windows\\temp\\') && normalizedLower !== 'c:\\windows\\temp') {
          return {
            isSafe: true,
            reason: 'Windows System Temp directory (stale files only).',
            risk: 'low',
            canSendToRecycleBin: true,
            isBlacklisted: false,
          };
        }
        // Exception: SoftwareDistribution\\Download (Windows update staging)
        if (normalizedLower.startsWith('c:\\windows\\softwaredistribution\\download')) {
          return {
            isSafe: true,
            reason: 'Windows Update download cache.',
            risk: 'moderate',
            canSendToRecycleBin: true,
            isBlacklisted: false,
          };
        }

        return {
          isSafe: false,
          reason: `Protected Windows operating system location (${sysDir}). Direct deletion blocked.`,
          risk: 'critical',
          canSendToRecycleBin: false,
          isBlacklisted: true,
        };
      }
    }

    // 3. Check Protected System Files
    for (const sysFile of PROTECTED_SYSTEM_FILES) {
      if (normalizedLower.endsWith('\\' + sysFile.toLowerCase()) || normalizedLower === sysFile.toLowerCase()) {
        return {
          isSafe: false,
          reason: `Critical Windows OS file (${sysFile}) cannot be deleted.`,
          risk: 'critical',
          canSendToRecycleBin: false,
          isBlacklisted: true,
        };
      }
    }

    // 4. Check Developer Credentials & Repositories
    for (const pattern of PROTECTED_DEVELOPER_PATTERNS) {
      if (pattern.test(normalized)) {
        return {
          isSafe: false,
          reason: 'Detected security credentials, encryption key, or source control repository.',
          risk: 'critical',
          canSendToRecycleBin: false,
          isBlacklisted: true,
        };
      }
    }

    // 5. In Safe Mode, protect User Personal Documents & Desktop
    if (this.safeModeEnabled) {
      for (const userFolder of PROTECTED_USER_FOLDERS) {
        if (normalizedLower.includes(userFolder.toLowerCase())) {
          return {
            isSafe: false,
            reason: `Safe Mode Protection: User personal documents directory (${userFolder}) is locked.`,
            risk: 'high',
            canSendToRecycleBin: true,
            isBlacklisted: true,
          };
        }
      }
    }

    // 6. Whitelisted / safe cleanup categories
    if (
      normalizedLower.includes('\\appdata\\local\\temp') ||
      normalizedLower.includes('\\appdata\\local\\microsoft\\windows\\inetcache') ||
      normalizedLower.includes('\\appdata\\local\\google\\chrome\\user data\\default\\cache') ||
      normalizedLower.includes('\\appdata\\local\\bravesoftware\\brave-browser\\user data\\default\\cache') ||
      normalizedLower.includes('\\appdata\\local\\microsoft\\edge\\user data\\default\\cache') ||
      normalizedLower.includes('\\.npm\\_cacache') ||
      normalizedLower.includes('\\.cargo\\registry\\cache') ||
      normalizedLower.includes('\\appdata\\local\\pip\\cache') ||
      normalizedLower.includes('\\target\\debug\\build') ||
      normalizedLower.includes('\\node_modules')
    ) {
      return {
        isSafe: true,
        reason: 'Verified safe cache/temporary build artifact.',
        risk: 'safe',
        canSendToRecycleBin: true,
        isBlacklisted: false,
      };
    }

    // Default general item evaluation
    return {
      isSafe: true,
      reason: 'Standard reviewable candidate.',
      risk: 'low',
      canSendToRecycleBin: true,
      isBlacklisted: false,
    };
  }

  /**
   * Filters a list of proposed clean items, enforcing safe mode and path protection.
   */
  public sanitizeCleanList(items: CleanItem[]): {
    allowedItems: CleanItem[];
    blockedItems: CleanItem[];
  } {
    const allowedItems: CleanItem[] = [];
    const blockedItems: CleanItem[] = [];

    for (const item of items) {
      const evaluation = this.evaluatePath(item.path);
      if (!evaluation.isSafe || evaluation.isBlacklisted) {
        blockedItems.push({
          ...item,
          isProtected: true,
          selected: false,
          reason: evaluation.reason,
          risk: evaluation.risk,
        });
      } else {
        allowedItems.push({
          ...item,
          risk: evaluation.risk,
          canSendToRecycleBin: evaluation.canSendToRecycleBin,
        });
      }
    }

    return { allowedItems, blockedItems };
  }

  /**
   * Verify if a proposed deletion action passes safety gates.
   */
  public validateActionExecution(
    items: CleanItem[],
    requireRecycleBin: boolean = true
  ): { allowed: boolean; violations: string[] } {
    const violations: string[] = [];

    for (const item of items) {
      if (!item.selected) continue;

      const evalResult = this.evaluatePath(item.path);
      if (!evalResult.isSafe) {
        violations.push(`${item.path}: ${evalResult.reason}`);
      }

      if (requireRecycleBin && !evalResult.canSendToRecycleBin) {
        violations.push(`${item.path}: Item does not support safe Recycle Bin recovery.`);
      }
    }

    return {
      allowed: violations.length === 0,
      violations,
    };
  }
}

export const defaultSafetyEngine = new SafetyEngine(true);
