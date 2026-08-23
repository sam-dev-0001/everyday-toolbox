import React, { useState } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { ArrowUpDown, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { renderPdfPages, RenderedPdfPage } from '../../utils/pdfHelper';
import { downloadBlob, formatBytes } from '../../utils/download';

export const ReorderPdfPages: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<RenderedPdfPage[]>([]);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isRebuilding, setIsRebuilding] = useState<boolean>(false);
  const [reorderedPdfBlob, setReorderedPdfBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      setReorderedPdfBlob(null);
      setErrorMessage(null);
      setIsProcessing(true);

      try {
        const rendered = await renderPdfPages(selected, 1.0);
        setPages(rendered);
        setPageOrder(rendered.map((p) => p.pageNumber - 1));
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
    setPageOrder([]);
    setReorderedPdfBlob(null);
    setErrorMessage(null);
  };

  const movePage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= pageOrder.length) return;
    const nextOrder = [...pageOrder];
    const item = nextOrder.splice(fromIndex, 1)[0];
    nextOrder.splice(toIndex, 0, item);
    setPageOrder(nextOrder);
    setReorderedPdfBlob(null);
  };

  const rebuildPdf = async () => {
    if (!file) return;
    setIsRebuilding(true);
    setErrorMessage(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const newDoc = await PDFDocument.create();

      const copiedPages = await newDoc.copyPages(srcDoc, pageOrder);
      copiedPages.forEach((p) => newDoc.addPage(p));

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setReorderedPdfBlob(blob);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to reorder PDF pages.');
    } finally {
      setIsRebuilding(false);
    }
  };

  const handleDownload = () => {
    if (!reorderedPdfBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    downloadBlob(reorderedPdfBlob, `${baseName}-reordered.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <UploadZone
        accept="application/pdf"
        files={file ? [file] : []}
        onFilesSelected={handleFilesSelected}
        onClearFiles={handleClear}
        title="Select PDF to reorder pages"
        subtitle="Rearrange and organize page sequence interactively"
      />

      {file && pages.length > 0 && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Pages Order ({pages.length} Pages)
            </h3>
            <span className="text-xs text-slate-400">
              Use arrows to shift pages
            </span>
          </div>

          {/* Grid of reorderable page thumbnails */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {pageOrder.map((pageIdx, orderPos) => {
              const page = pages[pageIdx];
              return (
                <div
                  key={`${pageIdx}-${orderPos}`}
                  className="p-3 rounded-2xl bg-[#11182C] border border-white/[0.06] flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300">
                      Position #{orderPos + 1}
                    </span>
                    <span className="text-slate-500 font-mono">Original p.{page.pageNumber}</span>
                  </div>

                  <div className="rounded-xl overflow-hidden bg-white border border-slate-200 aspect-[3/4] flex items-center justify-center p-1">
                    <img
                      src={page.dataUrl}
                      alt={`Page ${page.pageNumber}`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      disabled={orderPos === 0}
                      onClick={() => movePage(orderPos, orderPos - 1)}
                      className="p-2 rounded-xl bg-white/[0.04] hover:bg-purple-600 disabled:opacity-30 disabled:hover:bg-white/[0.04] text-white transition-all cursor-pointer"
                      title="Move Left"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={orderPos === pageOrder.length - 1}
                      onClick={() => movePage(orderPos, orderPos + 1)}
                      className="p-2 rounded-xl bg-white/[0.04] hover:bg-purple-600 disabled:opacity-30 disabled:hover:bg-white/[0.04] text-white transition-all cursor-pointer"
                      title="Move Right"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {!reorderedPdfBlob ? (
            <DownloadButton
              onClick={rebuildPdf}
              label="Rebuild & Save PDF in New Order"
              isProcessing={isRebuilding}
            />
          ) : (
            <DownloadButton
              onClick={handleDownload}
              label="Download Reordered PDF"
              sublabel={`File: ${formatBytes(reorderedPdfBlob.size)}`}
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
