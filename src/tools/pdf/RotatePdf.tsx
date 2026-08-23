import React, { useState } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { RotateCw, RefreshCw, Sparkles } from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';

export const RotatePdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [applyTo, setApplyTo] = useState<'all' | 'custom'>('all');
  const [customPages, setCustomPages] = useState<string>('1');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [rotatedPdfUrl, setRotatedPdfUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      setRotatedPdfUrl(null);
      setErrorMessage(null);

      try {
        const arrayBuffer = await selected.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        setTotalPages(pdf.getPageCount());
      } catch (err) {
        setErrorMessage('Failed to read PDF. Make sure it is not password-protected.');
      }
    }
  };

  const handleClear = () => {
    if (rotatedPdfUrl) URL.revokeObjectURL(rotatedPdfUrl);
    setFile(null);
    setTotalPages(0);
    setRotatedPdfUrl(null);
  };

  const rotatePdf = async () => {
    if (!file || totalPages === 0) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdf.getPages();

      if (applyTo === 'all') {
        pages.forEach((page) => {
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees((currentRotation + rotationAngle) % 360));
        });
      } else {
        const pageNumbers = customPages
          .split(',')
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !isNaN(n) && n >= 1 && n <= totalPages);

        pageNumbers.forEach((p) => {
          const page = pages[p - 1];
          if (page) {
            const currentRotation = page.getRotation().angle;
            page.setRotation(degrees((currentRotation + rotationAngle) % 360));
          }
        });
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setRotatedPdfUrl(url);
    } catch (err) {
      console.error(err);
      setErrorMessage('Could not rotate PDF pages. Please verify the document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!rotatedPdfUrl || !file) return;
    const a = document.createElement('a');
    a.href = rotatedPdfUrl;
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    a.download = `${nameWithoutExt}-rotated-${rotationAngle}deg.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <UploadZone
        accept="application/pdf"
        files={file ? [file] : []}
        onFilesSelected={handleFilesSelected}
        onClearFiles={handleClear}
        title="Upload PDF to Rotate"
        subtitle="Rotate pages by 90°, 180°, or 270° and fix document orientation"
      />

      {file && totalPages > 0 && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-purple-400" />
              Rotation Settings
            </h2>
            <span className="text-xs font-mono text-purple-400">{totalPages} Pages Total</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Rotation Angle */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Angle to Rotate</span>
              <div className="grid grid-cols-3 gap-2">
                {[90, 180, 270].map((angle) => (
                  <button
                    key={angle}
                    type="button"
                    onClick={() => setRotationAngle(angle)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      rotationAngle === angle
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-[#11182C] text-slate-300 border border-white/[0.06] hover:text-white'
                    }`}
                  >
                    +{angle}°
                  </button>
                ))}
              </div>
            </div>

            {/* Scope */}
            <div className="space-y-2">
              <label htmlFor="rotate-scope-select" className="text-xs font-semibold text-slate-300 block">Apply To</label>
              <select
                id="rotate-scope-select"
                value={applyTo}
                onChange={(e) => setApplyTo(e.target.value as 'all' | 'custom')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="all">All Pages ({totalPages} pages)</option>
                <option value="custom">Specific Pages Only</option>
              </select>

              {applyTo === 'custom' && (
                <div className="pt-2">
                  <input
                    type="text"
                    value={customPages}
                    onChange={(e) => setCustomPages(e.target.value)}
                    placeholder="e.g. 1, 3, 5"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#11182C] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              )}
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-300">
              {errorMessage}
            </div>
          )}

          <button
            type="button"
            onClick={rotatePdf}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-500/20"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Rotating Pages...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Rotate PDF ({rotationAngle}°)</span>
              </>
            )}
          </button>
        </div>
      )}

      {rotatedPdfUrl && (
        <div className="rounded-3xl bg-[#0D1224] border border-emerald-500/30 p-5 sm:p-7 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-base">Rotated PDF Ready</span>
            <span className="text-xs font-mono text-emerald-400">+{rotationAngle}° Applied</span>
          </div>

          <DownloadButton onClick={handleDownload} label="Download Rotated PDF" />
        </div>
      )}
    </div>
  );
};
