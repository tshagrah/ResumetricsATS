import React, { useState } from 'react';
import { X, Sparkles, Check, AlertCircle, ArrowRight, Loader2, BookCheck } from 'lucide-react';
import type { GrammarPolishResult } from '../types/resume';

interface GrammarCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetText: string;
  contextTitle: string;
  onApplyImprovement: (improvedText: string) => void;
}

export const GrammarCheckerModal: React.FC<GrammarCheckerModalProps> = ({
  isOpen,
  onClose,
  targetText,
  contextTitle,
  onApplyImprovement,
}) => {
  const [inputText, setInputText] = useState(targetText);
  const [isLoading, setIsLoading] = useState(false);
  const [polishResult, setPolishResult] = useState<GrammarPolishResult | null>(null);

  if (!isOpen) return null;

  const handleCheckGrammar = async () => {
    if (!inputText.trim()) return;
    try {
      setIsLoading(true);
      const res = await fetch('/api/resume/polish-grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          context: contextTitle,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setPolishResult(data.data);
      }
    } catch (err) {
      console.error('Error polishing grammar:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySingle = (original: string, suggested: string) => {
    const updated = inputText.replace(original, suggested);
    setInputText(updated);
  };

  const handleApplyFinal = () => {
    onApplyImprovement(inputText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BookCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">AI Grammar & Power-Verb Polish</h2>
              <p className="text-xs text-slate-400">{contextTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Current Text
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleCheckGrammar}
            disabled={isLoading || !inputText.trim()}
            className="w-full py-2 px-4 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Auditing Grammar & Action Verbs...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Audit Grammar & Enhance Power Verbs</span>
              </>
            )}
          </button>

          {polishResult && (
            <div className="space-y-4 pt-2">
              <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-white">Audit Overview</span>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 bg-slate-700 rounded text-[11px] text-slate-300">
                      Readability: {polishResult.readabilityLevel}
                    </span>
                    {polishResult.actionVerbScore && (
                      <span className="px-2 py-0.5 bg-indigo-900/60 text-indigo-300 rounded text-[11px]">
                        Verbs: {polishResult.actionVerbScore}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-slate-300">{polishResult.overallAssessment}</p>
              </div>

              {polishResult.suggestions && polishResult.suggestions.length > 0 ? (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-white">Specific Improvements</h4>
                  {polishResult.suggestions.map((sug) => (
                    <div
                      key={sug.id}
                      className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-amber-400 capitalize">
                          [{sug.type}]
                        </span>
                        <button
                          onClick={() => handleApplySingle(sug.original, sug.suggested)}
                          className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1"
                        >
                          <Check className="w-2.5 h-2.5" /> Apply Replace
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="line-through text-rose-400">{sug.original}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="text-emerald-400 font-semibold">{sug.suggested}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{sug.reason}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Grammar and phrasing look clean, powerful, and ATS-optimized!</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-900/80">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyFinal}
            className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
          >
            Save to Resume
          </button>
        </div>
      </div>
    </div>
  );
};
