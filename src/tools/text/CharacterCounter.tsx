import React, { useState, useMemo } from 'react';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { Hash, Copy, Check, Trash2 } from 'lucide-react';

export const CharacterCounter: React.FC = () => {
  const [text, setText] = useState<string>('Hello! Everyday Toolbox is fast, private, and 100% client-side.');
  const [copied, setCopied] = useState<boolean>(false);

  const stats = useMemo(() => {
    const totalChars = text.length;
    const letters = (text.match(/[a-zA-Z]/g) || []).length;
    const digits = (text.match(/[0-9]/g) || []).length;
    const spaces = (text.match(/\s/g) || []).length;
    const punctuation = (text.match(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'<>@\[\]\\+]/g) || []).length;
    const uppercase = (text.match(/[A-Z]/g) || []).length;
    const lowercase = (text.match(/[a-z]/g) || []).length;
    const bytes = new Blob([text]).size;

    return {
      totalChars,
      letters,
      digits,
      spaces,
      punctuation,
      uppercase,
      lowercase,
      bytes,
    };
  }, [text]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0D1224] border border-white/[0.08] text-center space-y-1">
          <span className="text-xs text-slate-400">Total Characters</span>
          <p className="text-2xl font-extrabold text-white font-mono">{stats.totalChars}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1224] border border-white/[0.08] text-center space-y-1">
          <span className="text-xs text-slate-400">Letters</span>
          <p className="text-2xl font-extrabold text-purple-400 font-mono">{stats.letters}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1224] border border-white/[0.08] text-center space-y-1">
          <span className="text-xs text-slate-400">Digits</span>
          <p className="text-2xl font-extrabold text-blue-400 font-mono">{stats.digits}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1224] border border-white/[0.08] text-center space-y-1">
          <span className="text-xs text-slate-400">Punctuation</span>
          <p className="text-2xl font-extrabold text-amber-400 font-mono">{stats.punctuation}</p>
        </div>
      </div>

      {/* Text Area */}
      <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Hash className="w-4 h-4 text-purple-400" />
            Character Density Breakdown
          </h2>

          <div className="flex items-center gap-2">
            {text && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 text-xs font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
            {text && (
              <button
                onClick={() => setText('')}
                className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <label htmlFor="char-counter-textarea" className="sr-only">Type or paste text for character analysis</label>
        <textarea
          id="char-counter-textarea"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
          className="w-full p-4 rounded-2xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 font-sans resize-y"
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs text-slate-300 border-t border-white/[0.06]">
          <div>Uppercase: <strong className="text-white font-mono">{stats.uppercase}</strong></div>
          <div>Lowercase: <strong className="text-white font-mono">{stats.lowercase}</strong></div>
          <div>Spaces: <strong className="text-white font-mono">{stats.spaces}</strong></div>
          <div>Byte Size: <strong className="text-white font-mono">{stats.bytes} B</strong></div>
        </div>
      </div>
    </div>
  );
};
