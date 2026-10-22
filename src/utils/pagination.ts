/**
 * Helper utility to calculate clean page breaks across DOM elements.
 * If any content or entry extends out of the printable area of a page,
 * it moves that entire content item cleanly to the new page.
 */

export interface BreakpointOptions {
  pageHeightPx: number; // e.g. 1056 for 11in
  topPx: number; // e.g. 62.4 for 0.65in
  bottomPx: number; // e.g. 62.4 for 0.65in
  isFullBleedHeader?: boolean; // true for modern and creative themes on page 1
}

/**
 * Scans candidate DOM elements in the unpaginated resume container.
 * Whenever an element's bottom extends beyond the printable area of the current page,
 * the break is placed before that element so it cleanly starts on the next page.
 */
export function calculatePageBreakpoints(
  container: HTMLElement,
  options: BreakpointOptions
): number[] {
  const { pageHeightPx, topPx, bottomPx, isFullBleedHeader = false } = options;
  const totalHeight = container.scrollHeight;

  // Standard printable height per page
  const standardPrintableHeight = Math.max(300, pageHeightPx - topPx - bottomPx);
  // Page 1 printable height (full bleed headers touch top edge 0px)
  const page1PrintableHeight = isFullBleedHeader
    ? Math.max(300, pageHeightPx - bottomPx)
    : standardPrintableHeight;

  // If entire content fits on page 1 within printable boundary
  if (!totalHeight || totalHeight <= page1PrintableHeight) {
    return [0, totalHeight || page1PrintableHeight];
  }

  const breakpoints: number[] = [0];
  let currentStart = 0;
  let pageIndex = 0;
  const maxPages = 15; // Safety safeguard

  // Gather breakable candidate elements in DOM order
  const candidates = Array.from(
    container.querySelectorAll<HTMLElement>(
      'section, .resume-break-target, .resume-entry, li, h2, h3, p'
    )
  );

  while (currentStart < totalHeight && pageIndex < maxPages) {
    const availHeight = pageIndex === 0 ? page1PrintableHeight : standardPrintableHeight;
    const maxBottomLimit = currentStart + availHeight;

    // Check if remaining content fits on current page
    if (totalHeight <= maxBottomLimit) {
      breakpoints.push(totalHeight);
      break;
    }

    let breakPoint: number | null = null;

    // 1. Check for any explicit user-defined forced page break (data-page-break-before="true")
    // on the current page. If the user explicitly marked an item to start on a new page, honor it immediately.
    for (const el of candidates) {
      const top = el.offsetTop;
      if (
        top > currentStart + 10 &&
        top <= maxBottomLimit &&
        (el.getAttribute('data-page-break-before') === 'true' || el.classList.contains('page-break-before'))
      ) {
        // If the preceding element was a section heading (H2/H3) and the forced element is the first child,
        // or if it's the heading itself, break cleanly
        breakPoint = top;
        break;
      }
    }

    // 2. If no explicit forced page break occurred before maxBottomLimit,
    // scan candidates to find the FIRST element that extends past maxBottomLimit (Whole-Entry Overflow Protection)
    if (breakPoint === null) {
      for (let i = 0; i < candidates.length; i++) {
        const el = candidates[i];

        // CRITICAL: If this element is a parent container that contains other break target children
        // (for example a <section> containing multiple work experience roles or education entries),
        // skip this container so we inspect each individual entry rather than breaking the entire section!
        if (el.querySelector('.resume-break-target, .resume-entry')) {
          continue;
        }

        const top = el.offsetTop;
        const height = el.offsetHeight;
        const bottom = top + height;

        // Only consider elements that belong to current page (start after currentStart)
        if (top < currentStart) {
          continue;
        }

        // If this element extends beyond the printable boundary:
        if (bottom > maxBottomLimit) {
          // We must move this element to the next page!
          // Check if the previous candidate was a section heading (H2/H3)
          // so we don't leave an orphan heading alone at the bottom of the page
          if (i > 0) {
            const prevEl = candidates[i - 1];
            if (['H2', 'H3'].includes(prevEl.tagName) && prevEl.offsetTop >= currentStart + 40) {
              breakPoint = prevEl.offsetTop;
              break;
            }
          }

          // If the element itself is a heading, break before it
          if (['H2', 'H3'].includes(el.tagName)) {
            breakPoint = top;
            break;
          }

          // Break cleanly at the top of this element so it starts on the new page
          // Ensure at least some minimum content on page (unless it's the very first element of page)
          if (top > currentStart + 40) {
            breakPoint = top;
          } else {
            // If a single item is taller than the entire page printable height,
            // look for internal children (like bullets `li`)
            const childBullets = Array.from(el.querySelectorAll<HTMLElement>('li, p'));
            for (const bullet of childBullets) {
              const bTop = bullet.offsetTop;
              const bBottom = bTop + bullet.offsetHeight;
              if (bBottom > maxBottomLimit && bTop > currentStart + 40) {
                breakPoint = bTop;
                break;
              }
            }
            if (breakPoint === null) {
              breakPoint = Math.min(totalHeight, currentStart + availHeight);
            }
          }
          break;
        }
      }
    }

    // Fallback if no candidate crossed the line but totalHeight did
    if (breakPoint === null || breakPoint <= currentStart) {
      breakPoint = Math.min(totalHeight, currentStart + availHeight);
    }

    breakpoints.push(breakPoint);
    currentStart = breakPoint;
    pageIndex++;
  }

  // Ensure last breakpoint covers full content
  if (breakpoints[breakpoints.length - 1] < totalHeight) {
    breakpoints.push(totalHeight);
  }

  return breakpoints;
}
