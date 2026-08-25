import React, { useState } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { Sparkles, ShieldCheck, AlertCircle, Clock } from 'lucide-react';

interface OfficePdfPlaceholderProps {
  toolName: string;
  sourceFormat: string;
  targetFormat: string;
  description: string;
}

export const OfficePdfPlaceholder: React.FC<OfficePdfPlaceholderProps> = ({
  toolName,
  sourceFormat,
  targetFormat,
  description,
}) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      {/* Honest Privacy Reassurance Banner */}
      <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-start gap-3">
        <Clock className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">Browser-Only Processing Notice</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Everyday Tool is strictly <strong>100% client-side with zero backend servers</strong> to protect your total file privacy.
            Complex binary Office parsing ({sourceFormat} ➔ {targetFormat}) requires specialized server rendering suites and is currently in active WebAssembly development for full browser-side execution in Version 2.
          </p>
        </div>
      </div>

      <UploadZone
        accept={`.${sourceFormat.toLowerCase()},application/pdf`}
        files={file ? [file] : []}
        onFilesSelected={handleFilesSelected}
        onClearFiles={() => setFile(null)}
        title={`Select ${sourceFormat} file`}
        subtitle={`Prepare to convert ${sourceFormat} to ${targetFormat}`}
      />

      {file && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-6 sm:p-8 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/15 text-purple-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">
              {toolName} — WebAssembly Engine Coming Soon
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We never pretend conversions work when they cannot be reliably executed inside your browser without leaking your private documents to third-party cloud servers.
            </p>
          </div>

          <div className="pt-3 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero server upload commitment</span>
          </div>
        </div>
      )}
    </div>
  );
};
