import React, { useState } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical, RefreshCw } from 'lucide-react';

interface RotateImageProps {
  initialMode?: 'rotate' | 'flip';
}

export const RotateImage: React.FC<RotateImageProps> = ({ initialMode = 'rotate' }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
      setOutputUrl(null);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
    }
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setFile(null);
    setPreviewUrl(null);
    setOutputUrl(null);
  };

  const rotateCW = () => setRotation((prev) => (prev + 90) % 360);
  const rotateCCW = () => setRotation((prev) => (prev - 90 + 360) % 360);
  const toggleFlipH = () => setFlipH((prev) => !prev);
  const toggleFlipV = () => setFlipV((prev) => !prev);

  const applyTransformation = async () => {
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
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      const isSideways = rotation === 90 || rotation === 270;
      canvas.width = isSideways ? img.height : img.width;
      canvas.height = isSideways ? img.width : img.height;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const blob = await new Promise<Blob | null>((res) =>
        canvas.toBlob((b) => res(b), 'image/png')
      );

      if (blob) {
        const url = URL.createObjectURL(blob);
        setOutputUrl(url);
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
    a.download = `${nameWithoutExt}-rotated.png`;
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
        title="Choose image to rotate or flip"
        subtitle="Rotate 90°, 180°, 270° or mirror horizontally & vertically"
      />

      {file && previewUrl && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-purple-400" />
              Orientation Controls
            </h2>
            <span className="text-xs font-mono text-purple-400">
              Angle: {rotation}° {flipH ? '• H-Flipped' : ''} {flipV ? '• V-Flipped' : ''}
            </span>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={rotateCCW}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#11182C] hover:bg-purple-600/20 border border-white/[0.08] hover:border-purple-500/40 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-purple-400" />
              <span>Rotate -90°</span>
            </button>

            <button
              type="button"
              onClick={rotateCW}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#11182C] hover:bg-purple-600/20 border border-white/[0.08] hover:border-purple-500/40 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
            >
              <RotateCw className="w-4 h-4 text-purple-400" />
              <span>Rotate +90°</span>
            </button>

            <button
              type="button"
              onClick={toggleFlipH}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                flipH
                  ? 'bg-purple-600 text-white border-purple-400'
                  : 'bg-[#11182C] hover:bg-purple-600/20 border-white/[0.08] text-slate-200'
              }`}
            >
              <FlipHorizontal className="w-4 h-4" />
              <span>Flip Horizontal</span>
            </button>

            <button
              type="button"
              onClick={toggleFlipV}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                flipV
                  ? 'bg-purple-600 text-white border-purple-400'
                  : 'bg-[#11182C] hover:bg-purple-600/20 border-white/[0.08] text-slate-200'
              }`}
            >
              <FlipVertical className="w-4 h-4" />
              <span>Flip Vertical</span>
            </button>
          </div>

          {/* Interactive Preview */}
          <div className="rounded-2xl bg-[#070A14] border border-white/[0.06] p-6 flex items-center justify-center min-h-[260px]">
            <div
              className="transition-all duration-300 max-h-72"
              style={{
                transform: `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
              }}
            >
              <img src={previewUrl} alt="Orientation preview" className="max-h-64 object-contain rounded-lg shadow-lg" />
            </div>
          </div>

          <button
            type="button"
            onClick={applyTransformation}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-500/20"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Save & Generate Image</span>
            )}
          </button>
        </div>
      )}

      {/* Output card */}
      {outputUrl && (
        <div className="rounded-3xl bg-[#0D1224] border border-emerald-500/30 p-5 sm:p-7 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-base">Finished Output Ready</span>
            <span className="text-xs font-semibold text-emerald-400">PNG Lossless</span>
          </div>

          <div className="rounded-2xl overflow-hidden bg-[#070A14] border border-white/[0.06] flex items-center justify-center p-4">
            <img src={outputUrl} alt="Transformed output" className="max-h-72 object-contain rounded-lg shadow-md" />
          </div>

          <DownloadButton onClick={handleDownload} label="Download Image" />
        </div>
      )}
    </div>
  );
};
