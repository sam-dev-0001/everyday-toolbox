import React, { useState } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { Presentation, Info, CheckCircle2, FileText } from 'lucide-react';
import { renderPdfPages } from '../../utils/pdfHelper';
import { downloadBlob, formatBytes } from '../../utils/download';
import pptxgen from 'pptxgenjs';

export const PdfToPpt: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setConvertedBlob(null);
      setErrorMessage(null);
      setProgress(null);
    }
  };

  const handleClear = () => {
    setFile(null);
    setConvertedBlob(null);
    setErrorMessage(null);
    setProgress(null);
  };

  const handleConvertToPptx = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);
    setProgress({ current: 0, total: 1 });

    try {
      // 1. Render all PDF pages as high-resolution images
      const renderedPages = await renderPdfPages(file, 2.0, (current, total) => {
        setProgress({ current, total });
      });

      if (renderedPages.length === 0) {
        throw new Error('No pages could be extracted from this PDF document.');
      }

      setPageCount(renderedPages.length);

      // 2. Initialize PptxGenJS presentation
      const pres = new pptxgen();
      pres.title = file.name.replace(/\.[^/.]+$/, '');
      pres.author = 'Everyday Tool';

      // 3. Add each page image to a slide matching aspect ratio
      for (const page of renderedPages) {
        const slide = pres.addSlide();
        // Determine landscape vs portrait
        const isLandscape = page.width >= page.height;

        // Slide layout 16:9 or 4:3 default is 10 x 5.625 inches (16:9)
        if (isLandscape) {
          pres.layout = 'LAYOUT_16x9';
          // Calculate proportional fitting within slide (10" x 5.625")
          const slideW = 10;
          const slideH = 5.625;
          const imgAspect = page.width / page.height;
          let w = slideW;
          let h = slideW / imgAspect;
          if (h > slideH) {
            h = slideH;
            w = slideH * imgAspect;
          }
          const x = (slideW - w) / 2;
          const y = (slideH - h) / 2;

          slide.addImage({
            data: page.dataUrl,
            x: x,
            y: y,
            w: w,
            h: h,
          });
        } else {
          // Portrait layout (4:3 or standard portrait slide)
          pres.layout = 'LAYOUT_4x3';
          const slideW = 10;
          const slideH = 7.5;
          const imgAspect = page.width / page.height;
          let h = slideH;
          let w = slideH * imgAspect;
          if (w > slideW) {
            w = slideW;
            h = slideW / imgAspect;
          }
          const x = (slideW - w) / 2;
          const y = (slideH - h) / 2;

          slide.addImage({
            data: page.dataUrl,
            x: x,
            y: y,
            w: w,
            h: h,
          });
        }
      }

      // 4. Generate PPTX binary output
      const pptxArrayBuffer = await pres.write({ outputType: 'arraybuffer' }) as ArrayBuffer;
      const blob = new Blob([pptxArrayBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      });

      setConvertedBlob(blob);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to convert PDF to PowerPoint slides.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!convertedBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    downloadBlob(convertedBlob, `${baseName}-slides.pptx`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      {/* Honest Conversion Notice banner */}
      <div className="p-4 rounded-2xl bg-[#11182C] border border-purple-500/30 flex items-start gap-3">
        <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-white">Browser-Only Conversion Specification</h4>
          <p className="text-slate-300 leading-relaxed">
            PDF pages are converted to PowerPoint (.pptx) slides as high-resolution visual slides.
            This preserves exact typography, vector geometry, equations, and layouts without requiring third-party cloud uploads.
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <UploadZone
        accept="application/pdf"
        files={file ? [file] : []}
        onFilesSelected={handleFilesSelected}
        onClearFiles={handleClear}
        title="Select PDF presentation"
        subtitle="Convert pages into a PowerPoint (.pptx) slide deck"
      />

      {file && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6 shadow-xl">
          {!convertedBlob ? (
            <DownloadButton
              onClick={handleConvertToPptx}
              label="Convert to PowerPoint (.pptx)"
              sublabel={`File: ${file.name} (${formatBytes(file.size)})`}
              isProcessing={isProcessing}
            />
          ) : (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Conversion Complete</h4>
                    <p className="text-xs text-slate-400 font-mono">
                      Generated {pageCount} slides • {formatBytes(convertedBlob.size)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConvertToPptx}
                  className="text-xs font-semibold text-purple-400 hover:text-purple-300 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20"
                >
                  Convert Again
                </button>
              </div>

              <DownloadButton
                onClick={handleDownload}
                label="Download PowerPoint Presentation (.pptx)"
                sublabel={`${pageCount} slides generated`}
              />
            </div>
          )}

          {isProcessing && progress && (
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-purple-300">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                <span>
                  Processing Page {progress.current} of {progress.total} into Slide...
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
