import React, { useState } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { FileText, Info, CheckCircle2, Copy, Check } from 'lucide-react';
import { extractPdfText } from '../../utils/pdfHelper';
import { downloadBlob, downloadText, formatBytes } from '../../utils/download';
import JSZip from 'jszip';

export const PdfToWord: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedPages, setExtractedPages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [docxBlob, setDocxBlob] = useState<Blob | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setExtractedPages([]);
      setDocxBlob(null);
      setErrorMessage(null);
    }
  };

  const handleClear = () => {
    setFile(null);
    setExtractedPages([]);
    setDocxBlob(null);
    setErrorMessage(null);
  };

  /**
   * Constructs a real OpenXML .docx ZIP archive containing extracted PDF text
   */
  const createDocxBlob = async (pageTexts: string[]): Promise<Blob> => {
    const zip = new JSZip();

    // 1. [Content_Types].xml
    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;
    zip.file('[Content_Types].xml', contentTypesXml);

    // 2. _rels/.rels
    const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
    zip.file('_rels/.rels', relsXml);

    // 3. word/document.xml
    let bodyXml = '';
    pageTexts.forEach((pageText, pageIndex) => {
      const paragraphs = pageText.split('\n');
      paragraphs.forEach((p) => {
        const cleanText = p
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
        bodyXml += `<w:p><w:r><w:t>${cleanText}</w:t></w:r></w:p>`;
      });

      if (pageIndex < pageTexts.length - 1) {
        // Page break
        bodyXml += '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
      }
    });

    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyXml}
  </w:body>
</w:document>`;
    zip.file('word/document.xml', documentXml);

    return await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const pageTexts = await extractPdfText(file);
      if (pageTexts.length === 0 || pageTexts.every((t) => !t.trim())) {
        throw new Error('No readable text found in this PDF (it may be a scanned image-only PDF).');
      }

      setExtractedPages(pageTexts);
      const blob = await createDocxBlob(pageTexts);
      setDocxBlob(blob);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to extract text from PDF document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadDocx = () => {
    if (!docxBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    downloadBlob(docxBlob, `${baseName}.docx`);
  };

  const handleDownloadText = () => {
    if (!file || extractedPages.length === 0) return;
    const fullText = extractedPages.join('\n\n--- Page Break ---\n\n');
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    downloadText(fullText, `${baseName}-extracted.txt`);
  };

  const copyText = () => {
    if (extractedPages.length === 0) return;
    const fullText = extractedPages.join('\n\n');
    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      {/* Honest Conversion Notice */}
      <div className="p-4 rounded-2xl bg-[#11182C] border border-purple-500/30 flex items-start gap-3">
        <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-white">Client-Side Text & Structure Extraction</h4>
          <p className="text-slate-300 leading-relaxed">
            Extracts all selectable text, paragraphs, and structure from your PDF directly into a valid editable Microsoft Word (.docx) document 100% locally.
          </p>
        </div>
      </div>

      <UploadZone
        accept="application/pdf"
        files={file ? [file] : []}
        onFilesSelected={handleFilesSelected}
        onClearFiles={handleClear}
        title="Select PDF document"
        subtitle="Extract text and convert into editable Word (.docx) document"
      />

      {file && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6 shadow-xl">
          {!docxBlob ? (
            <DownloadButton
              onClick={handleConvert}
              label="Convert PDF to Word (.docx)"
              sublabel={`File: ${file.name} (${formatBytes(file.size)})`}
              isProcessing={isProcessing}
            />
          ) : (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Extracted {extractedPages.length} Pages</h4>
                    <p className="text-xs text-slate-400 font-mono">
                      Generated valid OpenXML Word (.docx)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyText}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied' : 'Copy Text'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadText}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white cursor-pointer"
                  >
                    Download .TXT
                  </button>
                </div>
              </div>

              {/* Text Preview */}
              <div className="p-4 rounded-2xl bg-[#11182C] border border-white/[0.04] space-y-2">
                <span className="text-xs font-bold text-slate-300">Document Text Preview</span>
                <div className="p-3 rounded-xl bg-[#070A14] border border-white/[0.06] max-h-56 overflow-y-auto text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed no-scrollbar">
                  {extractedPages.join('\n\n--- Page Break ---\n\n')}
                </div>
              </div>

              <DownloadButton
                onClick={handleDownloadDocx}
                label="Download Word Document (.docx)"
                sublabel={`File: ${file.name.replace(/\.[^/.]+$/, '')}.docx (${formatBytes(docxBlob.size)})`}
              />
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
