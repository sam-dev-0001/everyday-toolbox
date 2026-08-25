import React, { useState } from 'react';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { Braces, Copy, Check, Sparkles, Trash2, AlertCircle, CheckCircle2, Minimize2 } from 'lucide-react';

export const JsonFormatter: React.FC = () => {
  const [input, setInput] = useState<string>(
    '{"app":"Everyday Tool","version":1,"features":["privacy","no-backend","fast"],"config":{"theme":"dark","port":3000,"active":true}}'
  );
  const [indentSize, setIndentSize] = useState<number>(2);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const formatJson = (spaces: number = indentSize) => {
    if (!input.trim()) return;
    try {
      // Try to parse standard JSON or relaxed JSON (e.g. trailing commas)
      let sanitized = input;
      // remove trailing commas in objects and arrays
      sanitized = sanitized.replace(/,\s*([\]}])/g, '$1');
      const parsed = JSON.parse(sanitized);
      const formatted = JSON.stringify(parsed, null, spaces);
      setInput(formatted);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Invalid JSON syntax');
    }
  };

  const minifyJson = () => {
    if (!input.trim()) return;
    try {
      let sanitized = input.replace(/,\s*([\]}])/g, '$1');
      const parsed = JSON.parse(sanitized);
      setInput(JSON.stringify(parsed));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Invalid JSON syntax');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <Braces className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">JSON Formatter & Validator</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={indentSize}
              onChange={(e) => {
                const s = Number(e.target.value);
                setIndentSize(s);
                formatJson(s);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-xs text-white cursor-pointer focus:outline-none"
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
              <option value={1}>Compact (1 Space)</option>
            </select>

            <button
              type="button"
              onClick={() => formatJson(indentSize)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-md shadow-purple-500/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Prettify</span>
            </button>

            <button
              type="button"
              onClick={minifyJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#11182C] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.06] text-xs font-semibold transition-all cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Minify</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!input.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setInput('');
                setError(null);
              }}
              className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
              title="Clear"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Indicator */}
        {error ? (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-mono">{error}</span>
          </div>
        ) : input.trim() ? (
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Valid JSON</span>
          </div>
        ) : null}

        <label htmlFor="json-editor-textarea" className="sr-only">JSON Editor</label>
        <textarea
          id="json-editor-textarea"
          rows={16}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            try {
              if (e.target.value.trim()) {
                JSON.parse(e.target.value);
                setError(null);
              }
            } catch (err: any) {
              setError(err.message);
            }
          }}
          placeholder="Paste or type raw JSON here..."
          className="w-full p-4 rounded-2xl bg-[#11182C] border border-white/[0.08] text-xs sm:text-sm text-emerald-300 focus:outline-none focus:border-purple-500 font-mono resize-y leading-relaxed"
          spellCheck={false}
        />
      </div>
    </div>
  );
};
