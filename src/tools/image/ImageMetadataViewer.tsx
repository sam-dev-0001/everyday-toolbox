import React, { useState } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { Info, Image, HardDrive, Maximize2, Hash, FileCode, CheckCircle2 } from 'lucide-react';

export const ImageMetadataViewer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{
    width: number;
    height: number;
    aspectRatio: string;
    megaPixels: string;
    fileSizeFormatted: string;
    mimeType: string;
    lastModified: string;
    hasAlpha: boolean;
  } | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);

      const img = new window.Image();
      img.src = url;
      img.onload = () => {
        const mp = ((img.width * img.height) / 1000000).toFixed(2);
        const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
        const divisor = gcd(img.width, img.height);
        const ratio = `${img.width / divisor}:${img.height / divisor}`;

        // Check alpha channel
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(100, img.width);
        canvas.height = Math.min(100, img.height);
        const ctx = canvas.getContext('2d');
        let hasAlpha = false;
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          for (let i = 3; i < imgData.length; i += 4) {
            if (imgData[i] < 255) {
              hasAlpha = true;
              break;
            }
          }
        }

        setMetadata({
          width: img.width,
          height: img.height,
          aspectRatio: ratio,
          megaPixels: mp,
          fileSizeFormatted: formatBytes(selected.size),
          mimeType: selected.type || 'Unknown MIME',
          lastModified: new Date(selected.lastModified).toLocaleString(),
          hasAlpha,
        });
      };
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setMetadata(null);
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
        title="Upload image to inspect metadata"
        subtitle="Inspect resolution, aspect ratio, color depth, transparency, and MIME headers"
      />

      {metadata && file && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-400" />
              Technical Image Properties
            </h2>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Valid Image File
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-[#11182C] border border-white/[0.04] space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Maximize2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Resolution</span>
              </div>
              <p className="text-base font-bold text-white font-mono">
                {metadata.width} × {metadata.height} px
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#11182C] border border-white/[0.04] space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Image className="w-3.5 h-3.5 text-pink-400" />
                <span>Megapixels</span>
              </div>
              <p className="text-base font-bold text-white font-mono">
                {metadata.megaPixels} MP
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#11182C] border border-white/[0.04] space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Hash className="w-3.5 h-3.5 text-blue-400" />
                <span>Aspect Ratio</span>
              </div>
              <p className="text-base font-bold text-white font-mono">
                {metadata.aspectRatio}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#11182C] border border-white/[0.04] space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                <span>File Size</span>
              </div>
              <p className="text-base font-bold text-white font-mono">
                {metadata.fileSizeFormatted} ({file.size.toLocaleString()} bytes)
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#11182C] border border-white/[0.04] space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>MIME Type</span>
              </div>
              <p className="text-base font-bold text-white font-mono truncate">
                {metadata.mimeType}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#11182C] border border-white/[0.04] space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Transparency / Alpha</span>
              </div>
              <p className="text-base font-bold text-white font-mono">
                {metadata.hasAlpha ? 'Yes (Alpha Channel)' : 'No (Opaque)'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
