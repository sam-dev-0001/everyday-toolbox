import React, { useState } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { UserSquare2, RefreshCw, Sparkles, Grid } from 'lucide-react';

export const PassportPhotoMaker: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [preset, setPreset] = useState<'us' | 'eu' | 'in'>('us');
  const [sheetLayout, setSheetLayout] = useState<boolean>(true);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
      setOutputUrl(null);
    }
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setFile(null);
    setPreviewUrl(null);
    setOutputUrl(null);
  };

  const generatePassportPhoto = async () => {
    if (!file || !previewUrl) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.src = previewUrl;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });

      // Target individual photo dimensions at 300 DPI
      let targetW = 600; // 2x2 inch at 300 DPI
      let targetH = 600;

      if (preset === 'eu' || preset === 'in') {
        targetW = 413; // 35mm at 300 DPI
        targetH = 531; // 45mm at 300 DPI
      }

      // Crop source image to center portrait
      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = targetW;
      cropCanvas.height = targetH;
      const cropCtx = cropCanvas.getContext('2d');
      if (!cropCtx) throw new Error('Canvas not supported');

      // Crop center aspect ratio
      const srcAspect = img.width / img.height;
      const targetAspect = targetW / targetH;

      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (srcAspect > targetAspect) {
        sw = img.height * targetAspect;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / targetAspect;
        sy = (img.height - sh) / 2;
      }

      cropCtx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);

      // If user wants standard 4x6 inch printable sheet with multiple photos
      if (sheetLayout) {
        const sheetCanvas = document.createElement('canvas');
        sheetCanvas.width = 1800; // 6 inch at 300 DPI
        sheetCanvas.height = 1200; // 4 inch at 300 DPI
        const sheetCtx = sheetCanvas.getContext('2d');
        if (!sheetCtx) throw new Error('Sheet canvas not supported');

        // Clean white background
        sheetCtx.fillStyle = '#FFFFFF';
        sheetCtx.fillRect(0, 0, sheetCanvas.width, sheetCanvas.height);

        // Draw 6 or 8 photos with cutting borders
        const cols = preset === 'us' ? 2 : 4;
        const rows = preset === 'us' ? 2 : 2;
        const gapX = (sheetCanvas.width - cols * targetW) / (cols + 1);
        const gapY = (sheetCanvas.height - rows * targetH) / (rows + 1);

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const posX = gapX + c * (targetW + gapX);
            const posY = gapY + r * (targetH + gapY);

            // Draw photo
            sheetCtx.drawImage(cropCanvas, posX, posY);

            // Draw subtle cutting guideline border
            sheetCtx.strokeStyle = '#E2E8F0';
            sheetCtx.lineWidth = 1;
            sheetCtx.strokeRect(posX, posY, targetW, targetH);
          }
        }

        const blob = await new Promise<Blob | null>((res) =>
          sheetCanvas.toBlob((b) => res(b), 'image/jpeg', 0.95)
        );

        if (blob) {
          setOutputUrl(URL.createObjectURL(blob));
        }
      } else {
        const blob = await new Promise<Blob | null>((res) =>
          cropCanvas.toBlob((b) => res(b), 'image/jpeg', 0.95)
        );
        if (blob) {
          setOutputUrl(URL.createObjectURL(blob));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!outputUrl) return;
    const a = document.createElement('a');
    a.href = outputUrl;
    a.download = `passport-photo-${preset}-${sheetLayout ? '4x6-sheet' : 'single'}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <UploadZone
        accept="image/*"
        files={file ? [file] : []}
        previewUrl={previewUrl}
        onFilesSelected={handleFilesSelected}
        onClearFiles={handleClear}
        title="Upload your portrait / headshot"
        subtitle="Generates standardized US (2x2 in) & EU/Global (35x45mm) passport photo prints"
      />

      {file && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <UserSquare2 className="w-4 h-4 text-purple-400" />
              Passport Standards & Layout
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Standard preset */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Country Standard</span>
              <div className="space-y-2">
                {[
                  { id: 'us', label: 'United States & Canada (2 × 2 inches / 51 × 51 mm)' },
                  { id: 'eu', label: 'EU, UK, Schengen & Global (35 × 45 mm)' },
                  { id: 'in', label: 'India / Asia Standard (35 × 45 mm)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPreset(item.id as 'us' | 'eu' | 'in')}
                    className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                      preset === item.id
                        ? 'bg-purple-600/20 text-purple-300 border-purple-500/50'
                        : 'bg-[#11182C] text-slate-300 border-white/[0.06] hover:border-white/[0.14]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout options */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-300 block">Output Format</span>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setSheetLayout(true)}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                    sheetLayout
                      ? 'bg-purple-600/20 text-purple-300 border-purple-500/50'
                      : 'bg-[#11182C] text-slate-300 border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Grid className="w-4 h-4 text-purple-400" />
                    <span>Printable 4×6 inch Sheet (Multi-Photo with Cut Lines)</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSheetLayout(false)}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                    !sheetLayout
                      ? 'bg-purple-600/20 text-purple-300 border-purple-500/50'
                      : 'bg-[#11182C] text-slate-300 border-white/[0.06]'
                  }`}
                >
                  <span>Single Individual Photo File</span>
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={generatePassportPhoto}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-500/20"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Passport Photos...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Passport Photo</span>
              </>
            )}
          </button>
        </div>
      )}

      {outputUrl && (
        <div className="rounded-3xl bg-[#0D1224] border border-emerald-500/30 p-5 sm:p-7 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-base">Passport Photo Ready</span>
            <span className="text-xs font-mono text-emerald-400">300 DPI High-Resolution Print</span>
          </div>

          <div className="rounded-2xl overflow-hidden bg-white border border-white/[0.06] flex items-center justify-center p-4">
            <img src={outputUrl} alt="Passport photo output" className="max-h-80 object-contain rounded-md shadow-lg" />
          </div>

          <DownloadButton onClick={handleDownload} label="Download Passport Photos (JPG)" />
        </div>
      )}
    </div>
  );
};
