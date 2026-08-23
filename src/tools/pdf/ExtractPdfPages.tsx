import React, { useState } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { FileInput, Check, Sparkles } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { renderPdfPages, RenderedPdfPage } from '../../utils/pdfHelper';
import { downloadBlob, formatBytes } from '../../utils/download';

export const ExtractPdfPages: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<RenderedPdfPage[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [pageRangeInput, setPageRangeInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedPdfBlob, setExtractedPdfBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      setExtractedPdfBlob(null);
      setErrorMessage(null);
      setIsProcessing(true);

      try {
        const rendered = await renderPdfPages(selected, 1.0);
        setPages(rendered);
        setSelectedPages(rendered.map((p) => p.pageNumber));
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || 'Failed to load PDF pages.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleClear = () => {
    setFile(null);
    setPages([]);
    setSelectedPages([]);
    setPageRangeInput('');
    setExtractedPdfBlob(null);
    setErrorMessage(null);
  };

  const togglePage = (pageNum: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageNum) ? prev.filter((p) => p !== pageNum) : [...prev, pageNum].sort((a, b) => a - b)
    );
    setExtractedPdfBlob(null);
  };

  const applyRangeInput = () => {
    if (!pageRangeInput.trim() || pages.length === 0) return;
    const parts = pageRangeInput.split(',');
    const selected = new Set<number>();

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(pages.length, end); i++) {
            selected.add(i);
          }
        }
      } else {
        const p = parseInt(trimmed, 10);
        if (!isNaN(p) && p >= 1 && p <= pages.length) {
          selected.add(p);
        }
      }
    }

    if (selected.size > 0) {
      setSelectedPages(Array.from(selected).sort((a, b) => a - b));
      setExtractedPdfBlob(null);
    }
  };

  const extractPages = async () => {
    if (!file || selectedPages.length === 0) {
      setErrorMessage('Please select at least one page to extract.');
      return;
    }
    setIsExtracting(true);
    setErrorMessage(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const newDoc = await PDFDocument.create();

      // Convert 1-indexed page numbers to 0-indexed page indices
      const pageIndices = selectedPages.map((p) => p - 1);
      const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
      copiedPages.forEach((p) => newDoc.addPage(p));

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setExtractedPdfBlob(blob);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to extract selected pages.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDownload = () => {
    if (!extractedPdfBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    downloadBlob(extractedPdfBlob, `${baseName}-extracted-${selectedPages.length}-pages.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <UploadZone
        accept="application/pdf"
        files={file ? [file] : []}
        onFilesSelected={handleFilesSelected}
        onClearFiles={handleClear}
        title="Select PDF document"
        subtitle="Extract specific pages into a brand new PDF file"
      />

      {file && pages.length > 0 && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6 shadow-xl">
          {/* Quick Select and Range Input */}
          <div className="p-4 rounded-2xl bg-[#11182C] border border-white/[0.04] space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <label className="text-xs font-bold text-slate-300">
                Select Pages by Range or Click Thumbnails Below
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPages(pages.map((p) => p.pageNumber))}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                >
                  Select All
                </button>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={() => setSelectedPages([])}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                >
                  Clear Selection
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. 1, 3-5, 8"
                value={pageRangeInput}
                onChange={(e) => setPageRangeInput(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#070A14] border border-white/[0.08] text-white text-xs font-mono focus:border-purple-500 outline-none"
              />
              <button
                type="button"
                onClick={applyRangeInput}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                Apply Range
              </button>
            </div>
          </div>

          {/* Page Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {pages.map((page) => {
              const isSelected = selectedPages.includes(page.pageNumber);
              return (
                <div
                  key={page.pageNumber}
                  onClick={() => togglePage(page.pageNumber)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 select-none ${
                    isSelected
                      ? 'bg-purple-600/15 border-purple-500'
                      : 'bg-[#11182C] border-white/[0.06] opacity-50 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Page {page.pageNumber}</span>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${
                        isSelected ? 'bg-purple-600 text-white' : 'border border-white/20'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  <div className="rounded-xl overflow-hidden bg-white border border-slate-200 aspect-[3/4] flex items-center justify-center p-1">
                    <img
                      src={page.dataUrl}
                      alt={`Page ${page.pageNumber}`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {!extractedPdfBlob ? (
            <DownloadButton
              onClick={extractPages}
              label={`Extract ${selectedPages.length} Selected Page${selectedPages.length > 1 ? 's' : ''}`}
              isProcessing={isExtracting}
              disabled={selectedPages.length === 0}
            />
          ) : (
            <DownloadButton
              onClick={handleDownload}
              label="Download Extracted PDF"
              sublabel={`Contains ${selectedPages.length} pages (${formatBytes(extractedPdfBlob.size)})`}
            />
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
