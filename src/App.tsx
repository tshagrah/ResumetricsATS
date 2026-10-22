/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ResumeEditor } from './components/ResumeEditor/ResumeEditor';
import { ResumeDocument } from './components/ResumePreview/ResumeDocument';
import { PreviewToolbar } from './components/ResumePreview/PreviewToolbar';
import { ATSAnalyzerDrawer } from './components/ATSAnalyzerDrawer';
import { GrammarCheckerModal } from './components/GrammarCheckerModal';
import { ImportModal } from './components/ImportModal';
import { AuthModal } from './components/AuthModal';
import type { ResumeData, ResumeTheme, DocumentMargins } from './types/resume';
import {
  loadAllResumes,
  saveSingleResume,
  deleteResume,
  duplicateResume,
  createBlankResume,
  getActiveResumeId,
  setActiveResumeId,
  getSavedUserSession,
  saveUserSession,
  UserSession,
} from './services/storage';
import { Layout, Eye, Edit3, ShieldAlert, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'editor'>('dashboard');
  const [resumes, setResumes] = useState<ResumeData[]>(() => loadAllResumes());
  const [activeResumeId, setActiveResumeIdState] = useState<string>(() => getActiveResumeId());
  const [user, setUser] = useState<UserSession | null>(() => getSavedUserSession());

  // Modals & Panels
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isATSAnalyzerOpen, setIsATSAnalyzerOpen] = useState(false);
  const [grammarModalState, setGrammarModalState] = useState<{
    isOpen: boolean;
    text: string;
    contextTitle: string;
    onApply: (improved: string) => void;
  }>({
    isOpen: false,
    text: '',
    contextTitle: '',
    onApply: () => {},
  });

  // Editor / Preview Controls
  const [zoom, setZoom] = useState(1);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isAnalyzingATS, setIsAnalyzingATS] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('preview');
  const [isLiveEditMode, setIsLiveEditMode] = useState(false);
  const [showMarginGuides, setShowMarginGuides] = useState(false);

  // Responsive device scaling: dynamically fit document preview to screen width on mobile/tablet
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        const autoScale = Math.max(0.42, Math.min(0.85, (window.innerWidth - 24) / 816));
        setZoom(Number(autoScale.toFixed(2)));
      } else if (window.innerWidth < 1024) {
        const autoScale = Math.max(0.6, Math.min(0.92, (window.innerWidth - 48) / 816));
        setZoom(Number(autoScale.toFixed(2)));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Find active resume
  const activeResume =
    resumes.find((r) => r.id === activeResumeId) || resumes[0];

  const handleAccentColorChange = (hex: string) => {
    if (!activeResume) return;
    handleUpdateActiveResume({ ...activeResume, accentColor: hex });
  };

  const handleMarginsChange = (margins: DocumentMargins) => {
    if (!activeResume) return;
    handleUpdateActiveResume({ ...activeResume, margins });
  };

  const handleSelectResume = (id: string) => {
    setActiveResumeId(id);
    setActiveResumeIdState(id);
    setActiveView('editor');
  };

  const handleCreateNew = () => {
    const { updatedList, newResume } = createBlankResume('My New ATS Resume');
    setResumes(updatedList);
    setActiveResumeIdState(newResume.id);
    setActiveView('editor');
  };

  const handleDuplicate = (id: string) => {
    const { updatedList, newResume } = duplicateResume(id);
    setResumes(updatedList);
    setActiveResumeIdState(newResume.id);
  };

  const handleDelete = (id: string) => {
    const updated = deleteResume(id);
    setResumes(updated);
    if (activeResumeId === id && updated.length > 0) {
      setActiveResumeIdState(updated[0].id);
    }
  };

  const handleRename = (id: string, newTitle: string) => {
    const target = resumes.find((r) => r.id === id);
    if (!target) return;
    const updated = saveSingleResume({ ...target, title: newTitle });
    setResumes(updated);
  };

  const handleUpdateActiveResume = (updated: ResumeData) => {
    const all = saveSingleResume(updated);
    setResumes(all);
  };

  const handleThemeChange = (theme: ResumeTheme) => {
    if (!activeResume) return;
    handleUpdateActiveResume({ ...activeResume, theme });
  };

  const handleLanguageChange = async (targetLangCode: string) => {
    if (!activeResume || activeResume.language === targetLangCode) return;
    try {
      setIsTranslating(true);
      const res = await fetch('/api/resume/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: activeResume,
          targetLanguage: targetLangCode,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        handleUpdateActiveResume(data.data);
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleImportComplete = (newResume: ResumeData) => {
    const updated = saveSingleResume(newResume);
    setResumes(updated);
    setActiveResumeIdState(newResume.id);
    setActiveView('editor');
  };

  const handleSignInSuccess = (session: UserSession) => {
    setUser(session);
    saveUserSession(session);
    // Mark resumes as cloud saved
    const updated = resumes.map((r) => ({ ...r, lastSavedAt: Date.now() }));
    setResumes(updated);
  };

  const handleSignOut = () => {
    setUser(null);
    saveUserSession(null);
  };

  const openGrammarPolish = (
    text: string,
    contextTitle: string,
    onApply: (improved: string) => void
  ) => {
    setGrammarModalState({
      isOpen: true,
      text,
      contextTitle,
      onApply,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navbar (Top Bar Contract) */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onQuickImport={() => setIsImportModalOpen(true)}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeView === 'dashboard' ? (
          <DashboardView
            resumes={resumes}
            activeResumeId={activeResumeId}
            onSelectResume={handleSelectResume}
            onCreateNew={handleCreateNew}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onRename={handleRename}
          />
        ) : (
          <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
            {/* Preview & Mode Control Toolbar */}
            {activeResume && (
              <PreviewToolbar
                resume={activeResume}
                onThemeChange={handleThemeChange}
                onLanguageChange={handleLanguageChange}
                onAccentColorChange={handleAccentColorChange}
                onMarginsChange={handleMarginsChange}
                showMarginGuides={showMarginGuides}
                onToggleMarginGuides={() => setShowMarginGuides(!showMarginGuides)}
                isLiveEditMode={isLiveEditMode}
                onToggleLiveEditMode={() => setIsLiveEditMode(!isLiveEditMode)}
                isTranslating={isTranslating}
                isAnalyzingATS={isAnalyzingATS}
                zoom={zoom}
                setZoom={setZoom}
                onOpenATSAnalyzer={() => setIsATSAnalyzerOpen(true)}
              />
            )}

            {/* Mobile Tab Switcher (Visible only on small viewports) */}
            <div className="lg:hidden flex border-b border-slate-800 bg-slate-900 no-print">
              <button
                onClick={() => setMobileTab('editor')}
                className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                  mobileTab === 'editor'
                    ? 'border-indigo-500 text-white bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editor Form</span>
              </button>
              <button
                onClick={() => setMobileTab('preview')}
                className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                  mobileTab === 'preview'
                    ? 'border-indigo-500 text-white bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live ATS Preview</span>
              </button>
            </div>

            {/* Split Screen Workspace (Desktop) / Tabbed (Mobile) */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Left Column: Form Editor */}
              <div
                className={`w-full lg:w-[480px] xl:w-[540px] border-r border-slate-800/80 bg-slate-950 overflow-y-auto p-4 sm:p-5 no-print ${
                  mobileTab === 'editor' ? 'block' : 'hidden lg:block'
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-tight">
                      {activeResume?.title || 'Resume Details'}
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Changes auto-save instantly to your secure storage
                    </p>
                  </div>
                  <button
                    onClick={() => setIsATSAnalyzerOpen(true)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 shadow-sm shadow-indigo-600/30"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Match Job</span>
                  </button>
                </div>

                {activeResume && (
                  <ResumeEditor
                    resume={activeResume}
                    onChange={handleUpdateActiveResume}
                    onOpenGrammarPolish={openGrammarPolish}
                  />
                )}
              </div>

              {/* Right Column: Interactive Live Document Preview */}
              <div
                className={`flex-1 bg-slate-950 overflow-auto p-4 sm:p-8 flex justify-center items-start ${
                  mobileTab === 'preview' ? 'block' : 'hidden lg:block'
                }`}
              >
                {activeResume && (
                  <div className="w-full max-w-4xl flex flex-col items-center">
                    <ResumeDocument
                      resume={activeResume}
                      zoom={zoom}
                      isLiveEditMode={isLiveEditMode}
                      onUpdateResume={handleUpdateActiveResume}
                      showMarginGuides={showMarginGuides}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Slide-out ATS Job Matcher & Optimizer Drawer */}
      {activeResume && (
        <ATSAnalyzerDrawer
          isOpen={isATSAnalyzerOpen}
          onClose={() => setIsATSAnalyzerOpen(false)}
          resume={activeResume}
          onUpdateResume={handleUpdateActiveResume}
          onSetIsAnalyzing={setIsAnalyzingATS}
        />
      )}

      {/* Grammar & Action-Verb Polish Modal */}
      <GrammarCheckerModal
        isOpen={grammarModalState.isOpen}
        onClose={() => setGrammarModalState((prev) => ({ ...prev, isOpen: false }))}
        targetText={grammarModalState.text}
        contextTitle={grammarModalState.contextTitle}
        onApplyImprovement={grammarModalState.onApply}
      />

      {/* PDF & LinkedIn Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={handleImportComplete}
      />

      {/* Google Sign-In & Cloud Sync Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSignInSuccess={handleSignInSuccess}
      />
    </div>
  );
}
