export type FontFamilyOption = 'Arial' | 'Times New Roman' | 'Helvetica' | 'Courier';
export type PageSizeOption = 'A4' | 'A3' | 'Letter' | 'Legal';
export type OrientationOption = 'portrait' | 'landscape';
export type MarginOption = 'normal' | 'narrow' | 'wide';
export type AlignmentOption = 'left' | 'center' | 'right' | 'justify';
export type PageNumberOption = 'none' | 'page-of' | 'slash';

export interface PdfSettings {
  title: string;
  fontFamily: FontFamilyOption;
  fontSize: number;
  fontColor: string;
  pageSize: PageSizeOption;
  orientation: OrientationOption;
  margins: MarginOption;
  lineSpacing: number;
  alignment: AlignmentOption;
  headerText: string;
  footerText: string;
  pageNumbering: PageNumberOption;
  includeDate: boolean;
  backgroundColor: string;
  isBold: boolean;
  isItalic: boolean;
}

export const DEFAULT_PDF_SETTINGS: PdfSettings = {
  title: 'Untitled Document',
  fontFamily: 'Helvetica',
  fontSize: 12,
  fontColor: '#1E293B',
  pageSize: 'A4',
  orientation: 'portrait',
  margins: 'normal',
  lineSpacing: 1.5,
  alignment: 'left',
  headerText: '',
  footerText: '',
  pageNumbering: 'page-of',
  includeDate: false,
  backgroundColor: '#FFFFFF',
  isBold: false,
  isItalic: false,
};

export interface PageDimensions {
  widthMm: number;
  heightMm: number;
  marginMm: number;
}
