import React, { useState, useMemo } from 'react';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { FileText, Clock, Volume2, Copy, Check, Trash2, BarChart2 } from 'lucide-react';

export const WordCounter: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const charactersWithSpaces = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const lines = text ? text.split('\n').length : 0;
    const sentences = trimmed ? text.split(/[.!?]+/).filter(Boolean).length : 0;
    const paragraphs = trimmed ? text.split(/\n\s*\n/).filter(Boolean).length : 0;

    // Reading time: avg 200 words/min; Speaking time: avg 130 words/min
    const readingMinutes = Math.ceil(words / 200);
    const speakingMinutes = Math.ceil(words / 130);

    return {
      words,
      charactersWithSpaces,
      charactersNoSpaces,
      lines,
      sentences,
      paragraphs,
      readingMinutes: readingMinutes === 0 && words > 0 ? 1 : readingMinutes,
      speakingMinutes: speakingMinutes === 0 && words > 0 ? 1 : speakingMinutes,
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

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0D1224] border border-white/[0.08] text-center space-y-1 shadow-md">
          <span className="text-xs text-slate-400 font-medium">Total Words</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {stats.words.toLocaleString()}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1224] border border-white/[0.08] text-center space-y-1 shadow-md">
          <span className="text-xs text-slate-400 font-medium">Characters</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono">
            {stats.charactersWithSpaces.toLocaleString()}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1224] border border-white/[0.08] text-center space-y-1 shadow-md">
          <span className="text-xs text-slate-400 font-medium">Without Spaces</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono">
            {stats.charactersNoSpaces.toLocaleString()}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1224] border border-white/[0.08] text-center space-y-1 shadow-md">
          <span className="text-xs text-slate-400 font-medium">Sentences</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
            {stats.sentences.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Text Area & Actions */}
      <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            Live Text Analysis
          </h2>

          <div className="flex items-center gap-2">
            {text && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-semibold transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
            {text && (
              <button
                onClick={() => setText('')}
                className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                title="Clear text"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <label htmlFor="word-counter-textarea" className="sr-only">Type or paste text for analysis</label>
        <textarea
          id="word-counter-textarea"
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here to count words, characters, reading duration..."
          className="w-full p-4 rounded-2xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 font-sans leading-relaxed resize-y"
        />

        {/* Secondary metric row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs text-slate-300 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-purple-400" />
            <span>Paragraphs: <strong className="text-white">{stats.paragraphs}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Lines: <strong className="text-white">{stats.lines}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Reading: <strong className="text-white">~{stats.readingMinutes} min</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>Speaking: <strong className="text-white">~{stats.speakingMinutes} min</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
