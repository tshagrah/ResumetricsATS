# Granular Sub-Item Page Break & Whole-Entry Overflow Engine

A precision page-break system that automatically moves overflowing entries (e.g. Work Experience roles, Education degrees, Skill categories) to the next page as cohesive units, paired with manual "Start on New Page" toggles for every sub-data item.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed in Phase 1:
> - **Manual Sub-Item Toggles**: Every individual sub-data item (each Role in Work Experience, each Category in Skills, each Degree in Education, each Project, and each Certification) will have an independent "Start on New Page" (Page Break) toggle.
> - **Automatic Whole-Entry Integrity**: By default, whenever an entry (like Role 2) straddles or extends out of the printable area of a page, the engine automatically pushes the whole entry to the top of the next page so no bullets or job details are sliced or stranded.

---

### 1. Overview & Core Concept

When creating multi-page resumes, content frequently overshoots the bottom of Page 1 by a few lines. Previously, a job role could either be awkwardly cut in half across a page split or leave bullet points orphaned.

This feature introduces a two-tier page break architecture:
1. **Intelligent Baseline (Whole-Entry Protection)**: If Role 2 (or any entry) exceeds the printable boundary of Page 1, the pagination engine detects this and pushes the entire role cleanly to Page 2, starting under the configured top margin.
2. **Explicit User Control (Granular Page Break Toggle)**: A clean "Start on New Page" toggle switch is added to every individual item in the editor form and canvas hover controls, allowing the user to explicitly force a page break before any role, skill group, or degree whenever they prefer a custom layout.

---

### 2. User Experience & Visual Design

#### A. Editor Form Controls (Left Column)
- On every expandable card in the editor (Work Experience role, Education degree, Skill category, Project item, Certification):
  - A neat, unboxed action icon and toggle button: `Start on New Page` with a `Split` icon and active state badge (`Page Break: Active`).
  - Clicking this toggle marks `pageBreakBefore: true` for that specific item.
- Visual status text indicates which page the item is scheduled to start on.

#### B. Live Canvas Paper Preview (Right Column)
- When an item has `pageBreakBefore: true` or automatically overflows:
  - The item immediately moves to the top of the next 8.5" × 11" paper sheet, aligned with the configured `marginTop`.
  - A subtle, sleek canvas page break marker (`── Page Break (Forced by Work Experience: Role 2) ──`) appears in the gap between the paper sheets.
- In Live Canvas Edit mode:
  - Hovering over an item's header displays a quick shortcut button: `[+ Page Break] / [- Remove Page Break]` to toggle pagination directly on the paper canvas without leaving preview mode.

#### C. PDF Export Synchronization
- `pdfExport.ts` captures each `.resume-page-sheet` element directly.
- Forced and automatic page breaks are rendered identically in the exported vector PDF, with complete top, bottom, left, and right margins on every sheet.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Data Model Placement for Page Breaks**:
  - *Chosen Approach*: Add an optional `pageBreakBefore?: boolean` property to each sub-data item interface (`WorkExperience`, `SkillCategory`, `Education`, `ProjectItem`, `Certification`, `CustomSectionItem`).
  - *Why*: Storing page breaks on the items themselves ensures persistence in `localStorage`, export/import portability, and predictable re-rendering across sessions.
  - *Alternative Considered*: CSS-only manual slicing without state persistence. Passed over because user breaks would be lost on page reload.

- **Decision 2: Breaking Granularity (Whole Role vs Bullet Points)**:
  - *Chosen Approach*: Default pagination boundary treats the entire role header + bullets as a cohesive block. If Role 2 extends beyond `printableHeight`, the entire Role 2 moves to Page 2.
  - *Why*: Keeping job titles, company names, and their first bullets together follows strict ATS formatting guidelines and executive typography standards.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          RESUME DATA STORE                             │
│  {                                                                     │
│    experience: [                                                       │
│      { id: "exp-1", role: "Senior Designer", ... },                    │
│      { id: "exp-2", role: "Graphic Designer", pageBreakBefore: true }  │
│    ],                                                                  │
│    skills: [                                                           │
│      { id: "sk-1", category: "Core", pageBreakBefore: false },         │
│      { id: "sk-2", category: "Methodologies", pageBreakBefore: true }  │
│    ], ...                                                              │
│  }                                                                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   PAGINATION ENGINE (src/utils/pagination.ts)          │
│  1. Check explicit `pageBreakBefore` on DOM nodes (data-break-before)  │
│  2. Measure scrollHeight vs printableHeight (PAGE_HEIGHT - margins)    │
│  3. Calculate clean slice indices: [0, breakPointRole2, totalHeight]  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
┌───────────────────────────────────┐ ┌──────────────────────────────────┐
│       LIVE PAPER CANVAS           │ │          PDF EXPORT            │
│  Page 1 Sheet: Role 1, Skills...  │ │  Page 1: 8.5" x 11" with margins │
│  ── Page Break Divider ──         │ │  Page 2: 8.5" x 11" with margins │
│  Page 2 Sheet: Role 2 (at top)    │ │  1:1 exact match with canvas     │
└───────────────────────────────────┘ └──────────────────────────────────┘
```

#### Files to Modify Upon Approval:
1. `src/types/resume.ts`: Add `pageBreakBefore?: boolean` to sub-data interfaces.
2. `src/utils/pagination.ts`: Support `data-page-break-before="true"` elements to guarantee a forced breakpoint before any designated sub-item, alongside the automatic whole-item overflow detector.
3. `src/components/ResumePreview/ResumeDocument.tsx`: Attach `data-page-break-before={item.pageBreakBefore}` and `data-break-item="true"` to every role, skill category, education item, and custom block across all 4 themes.
4. `src/components/ResumeEditor/ResumeEditor.tsx`: Add the "Start on New Page" toggle button to role cards, education entries, skill categories, projects, and certifications.
