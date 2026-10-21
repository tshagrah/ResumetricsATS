# Creative Theme Distinction & Architectural Layout

Establish a visually striking, distinct **Creative Theme** with a two-column asymmetrical layout, bold typographic headers, and modern geometric accents—providing clear contrast to the full-bleed banner style of the **Modern Theme**.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The user confirmed the visual element preference: **Bold typographic section headers with modern geometric accents**.
> The plan creates a dedicated rendering branch in `ResumeDocument.tsx` specifically for the `creative` theme, ending the shared layout with `modern`.

- **Confirmed Decision**: Creative theme utilizes **bold typographic section headers with modern geometric accents** (sharp geometric accent badges, high-contrast headings, and structured spatial composition).
- **Layout Architecture**: 
  - **Modern Theme**: Single-column linear layout with a solid full-width accent banner at the top.
  - **Creative Theme**: Two-column asymmetrical architectural layout (left rail for candidate photo, contact links, skills & certifications; right area for executive summary, work experience, projects, education, and custom sections).

---

## 1. Overview & Core Concept

- **What It Does**: Separates the `creative` theme into its own dedicated renderer in `ResumeDocument.tsx`. When users switch to **Creative**, the resume dynamically displays an editorial 2-column layout with geometric accent anchors, while preserving all interactive capabilities (clickable company links, email mailto, live canvas editing, and print/export accuracy).
- **Target Audience / Persona**: Design leads, software architects, creative directors, tech founders, and marketing professionals targeting modern tech companies, creative agencies, and startups.
- **Key Value**: Delivers genuine visual diversity between the 4 themes (**Pure ATS**, **Professional**, **Modern**, and **Creative**) rather than superficial color swaps.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Theme Selection**: User clicks **Creative** on the `PreviewToolbar` theme switcher.
2. **Instant Re-layout**: The preview smoothly transforms from a single-column top banner (Modern) into an asymmetrical two-column layout.
3. **Sidebar Presentation (Left Column ~32%)**:
   - High-contrast candidate photo with geometric framing matching the chosen `photoShape` (circle, rounded, or square).
   - Contact details (email, phone, location, LinkedIn, GitHub, portfolio) with micro geometric indicators.
   - Skills grouped cleanly with typography and tabular categorization.
   - Certifications list with direct verification links.
4. **Main Content Stream (Right Column ~68%)**:
   - Prominent candidate name and uppercase job title with letter-spaced typography.
   - Section headers rendered with **modern geometric accents** (solid accent geometric marker `w-2 h-2`, crisp hairline geometric divider).
   - Work experience entries with role, date, company name, and external website links.
   - Featured projects with clickable live demo URLs.
   - Customizable user sections and education.
5. **Full Live-Edit Support**: All text nodes remain directly editable on the canvas when "Live Edit" is turned on.

### Visual Identity & Theme Tokens
- **Canvas Base**: Clean white sheet (`bg-white`), dark slate typography (`text-slate-900`, `text-slate-700`).
- **Sidebar Surface**: Subtle cool neutral background (`bg-slate-50/80` or `bg-zinc-50`) bordered with a refined hairline separator (`border-r border-slate-200/80`).
- **Geometric Accents**: Sharp geometric squares and subtle geometric rules keyed to the user's selected `accentColor`.
- **Typography**: Clean high-contrast sans-serif hierarchy (`tracking-tight` on titles, `tracking-wider` on uppercase headers, `tabular-nums` on all dates).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dedicated Two-Column Structure vs. Parameterized Single-Column**
  - *Chosen Approach*: Implement a dedicated `theme === 'creative'` branch with a responsive two-column grid (`grid grid-cols-12` or `flex gap-8`).
  - *Why*: A true two-column architecture creates an unmistakable visual distinction that modern creative and technical recruiters look for, avoiding the feeling of minor padding tweaks.
- **Decision 2: Section Header Accents**
  - *Chosen Approach*: Geometric square marker (`inline-block w-2.5 h-2.5 rounded-xs mr-2`) styled with `accentColor`, followed by bold uppercase tracking and a delicate hairline rule.
  - *Why*: Directly fulfills the user's selected choice without cluttering the page with AI-style pills or distracting borders.
- **Decision 3: Zero Impact on Export & Live Editing**
  - *Chosen Approach*: Reuse existing `renderEditable`, `cleanPhoneForTel`, and `formatUrl` helpers so PDF print, DOCX export, and inline editing work identically without duplication.

---

## 4. Technical Architecture & Data Strategy

### Layout Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        RESUME DOCUMENT (8.5" x 11")                    │
│                                                                        │
│  LEFT SIDEBAR (~32% Width)              MAIN CONTENT (~68% Width)      │
│  ┌──────────────────────────────┐       ┌────────────────────────────┐ │
│  │ [ Candidate Profile Photo ]  │       │ Candidate Full Name        │ │
│  │                              │       │ Job Title (Letterspaced)   │ │
│  ├──────────────────────────────┤       ├────────────────────────────┤ │
│  │ ■ CONTACT DETAILS            │       │ ■ PROFESSIONAL SUMMARY     │ │
│  │   • Email (mailto)           │       │   Executive narrative copy │ │
│  │   • Phone (tel:)             │       ├────────────────────────────┤ │
│  │   • LinkedIn / Portfolio     │       │ ■ WORK EXPERIENCE          │ │
│  ├──────────────────────────────┤       │   Role — Company [Website] │ │
│  │ ■ CORE SKILLS                │       │   Date · Bullet achievements││
│  │   Category: items            │       ├────────────────────────────┤ │
│  ├──────────────────────────────┤       │ ■ SELECTED PROJECTS        │ │
│  │ ■ CERTIFICATIONS             │       │   Project Name [Live Demo] │ │
│  │   Issuer · Date · Verify     │       ├────────────────────────────┤ │
│  └──────────────────────────────┘       │ ■ EDUCATION & CUSTOM SECS  │ │
│                                         └────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### State & Component Flow
- **`src/types/resume.ts`**: `ResumeTheme` already supports `'ats-pure' | 'professional' | 'modern' | 'creative'`.
- **`src/components/ResumePreview/ResumeDocument.tsx`**:
  - Keep lines for `ats-pure` (Pure ATS single-column).
  - Keep lines for `professional` (Executive header with accent line).
  - Split `modern` and `creative`:
    - `theme === 'modern'`: Retains the colored full-bleed header banner across the top.
    - `theme === 'creative'`: Renders the new two-column geometric layout with bold typographic section headers and left-rail details.
- **Export Consistency**: The DOCX exporter in `src/utils/docxExport.ts` and standard window print CSS remain fully compatible.
