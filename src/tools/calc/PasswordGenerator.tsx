import React, { useState, useEffect } from 'react';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { KeyRound, Copy, Check, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';

export const PasswordGenerator: React.FC = () => {
  const [length, setLength] = useState<number>(16);
  const [uppercase, setUppercase] = useState<boolean>(true);
  const [lowercase, setLowercase] = useState<boolean>(true);
  const [numbers, setNumbers] = useState<boolean>(true);
  const [symbols, setSymbols] = useState<boolean>(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(false);

  const [password, setPassword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const generatePassword = () => {
    let charset = '';
    const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
    const numChars = '0123456789';
    const symChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (uppercase) charset += upperChars;
    if (lowercase) charset += lowerChars;
    if (numbers) charset += numChars;
    if (symbols) charset += symChars;

    if (excludeAmbiguous) {
      charset = charset.replace(/[il1Lo0O]/g, '');
    }

    if (!charset) charset = lowerChars;

    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset[array[i] % charset.length];
    }
    setPassword(result);
  };

  useEffect(() => {
    generatePassword();
  }, [length, uppercase, lowercase, numbers, symbols, excludeAmbiguous]);

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Strength score
  const getStrength = (): { label: string; color: string; percent: number } => {
    let score = 0;
    if (length >= 12) score += 25;
    if (length >= 16) score += 25;
    if (uppercase && lowercase) score += 20;
    if (numbers) score += 15;
    if (symbols) score += 15;

    if (score < 40) return { label: 'Weak', color: 'bg-rose-500', percent: score };
    if (score < 75) return { label: 'Moderate', color: 'bg-amber-500', percent: score };
    return { label: 'Extremely Strong', color: 'bg-emerald-500', percent: score };
  };

  const strength = getStrength();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">Secure Password Generator</h2>
          </div>
          <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-4 h-4" /> Client-Side Entropy
          </span>
        </div>

        {/* Generated Password Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#070A14] border border-white/[0.08] flex items-center justify-between gap-3">
          <span className="font-mono text-base sm:text-xl font-bold text-emerald-400 tracking-wider break-all select-all">
            {password}
          </span>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={generatePassword}
              aria-label="Generate new password"
              className="p-2.5 rounded-xl bg-[#11182C] text-slate-300 hover:text-white border border-white/[0.06] transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-purple-600/30"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Strength meter */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-300">
            <span>Password Strength</span>
            <span className="text-white font-mono">{strength.label}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className={`h-full ${strength.color} transition-all duration-300`}
              style={{ width: `${strength.percent}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <label htmlFor="pass-len-slider">Password Length</label>
              <span className="text-purple-400 font-mono font-bold text-sm">{length} characters</span>
            </div>
            <input
              id="pass-len-slider"
              type="range"
              min="8"
              max="64"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full h-2 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Uppercase (A-Z)', state: uppercase, set: setUppercase },
              { label: 'Lowercase (a-z)', state: lowercase, set: setLowercase },
              { label: 'Numbers (0-9)', state: numbers, set: setNumbers },
              { label: 'Symbols (!@#$)', state: symbols, set: setSymbols },
              { label: 'Exclude Ambiguous (l,1,O,0)', state: excludeAmbiguous, set: setExcludeAmbiguous },
            ].map((opt, idx) => (
              <label
                key={idx}
                className={`p-3 rounded-2xl border flex items-center gap-2 cursor-pointer transition-all ${
                  opt.state
                    ? 'bg-purple-600/15 border-purple-500/50 text-purple-300'
                    : 'bg-[#11182C] border-white/[0.04] text-slate-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={opt.state}
                  onChange={(e) => opt.set(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-0 cursor-pointer accent-purple-500"
                />
                <span className="text-xs font-semibold">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
