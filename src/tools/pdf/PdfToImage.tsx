import React, { useState } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { FileImage, Download, RefreshCw, Image as ImageIcon, CheckCircle2, Layers } from 'lucide-react';
import { renderPdfPages, RenderedPdfPage } from '../../utils/pdfHelper';
import { downloadBlob, downloadCanvas, formatBytes } from '../../utils/download';
import JSZip from 'jszip';

interface PdfToImageProps {
  defaultFormat?: 'png' | 'jpeg';
}

export const PdfToImage: React.FC<PdfToImageProps> = ({ defaultFormat = 'png' }) => {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'png' | 'jpeg'>(defaultFormat);
  const [quality, setQuality] = useState<number>(90);
  const [renderedPages, setRenderedPages] = useState<RenderedPdfPage[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setRenderedPages([]);
      setErrorMessage(null);
      setProgress(null);
    }
  };

  const handleClear = () => {
    setFile(null);
    setRenderedPages([]);
    setErrorMessage(null);
    setProgress(null);
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);
    setProgress({ current: 0, total: 1 });

    try {
      const pages = await renderPdfPages(file, 2.0, (current, total) => {
        setProgress({ current, total });
      });
      setRenderedPages(pages);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to process and render PDF pages.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSinglePage = (page: RenderedPdfPage) => {
    const ext = format === 'jpeg' ? 'jpg' : 'png';
    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const filename = `${file?.name.replace(/\.[^/.]+$/, '') || 'document'}-page-${page.pageNumber}.${ext}`;
    downloadCanvas(page.canvas, filename, mime, quality / 100);
  };

  const handleDownloadAllZip = async () => {
    if (renderedPages.length === 0 || !file) return;
    setIsProcessing(true);

    try {
      const zip = new JSZip();
      const ext = format === 'jpeg' ? 'jpg' : 'png';
      const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const baseName = file.name.replace(/\.[^/.]+$/, '');

      for (const page of renderedPages) {
        const blob = await new Promise<Blob | null>((res) =>
          page.canvas.toBlob((b) => res(b), mime, quality / 100)
        );
        if (blob) {
          zip.file(`${baseName}-page-${page.pageNumber}.${ext}`, blob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, `${baseName}-images.zip`);
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to generate ZIP archive.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      {/* Upload Zone */}
      <UploadZone
        accept="application/pdf"
        files={file ? [file] : []}
        onFilesSelected={handleFilesSelected}
        onClearFiles={handleClear}
        title="Select PDF document"
        subtitle="Extract every page into high-resolution images"
        fileHint="PDF documents up to 100MB"
      />

      {file && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6 shadow-xl">
          {/* Format and Quality Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#11182C] border border-white/[0.04] space-y-2">
              <label className="text-xs font-bold text-slate-300">Output Image Format</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('png')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    format === 'png'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white'
                  }`}
                >
                  PNG (Lossless)
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('jpeg')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    format === 'jpeg'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white'
                  }`}
                >
                  JPG (Compact)
                </button>
              </div>
            </div>

            {format === 'jpeg' && (
              <div className="p-4 rounded-2xl bg-[#11182C] border border-white/[0.04] space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">JPG Quality</span>
                  <span className="text-purple-400 font-mono">{quality}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          {renderedPages.length === 0 ? (
            <DownloadButton
              onClick={handleConvert}
              label="Render & Extract PDF Pages"
              sublabel={`File size: ${formatBytes(file.size)}`}
              isProcessing={isProcessing}
            />
          ) : (
            <div className="space-y-6">
              {/* Summary Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Rendered {renderedPages.length} Page{renderedPages.length > 1 ? 's' : ''}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      Ready to download in {format.toUpperCase()} format
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleDownloadAllZip}
                    disabled={isProcessing}
                    className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Download All (ZIP)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleConvert}
                    className="p-2.5 rounded-xl bg-white/[0.06] text-slate-300 hover:text-white"
                    title="Re-render"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Rendered Pages Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {renderedPages.map((page) => (
                  <div
                    key={page.pageNumber}
                    className="rounded-2xl bg-[#11182C] border border-white/[0.06] p-3 space-y-3 flex flex-col justify-between hover:border-purple-500/40 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                        <span>Page {page.pageNumber}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {page.width} x {page.height}px
                        </span>
                      </div>
                      <div className="rounded-xl overflow-hidden bg-white border border-slate-200 aspect-[3/4] flex items-center justify-center p-1">
                        <img
                          src={page.dataUrl}
                          alt={`Page ${page.pageNumber}`}
                          className="max-h-full max-w-full object-contain shadow-sm"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownloadSinglePage(page)}
                      className="w-full py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-purple-600 hover:text-white text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Page {page.pageNumber}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress state */}
          {isProcessing && progress && (
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-purple-300">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                <span>
                  Rendering Page {progress.current} of {progress.total}...
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-purple-500 h-full transition-all duration-300"
                  style={{
                    width: `${progress.total ? (progress.current / progress.total) * 100 : 0}%`,
                  }}
                />
              </div>
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
