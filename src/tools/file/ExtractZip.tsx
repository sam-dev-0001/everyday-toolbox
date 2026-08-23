import React, { useState } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { FolderOpen, File, Download, Eye, CheckCircle2, RefreshCw } from 'lucide-react';
import JSZip from 'jszip';
import { downloadBlob, formatBytes } from '../../utils/download';

interface ZipEntryInfo {
  name: string;
  isDir: boolean;
  uncompressedSize: number;
  date: Date;
  entry: JSZip.JSZipObject;
}

export const ExtractZip: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [entries, setEntries] = useState<ZipEntryInfo[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedEntryPreview, setSelectedEntryPreview] = useState<{ name: string; content: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      setEntries([]);
      setSelectedEntryPreview(null);
      setErrorMessage(null);
      setIsProcessing(true);

      try {
        const arrayBuffer = await selected.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);
        const list: ZipEntryInfo[] = [];

        zip.forEach((relativePath, entry) => {
          list.push({
            name: relativePath,
            isDir: entry.dir,
            uncompressedSize: (entry as any)._data?.uncompressedSize || 0,
            date: entry.date,
            entry,
          });
        });

        // Sort folders first, then alphabetically
        list.sort((a, b) => {
          if (a.isDir && !b.isDir) return -1;
          if (!a.isDir && b.isDir) return 1;
          return a.name.localeCompare(b.name);
        });

        setEntries(list);
      } catch (err: any) {
        console.error(err);
        setErrorMessage('Failed to read ZIP archive. Please ensure it is a valid .zip file.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleClear = () => {
    setFile(null);
    setEntries([]);
    setSelectedEntryPreview(null);
    setErrorMessage(null);
  };

  const downloadSingleEntry = async (entryInfo: ZipEntryInfo) => {
    try {
      const blob = await entryInfo.entry.async('blob');
      const filename = entryInfo.name.split('/').pop() || entryInfo.name;
      downloadBlob(blob, filename);
    } catch (err) {
      console.error(err);
      setErrorMessage(`Failed to extract "${entryInfo.name}"`);
    }
  };

  const previewTextEntry = async (entryInfo: ZipEntryInfo) => {
    try {
      const text = await entryInfo.entry.async('text');
      setSelectedEntryPreview({
        name: entryInfo.name,
        content: text.slice(0, 10000), // Cap at 10KB preview
      });
    } catch (err) {
      console.error(err);
    }
  };

  const downloadAllExtracted = async () => {
    if (!file) return;
    // Download all files individually or repack
    for (const entryInfo of entries) {
      if (!entryInfo.isDir) {
        await downloadSingleEntry(entryInfo);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <UploadZone
        accept=".zip,application/zip"
        files={file ? [file] : []}
        onFilesSelected={handleFilesSelected}
        onClearFiles={handleClear}
        title="Select ZIP archive to extract"
        subtitle="Inspect and decompress files directly in your browser"
        fileHint=".zip archives"
      />

      {file && entries.length > 0 && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Archive Contents</h3>
              <p className="text-xs text-slate-400 font-mono">
                {entries.filter((e) => !e.isDir).length} files, {entries.filter((e) => e.isDir).length} folders
              </p>
            </div>

            <button
              type="button"
              onClick={downloadAllExtracted}
              className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download All Files</span>
            </button>
          </div>

          {/* List of files */}
          <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
            {entries.map((entry, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-[#11182C] border border-white/[0.04] hover:border-white/[0.1] transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                    {entry.isDir ? <FolderOpen className="w-4 h-4 text-amber-400" /> : <File className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-white truncate font-mono">
                      {entry.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {entry.isDir ? 'Directory' : formatBytes(entry.uncompressedSize)} •{' '}
                      {entry.date.toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {!entry.isDir && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {entry.name.match(/\.(txt|json|js|ts|html|css|md|xml|csv|log)$/i) && (
                      <button
                        type="button"
                        onClick={() => previewTextEntry(entry)}
                        className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-slate-300"
                        title="Preview text"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => downloadSingleEntry(entry)}
                      className="py-1.5 px-3 rounded-lg bg-white/[0.06] hover:bg-purple-600 hover:text-white text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Download className="w-3 h-3" />
                      <span>Extract</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Text preview modal / box */}
          {selectedEntryPreview && (
            <div className="p-4 rounded-2xl bg-[#070A14] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 font-mono">
                  {selectedEntryPreview.name}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedEntryPreview(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-[#11182C] text-xs font-mono text-slate-300 max-h-48 overflow-y-auto no-scrollbar whitespace-pre-wrap">
                {selectedEntryPreview.content}
              </pre>
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
