import React, { useState, useRef, useEffect } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { Barcode, Camera, Copy, Check, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';

export const BarcodeScanner: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [scannedResult, setScannedResult] = useState<{ value: string; format?: string } | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      stopCamera();
      setFile(files[0]);
      decodeBarcodeImage(files[0]);
    }
  };

  const decodeBarcodeImage = async (imageFile: File) => {
    setErrorMessage(null);
    setScannedResult(null);

    const img = new Image();
    img.onload = async () => {
      // 1. Try standard browser BarcodeDetector API if supported
      if ('BarcodeDetector' in window) {
        try {
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: [
              'code_128',
              'code_39',
              'code_93',
              'ean_13',
              'ean_8',
              'upc_a',
              'upc_e',
              'itf',
              'qr_code',
              'data_matrix',
            ],
          });
          const barcodes = await barcodeDetector.detect(img);
          if (barcodes && barcodes.length > 0) {
            setScannedResult({
              value: barcodes[0].rawValue,
              format: barcodes[0].format?.toUpperCase() || 'BARCODE',
            });
            return;
          }
        } catch (e) {
          console.warn('BarcodeDetector error:', e);
        }
      }

      // 2. Fallback to jsQR decoder
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });
        if (code && code.data) {
          setScannedResult({
            value: code.data,
            format: '2D / QR',
          });
          return;
        }
      }

      setErrorMessage('No readable barcode detected in this image. Please ensure the lines and digits are clearly visible and sharp.');
    };

    img.onerror = () => {
      setErrorMessage('Failed to load image file.');
    };

    img.src = URL.createObjectURL(imageFile);
  };

  const startCamera = async () => {
    setFile(null);
    setScannedResult(null);
    setErrorMessage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);
        requestAnimationFrame(tickScan);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Unable to access camera. Please check camera permissions or upload an image instead.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsCameraActive(false);
  };

  const tickScan = async () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      if ('BarcodeDetector' in window) {
        try {
          const barcodeDetector = new (window as any).BarcodeDetector();
          const barcodes = await barcodeDetector.detect(videoRef.current);
          if (barcodes && barcodes.length > 0) {
            setScannedResult({
              value: barcodes[0].rawValue,
              format: barcodes[0].format?.toUpperCase() || 'BARCODE',
            });
            stopCamera();
            return;
          }
        } catch (e) {
          // ignore frame errors
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(tickScan);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const copyResult = () => {
    if (!scannedResult) return;
    navigator.clipboard.writeText(scannedResult.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      {/* Camera vs Upload Switch */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            stopCamera();
            setFile(null);
            setScannedResult(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            !isCameraActive ? 'bg-purple-600 text-white shadow-md' : 'bg-[#11182C] text-slate-400 hover:text-white'
          }`}
        >
          Upload Barcode Image
        </button>
        <button
          type="button"
          onClick={startCamera}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            isCameraActive ? 'bg-purple-600 text-white shadow-md' : 'bg-[#11182C] text-slate-400 hover:text-white'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Live Barcode Scan</span>
        </button>
      </div>

      {!isCameraActive ? (
        <UploadZone
          accept="image/*"
          files={file ? [file] : []}
          onFilesSelected={handleFilesSelected}
          onClearFiles={() => {
            setFile(null);
            setScannedResult(null);
            setErrorMessage(null);
          }}
          title="Select or drop barcode image"
          subtitle="Supports Code 128, EAN-13, UPC-A, Code 39, and QR retail barcodes"
          fileHint="Barcode images or product labels"
        />
      ) : (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-4 shadow-xl text-center">
          <div className="relative max-w-md mx-auto aspect-video rounded-2xl overflow-hidden bg-black border-2 border-purple-500/50">
            <video ref={videoRef} className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-2 border-purple-500/30 rounded-2xl pointer-events-none flex items-center justify-center">
              <div className="w-64 h-24 border-2 border-purple-400 rounded-xl animate-pulse" />
            </div>
          </div>
          <p className="text-xs text-slate-400">Position barcode horizontal within frame.</p>
          <button
            type="button"
            onClick={stopCamera}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white cursor-pointer"
          >
            Stop Camera
          </button>
        </div>
      )}

      {/* Scanned Result Banner */}
      {scannedResult && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Decoded Barcode
              </span>
              {scannedResult.format && (
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                  {scannedResult.format}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={copyResult}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Digits'}</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#11182C] border border-white/[0.04]">
            <p className="font-mono text-base font-bold text-white tracking-widest break-all select-all">
              {scannedResult.value}
            </p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
