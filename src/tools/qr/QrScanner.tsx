import React, { useState, useRef, useEffect } from 'react';
import { UploadZone } from '../../components/UploadZone';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { Scan, Camera, Copy, Check, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';

export const QrScanner: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      stopCamera();
      setFile(files[0]);
      decodeImageFile(files[0]);
    }
  };

  const decodeImageFile = (imageFile: File) => {
    setErrorMessage(null);
    setScannedResult(null);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setErrorMessage('Failed to create 2D canvas context.');
        return;
      }

      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        setScannedResult(code.data);
      } else {
        // Try with inversion
        const codeInverted = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });
        if (codeInverted && codeInverted.data) {
          setScannedResult(codeInverted.data);
        } else {
          setErrorMessage('No valid QR code detected in this image. Please ensure the code is clear and well-lit.');
        }
      }
    };

    img.onerror = () => {
      setErrorMessage('Could not load image file.');
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
        requestAnimationFrame(tickVideoScan);
      }
    } catch (err: any) {
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

  const tickVideoScan = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          setScannedResult(code.data);
          stopCamera();
          return;
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(tickVideoScan);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const copyResult = () => {
    if (!scannedResult) return;
    navigator.clipboard.writeText(scannedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUrl = scannedResult && /^(https?:\/\/|www\.)[^\s]+$/i.test(scannedResult);
  const formattedUrl = isUrl && !scannedResult.startsWith('http') ? `https://${scannedResult}` : scannedResult;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      {/* Mode Buttons */}
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
          Upload Image / Screenshot
        </button>
        <button
          type="button"
          onClick={startCamera}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            isCameraActive ? 'bg-purple-600 text-white shadow-md' : 'bg-[#11182C] text-slate-400 hover:text-white'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Use Live Camera</span>
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
          title="Select or drop QR Code image"
          subtitle="Supports PNG, JPG, WebP, screenshots, and photos"
          fileHint="Images with QR codes"
        />
      ) : (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-4 shadow-xl text-center">
          <div className="relative max-w-md mx-auto aspect-square rounded-2xl overflow-hidden bg-black border-2 border-purple-500/50">
            <video ref={videoRef} className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-2 border-purple-500/30 rounded-2xl pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-purple-400 rounded-2xl animate-pulse" />
            </div>
          </div>
          <p className="text-xs text-slate-400">Point your camera directly at any QR code to scan instantly.</p>
          <button
            type="button"
            onClick={stopCamera}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white cursor-pointer"
          >
            Cancel Camera Scan
          </button>
        </div>
      )}

      {/* Scanned Result Banner */}
      {scannedResult && (
        <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1.5">
              <Check className="w-4 h-4" /> QR Code Decoded Successfully
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyResult}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              {isUrl && formattedUrl && (
                <a
                  href={formattedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open URL</span>
                </a>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#11182C] border border-white/[0.04]">
            <p className="font-mono text-xs sm:text-sm text-slate-100 break-all select-all whitespace-pre-wrap">
              {scannedResult}
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
