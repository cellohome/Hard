# Hard

> **“Clean, optimize, and understand your Windows PC.”**

Hard is a production-quality, privacy-first desktop application designed for Windows 10 (22H2+) and Windows 11 on both x64 and ARM64 architectures. It provides a transparent, non-alarmist, review-before-delete workflow that safeguards your operating system while keeping your PC fast and clutter-free.

---

## Important Legal & Brand Disclaimer

- **Hard is an independent project and is NOT affiliated with, sponsored by, or endorsed by Mole or tw93.**
- **No Reverse Engineering**: Hard does not extract assets, reverse-engineer, or reproduce pixel-for-pixel the proprietary “Mole for Windows” application.
- **Original Brand Identity**: Hard features its own original geometric brand mark, design language, information architecture, and Windows-native modules.
- **GPL-3.0 Compliance**: Where installed on the host machine, Hard interfaces with the free, open-source [Mole CLI (`mo`)](https://github.com/tw93/mole) via external process execution (`stdio`). Upstream copyright and GPL-3.0 license notices are strictly preserved in `/docs/GPL3_COMPLIANCE.md`.

---

## Core Features

1. **Dashboard**: Non-alarmist attention summary, real hardware telemetry (CPU, RAM, GPU, Disks, Network), and quick action hubs.
2. **Smart Clean**: Transparent categorization (Browser caches, user %TEMP%, developer packages npm/cargo/pip, crash dumps, Windows Update cache) with a **mandatory Dry Run by default**.
3. **Application Manager**: Inspect installed programs, versioning, install dates, residual AppData leftovers, and official winget update discovery.
4. **Startup & Background Tasks**: Enable or disable boot launchers with impact ratings and automatic protection for critical system services.
5. **Disk Analyzer**: Interactive proportional treemap, largest files, duplicate detector, and installer leftovers.
6. **System Maintenance**: Safe, explained tools (DNS resolver flush, thumbnail cache rebuild, Windows Update cleanup, Storage Sense policy). **Zero registry cleaners or driver tampering.**
7. **Live Hardware Monitor**: Real-time polling with responsive historical time-series graphs (CPU %, RAM %, Network throughput).
8. **Audit Log**: Persistent local transaction ledger exportable to CSV and JSON with rollback tracking.
9. **Global Command Palette**: Instant navigation and quick command execution via `Ctrl+K`.

---

## Safety Architecture

- **Mandatory Dry Run**: Always calculates exact reclaimable space and lists candidate files before any deletion.
- **Recycle Bin by Default**: Deleted files are routed to the Windows Recycle Bin for safe recovery.
- **Protected Paths Safeguard**: The built-in `SafetyEngine` permanently blocks deletion of Windows system directories (`System32`, `WinSxS`, `servicing`), boot files, source control (`.git`), SSH keys (`.ssh`), and credentials (`.env`).
- **Least Privilege**: Operates in standard user mode; clearly indicates when Administrator elevation is requested for specific tasks.

---

## Building and Running

### Prerequisites
- Node.js 18+ or 20+
- Rust 1.75+ (for Tauri desktop binary packaging)
- Inno Setup 6 (optional, for `.exe` installer compilation)

### Development Server
```bash
npm install
npm run dev
```

### Desktop App Packaging (Tauri)
```bash
# Build desktop executable for Windows
npm run build
npm run tauri build
```

### Inno Setup Installer Generation
```powershell
ISCC.exe /Q installer\HardSetup.iss
```

---

## Privacy Policy
Hard operates **100% locally on your computer**. There is zero telemetry by default, no cloud upload of file paths or metrics, and no advertising trackers. See `docs/PRIVACY_STATEMENT.md` for full details.

---

## License
- Hard application code and original Windows modules: **Apache-2.0**
- Mole CLI integration: interfaces with upstream **GPL-3.0** open-source CLI. See `docs/GPL3_COMPLIANCE.md`.
