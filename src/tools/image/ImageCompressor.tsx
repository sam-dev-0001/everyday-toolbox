import React, { useState } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { Sliders, Sparkles, Check, ArrowRight, RefreshCw } from 'lucide-react';

export const ImageCompressor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(75);
  const [targetKb, setTargetKb] = useState<string>('');
  const [maxDimension, setMaxDimension] = useState<number>(1920);
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/webp' | 'image/png'>('image/jpeg');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number>(0);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
      setCompressedBlob(null);
      setCompressedUrl(null);
    }
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setFile(null);
    setPreviewUrl(null);
    setCompressedBlob(null);
    setCompressedUrl(null);
  };

  const compressImage = async () => {
    if (!file || !previewUrl) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.src = previewUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Calculate scaled dimensions
      let width = img.width;
      let height = img.height;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not supported');

      // Draw background white for jpeg if needed
      if (outputFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Quality compression calculation
      let currentQuality = quality / 100;
      const targetBytes = targetKb ? parseInt(targetKb, 10) * 1024 : 0;

      let blob = await new Promise<Blob | null>((res) =>
        canvas.toBlob((b) => res(b), outputFormat, currentQuality)
      );

      // If target KB is specified, refine quality iteratively
      if (targetBytes > 0 && blob && blob.size > targetBytes && outputFormat !== 'image/png') {
        let minQ = 0.1;
        let maxQ = currentQuality;
        for (let i = 0; i < 5; i++) {
          const testQ = (minQ + maxQ) / 2;
          const testBlob = await new Promise<Blob | null>((res) =>
            canvas.toBlob((b) => res(b), outputFormat, testQ)
          );
          if (testBlob) {
            blob = testBlob;
            if (testBlob.size > targetBytes) {
              maxQ = testQ;
            } else {
              minQ = testQ;
            }
          }
        }
      }

      if (blob) {
        const url = URL.createObjectURL(blob);
        setCompressedBlob(blob);
        setCompressedUrl(url);
        setCompressedSize(blob.size);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedUrl || !file) return;
    const a = document.createElement('a');
    a.href = compressedUrl;
    const ext = outputFormat === 'image/webp' ? 'webp' : outputFormat === 'image/png' ? 'png' : 'jpg';
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    a.download = `${nameWithoutExt}-compressed.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const savingsPercent = file && compressedSize > 0
    ? Math.max(0, Math.round(((file.size - compressedSize) / file.size) * 100))
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      {/* Upload Zone */}
      <UploadZone
        accept="image/jpeg,image/png,image/webp,image/avif"
        files={file ? [file] : []}
        previewUrl={previewUrl}
        onFilesSelected={handleFilesSelected}
        onClearFiles={handleClear}
        title="Drop your image here"
        subtitle="Supports JPG, PNG, WebP up to 50MB"
        fileHint="Processed 100% locally in your browser memory"
      />

      {/* Settings & Compression Controls */}
      {file && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              Compression Settings
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Original: <strong className="text-white">{formatSize(file.size)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Quality Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <label htmlFor="quality-slider" className="text-slate-300">Image Quality</label>
                <span className="text-purple-400 font-mono">{quality}%</span>
              </div>
              <input
                id="quality-slider"
                type="range"
                min="10"
                max="95"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full h-2 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Smaller size</span>
                <span>Balanced (Recommended)</span>
                <span>Best quality</span>
              </div>
            </div>

            {/* Optional Target KB */}
            <div className="space-y-2">
              <label htmlFor="target-kb-input" className="text-xs font-semibold text-slate-300 block">
                Target Size (Optional)
              </label>
              <div className="relative">
                <input
                  id="target-kb-input"
                  type="number"
                  placeholder="e.g. 100"
                  value={targetKb}
                  onChange={(e) => setTargetKb(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
                />
                <span className="absolute right-3 top-2 text-xs font-mono text-slate-400">KB</span>
              </div>
              <span className="text-[10px] text-slate-400">
                Compresses image until it fits under your specified KB limit.
              </span>
            </div>

            {/* Output Format */}
            <div className="space-y-2">
              <label htmlFor="output-format-select" className="text-xs font-semibold text-slate-300 block">Output Format</label>
              <select
                id="output-format-select"
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as 'image/jpeg' | 'image/webp' | 'image/png')}
                className="w-full px-3.5 py-2 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="image/jpeg">JPG (Smallest size & universal)</option>
                <option value="image/webp">WebP (Modern web & high efficiency)</option>
                <option value="image/png">PNG (Lossless & crisp)</option>
              </select>
            </div>

            {/* Max Dimension Cap */}
            <div className="space-y-2">
              <label htmlFor="max-res-select" className="text-xs font-semibold text-slate-300 block">Max Resolution</label>
              <select
                id="max-res-select"
                value={maxDimension}
                onChange={(e) => setMaxDimension(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value={1920}>Full HD (1920px width/height)</option>
                <option value={1280}>HD (1280px width/height)</option>
                <option value={800}>Compact (800px width/height)</option>
                <option value={4000}>Original Resolution</option>
              </select>
            </div>
          </div>

          {/* Compress Trigger Button */}
          <button
            type="button"
            onClick={compressImage}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-500/20"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Compressing Image...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Compress Now</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Result Card & Download */}
      {compressedBlob && file && (
        <div className="rounded-3xl bg-gradient-to-b from-[#11182C] to-[#0D1224] border border-emerald-500/30 p-5 sm:p-7 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base">Compression Completed</span>
            </div>
            {savingsPercent > 0 && (
              <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {savingsPercent}% Smaller
              </span>
            )}
          </div>

          {/* Metrics comparison */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#070A14] border border-white/[0.06] text-center">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400">Original Size</span>
              <p className="text-sm sm:text-base font-mono font-bold text-slate-300">
                {formatSize(file.size)}
              </p>
            </div>

            <div className="flex items-center justify-center text-purple-400">
              <ArrowRight className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-emerald-400 font-semibold">New Size</span>
              <p className="text-sm sm:text-base font-mono font-bold text-emerald-400">
                {formatSize(compressedSize)}
              </p>
            </div>
          </div>

          {/* Download Action */}
          <DownloadButton
            onClick={handleDownload}
            label="Download Compressed Image"
            sublabel={`Saved ${formatSize(Math.max(0, file.size - compressedSize))}`}
          />

          <AdPlaceholder slot="result-page" />
        </div>
      )}
    </div>
  );
};
