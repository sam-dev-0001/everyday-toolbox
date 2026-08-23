import React, { useState } from 'react';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { Palette, Copy, Check, Sparkles } from 'lucide-react';

export const ColorConverter: React.FC = () => {
  const [hex, setHex] = useState<string>('#6366F1');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Convert Hex to RGB
  const hexToRgb = (hexStr: string) => {
    let clean = hexStr.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map((c) => c + c).join('');
    }
    const num = parseInt(clean, 16);
    if (isNaN(num) || clean.length !== 6) return { r: 99, g: 102, b: 241 };
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const rgb = hexToRgb(hex);

  // RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  // RGB to CMYK
  const rgbToCmyk = (r: number, g: number, b: number) => {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, Math.min(m, y));

    if (k === 1) {
      return { c: 0, m: 0, y: 0, k: 100 };
    }

    c = Math.round(((c - k) / (1 - k)) * 100);
    m = Math.round(((m - k) / (1 - k)) * 100);
    y = Math.round(((y - k) / (1 - k)) * 100);
    k = Math.round(k * 100);

    return { c, m, y, k };
  };

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

  const formats = [
    { id: 'hex', label: 'HEX', value: hex.toUpperCase() },
    { id: 'rgb', label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { id: 'hsl', label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { id: 'cmyk', label: 'CMYK', value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
    { id: 'css-var', label: 'CSS Variable', value: `--color-primary: ${hex.toUpperCase()};` },
  ];

  const copyToClipboard = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">Color Space Converter</h2>
          </div>
        </div>

        {/* Interactive Color Box */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          <div
            className="h-32 sm:h-40 rounded-2xl shadow-2xl border border-white/20 flex flex-col items-center justify-center p-4 text-center transition-all"
            style={{ backgroundColor: hex }}
          >
            <span
              className="text-lg font-black font-mono px-3 py-1 rounded-xl bg-black/40 backdrop-blur-md text-white"
            >
              {hex.toUpperCase()}
            </span>
          </div>

          <div className="sm:col-span-2 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="hex-code-input" className="text-xs font-semibold text-slate-300 block">Pick or Enter HEX Color</label>
              <div className="flex items-center gap-3">
                <input
                  id="color-picker-input"
                  aria-label="Pick color visually"
                  type="color"
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  className="w-12 h-12 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <input
                  id="hex-code-input"
                  type="text"
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  placeholder="#6366F1"
                  className="w-full px-4 py-3 rounded-2xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 font-mono uppercase"
                />
              </div>
            </div>

            {/* Quick palette swatches */}
            <div className="flex items-center gap-2 pt-1">
              {['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444', '#14B8A6'].map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => setHex(swatch)}
                  className="w-6 h-6 rounded-full border border-white/20 transition-transform hover:scale-110 cursor-pointer"
                  style={{ backgroundColor: swatch }}
                  title={swatch}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Converted Formats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          {formats.map((fmt) => (
            <div
              key={fmt.id}
              className="p-4 rounded-2xl bg-[#11182C] border border-white/[0.04] space-y-1.5 hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400">{fmt.label}</span>
                <button
                  onClick={() => copyToClipboard(fmt.value, fmt.id)}
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-white cursor-pointer"
                >
                  {copiedKey === fmt.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs sm:text-sm font-mono text-slate-100 select-all">{fmt.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
