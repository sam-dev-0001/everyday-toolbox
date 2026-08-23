import React, { useState } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import JSZip from 'jszip';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { downloadBlob, formatBytes } from '../../utils/download';

export const WordToPdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedParagraphs, setExtractedParagraphs] = useState<string[]>([]);
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
        if (selected.name.endsWith('.docx')) {
          const arrayBuffer = await selected.arrayBuffer();
          const zip = await JSZip.loadAsync(arrayBuffer);
          const documentXml = await zip.file('word/document.xml')?.async('text');

          if (!documentXml) {
            throw new Error('Could not find word/document.xml inside DOCX file.');
          }

          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(documentXml, 'application/xml');
          const pElements = xmlDoc.getElementsByTagName('w:p');
          const paragraphs: string[] = [];

          for (let i = 0; i < pElements.length; i++) {
            const p = pElements[i];
            const tElements = p.getElementsByTagName('w:t');
            let pText = '';
            for (let j = 0; j < tElements.length; j++) {
              pText += tElements[j].textContent || '';
            }
            if (pText.trim()) {
              paragraphs.push(pText.trim());
            }
          }
          setExtractedParagraphs(paragraphs);
        } else {
          // Plain text or fallback
          const text = await selected.text();
          const lines = text.split('\n').filter((l) => l.trim().length > 0);
          setExtractedParagraphs(lines);
        }
      } catch (err: any) {
        console.error(err);
        setErrorMessage('Failed to read Word document. Please ensure it is a standard .docx file.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleClear = () => {
    setFile(null);
    setExtractedParagraphs([]);
    setPdfBlob(null);
    setErrorMessage(null);
  };

  const convertToPdf = async () => {
    if (!file || extractedParagraphs.length === 0) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const pageWidth = 595.28; // Standard A4 Portrait (595 x 842 pt)
      const pageHeight = 841.89;
      const margin = 50;
      const maxWidth = pageWidth - margin * 2;
      const fontSize = 11;
      const lineHeight = 16;

      let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin;

      // Document Title
      const title = file.name.replace(/\.[^/.]+$/, '');
      currentPage.drawText(title, {
        x: margin,
        y: currentY,
        size: 16,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.2),
      });
      currentY -= 28;

      for (const p of extractedParagraphs) {
        // Simple word wrapping
        const words = p.split(' ');
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const textWidth = font.widthOfTextAtSize(testLine, fontSize);

          if (textWidth > maxWidth && currentLine) {
            if (currentY < margin + lineHeight) {
              currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
              currentY = pageHeight - margin;
            }
            currentPage.drawText(currentLine, {
              x: margin,
              y: currentY,
              size: fontSize,
              font: font,
              color: rgb(0.2, 0.2, 0.2),
            });
            currentY -= lineHeight;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }

        if (currentLine) {
          if (currentY < margin + lineHeight) {
            currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
            currentY = pageHeight - margin;
          }
          currentPage.drawText(currentLine, {
            x: margin,
            y: currentY,
            size: fontSize,
            font: font,
            color: rgb(0.2, 0.2, 0.2),
          });
          currentY -= lineHeight;
        }

        // Paragraph gap
        currentY -= 8;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setPdfBlob(blob);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to render PDF from Word document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    downloadBlob(pdfBlob, `${baseName}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <UploadZone
        accept=".docx,.doc,.txt"
        files={file ? [file] : []}
        onFilesSelected={handleFilesSelected}
        onClearFiles={handleClear}
        title="Select Word document"
        subtitle="Convert .docx documents into clean, standardized PDF"
        fileHint=".docx or .txt documents"
      />

      {file && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6 shadow-xl">
          {extractedParagraphs.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#11182C] border border-white/[0.04] space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-white">Extracted Content Preview</span>
                <span>{extractedParagraphs.length} Paragraphs Detected</span>
              </div>
              <div className="p-3 rounded-xl bg-[#070A14] border border-white/[0.06] max-h-48 overflow-y-auto text-xs text-slate-300 space-y-2 font-sans no-scrollbar leading-relaxed">
                {extractedParagraphs.slice(0, 5).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {extractedParagraphs.length > 5 && (
                  <p className="text-slate-500 italic">+ {extractedParagraphs.length - 5} more paragraphs...</p>
                )}
              </div>
            </div>
          )}

          {!pdfBlob ? (
            <DownloadButton
              onClick={convertToPdf}
              label="Convert Word Document to PDF"
              sublabel={`File: ${file.name} (${formatBytes(file.size)})`}
              isProcessing={isProcessing}
            />
          ) : (
            <DownloadButton
              onClick={handleDownload}
              label="Download Clean PDF"
              sublabel={`PDF Generated: ${formatBytes(pdfBlob.size)}`}
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
