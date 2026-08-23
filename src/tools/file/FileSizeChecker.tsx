import React, { useState } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { HardDrive, Wifi, Zap, Clock, ShieldCheck, Copy, Check } from 'lucide-react';
import { formatBytes } from '../../utils/download';

export const FileSizeChecker: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
    }
  };

  const copyVal = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const calculateTransferTime = (bytes: number, speedMbps: number) => {
    const totalBits = bytes * 8;
    const speedBps = speedMbps * 1_000_000;
    const seconds = totalBits / speedBps;

    if (seconds < 0.05) return '< 0.1 sec';
    if (seconds < 60) return `${seconds.toFixed(1)} sec`;
    const minutes = Math.floor(seconds / 60);
    const remSec = Math.round(seconds % 60);
    return `${minutes}m ${remSec}s`;
  };

  const bytes = file?.size || 0;
  const kb = bytes / 1024;
  const mb = kb / 1024;
  const gb = mb / 1024;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <UploadZone
        files={file ? [file] : []}
        onFilesSelected={handleFilesSelected}
        onClearFiles={() => setFile(null)}
        title="Select any file to inspect exact size"
        subtitle="Calculates exact bytes, binary units, block clusters, and network transfer speeds"
      />

      {file && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6 shadow-xl">
          {/* Exact Byte Conversion Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Exact Bytes', val: bytes.toLocaleString() + ' B', raw: bytes.toString() },
              { label: 'Kilobytes (KB)', val: kb.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' KB', raw: kb.toFixed(2) },
              { label: 'Megabytes (MB)', val: mb.toLocaleString(undefined, { maximumFractionDigits: 3 }) + ' MB', raw: mb.toFixed(3) },
              { label: 'Gigabytes (GB)', val: gb.toLocaleString(undefined, { maximumFractionDigits: 4 }) + ' GB', raw: gb.toFixed(4) },
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => copyVal(item.raw, item.label)}
                className="p-4 rounded-2xl bg-[#11182C] border border-white/[0.04] space-y-1 cursor-pointer hover:border-purple-500/40 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">{item.label}</span>
                  {copiedKey === item.label ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                <p className="text-sm sm:text-base font-bold text-white font-mono truncate">{item.val}</p>
              </div>
            ))}
          </div>

          {/* Transfer Time Calculations */}
          <div className="p-4 rounded-2xl bg-[#11182C] border border-white/[0.04] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Wifi className="w-4 h-4 text-purple-400" />
              <span>Estimated Transfer & Upload Times</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {[
                { name: '3G Mobile (3 Mbps)', time: calculateTransferTime(bytes, 3) },
                { name: '4G LTE (25 Mbps)', time: calculateTransferTime(bytes, 25) },
                { name: '5G / Wi-Fi (150 Mbps)', time: calculateTransferTime(bytes, 150) },
                { name: 'Gigabit Fiber (1 Gbps)', time: calculateTransferTime(bytes, 1000) },
              ].map((conn, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#070A14] border border-white/[0.06] space-y-1">
                  <p className="text-[11px] text-slate-400">{conn.name}</p>
                  <p className="text-sm font-bold text-emerald-400 font-mono">{conn.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Specs */}
          <div className="p-4 rounded-2xl bg-[#11182C] border border-white/[0.04] space-y-2 text-xs">
            <h4 className="font-bold text-white">File Properties</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 font-mono">
              <div>Filename: <span className="text-white">{file.name}</span></div>
              <div>MIME Type: <span className="text-white">{file.type || 'unknown/binary'}</span></div>
              <div>Last Modified: <span className="text-white">{new Date(file.lastModified).toLocaleString()}</span></div>
              <div>Disk Sectors (4KB Blocks): <span className="text-white">{Math.ceil(bytes / 4096).toLocaleString()} blocks</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
