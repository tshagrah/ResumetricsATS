export type ResumeTheme = 'ats-pure' | 'professional' | 'modern' | 'creative';

export interface ResumeThemeDefinition {
  id: ResumeTheme;
  name: string;
  description: string;
  layout: 'single-column' | 'two-column-grid';
  headerStyle: 'monochrome' | 'accent-line' | 'full-banner' | 'split-background';
  bulletStyle: 'disc' | 'circle-accent';
  fontStyle: 'sans' | 'serif-headers';
}

export const RESUME_THEMES: Record<ResumeTheme, ResumeThemeDefinition> = {
  'ats-pure': {
    id: 'ats-pure',
    name: 'Pure ATS Mode',
    description: 'Strictly formatted single-column monochrome design optimized for ATS crawlers.',
    layout: 'single-column',
    headerStyle: 'monochrome',
    bulletStyle: 'disc',
    fontStyle: 'sans',
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Executive corporate design with highlight accent underline and side contact metadata.',
    layout: 'single-column',
    headerStyle: 'accent-line',
    bulletStyle: 'disc',
    fontStyle: 'sans',
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Full-width solid color header banner with profile photo integration and single-column flow.',
    layout: 'single-column',
    headerStyle: 'full-banner',
    bulletStyle: 'disc',
    fontStyle: 'sans',
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    description: 'Two-column grid layout with split-background header, bold serif headers, and geometric circle bullet accents.',
    layout: 'two-column-grid',
    headerStyle: 'split-background',
    bulletStyle: 'circle-accent',
    fontStyle: 'serif-headers',
  },
};

export interface ContactInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  githubUrl?: string;
  photoUrl?: string;
  showPhoto?: boolean;
  photoShape?: 'circle' | 'rounded' | 'square';
}

export interface WorkExperience {
  id: string;
  role: string;
  company: string;
  companyUrl?: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
  pageBreakBefore?: boolean; // Force item to start on a new paper page
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  location: string;
  graduationYear: string;
  gpa?: string;
  honors?: string;
  pageBreakBefore?: boolean;
}

export interface SkillCategory {
  id: string;
  category: string;
  items: string[];
  pageBreakBefore?: boolean;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  pageBreakBefore?: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
  pageBreakBefore?: boolean;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
  link?: string;
  pageBreakBefore?: boolean;
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
  pageBreakBefore?: boolean;
}

export interface DocumentMargins {
  top: number; // in inches (e.g. 0.65)
  right: number;
  bottom: number;
  left: number;
}

export const DEFAULT_DOCUMENT_MARGINS: DocumentMargins = {
  top: 0.65,
  right: 0.65,
  bottom: 0.65,
  left: 0.65,
};

export const MARGIN_PRESETS = [
  { id: 'standard', name: 'Standard (0.65")', margins: { top: 0.65, right: 0.65, bottom: 0.65, left: 0.65 } },
  { id: 'compact', name: 'Compact (0.50")', margins: { top: 0.50, right: 0.50, bottom: 0.50, left: 0.50 } },
  { id: 'spacious', name: 'Spacious (0.80")', margins: { top: 0.80, right: 0.80, bottom: 0.80, left: 0.80 } },
];

export interface ResumeData {
  id: string;
  title: string;
  language: string; // e.g., 'en', 'es', 'fr', 'de', 'id', 'ja', 'zh'
  theme: ResumeTheme;
  accentColor?: string; // Custom highlight/accent color (e.g. #2563EB)
  margins?: DocumentMargins; // Page margins in inches (top, right, bottom, left)
  targetRole?: string;
  contact: ContactInfo;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: SkillCategory[];
  projects: ProjectItem[];
  certifications: Certification[];
  customSections?: CustomSection[];
  lastSavedAt: number;
  atsScore?: number;
}

export interface AccentColorPreset {
  name: string;
  hex: string;
}

export const ACCENT_COLOR_PRESETS: AccentColorPreset[] = [
  { name: 'Classic Slate', hex: '#1E293B' },
  { name: 'Royal Indigo', hex: '#2563EB' },
  { name: 'Emerald Forest', hex: '#059669' },
  { name: 'Deep Amethyst', hex: '#7C3AED' },
  { name: 'Crimson Ruby', hex: '#DC2626' },
  { name: 'Teal Pacific', hex: '#0D9488' },
  { name: 'Warm Amber', hex: '#D97706' },
  { name: 'Midnight Charcoal', hex: '#111827' },
];

export interface ATSAnalysisResult {
  score: number; // 0 - 100
  matchPercentage: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  summaryFeedback: string;
  formattingChecks: {
    rule: string;
    passed: boolean;
    detail: string;
  }[];
  tailoredSuggestions: {
    section: 'summary' | 'experience' | 'skills';
    title: string;
    recommendation: string;
    sampleAddition?: string;
  }[];
}

export interface GrammarPolishResult {
  overallAssessment: string;
  readabilityLevel: string;
  actionVerbScore: string;
  suggestions: {
    id: string;
    original: string;
    suggested: string;
    reason: string;
    type: 'grammar' | 'action-verb' | 'impact-metric' | 'brevity';
  }[];
}

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English (US)', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '中文 (简体)', flag: '🇨🇳' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
];
