import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Packer,
  AlignmentType,
  UnderlineType,
} from 'docx';
import type { ResumeData } from '../types/resume';

export async function exportResumeToDocx(resume: ResumeData): Promise<void> {
  const children: Paragraph[] = [];

  // Header: Full Name
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: resume.contact.fullName.toUpperCase(),
          bold: true,
          size: 32, // 16pt
          font: 'Calibri',
          color: '1E293B',
        }),
      ],
    })
  );

  // Job Title (if present)
  if (resume.contact.jobTitle) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: resume.contact.jobTitle,
            size: 22, // 11pt
            font: 'Calibri',
            color: '475569',
            italics: true,
          }),
        ],
      })
    );
  }

  // Contact line: Email | Phone | Location | LinkedIn
  const contactParts: string[] = [];
  if (resume.contact.email) contactParts.push(resume.contact.email);
  if (resume.contact.phone) contactParts.push(resume.contact.phone);
  if (resume.contact.location) contactParts.push(resume.contact.location);
  if (resume.contact.linkedinUrl) contactParts.push(resume.contact.linkedinUrl);
  if (resume.contact.websiteUrl) contactParts.push(resume.contact.websiteUrl);

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 280 },
        children: [
          new TextRun({
            text: contactParts.join('  |  '),
            size: 19, // ~9.5pt
            font: 'Calibri',
            color: '334155',
          }),
        ],
      })
    );
  }

  const hexColor = (resume.accentColor || '#1E293B').replace('#', '');

  const addSectionHeader = (title: string) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
        border: {
          bottom: {
            color: hexColor,
            space: 4,
            style: 'single' as any,
            size: 8,
          },
        },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 24, // 12pt
            font: 'Calibri',
            color: hexColor,
          }),
        ],
      })
    );
  };

  // Professional Summary
  if (resume.summary && resume.summary.trim()) {
    addSectionHeader('Professional Summary');
    children.push(
      new Paragraph({
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: resume.summary,
            size: 21,
            font: 'Calibri',
            color: '1E293B',
          }),
        ],
      })
    );
  }

  // Work Experience
  if (resume.experience && resume.experience.length > 0) {
    addSectionHeader('Work Experience');
    for (const exp of resume.experience) {
      const dateText = `${exp.startDate || ''} – ${exp.current ? 'Present' : exp.endDate || ''}`;
      const companyDetails = [
        exp.company,
        exp.companyUrl ? `(${exp.companyUrl})` : '',
        exp.location ? `· ${exp.location}` : '',
      ]
        .filter(Boolean)
        .join(' ');

      children.push(
        new Paragraph({
          spacing: { before: 140, after: 40 },
          children: [
            new TextRun({
              text: exp.role,
              bold: true,
              size: 22,
              font: 'Calibri',
              color: '0F172A',
            }),
            new TextRun({
              text: `  |  ${companyDetails}`,
              size: 21,
              font: 'Calibri',
              color: '334155',
            }),
            new TextRun({
              text: `\t${dateText}`,
              size: 19,
              font: 'Calibri',
              color: '64748B',
              italics: true,
            }),
          ],
        })
      );

      for (const bullet of exp.bullets) {
        if (!bullet.trim()) continue;
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: bullet,
                size: 20,
                font: 'Calibri',
                color: '1E293B',
              }),
            ],
          })
        );
      }
    }
  }

  // Skills
  if (resume.skills && resume.skills.length > 0) {
    addSectionHeader('Skills & Competencies');
    for (const cat of resume.skills) {
      if (cat.items.length === 0) continue;
      children.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: `${cat.category}: `,
              bold: true,
              size: 21,
              font: 'Calibri',
              color: '0F172A',
            }),
            new TextRun({
              text: cat.items.join(', '),
              size: 20,
              font: 'Calibri',
              color: '334155',
            }),
          ],
        })
      );
    }
  }

  // Education
  if (resume.education && resume.education.length > 0) {
    addSectionHeader('Education');
    for (const edu of resume.education) {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              size: 21,
              font: 'Calibri',
              color: '0F172A',
            }),
            new TextRun({
              text: `  —  ${edu.school}${edu.location ? `, ${edu.location}` : ''}`,
              size: 21,
              font: 'Calibri',
              color: '334155',
            }),
            new TextRun({
              text: edu.graduationYear ? `\t${edu.graduationYear}` : '',
              size: 19,
              font: 'Calibri',
              color: '64748B',
              italics: true,
            }),
          ],
        })
      );
      if (edu.gpa || edu.honors) {
        const extra = [edu.gpa ? `GPA: ${edu.gpa}` : '', edu.honors || '']
          .filter(Boolean)
          .join(' · ');
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: extra,
                size: 19,
                font: 'Calibri',
                color: '64748B',
              }),
            ],
          })
        );
      }
    }
  }

  // Projects
  if (resume.projects && resume.projects.length > 0) {
    addSectionHeader('Projects');
    for (const proj of resume.projects) {
      const projectTitleChildren: TextRun[] = [
        new TextRun({
          text: proj.name,
          bold: true,
          size: 21,
          font: 'Calibri',
          color: '0F172A',
        }),
      ];
      if (proj.link) {
        projectTitleChildren.push(
          new TextRun({
            text: `  —  ${proj.link}`,
            size: 19,
            font: 'Calibri',
            color: '2563EB',
            underline: { type: UnderlineType.SINGLE },
          })
        );
      }
      if (proj.technologies && proj.technologies.length > 0) {
        projectTitleChildren.push(
          new TextRun({
            text: ` [${proj.technologies.join(', ')}]`,
            size: 19,
            font: 'Calibri',
            color: '64748B',
            italics: true,
          })
        );
      }

      children.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          children: projectTitleChildren,
        })
      );
      if (proj.description) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: proj.description,
                size: 20,
                font: 'Calibri',
                color: '1E293B',
              }),
            ],
          })
        );
      }
    }
  }

  // Certifications
  if (resume.certifications && resume.certifications.length > 0) {
    addSectionHeader('Certifications');
    for (const cert of resume.certifications) {
      const certChildren: TextRun[] = [
        new TextRun({
          text: cert.name,
          bold: true,
          size: 20,
          font: 'Calibri',
          color: '0F172A',
        }),
        new TextRun({
          text: ` — ${cert.issuer}${cert.date ? ` (${cert.date})` : ''}`,
          size: 20,
          font: 'Calibri',
          color: '334155',
        }),
      ];
      if (cert.credentialId) {
        certChildren.push(
          new TextRun({
            text: ` [${cert.credentialId}]`,
            size: 18,
            font: 'Calibri',
            color: '64748B',
          })
        );
      }

      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 60 },
          children: certChildren,
        })
      );
    }
  }

  // Custom Sections
  if (resume.customSections && resume.customSections.length > 0) {
    for (const sec of resume.customSections) {
      if (!sec.title || sec.items.length === 0) continue;
      addSectionHeader(sec.title);
      for (const item of sec.items) {
        const itemHeaderChildren: TextRun[] = [
          new TextRun({
            text: item.title,
            bold: true,
            size: 21,
            font: 'Calibri',
            color: '0F172A',
          }),
        ];
        if (item.subtitle) {
          itemHeaderChildren.push(
            new TextRun({
              text: `  |  ${item.subtitle}`,
              size: 20,
              font: 'Calibri',
              color: '334155',
            })
          );
        }
        if (item.link) {
          itemHeaderChildren.push(
            new TextRun({
              text: ` (${item.link})`,
              size: 19,
              font: 'Calibri',
              color: '2563EB',
            })
          );
        }
        if (item.date) {
          itemHeaderChildren.push(
            new TextRun({
              text: `\t${item.date}`,
              size: 19,
              font: 'Calibri',
              color: '64748B',
              italics: true,
            })
          );
        }

        children.push(
          new Paragraph({
            spacing: { before: 100, after: 40 },
            children: itemHeaderChildren,
          })
        );

        if (item.description) {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 60 },
              children: [
                new TextRun({
                  text: item.description,
                  size: 20,
                  font: 'Calibri',
                  color: '1E293B',
                }),
              ],
            })
          );
        }
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 inch
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanName = (resume.contact.fullName || resume.title || 'Resume')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_');
  const filename = `${cleanName}_ATS_Resume.docx`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
