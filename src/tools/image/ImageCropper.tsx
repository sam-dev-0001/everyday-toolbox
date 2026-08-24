import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import {
  Crop,
  Sparkles,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Grid,
  Check,
  Download,
} from 'lucide-react';

type AspectPreset = 'free' | '1:1' | '4:3' | '16:9' | '3:2' | '9:16';

interface CropRect {
  x: number; // 0 to 1 fraction of image
  y: number;
  width: number;
  height: number;
}

type DragHandle =
  | 'move'
  | 'nw'
  | 'ne'
  | 'se'
  | 'sw'
  | 'n'
  | 's'
  | 'e'
  | 'w';

export const ImageCropper: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const [aspectPreset, setAspectPreset] = useState<AspectPreset>('free');
  const [crop, setCrop] = useState<CropRect>({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
  const [zoom, setZoom] = useState<number>(1);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{
    handle: DragHandle;
    startX: number;
    startY: number;
    startCrop: CropRect;
    rectWidth: number;
    rectHeight: number;
  } | null>(null);

  // Multi-touch pinch tracking
  const pinchRef = useRef<{ dist: number; startZoom: number } | null>(null);

  const getTargetAspect = useCallback((preset: AspectPreset): number | null => {
    switch (preset) {
      case '1:1':
        return 1;
      case '4:3':
        return 4 / 3;
      case '16:9':
        return 16 / 9;
      case '3:2':
        return 3 / 2;
      case '9:16':
        return 9 / 16;
      default:
        return null;
    }
  }, []);

  const calculateInitialCrop = useCallback(
    (preset: AspectPreset, natW: number, natH: number): CropRect => {
      const targetAspect = getTargetAspect(preset);
      if (!targetAspect || natW === 0 || natH === 0) {
        return { x: 0.1, y: 0.1, width: 0.8, height: 0.8 };
      }

      // targetAspect = (w_px) / (h_px) = (crop.w * natW) / (crop.h * natH)
      // crop.h = crop.w * (natW / (natH * targetAspect))
      let w = 0.8;
      let h = w * (natW / (natH * targetAspect));

      if (h > 0.85) {
        h = 0.85;
        w = h * ((natH * targetAspect) / natW);
      }

      w = Math.min(Math.max(w, 0.1), 0.95);
      h = Math.min(Math.max(h, 0.1), 0.95);

      const x = Math.max(0, (1 - w) / 2);
      const y = Math.max(0, (1 - h) / 2);

      return { x, y, width: w, height: h };
    },
    [getTargetAspect]
  );

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
      setCroppedUrl(null);
      setZoom(1);

      const img = new Image();
      img.src = url;
      img.onload = () => {
        setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
        setCrop(calculateInitialCrop(aspectPreset, img.naturalWidth, img.naturalHeight));
      };
    }
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (croppedUrl) URL.revokeObjectURL(croppedUrl);
    setFile(null);
    setPreviewUrl(null);
    setCroppedUrl(null);
    setNaturalSize({ width: 0, height: 0 });
    setZoom(1);
  };

  const handlePresetSelect = (preset: AspectPreset) => {
    setAspectPreset(preset);
    if (naturalSize.width > 0 && naturalSize.height > 0) {
      setCrop(calculateInitialCrop(preset, naturalSize.width, naturalSize.height));
    }
  };

  const handleResetCrop = () => {
    setZoom(1);
    if (naturalSize.width > 0 && naturalSize.height > 0) {
      setCrop(calculateInitialCrop(aspectPreset, naturalSize.width, naturalSize.height));
    }
  };

  // Pointer drag handling for moving crop box and 8 handles
  const handlePointerDown = (e: React.PointerEvent, handle: DragHandle) => {
    e.preventDefault();
    e.stopPropagation();

    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();

    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    dragRef.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...crop },
      rectWidth: rect.width,
      rectHeight: rect.height,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !imgRef.current) return;
    e.preventDefault();

    const { handle, startX, startY, startCrop, rectWidth, rectHeight } = dragRef.current;
    if (rectWidth === 0 || rectHeight === 0) return;

    const dx = (e.clientX - startX) / rectWidth;
    const dy = (e.clientY - startY) / rectHeight;

    const targetAspect = getTargetAspect(aspectPreset);
    const aspectFactor = targetAspect && naturalSize.width > 0 && naturalSize.height > 0
      ? naturalSize.width / (naturalSize.height * targetAspect)
      : null;

    let { x, y, width, height } = startCrop;
    const minSize = 0.05;

    if (handle === 'move') {
      x = Math.max(0, Math.min(1 - width, startCrop.x + dx));
      y = Math.max(0, Math.min(1 - height, startCrop.y + dy));
    } else {
      if (aspectFactor) {
        // Locked aspect ratio adjustments
        if (handle === 'se') {
          let newW = Math.max(minSize, Math.min(1 - startCrop.x, startCrop.width + dx));
          let newH = newW * aspectFactor;
          if (startCrop.y + newH > 1) {
            newH = 1 - startCrop.y;
            newW = newH / aspectFactor;
          }
          width = newW;
          height = newH;
        } else if (handle === 'nw') {
          let newW = Math.max(minSize, Math.min(startCrop.x + startCrop.width, startCrop.width - dx));
          let newH = newW * aspectFactor;
          if (startCrop.y + startCrop.height - newH < 0) {
            newH = startCrop.y + startCrop.height;
            newW = newH / aspectFactor;
          }
          x = startCrop.x + startCrop.width - newW;
          y = startCrop.y + startCrop.height - newH;
          width = newW;
          height = newH;
        } else if (handle === 'ne') {
          let newW = Math.max(minSize, Math.min(1 - startCrop.x, startCrop.width + dx));
          let newH = newW * aspectFactor;
          if (startCrop.y + startCrop.height - newH < 0) {
            newH = startCrop.y + startCrop.height;
            newW = newH / aspectFactor;
          }
          y = startCrop.y + startCrop.height - newH;
          width = newW;
          height = newH;
        } else if (handle === 'sw') {
          let newW = Math.max(minSize, Math.min(startCrop.x + startCrop.width, startCrop.width - dx));
          let newH = newW * aspectFactor;
          if (startCrop.y + newH > 1) {
            newH = 1 - startCrop.y;
            newW = newH / aspectFactor;
          }
          x = startCrop.x + startCrop.width - newW;
          width = newW;
          height = newH;
        } else if (handle === 'e' || handle === 'w') {
          let newW = handle === 'e'
            ? Math.max(minSize, Math.min(1 - startCrop.x, startCrop.width + dx))
            : Math.max(minSize, Math.min(startCrop.x + startCrop.width, startCrop.width - dx));
          let newH = newW * aspectFactor;
          if (startCrop.y + newH > 1) {
            newH = 1 - startCrop.y;
            newW = newH / aspectFactor;
          }
          if (handle === 'w') x = startCrop.x + startCrop.width - newW;
          width = newW;
          height = newH;
        } else if (handle === 'n' || handle === 's') {
          let newH = handle === 's'
            ? Math.max(minSize, Math.min(1 - startCrop.y, startCrop.height + dy))
            : Math.max(minSize, Math.min(startCrop.y + startCrop.height, startCrop.height - dy));
          let newW = newH / aspectFactor;
          if (startCrop.x + newW > 1) {
            newW = 1 - startCrop.x;
            newH = newW * aspectFactor;
          }
          if (handle === 'n') y = startCrop.y + startCrop.height - newH;
          width = newW;
          height = newH;
        }
      } else {
        // Freeform adjustments
        if (handle.includes('e')) {
          width = Math.max(minSize, Math.min(1 - startCrop.x, startCrop.width + dx));
        }
        if (handle.includes('w')) {
          const maxLeftShift = startCrop.x + startCrop.width - minSize;
          const shift = Math.max(-startCrop.x, Math.min(maxLeftShift - startCrop.x, dx));
          x = startCrop.x + shift;
          width = startCrop.width - shift;
        }
        if (handle.includes('s')) {
          height = Math.max(minSize, Math.min(1 - startCrop.y, startCrop.height + dy));
        }
        if (handle.includes('n')) {
          const maxTopShift = startCrop.y + startCrop.height - minSize;
          const shift = Math.max(-startCrop.y, Math.min(maxTopShift - startCrop.y, dy));
          y = startCrop.y + shift;
          height = startCrop.height - shift;
        }
      }
    }

    setCrop({
      x: Math.max(0, Math.min(1 - width, x)),
      y: Math.max(0, Math.min(1 - height, y)),
      width: Math.max(minSize, Math.min(1, width)),
      height: Math.max(minSize, Math.min(1, height)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragRef.current) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      dragRef.current = null;
    }
  };

  // Wheel zoom handler on image container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((z) => Math.min(3, Math.max(1, +(z + delta).toFixed(2))));
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', onWheel);
    };
  }, []);

  // Multi-touch gestures (pinch zoom)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      pinchRef.current = { dist, startZoom: zoom };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const ratio = dist / pinchRef.current.dist;
      setZoom(Math.min(3, Math.max(1, +(pinchRef.current.startZoom * ratio).toFixed(2))));
    }
  };

  const handleTouchEnd = () => {
    pinchRef.current = null;
  };

  // Pixel calculations for overlay and preview stats
  const pixelCrop = {
    width: Math.round(crop.width * naturalSize.width),
    height: Math.round(crop.height * naturalSize.height),
    x: Math.round(crop.x * naturalSize.width),
    y: Math.round(crop.y * naturalSize.height),
  };

  // High-precision lossless crop execution
  const performCrop = async () => {
    if (!file || !previewUrl || naturalSize.width === 0) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.src = previewUrl;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });

      const actualX = Math.round(crop.x * img.naturalWidth);
      const actualY = Math.round(crop.y * img.naturalHeight);
      const actualW = Math.max(1, Math.round(crop.width * img.naturalWidth));
      const actualH = Math.max(1, Math.round(crop.height * img.naturalHeight));

      const canvas = document.createElement('canvas');
      canvas.width = actualW;
      canvas.height = actualH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(img, actualX, actualY, actualW, actualH, 0, 0, actualW, actualH);

      const blob = await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), 'image/png'));

      if (blob) {
        if (croppedUrl) URL.revokeObjectURL(croppedUrl);
        const url = URL.createObjectURL(blob);
        setCroppedUrl(url);
      }
    } catch (err) {
      console.error('Cropping error', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!croppedUrl || !file) return;
    const a = document.createElement('a');
    a.href = croppedUrl;
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    a.download = `${nameWithoutExt}-cropped.png`;
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
        title="Choose image to crop"
        subtitle="Cut out exact areas with precision interactive handles"
      />

      {file && previewUrl && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6 shadow-xl">
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Crop className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Interactive Image Cropper</h2>
                <p className="text-xs text-slate-400">
                  Drag box to move • Drag handles to resize • Pinch/wheel to zoom
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  showGrid
                    ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                    : 'bg-[#11182C] text-slate-400 border-white/[0.06] hover:text-white'
                }`}
                title="Toggle 3x3 Rule-of-Thirds Grid"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>

              <button
                type="button"
                onClick={handleResetCrop}
                className="px-3 py-2 rounded-xl bg-[#11182C] text-slate-300 hover:text-white border border-white/[0.06] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Reset Crop to Default"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Aspect Ratio Presets Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Aspect Ratio Preset</span>
              <span className="text-xs font-mono text-purple-400">
                {pixelCrop.width} × {pixelCrop.height} px
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { id: 'free', label: 'Free' },
                { id: '1:1', label: '1:1 Square' },
                { id: '4:3', label: '4:3 Standard' },
                { id: '16:9', label: '16:9 Wide' },
                { id: '3:2', label: '3:2 Classic' },
                { id: '9:16', label: '9:16 Reel' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetSelect(p.id as AspectPreset)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
                    aspectPreset === p.id
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold'
                      : 'bg-[#11182C] text-slate-300 border border-white/[0.06] hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom Slider Control */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#11182C] border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))}
              className="p-1.5 rounded-lg bg-white/[0.04] text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}
              className="p-1.5 rounded-lg bg-white/[0.04] text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-300 w-12 text-right">{zoom.toFixed(1)}×</span>
          </div>

          {/* Interactive Crop Viewport */}
          <div
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative mx-auto rounded-2xl overflow-hidden bg-[#070A14] border border-white/[0.12] flex items-center justify-center p-2 sm:p-6 select-none min-h-[300px] max-h-[540px]"
            style={{ touchAction: 'none' }}
          >
            <div
              className="relative inline-block transition-transform duration-75 origin-center"
              style={{ transform: `scale(${zoom})` }}
            >
              <img
                ref={imgRef}
                src={previewUrl}
                alt="Crop preview target"
                draggable={false}
                className="max-h-[440px] max-w-full w-auto h-auto block select-none pointer-events-none rounded-lg"
              />

              {/* Darkened Mask Overlays (top, bottom, left, right) */}
              <div
                className="absolute bg-black/60 pointer-events-none"
                style={{ top: 0, left: 0, right: 0, height: `${crop.y * 100}%` }}
              />
              <div
                className="absolute bg-black/60 pointer-events-none"
                style={{
                  top: `${(crop.y + crop.height) * 100}%`,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
              <div
                className="absolute bg-black/60 pointer-events-none"
                style={{
                  top: `${crop.y * 100}%`,
                  left: 0,
                  width: `${crop.x * 100}%`,
                  height: `${crop.height * 100}%`,
                }}
              />
              <div
                className="absolute bg-black/60 pointer-events-none"
                style={{
                  top: `${crop.y * 100}%`,
                  left: `${(crop.x + crop.width) * 100}%`,
                  right: 0,
                  height: `${crop.height * 100}%`,
                }}
              />

              {/* Active Crop Box */}
              <div
                onPointerDown={(e) => handlePointerDown(e, 'move')}
                className="absolute border-2 border-purple-400 bg-purple-500/10 cursor-move shadow-2xl"
                style={{
                  left: `${crop.x * 100}%`,
                  top: `${crop.y * 100}%`,
                  width: `${crop.width * 100}%`,
                  height: `${crop.height * 100}%`,
                  touchAction: 'none',
                }}
              >
                {/* 3x3 Rule-of-Thirds Grid */}
                {showGrid && (
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
                    <div className="border-r border-b border-white/25" />
                    <div className="border-r border-b border-white/25" />
                    <div className="border-b border-white/25" />
                    <div className="border-r border-b border-white/25" />
                    <div className="border-r border-b border-white/25" />
                    <div className="border-b border-white/25" />
                    <div className="border-r border-white/25" />
                    <div className="border-r border-white/25" />
                    <div />
                  </div>
                )}

                {/* 4 Corner Handles with large comfortable touch targets */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'nw')}
                  className="absolute -top-3 -left-3 w-6 h-6 flex items-center justify-center cursor-nwse-resize z-20"
                >
                  <span className="w-3.5 h-3.5 bg-white border-2 border-purple-600 rounded-full shadow-md" />
                </div>
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'ne')}
                  className="absolute -top-3 -right-3 w-6 h-6 flex items-center justify-center cursor-nesw-resize z-20"
                >
                  <span className="w-3.5 h-3.5 bg-white border-2 border-purple-600 rounded-full shadow-md" />
                </div>
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'sw')}
                  className="absolute -bottom-3 -left-3 w-6 h-6 flex items-center justify-center cursor-nesw-resize z-20"
                >
                  <span className="w-3.5 h-3.5 bg-white border-2 border-purple-600 rounded-full shadow-md" />
                </div>
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'se')}
                  className="absolute -bottom-3 -right-3 w-6 h-6 flex items-center justify-center cursor-nwse-resize z-20"
                >
                  <span className="w-3.5 h-3.5 bg-white border-2 border-purple-600 rounded-full shadow-md" />
                </div>

                {/* 4 Edge Handles */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'n')}
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-4 flex items-center justify-center cursor-ns-resize z-20"
                >
                  <span className="w-4 h-1.5 bg-white border border-purple-600 rounded-full shadow-md" />
                </div>
                <div
                  onPointerDown={(e) => handlePointerDown(e, 's')}
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-4 flex items-center justify-center cursor-ns-resize z-20"
                >
                  <span className="w-4 h-1.5 bg-white border border-purple-600 rounded-full shadow-md" />
                </div>
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'w')}
                  className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-8 flex items-center justify-center cursor-ew-resize z-20"
                >
                  <span className="w-1.5 h-4 bg-white border border-purple-600 rounded-full shadow-md" />
                </div>
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'e')}
                  className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-8 flex items-center justify-center cursor-ew-resize z-20"
                >
                  <span className="w-1.5 h-4 bg-white border border-purple-600 rounded-full shadow-md" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={performCrop}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-500/20"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing Crop...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Crop Selection ({pixelCrop.width} × {pixelCrop.height} px)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Cropped Output Card */}
      {croppedUrl && (
        <div className="rounded-3xl bg-[#0D1224] border border-emerald-500/30 p-5 sm:p-7 space-y-6 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Check className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base">Cropped Image Ready</span>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              {pixelCrop.width} × {pixelCrop.height} px • Lossless PNG
            </span>
          </div>

          <div className="rounded-2xl overflow-hidden bg-[#070A14] border border-white/[0.06] flex items-center justify-center p-4">
            <img
              src={croppedUrl}
              alt="Cropped output result"
              className="max-h-72 object-contain rounded-lg shadow-lg"
            />
          </div>

          <DownloadButton onClick={handleDownload} label="Download Cropped Image" />
        </div>
      )}
    </div>
  );
};

