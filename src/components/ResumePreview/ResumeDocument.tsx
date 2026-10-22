import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import type {
  ResumeData,
  WorkExperience,
  Education,
  SkillCategory,
  ProjectItem,
  Certification,
  CustomSection,
} from '../../types/resume';
import { DEFAULT_DOCUMENT_MARGINS } from '../../types/resume';
import { calculatePageBreakpoints } from '../../utils/pagination';
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  ExternalLink,
  Edit3,
  Award,
  FolderGit2,
  Briefcase,
  GraduationCap,
  Sparkles,
  FileText,
} from 'lucide-react';

interface ResumeDocumentProps {
  resume: ResumeData;
  zoom?: number;
  isLiveEditMode?: boolean;
  onUpdateResume?: (updated: ResumeData) => void;
  showMarginGuides?: boolean;
}

export const ResumeDocument: React.FC<ResumeDocumentProps> = ({
  resume,
  zoom = 1,
  isLiveEditMode = false,
  onUpdateResume,
  showMarginGuides = false,
}) => {
  const {
    contact,
    summary,
    experience = [],
    education = [],
    skills = [],
    projects = [],
    certifications = [],
    customSections = [],
    theme = 'ats-pure',
  } = resume;

  const accent = resume.accentColor || '#2563EB';
  const margins = resume.margins || DEFAULT_DOCUMENT_MARGINS;

  // Standard US Letter dimensions in pixels at 96 DPI
  const PAGE_WIDTH_PX = 816; // 8.5in * 96
  const PAGE_HEIGHT_PX = 1056; // 11.0in * 96

  const topPx = Math.round(margins.top * 96);
  const bottomPx = Math.round(margins.bottom * 96);
  const leftPx = Math.round(margins.left * 96);
  const rightPx = Math.round(margins.right * 96);
  const printableHeightPx = Math.max(400, PAGE_HEIGHT_PX - topPx - bottomPx);

  // Measurer ref and pagination state
  const measurerRef = useRef<HTMLDivElement>(null);
  const [breakpoints, setBreakpoints] = useState<number[]>([0, PAGE_HEIGHT_PX]);

  // Re-measure breakpoints whenever resume, theme, or margins change
  const measurePagination = () => {
    if (!measurerRef.current) return;
    try {
      const isFullBleedHeader = theme === 'creative' || theme === 'modern';
      const calculatedBreaks = calculatePageBreakpoints(measurerRef.current, {
        pageHeightPx: PAGE_HEIGHT_PX,
        topPx,
        bottomPx,
        isFullBleedHeader,
      });
      setBreakpoints(calculatedBreaks);
    } catch (e) {
      console.warn('Pagination measurement fallback:', e);
      setBreakpoints([0, PAGE_HEIGHT_PX]);
    }
  };

  useLayoutEffect(() => {
    measurePagination();
  }, [resume, theme, margins.top, margins.bottom, margins.left, margins.right, printableHeightPx]);

  // Also re-measure when web fonts finish loading or window resizes
  useEffect(() => {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        measurePagination();
      });
    }
    const timer = setTimeout(measurePagination, 250);
    return () => clearTimeout(timer);
  }, [resume.id, theme]);

  const totalPages = Math.max(1, breakpoints.length - 1);

  const formatUrl = (url?: string) => {
    if (!url) return '';
    const clean = url.trim();
    if (!clean) return '';
    if (/^https?:\/\//i.test(clean)) return clean;
    return `https://${clean}`;
  };

  const cleanPhoneForTel = (phone?: string) => {
    if (!phone) return '';
    return phone.replace(/[^+\d]/g, '');
  };

  // Helper for inline editable text directly on the canvas
  const renderEditable = (
    text: string,
    onSave: (val: string) => void,
    classes = '',
    style?: React.CSSProperties,
    multiline = false
  ) => {
    if (!isLiveEditMode || !onUpdateResume) {
      return (
        <span className={classes} style={style}>
          {text}
        </span>
      );
    }

    return (
      <span
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          const val = e.currentTarget.textContent || '';
          if (val !== text) {
            onSave(val);
          }
        }}
        onKeyDown={(e) => {
          if (!multiline && e.key === 'Enter') {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        className={`${classes} hover:outline-dashed hover:outline-1 hover:outline-indigo-500/80 focus:outline-2 focus:outline-indigo-500 focus:bg-indigo-50/50 rounded px-0.5 cursor-text transition-all`}
        style={style}
        title="Live Edit on Canvas: Click and type to modify text"
      >
        {text}
      </span>
    );
  };

  // State update helpers for canvas live-edit
  const updateContact = (field: string, val: string) => {
    if (!onUpdateResume) return;
    onUpdateResume({
      ...resume,
      contact: { ...resume.contact, [field]: val },
    });
  };

  const updateSummary = (val: string) => {
    if (!onUpdateResume) return;
    onUpdateResume({ ...resume, summary: val });
  };

  const updateExperienceRole = (id: string, field: keyof WorkExperience, val: any) => {
    if (!onUpdateResume) return;
    onUpdateResume({
      ...resume,
      experience: resume.experience.map((exp) => (exp.id === id ? { ...exp, [field]: val } : exp)),
    });
  };

  const updateExperienceBullet = (expId: string, idx: number, val: string) => {
    if (!onUpdateResume) return;
    onUpdateResume({
      ...resume,
      experience: resume.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        const newBullets = [...exp.bullets];
        newBullets[idx] = val;
        return { ...exp, bullets: newBullets };
      }),
    });
  };

  const updateSkillCategory = (id: string, category: string) => {
    if (!onUpdateResume) return;
    onUpdateResume({
      ...resume,
      skills: resume.skills.map((s) => (s.id === id ? { ...s, category } : s)),
    });
  };

  const updateSkillItems = (id: string, itemsStr: string) => {
    if (!onUpdateResume) return;
    const items = itemsStr.split(',').map((s) => s.trim()).filter(Boolean);
    onUpdateResume({
      ...resume,
      skills: resume.skills.map((s) => (s.id === id ? { ...s, items } : s)),
    });
  };

  const updateEducation = (id: string, field: keyof Education, val: any) => {
    if (!onUpdateResume) return;
    onUpdateResume({
      ...resume,
      education: resume.education.map((edu) => (edu.id === id ? { ...edu, [field]: val } : edu)),
    });
  };

  const updateProject = (id: string, field: keyof ProjectItem, val: any) => {
    if (!onUpdateResume) return;
    onUpdateResume({
      ...resume,
      projects: (resume.projects || []).map((p) => (p.id === id ? { ...p, [field]: val } : p)),
    });
  };

  const updateCertification = (id: string, field: keyof Certification, val: any) => {
    if (!onUpdateResume) return;
    onUpdateResume({
      ...resume,
      certifications: (resume.certifications || []).map((c) => (c.id === id ? { ...c, [field]: val } : c)),
    });
  };

  const updateCustomSectionTitle = (secId: string, title: string) => {
    if (!onUpdateResume) return;
    onUpdateResume({
      ...resume,
      customSections: (resume.customSections || []).map((s) => (s.id === secId ? { ...s, title } : s)),
    });
  };

  const updateCustomSectionItem = (secId: string, itemId: string, field: keyof CustomSection['items'][0], val: any) => {
    if (!onUpdateResume) return;
    onUpdateResume({
      ...resume,
      customSections: (resume.customSections || []).map((s) => {
        if (s.id !== secId) return s;
        return {
          ...s,
          items: s.items.map((it) => (it.id === itemId ? { ...it, [field]: val } : it)),
        };
      }),
    });
  };

  // Helper for photo shape class
  const getPhotoShapeClass = () => {
    if (contact.photoShape === 'circle') return 'rounded-full';
    if (contact.photoShape === 'square') return 'rounded-none';
    return 'rounded-xl';
  };

  // Render Candidate Profile Photo element
  const renderProfilePhoto = (sizeClass = 'w-20 h-20') => {
    if (!contact.showPhoto || !contact.photoUrl) return null;
    return (
      <div className="shrink-0 print:block">
        <img
          src={contact.photoUrl}
          alt={contact.fullName || 'Candidate Photo'}
          referrerPolicy="no-referrer"
          className={`${sizeClass} object-cover ${getPhotoShapeClass()} shadow-sm border-2`}
          style={{ borderColor: accent }}
        />
      </div>
    );
  };

  // Live edit badge component
  const LiveEditBadge = () => (
    <div className="fixed top-20 right-6 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg flex items-center gap-2 no-print shadow-lg z-50 animate-in fade-in">
      <Edit3 className="w-3.5 h-3.5" />
      <span>Live Edit Active (Click text directly on canvas to edit)</span>
    </div>
  );

  // -------------------------------------------------------------
  // THEME 1: PURE ATS STANDARD (Strict Single-Column, Monochrome)
  // -------------------------------------------------------------
  const renderAtsPureContent = () => (
    <div
      style={{
        paddingLeft: `${margins.left}in`,
        paddingRight: `${margins.right}in`,
        paddingTop: 0,
        paddingBottom: 0,
      }}
      className="w-[8.5in] bg-white text-neutral-900 font-sans leading-relaxed box-border relative"
    >
      {/* Name & Contact */}
      <header className="resume-break-target text-center pb-4 mb-4 border-b border-neutral-300">
        <div className="flex items-center justify-center gap-5">
          {renderProfilePhoto('w-18 h-18')}
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-neutral-900 mb-1">
              {renderEditable(contact.fullName || 'FULL NAME', (val) => updateContact('fullName', val))}
            </h1>
            {contact.jobTitle && (
              <p className="text-sm font-semibold tracking-wide mb-2 uppercase" style={{ color: accent }}>
                {renderEditable(contact.jobTitle, (val) => updateContact('jobTitle', val))}
              </p>
            )}
          </div>
        </div>

        {/* Contact Details */}
        <div className="flex flex-wrap items-center justify-center gap-x-2 text-xs text-neutral-700 mt-2">
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="hover:underline transition-colors hover:text-indigo-600"
              title="Send email directly"
            >
              {renderEditable(contact.email, (val) => updateContact('email', val))}
            </a>
          )}
          {contact.phone && (
            <>
              <span aria-hidden="true" className="text-neutral-400">·</span>
              <a
                href={`tel:${cleanPhoneForTel(contact.phone)}`}
                className="hover:underline transition-colors hover:text-indigo-600"
                title="Call phone number"
              >
                {renderEditable(contact.phone, (val) => updateContact('phone', val))}
              </a>
            </>
          )}
          {contact.location && (
            <>
              <span aria-hidden="true" className="text-neutral-400">·</span>
              <span>{renderEditable(contact.location, (val) => updateContact('location', val))}</span>
            </>
          )}
          {contact.linkedinUrl && (
            <>
              <span aria-hidden="true" className="text-neutral-400">·</span>
              <a
                href={formatUrl(contact.linkedinUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline inline-flex items-center gap-0.5 text-neutral-800 hover:text-indigo-600 transition-colors"
                title="Open LinkedIn in new tab"
              >
                <span>{renderEditable(contact.linkedinUrl.replace(/^https?:\/\//, ''), (val) => updateContact('linkedinUrl', val))}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60 no-print" />
              </a>
            </>
          )}
          {contact.websiteUrl && (
            <>
              <span aria-hidden="true" className="text-neutral-400">·</span>
              <a
                href={formatUrl(contact.websiteUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline inline-flex items-center gap-0.5 text-neutral-800 hover:text-indigo-600 transition-colors"
                title="Open Portfolio in new tab"
              >
                <span>{renderEditable(contact.websiteUrl.replace(/^https?:\/\//, ''), (val) => updateContact('websiteUrl', val))}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60 no-print" />
              </a>
            </>
          )}
          {contact.githubUrl && (
            <>
              <span aria-hidden="true" className="text-neutral-400">·</span>
              <a
                href={formatUrl(contact.githubUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline inline-flex items-center gap-0.5 text-neutral-800 hover:text-indigo-600 transition-colors"
                title="Open GitHub in new tab"
              >
                <span>{renderEditable(contact.githubUrl.replace(/^https?:\/\//, ''), (val) => updateContact('githubUrl', val))}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60 no-print" />
              </a>
            </>
          )}
        </div>
      </header>

      {/* Professional Summary */}
      {summary && summary.trim() && (
        <section className="resume-break-target mb-4">
          <h2
            className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b"
            style={{ color: accent, borderColor: `${accent}40` }}
          >
            Professional Summary
          </h2>
          <p className="text-xs text-neutral-800 leading-relaxed text-justify">
            {renderEditable(summary, (val) => updateSummary(val), '', undefined, true)}
          </p>
        </section>
      )}

      {/* Work Experience */}
      {experience && experience.length > 0 && (
        <section className="resume-break-target mb-4">
          <h2
            className="text-xs font-bold uppercase tracking-wider pb-1 mb-2.5 border-b"
            style={{ color: accent, borderColor: `${accent}40` }}
          >
            Work Experience
          </h2>
          <div className="space-y-3.5">
            {experience.map((exp) => (
              <div
                key={exp.id}
                data-page-break-before={exp.pageBreakBefore ? 'true' : 'false'}
                className="resume-break-target text-xs"
              >
                <div className="flex items-baseline justify-between mb-0.5">
                  <span className="font-bold text-neutral-900 text-[13px]">
                    {renderEditable(exp.role, (val) => updateExperienceRole(exp.id, 'role', val))}
                  </span>
                  <span className="text-neutral-600 text-right tabular-nums italic">
                    {renderEditable(
                      `${exp.startDate || ''} – ${exp.current ? 'Present' : exp.endDate || ''}`,
                      (val) => {
                        const parts = val.split('–').map((p) => p.trim());
                        if (parts[0]) updateExperienceRole(exp.id, 'startDate', parts[0]);
                        if (parts[1]) updateExperienceRole(exp.id, 'endDate', parts[1]);
                      }
                    )}
                  </span>
                </div>
                <div className="text-neutral-700 font-semibold mb-1.5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5">
                    {renderEditable(exp.company, (val) => updateExperienceRole(exp.id, 'company', val))}
                    {exp.companyUrl && (
                      <a
                        href={formatUrl(exp.companyUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-indigo-600 inline-flex items-center gap-0.5 text-[11px] font-normal"
                        title="Visit company website"
                      >
                        <span>Website</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60 no-print" />
                      </a>
                    )}
                  </span>
                  {exp.location && (
                    <span className="font-normal text-neutral-500">
                      {renderEditable(exp.location, (val) => updateExperienceRole(exp.id, 'location', val))}
                    </span>
                  )}
                </div>
                <ul className="list-disc pl-4 space-y-1 text-neutral-800">
                  {exp.bullets.map((bullet, i) => (
                    <li key={i} className="resume-break-target leading-snug">
                      {renderEditable(bullet, (val) => updateExperienceBullet(exp.id, i, val), '', undefined, true)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <section className="resume-break-target mb-4">
          <h2
            className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b"
            style={{ color: accent, borderColor: `${accent}40` }}
          >
            Skills & Core Competencies
          </h2>
          <div className="space-y-1 text-xs">
            {skills.map((skill) => (
              <div
                key={skill.id}
                data-page-break-before={skill.pageBreakBefore ? 'true' : 'false'}
                className="resume-break-target flex leading-snug"
              >
                <span className="font-bold text-neutral-900 w-48 shrink-0">
                  {renderEditable(skill.category, (val) => updateSkillCategory(skill.id, val))}:
                </span>
                <span className="text-neutral-800 flex-1">
                  {renderEditable(skill.items.join(', '), (val) => updateSkillItems(skill.id, val))}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <section className="resume-break-target mb-4">
          <h2
            className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b"
            style={{ color: accent, borderColor: `${accent}40` }}
          >
            Education
          </h2>
          <div className="space-y-2 text-xs">
            {education.map((edu) => (
              <div
                key={edu.id}
                data-page-break-before={edu.pageBreakBefore ? 'true' : 'false'}
                className="resume-break-target"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-neutral-900">
                    {renderEditable(edu.degree, (val) => updateEducation(edu.id, 'degree', val))}
                  </span>
                  <span className="text-neutral-600 tabular-nums italic">
                    {renderEditable(edu.graduationYear, (val) => updateEducation(edu.id, 'graduationYear', val))}
                  </span>
                </div>
                <div className="text-neutral-700 flex items-center justify-between">
                  <span>
                    {renderEditable(edu.school, (val) => updateEducation(edu.id, 'school', val))}
                    {edu.location ? `, ${edu.location}` : ''}
                  </span>
                  {(edu.gpa || edu.honors) && (
                    <span className="text-neutral-500">
                      {[edu.gpa ? `GPA: ${edu.gpa}` : '', edu.honors].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Key Projects */}
      {projects && projects.length > 0 && (
        <section className="resume-break-target mb-4">
          <h2
            className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b"
            style={{ color: accent, borderColor: `${accent}40` }}
          >
            Key Projects
          </h2>
          <div className="space-y-2.5 text-xs">
            {projects.map((proj) => (
              <div
                key={proj.id}
                data-page-break-before={proj.pageBreakBefore ? 'true' : 'false'}
                className="resume-break-target"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-neutral-900 inline-flex items-center gap-1.5">
                    {renderEditable(proj.name, (val) => updateProject(proj.id, 'name', val))}
                    {proj.link && (
                      <a
                        href={formatUrl(proj.link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-indigo-600 inline-flex items-center gap-0.5 text-[11px] font-normal"
                        title="Open project live demo"
                      >
                        <span>Live Demo</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60 no-print" />
                      </a>
                    )}
                  </span>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <span className="text-neutral-500 italic">
                      [{renderEditable(proj.technologies.join(', '), (val) =>
                        updateProject(
                          proj.id,
                          'technologies',
                          val.split(',').map((s) => s.trim()).filter(Boolean)
                        )
                      )}]
                    </span>
                  )}
                </div>
                <p className="text-neutral-800 leading-snug mt-0.5">
                  {renderEditable(proj.description, (val) => updateProject(proj.id, 'description', val), '', undefined, true)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <section className="resume-break-target mb-4">
          <h2
            className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b"
            style={{ color: accent, borderColor: `${accent}40` }}
          >
            Certifications & Credentials
          </h2>
          <ul className="list-disc pl-4 space-y-1 text-xs text-neutral-800">
            {certifications.map((cert) => (
              <li
                key={cert.id}
                data-page-break-before={cert.pageBreakBefore ? 'true' : 'false'}
                className="resume-break-target"
              >
                <span className="font-semibold text-neutral-900">
                  {renderEditable(cert.name, (val) => updateCertification(cert.id, 'name', val))}
                </span>
                <span className="text-neutral-600">
                  {' '}— {renderEditable(cert.issuer, (val) => updateCertification(cert.id, 'issuer', val))}
                  {cert.date ? ` (${cert.date})` : ''}
                </span>
                {cert.credentialId && (
                  <span className="ml-2">
                    {/^https?:\/\//i.test(cert.credentialId.trim()) ? (
                      <a
                        href={formatUrl(cert.credentialId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline inline-flex items-center gap-0.5 text-[10px]"
                      >
                        <span>Verify Credential</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60 no-print" />
                      </a>
                    ) : (
                      <span className="text-neutral-500 text-[10px]">ID: {cert.credentialId}</span>
                    )}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Customizable Sections */}
      {customSections && customSections.map((sec) => (
        <section
          key={sec.id}
          data-page-break-before={sec.pageBreakBefore ? 'true' : 'false'}
          className="resume-break-target mb-4"
        >
          <h2
            className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b"
            style={{ color: accent, borderColor: `${accent}40` }}
          >
            {renderEditable(sec.title, (val) => updateCustomSectionTitle(sec.id, val))}
          </h2>
          <div className="space-y-2 text-xs">
            {sec.items.map((item) => (
              <div
                key={item.id}
                data-page-break-before={item.pageBreakBefore ? 'true' : 'false'}
                className="resume-break-target"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-neutral-900 inline-flex items-center gap-1.5">
                    {renderEditable(item.title, (val) => updateCustomSectionItem(sec.id, item.id, 'title', val))}
                    {item.link && (
                      <a
                        href={formatUrl(item.link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-indigo-600 inline-flex items-center gap-0.5 text-[11px] font-normal"
                        title="Open link"
                      >
                        <span>Link</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60 no-print" />
                      </a>
                    )}
                  </span>
                  {item.date && (
                    <span className="text-neutral-500 tabular-nums italic">
                      {renderEditable(item.date, (val) => updateCustomSectionItem(sec.id, item.id, 'date', val))}
                    </span>
                  )}
                </div>
                {item.subtitle && (
                  <p className="text-neutral-700 font-medium">
                    {renderEditable(item.subtitle, (val) => updateCustomSectionItem(sec.id, item.id, 'subtitle', val))}
                  </p>
                )}
                {item.description && (
                  <p className="text-neutral-800 leading-snug mt-0.5">
                    {renderEditable(item.description, (val) => updateCustomSectionItem(sec.id, item.id, 'description', val), '', undefined, true)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );

  // -------------------------------------------------------------
  // THEME 2: PROFESSIONAL (Executive Accent Bar Underline)
  // -------------------------------------------------------------
  const renderProfessionalContent = () => (
    <div
      style={{
        paddingLeft: `${margins.left}in`,
        paddingRight: `${margins.right}in`,
        paddingTop: 0,
        paddingBottom: 0,
      }}
      className="w-[8.5in] bg-white text-slate-800 font-sans leading-relaxed box-border relative"
    >
      <header className="resume-break-target border-b-2 pb-4 mb-5" style={{ borderColor: accent }}>
        <div className="flex justify-between items-center gap-5">
          <div className="flex items-center gap-4">
            {renderProfilePhoto('w-22 h-22')}
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
                {renderEditable(contact.fullName || 'FULL NAME', (val) => updateContact('fullName', val))}
              </h1>
              {contact.jobTitle && (
                <p className="text-sm font-bold tracking-wide uppercase" style={{ color: accent }}>
                  {renderEditable(contact.jobTitle, (val) => updateContact('jobTitle', val))}
                </p>
              )}
            </div>
          </div>
          <div className="text-right text-xs text-slate-600 space-y-1">
            {contact.email && (
              <div className="flex items-center justify-end gap-1.5">
                <Mail className="w-3 h-3 text-slate-400" />
                <a
                  href={`mailto:${contact.email}`}
                  className="hover:underline hover:text-indigo-600 transition-colors"
                  title="Send email"
                >
                  {renderEditable(contact.email, (val) => updateContact('email', val))}
                </a>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center justify-end gap-1.5">
                <Phone className="w-3 h-3 text-slate-400" />
                <a
                  href={`tel:${cleanPhoneForTel(contact.phone)}`}
                  className="hover:underline hover:text-indigo-600 transition-colors"
                  title="Call phone"
                >
                  {renderEditable(contact.phone, (val) => updateContact('phone', val))}
                </a>
              </div>
            )}
            {contact.location && (
              <div className="flex items-center justify-end gap-1.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{renderEditable(contact.location, (val) => updateContact('location', val))}</span>
              </div>
            )}
            {contact.linkedinUrl && (
              <div className="flex items-center justify-end gap-1.5">
                <Linkedin className="w-3 h-3 text-slate-400" />
                <a
                  href={formatUrl(contact.linkedinUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-indigo-600 transition-colors inline-flex items-center gap-0.5"
                  title="Open LinkedIn"
                >
                  <span>{renderEditable(contact.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, ''), (val) => updateContact('linkedinUrl', val))}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60 no-print" />
                </a>
              </div>
            )}
            {contact.websiteUrl && (
              <div className="flex items-center justify-end gap-1.5">
                <Globe className="w-3 h-3 text-slate-400" />
                <a
                  href={formatUrl(contact.websiteUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-indigo-600 transition-colors inline-flex items-center gap-0.5"
                  title="Open Website"
                >
                  <span>{renderEditable(contact.websiteUrl.replace(/^https?:\/\//, ''), (val) => updateContact('websiteUrl', val))}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60 no-print" />
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {summary && summary.trim() && (
        <section className="resume-break-target mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: accent }} /> Executive Summary
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed">
            {renderEditable(summary, (val) => updateSummary(val), '', undefined, true)}
          </p>
        </section>
      )}

      {experience && experience.length > 0 && (
        <section className="resume-break-target mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-2.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: accent }} /> Professional Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div
                key={exp.id}
                data-page-break-before={exp.pageBreakBefore ? 'true' : 'false'}
                className="resume-break-target text-xs"
              >
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-slate-900 text-sm">
                    {renderEditable(exp.role, (val) => updateExperienceRole(exp.id, 'role', val))}
                  </span>
                  <span className="text-slate-500 font-medium tabular-nums">
                    {renderEditable(
                      `${exp.startDate || ''} – ${exp.current ? 'Present' : exp.endDate || ''}`,
                      (val) => {
                        const parts = val.split('–').map((p) => p.trim());
                        if (parts[0]) updateExperienceRole(exp.id, 'startDate', parts[0]);
                        if (parts[1]) updateExperienceRole(exp.id, 'endDate', parts[1]);
                      }
                    )}
                  </span>
                </div>
                <div className="font-semibold mb-1.5 flex justify-between items-center" style={{ color: accent }}>
                  <span className="inline-flex items-center gap-1.5">
                    {renderEditable(exp.company, (val) => updateExperienceRole(exp.id, 'company', val))}
                    {exp.companyUrl && (
                      <a
                        href={formatUrl(exp.companyUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-[11px] font-normal text-slate-500 hover:text-indigo-600 inline-flex items-center gap-0.5"
                        title="Visit company website"
                      >
                        <span>Website</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60 no-print" />
                      </a>
                    )}
                  </span>
                  {exp.location && (
                    <span className="text-slate-500 font-normal">
                      {renderEditable(exp.location, (val) => updateExperienceRole(exp.id, 'location', val))}
                    </span>
                  )}
                </div>
                <ul className="list-disc pl-4 space-y-1 text-slate-700">
                  {exp.bullets.map((b, i) => (
                    <li key={i} className="resume-break-target">{renderEditable(b, (val) => updateExperienceBullet(exp.id, i, val), '', undefined, true)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {skills && skills.length > 0 && (
        <section className="resume-break-target mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: accent }} /> Core Competencies
          </h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {skills.map((s) => (
              <div
                key={s.id}
                data-page-break-before={s.pageBreakBefore ? 'true' : 'false'}
                className="resume-break-target bg-slate-50 p-2 rounded border border-slate-100"
              >
                <span className="font-bold text-slate-900 block mb-0.5" style={{ color: accent }}>
                  {renderEditable(s.category, (val) => updateSkillCategory(s.id, val))}
                </span>
                <span className="text-slate-600 text-[11px] leading-tight block">
                  {renderEditable(s.items.join(', '), (val) => updateSkillItems(s.id, val))}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {education && education.length > 0 && (
        <section className="resume-break-target mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: accent }} /> Education
          </h2>
          <div className="space-y-2 text-xs">
            {education.map((edu) => (
              <div
                key={edu.id}
                data-page-break-before={edu.pageBreakBefore ? 'true' : 'false'}
                className="resume-break-target flex justify-between items-baseline"
              >
                <div>
                  <span className="font-bold text-slate-900">
                    {renderEditable(edu.degree, (val) => updateEducation(edu.id, 'degree', val))}
                  </span>
                  <span className="text-slate-600"> — {renderEditable(edu.school, (val) => updateEducation(edu.id, 'school', val))}</span>
                </div>
                <span className="text-slate-500 tabular-nums">
                  {renderEditable(edu.graduationYear, (val) => updateEducation(edu.id, 'graduationYear', val))}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section className="resume-break-target mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: accent }} /> Projects
          </h2>
          <div className="space-y-2.5 text-xs">
            {projects.map((proj) => (
              <div
                key={proj.id}
                data-page-break-before={proj.pageBreakBefore ? 'true' : 'false'}
                className="resume-break-target"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-slate-900 inline-flex items-center gap-1.5">
                    {renderEditable(proj.name, (val) => updateProject(proj.id, 'name', val))}
                    {proj.link && (
                      <a
                        href={formatUrl(proj.link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-[11px] font-normal text-indigo-600 inline-flex items-center gap-0.5"
                        title="View project"
                      >
                        <span>Live Demo</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60 no-print" />
                      </a>
                    )}
                  </span>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <span className="text-slate-500 italic">[{proj.technologies.join(', ')}]</span>
                  )}
                </div>
                <p className="text-slate-700 mt-0.5">
                  {renderEditable(proj.description, (val) => updateProject(proj.id, 'description', val), '', undefined, true)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {certifications && certifications.length > 0 && (
        <section className="resume-break-target mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: accent }} /> Certifications
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-700">
            {certifications.map((c) => (
              <div
                key={c.id}
                data-page-break-before={c.pageBreakBefore ? 'true' : 'false'}
                className="resume-break-target"
              >
                <span className="font-semibold text-slate-900">
                  {renderEditable(c.name, (val) => updateCertification(c.id, 'name', val))}
                </span>
                <span className="text-slate-500"> ({c.issuer})</span>
                {c.credentialId && (
                  <span className="ml-1 text-[10px] text-indigo-600">
                    {/^https?:\/\//i.test(c.credentialId) ? (
                      <a href={formatUrl(c.credentialId)} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        [Link]
                      </a>
                    ) : null}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Custom Sections */}
      {customSections && customSections.map((sec) => (
        <section
          key={sec.id}
          data-page-break-before={sec.pageBreakBefore ? 'true' : 'false'}
          className="resume-break-target mb-5"
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: accent }} />
            {renderEditable(sec.title, (val) => updateCustomSectionTitle(sec.id, val))}
          </h2>
          <div className="space-y-2 text-xs">
            {sec.items.map((item) => (
              <div
                key={item.id}
                data-page-break-before={item.pageBreakBefore ? 'true' : 'false'}
                className="resume-break-target"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-slate-900 inline-flex items-center gap-1.5">
                    {renderEditable(item.title, (val) => updateCustomSectionItem(sec.id, item.id, 'title', val))}
                    {item.link && (
                      <a
                        href={formatUrl(item.link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-indigo-600 inline-flex items-center gap-0.5 text-[11px] font-normal"
                        title="Open link"
                      >
                        <ExternalLink className="w-2.5 h-2.5 opacity-60 no-print" />
                      </a>
                    )}
                  </span>
                  {item.date && (
                    <span className="text-slate-500 tabular-nums italic">
                      {renderEditable(item.date, (val) => updateCustomSectionItem(sec.id, item.id, 'date', val))}
                    </span>
                  )}
                </div>
                {item.subtitle && (
                  <p className="text-slate-600 font-medium">
                    {renderEditable(item.subtitle, (val) => updateCustomSectionItem(sec.id, item.id, 'subtitle', val))}
                  </p>
                )}
                {item.description && (
                  <p className="text-slate-700 leading-snug mt-0.5">
                    {renderEditable(item.description, (val) => updateCustomSectionItem(sec.id, item.id, 'description', val), '', undefined, true)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );

  // -------------------------------------------------------------
  // THEME 3: CREATIVE (Two-Column Grid, Bold Serif, Split Header)
  // -------------------------------------------------------------
  const renderCreativeContent = () => (
    <div
      style={{
        paddingLeft: `${margins.left}in`,
        paddingRight: `${margins.right}in`,
        paddingTop: 0,
        paddingBottom: 0,
      }}
      className="w-[8.5in] bg-white text-slate-800 font-sans leading-relaxed box-border relative"
    >
      {/* Split-Background Header */}
      <header
        style={{
          marginLeft: `-${margins.left}in`,
          marginRight: `-${margins.right}in`,
          marginTop: 0,
        }}
        className="resume-break-target mb-6 flex flex-row items-stretch border-b border-slate-200 overflow-hidden shadow-xs"
      >
        {/* Left Split */}
        <div
          className="w-[34%] p-6 text-white flex flex-col justify-between relative shrink-0"
          style={{ backgroundColor: accent }}
        >
          <div className="flex items-center gap-4">
            {contact.showPhoto && contact.photoUrl ? (
              <div className="shrink-0 print:block">
                <img
                  src={contact.photoUrl}
                  alt={contact.fullName || 'Candidate Photo'}
                  referrerPolicy="no-referrer"
                  className={`w-20 h-20 object-cover ${getPhotoShapeClass()} shadow-md ring-2 ring-white/80`}
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white text-xl font-serif font-bold shadow-xs">
                {(contact.fullName || 'CV').charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/75 block">Curriculum Vitae</span>
              <span className="text-xs font-semibold text-white/95 truncate block">{contact.location || 'Creative'}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/20 text-[11px] space-y-1 text-white/90">
            {contact.email && (
              <div className="flex items-center gap-1.5 truncate">
                <Mail className="w-3 h-3 text-white/80 shrink-0" />
                <a href={`mailto:${contact.email}`} className="hover:underline truncate text-white" title="Send email">
                  {renderEditable(contact.email, (val) => updateContact('email', val))}
                </a>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-white/80 shrink-0" />
                <a href={`tel:${cleanPhoneForTel(contact.phone)}`} className="hover:underline text-white" title="Call phone">
                  {renderEditable(contact.phone, (val) => updateContact('phone', val))}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right Split */}
        <div className="w-[66%] p-6 bg-slate-50 flex flex-col justify-center">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900 mb-1 leading-tight">
            {renderEditable(contact.fullName || 'FULL NAME', (val) => updateContact('fullName', val))}
          </h1>
          {contact.jobTitle && (
            <p
              className="text-xs font-bold tracking-widest uppercase mb-3"
              style={{ color: accent }}
            >
              {renderEditable(contact.jobTitle, (val) => updateContact('jobTitle', val))}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
            {contact.linkedinUrl && (
              <a
                href={formatUrl(contact.linkedinUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:text-slate-900 inline-flex items-center gap-1 font-medium transition-colors"
                title="Open LinkedIn"
              >
                <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0" style={{ backgroundColor: accent }} />
                <Linkedin className="w-3 h-3 text-slate-500" />
                <span>{renderEditable(contact.linkedinUrl.replace(/^https?:\/\//, ''), (val) => updateContact('linkedinUrl', val))}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60 no-print" />
              </a>
            )}
            {contact.websiteUrl && (
              <a
                href={formatUrl(contact.websiteUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:text-slate-900 inline-flex items-center gap-1 font-medium transition-colors"
                title="Open Portfolio"
              >
                <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0" style={{ backgroundColor: accent }} />
                <Globe className="w-3 h-3 text-slate-500" />
                <span>{renderEditable(contact.websiteUrl.replace(/^https?:\/\//, ''), (val) => updateContact('websiteUrl', val))}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60 no-print" />
              </a>
            )}
            {contact.githubUrl && (
              <a
                href={formatUrl(contact.githubUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:text-slate-900 inline-flex items-center gap-1 font-medium transition-colors"
                title="Open GitHub"
              >
                <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0" style={{ backgroundColor: accent }} />
                <FolderGit2 className="w-3 h-3 text-slate-500" />
                <span>{renderEditable(contact.githubUrl.replace(/^https?:\/\//, ''), (val) => updateContact('githubUrl', val))}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60 no-print" />
              </a>
            )}
            {contact.location && (
              <div className="flex items-center gap-1 text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0" style={{ backgroundColor: accent }} />
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{renderEditable(contact.location, (val) => updateContact('location', val))}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Two-Column Grid Body */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Sidebar (Skills, Education, Certs) */}
        <aside className="col-span-4 space-y-5 pr-3 border-r border-slate-200/90 text-xs">
          {skills && skills.length > 0 && (
            <section className="resume-break-target">
              <h2
                className="font-serif font-bold text-sm tracking-tight flex items-center gap-1.5 pb-1 mb-2.5 border-b"
                style={{ color: accent, borderColor: `${accent}35` }}
              >
                <span className="w-2 h-2 rounded-full inline-block shrink-0 shadow-xs" style={{ backgroundColor: accent }} />
                <span>Skills & Expertise</span>
              </h2>
              <div className="space-y-2.5">
                {skills.map((s) => (
                  <div
                    key={s.id}
                    data-page-break-before={s.pageBreakBefore ? 'true' : 'false'}
                    className="resume-break-target"
                  >
                    <span className="font-bold text-slate-900 block mb-0.5">
                      {renderEditable(s.category, (val) => updateSkillCategory(s.id, val))}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {s.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200/70"
                        >
                          <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: accent }} />
                          <span>{item}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {education && education.length > 0 && (
            <section className="resume-break-target">
              <h2
                className="font-serif font-bold text-sm tracking-tight flex items-center gap-1.5 pb-1 mb-2.5 border-b"
                style={{ color: accent, borderColor: `${accent}35` }}
              >
                <span className="w-2 h-2 rounded-full inline-block shrink-0 shadow-xs" style={{ backgroundColor: accent }} />
                <span>Education</span>
              </h2>
              <div className="space-y-2.5">
                {education.map((edu) => (
                  <div
                    key={edu.id}
                    data-page-break-before={edu.pageBreakBefore ? 'true' : 'false'}
                    className="resume-break-target"
                  >
                    <span className="font-bold text-slate-900 block leading-tight">
                      {renderEditable(edu.degree, (val) => updateEducation(edu.id, 'degree', val))}
                    </span>
                    <span className="text-slate-600 block mt-0.5">
                      {renderEditable(edu.school, (val) => updateEducation(edu.id, 'school', val))}
                    </span>
                    <div className="flex justify-between items-center text-[11px] text-slate-500 mt-0.5">
                      <span className="tabular-nums">
                        {renderEditable(edu.graduationYear, (val) => updateEducation(edu.id, 'graduationYear', val))}
                      </span>
                      {edu.location && (
                        <span>{renderEditable(edu.location, (val) => updateEducation(edu.id, 'location', val))}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {certifications && certifications.length > 0 && (
            <section className="resume-break-target">
              <h2
                className="font-serif font-bold text-sm tracking-tight flex items-center gap-1.5 pb-1 mb-2.5 border-b"
                style={{ color: accent, borderColor: `${accent}35` }}
              >
                <span className="w-2 h-2 rounded-full inline-block shrink-0 shadow-xs" style={{ backgroundColor: accent }} />
                <span>Certifications</span>
              </h2>
              <div className="space-y-2">
                {certifications.map((cert) => (
                  <div
                    key={cert.id}
                    data-page-break-before={cert.pageBreakBefore ? 'true' : 'false'}
                    className="resume-break-target text-xs"
                  >
                    <span className="font-semibold text-slate-900 block leading-snug">
                      {renderEditable(cert.name, (val) => updateCertification(cert.id, 'name', val))}
                    </span>
                    <div className="text-[11px] text-slate-600 flex justify-between items-baseline mt-0.5">
                      <span>{renderEditable(cert.issuer, (val) => updateCertification(cert.id, 'issuer', val))}</span>
                      {cert.date && <span className="text-slate-500 tabular-nums">{cert.date}</span>}
                    </div>
                    {cert.credentialId && (
                      <div className="mt-0.5">
                        {/^https?:\/\//i.test(cert.credentialId.trim()) ? (
                          <a
                            href={formatUrl(cert.credentialId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline inline-flex items-center gap-0.5 text-[10px]"
                          >
                            <span>Verify Credential</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60 no-print" />
                          </a>
                        ) : (
                          <span className="text-slate-500 text-[10px]">ID: {cert.credentialId}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>

        {/* RIGHT COLUMN: Main Content */}
        <main className="col-span-8 space-y-5 text-xs">
          {summary && summary.trim() && (
            <section className="resume-break-target">
              <h2
                className="font-serif font-bold text-base tracking-tight flex items-center gap-2 pb-1 mb-2 border-b-2"
                style={{ color: accent, borderColor: `${accent}35` }}
              >
                <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-xs" style={{ backgroundColor: accent }} />
                <span>Executive Summary</span>
              </h2>
              <p className="text-slate-700 leading-relaxed text-xs">
                {renderEditable(summary, (val) => updateSummary(val), '', undefined, true)}
              </p>
            </section>
          )}

          {experience && experience.length > 0 && (
            <section className="resume-break-target">
              <h2
                className="font-serif font-bold text-base tracking-tight flex items-center gap-2 pb-1 mb-3 border-b-2"
                style={{ color: accent, borderColor: `${accent}35` }}
              >
                <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-xs" style={{ backgroundColor: accent }} />
                <span>Work Experience</span>
              </h2>
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div
                    key={exp.id}
                    data-page-break-before={exp.pageBreakBefore ? 'true' : 'false'}
                    className="resume-break-target"
                  >
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-bold text-slate-900 text-[13px]">
                        {renderEditable(exp.role, (val) => updateExperienceRole(exp.id, 'role', val))}
                      </span>
                      <span className="text-slate-500 tabular-nums font-medium text-[11px]">
                        {renderEditable(`${exp.startDate || ''} – ${exp.current ? 'Present' : exp.endDate || ''}`, (val) => {
                          const parts = val.split('–').map((p) => p.trim());
                          if (parts[0]) updateExperienceRole(exp.id, 'startDate', parts[0]);
                          if (parts[1]) updateExperienceRole(exp.id, 'endDate', parts[1]);
                        })}
                      </span>
                    </div>
                    <div className="text-slate-600 font-medium mb-1.5 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5">
                        {renderEditable(exp.company, (val) => updateExperienceRole(exp.id, 'company', val))}
                        {exp.companyUrl && (
                          <a
                            href={formatUrl(exp.companyUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-[11px] font-normal text-indigo-600 inline-flex items-center gap-0.5"
                            title="Visit website"
                          >
                            <span>Website</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60 no-print" />
                          </a>
                        )}
                      </span>
                      {exp.location && <span>· {renderEditable(exp.location, (val) => updateExperienceRole(exp.id, 'location', val))}</span>}
                    </div>

                    <ul className="space-y-1.5 text-slate-700">
                      {exp.bullets.map((b, i) => (
                        <li key={i} className="resume-break-target flex items-start gap-2">
                          <span
                            className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                            style={{ backgroundColor: accent }}
                            aria-hidden="true"
                          />
                          <span className="flex-1">
                            {renderEditable(b, (val) => updateExperienceBullet(exp.id, i, val), '', undefined, true)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {projects && projects.length > 0 && (
            <section className="resume-break-target">
              <h2
                className="font-serif font-bold text-base tracking-tight flex items-center gap-2 pb-1 mb-2.5 border-b-2"
                style={{ color: accent, borderColor: `${accent}35` }}
              >
                <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-xs" style={{ backgroundColor: accent }} />
                <span>Selected Projects</span>
              </h2>
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    data-page-break-before={proj.pageBreakBefore ? 'true' : 'false'}
                    className="resume-break-target"
                  >
                    <div className="flex items-baseline justify-between mb-0.5">
                      <span className="font-bold text-slate-900 inline-flex items-center gap-1.5">
                        {renderEditable(proj.name, (val) => updateProject(proj.id, 'name', val))}
                        {proj.link && (
                          <a
                            href={formatUrl(proj.link)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-indigo-600 inline-flex items-center gap-0.5 text-[11px] font-normal"
                            title="View demo"
                          >
                            <span>Live Demo</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60 no-print" />
                          </a>
                        )}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-snug mb-1">
                      {renderEditable(proj.description, (val) => updateProject(proj.id, 'description', val), '', undefined, true)}
                    </p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-600">
                        <span className="font-semibold text-slate-700">Tech:</span>
                        {proj.technologies.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.2 rounded-xs bg-slate-100 text-slate-700 font-medium border border-slate-200"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {customSections && customSections.map((sec) => (
            <section
              key={sec.id}
              data-page-break-before={sec.pageBreakBefore ? 'true' : 'false'}
              className="resume-break-target"
            >
              <h2
                className="font-serif font-bold text-base tracking-tight flex items-center gap-2 pb-1 mb-2 border-b-2"
                style={{ color: accent, borderColor: `${accent}35` }}
              >
                <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-xs" style={{ backgroundColor: accent }} />
                <span>{renderEditable(sec.title, (val) => updateCustomSectionTitle(sec.id, val))}</span>
              </h2>
              <div className="space-y-2">
                {sec.items.map((item) => (
                  <div
                    key={item.id}
                    data-page-break-before={item.pageBreakBefore ? 'true' : 'false'}
                    className="resume-break-target"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="font-bold text-slate-900 inline-flex items-center gap-1.5">
                        {renderEditable(item.title, (val) => updateCustomSectionItem(sec.id, item.id, 'title', val))}
                        {item.link && (
                          <a
                            href={formatUrl(item.link)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-indigo-600 inline-flex items-center gap-0.5 text-[11px] font-normal"
                            title="Open link"
                          >
                            <ExternalLink className="w-2.5 h-2.5 opacity-60 no-print" />
                          </a>
                        )}
                      </span>
                      {item.date && (
                        <span className="text-slate-500 tabular-nums italic text-[11px]">
                          {renderEditable(item.date, (val) => updateCustomSectionItem(sec.id, item.id, 'date', val))}
                        </span>
                      )}
                    </div>
                    {item.subtitle && (
                      <p className="text-slate-600 font-medium text-[11px]">
                        {renderEditable(item.subtitle, (val) => updateCustomSectionItem(sec.id, item.id, 'subtitle', val))}
                      </p>
                    )}
                    {item.description && (
                      <p className="text-slate-700 leading-snug mt-0.5">
                        {renderEditable(item.description, (val) => updateCustomSectionItem(sec.id, item.id, 'description', val), '', undefined, true)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // THEME 4: MODERN (Rich Header Banner, Full Bleed)
  // -------------------------------------------------------------
  const renderModernContent = () => (
    <div
      style={{
        paddingLeft: `${margins.left}in`,
        paddingRight: `${margins.right}in`,
        paddingTop: 0,
        paddingBottom: 0,
      }}
      className="w-[8.5in] bg-white text-slate-800 font-sans leading-relaxed box-border relative"
    >
      {/* Top Header Banner */}
      <div
        style={{
          marginLeft: `-${margins.left}in`,
          marginRight: `-${margins.right}in`,
          marginTop: 0,
          padding: `${margins.top}in ${margins.right}in`,
          backgroundColor: accent,
        }}
        className="resume-break-target mb-6 text-white flex items-center justify-between gap-6"
      >
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            {renderEditable(contact.fullName || 'FULL NAME', (val) => updateContact('fullName', val))}
          </h1>
          {contact.jobTitle && (
            <p className="text-xs font-medium tracking-wider uppercase mb-3 opacity-95">
              {renderEditable(contact.jobTitle, (val) => updateContact('jobTitle', val))}
            </p>
          )}
          <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-xs opacity-95">
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="hover:underline transition-colors hover:text-white"
                title="Send email"
              >
                {renderEditable(contact.email, (val) => updateContact('email', val))}
              </a>
            )}
            {contact.phone && (
              <a
                href={`tel:${cleanPhoneForTel(contact.phone)}`}
                className="hover:underline transition-colors hover:text-white"
                title="Call phone"
              >
                · {renderEditable(contact.phone, (val) => updateContact('phone', val))}
              </a>
            )}
            {contact.location && (
              <span>· {renderEditable(contact.location, (val) => updateContact('location', val))}</span>
            )}
            {contact.linkedinUrl && (
              <a
                href={formatUrl(contact.linkedinUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline inline-flex items-center gap-0.5 hover:text-white"
                title="Open LinkedIn"
              >
                · {renderEditable(contact.linkedinUrl.replace(/^https?:\/\//, ''), (val) => updateContact('linkedinUrl', val))}
                <ExternalLink className="w-2.5 h-2.5 opacity-70 no-print" />
              </a>
            )}
            {contact.websiteUrl && (
              <a
                href={formatUrl(contact.websiteUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline inline-flex items-center gap-0.5 hover:text-white"
                title="Open Website"
              >
                · {renderEditable(contact.websiteUrl.replace(/^https?:\/\//, ''), (val) => updateContact('websiteUrl', val))}
                <ExternalLink className="w-2.5 h-2.5 opacity-70 no-print" />
              </a>
            )}
            {contact.githubUrl && (
              <a
                href={formatUrl(contact.githubUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline inline-flex items-center gap-0.5 hover:text-white"
                title="Open GitHub"
              >
                · {renderEditable(contact.githubUrl.replace(/^https?:\/\//, ''), (val) => updateContact('githubUrl', val))}
                <ExternalLink className="w-2.5 h-2.5 opacity-70 no-print" />
              </a>
            )}
          </div>
        </div>
        {renderProfilePhoto('w-22 h-22')}
      </div>

      {summary && summary.trim() && (
        <section className="resume-break-target mb-5">
          <h2
            className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-1.5"
            style={{ color: accent, borderColor: `${accent}30` }}
          >
            About Me / Summary
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed">
            {renderEditable(summary, (val) => updateSummary(val), '', undefined, true)}
          </p>
        </section>
      )}

      {experience && experience.length > 0 && (
        <section className="resume-break-target mb-5">
          <h2
            className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2.5"
            style={{ color: accent, borderColor: `${accent}30` }}
          >
            Experience
          </h2>
          <div className="space-y-3.5">
            {experience.map((exp) => (
              <div
                key={exp.id}
                data-page-break-before={exp.pageBreakBefore ? 'true' : 'false'}
                className="resume-break-target text-xs"
              >
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-slate-900 text-[13px]">
                    {renderEditable(exp.role, (val) => updateExperienceRole(exp.id, 'role', val))}
                  </span>
                  <span className="text-slate-500 tabular-nums">
                    {renderEditable(`${exp.startDate || ''} – ${exp.current ? 'Present' : exp.endDate || ''}`, (val) => {
                      const parts = val.split('–').map((p) => p.trim());
                      if (parts[0]) updateExperienceRole(exp.id, 'startDate', parts[0]);
                      if (parts[1]) updateExperienceRole(exp.id, 'endDate', parts[1]);
                    })}
                  </span>
                </div>
                <div className="text-slate-600 font-medium mb-1 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5">
                    {renderEditable(exp.company, (val) => updateExperienceRole(exp.id, 'company', val))}
                    {exp.companyUrl && (
                      <a
                        href={formatUrl(exp.companyUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-[11px] font-normal text-indigo-600 inline-flex items-center gap-0.5"
                        title="Visit company website"
                      >
                        <span>Website</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60 no-print" />
                      </a>
                    )}
                  </span>
                  {exp.location && <span> · {renderEditable(exp.location, (val) => updateExperienceRole(exp.id, 'location', val))}</span>}
                </div>
                <ul className="list-disc pl-4 space-y-1 text-slate-700">
                  {exp.bullets.map((b, i) => (
                    <li key={i} className="resume-break-target">{renderEditable(b, (val) => updateExperienceBullet(exp.id, i, val), '', undefined, true)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {skills && skills.length > 0 && (
        <section className="resume-break-target mb-5">
          <h2
            className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2"
            style={{ color: accent, borderColor: `${accent}30` }}
          >
            Skills & Expertise
          </h2>
          <div className="space-y-1.5 text-xs">
            {skills.map((s) => (
              <div
                key={s.id}
                data-page-break-before={s.pageBreakBefore ? 'true' : 'false'}
                className="resume-break-target flex flex-wrap items-baseline gap-1.5"
              >
                <span className="font-bold text-slate-800">
                  {renderEditable(s.category, (val) => updateSkillCategory(s.id, val))}:
                </span>
                <span className="text-slate-600">
                  {renderEditable(s.items.join(', '), (val) => updateSkillItems(s.id, val))}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {education && education.length > 0 && (
        <section className="resume-break-target mb-5">
          <h2
            className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2"
            style={{ color: accent, borderColor: `${accent}30` }}
          >
            Education
          </h2>
          <div className="space-y-2 text-xs">
            {education.map((edu) => (
              <div
                key={edu.id}
                data-page-break-before={edu.pageBreakBefore ? 'true' : 'false'}
                className="resume-break-target flex justify-between items-baseline"
              >
                <div>
                  <span className="font-bold text-slate-900">
                    {renderEditable(edu.degree, (val) => updateEducation(edu.id, 'degree', val))}
                  </span>
                  <span className="text-slate-600"> — {renderEditable(edu.school, (val) => updateEducation(edu.id, 'school', val))}</span>
                </div>
                <span className="text-slate-500 tabular-nums">
                  {renderEditable(edu.graduationYear, (val) => updateEducation(edu.id, 'graduationYear', val))}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section className="resume-break-target mb-4">
          <h2
            className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2"
            style={{ color: accent, borderColor: `${accent}30` }}
          >
            Selected Projects
          </h2>
          <div className="space-y-2.5 text-xs">
            {projects.map((p) => (
              <div
                key={p.id}
                data-page-break-before={p.pageBreakBefore ? 'true' : 'false'}
                className="resume-break-target"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-slate-900 inline-flex items-center gap-1.5">
                    {renderEditable(p.name, (val) => updateProject(p.id, 'name', val))}
                    {p.link && (
                      <a
                        href={formatUrl(p.link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-[11px] font-normal text-indigo-600 inline-flex items-center gap-0.5"
                        title="View demo"
                      >
                        <span>Demo</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60 no-print" />
                      </a>
                    )}
                  </span>
                  {p.technologies && p.technologies.length > 0 && (
                    <span className="text-slate-500 italic">[{p.technologies.join(', ')}]</span>
                  )}
                </div>
                <p className="text-slate-700 mt-0.5">
                  {renderEditable(p.description, (val) => updateProject(p.id, 'description', val), '', undefined, true)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <section className="resume-break-target mb-4">
          <h2
            className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2"
            style={{ color: accent, borderColor: `${accent}30` }}
          >
            Certifications
          </h2>
          <div className="space-y-1.5 text-xs text-slate-700">
            {certifications.map((c) => (
              <div
                key={c.id}
                data-page-break-before={c.pageBreakBefore ? 'true' : 'false'}
                className="resume-break-target flex justify-between items-baseline"
              >
                <div>
                  <span className="font-bold text-slate-900">
                    {renderEditable(c.name, (val) => updateCertification(c.id, 'name', val))}
                  </span>
                  <span className="text-slate-600"> — {renderEditable(c.issuer, (val) => updateCertification(c.id, 'issuer', val))}</span>
                  {c.credentialId && (
                    <span className="ml-1.5">
                      {/^https?:\/\//i.test(c.credentialId) ? (
                        <a href={formatUrl(c.credentialId)} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                          [Verification]
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[10px]">({c.credentialId})</span>
                      )}
                    </span>
                  )}
                </div>
                {c.date && <span className="text-slate-500 tabular-nums italic">{c.date}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Custom Sections */}
      {customSections && customSections.map((sec) => (
        <section
          key={sec.id}
          data-page-break-before={sec.pageBreakBefore ? 'true' : 'false'}
          className="resume-break-target mb-4"
        >
          <h2
            className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2"
            style={{ color: accent, borderColor: `${accent}30` }}
          >
            {renderEditable(sec.title, (val) => updateCustomSectionTitle(sec.id, val))}
          </h2>
          <div className="space-y-2 text-xs">
            {sec.items.map((item) => (
              <div
                key={item.id}
                data-page-break-before={item.pageBreakBefore ? 'true' : 'false'}
                className="resume-break-target"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-slate-900 inline-flex items-center gap-1.5">
                    {renderEditable(item.title, (val) => updateCustomSectionItem(sec.id, item.id, 'title', val))}
                    {item.link && (
                      <a
                        href={formatUrl(item.link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-indigo-600 inline-flex items-center gap-0.5 text-[11px] font-normal"
                        title="Open link"
                      >
                        <ExternalLink className="w-2.5 h-2.5 opacity-60 no-print" />
                      </a>
                    )}
                  </span>
                  {item.date && (
                    <span className="text-slate-500 tabular-nums italic">
                      {renderEditable(item.date, (val) => updateCustomSectionItem(sec.id, item.id, 'date', val))}
                    </span>
                  )}
                </div>
                {item.subtitle && (
                  <p className="text-slate-600 font-medium">
                    {renderEditable(item.subtitle, (val) => updateCustomSectionItem(sec.id, item.id, 'subtitle', val))}
                  </p>
                )}
                {item.description && (
                  <p className="text-slate-700 leading-snug mt-0.5">
                    {renderEditable(item.description, (val) => updateCustomSectionItem(sec.id, item.id, 'description', val), '', undefined, true)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );

  // Helper to render the active theme content
  const renderThemeBody = () => {
    switch (theme) {
      case 'professional':
        return renderProfessionalContent();
      case 'creative':
        return renderCreativeContent();
      case 'modern':
        return renderModernContent();
      case 'ats-pure':
      default:
        return renderAtsPureContent();
    }
  };

  return (
    <div
      id="resume-document-root"
      style={{
        transform: `scale(${zoom})`,
        transformOrigin: 'top center',
      }}
      className="flex flex-col items-center transition-transform duration-150 print:m-0 print:p-0 print:transform-none select-text"
    >
      {isLiveEditMode && <LiveEditBadge />}

      {/* Render discrete physical paper sheets for Page 1, Page 2, Page 3, etc. */}
      {Array.from({ length: totalPages }).map((_, pageIdx) => {
        const isFirstPage = pageIdx === 0;
        const isLastPage = pageIdx === totalPages - 1;
        const sliceStartY = breakpoints[pageIdx] || 0;
        const sliceEndY = breakpoints[pageIdx + 1] || sliceStartY;
        const sliceHeight = Math.max(0, sliceEndY - sliceStartY);
        const isPage0FullBleed = isFirstPage && (theme === 'creative' || theme === 'modern');
        const viewportTop = isPage0FullBleed ? 0 : topPx;
        const maxViewportHeight = isPage0FullBleed
          ? Math.max(300, PAGE_HEIGHT_PX - bottomPx)
          : printableHeightPx;

        return (
          <React.Fragment key={`page-${pageIdx}`}>
            {/* Top Paper Sheet Header (Visible on live canvas, hidden on print) */}
            <div className="w-[8.5in] mb-2 px-1 flex items-center justify-between text-xs text-slate-400 font-mono no-print">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-xs" />
                  Page {pageIdx + 1} of {totalPages}
                </span>
                <span className="text-[11px] text-slate-500">· US Letter (8.5" × 11")</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Margins: {margins.top}" T · {margins.bottom}" B · {margins.left}" L · {margins.right}" R
              </div>
            </div>

            {/* The Physical Paper Sheet (8.5in x 11in) */}
            <div
              className="resume-page-sheet bg-white text-neutral-900 shadow-2xl border border-slate-300/80 mb-6 transition-all duration-150 relative overflow-hidden print:m-0 print:border-none print:shadow-none"
              data-page-number={pageIdx + 1}
              style={{
                width: '8.5in',
                height: '11in',
                minWidth: '8.5in',
                minHeight: '11in',
                maxWidth: '8.5in',
                maxHeight: '11in',
                backgroundColor: '#ffffff',
              }}
            >
              {/* Printable Viewport Window (Strictly clipped to sliceHeight so no overflow enters the margin or crops) */}
              <div
                className="w-[8.5in] relative"
                style={{
                  position: 'absolute',
                  top: `${viewportTop}px`,
                  left: 0,
                  width: '8.5in',
                  height: `${sliceHeight}px`,
                  maxHeight: `${maxViewportHeight}px`,
                  overflow: 'hidden',
                }}
              >
                <div
                  className="w-[8.5in] relative"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '8.5in',
                    transform: `translateY(-${sliceStartY}px)`,
                    transformOrigin: 'top left',
                  }}
                >
                  {renderThemeBody()}
                </div>
              </div>

              {/* Optional Margin Guides (Subtle dashed outline showing printable bounds) */}
              {showMarginGuides && (
                <div
                  className="absolute pointer-events-none border border-dashed border-sky-400/50 z-20 no-print"
                  style={{
                    top: `${topPx}px`,
                    bottom: `${bottomPx}px`,
                    left: `${leftPx}px`,
                    right: `${rightPx}px`,
                  }}
                >
                  <span className="absolute -top-3.5 left-1 text-[9px] font-mono text-sky-500/80 bg-white/90 px-1 rounded-xs">
                    Printable Area ({margins.top}" margin)
                  </span>
                </div>
              )}

              {/* Resume Page Footer (Rendered on multi-page resumes, omitted when only one page long) */}
              {totalPages > 1 && (
                <footer
                  className="resume-page-footer absolute bottom-0 flex items-center text-[10px] text-neutral-400 font-sans select-none pointer-events-none"
                  style={{
                    left: `${leftPx}px`,
                    right: `${rightPx}px`,
                    height: `${bottomPx}px`,
                    zIndex: 10,
                  }}
                >
                  {contact.fullName && (
                    <span className="truncate max-w-[280px] text-neutral-400 font-medium">
                      {contact.fullName}
                    </span>
                  )}
                  <span className={`tabular-nums font-medium text-neutral-500 ${contact.fullName ? 'ml-auto' : 'mx-auto'}`}>
                    Page {pageIdx + 1} of {totalPages}
                  </span>
                </footer>
              )}
            </div>

            {/* Page Break Banner between sheets */}
            {!isLastPage && (
              <div className="w-[8.5in] my-4 flex items-center justify-center gap-3 no-print select-none">
                <div className="h-px bg-slate-800 flex-1" />
                <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span>Page Break — Page {pageIdx + 1} ends, Page {pageIdx + 2} begins</span>
                </div>
                <div className="h-px bg-slate-800 flex-1" />
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* Hidden Offscreen Measurer Element */}
      <div
        ref={measurerRef}
        aria-hidden="true"
        className="no-print pointer-events-none relative"
        style={{
          position: 'absolute',
          top: 0,
          left: '-9999px',
          width: '8.5in',
          visibility: 'hidden',
          opacity: 0,
        }}
      >
        {renderThemeBody()}
      </div>
    </div>
  );
};
