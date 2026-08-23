import React, { useState } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { FilePlus, RefreshCw, Sparkles, Sliders } from 'lucide-react';
import { PDFDocument, PageSizes } from 'pdf-lib';

export const ImageToPdf: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState<'A4' | 'LETTER' | 'FIT'>('A4');
  const [margin, setMargin] = useState<number>(20);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'auto'>('auto');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setPdfUrl(null);
    setErrorMessage(null);
  };

  const handleClear = () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setFiles([]);
    setPdfUrl(null);
    setErrorMessage(null);
  };

  const convertImagesToPdf = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        let pdfImage;

        if (file.type === 'image/png') {
          pdfImage = await pdfDoc.embedPng(arrayBuffer);
        } else {
          pdfImage = await pdfDoc.embedJpg(arrayBuffer);
        }

        const imgWidth = pdfImage.width;
        const imgHeight = pdfImage.height;

        let pageWidth = PageSizes.A4[0];
        let pageHeight = PageSizes.A4[1];

        if (pageSize === 'LETTER') {
          pageWidth = PageSizes.Letter[0];
          pageHeight = PageSizes.Letter[1];
        } else if (pageSize === 'FIT') {
          pageWidth = imgWidth + margin * 2;
          pageHeight = imgHeight + margin * 2;
        }

        if (orientation === 'landscape' && pageSize !== 'FIT') {
          const temp = pageWidth;
          pageWidth = pageHeight;
          pageHeight = temp;
        } else if (orientation === 'auto' && pageSize !== 'FIT' && imgWidth > imgHeight) {
          const temp = pageWidth;
          pageWidth = pageHeight;
          pageHeight = temp;
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        const availW = pageWidth - margin * 2;
        const availH = pageHeight - margin * 2;
        const scale = Math.min(availW / imgWidth, availH / imgHeight, 1);

        const drawW = imgWidth * scale;
        const drawH = imgHeight * scale;
        const posX = (pageWidth - drawW) / 2;
        const posY = (pageHeight - drawH) / 2;

        page.drawImage(pdfImage, {
          x: posX,
          y: posY,
          width: drawW,
          height: drawH,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to convert some images to PDF. Make sure they are standard JPG or PNG images.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `images-combined-${files.length}-pages.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <UploadZone
        accept="image/jpeg,image/png"
        multiple={true}
        files={files}
        onFilesSelected={handleFilesSelected}
        onRemoveFile={(idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))}
        onClearFiles={handleClear}
        title="Upload images to convert to PDF"
        subtitle="Select single or multiple JPG / PNG photos to compile into a PDF"
      />

      {files.length > 0 && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              Document Layout Settings
            </h2>
            <span className="text-xs font-mono text-purple-400">{files.length} images</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Page Size */}
            <div className="space-y-2">
              <label htmlFor="page-size-select" className="text-xs font-semibold text-slate-300 block">Page Size</label>
              <select
                id="page-size-select"
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as 'A4' | 'LETTER' | 'FIT')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="A4">A4 (Standard 210 × 297 mm)</option>
                <option value="LETTER">US Letter (8.5 × 11 in)</option>
                <option value="FIT">Fit to Original Image Size</option>
              </select>
            </div>

            {/* Orientation */}
            <div className="space-y-2">
              <label htmlFor="pdf-orientation-select" className="text-xs font-semibold text-slate-300 block">Orientation</label>
              <select
                id="pdf-orientation-select"
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape' | 'auto')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="auto">Auto (Match each image)</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>

            {/* Margin */}
            <div className="space-y-2">
              <label htmlFor="pdf-margin-select" className="text-xs font-semibold text-slate-300 block">Page Margins</label>
              <select
                id="pdf-margin-select"
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value={0}>No Margins (Edge-to-edge)</option>
                <option value={20}>Small (20px)</option>
                <option value={40}>Standard (40px)</option>
              </select>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-300">
              {errorMessage}
            </div>
          )}

          <button
            type="button"
            onClick={convertImagesToPdf}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-500/20"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Creating PDF Document...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate PDF ({files.length} Pages)</span>
              </>
            )}
          </button>
        </div>
      )}

      {pdfUrl && (
        <div className="rounded-3xl bg-[#0D1224] border border-emerald-500/30 p-5 sm:p-7 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-base">PDF Document Ready</span>
            <span className="text-xs font-mono text-emerald-400">{files.length} Pages</span>
          </div>

          <DownloadButton onClick={handleDownload} label="Download PDF Document" />
        </div>
      )}
    </div>
  );
};
