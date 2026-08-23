/**
 * Reusable client-side download and file helper utilities
 */

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // Revoke object URL after a brief delay to free memory safely
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

export function downloadText(content: string, filename: string, mimeType = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string, type = 'image/png', quality = 0.92): Promise<void> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas could not be exported to Blob'));
        return;
      }
      downloadBlob(blob, filename);
      resolve();
    }, type, quality);
  });
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function loadImage(fileOrUrl: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image'));

    if (typeof fileOrUrl === 'string') {
      img.src = fileOrUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error('FileReader returned empty result'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(fileOrUrl);
    }
  });
}
