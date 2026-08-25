import React, { useState } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { Stamp, Sparkles, RefreshCw } from 'lucide-react';

export const ImageWatermark: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [text, setText] = useState<string>('© Everyday Tool');
  const [fontSize, setFontSize] = useState<number>(36);
  const [opacity, setOpacity] = useState<number>(60);
  const [color, setColor] = useState<string>('#FFFFFF');
  const [position, setPosition] = useState<'tl' | 'tc' | 'tr' | 'ml' | 'mc' | 'mr' | 'bl' | 'bc' | 'br'>('br');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
      setOutputUrl(null);
    }
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setFile(null);
    setPreviewUrl(null);
    setOutputUrl(null);
  };

  const applyWatermark = async () => {
    if (!file || !previewUrl) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.src = previewUrl;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      ctx.drawImage(img, 0, 0);

      // Watermark text styling
      ctx.save();
      ctx.globalAlpha = opacity / 100;
      ctx.fillStyle = color;
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      const padding = 30;
      const metrics = ctx.measureText(text);
      const textWidth = metrics.width;
      const textHeight = fontSize;

      let x = padding;
      let y = padding + textHeight;

      if (position === 'tc') x = (canvas.width - textWidth) / 2;
      if (position === 'tr') x = canvas.width - textWidth - padding;
      if (position === 'ml') { x = padding; y = (canvas.height + textHeight) / 2; }
      if (position === 'mc') { x = (canvas.width - textWidth) / 2; y = (canvas.height + textHeight) / 2; }
      if (position === 'mr') { x = canvas.width - textWidth - padding; y = (canvas.height + textHeight) / 2; }
      if (position === 'bl') { x = padding; y = canvas.height - padding; }
      if (position === 'bc') { x = (canvas.width - textWidth) / 2; y = canvas.height - padding; }
      if (position === 'br') { x = canvas.width - textWidth - padding; y = canvas.height - padding; }

      ctx.fillText(text, x, y);
      ctx.restore();

      const blob = await new Promise<Blob | null>((res) =>
        canvas.toBlob((b) => res(b), 'image/png')
      );

      if (blob) {
        setOutputUrl(URL.createObjectURL(blob));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!outputUrl || !file) return;
    const a = document.createElement('a');
    a.href = outputUrl;
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    a.download = `${nameWithoutExt}-watermarked.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const positions: Array<{ id: typeof position; label: string }> = [
    { id: 'tl', label: 'Top Left' },
    { id: 'tc', label: 'Top Center' },
    { id: 'tr', label: 'Top Right' },
    { id: 'ml', label: 'Middle Left' },
    { id: 'mc', label: 'Center' },
    { id: 'mr', label: 'Middle Right' },
    { id: 'bl', label: 'Bottom Left' },
    { id: 'bc', label: 'Bottom Center' },
    { id: 'br', label: 'Bottom Right' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <UploadZone
        accept="image/*"
        files={file ? [file] : []}
        previewUrl={previewUrl}
        onFilesSelected={handleFilesSelected}
        onClearFiles={handleClear}
        title="Choose image to add watermark"
        subtitle="Protect copyright with custom text, positioning, and opacity"
      />

      {file && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Stamp className="w-4 h-4 text-purple-400" />
              Watermark Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Watermark text */}
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="watermark-text-input" className="text-xs font-semibold text-slate-300 block">Watermark Text</label>
              <input
                id="watermark-text-input"
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. © Your Name / Brand"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Position Grid 3x3 */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Placement Grid</span>
              <div className="grid grid-cols-3 gap-1.5 p-2 bg-[#11182C] rounded-2xl border border-white/[0.06] max-w-[240px]">
                {positions.map((pos) => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => setPosition(pos.id)}
                    className={`h-10 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                      position === pos.id
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-[#0D1224] text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {pos.id.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Opacity and Font size */}
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <label htmlFor="wm-opacity-slider">Opacity</label>
                  <span className="text-purple-400 font-mono">{opacity}%</span>
                </div>
                <input
                  id="wm-opacity-slider"
                  type="range"
                  min="10"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full h-2 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <label htmlFor="wm-font-size-slider">Font Size</label>
                  <span className="text-purple-400 font-mono">{fontSize}px</span>
                </div>
                <input
                  id="wm-font-size-slider"
                  type="range"
                  min="16"
                  max="120"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-2 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={applyWatermark}
            disabled={isProcessing || !text.trim()}
            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-500/20"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Applying Watermark...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Apply Watermark</span>
              </>
            )}
          </button>
        </div>
      )}

      {outputUrl && (
        <div className="rounded-3xl bg-[#0D1224] border border-emerald-500/30 p-5 sm:p-7 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-base">Watermarked Photo Ready</span>
            <span className="text-xs font-semibold text-emerald-400">PNG Format</span>
          </div>

          <div className="rounded-2xl overflow-hidden bg-[#070A14] border border-white/[0.06] flex items-center justify-center p-4">
            <img src={outputUrl} alt="Watermarked output" className="max-h-80 object-contain rounded-lg shadow-md" />
          </div>

          <DownloadButton onClick={handleDownload} label="Download Watermarked Image" />
        </div>
      )}
    </div>
  );
};
