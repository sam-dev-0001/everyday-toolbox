import React, { useState, useEffect } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { Maximize2, Lock, Unlock, RefreshCw } from 'lucide-react';

export const ImageResizer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);

  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [lockRatio, setLockRatio] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/png');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [resizedSize, setResizedSize] = useState<number>(0);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);

      const img = new Image();
      img.src = url;
      img.onload = () => {
        setOriginalWidth(img.width);
        setOriginalHeight(img.height);
        setWidth(img.width);
        setHeight(img.height);
        setAspectRatio(img.width / img.height);
      };

      setResizedUrl(null);
    }
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (resizedUrl) URL.revokeObjectURL(resizedUrl);
    setFile(null);
    setPreviewUrl(null);
    setResizedUrl(null);
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockRatio && aspectRatio > 0) {
      setHeight(Math.round(val / aspectRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockRatio && aspectRatio > 0) {
      setWidth(Math.round(val * aspectRatio));
    }
  };

  const handleScalePreset = (percent: number) => {
    if (originalWidth > 0 && originalHeight > 0) {
      const factor = percent / 100;
      setWidth(Math.round(originalWidth * factor));
      setHeight(Math.round(originalHeight * factor));
    }
  };

  const resizeImage = async () => {
    if (!file || !previewUrl || width <= 0 || height <= 0) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.src = previewUrl;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // High quality smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (format === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      const blob = await new Promise<Blob | null>((res) =>
        canvas.toBlob((b) => res(b), format, 0.92)
      );

      if (blob) {
        const url = URL.createObjectURL(blob);
        setResizedUrl(url);
        setResizedSize(blob.size);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resizedUrl || !file) return;
    const a = document.createElement('a');
    a.href = resizedUrl;
    const ext = format === 'image/webp' ? 'webp' : format === 'image/jpeg' ? 'jpg' : 'png';
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    a.download = `${nameWithoutExt}-${width}x${height}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <UploadZone
        accept="image/*"
        files={file ? [file] : []}
        previewUrl={previewUrl}
        onFilesSelected={handleFilesSelected}
        onClearFiles={handleClear}
        title="Choose image to resize"
        subtitle="Change width & height in exact pixels or percentage"
      />

      {file && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-purple-400" />
              Resize Dimensions
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Original: {originalWidth} × {originalHeight} px
            </span>
          </div>

          {/* Quick presets */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">Quick Scale Presets</span>
            <div className="flex flex-wrap gap-2">
              {[25, 50, 75, 100, 150, 200].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handleScalePreset(pct)}
                  className="px-3 py-1.5 rounded-xl bg-[#11182C] hover:bg-purple-600/20 border border-white/[0.06] hover:border-purple-500/40 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Width */}
            <div className="space-y-2">
              <label htmlFor="image-width-input" className="text-xs font-semibold text-slate-300 block">Width (px)</label>
              <input
                id="image-width-input"
                type="number"
                min="1"
                max="10000"
                value={width || ''}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Height */}
            <div className="space-y-2">
              <label htmlFor="image-height-input" className="text-xs font-semibold text-slate-300 block">Height (px)</label>
              <input
                id="image-height-input"
                type="number"
                min="1"
                max="10000"
                value={height || ''}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Lock Aspect Ratio */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setLockRatio(!lockRatio)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  lockRatio
                    ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                    : 'bg-[#11182C] text-slate-400 border-white/[0.08]'
                }`}
              >
                {lockRatio ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>Maintain Aspect Ratio ({aspectRatio.toFixed(2)})</span>
              </button>
            </div>

            {/* Format selection */}
            <div className="space-y-1">
              <label htmlFor="image-format-select" className="text-xs font-semibold text-slate-300 block">Save Format</label>
              <select
                id="image-format-select"
                value={format}
                onChange={(e) => setFormat(e.target.value as 'image/jpeg' | 'image/png' | 'image/webp')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="image/png">PNG (Lossless & transparent)</option>
                <option value="image/jpeg">JPG (Standard photo)</option>
                <option value="image/webp">WebP (Optimized web)</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={resizeImage}
            disabled={isProcessing || width <= 0 || height <= 0}
            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-500/20"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Resizing Image...</span>
              </>
            ) : (
              <span>Apply Resize ({width} × {height} px)</span>
            )}
          </button>
        </div>
      )}

      {/* Result & Download */}
      {resizedUrl && (
        <div className="rounded-3xl bg-[#0D1224] border border-emerald-500/30 p-5 sm:p-7 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-base">Resized Image Ready</span>
            <span className="text-xs font-mono text-emerald-400">
              {width} × {height} px
            </span>
          </div>

          <div className="rounded-xl overflow-hidden bg-[#070A14] border border-white/[0.06] flex items-center justify-center p-3">
            <img src={resizedUrl} alt="Resized output" className="max-h-72 object-contain rounded-lg" />
          </div>

          <DownloadButton onClick={handleDownload} label="Download Resized Image" />
        </div>
      )}
    </div>
  );
};
