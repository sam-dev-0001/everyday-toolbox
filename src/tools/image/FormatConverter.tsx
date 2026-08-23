import React, { useState } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { ArrowRightLeft, Sparkles, RefreshCw, Sliders } from 'lucide-react';

interface FormatConverterProps {
  sourceFormat?: 'jpg' | 'png' | 'webp' | 'any';
  targetFormatDefault?: 'image/png' | 'image/jpeg' | 'image/webp';
  toolTitle?: string;
}

export const FormatConverter: React.FC<FormatConverterProps> = ({
  sourceFormat = 'any',
  targetFormatDefault = 'image/png',
  toolTitle = 'Image Format Converter',
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [targetMime, setTargetMime] = useState<'image/png' | 'image/jpeg' | 'image/webp'>(targetFormatDefault);
  const [quality, setQuality] = useState<number>(90);
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
      setConvertedUrl(null);
      setConvertedBlob(null);
    }
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    setFile(null);
    setPreviewUrl(null);
    setConvertedUrl(null);
    setConvertedBlob(null);
  };

  const convertFormat = async () => {
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

      // If converting transparent PNG/WebP to JPG, fill background color
      if (targetMime === 'image/jpeg') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      const blob = await new Promise<Blob | null>((res) =>
        canvas.toBlob((b) => res(b), targetMime, quality / 100)
      );

      if (blob) {
        const url = URL.createObjectURL(blob);
        setConvertedBlob(blob);
        setConvertedUrl(url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!convertedUrl || !file) return;
    const a = document.createElement('a');
    a.href = convertedUrl;
    const ext = targetMime === 'image/png' ? 'png' : targetMime === 'image/webp' ? 'webp' : 'jpg';
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    a.download = `${nameWithoutExt}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const targetExtension = targetMime === 'image/png' ? 'PNG' : targetMime === 'image/webp' ? 'WebP' : 'JPG';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <UploadZone
        accept="image/*"
        files={file ? [file] : []}
        previewUrl={previewUrl}
        onFilesSelected={handleFilesSelected}
        onClearFiles={handleClear}
        title={`Choose image to convert to ${targetExtension}`}
        subtitle="Processed safely inside your browser memory"
      />

      {file && previewUrl && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              Conversion Options
            </h2>
            <span className="text-xs text-slate-400">
              Input: <strong className="text-white">{file.type || 'image'}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Target Format */}
            <div className="space-y-2">
              <label htmlFor="format-target-select" className="text-xs font-semibold text-slate-300 block">Target Format</label>
              <select
                id="format-target-select"
                value={targetMime}
                onChange={(e) => setTargetMime(e.target.value as 'image/png' | 'image/jpeg' | 'image/webp')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="image/png">PNG (Lossless & Transparency Support)</option>
                <option value="image/jpeg">JPG / JPEG (Standard Compact Photo)</option>
                <option value="image/webp">WebP (Modern Web Efficiency)</option>
              </select>
            </div>

            {/* Quality or Background Color depending on format */}
            {targetMime === 'image/jpeg' ? (
              <div className="space-y-2">
                <label htmlFor="bg-color-picker" className="text-xs font-semibold text-slate-300 block">
                  Background Color (For transparent source)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="bg-color-picker"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-300 uppercase">{bgColor}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <label htmlFor="format-quality-slider">Encoding Quality</label>
                  <span className="text-purple-400 font-mono">{quality}%</span>
                </div>
                <input
                  id="format-quality-slider"
                  type="range"
                  min="20"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full h-2 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={convertFormat}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-500/20"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Converting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Convert to {targetExtension}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Converted Output */}
      {convertedUrl && (
        <div className="rounded-3xl bg-[#0D1224] border border-emerald-500/30 p-5 sm:p-7 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-base">Converted File Ready</span>
            <span className="text-xs font-mono text-emerald-400 uppercase">
              {targetExtension} Format
            </span>
          </div>

          <div className="rounded-2xl overflow-hidden bg-[#070A14] border border-white/[0.06] flex items-center justify-center p-4">
            <img src={convertedUrl} alt="Converted output" className="max-h-72 object-contain rounded-lg shadow-md" />
          </div>

          <DownloadButton onClick={handleDownload} label={`Download ${targetExtension}`} />
        </div>
      )}
    </div>
  );
};
