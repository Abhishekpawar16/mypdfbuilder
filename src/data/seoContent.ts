export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How do I convert text to PDF for free?',
    answer:
      'Type or paste your text into the editor above, or upload a .txt file. Adjust any formatting options such as font family, font size, page size, margins, or headers, review the live preview, and click "Generate & Download PDF". The conversion runs instantly in your browser at zero cost.',
  },
  {
    question: 'Can I convert a TXT file into PDF?',
    answer:
      'Yes. Click "Upload TXT" or drag and drop any plain text (.txt) file up to 5 MB directly onto the editor. The contents load automatically so you can format and export them as a polished PDF.',
  },
  {
    question: 'Can I create a PDF without installing software?',
    answer:
      'Yes. Everything works directly inside modern web browsers on Windows, macOS, Linux, ChromeOS, iOS, and Android. You do not need desktop software, browser extensions, or plugins.',
  },
  {
    question: 'Is this PDF generator free?',
    answer:
      'Yes, TextToPDF is 100% free to use with no account registration, no watermarks, and no artificial limits on how many documents you create.',
  },
  {
    question: 'Can I convert large text files?',
    answer:
      'Yes. Our client-side pagination engine handles long essays, reports, logs, and TXT files up to 5 MB, automatically wrapping lines and inserting clean page breaks across as many pages as needed.',
  },
  {
    question: 'Can I customize PDF page size?',
    answer:
      'Yes. You can select A4, A3, US Letter, or Legal paper sizes, switch between Portrait and Landscape orientation, and choose Normal, Narrow, or Wide margins.',
  },
  {
    question: 'Does the tool support multiple pages?',
    answer:
      'Yes. Whenever your text exceeds a single page, the generator automatically creates additional pages and updates the live page counter, optional headers/footers, and page numbering.',
  },
  {
    question: 'Can I use this tool on my mobile phone?',
    answer:
      'Yes. The responsive layout adapts cleanly to smartphones and tablets so you can write, preview, download, or print PDFs from anywhere.',
  },
  {
    question: 'Is my text uploaded to a server?',
    answer:
      'No. All text parsing, pagination, and PDF creation happen locally inside your browser using client-side JavaScript. Your text is never transmitted to or stored on our servers.',
  },
  {
    question: 'Can I download and print my generated PDF?',
    answer:
      'Yes. Click "Generate & Download PDF" to save the file immediately, or click "Print Document" to open your browser print dialog with your formatted pages.',
  },
];

export const SAMPLE_DOCUMENT_TEXT = `Quarterly Project Status Summary

1. Overview
This document demonstrates how plain text converts into a clean, multi-paragraph PDF directly in your browser. You can customize the font family, font size, margins, line spacing, alignment, headers, footers, and page numbering using the controls on the right.

2. Key Highlights
- Client-side processing: Your text never leaves your device.
- Multi-page pagination: Long notes and reports flow naturally across pages without cut-off lines.
- Flexible paper formats: Switch between A4, A3, Letter, and Legal in Portrait or Landscape orientation.

3. Next Steps
Edit this sample text, paste your own notes, or drag and drop a .txt file to generate your PDF in seconds.`;
