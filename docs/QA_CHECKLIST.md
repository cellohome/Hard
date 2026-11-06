# Hard Quality Assurance & Verification Checklist

| Test Item | Verification Criteria | Expected Outcome |
| :--- | :--- | :--- |
| **Windows 11 23H2 / 24H2** | Run on Windows 11 with dark mode and mica effect | Native window controls, correct accent color contrast |
| **Windows 10 22H2** | Test on Windows 10 x64 standard build | Acrylic fallback, crisp text rendering |
| **Administrator Elevation** | Run as standard non-admin user | Maintenance actions requiring admin display UAC badge; no unhandled crashes |
| **Recycle Bin Fallback** | Execute smart clean on test temp folder | Deleted files appear in Windows Recycle Bin with original restore paths |
| **Safe Mode Path Protection**| Attempt to queue `C:\Windows\System32` or `.ssh\id_rsa` | Instantly blocked by Safety Engine with clear risk explanation |
| **Long Paths (>260 chars)** | Scan deeply nested build artifacts (`node_modules/...`) | Unicode prefix `\\?\` handled without truncation or buffer overflows |
| **Locked / In-Use Files** | Clean browser cache while browser is running | In-use files skipped safely without crashing; skipped count reported in audit log |
| **High-DPI Scaling** | Display at 125%, 150%, 175%, and 200% Windows scaling | Crisp vector icons, no blurred text, zero horizontal layout breakages |
| **Dark / Light Theme** | Toggle theme switch in Settings and header | WCAG AA compliance verified on all cards, buttons, charts, and modal dialogs |
| **Mole CLI Detection** | Test with `mo` in PATH vs missing CLI | Shows connected badge when found; graceful fallback and install tips when absent |
| **Audit Log Export** | Run clean action and export Activity Log to CSV & JSON | All timestamps, target paths, bytes, and confirmations exported accurately |
