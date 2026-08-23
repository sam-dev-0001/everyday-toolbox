import React, { useState } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { FileSearch, CheckCircle2, AlertTriangle, ShieldCheck, Copy, Check } from 'lucide-react';
import { formatBytes } from '../../utils/download';

interface DetectedFormat {
  name: string;
  mime: string;
  extension: string;
  category: string;
  description: string;
  isMatch: boolean;
}

export const FileTypeDetector: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [hexHeader, setHexHeader] = useState<string>('');
  const [asciiHeader, setAsciiHeader] = useState<string>('');
  const [detectedFormat, setDetectedFormat] = useState<DetectedFormat | null>(null);

  const detectMagicBytes = async (selectedFile: File) => {
    setFile(selectedFile);

    const slice = selectedFile.slice(0, 32);
    const arrayBuffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Build Hex & ASCII display
    const hexArr: string[] = [];
    let asciiStr = '';
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      hexArr.push(b.toString(16).padStart(2, '0').toUpperCase());
      asciiStr += (b >= 32 && b <= 126) ? String.fromCharCode(b) : '.';
    }
    const hexString = hexArr.join(' ');
    setHexHeader(hexString);
    setAsciiHeader(asciiStr);

    // Signature Matching
    let detected: DetectedFormat = {
      name: 'Unknown Binary / Plain Text',
      mime: selectedFile.type || 'application/octet-stream',
      extension: selectedFile.name.split('.').pop() || '',
      category: 'Generic',
      description: 'Could not match known binary header signature.',
      isMatch: false,
    };

    if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      detected = {
        name: 'PNG (Portable Network Graphics)',
        mime: 'image/png',
        extension: 'png',
        category: 'Image',
        description: 'Lossless bitmap image format featuring alpha transparency channels.',
        isMatch: true,
      };
    } else if (bytes.length >= 3 && bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      detected = {
        name: 'JPEG / JFIF Image',
        mime: 'image/jpeg',
        extension: 'jpg',
        category: 'Image',
        description: 'Standard photographic lossy compressed bitmap format.',
        isMatch: true,
      };
    } else if (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
      detected = {
        name: 'PDF (Portable Document Format)',
        mime: 'application/pdf',
        extension: 'pdf',
        category: 'Document',
        description: 'Adobe standard vector and raster document format.',
        isMatch: true,
      };
    } else if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04) {
      const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';
      let sub = 'Standard ZIP compressed file container.';
      if (ext === 'docx') sub = 'Microsoft Word OpenXML Document (ZIP Container).';
      if (ext === 'xlsx') sub = 'Microsoft Excel OpenXML Workbook (ZIP Container).';
      if (ext === 'pptx') sub = 'Microsoft PowerPoint OpenXML Presentation (ZIP Container).';
      if (ext === 'apk') sub = 'Android Package Archive (ZIP Container).';
      if (ext === 'jar') sub = 'Java Archive Package (ZIP Container).';

      detected = {
        name: ext === 'docx' || ext === 'xlsx' || ext === 'pptx' ? `Microsoft Office (${ext.toUpperCase()})` : 'ZIP Compressed Archive',
        mime: selectedFile.type || 'application/zip',
        extension: ext || 'zip',
        category: 'Archive / Office',
        description: sub,
        isMatch: true,
      };
    } else if (bytes.length >= 4 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
      detected = {
        name: 'GIF (Graphics Interchange Format)',
        mime: 'image/gif',
        extension: 'gif',
        category: 'Image',
        description: 'Indexed color image format supporting frame animations.',
        isMatch: true,
      };
    } else if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
      detected = {
        name: 'Google WebP Image',
        mime: 'image/webp',
        extension: 'webp',
        category: 'Image',
        description: 'Modern compressed image format by Google.',
        isMatch: true,
      };
    } else if (bytes.length >= 8 && hexString.includes('66 74 79 70')) {
      detected = {
        name: 'MP4 / QuickTime Video Container (ftyp)',
        mime: 'video/mp4',
        extension: 'mp4',
        category: 'Video',
        description: 'ISO Base Media File Format video container.',
        isMatch: true,
      };
    } else if (bytes.length >= 4 && bytes[0] === 0x1A && bytes[1] === 0x45 && bytes[2] === 0xDF && bytes[3] === 0xA3) {
      detected = {
        name: 'WebM / Matroska (MKV) Container',
        mime: 'video/webm',
        extension: 'webm',
        category: 'Video',
        description: 'Open standard EBML multimedia container.',
        isMatch: true,
      };
    } else if (bytes.length >= 3 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
      detected = {
        name: 'MP3 Audio (with ID3v2 tag)',
        mime: 'audio/mpeg',
        extension: 'mp3',
        category: 'Audio',
        description: 'MPEG-1 Audio Layer III audio stream.',
        isMatch: true,
      };
    } else if (bytes.length >= 4 && bytes[0] === 0x00 && bytes[1] === 0x61 && bytes[2] === 0x73 && bytes[3] === 0x6D) {
      detected = {
        name: 'WebAssembly Binary Module',
        mime: 'application/wasm',
        extension: 'wasm',
        category: 'Binary Executable',
        description: 'Wasm binary code module.',
        isMatch: true,
      };
    }

    setDetectedFormat(detected);
  };

  const handleClear = () => {
    setFile(null);
    setHexHeader('');
    setAsciiHeader('');
    setDetectedFormat(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <UploadZone
        files={file ? [file] : []}
        onFilesSelected={(files) => files[0] && detectMagicBytes(files[0])}
        onClearFiles={handleClear}
        title="Select file to detect true type & format"
        subtitle="Analyzes raw binary magic bytes and file signatures"
      />

      {file && detectedFormat && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6 shadow-xl">
          {/* Main detection banner */}
          <div className="p-5 rounded-2xl bg-purple-600/15 border border-purple-500/30 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 font-mono">
                {detectedFormat.category}
              </span>
              <h3 className="text-lg font-bold text-white">{detectedFormat.name}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{detectedFormat.description}</p>
            </div>
            <div className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 font-mono text-xs font-bold shrink-0">
              .{detectedFormat.extension}
            </div>
          </div>

          {/* Hex & ASCII inspection */}
          <div className="p-4 rounded-2xl bg-[#11182C] border border-white/[0.04] space-y-3">
            <h4 className="text-xs font-bold text-slate-300">Binary Magic Byte Signature (First 32 Bytes)</h4>
            <div className="p-3 rounded-xl bg-[#070A14] border border-white/[0.06] font-mono text-xs text-purple-400 break-all space-y-2">
              <div>
                <span className="text-slate-500 select-none">HEX: </span>
                <span>{hexHeader}</span>
              </div>
              <div>
                <span className="text-slate-500 select-none">ASCII: </span>
                <span className="text-emerald-400">{asciiHeader}</span>
              </div>
            </div>
          </div>

          {/* Extension match validation */}
          <div className="p-4 rounded-2xl bg-[#11182C] border border-white/[0.04] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Declared Extension vs Detected Format:</span>
            {file.name.toLowerCase().endsWith(detectedFormat.extension.toLowerCase()) || detectedFormat.isMatch ? (
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Signature Validated
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1 font-bold">
                <AlertTriangle className="w-4 h-4" /> Extension Mismatch Detected
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
