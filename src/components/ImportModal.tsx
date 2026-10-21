import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  Linkedin,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileUp,
} from 'lucide-react';
import type { ResumeData } from '../types/resume';
import confetti from 'canvas-confetti';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (newResume: ResumeData) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'pdf' | 'linkedin'>('pdf');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [linkedinBio, setLinkedinBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setErrorMessage('Please select a valid PDF file.');
        return;
      }
      setSelectedFile(file);
      setErrorMessage('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== 'application/pdf') {
        setErrorMessage('Please drop a valid PDF file.');
        return;
      }
      setSelectedFile(file);
      setErrorMessage('');
    }
  };

  const handlePdfSubmit = async () => {
    if (!selectedFile) return;
    try {
      setIsLoading(true);
      setErrorMessage('');

      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(selectedFile);
      const base64String = await base64Promise;

      const res = await fetch('/api/resume/parse-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64: base64String }),
      });

      const json = await res.json();
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Failed to extract resume from PDF.');
      }

      const parsedData = json.data;
      const formattedResume: ResumeData = {
        id: `resume-${Date.now()}`,
        title: parsedData.title || `${parsedData.contact?.fullName || 'Imported'} ATS Resume`,
        language: 'en',
        theme: 'ats-pure',
        contact: {
          fullName: parsedData.contact?.fullName || 'Full Name',
          jobTitle: parsedData.contact?.jobTitle || '',
          email: parsedData.contact?.email || '',
          phone: parsedData.contact?.phone || '',
          location: parsedData.contact?.location || '',
          linkedinUrl: parsedData.contact?.linkedinUrl || '',
          websiteUrl: parsedData.contact?.websiteUrl || '',
          githubUrl: parsedData.contact?.githubUrl || '',
        },
        summary: parsedData.summary || '',
        experience: (parsedData.experience || []).map((exp: any, i: number) => ({
          id: `exp-${Date.now()}-${i}`,
          role: exp.role || 'Role',
          company: exp.company || 'Company',
          location: exp.location || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          current: !!exp.current,
          bullets: Array.isArray(exp.bullets) ? exp.bullets : [],
        })),
        education: (parsedData.education || []).map((edu: any, i: number) => ({
          id: `edu-${Date.now()}-${i}`,
          degree: edu.degree || 'Degree',
          school: edu.school || 'School',
          location: edu.location || '',
          graduationYear: edu.graduationYear || '',
          gpa: edu.gpa || '',
          honors: edu.honors || '',
        })),
        skills: (parsedData.skills || []).map((sk: any, i: number) => ({
          id: `sk-${Date.now()}-${i}`,
          category: sk.category || 'Skills',
          items: Array.isArray(sk.items) ? sk.items : [],
        })),
        projects: (parsedData.projects || []).map((p: any, i: number) => ({
          id: `proj-${Date.now()}-${i}`,
          name: p.name || 'Project',
          description: p.description || '',
          technologies: Array.isArray(p.technologies) ? p.technologies : [],
          link: p.link || '',
        })),
        certifications: (parsedData.certifications || []).map((c: any, i: number) => ({
          id: `cert-${Date.now()}-${i}`,
          name: c.name || 'Certification',
          issuer: c.issuer || '',
          date: c.date || '',
        })),
        lastSavedAt: Date.now(),
        atsScore: 85,
      };

      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      onImportComplete(formattedResume);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to parse PDF.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedinSubmit = async () => {
    if (!linkedinUrl.trim() && !linkedinBio.trim()) {
      setErrorMessage('Please provide either your LinkedIn profile URL or copy-pasted bio/experience.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const res = await fetch('/api/resume/parse-linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkedinUrl: linkedinUrl.trim(),
          profileText: linkedinBio.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Failed to extract resume from LinkedIn.');
      }

      const parsedData = json.data;
      const formattedResume: ResumeData = {
        id: `resume-${Date.now()}`,
        title: `${parsedData.contact?.fullName || 'LinkedIn'} Profile Resume`,
        language: 'en',
        theme: 'ats-pure',
        contact: {
          fullName: parsedData.contact?.fullName || 'Full Name',
          jobTitle: parsedData.contact?.jobTitle || '',
          email: parsedData.contact?.email || 'user@example.com',
          phone: parsedData.contact?.phone || '',
          location: parsedData.contact?.location || '',
          linkedinUrl: linkedinUrl || parsedData.contact?.linkedinUrl || '',
          websiteUrl: parsedData.contact?.websiteUrl || '',
        },
        summary: parsedData.summary || '',
        experience: (parsedData.experience || []).map((exp: any, i: number) => ({
          id: `exp-${Date.now()}-${i}`,
          role: exp.role || 'Role',
          company: exp.company || 'Company',
          location: exp.location || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          current: !!exp.current,
          bullets: Array.isArray(exp.bullets) ? exp.bullets : [],
        })),
        education: (parsedData.education || []).map((edu: any, i: number) => ({
          id: `edu-${Date.now()}-${i}`,
          degree: edu.degree || 'Degree',
          school: edu.school || 'School',
          location: edu.location || '',
          graduationYear: edu.graduationYear || '',
        })),
        skills: (parsedData.skills || []).map((sk: any, i: number) => ({
          id: `sk-${Date.now()}-${i}`,
          category: sk.category || 'Skills',
          items: Array.isArray(sk.items) ? sk.items : [],
        })),
        projects: (parsedData.projects || []).map((p: any, i: number) => ({
          id: `proj-${Date.now()}-${i}`,
          name: p.name || 'Project',
          description: p.description || '',
          technologies: Array.isArray(p.technologies) ? p.technologies : [],
        })),
        certifications: (parsedData.certifications || []).map((c: any, i: number) => ({
          id: `cert-${Date.now()}-${i}`,
          name: c.name || 'Certification',
          issuer: c.issuer || '',
          date: c.date || '',
        })),
        lastSavedAt: Date.now(),
        atsScore: 82,
      };

      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      onImportComplete(formattedResume);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to extract LinkedIn profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Import & Auto-Extract into ATS Format</h2>
              <p className="text-xs text-slate-400">Upload existing PDF or import LinkedIn career data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 px-5 pt-3 gap-4">
          <button
            onClick={() => setActiveTab('pdf')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'pdf'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileUp className="w-4 h-4" />
            Upload PDF Resume
          </button>
          <button
            onClick={() => setActiveTab('linkedin')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'linkedin'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Linkedin className="w-4 h-4" />
            Extract LinkedIn Profile
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'pdf' ? (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                  dragOver
                    ? 'border-indigo-500 bg-indigo-950/20'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
                }`}
                onClick={() => document.getElementById('pdf-file-input')?.click()}
              >
                <input
                  id="pdf-file-input"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <FileText className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
                <h3 className="text-xs font-bold text-white mb-1">
                  {selectedFile ? selectedFile.name : 'Click to select or drag and drop your PDF'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {selectedFile
                    ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Ready for ATS parsing`
                    : 'AI analyzes text, multi-columns, and scans to extract clean ATS structure'}
                </p>
              </div>

              <button
                onClick={handlePdfSubmit}
                disabled={isLoading || !selectedFile}
                className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm shadow-indigo-600/30"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Parsing Document with Gemini Multimodal AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Extract & Put into ATS Format</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  LinkedIn Profile URL
                </label>
                <div className="relative">
                  <Linkedin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/your-username"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Or Paste LinkedIn About / Experience Summary
                </label>
                <textarea
                  value={linkedinBio}
                  onChange={(e) => setLinkedinBio(e.target.value)}
                  rows={4}
                  placeholder="Paste your LinkedIn summary, work history, or exported profile text here..."
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={handleLinkedinSubmit}
                disabled={isLoading || (!linkedinUrl.trim() && !linkedinBio.trim())}
                className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm shadow-indigo-600/30"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extracting Career Data from LinkedIn...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate ATS CV from LinkedIn</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
