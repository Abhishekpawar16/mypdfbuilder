import { MarginOption, PageDimensions, PageSizeOption, PdfSettings } from '../types/pdf';

const PAGE_SIZES_MM: Record<PageSizeOption, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  Letter: { width: 215.9, height: 279.4 },
  Legal: { width: 215.9, height: 355.6 },
};

const MARGIN_MM: Record<MarginOption, number> = {
  normal: 20,
  narrow: 12,
  wide: 30,
};

export function getPageDimensions(settings: PdfSettings): PageDimensions {
  const base = PAGE_SIZES_MM[settings.pageSize];
  const isLandscape = settings.orientation === 'landscape';
  return {
    widthMm: isLandscape ? base.height : base.width,
    heightMm: isLandscape ? base.width : base.height,
    marginMm: MARGIN_MM[settings.margins],
  };
}

export function sanitizeFilename(rawTitle: string): string {
  const cleaned = rawTitle
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80);
  return (cleaned || 'document') + '.pdf';
}

function hasNonWinAnsi(text: string): boolean {
  // Standard PDF Type1 fonts (Helvetica, Times, Courier) only reliably support ASCII + Latin-1 (<= 0xFF).
  // Any character > 0xFF (e.g., CJK, Devanagari, Arabic, Cyrillic, emojis, many math symbols) triggers canvas rendering.
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) > 255) return true;
  }
  return false;
}

function mapJsPdfFont(font: PdfSettings['fontFamily']): 'helvetica' | 'times' | 'courier' {
  switch (font) {
    case 'Times New Roman':
      return 'times';
    case 'Courier':
      return 'courier';
    case 'Arial':
    case 'Helvetica':
    default:
      return 'helvetica';
  }
}

function mapFontStyle(isBold: boolean, isItalic: boolean): 'normal' | 'bold' | 'italic' | 'bolditalic' {
  if (isBold && isItalic) return 'bolditalic';
  if (isBold) return 'bold';
  if (isItalic) return 'italic';
  return 'normal';
}

function mapCssFont(font: PdfSettings['fontFamily']): string {
  switch (font) {
    case 'Times New Roman':
      return '"Times New Roman", Times, serif';
    case 'Courier':
      return '"Courier New", Courier, monospace';
    case 'Arial':
      return 'Arial, Helvetica, sans-serif';
    case 'Helvetica':
    default:
      return 'Helvetica, Arial, sans-serif';
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return [30, 41, 59];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export interface PaginatedResult {
  pages: string[][];
  formattedDate: string;
}

/**
 * Splits raw text into exact lines & pages using an offscreen Canvas text measurer
 * so the live HTML preview and PDF output share consistent pagination.
 */
export function paginateText(text: string, settings: PdfSettings): PaginatedResult {
  const dims = getPageDimensions(settings);
  const mmToPx = 96 / 25.4;
  const usableWidthPx = (dims.widthMm - dims.marginMm * 2) * mmToPx;
  const headerReserveMm = settings.headerText.trim() || settings.includeDate ? 10 : 0;
  const footerReserveMm = settings.footerText.trim() || settings.pageNumbering !== 'none' ? 10 : 0;
  const usableHeightMm = Math.max(40, dims.heightMm - dims.marginMm * 2 - headerReserveMm - footerReserveMm);

  const ptToMm = 0.352778;
  const lineHeightMm = settings.fontSize * ptToMm * settings.lineSpacing;
  const maxLinesPerPage = Math.max(1, Math.floor(usableHeightMm / lineHeightMm));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const fontPx = settings.fontSize * (96 / 72);
  if (ctx) {
    ctx.font = `${settings.isItalic ? 'italic ' : ''}${settings.isBold ? 'bold ' : ''}${fontPx}px ${mapCssFont(settings.fontFamily)}`;
  }

  const measure = (str: string) => (ctx ? ctx.measureText(str).width : str.length * fontPx * 0.55);
  const splitLongToken = (token: string) => {
    const result: string[] = [];
    let current = '';
    for (const character of Array.from(token)) {
      if (current && measure(current + character) > usableWidthPx) {
        result.push(current);
        current = character;
      } else {
        current += character;
      }
    }
    if (current) result.push(current);
    return result;
  };

  const rawParagraphs = (text || '').replace(/\r\n/g, '\n').split('\n');
  const allLines: string[] = [];

  for (const para of rawParagraphs) {
    if (para === '') {
      allLines.push('');
      continue;
    }
    const words = para.split(/(\s+)/);
    let currentLine = '';
    for (const token of words) {
      const candidate = currentLine + token;
      if (measure(candidate) <= usableWidthPx) {
        currentLine = candidate;
      } else {
        if (currentLine) allLines.push(currentLine.trimEnd());
        const tokenLines = splitLongToken(token.trimStart());
        allLines.push(...tokenLines.slice(0, -1));
        currentLine = tokenLines[tokenLines.length - 1] || '';
      }
    }
    if (currentLine !== '') {
      allLines.push(currentLine);
    }
  }

  if (allLines.length === 0) {
    allLines.push('');
  }

  const pages: string[][] = [];
  for (let i = 0; i < allLines.length; i += maxLinesPerPage) {
    pages.push(allLines.slice(i, i + maxLinesPerPage));
  }

  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return { pages, formattedDate };
}

export async function generatePdfBlob(text: string, settings: PdfSettings): Promise<{ blob: Blob; filename: string; pageCount: number }> {
  const { jsPDF } = await import('jspdf');
  const dims = getPageDimensions(settings);
  const { pages, formattedDate } = paginateText(text, settings);
  const filename = sanitizeFilename(settings.title);

  const doc = new jsPDF({
    orientation: settings.orientation,
    unit: 'mm',
    format: [dims.widthMm, dims.heightMm],
    compress: true,
  });

  doc.setProperties({
    title: settings.title.trim() || 'Untitled Document',
    creator: 'TextToPDF Online Converter',
  });

  const combinedText = `${text}\n${settings.headerText}\n${settings.footerText}\n${settings.title}`;
  const useUnicodeCanvas = hasNonWinAnsi(combinedText);

  if (useUnicodeCanvas) {
    // High-DPI canvas rendering per page preserves full Unicode (CJK, Indic, Arabic, Emoji)
    const scale = 2.2;
    const mmToPx = (96 / 25.4) * scale;
    const widthPx = Math.round(dims.widthMm * mmToPx);
    const heightPx = Math.round(dims.heightMm * mmToPx);
    const marginPx = dims.marginMm * mmToPx;
    const usableWidthPx = widthPx - marginPx * 2;
    const fontPx = settings.fontSize * (96 / 72) * scale;
    const lineHeightPx = fontPx * settings.lineSpacing;
    const headerOffsetPx = settings.headerText.trim() || settings.includeDate ? 10 * mmToPx : 0;

    pages.forEach((lines, pageIdx) => {
      if (pageIdx > 0) doc.addPage([dims.widthMm, dims.heightMm], settings.orientation);
      const canvas = document.createElement('canvas');
      canvas.width = widthPx;
      canvas.height = heightPx;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = settings.backgroundColor || '#FFFFFF';
      ctx.fillRect(0, 0, widthPx, heightPx);

      // Header & Date
      const metaFontPx = 9 * (96 / 72) * scale;
      ctx.font = `${metaFontPx}px ${mapCssFont(settings.fontFamily)}`;
      ctx.fillStyle = '#64748B';
      if (settings.headerText.trim()) {
        ctx.textAlign = 'left';
        ctx.fillText(settings.headerText.trim(), marginPx, marginPx - 2 * mmToPx);
      }
      if (settings.includeDate) {
        ctx.textAlign = 'right';
        ctx.fillText(formattedDate, widthPx - marginPx, marginPx - 2 * mmToPx);
      }

      // Body
      ctx.font = `${settings.isItalic ? 'italic ' : ''}${settings.isBold ? 'bold ' : ''}${fontPx}px ${mapCssFont(settings.fontFamily)}`;
      ctx.fillStyle = settings.fontColor || '#1E293B';

      let y = marginPx + headerOffsetPx + fontPx;
      for (const line of lines) {
        if (settings.alignment === 'center') {
          ctx.textAlign = 'center';
          ctx.fillText(line, widthPx / 2, y, usableWidthPx);
        } else if (settings.alignment === 'right') {
          ctx.textAlign = 'right';
          ctx.fillText(line, widthPx - marginPx, y, usableWidthPx);
        } else {
          ctx.textAlign = 'left';
          ctx.fillText(line, marginPx, y, usableWidthPx);
        }
        y += lineHeightPx;
      }

      // Footer & Page Number
      ctx.font = `${metaFontPx}px ${mapCssFont(settings.fontFamily)}`;
      ctx.fillStyle = '#64748B';
      const footerY = heightPx - marginPx + 5 * mmToPx;
      if (settings.footerText.trim()) {
        ctx.textAlign = 'left';
        ctx.fillText(settings.footerText.trim(), marginPx, footerY);
      }
      if (settings.pageNumbering !== 'none') {
        const label =
          settings.pageNumbering === 'page-of'
            ? `Page ${pageIdx + 1} of ${pages.length}`
            : `${pageIdx + 1} / ${pages.length}`;
        ctx.textAlign = 'right';
        ctx.fillText(label, widthPx - marginPx, footerY);
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      doc.addImage(imgData, 'JPEG', 0, 0, dims.widthMm, dims.heightMm);
    });
  } else {
    // Native vector PDF rendering for crisp selectable text & tiny file size
    const fontName = mapJsPdfFont(settings.fontFamily);
    const fontStyle = mapFontStyle(settings.isBold, settings.isItalic);
    const [r, g, b] = hexToRgb(settings.fontColor);
    const [bgR, bgG, bgB] = hexToRgb(settings.backgroundColor);
    const ptToMm = 0.352778;
    const lineHeightMm = settings.fontSize * ptToMm * settings.lineSpacing;
    const usableWidthMm = dims.widthMm - dims.marginMm * 2;
    const headerOffsetMm = settings.headerText.trim() || settings.includeDate ? 10 : 0;

    pages.forEach((lines, pageIdx) => {
      if (pageIdx > 0) doc.addPage([dims.widthMm, dims.heightMm], settings.orientation);

      // Background
      if (settings.backgroundColor.toUpperCase() !== '#FFFFFF') {
        doc.setFillColor(bgR, bgG, bgB);
        doc.rect(0, 0, dims.widthMm, dims.heightMm, 'F');
      }

      // Header & Date
      doc.setFont(fontName, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      if (settings.headerText.trim()) {
        doc.text(settings.headerText.trim(), dims.marginMm, dims.marginMm - 2);
      }
      if (settings.includeDate) {
        doc.text(formattedDate, dims.widthMm - dims.marginMm, dims.marginMm - 2, { align: 'right' });
      }

      // Body text
      doc.setFont(fontName, fontStyle);
      doc.setFontSize(settings.fontSize);
      doc.setTextColor(r, g, b);

      let y = dims.marginMm + headerOffsetMm + settings.fontSize * ptToMm;
      for (const line of lines) {
        if (line !== '') {
          if (settings.alignment === 'center') {
            doc.text(line, dims.widthMm / 2, y, { align: 'center' });
          } else if (settings.alignment === 'right') {
            doc.text(line, dims.widthMm - dims.marginMm, y, { align: 'right' });
          } else if (settings.alignment === 'justify') {
            doc.text(line, dims.marginMm, y, { align: 'justify', maxWidth: usableWidthMm });
          } else {
            doc.text(line, dims.marginMm, y);
          }
        }
        y += lineHeightMm;
      }

      // Footer & Page Numbers
      doc.setFont(fontName, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      const footerY = dims.heightMm - dims.marginMm + 6;
      if (settings.footerText.trim()) {
        doc.text(settings.footerText.trim(), dims.marginMm, footerY);
      }
      if (settings.pageNumbering !== 'none') {
        const label =
          settings.pageNumbering === 'page-of'
            ? `Page ${pageIdx + 1} of ${pages.length}`
            : `${pageIdx + 1} / ${pages.length}`;
        doc.text(label, dims.widthMm - dims.marginMm, footerY, { align: 'right' });
      }
    });
  }

  return {
    blob: doc.output('blob'),
    filename,
    pageCount: pages.length,
  };
}
