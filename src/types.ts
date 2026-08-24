export type ToolCategory =
  | 'all'
  | 'image'
  | 'pdf'
  | 'file'
  | 'text'
  | 'developer'
  | 'qr'
  | 'utilities'
  | 'more';

export interface HowToStep {
  step: number;
  title: string;
  desc: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  route: string;
  icon: string;
  popular?: boolean;
  implemented: boolean;
  description: string;
  keywords: string[];
  colorAccent?: string;
  isLocalOnly?: boolean;

  // SEO & GEO metadata
  seoTitle?: string;
  seoDescription?: string;
  h1?: string;
  supportedFormats?: string[];
  outputFormats?: string[];
  howToUse?: HowToStep[];
  faq?: FaqItem[];
  privacyInfo?: string;
  relatedToolIds?: string[];
  applicationCategory?: string;
  operatingSystem?: string;
}

export interface CategoryInfo {
  id: ToolCategory;
  name: string;
  icon: string;
  color: string;
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
}
