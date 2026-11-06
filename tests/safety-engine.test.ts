/**
 * Hard - Safety Engine & Dry Run Calculation Unit Tests
 * SPDX-License-Identifier: Apache-2.0
 */

import { SafetyEngine, defaultSafetyEngine } from '../services/mole-bridge/safety-engine';
import { CleanCategory } from '../services/mole-bridge/mole-cli-types';
import { windowsNative } from '../services/mole-bridge/windows-native-bridge';

export function runUnitTests(): { passed: number; failed: number; results: Array<{ name: string; success: boolean; message?: string }> } {
  const results: Array<{ name: string; success: boolean; message?: string }> = [];
  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, message?: string) {
    if (condition) {
      passed++;
      results.push({ name, success: true });
    } else {
      failed++;
      results.push({ name, success: false, message: message || 'Assertion failed' });
    }
  }

  const engine = new SafetyEngine(true);

  // Test 1: Block System32
  const sys32 = engine.evaluatePath('C:\\Windows\\System32\\calc.exe');
  assert('Block System32 deletion', !sys32.isSafe && sys32.isBlacklisted);

  // Test 2: Block WinSxS
  const winsxs = engine.evaluatePath('C:\\Windows\\WinSxS\\manifests\\foo.manifest');
  assert('Block WinSxS deletion', !winsxs.isSafe);

  // Test 3: Block Git repository
  const gitRepo = engine.evaluatePath('C:\\Projects\\my-app\\.git\\config');
  assert('Block .git repository files', !gitRepo.isSafe && gitRepo.risk === 'critical');

  // Test 4: Block SSH private keys
  const sshKey = engine.evaluatePath('C:\\Users\\Default\\.ssh\\id_rsa');
  assert('Block SSH private key deletion', !sshKey.isSafe && sshKey.risk === 'critical');

  // Test 5: Block .env files
  const envFile = engine.evaluatePath('C:\\Projects\\secrets\\.env.production');
  assert('Block production .env credentials', !envFile.isSafe);

  // Test 6: Permit AppData Temp folder
  const tempFile = engine.evaluatePath('C:\\Users\\Default\\AppData\\Local\\Temp\\stale_install.tmp');
  assert('Allow User %TEMP% cleaning', tempFile.isSafe && tempFile.risk === 'safe');

  // Test 7: Dry-run calculations test
  const testCategories: CleanCategory[] = [
    {
      id: 'test_cat',
      name: 'Test Category',
      description: 'Test',
      source: 'Test',
      defaultSelected: true,
      risk: 'safe',
      totalBytes: 1000,
      items: [
        {
          id: 'item1',
          categoryId: 'test_cat',
          path: 'C:\\Users\\Default\\AppData\\Local\\Temp\\test1.tmp',
          name: 'test1.tmp',
          sizeBytes: 600,
          lastModified: '2026-11-06',
          risk: 'safe',
          reason: 'Test',
          selected: true,
          canSendToRecycleBin: true,
        },
        {
          id: 'item2',
          categoryId: 'test_cat',
          path: 'C:\\Users\\Default\\AppData\\Local\\Temp\\test2.tmp',
          name: 'test2.tmp',
          sizeBytes: 400,
          lastModified: '2026-11-06',
          risk: 'safe',
          reason: 'Test',
          selected: false,
          canSendToRecycleBin: true,
        },
      ],
    },
  ];

  const dryRun = windowsNative.calculateDryRun(testCategories);
  assert('Dry Run sums total bytes accurately', dryRun.totalReclaimableBytes === 1000);
  assert('Dry Run sums selected bytes accurately', dryRun.selectedBytes === 600);
  assert('Dry Run counts selected items accurately', dryRun.selectedCount === 1);

  return { passed, failed, results };
}
