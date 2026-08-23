import React, { useState } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { Trash2, RefreshCw, Sparkles, CheckSquare, Square } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export const DeletePdfPages: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pagesToDelete, setPagesToDelete] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [cleanedPdfUrl, setCleanedPdfUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      setCleanedPdfUrl(null);
      setPagesToDelete([]);
      setErrorMessage(null);

      try {
        const arrayBuffer = await selected.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        setTotalPages(pdf.getPageCount());
      } catch (err) {
        setErrorMessage('Failed to read PDF document.');
      }
    }
  };

  const handleClear = () => {
    if (cleanedPdfUrl) URL.revokeObjectURL(cleanedPdfUrl);
    setFile(null);
    setTotalPages(0);
    setPagesToDelete([]);
    setCleanedPdfUrl(null);
  };

  const togglePageDelete = (pageIndex: number) => {
    setPagesToDelete((prev) =>
      prev.includes(pageIndex) ? prev.filter((p) => p !== pageIndex) : [...prev, pageIndex]
    );
  };

  const deletePages = async () => {
    if (!file || totalPages === 0) return;
    if (pagesToDelete.length === totalPages) {
      setErrorMessage('You cannot delete all pages in the PDF.');
      return;
    }
    if (pagesToDelete.length === 0) {
      setErrorMessage('Please select at least one page to remove.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();

      const remainingIndices: number[] = [];
      for (let i = 0; i < totalPages; i++) {
        if (!pagesToDelete.includes(i)) {
          remainingIndices.push(i);
        }
      }

      const copiedPages = await newPdf.copyPages(sourcePdf, remainingIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setCleanedPdfUrl(url);
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to delete pages. Please check the document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!cleanedPdfUrl || !file) return;
    const a = document.createElement('a');
    a.href = cleanedPdfUrl;
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    a.download = `${nameWithoutExt}-cleaned.pdf`;
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
        title="Upload PDF to remove unwanted pages"
        subtitle="Click pages you want to delete and generate a clean PDF"
      />

      {file && totalPages > 0 && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-400" />
              Select Pages to Delete
            </h2>
            <span className="text-xs font-mono text-rose-400">
              {pagesToDelete.length} of {totalPages} marked for deletion
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Click on any page number below to mark it for removal (highlighted in red).
          </p>

          {/* Grid of pages */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 max-h-64 overflow-y-auto no-scrollbar p-1">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const isMarked = pagesToDelete.includes(idx);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => togglePageDelete(idx)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
                    isMarked
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 scale-[0.97]'
                      : 'bg-[#11182C] text-slate-300 border-white/[0.06] hover:border-white/[0.16]'
                  }`}
                >
                  <span className="text-sm">{idx + 1}</span>
                  <span className="text-[10px] font-normal opacity-70">
                    {isMarked ? 'Delete' : 'Keep'}
                  </span>
                </button>
              );
            })}
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-300">
              {errorMessage}
            </div>
          )}

          <button
            type="button"
            onClick={deletePages}
            disabled={isProcessing || pagesToDelete.length === 0}
            className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-500/20 disabled:opacity-40"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Deleting Pages...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete {pagesToDelete.length} Pages & Save PDF</span>
              </>
            )}
          </button>
        </div>
      )}

      {cleanedPdfUrl && (
        <div className="rounded-3xl bg-[#0D1224] border border-emerald-500/30 p-5 sm:p-7 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-base">Cleaned PDF Ready</span>
            <span className="text-xs font-mono text-emerald-400">
              {totalPages - pagesToDelete.length} Pages Remaining
            </span>
          </div>

          <DownloadButton onClick={handleDownload} label="Download Cleaned PDF" />
        </div>
      )}
    </div>
  );
};
