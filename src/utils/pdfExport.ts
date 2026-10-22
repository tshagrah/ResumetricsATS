import jsPDF from 'jspdf';
import { toCanvas } from 'html-to-image';
import type { ResumeData } from '../types/resume';

/**
 * Exports the currently rendered resume document to a high-fidelity PDF file.
 * Uses html-to-image (SVG foreignObject browser engine) to natively support modern CSS
 * features like Tailwind v4 oklch colors, flexbox, grid, gradients, and custom fonts.
 */
export async function exportResumeToPdf(resume: ResumeData): Promise<void> {
  const rootEl = document.getElementById('resume-document-root');
  if (!rootEl) {
    throw new Error('Resume document element not found on page.');
  }

  // Ensure all web fonts (DM Sans, Plus Jakarta Sans, etc.) are rendered
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Continue even if font ready promise rejects
    }
  }

  // Handle case where preview container might be hidden on mobile tabs
  const hiddenParent = rootEl.closest('.hidden') as HTMLElement | null;
  let originalParentDisplay = '';
  let originalParentPosition = '';
  let originalParentLeft = '';
  let originalParentTop = '';

  if (hiddenParent) {
    originalParentDisplay = hiddenParent.style.display;
    originalParentPosition = hiddenParent.style.position;
    originalParentLeft = hiddenParent.style.left;
    originalParentTop = hiddenParent.style.top;

    hiddenParent.style.display = 'flex';
    hiddenParent.style.position = 'absolute';
    hiddenParent.style.left = '-9999px';
    hiddenParent.style.top = '0';
  }

  // Temporarily reset preview zoom transform to capture natural 8.5in dimensions
  const originalTransform = rootEl.style.transform;
  const originalTransformOrigin = rootEl.style.transformOrigin;
  const originalBoxShadow = rootEl.style.boxShadow;
  const originalBorder = rootEl.style.border;

  try {
    rootEl.style.transform = 'none';
    rootEl.style.transformOrigin = 'top left';
    rootEl.style.boxShadow = 'none';
    rootEl.style.border = 'none';

    // Wait 2 animation frames for browser reflow
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const filterNode = (node: Node) => {
      if (node instanceof HTMLElement) {
        if (node.classList.contains('no-print') || node.getAttribute('data-no-print') === 'true') {
          return false;
        }
      }
      return true;
    };

    // Standard US Letter dimensions in inches
    const pageWidthInches = 8.5;
    const pageHeightInches = 11.0;

    // Check if multi-page paper sheets are present
    const pageSheets = Array.from(rootEl.querySelectorAll<HTMLElement>('.resume-page-sheet'));

    if (pageSheets.length > 0) {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter',
        compress: true,
      });

      for (let i = 0; i < pageSheets.length; i++) {
        const sheet = pageSheets[i];
        const prevShadow = sheet.style.boxShadow;
        const prevBorder = sheet.style.border;
        sheet.style.boxShadow = 'none';
        sheet.style.border = 'none';

        let sheetCanvas: HTMLCanvasElement;
        try {
          sheetCanvas = await toCanvas(sheet, {
            pixelRatio: 2,
            backgroundColor: '#ffffff',
            filter: filterNode,
            style: {
              boxShadow: 'none',
              border: 'none',
            },
          });
        } catch {
          sheetCanvas = await toCanvas(sheet, {
            pixelRatio: 1,
            backgroundColor: '#ffffff',
            filter: filterNode,
            style: {
              boxShadow: 'none',
              border: 'none',
            },
          });
        } finally {
          sheet.style.boxShadow = prevShadow;
          sheet.style.border = prevBorder;
        }

        const imgData = sheetCanvas.toDataURL('image/jpeg', 0.98);
        if (i > 0) {
          pdf.addPage('letter', 'portrait');
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, pageWidthInches, pageHeightInches, undefined, 'FAST');
      }

      const cleanName = (resume.contact.fullName || resume.title || 'Resume')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_');
      const filename = `${cleanName}_ATS_Resume.pdf`;

      pdf.save(filename);
      return;
    }

    // Fallback if no .resume-page-sheet elements exist:
    let canvas: HTMLCanvasElement;
    try {
      // Attempt crisp 2x resolution (300 DPI equivalent)
      canvas = await toCanvas(rootEl, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        filter: filterNode,
        style: {
          transform: 'none',
          transformOrigin: 'top left',
          boxShadow: 'none',
          border: 'none',
        },
      });
    } catch (primaryErr) {
      console.warn('Retrying PDF render with 1x resolution due to:', primaryErr);
      canvas = await toCanvas(rootEl, {
        pixelRatio: 1,
        backgroundColor: '#ffffff',
        filter: filterNode,
        style: {
          transform: 'none',
          transformOrigin: 'top left',
          boxShadow: 'none',
          border: 'none',
        },
      });
    }

    // Canvas aspect ratio calculations
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const pageHeightPx = Math.floor(canvasWidth * (pageHeightInches / pageWidthInches));

    const totalPages = Math.max(1, Math.ceil(canvasHeight / pageHeightPx));

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter',
      compress: true,
    });

    for (let page = 0; page < totalPages; page++) {
      const srcY = page * pageHeightPx;
      const currentSliceHeightPx = Math.min(pageHeightPx, canvasHeight - srcY);

      if (currentSliceHeightPx <= 0) break;

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvasWidth;
      pageCanvas.height = currentSliceHeightPx;

      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          srcY,
          canvasWidth,
          currentSliceHeightPx,
          0,
          0,
          canvasWidth,
          currentSliceHeightPx
        );
      }

      const imgData = pageCanvas.toDataURL('image/jpeg', 0.98);
      const sliceHeightInches = (currentSliceHeightPx / canvasWidth) * pageWidthInches;

      if (page > 0) {
        pdf.addPage('letter', 'portrait');
      }

      pdf.addImage(
        imgData,
        'JPEG',
        0,
        0,
        pageWidthInches,
        sliceHeightInches,
        undefined,
        'FAST'
      );
    }

    const cleanName = (resume.contact.fullName || resume.title || 'Resume')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');
    const filename = `${cleanName}_ATS_Resume.pdf`;

    pdf.save(filename);
  } finally {
    // Restore original styles
    rootEl.style.transform = originalTransform;
    rootEl.style.transformOrigin = originalTransformOrigin;
    rootEl.style.boxShadow = originalBoxShadow;
    rootEl.style.border = originalBorder;

    if (hiddenParent) {
      hiddenParent.style.display = originalParentDisplay;
      hiddenParent.style.position = originalParentPosition;
      hiddenParent.style.left = originalParentLeft;
      hiddenParent.style.top = originalParentTop;
    }
  }
}
