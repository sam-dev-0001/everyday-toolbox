import React, { useState } from 'react';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { Binary, Copy, Check, Trash2, ArrowDownUp, Upload, FileCode } from 'lucide-react';

export const Base64Encoder: React.FC = () => {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState<string>('Everyday Toolbox — Secure, Fast, 100% Client-Side');
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getResult = (): string => {
    if (!input) {
      return '';
    }
    try {
      if (mode === 'encode') {
        // UTF-8 friendly base64 encoding
        const bytes = new TextEncoder().encode(input);
        const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
        return btoa(binString);
      } else {
        // base64 decode
        const cleanInput = input.trim().replace(/^data:.*?;base64,/, '');
        const binString = atob(cleanInput);
        const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
        return new TextDecoder().decode(bytes);
      }
    } catch (err: any) {
      return 'Invalid Base64 string for decoding.';
    }
  };

  const output = getResult();

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setInput(reader.result);
          setMode('decode');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <Binary className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">Base64 Encoder & Decoder</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode switch */}
            <div className="p-1 rounded-xl bg-[#11182C] border border-white/[0.06] flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMode('encode')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'encode' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Encode
              </button>
              <button
                type="button"
                onClick={() => setMode('decode')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'decode' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Decode
              </button>
            </div>

            <label className="p-2 rounded-xl bg-[#11182C] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.06] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">File to Base64</span>
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Input area */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
            <label htmlFor="base64-input-textarea">{mode === 'encode' ? 'Plain Text to Encode' : 'Base64 String to Decode'}</label>
            {input && (
              <button onClick={() => setInput('')} className="text-rose-400 hover:text-rose-300">
                Clear
              </button>
            )}
          </div>
          <textarea
            id="base64-input-textarea"
            rows={6}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter string here..."
            className="w-full p-4 rounded-2xl bg-[#11182C] border border-white/[0.08] text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500 font-mono resize-y"
          />
        </div>

        {/* Output area */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <label htmlFor="base64-output-textarea">{mode === 'encode' ? 'Base64 Encoded Result' : 'Decoded Plain Text'}</label>
            {output && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-600/20 text-purple-300 text-xs font-semibold cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>
          <textarea
            id="base64-output-textarea"
            rows={6}
            readOnly
            value={output}
            placeholder="Result will appear here..."
            className="w-full p-4 rounded-2xl bg-[#11182C] border border-white/[0.08] text-xs sm:text-sm text-emerald-300 focus:outline-none font-mono resize-y"
          />
        </div>
      </div>
    </div>
  );
};
