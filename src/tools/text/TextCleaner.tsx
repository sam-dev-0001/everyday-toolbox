import React, { useState } from 'react';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { Sparkles, Copy, Check, Trash2, Wand2 } from 'lucide-react';

export const TextCleaner: React.FC = () => {
  const [input, setInput] = useState<string>(
    '<p>  Hello <b>World</b>!   This is a   messy text    with <span>HTML tags</span>, “smart quotes”, and extra spaces.   \n\n\n\nEnjoy clean typography! 🚀🔥</p>'
  );

  const [stripHtml, setStripHtml] = useState<boolean>(true);
  const [removeExtraSpaces, setRemoveExtraSpaces] = useState<boolean>(true);
  const [removeBlankLines, setRemoveBlankLines] = useState<boolean>(true);
  const [normalizeQuotes, setNormalizeQuotes] = useState<boolean>(true);
  const [removeEmojis, setRemoveEmojis] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const cleanText = (): string => {
    if (!input) return '';
    let res = input;

    if (stripHtml) {
      res = res.replace(/<[^>]*>?/gm, '');
    }

    if (normalizeQuotes) {
      res = res
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/\u2026/g, '...');
    }

    if (removeEmojis) {
      res = res.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
    }

    if (removeExtraSpaces) {
      res = res.replace(/[ \t]+/g, ' ');
    }

    if (removeBlankLines) {
      res = res.replace(/^\s*[\r\n]/gm, '');
    }

    return res.trim();
  };

  const output = cleanText();

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      {/* Cleaning options bar */}
      <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-purple-400" />
          Active Cleaning Filters
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs font-semibold text-slate-300">
          {[
            { label: 'Strip HTML Tags', state: stripHtml, set: setStripHtml },
            { label: 'Fix Extra Spaces', state: removeExtraSpaces, set: setRemoveExtraSpaces },
            { label: 'Trim Blank Lines', state: removeBlankLines, set: setRemoveBlankLines },
            { label: 'ASCII Quotes', state: normalizeQuotes, set: setNormalizeQuotes },
            { label: 'Remove Emojis', state: removeEmojis, set: setRemoveEmojis },
          ].map((item, idx) => (
            <label
              key={idx}
              className={`p-3 rounded-2xl border flex items-center gap-2 cursor-pointer transition-all ${
                item.state
                  ? 'bg-purple-600/15 border-purple-500/50 text-purple-300'
                  : 'bg-[#11182C] border-white/[0.04] text-slate-400 hover:border-white/[0.1]'
              }`}
            >
              <input
                type="checkbox"
                checked={item.state}
                onChange={(e) => item.set(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-0 cursor-pointer accent-purple-500"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Input and Output textareas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <label htmlFor="raw-text-textarea" className="text-xs font-bold text-slate-300">Raw Input Text</label>
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
            id="raw-text-textarea"
            rows={12}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste raw text here..."
            className="w-full p-4 rounded-2xl bg-[#11182C] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500 font-mono resize-none leading-relaxed"
          />
        </div>

        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <label htmlFor="clean-output-textarea" className="text-xs font-bold text-emerald-400">Sanitized Output</label>
            {output && (
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
            id="clean-output-textarea"
            rows={12}
            readOnly
            value={output}
            placeholder="Cleaned text will appear here..."
            className="w-full p-4 rounded-2xl bg-[#11182C] border border-white/[0.08] text-xs text-emerald-300 focus:outline-none font-mono resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
