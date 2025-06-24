
export type FormattingAction = 
  | 'bold' 
  | 'italic' 
  | 'strikethrough'
  | 'link' 
  | 'code' 
  | 'code-block' 
  | 'ul' 
  | 'ol' 
  | 'quote'
  | 'h1' | 'h2' | 'h3' | 'h4';

export type AiAssistAction = 
  | 'summarize'
  | 'elaborate'
  | 'tone-professional'
  | 'tone-friendly'
  | 'tone-concise';

export type ViewMode = 'split' | 'editor' | 'preview';

// export type Theme = 'light' | 'dark'; // Removed

export type PreviewThemeIdentifier = 'github-light' | 'academic';

export interface PreviewTheme {
  id: PreviewThemeIdentifier;
  name: string;
  css: string;
}

declare global {
  interface Window {
    html2pdf: any; 
  }
}