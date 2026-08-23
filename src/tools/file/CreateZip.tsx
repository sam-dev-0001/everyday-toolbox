import React, { useState } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { FolderArchive, File, CheckCircle2, ShieldCheck } from 'lucide-react';
import JSZip from 'jszip';
import { downloadBlob, formatBytes } from '../../utils/download';

export const CreateZip: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [zipName, setZipName] = useState<string>('archive');
  const [compressionLevel, setCompressionLevel] = useState<number>(6);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setZipBlob(null);
    setErrorMessage(null);
  };

  const handleRemoveFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setZipBlob(null);
  };

  const handleClear = () => {
    setFiles([]);
    setZipBlob(null);
    setErrorMessage(null);
  };

  const createZipFile = async () => {
    if (files.length === 0) {
      setErrorMessage('Please select at least one file to create a ZIP.');
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const zip = new JSZip();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        zip.file(file.name, arrayBuffer);
      }

      const blob = await zip.generateAsync(
        {
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: compressionLevel },
        }
      );

      setZipBlob(blob);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to create ZIP archive.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!zipBlob) return;
    const cleanName = zipName.trim().replace(/\.zip$/i, '') || 'archive';
    downloadBlob(zipBlob, `${cleanName}.zip`);
  };

  const totalOriginalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <UploadZone
        multiple
        files={files}
        onFilesSelected={handleFilesSelected}
        onRemoveFile={handleRemoveFile}
        onClearFiles={handleClear}
        title="Choose files to compress into ZIP"
        subtitle="Pack documents, images, and folders locally in your browser"
        fileHint="Add as many files as you need"
      />

      {files.length > 0 && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6 shadow-xl">
          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#11182C] border border-white/[0.04] space-y-2">
              <label className="text-xs font-bold text-slate-300">ZIP File Name</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={zipName}
                  onChange={(e) => setZipName(e.target.value)}
                  placeholder="archive"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#070A14] border border-white/[0.08] text-white text-xs font-mono focus:border-purple-500 outline-none"
                />
                <span className="text-xs font-bold text-slate-400 font-mono">.zip</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#11182C] border border-white/[0.04] space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Deflate Compression Level</span>
                <span className="text-purple-400 font-mono">Level {compressionLevel} (Optimal)</span>
              </div>
              <input
                type="range"
                min="1"
                max="9"
                value={compressionLevel}
                onChange={(e) => setCompressionLevel(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          {!zipBlob ? (
            <DownloadButton
              onClick={createZipFile}
              label={`Compress ${files.length} Files into ZIP`}
              sublabel={`Total size: ${formatBytes(totalOriginalSize)}`}
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
                    <h4 className="text-sm font-bold text-white">ZIP Archive Ready</h4>
                    <p className="text-xs text-slate-400 font-mono">
                      {files.length} files packed • {formatBytes(zipBlob.size)} (Original: {formatBytes(totalOriginalSize)})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={createZipFile}
                  className="text-xs font-semibold text-purple-400 hover:text-purple-300 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20"
                >
                  Repack
                </button>
              </div>

              <DownloadButton
                onClick={handleDownload}
                label="Download ZIP Archive"
                sublabel={`${cleanName(zipName)}.zip (${formatBytes(zipBlob.size)})`}
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

function cleanName(n: string) {
  return n.trim().replace(/\.zip$/i, '') || 'archive';
}
