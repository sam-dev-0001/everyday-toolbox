import React, { useRef, useState } from 'react';
import { UploadCloud, File, X, ShieldCheck, Image as ImageIcon } from 'lucide-react';

interface UploadZoneProps {
  accept?: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  title?: string;
  subtitle?: string;
  fileHint?: string;
  files?: File[];
  onRemoveFile?: (index: number) => void;
  onClearFiles?: () => void;
  showPreview?: boolean;
  maxSizeMB?: number;
  previewUrl?: string | null;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  accept,
  multiple = false,
  onFilesSelected,
  title = 'Choose a file',
  subtitle = 'or drag and drop here',
  fileHint,
  files = [],
  onRemoveFile,
  onClearFiles,
  showPreview = true,
  maxSizeMB = 100,
  previewUrl,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndProcessFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    setErrorMessage(null);

    const validFiles: File[] = [];
    const maxBytes = maxSizeMB * 1024 * 1024;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      if (file.size > maxBytes) {
        setErrorMessage(`File "${file.name}" exceeds the ${maxSizeMB}MB limit.`);
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndProcessFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndProcessFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full space-y-4">
      {/* Drag & Drop Zone */}
      {files.length === 0 && !previewUrl ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all cursor-pointer select-none text-center ${
            isDragging
              ? 'border-purple-500 bg-purple-500/10 scale-[1.01]'
              : 'border-white/[0.12] bg-[#0D1224]/80 hover:bg-[#11182C] hover:border-purple-500/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleInputChange}
            className="hidden"
          />

          {/* Upload Icon */}
          <div className="w-16 h-16 rounded-2xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 shadow-inner">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <p className="text-base sm:text-lg font-bold text-white tracking-tight">
              {title}
            </p>
            <p className="text-xs sm:text-sm text-slate-400">
              {subtitle}
            </p>
          </div>

          {fileHint && (
            <p className="mt-3 text-[11px] font-medium text-slate-400 bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.06]">
              {fileHint}
            </p>
          )}

          {/* Local processing reassurance */}
          <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span>Processed 100% locally in your browser</span>
          </div>
        </div>
      ) : (
        /* Selected Files View */
        <div className="rounded-2xl bg-[#0D1224] border border-white/[0.08] p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                Selected File{files.length > 1 ? 's' : ''} ({files.length})
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" /> Local
              </span>
            </div>

            <div className="flex items-center gap-2">
              {multiple && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-purple-400 hover:text-purple-300 px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20"
                >
                  + Add More
                </button>
              )}
              {onClearFiles && (
                <button
                  type="button"
                  onClick={onClearFiles}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleInputChange}
            className="hidden"
          />

          {/* Image Single Preview */}
          {previewUrl && (
            <div className="relative rounded-xl overflow-hidden bg-[#070A14] border border-white/[0.08] max-h-72 flex items-center justify-center p-2">
              <img
                src={previewUrl}
                alt="Upload preview"
                className="max-h-64 object-contain rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Files List */}
          {files.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
              {files.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#11182C] border border-white/[0.04]"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                      {file.type.startsWith('image/') ? (
                        <ImageIcon className="w-4 h-4" />
                      ) : (
                        <File className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>

                  {onRemoveFile && (
                    <button
                      type="button"
                      onClick={() => onRemoveFile(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08]"
                      aria-label="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-300">
          {errorMessage}
        </div>
      )}
    </div>
  );
};
