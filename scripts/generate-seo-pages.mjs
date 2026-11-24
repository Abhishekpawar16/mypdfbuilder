import fs from 'fs';
import path from 'path';

const TOOLS = [
  { slug: 'text-to-pdf', name: 'Text to PDF', title: 'Text to PDF Converter – Convert Plain Text & TXT to PDF Free | MyPDFBuilder', desc: 'Convert plain text or TXT files to PDF online for free. Customize fonts, margins, page size, headers, and download your PDF instantly at MyPDFBuilder.com.' },
  { slug: 'jpg-to-pdf', name: 'JPG to PDF', title: 'Convert JPG to PDF. Images JPG to PDF online | MyPDFBuilder', desc: 'Convert JPG, PNG, and WebP images to PDF online for free. Combine multiple photos into a single A4 PDF in portrait or landscape directly in your browser.' },
  { slug: 'merge-pdf', name: 'Merge PDF', title: 'Merge PDF Files Online Free – Combine PDFs in Browser | MyPDFBuilder', desc: 'Combine multiple PDF files into one document online for free. Reorder pages and merge PDFs securely in your browser with no file uploads.' },
  { slug: 'split-pdf', name: 'Split PDF', title: 'Split PDF Online Free – Extract Pages from PDF | MyPDFBuilder', desc: 'Split a PDF file or extract specific page ranges online for free. Fast, private browser-based PDF splitter at MyPDFBuilder.com.' },
  { slug: 'compress-pdf', name: 'Compress PDF', title: 'Compress PDF Online Free – Reduce PDF File Size | MyPDFBuilder', desc: 'Optimize PDF object streams and reduce PDF file size online for free in your browser. No server uploads or quality watermarks.' },
  { slug: 'word-to-pdf', name: 'Word to PDF', title: 'Word to PDF Converter – Convert DOCX to PDF Online Free | MyPDFBuilder', desc: 'Convert Microsoft Word (.docx) documents to PDF online for free directly in your browser. Fast, secure, and no registration required.' },
  { slug: 'powerpoint-to-pdf', name: 'PowerPoint to PDF', title: 'PowerPoint to PDF – Convert PPTX Slides to PDF Online Free | MyPDFBuilder', desc: 'Convert PowerPoint (.pptx) presentations into widescreen PDF documents online for free. Runs 100% locally in your browser.' },
  { slug: 'excel-to-pdf', name: 'Excel to PDF', title: 'Excel to PDF Converter – Convert XLSX & CSV to PDF Free | MyPDFBuilder', desc: 'Convert Excel (.xlsx, .xls) and CSV spreadsheets into landscape PDF documents online for free in your browser.' },
  { slug: 'html-to-pdf', name: 'HTML to PDF', title: 'HTML to PDF Converter – Convert HTML Code to PDF Free | MyPDFBuilder', desc: 'Convert HTML markup into a clean, downloadable PDF document online for free. Safe browser-based parsing at MyPDFBuilder.com.' },
  { slug: 'pdf-to-jpg', name: 'PDF to JPG', title: 'PDF to JPG Converter – Convert PDF Pages to Images Free | MyPDFBuilder', desc: 'Convert every page of a PDF file into high-quality JPG images online for free. Instant browser rendering with zero uploads.' },
  { slug: 'pdf-to-word', name: 'PDF to Word', title: 'PDF to Word Converter – Convert PDF to DOCX Online Free | MyPDFBuilder', desc: 'Convert PDF documents to editable Microsoft Word (.docx) files online for free in your browser. No sign-up required.' },
  { slug: 'pdf-to-powerpoint', name: 'PDF to PowerPoint', title: 'PDF to PowerPoint – Convert PDF to PPTX Slides Online Free | MyPDFBuilder', desc: 'Convert each PDF page into a full-slide image in a PowerPoint (.pptx) file online for free. Slide text and objects are not editable.' },
  { slug: 'pdf-to-excel', name: 'PDF to Excel', title: 'PDF to Excel Converter – Convert PDF Tables to XLSX Free | MyPDFBuilder', desc: 'Extract rows and columns from PDF documents into Excel (.xlsx) spreadsheets online for free in your browser.' },
  { slug: 'pdf-to-text', name: 'PDF to Text', title: 'PDF to Text – Extract Text from PDF Online Free | MyPDFBuilder', desc: 'Extract selectable text from any PDF file online for free. Copy text, download .txt, or edit as a new PDF in your browser.' },
  { slug: 'edit-pdf', name: 'PDF Editor', title: 'Edit PDF Online Free – Add Text, Watermark & Rotate Pages | MyPDFBuilder', desc: 'Edit PDF files online for free in your browser. Add text annotations and watermarks or rotate pages with zero server uploads.' },
  { slug: 'pdf-to-pdfa', name: 'PDF Archive Metadata', title: 'PDF Metadata Editor – Update PDF Properties Online | MyPDFBuilder', desc: 'Update metadata fields in a PDF copy in your browser. This tool does not convert or validate PDF/A compliance.' },
];

const distDir = path.resolve('dist');
const baseHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');

for (const tool of TOOLS) {
  const url = `https://mypdfbuilder.com/${tool.slug}`;
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: `${tool.name} – MyPDFBuilder`,
        url,
        description: tool.desc,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'MyPDFBuilder', item: 'https://mypdfbuilder.com/' },
          { '@type': 'ListItem', position: 2, name: tool.name, item: url },
        ],
      },
    ],
  });

  let pageHtml = baseHtml
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${tool.title}</title>`)
    .replace(/<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${tool.desc}" />`)
    .replace(/<link\s+rel="canonical"[\s\S]*?\/>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta\s+property="og:url"[\s\S]*?\/>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta\s+property="og:title"[\s\S]*?\/>/, `<meta property="og:title" content="${tool.title}" />`)
    .replace(/<meta\s+property="og:description"[\s\S]*?\/>/, `<meta property="og:description" content="${tool.desc}" />`)
    .replace(/<meta\s+name="twitter:url"[\s\S]*?\/>/, `<meta name="twitter:url" content="${url}" />`)
    .replace(/<meta\s+name="twitter:title"[\s\S]*?\/>/, `<meta name="twitter:title" content="${tool.title}" />`)
    .replace(/<meta\s+name="twitter:description"[\s\S]*?\/>/, `<meta name="twitter:description" content="${tool.desc}" />`)
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${jsonLd}</script>`);

  const outDir = path.join(distDir, tool.slug);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), pageHtml, 'utf-8');
}

console.log(`Generated ${TOOLS.length} dedicated SEO tool pages in dist/<slug>/index.html`);
