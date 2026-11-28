import React, { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  BookOpen,
  Calculator,
  CaseSensitive,
  CheckCircle2,
  ChevronDown,
  ClipboardPaste,
  Download,
  FileCheck2,
  FileCode2,
  FileImage,
  FilePlus2,
  FileText,
  FileUp,
  Globe,
  Hash,
  Italic,
  Laptop,
  Layers,
  Lock,
  Plus,
  Mail,
  Menu,
  Minimize2,
  Moon,
  Palette,
  Presentation,
  ShieldCheck,
  Table,
  Printer,
  Redo2,
  RotateCcw,
  Scissors,
  Shield,
  Sliders,
  Smartphone,
  Sparkles,
  Sun,
  Trash2,
  Undo2,
  X,
  Zap,
} from 'lucide-react';
import { AdSlot } from './components/AdSlot';
import { AdditionalToolsModal, UtilityToolId } from './components/AdditionalToolsModal';
import { CookieConsent } from './components/CookieConsent';
import { LegalDocType, LegalModal } from './components/LegalModal';
import { PdfPreview } from './components/PdfPreview';
import type { ActivePlatformTool } from './components/PdfToolsSuite';
import { FAQ_ITEMS, SAMPLE_DOCUMENT_TEXT } from './data/seoContent';
import { TOOLS_SEO, getToolFromPathname } from './data/toolsSeo';
import {
  AlignmentOption,
  DEFAULT_PDF_SETTINGS,
  FontFamilyOption,
  MarginOption,
  OrientationOption,
  PageNumberOption,
  PageSizeOption,
  PdfSettings,
} from './types/pdf';
import { generatePdfBlob, paginateText } from './utils/pdfGenerator';

const AUTOSAVE_TEXT_KEY = 'mypdfbuilder_draft_text_v1';
const AUTOSAVE_PREF_KEY = 'mypdfbuilder_autosave_enabled_v2';
const LEGACY_AUTOSAVE_PREF_KEY = 'mypdfbuilder_autosave_enabled_v1';
const THEME_KEY = 'mypdfbuilder_theme_v1';
const LANG_KEY = 'mypdfbuilder_lang_v1';
const MAX_TXT_BYTES = 5 * 1024 * 1024;
const PdfToolsSuite = lazy(() => import('./components/PdfToolsSuite').then(({ PdfToolsSuite: component }) => ({ default: component })));

const PLATFORM_TABS: { id: ActivePlatformTool; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'text-to-pdf', label: 'Text to PDF', icon: FileText },
  { id: 'jpg-to-pdf', label: 'JPG to PDF', icon: FileImage },
  { id: 'merge-pdf', label: 'Merge PDF', icon: Layers },
  { id: 'split-pdf', label: 'Split PDF', icon: Scissors },
  { id: 'compress-pdf', label: 'Compress PDF', icon: Minimize2 },
  { id: 'pdf-to-jpg', label: 'PDF to JPG', icon: FileImage },
  { id: 'pdf-to-text', label: 'PDF to Text', icon: BookOpen },
  { id: 'html-to-pdf', label: 'HTML to PDF', icon: FileCode2 },
  { id: 'word-to-pdf', label: 'Word to PDF', icon: FileText },
  { id: 'powerpoint-to-pdf', label: 'PowerPoint to PDF', icon: Presentation },
  { id: 'excel-to-pdf', label: 'Excel to PDF', icon: Table },
  { id: 'pdf-to-word', label: 'PDF to Word', icon: FileText },
  { id: 'pdf-to-powerpoint', label: 'PDF to PowerPoint', icon: Presentation },
  { id: 'pdf-to-excel', label: 'PDF to Excel', icon: Table },
  { id: 'pdf-to-pdfa', label: 'PDF Archive Metadata', icon: ShieldCheck },
  { id: 'edit-pdf', label: 'Edit PDF', icon: FileText },
];

const UI_TRANSLATIONS: Record<string, { dir: 'ltr' | 'rtl'; cta: string; start: string; upload: string; choose: string; tools: string; how: string; faq: string; contact: string }> = {
  en: { dir: 'ltr', cta: 'Create PDF Free', start: 'Start Creating PDF', upload: 'Upload TXT File', choose: 'Choose file', tools: 'Every PDF Tool You Need on MyPDFBuilder', how: 'How to Convert Text to PDF in 3 Simple Steps', faq: 'Frequently Asked Questions', contact: 'Contact Us' },
  es: { dir: 'ltr', cta: 'Crear PDF Gratis', start: 'Empezar a Crear PDF', upload: 'Subir Archivo TXT', choose: 'Elegir archivo', tools: 'Todas las Herramientas PDF en MyPDFBuilder', how: 'Cómo Convertir Texto a PDF en 3 Pasos', faq: 'Preguntas Frecuentes', contact: 'Contáctanos' },
  fr: { dir: 'ltr', cta: 'Créer un PDF Gratuit', start: 'Créer un PDF', upload: 'Importer TXT', choose: 'Choisir un fichier', tools: 'Tous les Outils PDF sur MyPDFBuilder', how: 'Comment Convertir Texte en PDF en 3 Étapes', faq: 'Questions Fréquentes', contact: 'Contactez-nous' },
  de: { dir: 'ltr', cta: 'PDF Kostenlos Erstellen', start: 'PDF Erstellen', upload: 'TXT Hochladen', choose: 'Datei wählen', tools: 'Alle PDF-Tools auf MyPDFBuilder', how: 'Text in PDF Umwandeln in 3 Schritten', faq: 'Häufig Gestellte Fragen', contact: 'Kontakt' },
  hi: { dir: 'ltr', cta: 'मुफ़्त PDF बनाएं', start: 'PDF बनाना शुरू करें', upload: 'TXT फ़ाइल अपलोड करें', choose: 'फ़ाइल चुनें', tools: 'MyPDFBuilder पर सभी PDF टूल्स', how: '3 आसान चरणों में टेक्स्ट को PDF में बदलें', faq: 'अक्सर पूछे जाने वाले प्रश्न', contact: 'संपर्क करें' },
  pt: { dir: 'ltr', cta: 'Criar PDF Grátis', start: 'Começar a Criar PDF', upload: 'Enviar Arquivo TXT', choose: 'Escolher arquivo', tools: 'Todas as Ferramentas PDF no MyPDFBuilder', how: 'Como Converter Texto para PDF em 3 Passos', faq: 'Perguntas Frequentes', contact: 'Fale Conosco' },
  zh: { dir: 'ltr', cta: '免费创建 PDF', start: '开始创建 PDF', upload: '上传 TXT 文件', choose: '选择文件', tools: 'MyPDFBuilder 全部 PDF 工具', how: '3 个简单步骤将文本转换为 PDF', faq: '常见问题', contact: '联系我们' },
  ar: { dir: 'rtl', cta: 'إنشاء PDF مجاناً', start: 'ابدأ إنشاء PDF', upload: 'رفع ملف TXT', choose: 'اختر ملفاً', tools: 'جميع أدوات PDF على MyPDFBuilder', how: 'كيفية تحويل النص إلى PDF في 3 خطوات', faq: 'الأسئلة الشائعة', contact: 'اتصل بنا' },
  ja: { dir: 'ltr', cta: '無料でPDF作成', start: 'PDFを作成開始', upload: 'TXTをアップロード', choose: 'ファイルを選択', tools: 'MyPDFBuilderのすべてのPDFツール', how: '3ステップでテキストをPDFに変換', faq: 'よくある質問', contact: 'お問い合わせ' },
  ko: { dir: 'ltr', cta: '무료 PDF 만들기', start: 'PDF 만들기 시작', upload: 'TXT 파일 업로드', choose: '파일 선택', tools: 'MyPDFBuilder의 모든 PDF 도구', how: '3단계로 텍스트를 PDF로 변환하기', faq: '자주 묻는 질문', contact: '문의하기' },
  ru: { dir: 'ltr', cta: 'Создать PDF Бесплатно', start: 'Создать PDF', upload: 'Загрузить TXT', choose: 'Выбрать файл', tools: 'Все Инструменты PDF на MyPDFBuilder', how: 'Как Конвертировать Текст в PDF за 3 Шага', faq: 'Частые Вопросы', contact: 'Связаться с нами' },
  it: { dir: 'ltr', cta: 'Crea PDF Gratis', start: 'Inizia a Creare PDF', upload: 'Carica File TXT', choose: 'Scegli file', tools: 'Tutti gli Strumenti PDF su MyPDFBuilder', how: 'Come Convertire Testo in PDF in 3 Passaggi', faq: 'Domande Frequenti', contact: 'Contattaci' },
  tr: { dir: 'ltr', cta: 'Ücretsiz PDF Oluştur', start: 'PDF Oluşturmaya Başla', upload: 'TXT Dosyası Yükle', choose: 'Dosya seç', tools: 'MyPDFBuilder Tüm PDF Araçları', how: '3 Adımda Metni PDF’ye Dönüştürme', faq: 'Sıkça Sorulan Sorular', contact: 'İletişim' },
  id: { dir: 'ltr', cta: 'Buat PDF Gratis', start: 'Mulai Buat PDF', upload: 'Unggah File TXT', choose: 'Pilih file', tools: 'Semua Alat PDF di MyPDFBuilder', how: 'Cara Mengubah Teks ke PDF dalam 3 Langkah', faq: 'Pertanyaan Umum', contact: 'Hubungi Kami' },
  bn: { dir: 'ltr', cta: 'বিনামূল্যে PDF তৈরি করুন', start: 'PDF তৈরি শুরু করুন', upload: 'TXT ফাইল আপলোড', choose: 'ফাইল বাছুন', tools: 'MyPDFBuilder-এর সব PDF টুলস', how: '৩টি সহজ ধাপে টেক্সটকে PDF-এ রূপান্তর করুন', faq: 'সচরাচর জিজ্ঞাসিত প্রশ্ন', contact: 'যোগাযোগ করুন' },
};

export default function App() {
  const [lang, setLang] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      return saved && UI_TRANSLATIONS[saved] ? saved : 'en';
    } catch {
      return 'en';
    }
  });
  const t = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.en;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = t.dir;
    try { localStorage.setItem(LANG_KEY, lang); } catch {}
  }, [lang, t.dir]);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(THEME_KEY) === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
    try {
      localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [darkMode]);

  const [activePlatformTool, setActivePlatformTool] = useState<ActivePlatformTool>(() =>
    typeof window !== 'undefined' ? getToolFromPathname(window.location.pathname) : 'text-to-pdf'
  );

  const activeSeo = TOOLS_SEO[activePlatformTool];

  useEffect(() => {
    document.title = activeSeo.seoTitle;
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) descMeta.setAttribute('content', activeSeo.seoDescription);
    const canon = document.querySelector('link[rel="canonical"]');
    const canonicalUrl = `https://mypdfbuilder.com/${activeSeo.slug}/`;
    if (canon) canon.setAttribute('href', canonicalUrl);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);
    const twitterUrl = document.querySelector('meta[name="twitter:url"]');
    if (twitterUrl) twitterUrl.setAttribute('content', canonicalUrl);
  }, [activeSeo]);

  useEffect(() => {
    const onPop = () => setActivePlatformTool(getToolFromPathname(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const [convertDropdownOpen, setConvertDropdownOpen] = useState(false);
  const [allToolsDropdownOpen, setAllToolsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [legalDoc, setLegalDoc] = useState<LegalDocType>(null);
  const [activeToolModal, setActiveToolModal] = useState<UtilityToolId>(null);

  const [legacyDraftRestored] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTOSAVE_PREF_KEY) === null
        && localStorage.getItem(LEGACY_AUTOSAVE_PREF_KEY) === 'true'
        && localStorage.getItem(AUTOSAVE_TEXT_KEY) !== null;
    } catch {
      return false;
    }
  });

  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTOSAVE_PREF_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [text, setText] = useState<string>(() => {
    try {
      const currentPreference = localStorage.getItem(AUTOSAVE_PREF_KEY);
      const shouldRestoreLegacyDraft = currentPreference === null
        && localStorage.getItem(LEGACY_AUTOSAVE_PREF_KEY) === 'true';
      const saved = (currentPreference === 'true' || shouldRestoreLegacyDraft)
        ? localStorage.getItem(AUTOSAVE_TEXT_KEY)
        : null;
      return saved !== null ? saved : SAMPLE_DOCUMENT_TEXT;
    } catch {
      return SAMPLE_DOCUMENT_TEXT;
    }
  });

  const [history, setHistory] = useState<string[]>([text]);
  const [historyIdx, setHistoryIdx] = useState<number>(0);

  const updateTextWithHistory = useCallback(
    (nextText: string) => {
      setText(nextText);
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIdx + 1);
        if (sliced[sliced.length - 1] === nextText) return sliced;
        const updated = [...sliced, nextText].slice(-50);
        setHistoryIdx(updated.length - 1);
        return updated;
      });
    },
    [historyIdx]
  );

  const handleUndo = () => {
    if (historyIdx > 0) {
      const nextIdx = historyIdx - 1;
      setHistoryIdx(nextIdx);
      setText(history[nextIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const nextIdx = historyIdx + 1;
      setHistoryIdx(nextIdx);
      setText(history[nextIdx]);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(AUTOSAVE_PREF_KEY, String(autoSaveEnabled));
      if (autoSaveEnabled) localStorage.setItem(AUTOSAVE_TEXT_KEY, text);
      else localStorage.removeItem(AUTOSAVE_TEXT_KEY);
      localStorage.removeItem(LEGACY_AUTOSAVE_PREF_KEY);
    } catch {
      // ignore
    }
  }, [text, autoSaveEnabled]);

  const clearSavedStorage = () => {
    try {
      localStorage.removeItem(AUTOSAVE_TEXT_KEY);
    } catch {
      // ignore
    }
    setStatusBanner({ type: 'success', message: 'Saved browser draft cleared.' });
  };

  const [settings, setSettings] = useState<PdfSettings>(DEFAULT_PDF_SETTINGS);
  const updateSetting = <K extends keyof PdfSettings>(key: K, value: PdfSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (legacyDraftRestored) {
      setStatusBanner({
        type: 'success',
        message: 'An older draft was restored for this session. Auto-Save is off; enable it to keep changes after refresh.',
      });
    }
  }, [legacyDraftRestored]);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactStatus, setContactStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const stats = useMemo(() => {
    const characters = text.length;
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const lines = text === '' ? 0 : text.split(/\r\n|\r|\n/).length;
    return { characters, words, lines };
  }, [text]);

  const selectPlatformTool = (tool: ActivePlatformTool, focusUpload = false) => {
    setActivePlatformTool(tool);
    if (typeof window !== 'undefined') {
      const targetPath = `/${TOOLS_SEO[tool].slug}/`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ tool }, '', targetPath);
      }
    }
    setConvertDropdownOpen(false);
    setAllToolsDropdownOpen(false);
    setMobileMenuOpen(false);
    const el = document.getElementById('generator');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    if (tool === 'text-to-pdf') {
      if (focusUpload) fileInputRef.current?.click();
      else setTimeout(() => editorRef.current?.focus(), 350);
    }
  };

  const processTxtFile = (file: File) => {
    setStatusBanner(null);
    const isTxtExtension = file.name.toLowerCase().endsWith('.txt');
    const isPlainMime = file.type === '' || file.type === 'text/plain';
    if (!isTxtExtension && !isPlainMime) {
      setStatusBanner({ type: 'error', message: 'Invalid file type. Please upload a valid .txt plain text file.' });
      return;
    }
    if (file.size > MAX_TXT_BYTES) {
      setStatusBanner({ type: 'error', message: 'File exceeds the 5 MB browser limit.' });
      return;
    }
    const safeName = file.name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '').slice(0, 100) || 'imported.txt';
    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      updateTextWithHistory(content);
      setUploadedFilename(safeName);
      const baseTitle = safeName.replace(/\.txt$/i, '');
      if (baseTitle) updateSetting('title', baseTitle);
      setStatusBanner({ type: 'success', message: `Loaded "${safeName}" (${content.length.toLocaleString()} characters).` });
    };
    reader.readAsText(file);
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipText = await navigator.clipboard.readText();
        if (clipText) {
          updateTextWithHistory(clipText);
          setStatusBanner({ type: 'success', message: 'Pasted text from clipboard.' });
          return;
        }
      }
      editorRef.current?.focus();
      setStatusBanner({ type: 'error', message: 'Clipboard access blocked. Click in the editor and press Ctrl+V / Cmd+V.' });
    } catch {
      editorRef.current?.focus();
      setStatusBanner({ type: 'error', message: 'Clipboard access blocked. Click in the editor and press Ctrl+V / Cmd+V.' });
    }
  };

  const handleGeneratePdf = async () => {
    if (!text.trim()) {
      setStatusBanner({ type: 'error', message: 'Please enter or upload some text before generating a PDF.' });
      return;
    }
    setIsGenerating(true);
    setStatusBanner(null);
    try {
      const { blob, filename, pageCount } = await generatePdfBlob(text, settings);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      setStatusBanner({
        type: 'success',
        message: `Generated "${filename}" (${pageCount} ${pageCount === 1 ? 'page' : 'pages'}). Download started.`,
      });
    } catch (err) {
      setStatusBanner({ type: 'error', message: err instanceof Error ? err.message : 'PDF generation failed.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintDocument = () => {
    if (!text.trim()) {
      setStatusBanner({ type: 'error', message: 'Please enter or upload some text before printing.' });
      return;
    }
    const { pages, formattedDate } = paginateText(text, settings);
    const printWin = window.open('', '_blank', 'width=900,height=700');
    if (!printWin) {
      window.print();
      return;
    }
    const escapeHtml = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const safeHex = (c: string, fallback: string) => (/^#[0-9A-Fa-f]{6}$/.test(c) ? c : fallback);
    const safeBg = safeHex(settings.backgroundColor, '#FFFFFF');
    const safeColor = safeHex(settings.fontColor, '#1E293B');
    const pagesHtml = pages
      .map(
        (lines, i) => `
        <div class="print-page" style="background:${safeBg}; text-align:${settings.alignment}; font-family:${settings.fontFamily}; font-size:${settings.fontSize}pt; line-height:${settings.lineSpacing}; color:${safeColor}; font-weight:${settings.isBold ? 'bold' : 'normal'}; font-style:${settings.isItalic ? 'italic' : 'normal'};">
          <div class="meta-row"><span>${escapeHtml(settings.headerText)}</span><span>${settings.includeDate ? escapeHtml(formattedDate) : ''}</span></div>
          <div class="body">${lines.map((l) => `<div>${l === '' ? '&nbsp;' : escapeHtml(l)}</div>`).join('')}</div>
          <div class="meta-row"><span>${escapeHtml(settings.footerText)}</span><span>${
          settings.pageNumbering === 'page-of' ? `Page ${i + 1} of ${pages.length}` : settings.pageNumbering === 'slash' ? `${i + 1} / ${pages.length}` : ''
        }</span></div>
        </div>`
      )
      .join('');
    printWin.document.write(`<!doctype html><html><head><title>${escapeHtml(settings.title || 'Document')}</title>
      <style>@page { size: ${settings.pageSize} ${settings.orientation}; margin: 0; } body { margin: 0; } .print-page { box-sizing: border-box; width: 100%; min-height: 100vh; padding: ${
      settings.margins === 'narrow' ? '12mm' : settings.margins === 'wide' ? '30mm' : '20mm'
    }; page-break-after: always; display: flex; flex-direction: column; justify-content: space-between; } .meta-row { display: flex; justify-content: space-between; font-size: 9pt; color: #64748B; } .body { flex: 1; margin: 6mm 0; }</style></head><body>${pagesHtml}</body></html>`);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => printWin.print(), 250);
  };

  const handleResetEditor = () => {
    updateTextWithHistory('');
    setSettings(DEFAULT_PDF_SETTINGS);
    setUploadedFilename(null);
    setStatusBanner({ type: 'success', message: 'Editor and formatting settings reset.' });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email.trim())) {
      setContactStatus({ type: 'error', message: 'Please provide a valid name, email address, and message.' });
      return;
    }
    const subject = contactForm.subject.trim() || 'MyPDFBuilder support request';
    const body = `${contactForm.message.trim()}\n\nFrom: ${contactForm.name.trim()} (${contactForm.email.trim()})`;
    window.location.href = `mailto:support@mypdfbuilder.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setContactStatus({ type: 'success', message: 'Your email application should open with a draft. Review it and send it there to contact support.' });
  };

  return (
    <div id="home" className="min-h-screen bg-white text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {/* iLovePDF-inspired Sticky Header with Mega Dropdowns */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 lg:gap-8">
            <a href="#home" className="flex shrink-0 items-center gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className="h-10 w-10 shrink-0 drop-shadow-sm">
                <defs>
                  <linearGradient id="mpbBg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#312E81"/><stop offset="55%" stopColor="#4F46E5"/><stop offset="100%" stopColor="#0EA5E9"/></linearGradient>
                  <style>{`
                    @keyframes mpbBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2.2px); } }
                    @keyframes mpbBlink { 0%, 92%, 100% { transform: scaleY(1); } 96% { transform: scaleY(0.15); } }
                    .mpb-bob { animation: mpbBob 2.2s ease-in-out infinite; transform-origin: center; }
                    .mpb-eye { animation: mpbBlink 3.6s ease-in-out infinite; transform-origin: center 27px; }
                  `}</style>
                </defs>
                <rect width="64" height="64" rx="16" fill="url(#mpbBg)"/>
                <g className="mpb-bob">
                  <circle cx="20" cy="21" r="4.5" fill="#78350F"/><circle cx="44" cy="21" r="4.5" fill="#78350F"/>
                  <ellipse cx="32" cy="30" rx="14" ry="12" fill="#92400E"/>
                  <ellipse cx="25" cy="34" rx="4.5" ry="3.2" fill="#D97706"/><ellipse cx="39" cy="34" rx="4.5" ry="3.2" fill="#D97706"/>
                  <path d="M19 22c0-6.5 5.8-11 13-11s13 4.5 13 11H19z" fill="#FACC15"/>
                  <rect x="16" y="20.5" width="32" height="3.5" rx="1.75" fill="#EAB308"/>
                  <rect x="29.5" y="12" width="5" height="8" rx="2" fill="#FEF08A"/>
                  <circle cx="26.5" cy="27.5" r="2.2" fill="#FFFFFF" className="mpb-eye"/><circle cx="37.5" cy="27.5" r="2.2" fill="#FFFFFF" className="mpb-eye"/>
                  <circle cx="26.8" cy="27.5" r="1.1" fill="#0F172A" className="mpb-eye"/><circle cx="37.8" cy="27.5" r="1.1" fill="#0F172A" className="mpb-eye"/>
                  <ellipse cx="32" cy="31.5" rx="3" ry="2" fill="#1E293B"/>
                  <rect x="29.5" y="34" width="2.2" height="3.2" rx="0.6" fill="#FFFFFF"/><rect x="32.3" y="34" width="2.2" height="3.2" rx="0.6" fill="#FFFFFF"/>
                  <rect x="21" y="40" width="22" height="16" rx="3" fill="#FFFFFF" stroke="#C7D2FE" strokeWidth="1.5"/>
                  <rect x="25" y="44" width="14" height="2.2" rx="1.1" fill="#4F46E5"/><rect x="25" y="48.5" width="10" height="2.2" rx="1.1" fill="#38BDF8"/>
                </g>
              </svg>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                MyPDF<span className="text-indigo-600 dark:text-indigo-400">Builder</span>
              </span>
            </a>

            <nav aria-label="Primary Navigation" className="hidden items-center gap-5 xl:flex lg:gap-6">
              <button type="button" onClick={() => selectPlatformTool('text-to-pdf')} className="whitespace-nowrap text-xs font-bold uppercase tracking-wide text-slate-800 hover:text-indigo-600 dark:text-slate-100">
                Text to PDF
              </button>
              <button type="button" onClick={() => selectPlatformTool('merge-pdf')} className="whitespace-nowrap text-xs font-bold uppercase tracking-wide text-slate-800 hover:text-indigo-600 dark:text-slate-100">
                Merge PDF
              </button>
              <button type="button" onClick={() => selectPlatformTool('split-pdf')} className="whitespace-nowrap text-xs font-bold uppercase tracking-wide text-slate-800 hover:text-indigo-600 dark:text-slate-100">
                Split PDF
              </button>
              <button type="button" onClick={() => selectPlatformTool('compress-pdf')} className="whitespace-nowrap text-xs font-bold uppercase tracking-wide text-slate-800 hover:text-indigo-600 dark:text-slate-100">
                Compress PDF
              </button>

            {/* CONVERT PDF Two-Column Mega Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setConvertDropdownOpen((o) => !o);
                  setAllToolsDropdownOpen(false);
                }}
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400"
              >
                Convert PDF <ChevronDown className={`h-3.5 w-3.5 transition-transform ${convertDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {convertDropdownOpen && (
                <div className="custom-scrollbar absolute left-0 top-full z-50 mt-3 max-h-[75vh] w-[480px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Convert to PDF</div>
                      <ul className="space-y-1.5 text-sm">
                        <li><button type="button" onClick={() => selectPlatformTool('text-to-pdf')} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 font-semibold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"><FileText className="h-4 w-4" /> TEXT to PDF</button></li>
                        <li><button type="button" onClick={() => selectPlatformTool('jpg-to-pdf')} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"><FileImage className="h-4 w-4 text-amber-500" /> JPG to PDF</button></li>
                        <li><button type="button" onClick={() => selectPlatformTool('html-to-pdf')} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"><FileCode2 className="h-4 w-4 text-orange-500" /> HTML to PDF</button></li>
                        <li><button type="button" onClick={() => selectPlatformTool('word-to-pdf')} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"><FileText className="h-4 w-4 text-blue-600" /> WORD to PDF</button></li>
                        <li><button type="button" onClick={() => selectPlatformTool('powerpoint-to-pdf')} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"><Presentation className="h-4 w-4 text-orange-600" /> POWERPOINT to PDF</button></li>
                        <li><button type="button" onClick={() => selectPlatformTool('excel-to-pdf')} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"><Table className="h-4 w-4 text-emerald-600" /> EXCEL to PDF</button></li>
                      </ul>
                    </div>
                    <div>
                      <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Convert from PDF</div>
                      <ul className="space-y-1.5 text-sm">
                        <li><button type="button" onClick={() => selectPlatformTool('pdf-to-jpg')} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"><FileImage className="h-4 w-4 text-amber-500" /> PDF to JPG</button></li>
                        <li><button type="button" onClick={() => selectPlatformTool('pdf-to-text')} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"><BookOpen className="h-4 w-4 text-indigo-500" /> PDF to TEXT</button></li>
                        <li><button type="button" onClick={() => selectPlatformTool('pdf-to-word')} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"><FileText className="h-4 w-4 text-blue-600" /> PDF to WORD</button></li>
                        <li><button type="button" onClick={() => selectPlatformTool('pdf-to-powerpoint')} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"><Presentation className="h-4 w-4 text-orange-600" /> PDF to POWERPOINT</button></li>
                        <li><button type="button" onClick={() => selectPlatformTool('pdf-to-excel')} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"><Table className="h-4 w-4 text-emerald-600" /> PDF to EXCEL</button></li>
                        <li><button type="button" onClick={() => selectPlatformTool('pdf-to-pdfa')} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"><ShieldCheck className="h-4 w-4 text-indigo-600" /> PDF Archive Metadata</button></li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ALL PDF TOOLS Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setAllToolsDropdownOpen((o) => !o);
                  setConvertDropdownOpen(false);
                }}
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-700 hover:text-indigo-600 dark:text-slate-200"
              >
                All PDF Tools <ChevronDown className={`h-3.5 w-3.5 transition-transform ${allToolsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {allToolsDropdownOpen && (
                <div className="custom-scrollbar absolute right-0 top-full z-50 mt-3 max-h-[75vh] w-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                  {PLATFORM_TABS.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => selectPlatformTool(id)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Icon className="h-4 w-4 text-indigo-600" /> {label}
                    </button>
                  ))}
                  <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />
                  <a href="#how-it-works" onClick={() => setAllToolsDropdownOpen(false)} className="block rounded-xl px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100">How It Works</a>
                  <a href="#faq" onClick={() => setAllToolsDropdownOpen(false)} className="block rounded-xl px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100">FAQ</a>
                  <a href="#contact" onClick={() => setAllToolsDropdownOpen(false)} className="block rounded-xl px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100">Contact</a>
                </div>
              )}
            </div>
          </nav>

                    </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <select
              aria-label="Select language"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="w-14 rounded-xl border border-slate-200 bg-white px-1.5 py-1.5 text-center text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none sm:w-auto sm:px-2.5 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="fr">FR</option>
              <option value="de">DE</option>
              <option value="hi">हिन्दी</option>
              <option value="pt">PT</option>
              <option value="zh">中文</option>
              <option value="ar">العربية</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
              <option value="ru">Русский</option>
              <option value="it">Italiano</option>
              <option value="tr">Türkçe</option>
              <option value="id">Indonesia</option>
              <option value="bn">বাংলা</option>
            </select>
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="hidden rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 sm:inline-flex dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={() => selectPlatformTool('text-to-pdf')}
              className="hidden rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 xl:inline-flex"
            >
              {t.cta}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="rounded-xl border border-slate-200 p-2 text-slate-600 xl:hidden dark:border-slate-800 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="custom-scrollbar max-h-[70vh] overflow-y-auto border-t border-slate-200 bg-white px-4 py-4 xl:hidden dark:border-slate-800 dark:bg-slate-950">
            <div className="grid grid-cols-2 gap-2">
              {PLATFORM_TABS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => selectPlatformTool(id)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-left text-xs font-semibold hover:bg-slate-100 dark:border-slate-800"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <AdSlot placement="header-banner" />

      <main>
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8 lg:pt-10">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300">
                <Shield className="h-3.5 w-3.5" /> MyPDFBuilder.com &bull; All-in-One Browser PDF Suite
              </div>
              <nav aria-label="Breadcrumb" className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <a href="/" onClick={(e) => { e.preventDefault(); selectPlatformTool('text-to-pdf'); }} className="hover:text-indigo-600">mypdfbuilder.com</a>
                <span>&rsaquo;</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{activeSeo.slug}</span>
              </nav>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
                {activeSeo.h1}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
                {activeSeo.heroSubtitle}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => selectPlatformTool('text-to-pdf')}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
                >
                  <FilePlus2 className="h-4 w-4" />
                  {t.start}
                </button>
                <button
                  type="button"
                  onClick={() => selectPlatformTool('text-to-pdf', true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <FileUp className="h-4 w-4" />
                  {t.upload}
                </button>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> 100% Free</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> No Sign-up</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Secure Processing</span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl border-2 border-dashed border-indigo-200 bg-white px-6 py-10 text-center shadow-sm transition hover:border-indigo-400 dark:border-indigo-900/70 dark:bg-slate-900">
                <div className="mx-auto flex max-w-md flex-col items-center">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm"><FileUp className="h-5 w-5" /></span>
                    <h2 className="text-xl font-extrabold tracking-tight">Online PDF Converter</h2>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {activeSeo.heroSubtitle}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                    if (activePlatformTool === 'text-to-pdf') fileInputRef.current?.click();
                    else document.getElementById('tool-upload')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                    className="mt-6 inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700"
                  >
                    <Plus className="h-5 w-5" />
                    <span>{t.choose}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <AdSlot placement="below-hero" />

        {/* Platform Tool Switcher & Active Workspace */}
        <section id="generator" className="bg-slate-50 py-10 dark:bg-slate-900/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 rounded-3xl border-2 border-dashed border-indigo-200 bg-white px-6 py-10 text-center shadow-sm transition hover:border-indigo-400 dark:border-indigo-900/70 dark:bg-slate-900">
              <div className="mx-auto flex max-w-xl flex-col items-center">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                    <FileUp className="h-5 w-5" />
                  </span>
                  <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">{activeSeo.name}</h2>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Easily convert to and from PDF in seconds. Choose a file from your device or drag &amp; drop below.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (activePlatformTool === 'text-to-pdf') fileInputRef.current?.click();
                    else document.getElementById('tool-upload')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="mt-6 inline-flex w-full max-w-xs items-center justify-center gap-2.5 rounded-full bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700"
                >
                  <Plus className="h-5 w-5" />
                  <span>Choose file</span>
                </button>
              </div>
            </div>
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {PLATFORM_TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActivePlatformTool(id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    activePlatformTool === id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>

            {activePlatformTool !== 'text-to-pdf' ? (
              <Suspense fallback={<div role="status" aria-live="polite" className="rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">Loading PDF tool…</div>}>
                <PdfToolsSuite
                  activeTool={activePlatformTool}
                  onSendTextToEditor={(extracted) => {
                    updateTextWithHistory(extracted);
                    setActivePlatformTool('text-to-pdf');
                    setStatusBanner({ type: 'success', message: 'Loaded extracted PDF text into the Text to PDF editor.' });
                  }}
                />
              </Suspense>
            ) : (
              <div>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Text to PDF Editor &amp; Live Customizer
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Type, paste, or drop a .txt file below. Customize layout and download your PDF in one click.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={autoSaveEnabled}
                        onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                        className="h-3.5 w-3.5 accent-indigo-600"
                      />
                      Auto-Save Draft Locally
                    </label>
                    <button
                      type="button"
                      onClick={clearSavedStorage}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    >
                      Clear Saved Data
                    </button>
                  </div>
                </div>

                {statusBanner && (
                  <div
                    role="status"
                    className={`mb-5 flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium ${
                      statusBanner.type === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'
                        : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200'
                    }`}
                  >
                    <span>{statusBanner.message}</span>
                    <button type="button" onClick={() => setStatusBanner(null)} aria-label="Dismiss notification" className="ml-4 rounded p-1 hover:bg-black/5">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="grid min-w-0 gap-6 lg:grid-cols-12">
                  <div className="min-w-0 space-y-6 lg:col-span-7">
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) processTxtFile(file);
                      }}
                      className={`rounded-2xl border bg-white p-4 shadow-sm transition dark:bg-slate-900 ${
                        isDragging ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".txt,text/plain"
                            aria-label="Upload a plain text file"
                            className="sr-only"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) processTxtFile(file);
                              e.target.value = '';
                            }}
                          />
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300">
                            <FileUp className="h-3.5 w-3.5" /> Upload TXT
                          </button>
                          <button type="button" onClick={handlePasteClipboard} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                            <ClipboardPaste className="h-3.5 w-3.5" /> Paste
                          </button>
                          <button type="button" onClick={() => updateTextWithHistory(SAMPLE_DOCUMENT_TEXT)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                            <Sparkles className="h-3.5 w-3.5" /> Sample
                          </button>
                          <button type="button" onClick={() => { updateTextWithHistory(''); setUploadedFilename(null); }} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-slate-700">
                            <Trash2 className="h-3.5 w-3.5" /> Clear
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={handleUndo} disabled={historyIdx <= 0} aria-label="Undo" className="rounded-lg border border-slate-200 p-1.5 disabled:opacity-40 dark:border-slate-700"><Undo2 className="h-3.5 w-3.5" /></button>
                          <button type="button" onClick={handleRedo} disabled={historyIdx >= history.length - 1} aria-label="Redo" className="rounded-lg border border-slate-200 p-1.5 disabled:opacity-40 dark:border-slate-700"><Redo2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>

                      {uploadedFilename && (
                        <div className="mb-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-xs dark:bg-slate-800">
                          <span className="flex items-center gap-1.5 font-medium"><FileCheck2 className="h-4 w-4 text-emerald-600" /> Imported file: {uploadedFilename}</span>
                          <button type="button" onClick={() => setUploadedFilename(null)} aria-label="Clear filename badge"><X className="h-3.5 w-3.5" /></button>
                        </div>
                      )}

                      <textarea
                        ref={editorRef}
                        value={text}
                        onChange={(e) => updateTextWithHistory(e.target.value)}
                        rows={12}
                        aria-label="Document text editor"
                        placeholder="Type or paste your text here, or drag and drop a .txt file..."
                        className="custom-scrollbar min-w-0 w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm leading-relaxed focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950"
                      />

                      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                        <div className="flex items-center gap-4">
                          <span><strong className="text-slate-800 dark:text-slate-200">{stats.characters.toLocaleString()}</strong> characters</span>
                          <span><strong className="text-slate-800 dark:text-slate-200">{stats.words.toLocaleString()}</strong> words</span>
                          <span><strong className="text-slate-800 dark:text-slate-200">{stats.lines.toLocaleString()}</strong> lines</span>
                        </div>
                        <span>Drag &amp; drop .txt files (max 5 MB)</span>
                      </div>
                    </div>

                    <PdfPreview text={text} settings={settings} />
                  </div>

                  <div className="min-w-0 lg:col-span-5">
                    <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                        <Sliders className="h-4 w-4 text-indigo-600" />
                        <h3 className="text-base font-bold">PDF Customization</h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label htmlFor="doc-title" className="mb-1 block text-xs font-semibold">Document Title (Filename)</label>
                          <input id="doc-title" type="text" value={settings.title} onChange={(e) => updateSetting('title', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label htmlFor="font-family" className="mb-1 block text-xs font-semibold">Font Family</label>
                            <select id="font-family" value={settings.fontFamily} onChange={(e) => updateSetting('fontFamily', e.target.value as FontFamilyOption)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
                              <option value="Helvetica">Helvetica</option>
                              <option value="Arial">Arial</option>
                              <option value="Times New Roman">Times New Roman</option>
                              <option value="Courier">Courier</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="font-size" className="mb-1 block text-xs font-semibold">Font Size ({settings.fontSize} pt)</label>
                            <input id="font-size" type="range" min={8} max={24} step={1} value={settings.fontSize} onChange={(e) => updateSetting('fontSize', Number(e.target.value))} className="mt-2 w-full accent-indigo-600" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label htmlFor="font-color" className="mb-1 block text-xs font-semibold">Font Color</label>
                            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-950">
                              <input id="font-color" type="color" value={settings.fontColor} onChange={(e) => updateSetting('fontColor', e.target.value)} className="h-6 w-7 cursor-pointer border-0 bg-transparent p-0" />
                              <span className="font-mono text-xs">{settings.fontColor}</span>
                            </div>
                          </div>
                          <div>
                            <label htmlFor="bg-color" className="mb-1 block text-xs font-semibold">Page Background</label>
                            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-950">
                              <input id="bg-color" type="color" value={settings.backgroundColor} onChange={(e) => updateSetting('backgroundColor', e.target.value)} className="h-6 w-7 cursor-pointer border-0 bg-transparent p-0" />
                              <span className="font-mono text-xs">{settings.backgroundColor}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label htmlFor="page-size" className="mb-1 block text-xs font-semibold">Page Size</label>
                            <select id="page-size" value={settings.pageSize} onChange={(e) => updateSetting('pageSize', e.target.value as PageSizeOption)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
                              <option value="A4">A4 (210×297 mm)</option>
                              <option value="A3">A3 (297×420 mm)</option>
                              <option value="Letter">Letter (8.5×11 in)</option>
                              <option value="Legal">Legal (8.5×14 in)</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="orientation" className="mb-1 block text-xs font-semibold">Orientation</label>
                            <select id="orientation" value={settings.orientation} onChange={(e) => updateSetting('orientation', e.target.value as OrientationOption)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
                              <option value="portrait">Portrait</option>
                              <option value="landscape">Landscape</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label htmlFor="margins" className="mb-1 block text-xs font-semibold">Page Margins</label>
                            <select id="margins" value={settings.margins} onChange={(e) => updateSetting('margins', e.target.value as MarginOption)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
                              <option value="normal">Normal (20 mm)</option>
                              <option value="narrow">Narrow (12 mm)</option>
                              <option value="wide">Wide (30 mm)</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="line-spacing" className="mb-1 block text-xs font-semibold">Line Spacing</label>
                            <select id="line-spacing" value={settings.lineSpacing} onChange={(e) => updateSetting('lineSpacing', Number(e.target.value))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
                              <option value={1.0}>1.0 (Single)</option>
                              <option value={1.15}>1.15</option>
                              <option value={1.5}>1.5</option>
                              <option value={1.8}>1.8</option>
                              <option value={2.0}>2.0 (Double)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <span className="mb-1 block text-xs font-semibold">Text Alignment</span>
                            <div className="grid grid-cols-4 gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950">
                              {([
                                { id: 'left', icon: AlignLeft, label: 'Align left' },
                                { id: 'center', icon: AlignCenter, label: 'Align center' },
                                { id: 'right', icon: AlignRight, label: 'Align right' },
                                { id: 'justify', icon: AlignJustify, label: 'Justify' },
                              ] as const).map(({ id, icon: Icon, label }) => (
                                <button key={id} type="button" aria-label={label} onClick={() => updateSetting('alignment', id as AlignmentOption)} className={`flex items-center justify-center rounded-lg py-1.5 ${settings.alignment === id ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                  <Icon className="h-3.5 w-3.5" />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="mb-1 block text-xs font-semibold">Font Style</span>
                            <div className="grid grid-cols-2 gap-1.5">
                              <button type="button" onClick={() => updateSetting('isBold', !settings.isBold)} className={`inline-flex items-center justify-center gap-1 rounded-xl border py-2 text-xs font-semibold ${settings.isBold ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950'}`}><Bold className="h-3.5 w-3.5" /> Bold</button>
                              <button type="button" onClick={() => updateSetting('isItalic', !settings.isItalic)} className={`inline-flex items-center justify-center gap-1 rounded-xl border py-2 text-xs font-semibold ${settings.isItalic ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950'}`}><Italic className="h-3.5 w-3.5" /> Italic</button>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="header-text" className="mb-1 block text-xs font-semibold">Header Text</label>
                            <input id="header-text" type="text" value={settings.headerText} onChange={(e) => updateSetting('headerText', e.target.value)} placeholder="Optional header" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950" />
                          </div>
                          <div>
                            <label htmlFor="footer-text" className="mb-1 block text-xs font-semibold">Footer Text</label>
                            <input id="footer-text" type="text" value={settings.footerText} onChange={(e) => updateSetting('footerText', e.target.value)} placeholder="Optional footer" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2">
                          <div>
                            <label htmlFor="page-numbering" className="mb-1 block text-xs font-semibold">Page Numbering</label>
                            <select id="page-numbering" value={settings.pageNumbering} onChange={(e) => updateSetting('pageNumbering', e.target.value as PageNumberOption)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950">
                              <option value="page-of">Page 1 of N</option>
                              <option value="slash">1 / N</option>
                              <option value="none">None</option>
                            </select>
                          </div>
                          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950">
                            <input type="checkbox" checked={settings.includeDate} onChange={(e) => updateSetting('includeDate', e.target.checked)} className="h-4 w-4 accent-indigo-600" />
                            Include Date
                          </label>
                        </div>

                        <div className="space-y-2.5 pt-2">
                          <button type="button" onClick={handleGeneratePdf} disabled={isGenerating} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-60">
                            <Download className="h-4 w-4" />
                            {isGenerating ? 'Generating PDF...' : 'Generate & Download PDF'}
                          </button>
                          <div className="grid grid-cols-2 gap-2.5">
                            <button type="button" onClick={handlePrintDocument} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800"><Printer className="h-4 w-4" /> Print Document</button>
                            <button type="button" onClick={handleResetEditor} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800"><RotateCcw className="h-4 w-4" /> Reset Editor</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* All Platform & Utility Tools Grid */}
        <section id="tools" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Every PDF Tool You Need on MyPDFBuilder</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              All core conversion and PDF editing tools run directly in your browser with zero uploads.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PLATFORM_TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => selectPlatformTool(id)} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900">
                <Icon className="h-6 w-6 text-indigo-600" />
                <h3 className="mt-3 text-base font-bold">{label}</h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Open {label} workspace</p>
              </button>
            ))}
            <button type="button" onClick={() => setActiveToolModal('word-counter')} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900">
              <BookOpen className="h-6 w-6 text-indigo-600" />
              <h3 className="mt-3 text-base font-bold">Word Counter</h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Count words &amp; reading time.</p>
            </button>
            <button type="button" onClick={() => setActiveToolModal('char-counter')} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900">
              <Hash className="h-6 w-6 text-indigo-600" />
              <h3 className="mt-3 text-base font-bold">Character Counter</h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Measure characters &amp; lines.</p>
            </button>
            <button type="button" onClick={() => setActiveToolModal('page-calculator')} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900">
              <Calculator className="h-6 w-6 text-indigo-600" />
              <h3 className="mt-3 text-base font-bold">PDF Page Size Calculator</h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Compare A4, A3, Letter, Legal.</p>
            </button>
            <button type="button" onClick={() => setActiveToolModal('text-formatter')} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900">
              <CaseSensitive className="h-6 w-6 text-indigo-600" />
              <h3 className="mt-3 text-base font-bold">Text Formatter</h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Clean spaces &amp; convert case.</p>
            </button>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="bg-slate-50 py-14 dark:bg-slate-900/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold sm:text-3xl">How to Convert Text to PDF in 3 Simple Steps</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Everything runs directly in your browser with no account registration or software installation.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { step: '1', title: 'Enter or Upload Your Text', desc: 'Type or paste content into the editor, or drag and drop a .txt file directly from your device.' },
                { step: '2', title: 'Customize Your PDF Document', desc: 'Choose paper size, orientation, margins, font family, colors, alignment, headers, footers, and page numbers.' },
                { step: '3', title: 'Generate and Download Your PDF', desc: 'Verify the live multi-page preview, then click Generate & Download PDF or print immediately.' },
              ].map((item) => (
                <div key={item.step} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-base font-extrabold text-white">{item.step}</span>
                  <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">Why Use MyPDFBuilder?</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Sparkles, title: 'Completely Free PDF Generation', desc: 'Create unlimited PDFs with zero watermarks or hidden fees.' },
              { icon: Lock, title: 'No Registration Required', desc: 'Start converting text immediately without creating an account.' },
              { icon: Zap, title: 'Fast PDF Conversion', desc: 'Instant client-side rendering produces downloadable files in milliseconds.' },
              { icon: Shield, title: 'Secure Browser-Based Processing', desc: 'Your files stay on your device and are never uploaded to external servers.' },
              { icon: FileText, title: 'Multiple Paper Sizes', desc: 'Supports A4, A3, US Letter, and Legal in Portrait or Landscape.' },
              { icon: Palette, title: 'Custom Fonts & Formatting', desc: 'Adjust font family, size, color, bold/italic, alignment, and background.' },
              { icon: BookOpen, title: 'Automatic Page Breaks', desc: 'Long documents wrap cleanly across pages without cut-off text.' },
              { icon: Smartphone, title: 'Mobile-Friendly Interface', desc: 'Responsive layout works smoothly on phones, tablets, and desktops.' },
              { icon: Laptop, title: 'No Software Installation', desc: 'Runs in any modern browser on Windows, macOS, Linux, iOS, and Android.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="inline-flex rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"><Icon className="h-5 w-5" /></div>
                <h3 className="mt-3 text-base font-bold">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <AdSlot placement="mid-content" />

        {/* SEO Content */}
        <article className="mx-auto max-w-4xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
          <section><h2 className="text-2xl font-bold">What Is a Text to PDF Converter?</h2><p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">A Text to PDF Converter transforms plain text or <code>.txt</code> files into a standardized PDF file with locked typography, margins, headers, footers, and page breaks.</p></section>
          <section><h2 className="text-2xl font-bold">How to Convert Text to PDF Online for Free</h2><p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">Type or paste content into the MyPDFBuilder editor, customize your page layout, check the live preview, and click <strong>Generate &amp; Download PDF</strong>.</p></section>
          <section><h2 className="text-2xl font-bold">Why Convert Text Files into PDF?</h2><p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">PDFs preserve formatting across every device and printer, making them ideal for assignments, reports, contracts, and invoices.</p></section>
          <section><h2 className="text-2xl font-bold">Can I Convert TXT Files into PDF?</h2><p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">Yes. Upload or drag and drop any <code>.txt</code> file up to 5 MB and export it as a formatted multi-page PDF.</p></section>
          <section><h2 className="text-2xl font-bold">Is This Text to PDF Converter Free?</h2><p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">Yes. Every tool on MyPDFBuilder is 100% free with no sign-up and no watermarks.</p></section>
          <section><h2 className="text-2xl font-bold">Is My Text Secure?</h2><p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">Yes. All conversions run locally in your browser; nothing is transmitted to external servers.</p></section>
        </article>

        <AdSlot placement="before-faq" />

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Frequently Asked Questions</h2>
          <div className="mt-8 space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={item.question} className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <button type="button" aria-expanded={isOpen} onClick={() => setOpenFaqIdx(isOpen ? null : idx)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold sm:text-base">
                    <span>{item.question}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">{item.answer}</div>}
                </div>
              );
            })}
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="bg-slate-50 py-14 dark:bg-slate-900/40">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2.5">
                <Mail className="h-5 w-5 text-indigo-600" />
                <h2 className="text-2xl font-bold">{t.contact}</h2>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Questions or feedback? This form opens your email application; messages are not sent to a website server. You can also email <a href="mailto:support@mypdfbuilder.com" className="font-semibold text-indigo-600 underline">support@mypdfbuilder.com</a>.
              </p>
              {contactStatus && (
                <div role={contactStatus.type === 'error' ? 'alert' : 'status'} aria-live={contactStatus.type === 'error' ? 'assertive' : 'polite'} className={`mt-4 rounded-xl border px-4 py-3 text-sm ${contactStatus.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
                  {contactStatus.message}
                </div>
              )}
              <form onSubmit={handleContactSubmit} className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label htmlFor="contact-name" className="text-sm font-medium">Name<input id="contact-name" type="text" autoComplete="name" required maxLength={100} placeholder="Your name" value={contactForm.name} onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))} className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950" /></label>
                  <label htmlFor="contact-email" className="text-sm font-medium">Email<input id="contact-email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" value={contactForm.email} onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))} className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950" /></label>
                </div>
                <label htmlFor="contact-subject" className="block text-sm font-medium">Subject<input id="contact-subject" type="text" maxLength={150} placeholder="Subject (optional)" value={contactForm.subject} onChange={(e) => setContactForm((p) => ({ ...p, subject: e.target.value }))} className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950" /></label>
                <label htmlFor="contact-message" className="block text-sm font-medium">Message<textarea id="contact-message" rows={4} required maxLength={10000} placeholder="Write your message..." value={contactForm.message} onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))} className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950" /></label>
                <button type="submit" className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Send Message</button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <AdSlot placement="footer-banner" />

      <footer className="border-t border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className="h-8 w-8 shrink-0 drop-shadow-sm">
                <defs>
                  <linearGradient id="mpbBgFt" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#312E81"/><stop offset="55%" stopColor="#4F46E5"/><stop offset="100%" stopColor="#0EA5E9"/></linearGradient>
                  <style>{`
                    @keyframes mpbBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2.2px); } }
                    @keyframes mpbBlink { 0%, 92%, 100% { transform: scaleY(1); } 96% { transform: scaleY(0.15); } }
                    .mpb-bob { animation: mpbBob 2.2s ease-in-out infinite; transform-origin: center; }
                    .mpb-eye { animation: mpbBlink 3.6s ease-in-out infinite; transform-origin: center 27px; }
                  `}</style>
                </defs>
                <rect width="64" height="64" rx="16" fill="url(#mpbBgFt)"/>
                <g className="mpb-bob">
                  <circle cx="20" cy="21" r="4.5" fill="#78350F"/><circle cx="44" cy="21" r="4.5" fill="#78350F"/>
                  <ellipse cx="32" cy="30" rx="14" ry="12" fill="#92400E"/>
                  <ellipse cx="25" cy="34" rx="4.5" ry="3.2" fill="#D97706"/><ellipse cx="39" cy="34" rx="4.5" ry="3.2" fill="#D97706"/>
                  <path d="M19 22c0-6.5 5.8-11 13-11s13 4.5 13 11H19z" fill="#FACC15"/>
                  <rect x="16" y="20.5" width="32" height="3.5" rx="1.75" fill="#EAB308"/>
                  <rect x="29.5" y="12" width="5" height="8" rx="2" fill="#FEF08A"/>
                  <circle cx="26.5" cy="27.5" r="2.2" fill="#FFFFFF" className="mpb-eye"/><circle cx="37.5" cy="27.5" r="2.2" fill="#FFFFFF" className="mpb-eye"/>
                  <circle cx="26.8" cy="27.5" r="1.1" fill="#0F172A" className="mpb-eye"/><circle cx="37.8" cy="27.5" r="1.1" fill="#0F172A" className="mpb-eye"/>
                  <ellipse cx="32" cy="31.5" rx="3" ry="2" fill="#1E293B"/>
                  <rect x="29.5" y="34" width="2.2" height="3.2" rx="0.6" fill="#FFFFFF"/><rect x="32.3" y="34" width="2.2" height="3.2" rx="0.6" fill="#FFFFFF"/>
                  <rect x="21" y="40" width="22" height="16" rx="3" fill="#FFFFFF" stroke="#C7D2FE" strokeWidth="1.5"/>
                  <rect x="25" y="44" width="14" height="2.2" rx="1.1" fill="#4F46E5"/><rect x="25" y="48.5" width="10" height="2.2" rx="1.1" fill="#38BDF8"/>
                </g>
              </svg>
                <span className="text-base font-extrabold">MyPDF<span className="text-indigo-600">Builder</span></span>
              </div>
              <p className="mt-3 max-w-xs text-xs leading-relaxed text-slate-500">mypdfbuilder.com — Free, privacy-first browser PDF suite to convert, merge, split, compress, and extract PDFs.</p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider">Navigation</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#home" className="hover:text-indigo-600">Home</a></li>
                <li><a href="#generator" className="hover:text-indigo-600">PDF Tools</a></li>
                <li><button type="button" onClick={() => setLegalDoc('about')} className="hover:text-indigo-600">About</button></li>
                <li><a href="#contact" className="hover:text-indigo-600">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider">Legal &amp; Compliance</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><button type="button" onClick={() => setLegalDoc('privacy')} className="hover:text-indigo-600">Privacy Policy</button></li>
                <li><button type="button" onClick={() => setLegalDoc('terms')} className="hover:text-indigo-600">Terms and Conditions</button></li>
                <li><button type="button" onClick={() => setLegalDoc('disclaimer')} className="hover:text-indigo-600">Disclaimer</button></li>
                <li><button type="button" onClick={() => setLegalDoc('cookies')} className="hover:text-indigo-600">Cookie Policy</button></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs text-slate-500 dark:border-slate-800">
            <p>&copy; {new Date().getFullYear()} MyPDFBuilder (mypdfbuilder.com). All rights reserved.</p>
            <p className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> 100% Client-Side Browser Processing</p>
          </div>
        </div>
      </footer>

      <LegalModal docType={legalDoc} onClose={() => setLegalDoc(null)} />
      <AdditionalToolsModal
        activeTool={activeToolModal}
        onClose={() => setActiveToolModal(null)}
        editorText={text}
        onApplyToEditor={(next) => {
          updateTextWithHistory(next);
          setActivePlatformTool('text-to-pdf');
          setStatusBanner({ type: 'success', message: 'Updated editor text from utility tool.' });
        }}
      />
      <CookieConsent onOpenCookiePolicy={() => setLegalDoc('cookies')} />
    </div>
  );
}
