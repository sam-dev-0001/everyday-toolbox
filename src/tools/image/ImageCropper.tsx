import React, { useState, useRef, useEffect } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { Crop, Sparkles, RefreshCw } from 'lucide-react';

export const ImageCropper: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [aspectPreset, setAspectPreset] = useState<'free' | '1:1' | '4:3' | '16:9' | '9:16'>('free');

  // Crop box percentage values (0 to 100)
  const [cropX, setCropX] = useState<number>(10);
  const [cropY, setCropY] = useState<number>(10);
  const [cropWidth, setCropWidth] = useState<number>(80);
  const [cropHeight, setCropHeight] = useState<number>(80);

  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const imageRef = useRef<HTMLImageElement>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
      setCroppedUrl(null);
      setCropX(10);
      setCropY(10);
      setCropWidth(80);
      setCropHeight(80);
    }
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (croppedUrl) URL.revokeObjectURL(croppedUrl);
    setFile(null);
    setPreviewUrl(null);
    setCroppedUrl(null);
  };

  const applyPreset = (preset: 'free' | '1:1' | '4:3' | '16:9' | '9:16') => {
    setAspectPreset(preset);
    if (preset === '1:1') {
      const size = Math.min(cropWidth, cropHeight, 70);
      setCropWidth(size);
      setCropHeight(size);
    } else if (preset === '4:3') {
      setCropWidth(80);
      setCropHeight(60);
    } else if (preset === '16:9') {
      setCropWidth(90);
      setCropHeight(50.6);
    } else if (preset === '9:16') {
      setCropWidth(50.6);
      setCropHeight(90);
    }
  };

  const performCrop = async () => {
    if (!file || !previewUrl) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.src = previewUrl;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });

      const actualX = (cropX / 100) * img.width;
      const actualY = (cropY / 100) * img.height;
      const actualW = (cropWidth / 100) * img.width;
      const actualH = (cropHeight / 100) * img.height;

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(actualW));
      canvas.height = Math.max(1, Math.round(actualH));
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      ctx.drawImage(
        img,
        actualX,
        actualY,
        actualW,
        actualH,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const blob = await new Promise<Blob | null>((res) =>
        canvas.toBlob((b) => res(b), 'image/png')
      );

      if (blob) {
        const url = URL.createObjectURL(blob);
        setCroppedUrl(url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!croppedUrl || !file) return;
    const a = document.createElement('a');
    a.href = croppedUrl;
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    a.download = `${nameWithoutExt}-cropped.png`;
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
        title="Choose image to crop"
        subtitle="Cut out exact areas with precision aspect ratios"
      />

      {file && previewUrl && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Crop className="w-4 h-4 text-purple-400" />
              Crop Box Controls
            </h2>
            <span className="text-xs text-slate-400">
              Aspect Ratio: <strong className="text-purple-400 uppercase">{aspectPreset}</strong>
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">Aspect Ratio Presets</span>
            <div className="flex flex-wrap gap-2">
              {(['free', '1:1', '4:3', '16:9', '9:16'] as const).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    aspectPreset === preset
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
                      : 'bg-[#11182C] text-slate-300 border border-white/[0.06] hover:text-white'
                  }`}
                >
                  {preset === 'free' ? 'Custom Freeform' : preset}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Interactive Crop Area */}
          <div className="relative mx-auto rounded-2xl overflow-hidden bg-[#070A14] border border-white/[0.08] flex items-center justify-center p-4">
            <div className="relative inline-block max-h-96">
              <img
                ref={imageRef}
                src={previewUrl}
                alt="Source preview"
                className="max-h-96 w-auto block select-none"
              />

              {/* Crop box overlay */}
              <div
                className="absolute border-2 border-purple-400 bg-purple-500/15 shadow-2xl transition-all duration-75 pointer-events-none"
                style={{
                  left: `${cropX}%`,
                  top: `${cropY}%`,
                  width: `${cropWidth}%`,
                  height: `${cropHeight}%`,
                }}
              >
                {/* Corner markers */}
                <span className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-purple-500 rounded-sm" />
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-purple-500 rounded-sm" />
                <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-purple-500 rounded-sm" />
                <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-purple-500 rounded-sm" />
              </div>
            </div>
          </div>

          {/* Crop Box Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <label htmlFor="crop-w-slider">Crop Width</label>
                <span className="font-mono text-purple-400">{Math.round(cropWidth)}%</span>
              </div>
              <input
                id="crop-w-slider"
                type="range"
                min="10"
                max={100 - cropX}
                value={cropWidth}
                onChange={(e) => setCropWidth(Number(e.target.value))}
                className="w-full h-2 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <label htmlFor="crop-h-slider">Crop Height</label>
                <span className="font-mono text-purple-400">{Math.round(cropHeight)}%</span>
              </div>
              <input
                id="crop-h-slider"
                type="range"
                min="10"
                max={100 - cropY}
                value={cropHeight}
                onChange={(e) => setCropHeight(Number(e.target.value))}
                className="w-full h-2 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <label htmlFor="pos-x-slider">Horizontal Position</label>
                <span className="font-mono text-purple-400">{Math.round(cropX)}%</span>
              </div>
              <input
                id="pos-x-slider"
                type="range"
                min="0"
                max={100 - cropWidth}
                value={cropX}
                onChange={(e) => setCropX(Number(e.target.value))}
                className="w-full h-2 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <label htmlFor="pos-y-slider">Vertical Position</label>
                <span className="font-mono text-purple-400">{Math.round(cropY)}%</span>
              </div>
              <input
                id="pos-y-slider"
                type="range"
                min="0"
                max={100 - cropHeight}
                value={cropY}
                onChange={(e) => setCropY(Number(e.target.value))}
                className="w-full h-2 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={performCrop}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-500/20"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Cropping...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Crop Selection</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Cropped Output */}
      {croppedUrl && (
        <div className="rounded-3xl bg-[#0D1224] border border-emerald-500/30 p-5 sm:p-7 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-base">Cropped Result Ready</span>
            <span className="text-xs font-semibold text-emerald-400">PNG Lossless</span>
          </div>

          <div className="rounded-2xl overflow-hidden bg-[#070A14] border border-white/[0.06] flex items-center justify-center p-4">
            <img src={croppedUrl} alt="Cropped output" className="max-h-72 object-contain rounded-lg shadow-lg" />
          </div>

          <DownloadButton onClick={handleDownload} label="Download Cropped Image" />
        </div>
      )}
    </div>
  );
};
