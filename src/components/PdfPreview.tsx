import React, { useMemo, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { PdfSettings } from '../types/pdf';
import { getPageDimensions, paginateText } from '../utils/pdfGenerator';

interface PdfPreviewProps {
  text: string;
  settings: PdfSettings;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({ text, settings }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const dims = useMemo(() => getPageDimensions(settings), [settings]);
  const { pages, formattedDate } = useMemo(() => paginateText(text, settings), [text, settings]);

  useEffect(() => {
    if (currentPage > pages.length) {
      setCurrentPage(pages.length);
    }
  }, [pages.length, currentPage]);

  const activePageIndex = Math.min(currentPage - 1, pages.length - 1);
  const activeLines = pages[activePageIndex] || [''];

  const fontFamilyCss = useMemo(() => {
    switch (settings.fontFamily) {
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
  }, [settings.fontFamily]);

  // Scale page width to fit preview container cleanly while preserving exact aspect ratio
  const previewScale = settings.orientation === 'landscape' ? 1.55 : 1.75;
  const pageWidthPx = dims.widthMm * previewScale;
  const pageHeightPx = dims.heightMm * previewScale;
  const marginPx = dims.marginMm * previewScale;
  const fontSizePx = settings.fontSize * (96 / 72) * (previewScale / (96 / 25.4));

  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-slate-100/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
          <Eye className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span>Live PDF Preview</span>
          <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            {pages.length} {pages.length === 1 ? 'Page' : 'Pages'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            aria-label="Previous preview page"
            className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            Page {activePageIndex + 1} of {pages.length}
          </span>
          <button
            type="button"
            disabled={currentPage >= pages.length}
            onClick={() => setCurrentPage((p) => Math.min(pages.length, p + 1))}
            aria-label="Next preview page"
            className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="custom-scrollbar flex min-w-0 max-w-full justify-center overflow-auto py-2">
        <div
          className="relative shrink-0 overflow-hidden rounded-md border border-slate-300 shadow-lg transition-all duration-200 dark:border-slate-700"
          style={{
            width: `${pageWidthPx}px`,
            height: `${pageHeightPx}px`,
            backgroundColor: settings.backgroundColor || '#FFFFFF',
            padding: `${marginPx}px`,
          }}
        >
          {/* Header & Date */}
          {(settings.headerText.trim() || settings.includeDate) && (
            <div
              className="mb-2 flex items-center justify-between text-[9px] text-slate-500"
              style={{ fontFamily: fontFamilyCss }}
            >
              <span className="truncate pr-2">{settings.headerText}</span>
              {settings.includeDate && <span className="shrink-0">{formattedDate}</span>}
            </div>
          )}

          {/* Body Content */}
          <div
            style={{
              fontFamily: fontFamilyCss,
              fontSize: `${fontSizePx}px`,
              lineHeight: settings.lineSpacing,
              color: settings.fontColor,
              fontWeight: settings.isBold ? 700 : 400,
              fontStyle: settings.isItalic ? 'italic' : 'normal',
              textAlign: settings.alignment,
            }}
            className="break-words"
          >
            {activeLines.map((line, idx) => (
              <div key={idx} className="min-h-[1em] whitespace-pre-wrap">
                {line === '' ? '\u00A0' : line}
              </div>
            ))}
          </div>

          {/* Footer & Page Number */}
          {(settings.footerText.trim() || settings.pageNumbering !== 'none') && (
            <div
              className="absolute bottom-2 left-0 right-0 flex items-center justify-between text-[9px] text-slate-500"
              style={{
                paddingLeft: `${marginPx}px`,
                paddingRight: `${marginPx}px`,
                fontFamily: fontFamilyCss,
              }}
            >
              <span className="truncate pr-2">{settings.footerText}</span>
              {settings.pageNumbering !== 'none' && (
                <span className="shrink-0">
                  {settings.pageNumbering === 'page-of'
                    ? `Page ${activePageIndex + 1} of ${pages.length}`
                    : `${activePageIndex + 1} / ${pages.length}`}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
