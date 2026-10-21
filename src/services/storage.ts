import type { ResumeData } from '../types/resume';
import { SAMPLE_RESUMES } from '../data/sampleResumes';

const STORAGE_KEY_RESUMES = 'resumetric_resumes_v1';
const STORAGE_KEY_ACTIVE_ID = 'resumetric_active_resume_id_v1';
const STORAGE_KEY_USER = 'resumetric_user_session_v1';

export interface UserSession {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isCloudSynced: boolean;
  lastSyncedAt?: number;
}

export function loadAllResumes(): ResumeData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESUMES);
    if (!raw) {
      saveAllResumes(SAMPLE_RESUMES);
      return SAMPLE_RESUMES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveAllResumes(SAMPLE_RESUMES);
      return SAMPLE_RESUMES;
    }
    // Sanitize and ensure custom sections and arrays exist
    const sanitized = parsed.map((r) => {
      // If sample software engineer lacks customSections or companyUrl, upgrade it
      if (r.id === 'resume-software-eng' && (!r.customSections || r.customSections.length === 0)) {
        return {
          ...SAMPLE_RESUMES[0],
          ...r,
          experience: r.experience?.map((exp: any, idx: number) => ({
            ...exp,
            companyUrl: exp.companyUrl || SAMPLE_RESUMES[0].experience[idx]?.companyUrl || '',
          })) || SAMPLE_RESUMES[0].experience,
          customSections: SAMPLE_RESUMES[0].customSections,
        };
      }
      return {
        ...r,
        projects: r.projects || [],
        certifications: r.certifications || [],
        customSections: r.customSections || [],
      };
    });
    return sanitized;
  } catch (error) {
    console.error('Error loading resumes from localStorage:', error);
    return SAMPLE_RESUMES;
  }
}

export function saveAllResumes(resumes: ResumeData[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_RESUMES, JSON.stringify(resumes));
    // If user is cloud signed-in, mark last sync time
    const user = getSavedUserSession();
    if (user && user.isCloudSynced) {
      user.lastSyncedAt = Date.now();
      saveUserSession(user);
    }
  } catch (error) {
    console.error('Error saving resumes to localStorage:', error);
  }
}

export function getActiveResumeId(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (id) return id;
    const resumes = loadAllResumes();
    return resumes[0]?.id || 'resume-software-eng';
  } catch {
    return 'resume-software-eng';
  }
}

export function setActiveResumeId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  } catch (error) {
    console.error('Error setting active resume ID:', error);
  }
}

export function saveSingleResume(resume: ResumeData): ResumeData[] {
  const all = loadAllResumes();
  const index = all.findIndex((r) => r.id === resume.id);
  const updatedResume = { ...resume, lastSavedAt: Date.now() };

  if (index >= 0) {
    all[index] = updatedResume;
  } else {
    all.unshift(updatedResume);
  }

  saveAllResumes(all);
  setActiveResumeId(updatedResume.id);
  return all;
}

export function deleteResume(id: string): ResumeData[] {
  const all = loadAllResumes().filter((r) => r.id !== id);
  saveAllResumes(all);
  if (getActiveResumeId() === id) {
    if (all.length > 0) {
      setActiveResumeId(all[0].id);
    }
  }
  return all;
}

export function duplicateResume(id: string): { updatedList: ResumeData[]; newResume: ResumeData } {
  const all = loadAllResumes();
  const target = all.find((r) => r.id === id);
  const base = target || all[0] || SAMPLE_RESUMES[0];

  const newResume: ResumeData = {
    ...JSON.parse(JSON.stringify(base)),
    id: `resume-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title: `${base.title} (Copy)`,
    lastSavedAt: Date.now(),
  };

  all.unshift(newResume);
  saveAllResumes(all);
  setActiveResumeId(newResume.id);
  return { updatedList: all, newResume };
}

export function createBlankResume(title = 'Untitled Resume'): { updatedList: ResumeData[]; newResume: ResumeData } {
  const all = loadAllResumes();
  const newResume: ResumeData = {
    id: `resume-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title,
    language: 'en',
    theme: 'ats-pure',
    lastSavedAt: Date.now(),
    atsScore: 0,
    contact: {
      fullName: 'Your Full Name',
      jobTitle: 'Target Job Title',
      email: 'your.name@example.com',
      phone: '+1 (555) 000-0000',
      location: 'City, State',
      linkedinUrl: '',
      websiteUrl: '',
    },
    summary: 'Write a compelling 2-3 sentence overview of your career accomplishments and core value proposition.',
    experience: [
      {
        id: `exp-${Date.now()}`,
        role: 'Job Role / Title',
        company: 'Company Name',
        location: 'City, State',
        startDate: 'Jan 2023',
        endDate: '',
        current: true,
        bullets: [
          'Spearheaded key initiative that improved performance by 25% across the organization.',
          'Collaborated with cross-functional teams to deliver on-time projects under budget.',
        ],
      },
    ],
    education: [
      {
        id: `edu-${Date.now()}`,
        degree: 'Bachelor of Science / Arts in Field',
        school: 'University / College Name',
        location: 'City, State',
        graduationYear: '2022',
      },
    ],
    skills: [
      {
        id: `skill-${Date.now()}`,
        category: 'Core Competencies',
        items: ['Project Management', 'Data Analysis', 'Communication', 'Strategic Planning'],
      },
    ],
    accentColor: '#2563EB',
    projects: [],
    certifications: [],
    customSections: [],
  };

  all.unshift(newResume);
  saveAllResumes(all);
  setActiveResumeId(newResume.id);
  return { updatedList: all, newResume };
}

export function getSavedUserSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveUserSession(user: UserSession | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  } catch (error) {
    console.error('Error saving user session:', error);
  }
}
