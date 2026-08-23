import React, { useState } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { Layers, RefreshCw, Check, Sparkles, FileArchive } from 'lucide-react';
import JSZip from 'jszip';

interface ProcessedImage {
  name: string;
  originalSize: number;
  compressedSize: number;
  blob: Blob;
}

export const BatchImageCompressor: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState<number>(75);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [results, setResults] = useState<ProcessedImage[]>([]);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles((prev) => [...prev, ...selectedFiles]);
    setResults([]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResults([]);
  };

  const handleClear = () => {
    setFiles([]);
    setResults([]);
  };

  const compressBatch = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress({ current: 0, total: files.length });
    const processed: ProcessedImage[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress({ current: i + 1, total: files.length });

        const url = URL.createObjectURL(file);
        const img = new Image();
        img.src = url;
        await new Promise((res, rej) => {
          img.onload = res;
          img.onerror = rej;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        ctx.drawImage(img, 0, 0);

        const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const blob = await new Promise<Blob | null>((res) =>
          canvas.toBlob((b) => res(b), format, quality / 100)
        );

        URL.revokeObjectURL(url);

        if (blob) {
          processed.push({
            name: file.name,
            originalSize: file.size,
            compressedSize: blob.size,
            blob,
          });
        }
      }

      setResults(processed);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadZip = async () => {
    if (results.length === 0) return;
    const zip = new JSZip();
    results.forEach((item) => {
      zip.file(item.name, item.blob);
    });

    const zipContent = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipContent);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed-images-${results.length}-files.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const totalOriginal = results.reduce((acc, curr) => acc + curr.originalSize, 0);
  const totalCompressed = results.reduce((acc, curr) => acc + curr.compressedSize, 0);
  const totalSavings = totalOriginal > 0 ? Math.round(((totalOriginal - totalCompressed) / totalOriginal) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <UploadZone
        accept="image/*"
        multiple={true}
        files={files}
        onFilesSelected={handleFilesSelected}
        onRemoveFile={handleRemoveFile}
        onClearFiles={handleClear}
        title="Select multiple images"
        subtitle="Batch compress 10, 20 or 50+ photos simultaneously into a ZIP"
      />

      {files.length > 0 && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Batch Compression Settings
            </h2>
            <span className="text-xs font-mono text-purple-400">
              {files.length} images queued
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <label htmlFor="batch-quality-slider">Image Quality</label>
              <span className="text-purple-400 font-mono">{quality}%</span>
            </div>
            <input
              id="batch-quality-slider"
              type="range"
              min="10"
              max="90"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full h-2 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          <button
            type="button"
            onClick={compressBatch}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-500/20"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>
                  Processing {progress.current} of {progress.total}...
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Compress All ({files.length} Files)</span>
              </>
            )}
          </button>
        </div>
      )}

      {results.length > 0 && (
        <div className="rounded-3xl bg-[#0D1224] border border-emerald-500/30 p-5 sm:p-7 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-white text-base">
                Batch Complete ({results.length} files)
              </span>
            </div>
            {totalSavings > 0 && (
              <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {totalSavings}% Total Savings
              </span>
            )}
          </div>

          {/* Savings breakdown */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#070A14] border border-white/[0.06] text-center">
            <div>
              <span className="text-[11px] text-slate-400">Total Before</span>
              <p className="text-sm font-bold text-slate-300 font-mono">{formatSize(totalOriginal)}</p>
            </div>
            <div>
              <span className="text-[11px] text-emerald-400">Total After</span>
              <p className="text-sm font-bold text-emerald-400 font-mono">{formatSize(totalCompressed)}</p>
            </div>
          </div>

          <DownloadButton
            onClick={handleDownloadZip}
            label="Download All in ZIP Archive"
            sublabel={`${results.length} compressed files`}
          />
        </div>
      )}
    </div>
  );
};
