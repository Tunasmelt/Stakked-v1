/* src/lib/export-media.ts */
import { jsPDF } from 'jspdf';
import { toPng, toCanvas } from 'html-to-image';
import { encode } from 'modern-gif';

export type ExportFormat = 'png' | 'jpeg' | 'pdf' | 'gif';

export interface ExportMediaOptions {
  format: ExportFormat;
  quality?: number;
  pixelRatio?: number;
  filename?: string;
  background?: string;
  duration?: number; // for GIF
  fps?: number; // for GIF
}

/**
 * Advanced Media Export
 * ---------------------
 * Handles high-fidelity capture of the browser canvas to various formats.
 */
export async function exportMedia(node: HTMLElement, options: ExportMediaOptions): Promise<void> {
  const {
    format,
    quality = 0.95,
    pixelRatio = window.devicePixelRatio || 2,
    filename = 'export',
    background = '#0a0a0a',
    duration = 2000,
    fps = 15,
  } = options;

  switch (format) {
    case 'png':
    case 'jpeg': {
      const dataUrl = await toPng(node, {
        quality,
        pixelRatio,
        backgroundColor: background,
        cacheBust: true,
      });
      downloadUrl(dataUrl, `${filename}.${format}`);
      break;
    }

    case 'pdf': {
      const canvas = await toCanvas(node, {
        pixelRatio: 2, // 2x is enough for print
        backgroundColor: background,
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'l' : 'p',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2], // Match canvas "logical" size
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`${filename}.pdf`);
      break;
    }

    case 'gif': {
      // Record frames at pixelRatio=1 so width/height match canvas dimensions exactly
      const frameCount = Math.round((duration / 1000) * fps);
      const interval = Math.round(1000 / fps);

      // Capture a reference frame first to get stable dimensions
      const refCanvas = await toCanvas(node, { pixelRatio: 1, backgroundColor: background });
      const gifWidth = refCanvas.width;
      const gifHeight = refCanvas.height;

      if (process.env.NODE_ENV === 'development') console.log(`[export] recording ${frameCount} frames at ${gifWidth}x${gifHeight}…`);

      const frames: { data: HTMLCanvasElement; delay: number }[] = [];

      for (let i = 0; i < frameCount; i++) {
        const canvas = i === 0
          ? refCanvas
          : await toCanvas(node, { pixelRatio: 1, backgroundColor: background });

        // Push the canvas element directly — HTMLCanvasElement is a CanvasImageSource
        frames.push({ data: canvas, delay: interval });

        if (i < frameCount - 1) {
          await new Promise<void>(resolve => setTimeout(resolve, interval));
        }
      }

      if (process.env.NODE_ENV === 'development') console.log('[export] encoding gif…');
      const gifBlob = await encode({
        width: gifWidth,
        height: gifHeight,
        frames,
      });

      downloadBlob(new Blob([gifBlob], { type: 'image/gif' }), `${filename}.gif`);
      break;
    }
  }
}

function downloadUrl(url: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
