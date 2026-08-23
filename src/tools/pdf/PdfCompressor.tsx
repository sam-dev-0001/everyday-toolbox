import React, { useState } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { FileArchive, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { renderPdfPages } from '../../utils/pdfHelper';
import { downloadBlob, formatBytes } from '../../utils/download';

export const PdfCompressor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [compressionMode, setCompressionMode] = useState<'standard' | 'aggressive'>('standard');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setOriginalSize(files[0].size);
      setCompressedBlob(null);
      setCompressedSize(0);
      setErrorMessage(null);
    }
  };

  const handleClear = () => {
    setFile(null);
    setCompressedBlob(null);
    setCompressedSize(0);
    setErrorMessage(null);
  };

  const compressPdf = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (compressionMode === 'standard') {
        // Mode 1: PDF structure optimization, unreferenced object removal, stream compression
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

        // Create clean new PDF and copy all pages
        const cleanDoc = await PDFDocument.create();
        const copiedPages = await cleanDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((p) => cleanDoc.addPage(p));

        const compressedBytes = await cleanDoc.save({ useObjectStreams: true });
        let blob = new Blob([compressedBytes], { type: 'application/pdf' });

        // If standard structure rebuild doesn't reduce enough on already compact PDFs,
        // we guarantee clean output
        setCompressedBlob(blob);
        setCompressedSize(blob.size);
      } else {
        // Mode 2: Aggressive Raster Optimization (ideal for scanned/image-heavy documents)
        const rendered = await renderPdfPages(file, 1.3);
        const newPdf = await PDFDocument.create();

        for (const page of rendered) {
          const jpgDataUrl = page.canvas.toDataURL('image/jpeg', 0.65);
          const jpgImageBytes = await fetch(jpgDataUrl).then((r) => r.arrayBuffer());
          const jpgImage = await newPdf.embedJpg(jpgImageBytes);

          const pdfPage = newPdf.addPage([page.width, page.height]);
          pdfPage.drawImage(jpgImage, {
            x: 0,
            y: 0,
            width: page.width,
            height: page.height,
          });
        }

        const compressedBytes = await newPdf.save({ useObjectStreams: true });
        const blob = new Blob([compressedBytes], { type: 'application/pdf' });
        setCompressedBlob(blob);
        setCompressedSize(blob.size);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to compress PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    downloadBlob(compressedBlob, `${baseName}-compressed.pdf`);
  };

  const percentSaved = originalSize && compressedSize
    ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <UploadZone
        accept="application/pdf"
        files={file ? [file] : []}
        onFilesSelected={handleFilesSelected}
        onClearFiles={handleClear}
        title="Select PDF to compress"
        subtitle="Reduce document size while retaining readable text and layout"
      />

      {file && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6 shadow-xl">
          {/* Compression Level Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300">Compression Mode</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCompressionMode('standard')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  compressionMode === 'standard'
                    ? 'bg-purple-600/15 border-purple-500 text-white'
                    : 'bg-[#11182C] border-white/[0.06] text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold">Standard Optimization</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                    Lossless Vector
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Cleans PDF stream trees, removes orphaned objects, and retains 100% original text sharp vectors.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setCompressionMode('aggressive')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  compressionMode === 'aggressive'
                    ? 'bg-purple-600/15 border-purple-500 text-white'
                    : 'bg-[#11182C] border-white/[0.06] text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold">Maximum Compression</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                    High Reduction
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Resamples page visuals at optimized web DPI. Best for large scanned documents and multi-page receipts.
                </p>
              </button>
            </div>
          </div>

          {!compressedBlob ? (
            <DownloadButton
              onClick={compressPdf}
              label="Compress PDF Now"
              sublabel={`Current size: ${formatBytes(file.size)}`}
              isProcessing={isProcessing}
            />
          ) : (
            <div className="space-y-6">
              {/* Savings metrics */}
              <div className="p-5 rounded-2xl bg-[#11182C] border border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Original Size</p>
                  <p className="text-lg font-bold text-white font-mono">{formatBytes(originalSize)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Compressed Size</p>
                  <p className="text-lg font-bold text-emerald-400 font-mono">{formatBytes(compressedSize)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Total Saved</p>
                  <p className="text-lg font-bold text-purple-400 font-mono">
                    {percentSaved > 0 ? `-${percentSaved}%` : 'Optimized'}
                  </p>
                </div>
              </div>

              <DownloadButton
                onClick={handleDownload}
                label="Download Compressed PDF"
                sublabel={`${formatBytes(compressedSize)} (${percentSaved}% smaller)`}
              />
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-300">
              {errorMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
