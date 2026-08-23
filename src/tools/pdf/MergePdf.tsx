import React, { useState } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { Combine, ArrowUp, ArrowDown, Trash2, Sparkles, RefreshCw, FileText } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export const MergePdf: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [mergedPdfBytes, setMergedPdfBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setMergedPdfUrl(null);
    setMergedPdfBytes(null);
    setErrorMessage(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const next = [...files];
    const temp = next[index];
    next[index] = next[index - 1];
    next[index - 1] = temp;
    setFiles(next);
  };

  const handleMoveDown = (index: number) => {
    if (index === files.length - 1) return;
    const next = [...files];
    const temp = next[index];
    next[index] = next[index + 1];
    next[index + 1] = temp;
    setFiles(next);
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setMergedPdfUrl(null);
    setMergedPdfBytes(null);
  };

  const handleClear = () => {
    if (mergedPdfUrl) URL.revokeObjectURL(mergedPdfUrl);
    setFiles([]);
    setMergedPdfUrl(null);
    setMergedPdfBytes(null);
    setErrorMessage(null);
  };

  const mergePdfs = async () => {
    if (files.length < 2) {
      setErrorMessage('Please select at least 2 PDF documents to merge.');
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setMergedPdfBytes(pdfBytes);
      setMergedPdfUrl(url);
    } catch (err) {
      console.error(err);
      setErrorMessage('Could not merge one or more PDF files. Make sure they are not password protected.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!mergedPdfUrl) return;
    const a = document.createElement('a');
    a.href = mergedPdfUrl;
    a.download = `merged-document-${files.length}-files.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <UploadZone
        accept="application/pdf"
        multiple={true}
        files={[]}
        onFilesSelected={handleFilesSelected}
        title="Select multiple PDF documents"
        subtitle="Combine 2 or more PDFs into a single organized document"
        fileHint="Processed 100% locally in your browser memory"
      />

      {files.length > 0 && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Combine className="w-4 h-4 text-purple-400" />
              Arrange PDF Order
            </h2>
            <button
              onClick={handleClear}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
            >
              Clear All
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Use the arrow buttons to arrange the order of pages before merging.
          </p>

          <div className="space-y-2">
            {files.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#11182C] border border-white/[0.04]"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    aria-label={`Move ${file.name} up in merge order`}
                    className="p-1.5 rounded-lg bg-white/[0.04] text-slate-300 hover:text-white disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === files.length - 1}
                    aria-label={`Move ${file.name} down in merge order`}
                    className="p-1.5 rounded-lg bg-white/[0.04] text-slate-300 hover:text-white disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    aria-label={`Remove ${file.name} from merge list`}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:text-rose-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-300">
              {errorMessage}
            </div>
          )}

          <button
            type="button"
            onClick={mergePdfs}
            disabled={isProcessing || files.length < 2}
            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-500/20 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Merging {files.length} PDFs...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Merge {files.length} PDFs</span>
              </>
            )}
          </button>
        </div>
      )}

      {mergedPdfUrl && (
        <div className="rounded-3xl bg-[#0D1224] border border-emerald-500/30 p-5 sm:p-7 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-base">Merged PDF Ready</span>
            <span className="text-xs font-mono text-emerald-400">
              {mergedPdfBytes ? (mergedPdfBytes.length / (1024 * 1024)).toFixed(2) : '0'} MB
            </span>
          </div>

          <DownloadButton onClick={handleDownload} label="Download Merged PDF" />
        </div>
      )}
    </div>
  );
};
