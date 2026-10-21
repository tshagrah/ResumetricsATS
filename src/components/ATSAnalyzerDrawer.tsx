import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  FileSearch,
  Loader2,
  Check,
} from 'lucide-react';
import type { ResumeData, ATSAnalysisResult } from '../types/resume';
import confetti from 'canvas-confetti';

interface ATSAnalyzerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  resume: ResumeData;
  onUpdateResume: (updated: ResumeData) => void;
  onSetIsAnalyzing?: (loading: boolean) => void;
}

export const ATSAnalyzerDrawer: React.FC<ATSAnalyzerDrawerProps> = ({
  isOpen,
  onClose,
  resume,
  onUpdateResume,
  onSetIsAnalyzing,
}) => {
  const [targetJobTitle, setTargetJobTitle] = useState(resume.targetRole || '');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ATSAnalysisResult | null>(null);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const handleRunAnalysis = async () => {
    if (!jobDescription.trim()) return;
    try {
      setIsLoading(true);
      onSetIsAnalyzing?.(true);
      const res = await fetch('/api/resume/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume,
          jobDescription,
          targetJobTitle,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setAnalysisResult(data.data);
        // Also update atsScore on the resume
        onUpdateResume({
          ...resume,
          targetRole: targetJobTitle || resume.targetRole,
          atsScore: Math.round(data.data.score),
        });

        if (data.data.score >= 80) {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (err) {
      console.error('Error running ATS analysis:', err);
    } finally {
      setIsLoading(false);
      onSetIsAnalyzing?.(false);
    }
  };

  const handleAddKeywordToSkills = (keyword: string) => {
    const updatedSkills = [...(resume.skills || [])];
    if (updatedSkills.length === 0) {
      updatedSkills.push({
        id: `skill-${Date.now()}`,
        category: 'Target Job Skills',
        items: [keyword],
      });
    } else {
      // Find matching category or add to first category
      const targetCat = updatedSkills[0];
      if (!targetCat.items.includes(keyword)) {
        targetCat.items.push(keyword);
      }
    }

    onUpdateResume({
      ...resume,
      skills: updatedSkills,
    });

    // Mark as added in UI
    setAppliedSuggestions((prev) => ({ ...prev, [`kw-${keyword}`]: true }));
  };

  const handleApplyTailoredSuggestion = (suggestion: any, index: number) => {
    if (suggestion.section === 'summary' && suggestion.sampleAddition) {
      const newSummary = resume.summary
        ? `${resume.summary.trim()} ${suggestion.sampleAddition}`
        : suggestion.sampleAddition;
      onUpdateResume({ ...resume, summary: newSummary });
    } else if (suggestion.section === 'experience' && suggestion.sampleAddition) {
      const updatedExperience = [...resume.experience];
      if (updatedExperience.length > 0) {
        updatedExperience[0].bullets.push(suggestion.sampleAddition);
        onUpdateResume({ ...resume, experience: updatedExperience });
      }
    }

    setAppliedSuggestions((prev) => ({ ...prev, [`sug-${index}`]: true }));
  };

  const getScoreBadge = (score: number) => {
    if (score >= 85) return { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', label: 'High ATS Compatibility' };
    if (score >= 65) return { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30', label: 'Moderate Match (Optimize Keywords)' };
    return { bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30', label: 'Low ATS Match (Keywords Missing)' };
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs no-print">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 text-slate-100 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">ATS Job Matcher & Optimizer</h2>
              <p className="text-xs text-slate-400">Match against recruiter filters & candidate rankers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Target Job Input */}
          <div className="space-y-3 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Role / Title
              </label>
              <input
                type="text"
                value={targetJobTitle}
                onChange={(e) => setTargetJobTitle(e.target.value)}
                placeholder="e.g. Senior Software Engineer, Lead Product Manager"
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Paste Target Job Posting Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={5}
                placeholder="Paste the job requirements, responsibilities, and qualifications here..."
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={isLoading || !jobDescription.trim()}
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/30 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scanning ATS Keywords with Gemini...</span>
                </>
              ) : (
                <>
                  <FileSearch className="w-4 h-4" />
                  <span>Scan Resume vs Job Description</span>
                </>
              )}
            </button>
          </div>

          {/* Analysis Results Display */}
          {analysisResult && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Score Card */}
              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/80">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                      ATS Match Score
                    </span>
                    <h3 className="text-3xl font-extrabold text-white tabular-nums">
                      {analysisResult.score}%
                    </h3>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                      getScoreBadge(analysisResult.score).bg
                    }`}
                  >
                    {getScoreBadge(analysisResult.score).label}
                  </div>
                </div>

                {/* Score bar */}
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      analysisResult.score >= 80
                        ? 'bg-emerald-500'
                        : analysisResult.score >= 60
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, analysisResult.score)}%` }}
                  />
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {analysisResult.summaryFeedback}
                </p>
              </div>

              {/* Missing Keywords (Actionable) */}
              {analysisResult.missingKeywords && analysisResult.missingKeywords.length > 0 && (
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      Missing High-Impact Keywords ({analysisResult.missingKeywords.length})
                    </h4>
                    <span className="text-[11px] text-slate-400">Click to add to Skills</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.missingKeywords.map((kw) => {
                      const isAdded = appliedSuggestions[`kw-${kw}`];
                      return (
                        <button
                          key={kw}
                          onClick={() => handleAddKeywordToSkills(kw)}
                          disabled={isAdded}
                          className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1 transition-colors ${
                            isAdded
                              ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300'
                              : 'bg-slate-900 border-amber-500/40 text-amber-200 hover:bg-slate-800 hover:border-amber-400'
                          }`}
                        >
                          {isAdded ? <Check className="w-3 h-3 text-emerald-400" /> : <Plus className="w-3 h-3" />}
                          <span>{kw}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Matched Keywords */}
              {analysisResult.matchedKeywords && analysisResult.matchedKeywords.length > 0 && (
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Matched ATS Keywords ({analysisResult.matchedKeywords.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.matchedKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="text-xs px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-800/60 text-emerald-300"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Formatting Checks */}
              {analysisResult.formattingChecks && (
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold text-white mb-2">ATS Formatting Audit</h4>
                  <div className="space-y-2 text-xs">
                    {analysisResult.formattingChecks.map((chk, i) => (
                      <div key={i} className="flex items-start gap-2">
                        {chk.passed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span className="font-semibold text-slate-200">{chk.rule}:</span>{' '}
                          <span className="text-slate-400">{chk.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 1-Click Tailored Suggestions */}
              {analysisResult.tailoredSuggestions && analysisResult.tailoredSuggestions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                    Recommended Resume Bullet Adjustments
                  </h4>
                  {analysisResult.tailoredSuggestions.map((sug, idx) => {
                    const isApplied = appliedSuggestions[`sug-${idx}`];
                    return (
                      <div key={idx} className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/70 text-xs">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-indigo-300 capitalize">
                            [{sug.section}] {sug.title}
                          </span>
                          {sug.sampleAddition && (
                            <button
                              onClick={() => handleApplyTailoredSuggestion(sug, idx)}
                              disabled={isApplied}
                              className={`text-[11px] px-2 py-0.5 rounded font-medium flex items-center gap-1 transition-colors ${
                                isApplied
                                  ? 'bg-emerald-900/60 text-emerald-300'
                                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                              }`}
                            >
                              {isApplied ? (
                                <>
                                  <Check className="w-2.5 h-2.5" /> Applied
                                </>
                              ) : (
                                <>
                                  <Plus className="w-2.5 h-2.5" /> Apply to Resume
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        <p className="text-slate-300 mb-2">{sug.recommendation}</p>
                        {sug.sampleAddition && (
                          <div className="p-2 bg-slate-900/80 rounded border border-slate-700/60 text-slate-200 font-mono text-[11px] leading-relaxed">
                            "{sug.sampleAddition}"
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
