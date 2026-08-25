import React, { useState } from 'react';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { FileText, RefreshCw, Sparkles, Sliders } from 'lucide-react';
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';

export const TextToPdf: React.FC = () => {
  const [text, setText] = useState<string>(
    '# Everyday Tool Note\n\nThis is a clean document generated 100% inside your browser using client-side JavaScript.\n\nKey Benefits:\n• 100% Private\n• Instant generation\n• Zero file uploads to any server'
  );
  const [docTitle, setDocTitle] = useState<string>('Document');
  const [fontSize, setFontSize] = useState<number>(12);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const generatePdfFromText = async () => {
    if (!text.trim()) return;
    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const margin = 50;
      const pageWidth = PageSizes.A4[0];
      const pageHeight = PageSizes.A4[1];
      const usableWidth = pageWidth - margin * 2;

      let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;
      const lineHeight = fontSize * 1.5;

      // Draw title
      if (docTitle.trim()) {
        currentPage.drawText(docTitle, {
          x: margin,
          y: y,
          size: fontSize + 6,
          font: fontBold,
          color: rgb(0.1, 0.1, 0.1),
        });
        y -= lineHeight * 1.8;
      }

      // Split text into lines
      const paragraphs = text.split('\n');

      for (const paragraph of paragraphs) {
        if (paragraph.trim() === '') {
          y -= lineHeight * 0.8;
          continue;
        }

        // Word wrap paragraph into usable width
        const words = paragraph.split(' ');
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);

          if (testWidth > usableWidth) {
            // Need new line
            if (y < margin + lineHeight) {
              currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
              y = pageHeight - margin;
            }

            currentPage.drawText(currentLine, {
              x: margin,
              y: y,
              size: fontSize,
              font: font,
              color: rgb(0.15, 0.15, 0.15),
            });
            y -= lineHeight;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }

        if (currentLine) {
          if (y < margin + lineHeight) {
            currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
          }

          currentPage.drawText(currentLine, {
            x: margin,
            y: y,
            size: fontSize,
            font: font,
            color: rgb(0.15, 0.15, 0.15),
          });
          y -= lineHeight;
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setPdfUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `${docTitle.toLowerCase().replace(/\s+/g, '-') || 'text-document'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            Text to PDF Document Editor
          </h2>
          <span className="text-xs text-slate-400">Standard A4 Output</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="doc-title-input" className="text-xs font-semibold text-slate-300 block">Document Title</label>
            <input
              id="doc-title-input"
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="e.g. Meeting Summary"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="body-font-size-select" className="text-xs font-semibold text-slate-300 block">Body Font Size</label>
            <select
              id="body-font-size-select"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value={10}>Small (10 pt)</option>
              <option value={12}>Standard (12 pt)</option>
              <option value={14}>Large (14 pt)</option>
              <option value={16}>Extra Large (16 pt)</option>
            </select>
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-1.5">
          <label htmlFor="pdf-content-textarea" className="text-xs font-semibold text-slate-300 block">Document Content</label>
          <textarea
            id="pdf-content-textarea"
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            className="w-full p-4 rounded-2xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 font-sans leading-relaxed"
          />
        </div>

        <button
          type="button"
          onClick={generatePdfFromText}
          disabled={isProcessing || !text.trim()}
          className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-500/20"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate PDF Document</span>
            </>
          )}
        </button>
      </div>

      {pdfUrl && (
        <div className="rounded-3xl bg-[#0D1224] border border-emerald-500/30 p-5 sm:p-7 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-base">PDF Document Ready</span>
            <span className="text-xs font-mono text-emerald-400">A4 Formatted</span>
          </div>

          <DownloadButton onClick={handleDownload} label="Download PDF Document" />
        </div>
      )}
    </div>
  );
};
