import { ActivePlatformTool } from '../components/PdfToolsSuite';

export interface ToolSeoConfig {
  id: ActivePlatformTool;
  slug: string;
  name: string;
  seoTitle: string;
  seoDescription: string;
  h1: string;
  heroSubtitle: string;
  keywords: string;
}

export const TOOLS_SEO: Record<ActivePlatformTool, ToolSeoConfig> = {
  'text-to-pdf': {
    id: 'text-to-pdf',
    slug: 'text-to-pdf',
    name: 'Text to PDF',
    seoTitle: 'Text to PDF Converter – Convert Plain Text & TXT to PDF Free | MyPDFBuilder',
    seoDescription: 'Convert plain text or TXT files to PDF online for free. Customize fonts, margins, page size, headers, and download your PDF instantly at MyPDFBuilder.com.',
    h1: 'Free Text to PDF Converter – Create PDF Files Online',
    heroSubtitle: 'Convert text or .txt files into professional PDF documents instantly. Customize fonts, margins, preview your layout, and download for free.',
    keywords: 'Text to PDF Converter, TXT to PDF, Convert Text to PDF Online',
  },
  'jpg-to-pdf': {
    id: 'jpg-to-pdf',
    slug: 'jpg-to-pdf',
    name: 'JPG to PDF',
    seoTitle: 'Convert JPG to PDF. Images JPG to PDF online | MyPDFBuilder',
    seoDescription: 'Convert JPG, PNG, and WebP images to PDF online for free. Combine multiple photos into a single A4 PDF in portrait or landscape directly in your browser.',
    h1: 'JPG to PDF Converter – Convert Images to PDF Online',
    heroSubtitle: 'Turn JPG, PNG, and WebP images into a clean, shareable PDF document in seconds. Adjust orientation and download free with zero uploads.',
    keywords: 'JPG to PDF, Image to PDF, Convert JPG to PDF Online Free',
  },
  'merge-pdf': {
    id: 'merge-pdf',
    slug: 'merge-pdf',
    name: 'Merge PDF',
    seoTitle: 'Merge PDF Files Online Free – Combine PDFs in Browser | MyPDFBuilder',
    seoDescription: 'Combine multiple PDF files into one document online for free. Reorder pages and merge PDFs securely in your browser with no file uploads.',
    h1: 'Merge PDF – Combine Multiple PDF Files Online',
    heroSubtitle: 'Join two or more PDF files in any order directly inside your browser. Fast, private, and 100% free.',
    keywords: 'Merge PDF, Combine PDF Files, Join PDF Online Free',
  },
  'split-pdf': {
    id: 'split-pdf',
    slug: 'split-pdf',
    name: 'Split PDF',
    seoTitle: 'Split PDF Online Free – Extract Pages from PDF | MyPDFBuilder',
    seoDescription: 'Split a PDF file or extract specific page ranges online for free. Fast, private browser-based PDF splitter at MyPDFBuilder.com.',
    h1: 'Split PDF – Extract Pages from Your PDF Online',
    heroSubtitle: 'Select exact page numbers or ranges (such as 1-3, 5) to extract a new PDF document locally in your browser.',
    keywords: 'Split PDF, Extract PDF Pages, Separate PDF Online',
  },
  'compress-pdf': {
    id: 'compress-pdf',
    slug: 'compress-pdf',
    name: 'Compress PDF',
    seoTitle: 'Compress PDF Online Free – Reduce PDF File Size | MyPDFBuilder',
    seoDescription: 'Optimize PDF object streams and reduce PDF file size online for free in your browser. No server uploads or quality watermarks.',
    h1: 'Compress PDF – Reduce PDF File Size Online',
    heroSubtitle: 'Optimize PDF structure and strip redundant metadata locally to shrink file size without uploading your documents.',
    keywords: 'Compress PDF, Reduce PDF Size, Optimize PDF Online',
  },
  'word-to-pdf': {
    id: 'word-to-pdf',
    slug: 'word-to-pdf',
    name: 'Word to PDF',
    seoTitle: 'Word to PDF Converter – Convert DOCX to PDF Online Free | MyPDFBuilder',
    seoDescription: 'Convert Microsoft Word (.docx) documents to PDF online for free directly in your browser. Fast, secure, and no registration required.',
    h1: 'Word to PDF Converter – Convert DOCX to PDF Online',
    heroSubtitle: 'Upload any .docx Word document to convert it into a clean PDF or customize its layout in our editor.',
    keywords: 'Word to PDF, DOCX to PDF, Convert Word to PDF Free',
  },
  'powerpoint-to-pdf': {
    id: 'powerpoint-to-pdf',
    slug: 'powerpoint-to-pdf',
    name: 'PowerPoint to PDF',
    seoTitle: 'PowerPoint to PDF – Convert PPTX Slides to PDF Online Free | MyPDFBuilder',
    seoDescription: 'Convert PowerPoint (.pptx) presentations into widescreen PDF documents online for free. Runs 100% locally in your browser.',
    h1: 'PowerPoint to PDF Converter – PPTX to PDF Online',
    heroSubtitle: 'Turn .pptx presentation slides into a clean 16:9 landscape PDF document directly in your browser.',
    keywords: 'PowerPoint to PDF, PPTX to PDF, Convert Slides to PDF',
  },
  'excel-to-pdf': {
    id: 'excel-to-pdf',
    slug: 'excel-to-pdf',
    name: 'Excel to PDF',
    seoTitle: 'Excel to PDF Converter – Convert XLSX & CSV to PDF Free | MyPDFBuilder',
    seoDescription: 'Convert Excel (.xlsx, .xls) and CSV spreadsheets into landscape PDF documents online for free in your browser.',
    h1: 'Excel to PDF Converter – Convert XLSX & CSV to PDF',
    heroSubtitle: 'Export Excel workbooks and CSV tables into clean landscape A4 PDF pages without uploading your data.',
    keywords: 'Excel to PDF, XLSX to PDF, CSV to PDF Online Free',
  },
  'html-to-pdf': {
    id: 'html-to-pdf',
    slug: 'html-to-pdf',
    name: 'HTML to PDF',
    seoTitle: 'HTML to PDF Converter – Convert HTML Code to PDF Free | MyPDFBuilder',
    seoDescription: 'Convert HTML markup into a clean, downloadable PDF document online for free. Safe browser-based parsing at MyPDFBuilder.com.',
    h1: 'HTML to PDF Converter – Convert HTML to PDF Online',
    heroSubtitle: 'Paste HTML markup to extract structured text and generate a clean A4 PDF document locally.',
    keywords: 'HTML to PDF, Convert HTML to PDF Online Free',
  },
  'pdf-to-jpg': {
    id: 'pdf-to-jpg',
    slug: 'pdf-to-jpg',
    name: 'PDF to JPG',
    seoTitle: 'PDF to JPG Converter – Convert PDF Pages to Images Free | MyPDFBuilder',
    seoDescription: 'Convert every page of a PDF file into high-quality JPG images online for free. Instant browser rendering with zero uploads.',
    h1: 'PDF to JPG Converter – Convert PDF Pages to Images',
    heroSubtitle: 'Render PDF pages into crisp JPG images and download each page directly in your browser.',
    keywords: 'PDF to JPG, Convert PDF to Image, PDF to JPEG Online',
  },
  'pdf-to-word': {
    id: 'pdf-to-word',
    slug: 'pdf-to-word',
    name: 'PDF to Word',
    seoTitle: 'PDF to Word Converter – Convert PDF to DOCX Online Free | MyPDFBuilder',
    seoDescription: 'Convert PDF documents to editable Microsoft Word (.docx) files online for free in your browser. No sign-up required.',
    h1: 'PDF to Word Converter – Convert PDF to DOCX Online',
    heroSubtitle: 'Extract text from your PDF and package it into a downloadable .docx Word document locally.',
    keywords: 'PDF to Word, PDF to DOCX, Convert PDF to Word Free',
  },
  'pdf-to-powerpoint': {
    id: 'pdf-to-powerpoint',
    slug: 'pdf-to-powerpoint',
    name: 'PDF to PowerPoint',
    seoTitle: 'PDF to PowerPoint – Convert PDF to PPTX Slides Online Free | MyPDFBuilder',
    seoDescription: 'Convert each PDF page into a full-slide image in a PowerPoint (.pptx) file online for free. Slide text and objects are not editable.',
    h1: 'PDF to PowerPoint Converter – Convert PDF to PPTX',
    heroSubtitle: 'Turn every PDF page into a slide inside a downloadable PowerPoint (.pptx) presentation locally.',
    keywords: 'PDF to PowerPoint, PDF to PPTX, Convert PDF to Slides',
  },
  'pdf-to-excel': {
    id: 'pdf-to-excel',
    slug: 'pdf-to-excel',
    name: 'PDF to Excel',
    seoTitle: 'PDF to Excel Converter – Convert PDF Tables to XLSX Free | MyPDFBuilder',
    seoDescription: 'Extract rows and columns from PDF documents into Excel (.xlsx) spreadsheets online for free in your browser.',
    h1: 'PDF to Excel Converter – Extract PDF Data to XLSX',
    heroSubtitle: 'Convert positioned text and tables from PDF pages into an Excel (.xlsx) workbook locally.',
    keywords: 'PDF to Excel, PDF to XLSX, Extract PDF Table to Excel',
  },
  'pdf-to-text': {
    id: 'pdf-to-text',
    slug: 'pdf-to-text',
    name: 'PDF to Text',
    seoTitle: 'PDF to Text – Extract Text from PDF Online Free | MyPDFBuilder',
    seoDescription: 'Extract selectable text from any PDF file online for free. Copy text, download .txt, or edit as a new PDF in your browser.',
    h1: 'PDF Text Extractor – Convert PDF to Plain Text',
    heroSubtitle: 'Extract text from multi-page PDF documents locally and save as .txt or open in our PDF editor.',
    keywords: 'PDF to Text, PDF Text Extractor, Extract Text from PDF',
  },
  'edit-pdf': {
    id: 'edit-pdf',
    slug: 'edit-pdf',
    name: 'Edit PDF',
    seoTitle: 'Edit PDF Online Free – Add Text, Watermark & Rotate Pages | MyPDFBuilder',
    seoDescription: 'Edit PDF files online for free in your browser. Add text annotations and watermarks or rotate pages with zero server uploads.',
    h1: 'Free Online PDF Editor – Edit PDF Files in Browser',
    heroSubtitle: 'Add custom text or watermarks and rotate pages in a PDF directly inside your browser with zero uploads.',
    keywords: 'PDF Editor, Edit PDF Online Free, Add Text to PDF, Rotate PDF',
  },
  'pdf-to-pdfa': {
    id: 'pdf-to-pdfa',
    slug: 'pdf-to-pdfa',
    name: 'PDF Archive Metadata',
    seoTitle: 'PDF Metadata Editor – Update PDF Properties Online | MyPDFBuilder',
    seoDescription: 'Update metadata fields in a PDF copy in your browser. This tool does not convert or validate PDF/A compliance.',
    h1: 'Update PDF Archive Metadata in Your Browser',
    heroSubtitle: 'Save a copy with updated archive metadata fields. The output is not certified or validated as PDF/A.',
    keywords: 'PDF Metadata Editor, Edit PDF Properties, Archive Metadata',
  },
};

export function getToolFromPathname(pathname: string): ActivePlatformTool {
  const clean = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  const match = Object.values(TOOLS_SEO).find((t) => t.slug === clean);
  return match ? match.id : 'text-to-pdf';
}
