import React, { useState } from 'react';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { CaseSensitive, Copy, Check, Sparkles, Trash2 } from 'lucide-react';

export const TextCaseConverter: React.FC = () => {
  const [text, setText] = useState<string>('Hello World! Transform any text into multiple developer and editorial cases in real-time.');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toTitleCase = (str: string) => {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };

  const toSentenceCase = (str: string) => {
    return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
  };

  const toCamelCase = (str: string) => {
    return str
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/^[A-Z]/, (c) => c.toLowerCase());
  };

  const toPascalCase = (str: string) => {
    return str
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/^[a-z]/, (c) => c.toUpperCase());
  };

  const toSnakeCase = (str: string) => {
    return str
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  };

  const toKebabCase = (str: string) => {
    return str
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const toConstantCase = (str: string) => {
    return str
      .trim()
      .toUpperCase()
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  };

  const cases = [
    { id: 'upper', name: 'UPPERCASE', value: text.toUpperCase() },
    { id: 'lower', name: 'lowercase', value: text.toLowerCase() },
    { id: 'title', name: 'Title Case', value: toTitleCase(text) },
    { id: 'sentence', name: 'Sentence case', value: toSentenceCase(text) },
    { id: 'camel', name: 'camelCase', value: toCamelCase(text) },
    { id: 'pascal', name: 'PascalCase', value: toPascalCase(text) },
    { id: 'snake', name: 'snake_case', value: toSnakeCase(text) },
    { id: 'kebab', name: 'kebab-case', value: toKebabCase(text) },
    { id: 'constant', name: 'CONSTANT_CASE', value: toConstantCase(text) },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      {/* Input Text Area */}
      <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <CaseSensitive className="w-4 h-4 text-purple-400" />
            Input Text
          </h2>
          {text && (
            <button
              onClick={() => setText('')}
              className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer text-xs flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        <label htmlFor="case-converter-textarea" className="sr-only">Input text to convert case</label>
        <textarea
          id="case-converter-textarea"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
          className="w-full p-4 rounded-2xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 font-sans"
        />
      </div>

      {/* Conversion Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {cases.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-[#0D1224] border border-white/[0.08] hover:border-purple-500/40 transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400">{item.name}</span>
              <button
                onClick={() => copyToClipboard(item.value, item.id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] group-hover:bg-purple-600/20 text-slate-300 group-hover:text-purple-300 text-xs font-semibold transition-all cursor-pointer"
              >
                {copiedKey === item.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#11182C] border border-white/[0.04] text-xs sm:text-sm text-slate-200 font-mono line-clamp-2 select-all">
              {item.value || '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
