import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker source
try {
  // Using unpkg cdn matching installed version for reliable browser worker loading
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
} catch (e) {
  console.warn('PDF.js worker setup fallback:', e);
}

export interface RenderedPdfPage {
  pageNumber: number;
  canvas: HTMLCanvasElement;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Loads a PDF file and renders all pages to canvas / data URLs
 */
export async function renderPdfPages(
  fileOrBuffer: File | ArrayBuffer | Uint8Array,
  scale = 1.5,
  onProgress?: (current: number, total: number) => void
): Promise<RenderedPdfPage[]> {
  let arrayBuffer: ArrayBuffer;
  if (fileOrBuffer instanceof File) {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  } else if (fileOrBuffer instanceof Uint8Array) {
    arrayBuffer = fileOrBuffer.buffer.slice(fileOrBuffer.byteOffset, fileOrBuffer.byteOffset + fileOrBuffer.byteLength);
  } else {
    arrayBuffer = fileOrBuffer;
  }

  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const results: RenderedPdfPage[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas 2D context');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx,
      viewport: viewport,
      canvas: canvas as any,
    }).promise;

    const dataUrl = canvas.toDataURL('image/png');
    results.push({
      pageNumber: pageNum,
      canvas,
      dataUrl,
      width: viewport.width,
      height: viewport.height,
    });

    if (onProgress) {
      onProgress(pageNum, numPages);
    }
  }

  return results;
}

/**
 * Extracts plain text content from all pages of a PDF
 */
export async function extractPdfText(
  fileOrBuffer: File | ArrayBuffer | Uint8Array
): Promise<string[]> {
  let arrayBuffer: ArrayBuffer;
  if (fileOrBuffer instanceof File) {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  } else if (fileOrBuffer instanceof Uint8Array) {
    arrayBuffer = fileOrBuffer.buffer.slice(fileOrBuffer.byteOffset, fileOrBuffer.byteOffset + fileOrBuffer.byteLength);
  } else {
    arrayBuffer = fileOrBuffer;
  }

  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const textItems = textContent.items.map((item: any) => item.str || '');
    pageTexts.push(textItems.join(' '));
  }

  return pageTexts;
}
