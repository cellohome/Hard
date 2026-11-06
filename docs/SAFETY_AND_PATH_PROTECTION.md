# Hard Safety & Path Protection Policy

## Core Safety Tenets

Hard was built from the ground up to eliminate the risk of destructive accidents that commonly plague PC cleaner utilities.

### 1. Mandatory Dry Run by Default
Hard never executes a file deletion or disk modification directly upon scan completion. Every operation begins with a non-destructive dry run that tallies files, verifies checksums/timestamps, and displays an itemized list for explicit user inspection.

### 2. Mandatory Two-Step Review-Before-Delete
Every destructive action requires explicit review:
- Target item count and aggregate size.
- Transparent risk classification (`Safe`, `Low`, `Moderate`, `High`, `Critical`).
- Count of protected files automatically skipped.
- Explicit interactive confirmation before execution.

### 3. Windows Protected System Directories
Hard enforces a permanent, hardcoded blocklist preventing deletion or tampering with critical Windows OS locations:
- `C:\Windows` (including `System32`, `SysWOW64`, `WinSxS`, `servicing`)
- `C:\Program Files\Windows Defender`
- `C:\System Volume Information`
- `C:\Recovery`
- `$Recycle.Bin` roots
- Critical boot files (`pagefile.sys`, `hiberfil.sys`, `swapfile.sys`, `bootmgr`, `ntoskrnl.exe`)

### 4. Developer & Security Credentials Safeguard
Hard's Safety Engine actively scans target paths and regex patterns to ensure developer files are never cleared:
- Source control repositories (`.git/`)
- SSH keys (`.ssh/id_rsa`, `.ssh/id_ed25519`)
- GPG keys (`.gnupg/`)
- Certificates and private keys (`*.pem`, `*.key`)
- Environment configurations (`.env*`, `credentials.json`, `secrets.yaml`)
- Password manager databases (`*.kdbx`)

### 5. Windows Recycle Bin Default
Whenever physically possible under Windows Shell APIs (`SHFileOperation` / `trash-rs`), deleted items are directed to the user's **Recycle Bin**, permitting instant restoration if a user changes their mind.

### 6. No Fabricated "Junk" Metrics
Hard displays real disk metrics with strict units (Bytes / KB / MB / GB). No arbitrary "health scores" (e.g. "98/100 PC Health") or alarmist countdowns are ever shown.
