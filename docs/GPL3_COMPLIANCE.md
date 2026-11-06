# GPL-3.0 Compliance and Attribution Notice

## Independent Frontend Statement
**Hard** is an independent, original open-source frontend and system management utility. **Hard is NOT affiliated with, sponsored by, or endorsed by Mole, tw93, or any official Mole entities.**

All interface layouts, graphical marks, iconography, wording, information architecture, and Windows-specific modules in Hard are original creations designed specifically for Windows 10 and 11 environments.

## Integration with Mole CLI
Where available on the user's host machine, Hard optionally connects to the free, open-source **Mole CLI (`mo`)** distributed under the **GNU General Public License v3.0 (GPL-3.0)**:
- **Upstream Project Repository**: [https://github.com/tw93/mole](https://github.com/tw93/mole)
- **Upstream Author**: tw93
- **License**: GNU General Public License v3.0

Hard interfaces with the Mole CLI strictly via external process execution (`std::process::Command` / IPC bridge) over standard input/output channels (`stdio`), utilizing JSON formatted dry-run queries and stdout parsing. Hard does not link proprietary code into the CLI nor does it modify or decompile closed-source binaries.

## Preservation of GPL-3.0 Rights
In accordance with GPL-3.0 requirements:
1. Hard preserves all upstream copyright and license notices.
2. The complete corresponding source code for Hard and its bridge layers is open and freely accessible.
3. Users retain full rights to inspect, run, modify, and redistribute their software under the respective terms of GPL-3.0 and Apache-2.0.
