import React, { useState, useEffect, useRef } from 'react';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { Barcode as BarcodeIcon, Sliders, Download, AlertCircle } from 'lucide-react';
import JsBarcode from 'jsbarcode';

export const BarcodeGenerator: React.FC = () => {
  const [value, setValue] = useState<string>('978020137962');
  const [format, setFormat] = useState<'CODE128' | 'EAN13' | 'UPC' | 'CODE39' | 'ITF' | 'pharmacode'>('CODE128');
  const [lineColor, setLineColor] = useState<string>('#000000');
  const [background, setBackground] = useState<string>('#FFFFFF');
  const [width, setWidth] = useState<number>(2);
  const [height, setHeight] = useState<number>(100);
  const [displayValue, setDisplayValue] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(16);

  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;

    try {
      JsBarcode(svgRef.current, value, {
        format,
        lineColor,
        background,
        width,
        height,
        displayValue,
        fontSize,
        font: 'monospace',
        margin: 15,
        valid: (valid) => {
          if (!valid) {
            setError(`Invalid value for ${format} standard`);
          } else {
            setError(null);
          }
        },
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Invalid barcode value');
    }
  }, [value, format, lineColor, background, width, height, displayValue, fontSize]);

  const handleDownloadPng = () => {
    if (!svgRef.current) return;
    const svgElement = svgRef.current;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(image, 0, 0);
        const png = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.download = `barcode-${format}-${value}.png`;
        a.href = png;
        a.click();
      }
    };
    image.src = blobURL;
  };

  const handleDownloadSvg = () => {
    if (!svgRef.current) return;
    const svgString = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `barcode-${format}-${value}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Form Inputs */}
        <div className="md:col-span-7 rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarcodeIcon className="w-5 h-5 text-purple-400" />
              Barcode Settings
            </h2>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="barcode-val-input" className="text-xs font-semibold text-slate-300 block">Barcode Value / Data</label>
            <input
              id="barcode-val-input"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. 123456789012"
              className="w-full px-4 py-3 rounded-2xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="barcode-symbology-select" className="text-xs font-semibold text-slate-300 block">Symbology Standard</label>
              <select
                id="barcode-symbology-select"
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="CODE128">CODE 128 (Universal / Alphanumeric)</option>
                <option value="EAN13">EAN-13 (International Retail)</option>
                <option value="UPC">UPC-A (North American Retail)</option>
                <option value="CODE39">CODE 39 (Logistics & Industrial)</option>
                <option value="ITF">ITF (Interleaved 2 of 5)</option>
                <option value="pharmacode">Pharmacode (Pharmaceutical)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="barcode-height-slider" className="text-xs font-semibold text-slate-300 block">Bar Height: {height}px</label>
              <input
                id="barcode-height-slider"
                type="range"
                min="40"
                max="180"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full h-2 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-purple-500 mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-4">
            <div className="space-y-1">
              <label htmlFor="bar-color-input" className="text-xs text-slate-400 block">Bar Color</label>
              <div className="flex items-center gap-2">
                <input
                  id="bar-color-input"
                  type="color"
                  value={lineColor}
                  onChange={(e) => setLineColor(e.target.value)}
                  className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                />
                <span className="text-xs font-mono text-slate-300 uppercase">{lineColor}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="bar-bg-input" className="text-xs text-slate-400 block">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  id="bar-bg-input"
                  type="color"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                />
                <span className="text-xs font-mono text-slate-300 uppercase">{background}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={displayValue}
                onChange={(e) => setDisplayValue(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-0 cursor-pointer accent-purple-500"
              />
              <span>Show Readable Text Below Bars</span>
            </label>
          </div>
        </div>

        {/* Live Barcode Preview */}
        <div className="md:col-span-5 rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 flex flex-col items-center justify-between space-y-6 shadow-xl text-center">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Live Barcode</h3>
            <p className="text-xs text-slate-400">Scannable 1D barcode standard</p>
          </div>

          {error ? (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <div
              className="p-4 rounded-3xl border border-white/10 shadow-2xl flex items-center justify-center transition-all overflow-hidden max-w-full"
              style={{ backgroundColor: background }}
            >
              <svg ref={svgRef} className="max-w-full" />
            </div>
          )}

          <div className="w-full space-y-2.5">
            <DownloadButton onClick={handleDownloadPng} label="Download Barcode (PNG)" />
            <button
              type="button"
              onClick={handleDownloadSvg}
              className="w-full py-2.5 rounded-xl bg-[#11182C] hover:bg-white/[0.06] text-slate-300 hover:text-white border border-white/[0.06] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Vector SVG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
