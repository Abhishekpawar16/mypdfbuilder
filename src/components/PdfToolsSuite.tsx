import React, { useEffect, useState } from 'react';
import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';
import JSZip from 'jszip';
import type * as XLSX from 'xlsx';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  Presentation,
  ShieldCheck,
  Table,
  ArrowDown,
  ArrowUp,
  Copy,
  Download,
  FileCode2,
  FileImage,
  FileText,
  Layers,
  Minimize2,
  Scissors,
  Trash2,
  Upload,
} from 'lucide-react';

export type ActivePlatformTool =
  | 'text-to-pdf'
  | 'jpg-to-pdf'
  | 'merge-pdf'
  | 'split-pdf'
  | 'compress-pdf'
  | 'pdf-to-jpg'
  | 'pdf-to-text'
  | 'html-to-pdf'
  | 'word-to-pdf'
  | 'powerpoint-to-pdf'
  | 'excel-to-pdf'
  | 'pdf-to-word'
  | 'pdf-to-powerpoint'
  | 'pdf-to-excel'
  | 'pdf-to-pdfa'
  | 'edit-pdf';

interface PdfToolsSuiteProps {
  activeTool: Exclude<ActivePlatformTool, 'text-to-pdf'>;
  onSendTextToEditor: (extractedText: string) => void;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function createPdfBlob(bytes: Uint8Array): Blob {
  const buffer = Uint8Array.from(bytes).buffer as ArrayBuffer;
  return new Blob([buffer], { type: 'application/pdf' });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function loadPdfJs() {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  return pdfjsLib;
}

export const PdfToolsSuite: React.FC<PdfToolsSuiteProps> = ({ activeTool, onSendTextToEditor }) => {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    setStatus(null);
  }, [activeTool]);

  // Merge PDF state
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);

  // Split PDF state
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [splitPageCount, setSplitPageCount] = useState(0);
  const [splitRange, setSplitRange] = useState('1-1');

  // Compress PDF state
  const [compressFile, setCompressFile] = useState<File | null>(null);

  // JPG to PDF state
  const [imageFiles, setImageFiles] = useState<{ file: File; previewUrl: string }[]>([]);
  const [imgOrientation, setImgOrientation] = useState<'portrait' | 'landscape'>('portrait');

  // PDF to JPG state
  const [pdfToJpgPages, setPdfToJpgPages] = useState<{ page: number; dataUrl: string }[]>([]);

  // PDF to Text state
  const [extractedText, setExtractedText] = useState('');

  // HTML to PDF state
  const [wordText, setWordText] = useState('');
  const [wordFilename, setWordFilename] = useState('word-document.pdf');
  const [pptxSlides, setPptxSlides] = useState<string[][]>([]);
  const [pptxOutName, setPptxOutName] = useState('presentation.pdf');
  const [excelWb, setExcelWb] = useState<XLSX.WorkBook | null>(null);
  const [excelOutName, setExcelOutName] = useState('spreadsheet.pdf');
  const [p2wFile, setP2wFile] = useState<File | null>(null);
  const [p2xFile, setP2xFile] = useState<File | null>(null);
  const [p2pFile, setP2pFile] = useState<File | null>(null);
  const [pdfaFile, setPdfaFile] = useState<File | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPage, setEditPage] = useState(1);
  const [editTotalPages, setEditTotalPages] = useState(0);
  const [editTextInput, setEditTextInput] = useState('Approved');
  const [editTextSize, setEditTextSize] = useState(18);
  const [editTextColor, setEditTextColor] = useState('#4F46E5');
  const [editX, setEditX] = useState(10);
  const [editY, setEditY] = useState(15);
  const [editWatermark, setEditWatermark] = useState('');
  const [editRotateDeg, setEditRotateDeg] = useState(0);
  const [htmlInput, setHtmlInput] = useState(
    '<h1>MyPDFBuilder HTML Report</h1>\n<p>Paste any clean HTML markup here to convert it into a downloadable PDF document directly in your browser.</p>\n<ul><li>100% Client-Side</li><li>Zero Server Uploads</li></ul>'
  );

  // 1. Merge PDF
  const handleMerge = async () => {
    if (mergeFiles.length < 2) {
      setStatus({ type: 'error', msg: 'Please select at least 2 PDF files to merge.' });
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const merged = await PDFDocument.create();
      for (const file of mergeFiles) {
        const bytes = await file.arrayBuffer();
        const doc = await PDFDocument.load(bytes);
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const out = await merged.save({ useObjectStreams: true });
      downloadBlob(createPdfBlob(out), 'merged-mypdfbuilder.pdf');
      setStatus({ type: 'success', msg: `Merged ${mergeFiles.length} PDFs into merged-mypdfbuilder.pdf.` });
    } catch (e) {
      setStatus({ type: 'error', msg: e instanceof Error ? e.message : 'Failed to merge PDFs.' });
    } finally {
      setBusy(false);
    }
  };

  // 2. Split PDF
  const handleSplitUpload = async (file: File) => {
    setStatus(null);
    try {
      const doc = await PDFDocument.load(await file.arrayBuffer());
      const count = doc.getPageCount();
      setSplitFile(file);
      setSplitPageCount(count);
      setSplitRange(`1-${Math.min(2, count)}`);
    } catch {
      setStatus({ type: 'error', msg: 'Could not read PDF file. Make sure it is not encrypted.' });
    }
  };

  const handleSplit = async () => {
    if (!splitFile) return;
    setBusy(true);
    setStatus(null);
    try {
      const src = await PDFDocument.load(await splitFile.arrayBuffer());
      const total = src.getPageCount();
      const indices = new Set<number>();
      for (const part of splitRange.split(',')) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        if (trimmed.includes('-')) {
          const [a, b] = trimmed.split('-').map((n) => parseInt(n.trim(), 10));
          if (!Number.isNaN(a) && !Number.isNaN(b)) {
            for (let p = Math.max(1, a); p <= Math.min(total, b); p++) indices.add(p - 1);
          }
        } else {
          const n = parseInt(trimmed, 10);
          if (!Number.isNaN(n) && n >= 1 && n <= total) indices.add(n - 1);
        }
      }
      if (indices.size === 0) {
        setStatus({ type: 'error', msg: `Enter valid page numbers between 1 and ${total} (e.g. 1-3, 5).` });
        setBusy(false);
        return;
      }
      const outDoc = await PDFDocument.create();
      const copied = await outDoc.copyPages(src, Array.from(indices).sort((a, b) => a - b));
      copied.forEach((p) => outDoc.addPage(p));
      const outBytes = await outDoc.save({ useObjectStreams: true });
      downloadBlob(createPdfBlob(outBytes), `split-${splitFile.name}`);
      setStatus({ type: 'success', msg: `Extracted ${copied.length} page(s) into split-${splitFile.name}.` });
    } catch (e) {
      setStatus({ type: 'error', msg: e instanceof Error ? e.message : 'Split failed.' });
    } finally {
      setBusy(false);
    }
  };

  // 3. Compress PDF
  const handleCompress = async () => {
    if (!compressFile) return;
    setBusy(true);
    setStatus(null);
    try {
      const origSize = compressFile.size;
      const doc = await PDFDocument.load(await compressFile.arrayBuffer(), { updateMetadata: false });
      doc.setTitle('');
      doc.setAuthor('');
      doc.setSubject('');
      doc.setKeywords([]);
      const out = await doc.save({ useObjectStreams: true, addDefaultPage: false });
      const blob = createPdfBlob(out);
      downloadBlob(blob, `compressed-${compressFile.name}`);
      const savedPct = origSize > 0 ? Math.max(0, Math.round(((origSize - blob.size) / origSize) * 100)) : 0;
      setStatus({
        type: 'success',
        msg: `Optimized PDF: ${formatBytes(origSize)} → ${formatBytes(blob.size)} (${savedPct}% smaller).`,
      });
    } catch (e) {
      setStatus({ type: 'error', msg: e instanceof Error ? e.message : 'Compression failed.' });
    } finally {
      setBusy(false);
    }
  };

  // 4. JPG / PNG to PDF
  const handleImagesToPdf = async () => {
    if (imageFiles.length === 0) {
      setStatus({ type: 'error', msg: 'Please add at least one JPG or PNG image.' });
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: imgOrientation, unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 10;

      for (let i = 0; i < imageFiles.length; i++) {
        if (i > 0) doc.addPage('a4', imgOrientation);
        const item = imageFiles[i];
        const img = await new Promise<HTMLImageElement>((res, rej) => {
          const im = new Image();
          im.onload = () => res(im);
          im.onerror = rej;
          im.src = item.previewUrl;
        });
        const maxW = pageW - margin * 2;
        const maxH = pageH - margin * 2;
        const ratio = Math.min(maxW / img.width, maxH / img.height);
        const w = img.width * ratio;
        const h = img.height * ratio;
        const x = (pageW - w) / 2;
        const y = (pageH - h) / 2;
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not process the selected image.');
        context.drawImage(img, 0, 0);
        doc.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, w, h);
      }
      doc.save('images-mypdfbuilder.pdf');
      setStatus({ type: 'success', msg: `Converted ${imageFiles.length} image(s) to images-mypdfbuilder.pdf.` });
    } catch (e) {
      setStatus({ type: 'error', msg: e instanceof Error ? e.message : 'Image conversion failed.' });
    } finally {
      setBusy(false);
    }
  };

  // 5. PDF to JPG
  const handlePdfToJpg = async (file: File) => {
    setBusy(true);
    setStatus(null);
    setPdfToJpgPages([]);
    try {
      const data = new Uint8Array(await file.arrayBuffer());
      const pdfjsLib = await loadPdfJs();
      const pdf = await pdfjsLib.getDocument({ data }).promise;
      const results: { page: number; dataUrl: string }[] = [];
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;
        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        results.push({ page: p, dataUrl: canvas.toDataURL('image/jpeg', 0.9) });
      }
      setPdfToJpgPages(results);
      setStatus({ type: 'success', msg: `Rendered ${results.length} page(s) to JPG.` });
    } catch (e) {
      setStatus({ type: 'error', msg: e instanceof Error ? e.message : 'Could not render PDF pages.' });
    } finally {
      setBusy(false);
    }
  };

  // 6. PDF Text Extractor
  const handleExtractText = async (file: File) => {
    setBusy(true);
    setStatus(null);
    setExtractedText('');
    try {
      const data = new Uint8Array(await file.arrayBuffer());
      const pdfjsLib = await loadPdfJs();
      const pdf = await pdfjsLib.getDocument({ data }).promise;
      const chunks: string[] = [];
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();
        const pageStr = content.items.map((it: any) => it.str || '').join(' ');
        chunks.push(`--- Page ${p} ---\n${pageStr}`);
      }
      const full = chunks.join('\n\n');
      setExtractedText(full);
      setStatus({ type: 'success', msg: `Extracted text from ${pdf.numPages} page(s).` });
    } catch (e) {
      setStatus({ type: 'error', msg: e instanceof Error ? e.message : 'Text extraction failed.' });
    } finally {
      setBusy(false);
    }
  };

  // 7. HTML to PDF
  const handleHtmlToPdf = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const { jsPDF } = await import('jspdf');
      const parsed = new DOMParser().parseFromString(htmlInput, 'text/html');
      const plain = (parsed.body.textContent || '').trim();
      if (!plain) {
        setStatus({ type: 'error', msg: 'Please enter some HTML content first.' });
        setBusy(false);
        return;
      }
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const lines = doc.splitTextToSize(plain, 170);
      let y = 20;
      for (const line of lines) {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 20, y);
        y += 7;
      }
      doc.save('html-mypdfbuilder.pdf');
      setStatus({ type: 'success', msg: 'Converted HTML content to html-mypdfbuilder.pdf.' });
    } catch (e) {
      setStatus({ type: 'error', msg: e instanceof Error ? e.message : 'HTML conversion failed.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {status && (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 text-sm font-medium ${
            status.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'
              : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200'
          }`}
        >
          {status.msg}
        </div>
      )}

      {activeTool === 'merge-pdf' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Layers className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-bold">Merge PDF Files</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Combine multiple PDFs in your preferred order directly in your browser.
          </p>
          <label id="tool-upload" className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-950">
            <Upload className="h-7 w-7 text-indigo-600" />
            <span className="mt-2 text-sm font-semibold">Select PDF files to merge</span>
            <input
              type="file"
              accept=".pdf,application/pdf"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length) setMergeFiles((p) => [...p, ...files]);
              }}
            />
          </label>
          {mergeFiles.length > 0 && (
            <ul className="space-y-2">
              {mergeFiles.map((f, idx) => (
                <li
                  key={`${f.name}-${idx}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
                >
                  <span className="truncate font-medium">
                    {idx + 1}. {f.name} ({formatBytes(f.size)})
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() =>
                        setMergeFiles((prev) => {
                          const arr = [...prev];
                          [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
                          return arr;
                        })
                      }
                      className="rounded p-1 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === mergeFiles.length - 1}
                      onClick={() =>
                        setMergeFiles((prev) => {
                          const arr = [...prev];
                          [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
                          return arr;
                        })
                      }
                      className="rounded p-1 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setMergeFiles((prev) => prev.filter((_, i) => i !== idx))}
                      className="rounded p-1 text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            disabled={busy || mergeFiles.length < 2}
            onClick={handleMerge}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> {busy ? 'Merging...' : 'Merge & Download PDF'}
          </button>
        </div>
      )}

      {activeTool === 'split-pdf' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Scissors className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-bold">Split PDF Pages</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Extract specific pages or page ranges from a PDF document locally.
          </p>
          <label id="tool-upload" className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-950">
            <Upload className="h-7 w-7 text-indigo-600" />
            <span className="mt-2 text-sm font-semibold">
              {splitFile ? `${splitFile.name} (${splitPageCount} pages)` : 'Select a PDF file to split'}
            </span>
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleSplitUpload(f);
              }}
            />
          </label>
          {splitFile && (
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-semibold">Page Ranges (1 – {splitPageCount})</label>
                <input
                  type="text"
                  value={splitRange}
                  onChange={(e) => setSplitRange(e.target.value)}
                  placeholder="e.g. 1-3, 5"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={handleSplit}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
              >
                <Download className="h-4 w-4" /> {busy ? 'Splitting...' : 'Extract & Download PDF'}
              </button>
            </div>
          )}
        </div>
      )}

      {activeTool === 'compress-pdf' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Minimize2 className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-bold">Compress &amp; Optimize PDF</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Optimize PDF object streams and strip redundant metadata in your browser.
          </p>
          <label id="tool-upload" className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-950">
            <Upload className="h-7 w-7 text-indigo-600" />
            <span className="mt-2 text-sm font-semibold">
              {compressFile ? `${compressFile.name} (${formatBytes(compressFile.size)})` : 'Select a PDF file'}
            </span>
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => setCompressFile(e.target.files?.[0] || null)}
            />
          </label>
          <button
            type="button"
            disabled={busy || !compressFile}
            onClick={handleCompress}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> {busy ? 'Compressing...' : 'Compress & Download PDF'}
          </button>
        </div>
      )}

      {activeTool === 'jpg-to-pdf' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <FileImage className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-bold">JPG / PNG to PDF Converter</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Convert one or multiple JPG/PNG images into a multi-page A4 PDF document.
          </p>
          <label id="tool-upload" className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-950">
            <Upload className="h-7 w-7 text-indigo-600" />
            <span className="mt-2 text-sm font-semibold">Select JPG or PNG images</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []).map((file) => ({
                  file,
                  previewUrl: URL.createObjectURL(file),
                }));
                if (files.length) setImageFiles((p) => [...p, ...files]);
              }}
            />
          </label>
          {imageFiles.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {imageFiles.map((item, idx) => (
                <div key={idx} className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                  <img src={item.previewUrl} alt={item.file.name} className="h-24 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageFiles((p) => p.filter((_, i) => i !== idx))}
                    className="absolute right-1 top-1 rounded-full bg-slate-900/70 p-1 text-white"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={imgOrientation}
              onChange={(e) => setImgOrientation(e.target.value as 'portrait' | 'landscape')}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="portrait">Portrait (A4)</option>
              <option value="landscape">Landscape (A4)</option>
            </select>
            <button
              type="button"
              disabled={busy || imageFiles.length === 0}
              onClick={handleImagesToPdf}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> {busy ? 'Converting...' : 'Convert to PDF'}
            </button>
          </div>
        </div>
      )}

      {activeTool === 'pdf-to-jpg' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <FileImage className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-bold">PDF to JPG Converter</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Render every page of your PDF as a high-quality JPG image locally.
          </p>
          <label id="tool-upload" className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-950">
            <Upload className="h-7 w-7 text-indigo-600" />
            <span className="mt-2 text-sm font-semibold">{busy ? 'Rendering pages...' : 'Select a PDF file'}</span>
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handlePdfToJpg(f);
              }}
            />
          </label>
          {pdfToJpgPages.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-3">
              {pdfToJpgPages.map((pg) => (
                <div key={pg.page} className="rounded-xl border border-slate-200 p-2 dark:border-slate-800">
                  <img src={pg.dataUrl} alt={`Page ${pg.page}`} className="w-full rounded-lg border" />
                  <a
                    href={pg.dataUrl}
                    download={`page-${pg.page}.jpg`}
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    <Download className="h-3.5 w-3.5" /> Download Page {pg.page}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTool === 'pdf-to-text' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-bold">PDF Text Extractor (PDF to TXT)</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Extract selectable text from any PDF document without uploading it.
          </p>
          <label id="tool-upload" className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-950">
            <Upload className="h-7 w-7 text-indigo-600" />
            <span className="mt-2 text-sm font-semibold">{busy ? 'Extracting text...' : 'Select a PDF file'}</span>
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleExtractText(f);
              }}
            />
          </label>
          {extractedText && (
            <div className="space-y-3">
              <textarea
                readOnly
                rows={10}
                value={extractedText}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-950"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onSendTextToEditor(extractedText)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
                >
                  Open in Text to PDF Editor
                </button>
                <button
                  type="button"
                  onClick={() => downloadBlob(new Blob([extractedText], { type: 'text/plain' }), 'extracted-text.txt')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold"
                >
                  <Download className="h-3.5 w-3.5" /> Download .TXT
                </button>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(extractedText)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTool === 'word-to-pdf' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-bold">Word to PDF Converter (.docx)</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Upload a Microsoft Word (.docx) document to extract its text and export it as a clean A4 PDF in your browser.
          </p>
          <input
            type="file"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setWordFilename(f.name.replace(/\.docx$/i, '') + '.pdf');
              try {
                const mammoth = await import('mammoth');
                const res = await mammoth.extractRawText({ arrayBuffer: await f.arrayBuffer() });
                setWordText(res.value || '');
                setStatus({ type: 'success', msg: `Loaded "${f.name}".` });
              } catch {
                setStatus({ type: 'error', msg: 'Could not read .docx file.' });
              }
            }}
            className="block w-full rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700"
          />
          <textarea
            rows={8}
            value={wordText}
            onChange={(e) => setWordText(e.target.value)}
            placeholder="Extracted Word text will appear here..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-950"
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={async () => {
                if (!wordText.trim()) return;
                const { jsPDF } = await import('jspdf');
                const doc = new jsPDF({ unit: 'mm', format: 'a4' });
                const lines = doc.splitTextToSize(wordText.trim(), 170);
                let y = 20;
                lines.forEach((l: string) => {
                  if (y > 275) { doc.addPage(); y = 20; }
                  doc.text(l, 20, y);
                  y += 7;
                });
                doc.save(wordFilename);
                setStatus({ type: 'success', msg: `Generated "${wordFilename}".` });
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
            >
              <Download className="h-4 w-4" /> Convert Word to PDF
            </button>
            <button
              type="button"
              onClick={() => wordText.trim() && onSendTextToEditor(wordText)}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700"
            >
              Customize in Text to PDF Editor
            </button>
          </div>
        </div>
      )}

      {activeTool === 'powerpoint-to-pdf' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5"><Presentation className="h-5 w-5 text-orange-600" /><h3 className="text-lg font-bold">PowerPoint to PDF (.pptx)</h3></div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Upload a .pptx presentation to convert slides into a 16:9 landscape PDF locally.</p>
          <input
            type="file"
            accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (f.size > 15 * 1024 * 1024) { setStatus({ type: 'error', msg: 'Presentation exceeds 15 MB limit.' }); return; }
              setPptxOutName(f.name.replace(/\.pptx$/i, '') + '.pdf');
              try {
                const zip = await JSZip.loadAsync(await f.arrayBuffer());
                const keys = Object.keys(zip.files).filter((k) => /^ppt\/slides\/slide\d+\.xml$/i.test(k))
                  .sort((a, b) => Number(a.match(/\d+/)?.[0] || 0) - Number(b.match(/\d+/)?.[0] || 0)).slice(0, 200);
                const dp = new DOMParser();
                const parsed: string[][] = [];
                for (const k of keys) {
                  const xml = dp.parseFromString(await zip.files[k].async('string'), 'application/xml');
                  const paras = Array.from(xml.getElementsByTagName('a:p'))
                    .map((p) => Array.from(p.getElementsByTagName('a:t')).map((t) => t.textContent || '').join(''))
                    .filter((s) => s.trim().length > 0);
                  parsed.push(paras);
                }
                setPptxSlides(parsed);
                setStatus({ type: 'success', msg: `Loaded "${f.name}" (${parsed.length} slides).` });
              } catch { setStatus({ type: 'error', msg: 'Could not parse .pptx file.' }); }
            }}
            className="block w-full rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700"
          />
          <button
            type="button"
            disabled={!pptxSlides.length}
            onClick={async () => {
              const { jsPDF } = await import('jspdf');
              const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [297, 167] });
              pptxSlides.forEach((paras, idx) => {
                if (idx > 0) doc.addPage([297, 167], 'landscape');
                doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
                doc.text(doc.splitTextToSize(paras[0] || `Slide ${idx + 1}`, 260), 18, 24);
                doc.setFont('helvetica', 'normal'); doc.setFontSize(12);
                let y = 44;
                paras.slice(1).forEach((p) => {
                  doc.splitTextToSize('• ' + p, 260).forEach((wl: string) => { if (y < 152) { doc.text(wl, 18, y); y += 7; } });
                  y += 2;
                });
              });
              doc.save(pptxOutName);
              setStatus({ type: 'success', msg: `Generated "${pptxOutName}".` });
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Convert PowerPoint to PDF
          </button>
        </div>
      )}

      {activeTool === 'excel-to-pdf' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5"><Table className="h-5 w-5 text-emerald-600" /><h3 className="text-lg font-bold">Excel to PDF (.xlsx / .xls / .csv)</h3></div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Upload an Excel workbook or CSV file to render its sheets into a landscape A4 PDF locally.</p>
          <input
            type="file"
            accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (f.size > 15 * 1024 * 1024) { setStatus({ type: 'error', msg: 'File exceeds 15 MB limit.' }); return; }
              setExcelOutName(f.name.replace(/\.(xlsx|xls|csv)$/i, '') + '.pdf');
              try {
                const XLSX = await import('xlsx');
                const wb = XLSX.read(await f.arrayBuffer(), { type: 'array' });
                setExcelWb(wb);
                setStatus({ type: 'success', msg: `Loaded "${f.name}" (${wb.SheetNames.length} sheet(s)).` });
              } catch { setStatus({ type: 'error', msg: 'Could not parse spreadsheet file.' }); }
            }}
            className="block w-full rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700"
          />
          <button
            type="button"
            disabled={!excelWb}
            onClick={async () => {
              if (!excelWb) return;
              const XLSX = await import('xlsx');
              const { jsPDF } = await import('jspdf');
              const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
              excelWb.SheetNames.forEach((name, sIdx) => {
                if (sIdx > 0) doc.addPage('a4', 'landscape');
                const rows = XLSX.utils.sheet_to_json<unknown[]>(excelWb.Sheets[name], { header: 1 });
                doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.text(`Sheet: ${name}`, 14, 16);
                doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
                let y = 24;
                rows.slice(0, 500).forEach((row) => {
                  const line = (Array.isArray(row) ? row : []).map((c) => String(c ?? '')).join('  |  ');
                  doc.splitTextToSize(line || ' ', 268).forEach((wl: string) => {
                    if (y > 195) { doc.addPage('a4', 'landscape'); y = 16; }
                    doc.text(wl, 14, y); y += 5.5;
                  });
                });
              });
              doc.save(excelOutName);
              setStatus({ type: 'success', msg: `Generated "${excelOutName}".` });
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Convert Excel to PDF
          </button>
        </div>
      )}

      {activeTool === 'pdf-to-word' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5"><FileText className="h-5 w-5 text-blue-600" /><h3 className="text-lg font-bold">PDF to Word (.docx)</h3></div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Extract text from your PDF and package it as an editable Microsoft Word (.docx) file in your browser.</p>
          <input type="file" accept=".pdf,application/pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f && f.size <= 25 * 1024 * 1024) setP2wFile(f); }} className="block w-full rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700" />
          <button
            type="button"
            disabled={!p2wFile || busy}
            onClick={async () => {
              if (!p2wFile) return;
              setBusy(true);
              try {
                const escXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
                const pdfjsLib = await loadPdfJs();
                const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await p2wFile.arrayBuffer()) }).promise;
                const maxP = Math.min(pdf.numPages, 200);
                let bodyXml = '';
                for (let p = 1; p <= maxP; p++) {
                  const page = await pdf.getPage(p);
                  const content = await page.getTextContent();
                  const pageText = content.items.map((it: any) => it.str || '').join(' ').trim();
                  bodyXml += `<w:p><w:r><w:t xml:space="preserve">${escXml(pageText || ' ')}</w:t></w:r></w:p>`;
                  if (p < maxP) bodyXml += `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
                }
                const zip = new JSZip();
                zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
                zip.folder('_rels')?.file('.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
                zip.folder('word')?.file('document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${bodyXml}<w:sectPr/></w:body></w:document>`);
                const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
                downloadBlob(blob, p2wFile.name.replace(/\.pdf$/i, '') + '.docx');
                setStatus({ type: 'success', msg: `Converted ${maxP} page(s) to .docx.` });
              } finally { setBusy(false); }
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Convert PDF to Word (.docx)
          </button>
        </div>
      )}

      {activeTool === 'pdf-to-excel' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5"><Table className="h-5 w-5 text-emerald-600" /><h3 className="text-lg font-bold">PDF to Excel (.xlsx)</h3></div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Extract positioned text rows and columns from each PDF page into an Excel (.xlsx) workbook.</p>
          <input type="file" accept=".pdf,application/pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f && f.size <= 25 * 1024 * 1024) setP2xFile(f); }} className="block w-full rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700" />
          <button
            type="button"
            disabled={!p2xFile || busy}
            onClick={async () => {
              if (!p2xFile) return;
              setBusy(true);
              try {
                const pdfjsLib = await loadPdfJs();
                const XLSX = await import('xlsx');
                const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await p2xFile.arrayBuffer()) }).promise;
                const wb = XLSX.utils.book_new();
                const maxP = Math.min(pdf.numPages, 200);
                for (let p = 1; p <= maxP; p++) {
                  const page = await pdf.getPage(p);
                  const content = await page.getTextContent();
                  const rowsMap = new Map<number, { x: number; str: string }[]>();
                  content.items.forEach((it: any) => {
                    if (!it.str || !it.str.trim()) return;
                    const y = Math.round((it.transform[5] || 0) / 4) * 4;
                    const x = it.transform[4] || 0;
                    if (!rowsMap.has(y)) rowsMap.set(y, []);
                    rowsMap.get(y)!.push({ x, str: it.str.trim() });
                  });
                  const aoa = Array.from(rowsMap.entries()).sort((a, b) => b[0] - a[0]).map(([, cells]) => cells.sort((a, b) => a.x - b.x).map((c) => c.str));
                  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa.length ? aoa : [['']]), `Page_${p}`);
                }
                XLSX.writeFile(wb, p2xFile.name.replace(/\.pdf$/i, '') + '.xlsx');
                setStatus({ type: 'success', msg: `Exported ${maxP} sheet(s) to .xlsx.` });
              } finally { setBusy(false); }
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Convert PDF to Excel (.xlsx)
          </button>
        </div>
      )}

      {activeTool === 'pdf-to-powerpoint' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5"><Presentation className="h-5 w-5 text-orange-600" /><h3 className="text-lg font-bold">PDF to PowerPoint (.pptx)</h3></div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Render every PDF page as a full-slide image in a downloadable PowerPoint (.pptx) presentation. Slide text and objects are not editable.</p>
          <input type="file" accept=".pdf,application/pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f && f.size <= 25 * 1024 * 1024) setP2pFile(f); }} className="block w-full rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700" />
          <button
            type="button"
            disabled={!p2pFile || busy}
            onClick={async () => {
              if (!p2pFile) return;
              setBusy(true);
              try {
                const pdfjsLib = await loadPdfJs();
                const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await p2pFile.arrayBuffer()) }).promise;
                const maxP = Math.min(pdf.numPages, 60);
                const zip = new JSZip();
                const media = zip.folder('ppt')!.folder('media')!;
                const slidesFolder = zip.folder('ppt')!.folder('slides')!;
                const slideRels = slidesFolder.folder('_rels')!;
                let ctOverrides = '', presSlideIds = '', presRels = '';
                for (let p = 1; p <= maxP; p++) {
                  const page = await pdf.getPage(p);
                  const vp = page.getViewport({ scale: 1.5 });
                  const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height;
                  await page.render({ canvas: c, canvasContext: c.getContext('2d')!, viewport: vp }).promise;
                  media.file(`slide${p}.jpg`, c.toDataURL('image/jpeg', 0.88).split(',')[1], { base64: true });
                  slidesFolder.file(`slide${p}.xml`, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/><p:pic><p:nvPicPr><p:cNvPr id="2" name="Slide${p}"/><p:cNvPicPr/><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="9144000" cy="6858000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic></p:spTree></p:cSld></p:sld>`);
                  slideRels.file(`slide${p}.xml.rels`, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/slide${p}.jpg"/></Relationships>`);
                  ctOverrides += `<Override PartName="/ppt/slides/slide${p}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`;
                  presSlideIds += `<p:sldId id="${255 + p}" r:id="rId${p}"/>`;
                  presRels += `<Relationship Id="rId${p}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${p}.xml"/>`;
                }
                zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpg" ContentType="image/jpeg"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>${ctOverrides}</Types>`);
                zip.folder('_rels')!.file('.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>');
                zip.folder('ppt')!.file('presentation.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldIdLst>${presSlideIds}</p:sldIdLst><p:sldSz cx="9144000" cy="6858000" type="screen4x3"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>`);
                zip.folder('ppt')!.folder('_rels')!.file('presentation.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${presRels}</Relationships>`);
                const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
                downloadBlob(blob, p2pFile.name.replace(/\.pdf$/i, '') + '.pptx');
                setStatus({ type: 'success', msg: `Generated ${maxP} slide(s) in .pptx.` });
              } finally { setBusy(false); }
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Convert PDF to PowerPoint (.pptx)
          </button>
        </div>
      )}

      {activeTool === 'pdf-to-pdfa' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5"><ShieldCheck className="h-5 w-5 text-indigo-600" /><h3 className="text-lg font-bold">Update PDF Archive Metadata</h3></div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Save a copy with archival metadata fields. This does not convert or validate PDF/A compliance.</p>
          <input type="file" accept=".pdf,application/pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f && f.size <= 25 * 1024 * 1024) setPdfaFile(f); }} className="block w-full rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700" />
          <button
            type="button"
            disabled={!pdfaFile || busy}
            onClick={async () => {
              if (!pdfaFile) return;
              setBusy(true);
              try {
                const doc = await PDFDocument.load(await pdfaFile.arrayBuffer());
                doc.setTitle(pdfaFile.name.replace(/\.pdf$/i, ''));
                doc.setSubject('PDF archive metadata updated by MyPDFBuilder');
                doc.setProducer('MyPDFBuilder PDF Metadata Editor');
                doc.setCreator('MyPDFBuilder');
                doc.setModificationDate(new Date());
                const out = await doc.save({ useObjectStreams: false });
                downloadBlob(createPdfBlob(out), pdfaFile.name.replace(/\.pdf$/i, '') + '-metadata.pdf');
                setStatus({ type: 'success', msg: 'Saved an updated metadata copy. It has not been validated as PDF/A.' });
              } catch (e) {
                setStatus({ type: 'error', msg: e instanceof Error ? e.message : 'Could not update PDF metadata.' });
              } finally { setBusy(false); }
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Download Metadata-Updated PDF
          </button>
        </div>
      )}

      {activeTool === 'edit-pdf' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5"><FileText className="h-5 w-5 text-indigo-600" /><h3 className="text-lg font-bold">Online PDF Editor</h3></div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Add text annotations, watermarks, or rotate pages locally in your browser.</p>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f || f.size > 25 * 1024 * 1024) return;
              const doc = await PDFDocument.load(await f.arrayBuffer());
              setEditFile(f);
              setEditTotalPages(doc.getPageCount());
              setEditPage(1);
              setEditRotateDeg(0);
              setStatus({ type: 'success', msg: `Loaded "${f.name}" (${doc.getPageCount()} pages).` });
            }}
            className="block w-full rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700"
          />
          {editFile && (
            <div className="grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2 dark:border-slate-800">
              <div>
                <label className="mb-1 block text-xs font-semibold">Page ({editPage} of {editTotalPages})</label>
                <div className="flex gap-2">
                  <button type="button" disabled={editPage <= 1} onClick={() => setEditPage((p) => p - 1)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-40">Prev</button>
                  <button type="button" disabled={editPage >= editTotalPages} onClick={() => setEditPage((p) => p + 1)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-40">Next</button>
                  <button type="button" onClick={() => setEditRotateDeg((d) => (d + 90) % 360)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold">Rotate +90° ({editRotateDeg}°)</button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Add Text on Page {editPage}</label>
                <input type="text" value={editTextInput} onChange={(e) => setEditTextInput(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Position X% / Y% &amp; Size</label>
                <div className="flex gap-2">
                  <input type="number" min={0} max={95} value={editX} onChange={(e) => setEditX(Number(e.target.value))} className="w-20 rounded-lg border px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950" />
                  <input type="number" min={0} max={95} value={editY} onChange={(e) => setEditY(Number(e.target.value))} className="w-20 rounded-lg border px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950" />
                  <input type="number" min={8} max={72} value={editTextSize} onChange={(e) => setEditTextSize(Number(e.target.value))} className="w-20 rounded-lg border px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950" />
                  <input type="color" value={editTextColor} onChange={(e) => setEditTextColor(e.target.value)} className="h-7 w-9 cursor-pointer" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Optional Watermark (All Pages)</label>
                <input type="text" value={editWatermark} onChange={(e) => setEditWatermark(e.target.value)} placeholder="e.g. CONFIDENTIAL" className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950" />
              </div>
              <div className="sm:col-span-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      const doc = await PDFDocument.load(await editFile.arrayBuffer());
                      const font = await doc.embedFont(StandardFonts.HelveticaBold);
                      const hex = editTextColor.replace('#', '');
                      const r = (parseInt(hex.slice(0, 2), 16) || 79) / 255;
                      const g = (parseInt(hex.slice(2, 4), 16) || 70) / 255;
                      const b = (parseInt(hex.slice(4, 6), 16) || 229) / 255;
                      const pg = doc.getPage(editPage - 1);
                      const { width, height } = pg.getSize();
                      if (editTextInput.trim()) {
                        pg.drawText(editTextInput.trim(), {
                          x: (Math.min(95, Math.max(0, editX)) / 100) * width,
                          y: height - (Math.min(95, Math.max(5, editY)) / 100) * height,
                          size: editTextSize,
                          font,
                          color: rgb(r, g, b),
                        });
                      }
                      if (editRotateDeg) pg.setRotation(degrees((pg.getRotation().angle + editRotateDeg) % 360));
                      if (editWatermark.trim()) {
                        doc.getPages().forEach((p) => {
                          const sz = p.getSize();
                          p.drawText(editWatermark.trim(), { x: sz.width * 0.2, y: sz.height * 0.45, size: 36, font, color: rgb(0.6, 0.6, 0.65), opacity: 0.28, rotate: degrees(35) });
                        });
                      }
                      downloadBlob(createPdfBlob(await doc.save()), `edited-${editFile.name}`);
                      setStatus({ type: 'success', msg: `Saved edited-${editFile.name}.` });
                    } finally { setBusy(false); }
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
                >
                  <Download className="h-4 w-4" /> Apply Edits &amp; Download PDF
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTool === 'html-to-pdf' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <FileCode2 className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-bold">HTML to PDF Converter</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Paste HTML markup below to extract structured text and export it as a clean A4 PDF.
          </p>
          <label htmlFor="html-to-pdf-input" className="block text-sm font-semibold">
            HTML markup
          </label>
          <textarea
            id="html-to-pdf-input"
            rows={8}
            value={htmlInput}
            onChange={(e) => setHtmlInput(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs dark:border-slate-700 dark:bg-slate-950"
          />
          <button
            type="button"
            disabled={busy}
            onClick={handleHtmlToPdf}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
          >
            <Download className="h-4 w-4" /> {busy ? 'Converting...' : 'Convert HTML to PDF'}
          </button>
        </div>
      )}
    </div>
  );
};
