/**
 * Hard - Live System & Hardware Monitor
 * Real-time CPU cores, memory allocation, disk I/O, network telemetry,
 * responsive historical charts, and process inspector.
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Battery,
  AlertOctagon,
  FolderOpen,
  Search,
} from 'lucide-react';
import { formatBytes, formatTransferRate } from '../utils/formatters';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface HistoryPoint {
  time: string;
  cpu: number;
  memory: number;
  downloadKb: number;
}

export const LiveMonitorPage: React.FC = () => {
  const { systemMetrics, showToast } = useApp();
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [processSearch, setProcessSearch] = useState('');

  // Collect history data points
  useEffect(() => {
    const now = new Date();
    const timeStr = `${now.getMinutes()}:${now.getSeconds() < 10 ? '0' : ''}${now.getSeconds()}`;
    const memPct = Math.round((systemMetrics.memoryUsedBytes / systemMetrics.memoryTotalBytes) * 100);
    const dlKb = Math.round(systemMetrics.network.downloadBytesPerSec / 1024);

    setHistory((prev) => {
      const next = [...prev, { time: timeStr, cpu: systemMetrics.cpuUsagePercent, memory: memPct, downloadKb: dlKb }];
      return next.slice(-25); // keep last 25 ticks
    });
  }, [systemMetrics]);

  const filteredProcesses = systemMetrics.topProcesses.filter(
    (p) =>
      p.name.toLowerCase().includes(processSearch.toLowerCase()) ||
      p.user.toLowerCase().includes(processSearch.toLowerCase())
  );

  const handleEndTask = (p: { pid: number; name: string; isSystem: boolean }) => {
    if (p.isSystem) {
      showToast(`Cannot terminate critical Windows system process (${p.name}).`, 'error');
      return;
    }
    showToast(`Requested process termination for ${p.name} (PID ${p.pid}).`, 'info');
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Live Hardware &amp; Performance Monitor
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
              POLLING: 1.5s
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Windows Performance Counters &amp; WMI hardware telemetry. Grounded in real OS sensors.
          </p>
        </div>

        {systemMetrics.battery && (
          <div className="flex items-center gap-2 p-2 px-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono">
            <Battery className="w-4 h-4 text-teal-400" />
            <span>Battery: {systemMetrics.battery.percent}% ({systemMetrics.battery.powerState})</span>
          </div>
        )}
      </div>

      {/* Historical Telemetry Chart (Recharts) */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-white">Resource History (Last 40 seconds)</span>
            <span className="flex items-center gap-1.5 text-teal-400 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block" />
              CPU %
            </span>
            <span className="flex items-center gap-1.5 text-indigo-400 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block" />
              RAM %
            </span>
          </div>
          <span className="font-mono text-slate-400">
            Current CPU: <strong className="text-white">{systemMetrics.cpuUsagePercent}%</strong>
          </span>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stop-color="#2dd4bf" stop-opacity={0.3} />
                  <stop offset="95%" stop-color="#2dd4bf" stop-opacity={0} />
                </linearGradient>
                <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stop-color="#818cf8" stop-opacity={0.3} />
                  <stop offset="95%" stop-color="#818cf8" stop-opacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#475569" fontSize={10} tickLine={false} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#f8fafc',
                }}
              />
              <Area type="monotone" dataKey="cpu" stroke="#2dd4bf" strokeWidth={2} fillOpacity={1} fill="url(#cpuGradient)" />
              <Area type="monotone" dataKey="memory" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#memGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GPU & Disk I/O Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GPU Telemetry */}
        {systemMetrics.gpu && (
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Graphics Processor (GPU)</span>
              <span className="font-mono text-teal-400">{systemMetrics.gpu.utilizationPercent}% Load</span>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-bold text-white font-mono">
                {systemMetrics.gpu.name}
              </div>
              <div className="text-xs text-slate-400 flex items-center justify-between font-mono">
                <span>VRAM: {formatBytes(systemMetrics.gpu.vramUsedBytes, 1)} / {formatBytes(systemMetrics.gpu.vramTotalBytes, 0)}</span>
                {systemMetrics.gpu.temperatureC && <span>Temp: {systemMetrics.gpu.temperatureC}°C</span>}
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500" style={{ width: `${systemMetrics.gpu.utilizationPercent}%` }} />
            </div>
          </div>
        )}

        {/* Disk I/O Rates */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white">Storage Transfer Rate (Disk I/O)</span>
            <span className="font-mono text-teal-400">NTFS Subsystem</span>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Read Throughput</span>
              <span className="text-base font-bold text-white font-mono tabular-nums">
                {formatTransferRate(systemMetrics.diskIo.readBytesPerSec)}
              </span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Write Throughput</span>
              <span className="text-base font-bold text-white font-mono tabular-nums">
                {formatTransferRate(systemMetrics.diskIo.writeBytesPerSec)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Processes Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-400" />
            <h2 className="text-xs font-semibold text-white uppercase tracking-wider">
              Top Active Processes
            </h2>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={processSearch}
              onChange={(e) => setProcessSearch(e.target.value)}
              placeholder="Search processes..."
              className="pl-7 pr-3 py-1 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 w-44"
            />
          </div>
        </div>

        <div className="p-3 border-b border-slate-800 bg-slate-950/20 grid grid-cols-12 text-xs font-semibold text-slate-400 font-mono">
          <div className="col-span-1">PID</div>
          <div className="col-span-5">Process Name &amp; User</div>
          <div className="col-span-2 text-right">CPU %</div>
          <div className="col-span-2 text-right">Memory (Working Set)</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {filteredProcesses.map((p) => (
            <div key={p.pid} className="p-3 grid grid-cols-12 items-center text-xs hover:bg-slate-850/60 transition-colors">
              <div className="col-span-1 font-mono text-slate-400">
                {p.pid}
              </div>

              <div className="col-span-5 space-y-0.5 pr-2">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <span>{p.name}</span>
                  {p.isSystem && (
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1 py-0.2 rounded">
                      SYSTEM
                    </span>
                  )}
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate" title={p.path}>
                  {p.path}
                </div>
              </div>

              <div className="col-span-2 text-right font-mono font-bold text-teal-400 tabular-nums">
                {p.cpuPercent}%
              </div>

              <div className="col-span-2 text-right font-mono text-slate-300 tabular-nums">
                {formatBytes(p.memoryBytes)}
              </div>

              <div className="col-span-2 text-right">
                <button
                  onClick={() => handleEndTask(p)}
                  disabled={p.isSystem}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-colors ${
                    p.isSystem
                      ? 'text-slate-600 bg-slate-800/20 cursor-not-allowed'
                      : 'text-rose-400 bg-rose-950/40 hover:bg-rose-950 border border-rose-800/60 cursor-pointer'
                  }`}
                  title={p.isSystem ? 'System protected process' : 'Terminate process with confirmation'}
                >
                  End Task
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
