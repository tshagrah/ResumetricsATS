import React, { useState } from 'react';
import {
  FileCode,
  Globe,
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ShieldCheck,
  Check,
  Sparkles,
  Loader2,
  Palette,
  Edit3,
} from 'lucide-react';
import type { ResumeData, ResumeTheme } from '../../types/resume';
import { SUPPORTED_LANGUAGES, ACCENT_COLOR_PRESETS } from '../../types/resume';
import { exportResumeToDocx } from '../../utils/docxExport';
import confetti from 'canvas-confetti';

interface PreviewToolbarProps {
  resume: ResumeData;
  onThemeChange: (theme: ResumeTheme) => void;
  onLanguageChange: (langCode: string) => void;
  onAccentColorChange: (colorHex: string) => void;
  isLiveEditMode: boolean;
  onToggleLiveEditMode: () => void;
  isTranslating: boolean;
  isAnalyzingATS?: boolean;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  onOpenATSAnalyzer: () => void;
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
  resume,
  onThemeChange,
  onLanguageChange,
  onAccentColorChange,
  isLiveEditMode,
  onToggleLiveEditMode,
  isTranslating,
  isAnalyzingATS = false,
  zoom,
  setZoom,
  onOpenATSAnalyzer,
}) => {
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const activeAccent = resume.accentColor || '#2563EB';

  const isBusy = isTranslating || isExportingDocx || isExportingPdf || isAnalyzingATS;

  const getActiveTaskLabel = () => {
    if (isTranslating) return 'Translating CV with Gemini AI...';
    if (isExportingDocx) return 'Generating Word (.docx)...';
    if (isExportingPdf) return 'Preparing vector ATS PDF...';
    if (isAnalyzingATS) return 'AI scanning keywords & scoring...';
    return null;
  };

  const activeTaskLabel = getActiveTaskLabel();

  const handlePrintPdf = () => {
    try {
      setIsExportingPdf(true);
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
        window.print();
        setIsExportingPdf(false);
      }, 350);
    } catch (err) {
      console.error('Error opening print dialog:', err);
      setIsExportingPdf(false);
    }
  };

  const handleDownloadDocx = async () => {
    try {
      setIsExportingDocx(true);
      await exportResumeToDocx(resume);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
      });
    } catch (err) {
      console.error('Error generating DOCX:', err);
    } finally {
      setIsExportingDocx(false);
    }
  };

  return (
    <div className="relative bg-slate-900 border-b border-slate-800 px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-slate-200 no-print transition-all">
      {/* Subtle Hairline Indeterminate Progress Bar across bottom of Toolbar */}
      {isBusy && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800 overflow-hidden z-20">
          <div className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-500 w-1/2 animate-progress-indeterminate rounded-full shadow-xs shadow-indigo-500/50" />
        </div>
      )}

      {/* Group 1: Themes & Live Canvas Edit */}
      <div className="flex items-center flex-wrap gap-2">
        <button
          onClick={() => onThemeChange('ats-pure')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            resume.theme === 'ats-pure'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/40 ring-1 ring-emerald-400'
              : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
          }`}
          title="Strict single-column layout guaranteed to parse 100% cleanly in ATS systems"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
          <span className="hidden sm:inline">Pure ATS Mode</span>
          <span className="sm:hidden">ATS</span>
          {resume.theme === 'ats-pure' && <Check className="w-3 h-3 ml-0.5" />}
        </button>

        <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 text-xs">
          <button
            onClick={() => onThemeChange('professional')}
            className={`px-2 py-1 rounded-md font-medium transition-colors ${
              resume.theme === 'professional' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Professional
          </button>
          <button
            onClick={() => onThemeChange('modern')}
            className={`px-2 py-1 rounded-md font-medium transition-colors ${
              resume.theme === 'modern' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Modern
          </button>
          <button
            onClick={() => onThemeChange('creative')}
            className={`px-2 py-1 rounded-md font-medium transition-colors ${
              resume.theme === 'creative' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Creative
          </button>
        </div>

        {/* Live In-Canvas Edit Toggle */}
        <button
          onClick={onToggleLiveEditMode}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isLiveEditMode
              ? 'bg-indigo-600 text-white ring-1 ring-indigo-400 shadow-sm shadow-indigo-900/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title="Toggle inline editing directly on the document canvas to fix translations or wording live"
        >
          <Edit3 className="w-3.5 h-3.5 text-indigo-300" />
          <span className="hidden sm:inline">Live Canvas Edit</span>
          <span className="sm:hidden">Live</span>
          <span className={`text-[10px] px-1 py-0.2 rounded font-bold uppercase ${isLiveEditMode ? 'bg-indigo-700 text-indigo-200' : 'bg-slate-700 text-slate-400'}`}>
            {isLiveEditMode ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Center: Subtle Global Async Progress Indicator Badge */}
      {isBusy && activeTaskLabel && (
        <div
          className="flex items-center gap-2 px-3 py-1 bg-indigo-950/80 border border-indigo-700/60 text-indigo-200 text-xs rounded-full shadow-sm shadow-indigo-950/50 animate-in fade-in zoom-in-95 duration-150 shrink-0"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400 shrink-0" />
          <span className="font-medium text-[11px] tracking-tight whitespace-nowrap">{activeTaskLabel}</span>
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
        </div>
      )}

      {/* Group 2: Accent Highlight Color Picker, Language Switcher & ATS Matcher */}
      <div className="flex items-center flex-wrap gap-2">
        {/* Highlight Color Picker */}
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-lg text-slate-200 font-medium transition-colors"
            title="Choose highlight accent color"
          >
            <span
              className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
              style={{ backgroundColor: activeAccent }}
            />
            <span className="hidden sm:inline">Highlight Color</span>
            <Palette className="w-3 h-3 text-slate-400" />
          </button>

          {showColorPicker && (
            <div
              className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 p-3 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 w-52 space-y-2.5 animate-in fade-in duration-150"
              onMouseLeave={() => setShowColorPicker(false)}
            >
              <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block">
                Highlight Palette
              </span>
              <div className="grid grid-cols-4 gap-2">
                {ACCENT_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.hex}
                    onClick={() => {
                      onAccentColorChange(preset.hex);
                      setShowColorPicker(false);
                    }}
                    title={preset.name}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-transform hover:scale-110 border ${
                      activeAccent === preset.hex ? 'ring-2 ring-white border-transparent' : 'border-white/10'
                    }`}
                    style={{ backgroundColor: preset.hex }}
                  >
                    {activeAccent === preset.hex && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Custom Hex</span>
                <input
                  type="color"
                  value={activeAccent}
                  onChange={(e) => onAccentColorChange(e.target.value)}
                  className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Language Selector with Loading Indicator */}
        <div className="relative flex items-center">
          <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          <select
            value={resume.language || 'en'}
            disabled={isTranslating}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="pl-8 pr-7 py-1 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-200 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer disabled:opacity-60 transition-opacity"
            title="Translate entire resume with Gemini AI"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
          {isTranslating && (
            <Loader2 className="w-3 h-3 text-indigo-400 animate-spin absolute right-2 pointer-events-none" />
          )}
        </div>

        {/* ATS Score Trigger with Loading Indicator */}
        <button
          onClick={onOpenATSAnalyzer}
          disabled={isAnalyzingATS}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-700/60 text-indigo-300 transition-colors disabled:opacity-60"
        >
          {isAnalyzingATS ? (
            <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3 text-indigo-400" />
          )}
          <span className="hidden sm:inline">ATS Matcher</span>
          {typeof resume.atsScore === 'number' && resume.atsScore > 0 && (
            <span className="ml-0.5 px-1.5 py-0.2 bg-indigo-600 text-white text-[10px] rounded font-bold tabular-nums">
              {resume.atsScore}%
            </span>
          )}
        </button>
      </div>

      {/* Group 3: Zoom & Export Buttons (PDF & DOCX) with Loading Spinners */}
      <div className="flex items-center gap-2">
        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-800 px-1 py-0.5 rounded-lg border border-slate-700 text-xs">
          <button
            onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
            className="p-1 hover:text-white text-slate-400"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="w-9 text-center tabular-nums text-[11px] text-slate-300">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(2))))}
            className="p-1 hover:text-white text-slate-400"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1 hover:text-white text-slate-400 hidden sm:block"
            title="Reset Zoom"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>

        {/* DOCX Download with Spinner */}
        <button
          onClick={handleDownloadDocx}
          disabled={isExportingDocx || isBusy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors disabled:opacity-50"
          title="Download editable Microsoft Word document (.docx)"
        >
          {isExportingDocx ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
          ) : (
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
          )}
          <span className="hidden sm:inline">
            {isExportingDocx ? 'Exporting...' : 'DOCX'}
          </span>
        </button>

        {/* PDF Download / Print with Spinner */}
        <button
          onClick={handlePrintPdf}
          disabled={isExportingPdf || isBusy}
          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 transition-colors disabled:opacity-60"
          title="Download vector ATS-formatted PDF document"
        >
          {isExportingPdf ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Printer className="w-3.5 h-3.5" />
          )}
          <span>{isExportingPdf ? 'Exporting...' : 'PDF'}</span>
        </button>
      </div>
    </div>
  );
};
