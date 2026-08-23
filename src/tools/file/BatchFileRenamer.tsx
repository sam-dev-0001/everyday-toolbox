import React, { useState, useMemo } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { RefreshCw, Download, ArrowRight, CheckCircle2, Sliders } from 'lucide-react';
import JSZip from 'jszip';
import { downloadBlob, formatBytes } from '../../utils/download';

export const BatchFileRenamer: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [prefix, setPrefix] = useState<string>('');
  const [suffix, setSuffix] = useState<string>('');
  const [findText, setFindText] = useState<string>('');
  const [replaceText, setReplaceText] = useState<string>('');
  const [caseTransform, setCaseTransform] = useState<'none' | 'lower' | 'upper' | 'kebab' | 'snake'>('none');
  const [enableNumbering, setEnableNumbering] = useState<boolean>(false);
  const [numberStart, setNumberStart] = useState<number>(1);
  const [numberDigits, setNumberDigits] = useState<number>(3);
  const [customBaseName, setCustomBaseName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [renamedZipBlob, setRenamedZipBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setRenamedZipBlob(null);
    setErrorMessage(null);
  };

  const handleRemoveFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setRenamedZipBlob(null);
  };

  const handleClear = () => {
    setFiles([]);
    setRenamedZipBlob(null);
    setErrorMessage(null);
  };

  // Generate preview of renamed files
  const renamedList = useMemo(() => {
    return files.map((file, idx) => {
      const lastDot = file.name.lastIndexOf('.');
      let nameWithoutExt = lastDot !== -1 ? file.name.substring(0, lastDot) : file.name;
      const ext = lastDot !== -1 ? file.name.substring(lastDot) : '';

      // 1. Custom base name replace
      if (customBaseName.trim()) {
        nameWithoutExt = customBaseName.trim();
      }

      // 2. Find & Replace
      if (findText) {
        nameWithoutExt = nameWithoutExt.replaceAll(findText, replaceText);
      }

      // 3. Case transforms
      if (caseTransform === 'lower') {
        nameWithoutExt = nameWithoutExt.toLowerCase();
      } else if (caseTransform === 'upper') {
        nameWithoutExt = nameWithoutExt.toUpperCase();
      } else if (caseTransform === 'kebab') {
        nameWithoutExt = nameWithoutExt.replace(/[\s_]+/g, '-').toLowerCase();
      } else if (caseTransform === 'snake') {
        nameWithoutExt = nameWithoutExt.replace(/[\s-]+/g, '_').toLowerCase();
      }

      // 4. Numbering sequence
      let numberStr = '';
      if (enableNumbering) {
        const num = numberStart + idx;
        numberStr = `-${num.toString().padStart(numberDigits, '0')}`;
      }

      // 5. Prefix & Suffix
      const finalName = `${prefix}${nameWithoutExt}${suffix}${numberStr}${ext}`;

      return {
        original: file,
        originalName: file.name,
        newName: finalName,
      };
    });
  }, [files, prefix, suffix, findText, replaceText, caseTransform, enableNumbering, numberStart, numberDigits, customBaseName]);

  const processAndDownloadZip = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const zip = new JSZip();

      for (const item of renamedList) {
        const buffer = await item.original.arrayBuffer();
        zip.file(item.newName, buffer);
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      setRenamedZipBlob(blob);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to generate renamed ZIP archive.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!renamedZipBlob) return;
    downloadBlob(renamedZipBlob, 'renamed-files.zip');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <UploadZone
        multiple
        files={files}
        onFilesSelected={handleFilesSelected}
        onRemoveFile={handleRemoveFile}
        onClearFiles={handleClear}
        title="Select files to batch rename"
        subtitle="Apply prefixes, find & replace, numbering sequence, and case styling"
        fileHint="Add multiple files at once"
      />

      {files.length > 0 && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6 shadow-xl">
          {/* Renaming Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Prefix</label>
              <input
                type="text"
                placeholder="e.g. project_"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#11182C] border border-white/[0.08] text-white text-xs font-mono focus:border-purple-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Suffix</label>
              <input
                type="text"
                placeholder="e.g. _v2"
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#11182C] border border-white/[0.08] text-white text-xs font-mono focus:border-purple-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Base Name (Optional)</label>
              <input
                type="text"
                placeholder="Replace all original names"
                value={customBaseName}
                onChange={(e) => setCustomBaseName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#11182C] border border-white/[0.08] text-white text-xs font-mono focus:border-purple-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Find Text</label>
              <input
                type="text"
                placeholder="Text to replace"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#11182C] border border-white/[0.08] text-white text-xs font-mono focus:border-purple-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Replace With</label>
              <input
                type="text"
                placeholder="Replacement text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#11182C] border border-white/[0.08] text-white text-xs font-mono focus:border-purple-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Case Transform</label>
              <select
                value={caseTransform}
                onChange={(e) => setCaseTransform(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#11182C] border border-white/[0.08] text-white text-xs font-mono focus:border-purple-500 outline-none"
              >
                <option value="none">No Case Change</option>
                <option value="lower">lowercase</option>
                <option value="upper">UPPERCASE</option>
                <option value="kebab">kebab-case</option>
                <option value="snake">snake_case</option>
              </select>
            </div>
          </div>

          {/* Numbering toggle */}
          <div className="p-4 rounded-2xl bg-[#11182C] border border-white/[0.04] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={enableNumbering}
                onChange={(e) => setEnableNumbering(e.target.checked)}
                className="w-4 h-4 rounded accent-purple-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-white">Add Auto-Incrementing Number Sequence</span>
            </label>

            {enableNumbering && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400">Start:</span>
                  <input
                    type="number"
                    min="0"
                    value={numberStart}
                    onChange={(e) => setNumberStart(Number(e.target.value))}
                    className="w-16 px-2 py-1 rounded-lg bg-[#070A14] border border-white/[0.08] text-white text-xs font-mono"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400">Digits:</span>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={numberDigits}
                    onChange={(e) => setNumberDigits(Number(e.target.value))}
                    className="w-14 px-2 py-1 rounded-lg bg-[#070A14] border border-white/[0.08] text-white text-xs font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Live Preview List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-white">Live Renaming Preview ({renamedList.length} Files)</span>
            </div>
            <div className="space-y-1.5 max-h-56 overflow-y-auto no-scrollbar">
              {renamedList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#11182C] border border-white/[0.04] text-xs font-mono"
                >
                  <span className="text-slate-400 truncate max-w-[45%]">{item.originalName}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="text-emerald-400 font-bold truncate max-w-[45%]">{item.newName}</span>
                </div>
              ))}
            </div>
          </div>

          {!renamedZipBlob ? (
            <DownloadButton
              onClick={processAndDownloadZip}
              label={`Package & Rename ${files.length} Files`}
              isProcessing={isProcessing}
            />
          ) : (
            <DownloadButton
              onClick={handleDownload}
              label="Download Renamed Files (ZIP)"
              sublabel={`File size: ${formatBytes(renamedZipBlob.size)}`}
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
