import React, { useMemo, useState } from 'react';
import { Calculator, CaseSensitive, Check, FileText, Hash, Sparkles, X } from 'lucide-react';

export type UtilityToolId = 'word-counter' | 'char-counter' | 'text-formatter' | 'page-calculator' | null;

interface AdditionalToolsModalProps {
  activeTool: UtilityToolId;
  onClose: () => void;
  editorText: string;
  onApplyToEditor: (newText: string) => void;
}

const PAPER_SIZES = [
  { name: 'A4', mm: '210 × 297 mm', inches: '8.27 × 11.69 in', px300: '2480 × 3508 px', use: 'International Standard' },
  { name: 'A3', mm: '297 × 420 mm', inches: '11.69 × 16.54 in', px300: '3508 × 4961 px', use: 'Posters & Diagrams' },
  { name: 'US Letter', mm: '215.9 × 279.4 mm', inches: '8.50 × 11.00 in', px300: '2550 × 3300 px', use: 'North America Office' },
  { name: 'US Legal', mm: '215.9 × 355.6 mm', inches: '8.50 × 14.00 in', px300: '2550 × 4200 px', use: 'Contracts & Legal' },
];

export const AdditionalToolsModal: React.FC<AdditionalToolsModalProps> = ({
  activeTool,
  onClose,
  editorText,
  onApplyToEditor,
}) => {
  const [localText, setLocalText] = useState(editorText);
  const [applied, setApplied] = useState(false);

  const stats = useMemo(() => {
    const charsWithSpaces = localText.length;
    const charsWithoutSpaces = localText.replace(/\s/g, '').length;
    const trimmed = localText.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const lines = localText === '' ? 0 : localText.split(/\r\n|\r|\n/).length;
    const sentences = trimmed ? trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0).length : 0;
    const readingMins = Math.max(1, Math.ceil(words / 200));
    return { charsWithSpaces, charsWithoutSpaces, words, lines, sentences, readingMins };
  }, [localText]);

  if (!activeTool) return null;

  const transform = (fn: (s: string) => string) => {
    setLocalText((prev) => fn(prev));
    setApplied(false);
  };

  const applyToMain = () => {
    onApplyToEditor(localText);
    setApplied(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            {activeTool === 'word-counter' && <FileText className="h-5 w-5 text-indigo-600" />}
            {activeTool === 'char-counter' && <Hash className="h-5 w-5 text-indigo-600" />}
            {activeTool === 'text-formatter' && <CaseSensitive className="h-5 w-5 text-indigo-600" />}
            {activeTool === 'page-calculator' && <Calculator className="h-5 w-5 text-indigo-600" />}
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {activeTool === 'word-counter' && 'Word Counter & Reading Time'}
              {activeTool === 'char-counter' && 'Character & Line Counter'}
              {activeTool === 'text-formatter' && 'Text Formatter'}
              {activeTool === 'page-calculator' && 'PDF Page Size Calculator'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tool"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {activeTool === 'page-calculator' ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Compare standard PDF page dimensions in millimeters, inches, and 300 DPI print pixels.
            </p>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Format</th>
                    <th className="px-4 py-3">Millimeters</th>
                    <th className="px-4 py-3">Inches</th>
                    <th className="px-4 py-3">300 DPI</th>
                    <th className="px-4 py-3">Common Use</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {PAPER_SIZES.map((row) => (
                    <tr key={row.name} className="text-slate-700 dark:text-slate-300">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{row.name}</td>
                      <td className="px-4 py-3">{row.mm}</td>
                      <td className="px-4 py-3">{row.inches}</td>
                      <td className="px-4 py-3">{row.px300}</td>
                      <td className="px-4 py-3">{row.use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">Words</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">{stats.words}</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">Characters (with spaces)</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">{stats.charsWithSpaces}</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">Characters (no spaces)</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">{stats.charsWithoutSpaces}</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">Lines</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">{stats.lines}</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">Sentences</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">{stats.sentences}</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">Reading Time</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">~{stats.readingMins} min</div>
              </div>
            </div>

            {activeTool === 'text-formatter' && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => transform((s) => s.toUpperCase())}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  UPPERCASE
                </button>
                <button
                  type="button"
                  onClick={() => transform((s) => s.toLowerCase())}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  lowercase
                </button>
                <button
                  type="button"
                  onClick={() =>
                    transform((s) =>
                      s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
                    )
                  }
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Title Case
                </button>
                <button
                  type="button"
                  onClick={() => transform((s) => s.replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').trim())}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Clean Extra Spaces
                </button>
                <button
                  type="button"
                  onClick={() => transform((s) => s.replace(/\n{2,}/g, '\n'))}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Remove Blank Lines
                </button>
              </div>
            )}

            <textarea
              value={localText}
              onChange={(e) => {
                setLocalText(e.target.value);
                setApplied(false);
              }}
              rows={7}
              placeholder="Type or paste text here..."
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={applyToMain}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                {applied ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                {applied ? 'Applied to PDF Editor' : 'Send Text to PDF Generator'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
