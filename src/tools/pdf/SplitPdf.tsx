import React, { useState } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { Scissors, RefreshCw, Sparkles, FileText } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export const SplitPdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageRange, setPageRange] = useState<string>('1');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [splitPdfUrl, setSplitPdfUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      setSplitPdfUrl(null);
      setErrorMessage(null);

      try {
        const arrayBuffer = await selected.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const count = pdf.getPageCount();
        setTotalPages(count);
        setPageRange(count > 1 ? `1-${Math.min(count, 3)}` : '1');
      } catch (err) {
        setErrorMessage('Failed to read PDF pages. Please verify the document is not password protected.');
      }
    }
  };

  const handleClear = () => {
    if (splitPdfUrl) URL.revokeObjectURL(splitPdfUrl);
    setFile(null);
    setTotalPages(0);
    setSplitPdfUrl(null);
    setErrorMessage(null);
  };

  const parsePageRanges = (rangeStr: string, max: number): number[] => {
    const indices = new Set<number>();
    const parts = rangeStr.split(',').map((s) => s.trim());

    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-').map((s) => s.trim());
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          const from = Math.max(1, Math.min(start, end));
          const to = Math.min(max, Math.max(start, end));
          for (let i = from; i <= to; i++) {
            indices.add(i - 1);
          }
        }
      } else {
        const page = parseInt(part, 10);
        if (!isNaN(page) && page >= 1 && page <= max) {
          indices.add(page - 1);
        }
      }
    }

    return Array.from(indices).sort((a, b) => a - b);
  };

  const splitPdf = async () => {
    if (!file || totalPages === 0) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const targetIndices = parsePageRanges(pageRange, totalPages);
      if (targetIndices.length === 0) {
        setErrorMessage(`Please enter a valid page range between 1 and ${totalPages}.`);
        setIsProcessing(false);
        return;
      }

      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();

      const copiedPages = await newPdf.copyPages(sourcePdf, targetIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setSplitPdfUrl(url);
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to split PDF. Please check your page range syntax.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!splitPdfUrl || !file) return;
    const a = document.createElement('a');
    a.href = splitPdfUrl;
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    a.download = `${nameWithoutExt}-pages-${pageRange.replace(/\s+/g, '')}.pdf`;
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
        title="Upload PDF to Split"
        subtitle="Extract specific pages or page ranges into a new document"
      />

      {file && totalPages > 0 && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Scissors className="w-4 h-4 text-purple-400" />
              Page Extraction Range
            </h2>
            <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              Total Pages: {totalPages}
            </span>
          </div>

          <div className="space-y-3">
            <label htmlFor="page-range-input" className="text-xs font-semibold text-slate-300 block">
              Pages to Extract (e.g. 1-3, 5, 7-10)
            </label>
            <input
              id="page-range-input"
              type="text"
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value)}
              placeholder="e.g. 1-5, 8"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
            />
            <p className="text-[11px] text-slate-400">
              Specify individual pages separated by commas or page ranges with hyphens.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-300">
              {errorMessage}
            </div>
          )}

          <button
            type="button"
            onClick={splitPdf}
            disabled={isProcessing || !pageRange.trim()}
            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-500/20"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Splitting PDF...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Extract Selected Pages</span>
              </>
            )}
          </button>
        </div>
      )}

      {splitPdfUrl && (
        <div className="rounded-3xl bg-[#0D1224] border border-emerald-500/30 p-5 sm:p-7 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-base">Extracted PDF Ready</span>
            <span className="text-xs font-mono text-emerald-400">
              Pages: {pageRange}
            </span>
          </div>

          <DownloadButton onClick={handleDownload} label="Download Extracted PDF" />
        </div>
      )}
    </div>
  );
};
