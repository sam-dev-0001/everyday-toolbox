import React, { useState } from 'react';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { Fingerprint, Copy, Check, RefreshCw, Sparkles } from 'lucide-react';

export const UuidGenerator: React.FC = () => {
  const [quantity, setQuantity] = useState<number>(5);
  const [hyphens, setHyphens] = useState<boolean>(true);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const generateSingleUuid = (): string => {
    let uuid = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

    if (!hyphens) {
      uuid = uuid.replace(/-/g, '');
    }
    if (uppercase) {
      uuid = uuid.toUpperCase();
    }
    return uuid;
  };

  const [uuids, setUuids] = useState<string[]>(() =>
    Array.from({ length: 5 }, () => crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx')
  );

  const handleGenerate = () => {
    const list = Array.from({ length: quantity }, () => generateSingleUuid());
    setUuids(list);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">UUID / GUID Generator (v4)</h2>
          </div>
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 text-xs font-semibold cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'All Copied' : 'Copy All'}</span>
          </button>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="uuid-qty-select" className="text-xs font-semibold text-slate-300 block">Quantity</label>
            <select
              id="uuid-qty-select"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value={1}>1 UUID</option>
              <option value={5}>5 UUIDs</option>
              <option value={10}>10 UUIDs</option>
              <option value={25}>25 UUIDs</option>
              <option value={50}>50 UUIDs</option>
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2 flex flex-col justify-end">
            <div className="flex items-center gap-6 py-2.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hyphens}
                  onChange={(e) => setHyphens(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-0 cursor-pointer accent-purple-500"
                />
                <span>Include Hyphens</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uppercase}
                  onChange={(e) => setUppercase(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-0 cursor-pointer accent-purple-500"
                />
                <span>UPPERCASE</span>
              </label>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-500/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate New UUIDs</span>
        </button>

        {/* Results List */}
        <div className="space-y-2 pt-2">
          {uuids.map((id, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#11182C] border border-white/[0.04] group hover:border-purple-500/30 transition-all"
            >
              <span className="font-mono text-xs sm:text-sm text-slate-200 select-all">{id}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(id);
                }}
                className="p-1.5 rounded-lg bg-white/[0.04] group-hover:bg-purple-600/20 text-slate-400 group-hover:text-purple-300 text-xs font-semibold transition-all cursor-pointer"
                title="Copy UUID"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
