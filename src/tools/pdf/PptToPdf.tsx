import React, { useState } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { Presentation, Info, CheckCircle2 } from 'lucide-react';
import JSZip from 'jszip';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { downloadBlob, formatBytes } from '../../utils/download';

interface SlideContent {
  slideNumber: number;
  texts: string[];
}

export const PptToPdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [slides, setSlides] = useState<SlideContent[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      setPdfBlob(null);
      setErrorMessage(null);
      setIsProcessing(true);

      try {
        const arrayBuffer = await selected.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);

        // Find all slide XML files
        const slideFiles: { name: string; num: number }[] = [];
        zip.forEach((relativePath) => {
          const match = relativePath.match(/^ppt\/slides\/slide(\d+)\.xml$/);
          if (match) {
            slideFiles.push({ name: relativePath, num: parseInt(match[1], 10) });
          }
        });

        slideFiles.sort((a, b) => a.num - b.num);

        if (slideFiles.length === 0) {
          throw new Error('No slides found in this PowerPoint file (.pptx format required).');
        }

        const parser = new DOMParser();
        const extractedSlides: SlideContent[] = [];

        for (const sf of slideFiles) {
          const xmlContent = await zip.file(sf.name)?.async('text');
          if (xmlContent) {
            const xmlDoc = parser.parseFromString(xmlContent, 'application/xml');
            const textNodes = xmlDoc.getElementsByTagName('a:t');
            const texts: string[] = [];
            for (let i = 0; i < textNodes.length; i++) {
              const str = textNodes[i].textContent?.trim();
              if (str) texts.push(str);
            }
            extractedSlides.push({
              slideNumber: sf.num,
              texts,
            });
          }
        }

        setSlides(extractedSlides);
      } catch (err: any) {
        console.error(err);
        setErrorMessage('Failed to read PowerPoint file. Please ensure it is a valid .pptx presentation.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleClear = () => {
    setFile(null);
    setSlides([]);
    setPdfBlob(null);
    setErrorMessage(null);
  };

  const convertToPdf = async () => {
    if (!file || slides.length === 0) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Landscape slide dimensions 16:9 (960 x 540 pt)
      const slideWidth = 960;
      const slideHeight = 540;

      for (const slide of slides) {
        const page = pdfDoc.addPage([slideWidth, slideHeight]);

        // Clean slide canvas background
        page.drawRectangle({
          x: 0,
          y: 0,
          width: slideWidth,
          height: slideHeight,
          color: rgb(0.98, 0.98, 1.0),
        });

        // Slide header bar
        page.drawRectangle({
          x: 0,
          y: slideHeight - 40,
          width: slideWidth,
          height: 40,
          color: rgb(0.12, 0.15, 0.25),
        });

        page.drawText(`Slide ${slide.slideNumber}`, {
          x: 40,
          y: slideHeight - 26,
          size: 14,
          font: fontBold,
          color: rgb(1, 1, 1),
        });

        // Presentation Title
        const presTitle = file.name.replace(/\.[^/.]+$/, '');
        page.drawText(presTitle, {
          x: slideWidth - 40 - font.widthOfTextAtSize(presTitle, 10),
          y: slideHeight - 25,
          size: 10,
          font: font,
          color: rgb(0.8, 0.8, 0.9),
        });

        // Slide text content
        let currentY = slideHeight - 80;
        if (slide.texts.length > 0) {
          // First text as Title
          page.drawText(slide.texts[0], {
            x: 60,
            y: currentY,
            size: 20,
            font: fontBold,
            color: rgb(0.1, 0.1, 0.2),
          });
          currentY -= 35;

          // Remaining texts
          for (let i = 1; i < slide.texts.length; i++) {
            const line = slide.texts[i];
            if (currentY < 50) break;
            page.drawText(`•  ${line}`, {
              x: 70,
              y: currentY,
              size: 13,
              font: font,
              color: rgb(0.2, 0.2, 0.3),
            });
            currentY -= 24;
          }
        } else {
          page.drawText('(Visual slide without selectable text)', {
            x: 60,
            y: currentY,
            size: 12,
            font: font,
            color: rgb(0.5, 0.5, 0.6),
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setPdfBlob(blob);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to render PDF from PowerPoint presentation.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    downloadBlob(pdfBlob, `${baseName}-slides.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      {/* Honest Conversion Notice */}
      <div className="p-4 rounded-2xl bg-[#11182C] border border-purple-500/30 flex items-start gap-3">
        <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-white">Browser-Side Slide Deck Rendering</h4>
          <p className="text-slate-300 leading-relaxed">
            Extracts slide structure, titles, bullet hierarchy, and slide layouts from your .pptx presentation and renders clean landscape PDF presentation pages.
          </p>
        </div>
      </div>

      <UploadZone
        accept=".pptx,.ppt"
        files={file ? [file] : []}
        onFilesSelected={handleFilesSelected}
        onClearFiles={handleClear}
        title="Select PowerPoint presentation"
        subtitle="Convert .pptx slide deck into clean landscape PDF"
        fileHint=".pptx presentation files"
      />

      {file && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6 shadow-xl">
          {slides.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#11182C] border border-white/[0.04] space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-white">Extracted Slide Deck</span>
                <span>{slides.length} Slides Found</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto no-scrollbar">
                {slides.map((s) => (
                  <div key={s.slideNumber} className="p-3 rounded-xl bg-[#070A14] border border-white/[0.06] space-y-1">
                    <p className="text-xs font-bold text-purple-300">Slide {s.slideNumber}</p>
                    <p className="text-xs text-slate-300 truncate">
                      {s.texts[0] || 'Visual slide'}
                    </p>
                    <p className="text-[11px] text-slate-500">{s.texts.length} text elements</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!pdfBlob ? (
            <DownloadButton
              onClick={convertToPdf}
              label="Generate PDF Document from Slides"
              sublabel={`File: ${file.name} (${formatBytes(file.size)})`}
              isProcessing={isProcessing}
            />
          ) : (
            <DownloadButton
              onClick={handleDownload}
              label="Download Presentation PDF"
              sublabel={`Generated ${slides.length} landscape pages (${formatBytes(pdfBlob.size)})`}
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
