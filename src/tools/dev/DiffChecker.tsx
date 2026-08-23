import React, { useState } from 'react';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { GitCompare, Sparkles, Trash2 } from 'lucide-react';

export const DiffChecker: React.FC = () => {
  const [original, setOriginal] = useState<string>(
    `function calculateTax(amount) {\n  const rate = 0.05;\n  return amount * rate;\n}`
  );
  const [modified, setModified] = useState<string>(
    `function calculateTax(amount, state = 'CA') {\n  const rate = state === 'CA' ? 0.0725 : 0.05;\n  // Added state calculation\n  return amount * rate;\n}`
  );

  const getDiffLines = () => {
    const origLines = original.split('\n');
    const modLines = modified.split('\n');
    const maxLen = Math.max(origLines.length, modLines.length);
    const diffs: Array<{ orig?: string; mod?: string; status: 'same' | 'added' | 'removed' | 'changed' }> = [];

    for (let i = 0; i < maxLen; i++) {
      const o = origLines[i];
      const m = modLines[i];

      if (o === m) {
        diffs.push({ orig: o, mod: m, status: 'same' });
      } else if (o !== undefined && m !== undefined) {
        diffs.push({ orig: o, mod: m, status: 'changed' });
      } else if (o !== undefined && m === undefined) {
        diffs.push({ orig: o, status: 'removed' });
      } else {
        diffs.push({ mod: m, status: 'added' });
      }
    }
    return diffs;
  };

  const diffLines = getDiffLines();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">Text & Code Diff Checker</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setOriginal('');
                setModified('');
              }}
              className="text-xs text-rose-400 hover:text-rose-300"
            >
              Clear Both
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="diff-orig-textarea" className="text-xs font-semibold text-slate-300 block">Original Text / Code</label>
            <textarea
              id="diff-orig-textarea"
              rows={8}
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              placeholder="Paste original text here..."
              className="w-full p-4 rounded-2xl bg-[#11182C] border border-white/[0.08] text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500 font-mono resize-y"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="diff-mod-textarea" className="text-xs font-semibold text-emerald-400 block">Modified Text / Code</label>
            <textarea
              id="diff-mod-textarea"
              rows={8}
              value={modified}
              onChange={(e) => setModified(e.target.value)}
              placeholder="Paste modified text here..."
              className="w-full p-4 rounded-2xl bg-[#11182C] border border-white/[0.08] text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500 font-mono resize-y"
            />
          </div>
        </div>

        {/* Visual Line Diff Output */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold text-slate-300 block">Line Comparison Output</span>
          <div className="rounded-2xl bg-[#070A14] border border-white/[0.06] overflow-x-auto p-2 divide-y divide-white/[0.02] font-mono text-xs">
            {diffLines.map((line, idx) => {
              let bg = 'bg-transparent text-slate-400';
              let badge = ' ';

              if (line.status === 'added') {
                bg = 'bg-emerald-500/15 text-emerald-300 font-semibold';
                badge = '+';
              } else if (line.status === 'removed') {
                bg = 'bg-rose-500/15 text-rose-300 line-through';
                badge = '-';
              } else if (line.status === 'changed') {
                bg = 'bg-amber-500/15 text-amber-300';
                badge = '~';
              }

              return (
                <div key={idx} className={`flex items-start gap-3 py-1 px-2.5 rounded-lg ${bg}`}>
                  <span className="text-[10px] w-4 shrink-0 select-none opacity-60">{idx + 1}</span>
                  <span className="w-3 select-none shrink-0 font-bold">{badge}</span>
                  <span className="whitespace-pre break-all">{line.mod ?? line.orig ?? ''}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
