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
}

export interface CategoryInfo {
  id: ToolCategory;
  name: string;
  icon: string;
  color: string;
}
