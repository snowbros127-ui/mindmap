import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import LZString from 'lz-string';
import { MindMap } from '@/types/mindmap';

export async function exportToPng(element: HTMLElement, filename = 'mindmap.png') {
  try {
    const dataUrl = await toPng(element, {
      backgroundColor: '#0b0f19',
      cacheBust: true,
      quality: 0.95,
      pixelRatio: 2,
    });
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
    return true;
  } catch (error) {
    console.error('Error exporting to PNG:', error);
    return false;
  }
}

export async function exportToPdf(element: HTMLElement, filename = 'mindmap.pdf') {
  try {
    const dataUrl = await toJpeg(element, {
      backgroundColor: '#0b0f19',
      quality: 0.95,
      pixelRatio: 2,
    });
    
    const img = new Image();
    img.src = dataUrl;
    
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const pdf = new jsPDF({
      orientation: img.width > img.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [img.width, img.height],
    });

    pdf.addImage(dataUrl, 'JPEG', 0, 0, img.width, img.height);
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
}

export function exportToJson(mindmap: MindMap, filename = 'mindmap.json') {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mindmap, null, 2));
  const link = document.createElement('a');
  link.setAttribute("href", dataStr);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function encodeShareableUrl(mindmap: MindMap): string {
  const jsonStr = JSON.stringify(mindmap);
  return LZString.compressToEncodedURIComponent(jsonStr);
}

export function decodeShareableUrl(encodedStr: string): MindMap | null {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(encodedStr);
    if (decompressed) {
      return JSON.parse(decompressed) as MindMap;
    }
    // Fallback to legacy base64 decoding
    const jsonStr = decodeURIComponent(atob(encodedStr));
    return JSON.parse(jsonStr) as MindMap;
  } catch (error) {
    console.error('Error decoding shareable URL:', error);
    return null;
  }
}
