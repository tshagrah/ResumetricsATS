import React, { useState } from 'react';
import {
  Plus,
  FileUp,
  Linkedin,
  Copy,
  Trash2,
  FileCode,
  Printer,
  Sparkles,
  ShieldCheck,
  Calendar,
  Globe,
  Edit3,
  Layers,
  ArrowRight,
} from 'lucide-react';
import type { ResumeData } from '../types/resume';
import { SUPPORTED_LANGUAGES } from '../types/resume';
import { exportResumeToDocx } from '../utils/docxExport';
import confetti from 'canvas-confetti';

interface DashboardViewProps {
  resumes: ResumeData[];
  activeResumeId: string;
  onSelectResume: (id: string) => void;
  onCreateNew: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenImportModal: () => void;
  onRename: (id: string, newTitle: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  resumes,
  activeResumeId,
  onSelectResume,
  onCreateNew,
  onDuplicate,
  onDelete,
  onOpenImportModal,
  onRename,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState('');

  const handleStartRename = (resume: ResumeData, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(resume.id);
    setRenameTitle(resume.title);
  };

  const handleSaveRename = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (renameTitle.trim()) {
      onRename(id, renameTitle.trim());
    }
    setEditingId(null);
  };

  const handleDownloadDocx = async (resume: ResumeData, e: React.MouseEvent) => {
    e.stopPropagation();
    await exportResumeToDocx(resume);
  };

  const getLanguageDetails = (code: string) => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0];
  };

  const avgScore = resumes.length
    ? Math.round(
        resumes.reduce((acc, r) => acc + (r.atsScore || 75), 0) / resumes.length
      )
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 no-print">
      {/* Top Banner / Welcome Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Resume & CV Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your ATS-tailored CVs, track keyword match rates, and export to PDF or DOCX.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenImportModal}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center gap-2 transition-colors"
          >
            <FileUp className="w-4 h-4 text-indigo-400" />
            <span>Import PDF / LinkedIn</span>
          </button>
          <button
            onClick={onCreateNew}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-sm shadow-indigo-600/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Resume</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Created CVs</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-1.5 tabular-nums">
            {resumes.length}
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Avg ATS Compatibility</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1.5 tabular-nums">
            {avgScore}%
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Formats Supported</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-sm font-semibold text-slate-300 mt-2">
            PDF (Vector Print) + DOCX (Word)
          </p>
        </div>
      </div>

      {/* Resumes Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Your Tailored Resumes ({resumes.length})
          </h2>
          <span className="text-xs text-slate-400">Click any card to open in editor</span>
        </div>

        {resumes.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/60 rounded-2xl border border-dashed border-slate-800 p-8 space-y-3">
            <Layers className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No resumes created yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Get started by uploading an existing PDF, importing your LinkedIn profile, or starting with our ATS template.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={onOpenImportModal}
                className="px-3.5 py-1.5 text-xs font-semibold bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700"
              >
                Upload PDF
              </button>
              <button
                onClick={onCreateNew}
                className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
              >
                Create Blank
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {resumes.map((item) => {
              const lang = getLanguageDetails(item.language || 'en');
              const isSelected = item.id === activeResumeId;
              const dateStr = item.lastSavedAt
                ? new Date(item.lastSavedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recently';

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectResume(item.id)}
                  className={`group relative bg-slate-900 border rounded-2xl p-5 cursor-pointer transition-all hover:shadow-lg hover:border-indigo-500/60 flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-500/80 ring-1 ring-indigo-500/50 shadow-md shadow-indigo-950/50'
                      : 'border-slate-800'
                  }`}
                >
                  <div>
                    {/* Top Tag Row */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                          {lang.flag} {lang.name}
                        </span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-xs font-medium text-slate-400 capitalize">
                          {item.theme === 'ats-pure' ? 'Pure ATS' : item.theme}
                        </span>
                      </div>

                      {typeof item.atsScore === 'number' && item.atsScore > 0 && (
                        <div
                          className={`px-2 py-0.5 rounded text-[11px] font-bold tabular-nums border ${
                            item.atsScore >= 85
                              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                              : item.atsScore >= 65
                              ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                              : 'bg-rose-950/60 border-rose-800 text-rose-300'
                          }`}
                        >
                          {item.atsScore}% Match
                        </div>
                      )}
                    </div>

                    {/* Title & Role */}
                    {editingId === item.id ? (
                      <form onSubmit={(e) => handleSaveRename(item.id, e)} className="mb-2">
                        <input
                          type="text"
                          value={renameTitle}
                          autoFocus
                          onChange={(e) => setRenameTitle(e.target.value)}
                          onBlur={() => setEditingId(null)}
                          className="w-full px-2 py-1 text-sm bg-slate-800 border border-indigo-500 rounded text-white"
                        />
                      </form>
                    ) : (
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                          {item.title}
                        </h3>
                        <button
                          onClick={(e) => handleStartRename(item, e)}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-300 p-0.5"
                          title="Rename"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-slate-400 mb-3">
                      {item.contact.fullName} · {item.targetRole || item.contact.jobTitle || 'General'}
                    </p>

                    {/* Mini stats */}
                    <div className="text-[11px] text-slate-500 flex items-center gap-3 mb-4">
                      <span>{item.experience.length} Roles</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.skills.reduce((acc, s) => acc + s.items.length, 0)} Skills</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">Updated {dateStr}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Open in Builder <ArrowRight className="w-3.5 h-3.5" />
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleDownloadDocx(item, e)}
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Quick Download DOCX"
                      >
                        <FileCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate(item.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Duplicate CV"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {resumes.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item.id);
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Delete CV"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
