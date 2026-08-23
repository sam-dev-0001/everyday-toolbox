import React, { useState } from 'react';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { Link2, Copy, Check, Sparkles, Trash2, Table } from 'lucide-react';

export const UrlEncoder: React.FC = () => {
  const [input, setInput] = useState<string>(
    'https://example.com/search?q=everyday toolbox&category=pdf & tools&sort=desc'
  );
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const encodedFull = encodeURI(input);
  const encodedComponent = encodeURIComponent(input);

  let decoded = '';
  try {
    decoded = decodeURIComponent(input);
  } catch {
    decoded = 'Invalid encoded URI string';
  }

  // Parse query params if valid URL
  const queryParams: Array<{ key: string; value: string }> = [];
  try {
    const url = new URL(input);
    url.searchParams.forEach((value, key) => {
      queryParams.push({ key, value });
    });
  } catch {
    // If not a full URL, try query string directly
    if (input.includes('?')) {
      const q = input.split('?')[1];
      const params = new URLSearchParams(q);
      params.forEach((value, key) => {
        queryParams.push({ key, value });
      });
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">URL Encoder & Decoder</h2>
          </div>
          {input && (
            <button
              onClick={() => setInput('')}
              className="text-xs text-rose-400 hover:text-rose-300"
            >
              Clear Input
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="url-input-field" className="text-xs font-semibold text-slate-300 block">Input URL or String</label>
          <input
            id="url-input-field"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste URL or query string here..."
            className="w-full px-4 py-3 rounded-2xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
          />
        </div>

        {/* Encoded / Decoded Results */}
        <div className="space-y-3 pt-2">
          {/* encodeURIComponent */}
          <div className="p-4 rounded-2xl bg-[#11182C] border border-white/[0.04] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400">encodeURIComponent (For parameters & queries)</span>
              <button
                onClick={() => copyToClipboard(encodedComponent, 'comp')}
                className="flex items-center gap-1 text-xs text-slate-300 hover:text-white"
              >
                {copied === 'comp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === 'comp' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-300 font-mono break-all bg-[#070A14] p-3 rounded-xl border border-white/[0.04] select-all">
              {encodedComponent}
            </p>
          </div>

          {/* decodeURIComponent */}
          <div className="p-4 rounded-2xl bg-[#11182C] border border-white/[0.04] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">Decoded URL</span>
              <button
                onClick={() => copyToClipboard(decoded, 'dec')}
                className="flex items-center gap-1 text-xs text-slate-300 hover:text-white"
              >
                {copied === 'dec' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === 'dec' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-300 font-mono break-all bg-[#070A14] p-3 rounded-xl border border-white/[0.04] select-all">
              {decoded}
            </p>
          </div>
        </div>

        {/* Query parameters breakdown table */}
        {queryParams.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <Table className="w-4 h-4 text-purple-400" />
              Parsed Query Parameters ({queryParams.length})
            </h3>
            <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#11182C] text-slate-400 border-b border-white/[0.06]">
                  <tr>
                    <th className="p-3 font-semibold">Key</th>
                    <th className="p-3 font-semibold">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] bg-[#070A14]">
                  {queryParams.map((param, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="p-3 font-mono text-purple-300 font-medium">{param.key}</td>
                      <td className="p-3 font-mono text-slate-300">{param.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
