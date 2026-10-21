import React, { useState } from 'react';
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Sparkles,
  BookCheck,
  Check,
  Loader2,
  Link as LinkIcon,
  Globe,
  Layers,
  ExternalLink,
  Camera,
  Palette,
  Github,
} from 'lucide-react';
import type {
  ResumeData,
  WorkExperience,
  Education,
  SkillCategory,
  ProjectItem,
  Certification,
  CustomSection,
  CustomSectionItem,
} from '../../types/resume';
import { ACCENT_COLOR_PRESETS } from '../../types/resume';

interface ResumeEditorProps {
  resume: ResumeData;
  onChange: (updated: ResumeData) => void;
  onOpenGrammarPolish: (text: string, contextTitle: string, onApply: (improved: string) => void) => void;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  resume,
  onChange,
  onOpenGrammarPolish,
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    contact: true,
    summary: true,
    experience: true,
    skills: false,
    education: false,
    projects: true,
    certifications: false,
    custom: true,
  });

  const [generatingBulletIndex, setGeneratingBulletIndex] = useState<{ expId: string; bulletIdx?: number } | null>(null);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Contact update
  const handleContactChange = (field: string, value: any) => {
    onChange({
      ...resume,
      contact: {
        ...resume.contact,
        [field]: value,
      },
    });
  };

  // Summary update
  const handleSummaryChange = (val: string) => {
    onChange({ ...resume, summary: val });
  };

  // Experience updates
  const handleAddExperience = () => {
    const newExp: WorkExperience = {
      id: `exp-${Date.now()}`,
      role: '',
      company: '',
      companyUrl: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: [''],
    };
    onChange({
      ...resume,
      experience: [newExp, ...resume.experience],
    });
  };

  const handleUpdateExperience = (id: string, updates: Partial<WorkExperience>) => {
    onChange({
      ...resume,
      experience: resume.experience.map((exp) => (exp.id === id ? { ...exp, ...updates } : exp)),
    });
  };

  const handleDeleteExperience = (id: string) => {
    onChange({
      ...resume,
      experience: resume.experience.filter((exp) => exp.id !== id),
    });
  };

  const handleAddBullet = (expId: string) => {
    onChange({
      ...resume,
      experience: resume.experience.map((exp) =>
        exp.id === expId ? { ...exp, bullets: [...exp.bullets, ''] } : exp
      ),
    });
  };

  const handleUpdateBullet = (expId: string, idx: number, val: string) => {
    onChange({
      ...resume,
      experience: resume.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        const newBullets = [...exp.bullets];
        newBullets[idx] = val;
        return { ...exp, bullets: newBullets };
      }),
    });
  };

  const handleDeleteBullet = (expId: string, idx: number) => {
    onChange({
      ...resume,
      experience: resume.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        return { ...exp, bullets: exp.bullets.filter((_, i) => i !== idx) };
      }),
    });
  };

  // AI Bullet Generator
  const handleGenerateAiBullet = async (exp: WorkExperience) => {
    try {
      setGeneratingBulletIndex({ expId: exp.id });
      const res = await fetch('/api/resume/generate-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: exp.role || 'Software Engineer',
          company: exp.company || 'Tech Company',
          topic: 'core responsibilities and team initiatives',
          metric: 'increased performance by 30% and improved efficiency',
        }),
      });
      const data = await res.json();
      if (data.bullets && data.bullets.length > 0) {
        onChange({
          ...resume,
          experience: resume.experience.map((e) =>
            e.id === exp.id ? { ...e, bullets: [...e.bullets, data.bullets[0]] } : e
          ),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingBulletIndex(null);
    }
  };

  // Skills updates
  const handleAddSkillCategory = () => {
    const newCat: SkillCategory = {
      id: `cat-${Date.now()}`,
      category: 'New Category',
      items: [],
    };
    onChange({ ...resume, skills: [...resume.skills, newCat] });
  };

  const handleUpdateSkillCategory = (id: string, category: string, itemsStr: string) => {
    const items = itemsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onChange({
      ...resume,
      skills: resume.skills.map((s) => (s.id === id ? { ...s, category, items } : s)),
    });
  };

  const handleDeleteSkillCategory = (id: string) => {
    onChange({
      ...resume,
      skills: resume.skills.filter((s) => s.id !== id),
    });
  };

  // Education updates
  const handleAddEducation = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      degree: '',
      school: '',
      location: '',
      graduationYear: '',
    };
    onChange({ ...resume, education: [...resume.education, newEdu] });
  };

  const handleUpdateEducation = (id: string, updates: Partial<Education>) => {
    onChange({
      ...resume,
      education: resume.education.map((edu) => (edu.id === id ? { ...edu, ...updates } : edu)),
    });
  };

  const handleDeleteEducation = (id: string) => {
    onChange({
      ...resume,
      education: resume.education.filter((edu) => edu.id !== id),
    });
  };

  // Projects updates
  const handleAddProject = () => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: '',
      description: '',
      technologies: [],
      link: '',
    };
    onChange({ ...resume, projects: [...(resume.projects || []), newProj] });
  };

  const handleUpdateProject = (id: string, updates: Partial<ProjectItem>) => {
    onChange({
      ...resume,
      projects: (resume.projects || []).map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
  };

  const handleDeleteProject = (id: string) => {
    onChange({
      ...resume,
      projects: (resume.projects || []).filter((p) => p.id !== id),
    });
  };

  // Certifications updates
  const handleAddCertification = () => {
    const newCert: Certification = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      date: '',
      credentialId: '',
    };
    onChange({ ...resume, certifications: [...(resume.certifications || []), newCert] });
  };

  const handleUpdateCertification = (id: string, updates: Partial<Certification>) => {
    onChange({
      ...resume,
      certifications: (resume.certifications || []).map((c) => (c.id === id ? { ...c, ...updates } : c)),
    });
  };

  const handleDeleteCertification = (id: string) => {
    onChange({
      ...resume,
      certifications: (resume.certifications || []).filter((c) => c.id !== id),
    });
  };

  // Custom Sections updates
  const handleAddCustomSection = (presetTitle?: string) => {
    const newSec: CustomSection = {
      id: `sec-${Date.now()}`,
      title: presetTitle || 'Additional Section',
      items: [
        {
          id: `item-${Date.now()}`,
          title: '',
          subtitle: '',
          date: '',
          description: '',
          link: '',
        },
      ],
    };
    onChange({
      ...resume,
      customSections: [...(resume.customSections || []), newSec],
    });
  };

  const handleUpdateCustomSectionTitle = (secId: string, title: string) => {
    onChange({
      ...resume,
      customSections: (resume.customSections || []).map((s) => (s.id === secId ? { ...s, title } : s)),
    });
  };

  const handleDeleteCustomSection = (secId: string) => {
    onChange({
      ...resume,
      customSections: (resume.customSections || []).filter((s) => s.id !== secId),
    });
  };

  const handleAddCustomSectionItem = (secId: string) => {
    onChange({
      ...resume,
      customSections: (resume.customSections || []).map((s) => {
        if (s.id !== secId) return s;
        return {
          ...s,
          items: [
            ...s.items,
            {
              id: `item-${Date.now()}`,
              title: '',
              subtitle: '',
              date: '',
              description: '',
              link: '',
            },
          ],
        };
      }),
    });
  };

  const handleUpdateCustomSectionItem = (
    secId: string,
    itemId: string,
    updates: Partial<CustomSectionItem>
  ) => {
    onChange({
      ...resume,
      customSections: (resume.customSections || []).map((s) => {
        if (s.id !== secId) return s;
        return {
          ...s,
          items: s.items.map((it) => (it.id === itemId ? { ...it, ...updates } : it)),
        };
      }),
    });
  };

  const handleDeleteCustomSectionItem = (secId: string, itemId: string) => {
    onChange({
      ...resume,
      customSections: (resume.customSections || []).map((s) => {
        if (s.id !== secId) return s;
        return {
          ...s,
          items: s.items.filter((it) => it.id !== itemId),
        };
      }),
    });
  };

  return (
    <div className="space-y-4 text-slate-200">
      {/* 1. Header & Contact Information */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <button
          onClick={() => toggleSection('contact')}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Contact & Header Details
            </span>
          </div>
          {openSections.contact ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {openSections.contact && (
          <div className="p-4 border-t border-slate-800 space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={resume.contact.fullName}
                  onChange={(e) => handleContactChange('fullName', e.target.value)}
                  placeholder="e.g. Alex Vance"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Target Job Title</label>
                <input
                  type="text"
                  value={resume.contact.jobTitle}
                  onChange={(e) => handleContactChange('jobTitle', e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Email <span className="text-[10px] text-indigo-400">(clickable mailto)</span>
                </label>
                <input
                  type="email"
                  value={resume.contact.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Phone</label>
                <input
                  type="text"
                  value={resume.contact.phone}
                  onChange={(e) => handleContactChange('phone', e.target.value)}
                  placeholder="+1 (555) 012-3456"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Location</label>
                <input
                  type="text"
                  value={resume.contact.location}
                  onChange={(e) => handleContactChange('location', e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  LinkedIn URL <span className="text-[10px] text-indigo-400">(opens tab)</span>
                </label>
                <input
                  type="text"
                  value={resume.contact.linkedinUrl || ''}
                  onChange={(e) => handleContactChange('linkedinUrl', e.target.value)}
                  placeholder="linkedin.com/in/username"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Portfolio / Website URL <span className="text-[10px] text-indigo-400">(opens tab)</span>
                </label>
                <input
                  type="text"
                  value={resume.contact.websiteUrl || ''}
                  onChange={(e) => handleContactChange('websiteUrl', e.target.value)}
                  placeholder="myportfolio.dev"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  GitHub Profile URL <span className="text-[10px] text-indigo-400">(opens tab)</span>
                </label>
                <input
                  type="text"
                  value={resume.contact.githubUrl || ''}
                  onChange={(e) => handleContactChange('githubUrl', e.target.value)}
                  placeholder="github.com/username"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Profile Photo Option */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block text-xs flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-indigo-400" />
                    Profile Photo on CV
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Attach a photo for modern/international CV layouts (optional for strict pure ATS)
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!resume.contact.showPhoto}
                    onChange={(e) => {
                      onChange({
                        ...resume,
                        contact: {
                          ...resume.contact,
                          showPhoto: e.target.checked,
                          photoShape: resume.contact.photoShape || 'circle',
                        },
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {resume.contact.showPhoto && (
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center gap-3">
                    {resume.contact.photoUrl ? (
                      <div className="relative group shrink-0">
                        <img
                          src={resume.contact.photoUrl}
                          alt="Profile Preview"
                          className={`w-14 h-14 object-cover border-2 shadow-sm ${
                            resume.contact.photoShape === 'circle'
                              ? 'rounded-full'
                              : resume.contact.photoShape === 'square'
                              ? 'rounded-none'
                              : 'rounded-xl'
                          }`}
                          style={{ borderColor: resume.accentColor || '#2563EB' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            onChange({
                              ...resume,
                              contact: { ...resume.contact, photoUrl: '' },
                            });
                          }}
                          className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-1 hover:bg-rose-500 shadow-xs"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-slate-700/80 border border-dashed border-slate-600 flex items-center justify-center text-slate-400 shrink-0">
                        <User className="w-6 h-6" />
                      </div>
                    )}

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg cursor-pointer inline-flex items-center gap-1.5 shadow-sm shadow-indigo-600/30 transition-colors">
                          <Camera className="w-3.5 h-3.5" />
                          <span>Upload Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  onChange({
                                    ...resume,
                                    contact: {
                                      ...resume.contact,
                                      photoUrl: reader.result as string,
                                      showPhoto: true,
                                    },
                                  });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        <span className="text-[10px] text-slate-400">or paste image URL:</span>
                      </div>
                      <input
                        type="text"
                        value={resume.contact.photoUrl || ''}
                        onChange={(e) => handleContactChange('photoUrl', e.target.value)}
                        placeholder="https://example.com/my-photo.jpg"
                        className="w-full px-2.5 py-1 text-xs bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Photo shape selector */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-700/50">
                    <span className="text-[11px] text-slate-400 font-medium">Photo Shape:</span>
                    <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-700">
                      {(['circle', 'rounded', 'square'] as const).map((shape) => (
                        <button
                          key={shape}
                          type="button"
                          onClick={() => {
                            onChange({
                              ...resume,
                              contact: { ...resume.contact, photoShape: shape },
                            });
                          }}
                          className={`px-2.5 py-0.5 text-[11px] rounded font-medium capitalize transition-colors ${
                            (resume.contact.photoShape || 'circle') === shape
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {shape}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Accent Highlight Color Option */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block text-xs flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-indigo-400" />
                    Resume Highlight Color
                  </span>
                  <span className="text-[11px] text-slate-400">Headings, divider lines, links, and role accents</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={resume.accentColor || '#2563EB'}
                    onChange={(e) => onChange({ ...resume, accentColor: e.target.value })}
                    className="w-7 h-7 rounded-md border-0 cursor-pointer bg-transparent"
                    title="Choose custom hex color"
                  />
                  <span className="font-mono text-[11px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {resume.accentColor || '#2563EB'}
                  </span>
                </div>
              </div>

              {/* Color Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {ACCENT_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => onChange({ ...resume, accentColor: preset.hex })}
                    className={`w-6 h-6 rounded-full border transition-transform flex items-center justify-center ${
                      (resume.accentColor || '#2563EB').toLowerCase() === preset.hex.toLowerCase()
                        ? 'scale-110 border-white ring-2 ring-indigo-500'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: preset.hex }}
                    title={preset.name}
                  >
                    {(resume.accentColor || '#2563EB').toLowerCase() === preset.hex.toLowerCase() && (
                      <Check className="w-3 h-3 text-white drop-shadow-sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Professional Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <button
          onClick={() => toggleSection('summary')}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Professional Summary
            </span>
          </div>
          {openSections.summary ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {openSections.summary && (
          <div className="p-4 border-t border-slate-800 space-y-3 text-xs">
            <textarea
              value={resume.summary}
              onChange={(e) => handleSummaryChange(e.target.value)}
              rows={4}
              placeholder="Highlight 2-3 sentences of career impact, core technologies, and quantified metrics..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
            <div className="flex justify-end">
              <button
                onClick={() =>
                  onOpenGrammarPolish(resume.summary, 'Professional Summary', (improved) =>
                    handleSummaryChange(improved)
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors font-medium text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Polish Summary with AI</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Work Experience */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="w-full px-4 py-3.5 flex items-center justify-between">
          <button
            onClick={() => toggleSection('experience')}
            className="flex items-center gap-2.5 text-left hover:text-white transition-colors flex-1"
          >
            <Briefcase className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Work Experience ({resume.experience.length})
            </span>
            {openSections.experience ? <ChevronDown className="w-4 h-4 ml-2" /> : <ChevronRight className="w-4 h-4 ml-2" />}
          </button>
          <button
            onClick={handleAddExperience}
            className="px-2.5 py-1 text-xs bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg flex items-center gap-1 font-medium transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Add Role</span>
          </button>
        </div>

        {openSections.experience && (
          <div className="p-4 border-t border-slate-800 space-y-6 text-xs">
            {resume.experience.map((exp, expIdx) => (
              <div key={exp.id} className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    Role #{expIdx + 1}
                  </span>
                  <button
                    onClick={() => handleDeleteExperience(exp.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    title="Delete Role"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Job Role / Title</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => handleUpdateExperience(exp.id, { role: e.target.value })}
                      placeholder="e.g. Lead Software Engineer"
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleUpdateExperience(exp.id, { company: e.target.value })}
                      placeholder="e.g. Stripe, Google"
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Company Website URL (Requested feature) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-indigo-400" />
                        Company Website URL
                      </span>
                      <span className="text-[10px] text-indigo-400">Clickable in CV (opens new tab)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={exp.companyUrl || ''}
                        onChange={(e) => handleUpdateExperience(exp.id, { companyUrl: e.target.value })}
                        placeholder="e.g. https://company.com or company.com"
                        className="w-full px-3 py-1.5 pl-8 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                      />
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Location</label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => handleUpdateExperience(exp.id, { location: e.target.value })}
                      placeholder="e.g. San Francisco, CA (or Remote)"
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Start Date</label>
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => handleUpdateExperience(exp.id, { startDate: e.target.value })}
                      placeholder="e.g. Jan 2022"
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">End Date</label>
                    <input
                      type="text"
                      disabled={exp.current}
                      value={exp.current ? 'Present' : exp.endDate}
                      onChange={(e) => handleUpdateExperience(exp.id, { endDate: e.target.value })}
                      placeholder="e.g. Dec 2024"
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => handleUpdateExperience(exp.id, { current: e.target.checked })}
                        className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                      />
                      <span className="text-slate-300">Currently work here</span>
                    </label>
                  </div>
                </div>

                {/* Bullets */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-400 font-medium">
                      Achievement Bullets (Action Verb + Quantified Outcome)
                    </label>
                    <button
                      onClick={() => handleGenerateAiBullet(exp)}
                      disabled={generatingBulletIndex?.expId === exp.id}
                      className="text-[11px] text-indigo-300 hover:text-white flex items-center gap-1 bg-indigo-950/60 hover:bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-700/60"
                    >
                      {generatingBulletIndex?.expId === exp.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                      )}
                      <span>AI Generate Bullet</span>
                    </button>
                  </div>

                  {exp.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2">
                      <span className="text-slate-500 pt-2 text-[10px]">●</span>
                      <textarea
                        value={bullet}
                        onChange={(e) => handleUpdateBullet(exp.id, bIdx, e.target.value)}
                        rows={2}
                        placeholder="e.g. Spearheaded migration to React 19, reducing bundle size by 40% and improving page load times."
                        className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                      />
                      <div className="flex flex-col gap-1 pt-1">
                        <button
                          onClick={() =>
                            onOpenGrammarPolish(bullet, `${exp.role || 'Role'} Bullet #${bIdx + 1}`, (improved) =>
                              handleUpdateBullet(exp.id, bIdx, improved)
                            )
                          }
                          className="p-1 text-slate-400 hover:text-indigo-400 rounded hover:bg-slate-700"
                          title="Polish grammar & verbs"
                        >
                          <BookCheck className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBullet(exp.id, bIdx)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-700"
                          title="Remove bullet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => handleAddBullet(exp.id)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 pt-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Bullet Point</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Skills & Competencies */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="w-full px-4 py-3.5 flex items-center justify-between">
          <button
            onClick={() => toggleSection('skills')}
            className="flex items-center gap-2.5 text-left hover:text-white transition-colors flex-1"
          >
            <Wrench className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Skills & Keywords ({resume.skills.length} categories)
            </span>
            {openSections.skills ? <ChevronDown className="w-4 h-4 ml-2" /> : <ChevronRight className="w-4 h-4 ml-2" />}
          </button>
          <button
            onClick={handleAddSkillCategory}
            className="px-2.5 py-1 text-xs bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg flex items-center gap-1 font-medium transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Add Category</span>
          </button>
        </div>

        {openSections.skills && (
          <div className="p-4 border-t border-slate-800 space-y-4 text-xs">
            {resume.skills.map((skillCat) => (
              <div key={skillCat.id} className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={skillCat.category}
                    onChange={(e) =>
                      handleUpdateSkillCategory(skillCat.id, e.target.value, skillCat.items.join(', '))
                    }
                    placeholder="Category Name (e.g. Languages & Frameworks)"
                    className="font-bold text-slate-200 bg-transparent border-b border-slate-700 focus:outline-none focus:border-indigo-500 py-0.5 flex-1"
                  />
                  <button
                    onClick={() => handleDeleteSkillCategory(skillCat.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Comma-separated skills (parsed by ATS matching engines)
                  </label>
                  <input
                    type="text"
                    value={skillCat.items.join(', ')}
                    onChange={(e) =>
                      handleUpdateSkillCategory(skillCat.id, skillCat.category, e.target.value)
                    }
                    placeholder="React, TypeScript, Node.js, SQL"
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Education */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="w-full px-4 py-3.5 flex items-center justify-between">
          <button
            onClick={() => toggleSection('education')}
            className="flex items-center gap-2.5 text-left hover:text-white transition-colors flex-1"
          >
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Education ({resume.education.length})
            </span>
            {openSections.education ? <ChevronDown className="w-4 h-4 ml-2" /> : <ChevronRight className="w-4 h-4 ml-2" />}
          </button>
          <button
            onClick={handleAddEducation}
            className="px-2.5 py-1 text-xs bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg flex items-center gap-1 font-medium transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Add Degree</span>
          </button>
        </div>

        {openSections.education && (
          <div className="p-4 border-t border-slate-800 space-y-4 text-xs">
            {resume.education.map((edu) => (
              <div key={edu.id} className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-300">Degree Details</span>
                  <button
                    onClick={() => handleDeleteEducation(edu.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Delete Degree"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleUpdateEducation(edu.id, { degree: e.target.value })}
                    placeholder="Degree (e.g. B.S. in Computer Science)"
                    className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                  <input
                    type="text"
                    value={edu.school}
                    onChange={(e) => handleUpdateEducation(edu.id, { school: e.target.value })}
                    placeholder="University or College Name"
                    className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                  <input
                    type="text"
                    value={edu.location || ''}
                    onChange={(e) => handleUpdateEducation(edu.id, { location: e.target.value })}
                    placeholder="Location (e.g. Austin, TX)"
                    className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                  <input
                    type="text"
                    value={edu.graduationYear}
                    onChange={(e) => handleUpdateEducation(edu.id, { graduationYear: e.target.value })}
                    placeholder="Graduation Year (e.g. 2021)"
                    className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                  <input
                    type="text"
                    value={edu.gpa || ''}
                    onChange={(e) => handleUpdateEducation(edu.id, { gpa: e.target.value })}
                    placeholder="GPA (optional, e.g. 3.8 / 4.0)"
                    className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                  <input
                    type="text"
                    value={edu.honors || ''}
                    onChange={(e) => handleUpdateEducation(edu.id, { honors: e.target.value })}
                    placeholder="Honors / Awards (optional)"
                    className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Projects Section with Clickable Link / URL */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="w-full px-4 py-3.5 flex items-center justify-between">
          <button
            onClick={() => toggleSection('projects')}
            className="flex items-center gap-2.5 text-left hover:text-white transition-colors flex-1"
          >
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Key Projects ({(resume.projects || []).length})
            </span>
            {openSections.projects ? <ChevronDown className="w-4 h-4 ml-2" /> : <ChevronRight className="w-4 h-4 ml-2" />}
          </button>
          <button
            onClick={handleAddProject}
            className="px-2.5 py-1 text-xs bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg flex items-center gap-1 font-medium transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Add Project</span>
          </button>
        </div>

        {openSections.projects && (
          <div className="p-4 border-t border-slate-800 space-y-4 text-xs">
            {(resume.projects || []).length === 0 && (
              <p className="text-slate-400 italic text-center py-2">
                No projects added yet. Click &quot;Add Project&quot; to showcase your portfolio or open source work.
              </p>
            )}

            {(resume.projects || []).map((proj, pIdx) => (
              <div key={proj.id} className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Project #{pIdx + 1}</span>
                  <button
                    onClick={() => handleDeleteProject(proj.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Project Name</label>
                    <input
                      type="text"
                      value={proj.name}
                      onChange={(e) => handleUpdateProject(proj.id, { name: e.target.value })}
                      placeholder="e.g. Distributed Cache Engine"
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <LinkIcon className="w-3 h-3 text-indigo-400" />
                        Project Link or Demo URL
                      </span>
                      <span className="text-[10px] text-indigo-400">Clickable in CV (opens new tab)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={proj.link || ''}
                        onChange={(e) => handleUpdateProject(proj.id, { link: e.target.value })}
                        placeholder="e.g. https://github.com/... or https://demo.app"
                        className="w-full px-3 py-1.5 pl-8 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                      />
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Technologies Used (Comma-separated)</label>
                  <input
                    type="text"
                    value={(proj.technologies || []).join(', ')}
                    onChange={(e) =>
                      handleUpdateProject(proj.id, {
                        technologies: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="e.g. Go, gRPC, Docker, React, Tailwind"
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-400">Description & Impact</label>
                    <button
                      onClick={() =>
                        onOpenGrammarPolish(proj.description, `${proj.name || 'Project'} Description`, (improved) =>
                          handleUpdateProject(proj.id, { description: improved })
                        )
                      }
                      className="text-[11px] text-indigo-300 hover:text-white flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>Polish with AI</span>
                    </button>
                  </div>
                  <textarea
                    value={proj.description}
                    onChange={(e) => handleUpdateProject(proj.id, { description: e.target.value })}
                    rows={2}
                    placeholder="Engineered high-throughput service handling 50k RPS with sub-millisecond latency..."
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. Certifications & Credentials Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="w-full px-4 py-3.5 flex items-center justify-between">
          <button
            onClick={() => toggleSection('certifications')}
            className="flex items-center gap-2.5 text-left hover:text-white transition-colors flex-1"
          >
            <Award className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Certifications & Credentials ({(resume.certifications || []).length})
            </span>
            {openSections.certifications ? <ChevronDown className="w-4 h-4 ml-2" /> : <ChevronRight className="w-4 h-4 ml-2" />}
          </button>
          <button
            onClick={handleAddCertification}
            className="px-2.5 py-1 text-xs bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg flex items-center gap-1 font-medium transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Add Certificate</span>
          </button>
        </div>

        {openSections.certifications && (
          <div className="p-4 border-t border-slate-800 space-y-4 text-xs">
            {(resume.certifications || []).length === 0 && (
              <p className="text-slate-400 italic text-center py-2">
                No certifications added yet. Click &quot;Add Certificate&quot; to include AWS, Google Cloud, PMP, or CKA credentials.
              </p>
            )}

            {(resume.certifications || []).map((cert) => (
              <div key={cert.id} className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-300">Certificate Details</span>
                  <button
                    onClick={() => handleDeleteCertification(cert.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Delete Certification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => handleUpdateCertification(cert.id, { name: e.target.value })}
                    placeholder="Certification Name (e.g. AWS Solutions Architect)"
                    className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => handleUpdateCertification(cert.id, { issuer: e.target.value })}
                    placeholder="Issuing Organization (e.g. Amazon Web Services)"
                    className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                  <input
                    type="text"
                    value={cert.date}
                    onChange={(e) => handleUpdateCertification(cert.id, { date: e.target.value })}
                    placeholder="Issue Date (e.g. 2023 or Nov 2023)"
                    className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                  <input
                    type="text"
                    value={cert.credentialId || ''}
                    onChange={(e) => handleUpdateCertification(cert.id, { credentialId: e.target.value })}
                    placeholder="Credential ID or Verification URL"
                    className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 8. Customizable Sections (Requested feature: user can add another customize section) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="w-full px-4 py-3.5 flex items-center justify-between">
          <button
            onClick={() => toggleSection('custom')}
            className="flex items-center gap-2.5 text-left hover:text-white transition-colors flex-1"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Custom Sections ({(resume.customSections || []).length})
            </span>
            {openSections.custom ? <ChevronDown className="w-4 h-4 ml-2" /> : <ChevronRight className="w-4 h-4 ml-2" />}
          </button>
          <button
            onClick={() => handleAddCustomSection()}
            className="px-2.5 py-1 text-xs bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg flex items-center gap-1 font-medium transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Add Custom Section</span>
          </button>
        </div>

        {openSections.custom && (
          <div className="p-4 border-t border-slate-800 space-y-5 text-xs">
            {/* Quick Preset Buttons for Custom Sections */}
            <div className="space-y-1.5 bg-slate-800/30 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium block">
                Quick Preset Sections (Click to add immediately):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Honors & Awards',
                  'Publications & Research',
                  'Volunteer Experience',
                  'Spoken Languages',
                  'Patents & Inventions',
                  'Speaking & Conferences',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddCustomSection(preset)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] border border-slate-700 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-2.5 h-2.5 text-indigo-400" />
                    <span>{preset}</span>
                  </button>
                ))}
              </div>
            </div>

            {(resume.customSections || []).length === 0 && (
              <p className="text-slate-400 italic text-center py-2">
                No custom sections created yet. Use the presets above or click &quot;Add Custom Section&quot; to add any personalized section to your CV.
              </p>
            )}

            {(resume.customSections || []).map((sec, secIdx) => (
              <div key={sec.id} className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-bold text-indigo-400">Section #{secIdx + 1}:</span>
                    <input
                      type="text"
                      value={sec.title}
                      onChange={(e) => handleUpdateCustomSectionTitle(sec.id, e.target.value)}
                      placeholder="Custom Section Title (e.g. Publications, Volunteer Work)"
                      className="flex-1 px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold focus:outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteCustomSection(sec.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    title="Delete entire custom section"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Items inside this custom section */}
                <div className="space-y-3 pl-2 border-l-2 border-slate-700/60">
                  {sec.items.map((item, itemIdx) => (
                    <div key={item.id} className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-300">
                          Entry #{itemIdx + 1}
                        </span>
                        <button
                          onClick={() => handleDeleteCustomSectionItem(sec.id, item.id)}
                          className="text-slate-500 hover:text-rose-400 p-0.5"
                          title="Remove entry"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) =>
                            handleUpdateCustomSectionItem(sec.id, item.id, { title: e.target.value })
                          }
                          placeholder="Title or Heading (e.g. 1st Place Hackathon Winner)"
                          className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-white text-xs"
                        />
                        <input
                          type="text"
                          value={item.subtitle || ''}
                          onChange={(e) =>
                            handleUpdateCustomSectionItem(sec.id, item.id, { subtitle: e.target.value })
                          }
                          placeholder="Subtitle or Organization (e.g. Global Tech Summit)"
                          className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-white text-xs"
                        />
                        <input
                          type="text"
                          value={item.date || ''}
                          onChange={(e) =>
                            handleUpdateCustomSectionItem(sec.id, item.id, { date: e.target.value })
                          }
                          placeholder="Date or Period (e.g. 2023 or May 2022 – Present)"
                          className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-white text-xs"
                        />
                        <div className="relative">
                          <input
                            type="text"
                            value={item.link || ''}
                            onChange={(e) =>
                              handleUpdateCustomSectionItem(sec.id, item.id, { link: e.target.value })
                            }
                            placeholder="Link or URL (clickable in CV)"
                            className="w-full px-2.5 py-1.5 pl-7 bg-slate-800 border border-slate-700 rounded-md text-white text-xs"
                          />
                          <LinkIcon className="w-3 h-3 text-slate-400 absolute left-2 top-2.5" />
                        </div>
                      </div>

                      <textarea
                        value={item.description || ''}
                        onChange={(e) =>
                          handleUpdateCustomSectionItem(sec.id, item.id, { description: e.target.value })
                        }
                        rows={2}
                        placeholder="Details or summary for this entry..."
                        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-white text-xs leading-relaxed"
                      />
                    </div>
                  ))}

                  <button
                    onClick={() => handleAddCustomSectionItem(sec.id)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 pt-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Entry to &quot;{sec.title || 'Section'}&quot;</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
