import React, { useState } from 'react';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { ListFilter, Copy, Check, Trash2, ArrowDownAZ, ArrowUpZA } from 'lucide-react';

export const RemoveDuplicateLines: React.FC = () => {
  const [input, setInput] = useState<string>('apple\nbanana\napple\norange\nBANANA\ngrape\norange');
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false);
  const [trimWhitespace, setTrimWhitespace] = useState<boolean>(true);
  const [removeEmpty, setRemoveEmpty] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');
  const [copied, setCopied] = useState<boolean>(false);

  const processLines = (): { result: string; originalCount: number; uniqueCount: number; duplicatesRemoved: number } => {
    if (!input) return { result: '', originalCount: 0, uniqueCount: 0, duplicatesRemoved: 0 };

    let lines = input.split('\n');
    const originalCount = lines.length;

    if (trimWhitespace) {
      lines = lines.map((l) => l.trim());
    }

    if (removeEmpty) {
      lines = lines.filter((l) => l.length > 0);
    }

    const seen = new Set<string>();
    const unique: string[] = [];

    for (const line of lines) {
      const key = caseSensitive ? line : line.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(line);
      }
    }

    if (sortOrder === 'asc') {
      unique.sort((a, b) => a.localeCompare(b));
    } else if (sortOrder === 'desc') {
      unique.sort((a, b) => b.localeCompare(a));
    }

    return {
      result: unique.join('\n'),
      originalCount,
      uniqueCount: unique.length,
      duplicatesRemoved: originalCount - unique.length,
    };
  };

  const { result, originalCount, uniqueCount, duplicatesRemoved } = processLines();

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0D1224] border border-white/[0.08] text-center space-y-1 shadow-md">
          <span className="text-xs text-slate-400 font-medium">Original Lines</span>
          <p className="text-2xl font-extrabold text-white font-mono">{originalCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1224] border border-white/[0.08] text-center space-y-1 shadow-md">
          <span className="text-xs text-slate-400 font-medium">Unique Remaining</span>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono">{uniqueCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1224] border border-white/[0.08] text-center space-y-1 shadow-md">
          <span className="text-xs text-slate-400 font-medium">Duplicates Removed</span>
          <p className="text-2xl font-extrabold text-purple-400 font-mono">{duplicatesRemoved}</p>
        </div>
      </div>

      {/* Options Bar */}
      <div className="p-4 rounded-2xl bg-[#0D1224] border border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-0 cursor-pointer accent-purple-500"
            />
            <span>Case Sensitive</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={trimWhitespace}
              onChange={(e) => setTrimWhitespace(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-0 cursor-pointer accent-purple-500"
            />
            <span>Trim Spaces</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={removeEmpty}
              onChange={(e) => setRemoveEmpty(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-0 cursor-pointer accent-purple-500"
            />
            <span>Remove Empty</span>
          </label>
        </div>

        {/* Sort order */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'none' : 'asc')}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              sortOrder === 'asc'
                ? 'bg-purple-600 text-white'
                : 'bg-[#11182C] text-slate-300 hover:text-white border border-white/[0.06]'
            }`}
            title="Sort A to Z"
          >
            <ArrowDownAZ className="w-4 h-4" />
            <span>A-Z</span>
          </button>

          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'none' : 'desc')}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              sortOrder === 'desc'
                ? 'bg-purple-600 text-white'
                : 'bg-[#11182C] text-slate-300 hover:text-white border border-white/[0.06]'
            }`}
            title="Sort Z to A"
          >
            <ArrowUpZA className="w-4 h-4" />
            <span>Z-A</span>
          </button>
        </div>
      </div>

      {/* Inputs and Output Side by Side / Stacked */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <label htmlFor="dup-input-textarea" className="text-xs font-bold text-slate-300">Original Text</label>
            {input && (
              <button
                onClick={() => setInput('')}
                className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <textarea
            id="dup-input-textarea"
            rows={12}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste duplicate lines here..."
            className="w-full p-4 rounded-2xl bg-[#11182C] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500 font-mono resize-none"
          />
        </div>

        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <label htmlFor="dup-deduped-textarea" className="text-xs font-bold text-emerald-400">Deduplicated Result</label>
            {result && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 text-xs font-semibold cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>
          <textarea
            id="dup-deduped-textarea"
            rows={12}
            readOnly
            value={result}
            placeholder="Unique lines will appear here..."
            className="w-full p-4 rounded-2xl bg-[#11182C] border border-white/[0.08] text-xs text-emerald-300 focus:outline-none font-mono resize-none"
          />
        </div>
      </div>
    </div>
  );
};
