import React, { useState } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { Sheet, FileText, CheckCircle2, Table } from 'lucide-react';
import * as XLSX from 'xlsx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { downloadBlob, formatBytes } from '../../utils/download';

export const ExcelToPdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [previewData, setPreviewData] = useState<string[][]>([]);
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
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        setSheetNames(workbook.SheetNames);
        const firstSheetName = workbook.SheetNames[0] || 'Sheet1';
        setSelectedSheet(firstSheetName);

        const sheet = workbook.Sheets[firstSheetName];
        const data: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        setPreviewData(data.slice(0, 10)); // Top 10 rows for preview
      } catch (err: any) {
        console.error(err);
        setErrorMessage('Failed to read spreadsheet. Please ensure it is a valid .xlsx or .csv file.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleClear = () => {
    setFile(null);
    setSheetNames([]);
    setSelectedSheet('');
    setPreviewData([]);
    setPdfBlob(null);
    setErrorMessage(null);
  };

  const convertToPdf = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheet = workbook.Sheets[selectedSheet || workbook.SheetNames[0]];
      const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      if (rows.length === 0) {
        throw new Error('Spreadsheet contains no data.');
      }

      // Create clean PDF Document
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const pageWidth = 842; // A4 Landscape (842 x 595 pt)
      const pageHeight = 595;
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;

      // Determine max columns
      let maxCols = 1;
      rows.forEach((r) => {
        if (r.length > maxCols) maxCols = r.length;
      });
      maxCols = Math.min(maxCols, 12); // Cap at 12 columns for readability

      const colWidth = contentWidth / maxCols;
      const rowHeight = 22;
      const rowsPerPage = Math.floor((pageHeight - margin * 2 - 40) / rowHeight);

      let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin - 20;

      // Title
      currentPage.drawText(`${file.name.replace(/\.[^/.]+$/, '')} - ${selectedSheet}`, {
        x: margin,
        y: pageHeight - margin,
        size: 14,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.2),
      });

      let currentRowInPage = 0;

      for (let rIdx = 0; rIdx < rows.length; rIdx++) {
        if (currentRowInPage >= rowsPerPage) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin - 20;
          currentRowInPage = 0;
        }

        const row = rows[rIdx];
        const isHeader = rIdx === 0;

        // Row background
        if (isHeader) {
          currentPage.drawRectangle({
            x: margin,
            y: y - 4,
            width: contentWidth,
            height: rowHeight,
            color: rgb(0.9, 0.93, 0.98),
          });
        } else if (rIdx % 2 === 1) {
          currentPage.drawRectangle({
            x: margin,
            y: y - 4,
            width: contentWidth,
            height: rowHeight,
            color: rgb(0.97, 0.98, 0.99),
          });
        }

        for (let cIdx = 0; cIdx < maxCols; cIdx++) {
          const val = String(row[cIdx] !== undefined ? row[cIdx] : '').trim();
          // Truncate cell text if too long
          const displayVal = val.length > 20 ? val.substring(0, 18) + '...' : val;

          currentPage.drawText(displayVal, {
            x: margin + cIdx * colWidth + 4,
            y: y + 3,
            size: isHeader ? 9 : 8,
            font: isHeader ? fontBold : font,
            color: isHeader ? rgb(0.1, 0.15, 0.3) : rgb(0.2, 0.2, 0.2),
          });
        }

        y -= rowHeight;
        currentRowInPage++;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setPdfBlob(blob);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to convert spreadsheet to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    downloadBlob(pdfBlob, `${baseName}-report.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <UploadZone
        accept=".xlsx,.xls,.csv"
        files={file ? [file] : []}
        onFilesSelected={handleFilesSelected}
        onClearFiles={handleClear}
        title="Select Excel or CSV Spreadsheet"
        subtitle="Convert workbook sheets into a clean, formatted PDF table"
        fileHint=".xlsx, .xls, .csv files"
      />

      {file && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6 shadow-xl">
          {/* Sheet Selector */}
          {sheetNames.length > 1 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Select Sheet to Convert</label>
              <div className="flex flex-wrap gap-2">
                {sheetNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setSelectedSheet(name);
                      setPdfBlob(null);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedSheet === name
                        ? 'bg-purple-600 text-white'
                        : 'bg-[#11182C] text-slate-400 border border-white/[0.06] hover:text-white'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Table Preview */}
          {previewData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-white">Data Preview (First 10 Rows)</span>
                <span>Landscape A4 Format</span>
              </div>
              <div className="rounded-2xl border border-white/[0.06] overflow-x-auto bg-[#11182C]/50 p-2 max-h-60 no-scrollbar">
                <table className="w-full text-left text-xs font-mono">
                  <tbody>
                    {previewData.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className={`border-b border-white/[0.04] ${
                          rIdx === 0 ? 'bg-purple-600/10 font-bold text-white' : 'text-slate-300'
                        }`}
                      >
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-3 py-2 whitespace-nowrap">
                            {String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!pdfBlob ? (
            <DownloadButton
              onClick={convertToPdf}
              label="Generate PDF Document"
              sublabel={`Source: ${file.name}`}
              isProcessing={isProcessing}
            />
          ) : (
            <DownloadButton
              onClick={handleDownload}
              label="Download PDF Table Document"
              sublabel={`File size: ${formatBytes(pdfBlob.size)}`}
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
