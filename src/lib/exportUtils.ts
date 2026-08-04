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

/**
 * Encodes MindMap into a 100% URL-safe compressed Base64URL string
 */
export function encodeShareableUrl(mindmap: MindMap): string {
  try {
    const jsonStr = JSON.stringify(mindmap);
    const compressedBase64 = LZString.compressToBase64(jsonStr);
    // Convert Base64 to URL-safe Base64URL (replace + with -, / with _, drop padding =)
    return compressedBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (e) {
    console.error('Error encoding shareable URL:', e);
    return '';
  }
}

/**
 * Decodes compressed Base64URL string back into MindMap with multiple fallbacks
 */
export function decodeShareableUrl(encodedStr: string): MindMap | null {
  if (!encodedStr) return null;

  try {
    const raw = decodeURIComponent(encodedStr).trim();

    // 1. Try URL-safe Base64URL LZString decompression
    let base64 = raw.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    const decompressed = LZString.decompressFromBase64(base64);
    if (decompressed) {
      return JSON.parse(decompressed) as MindMap;
    }

    // 2. Try direct EncodedURIComponent LZString decompression
    const decompressedUri = LZString.decompressFromEncodedURIComponent(raw);
    if (decompressedUri) {
      return JSON.parse(decompressedUri) as MindMap;
    }

    // 3. Fallback: Legacy uncompressed base64
    const jsonStr = decodeURIComponent(atob(base64));
    return JSON.parse(jsonStr) as MindMap;
  } catch (error) {
    console.error('Error decoding shareable URL:', error);
    return null;
  }
}
