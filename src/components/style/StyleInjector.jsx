import { useLayoutEffect } from 'react';
import { useStyle } from '../../context/StyleContext';

/**
 * StyleInjector
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders nothing to the DOM. Its only job is to sync the styleConfig state
 * into a dedicated <style id="resume-dynamic-styles"> tag in <head>.
 *
 * WHY THIS APPROACH AVOIDS RE-RENDERING ResumeTemplate:
 *   • ResumeTemplate does NOT consume StyleContext — it never re-renders when
 *     sliders move.
 *   • Only this tiny component re-renders on each style change.
 *   • It writes CSS rules that target #resume-preview by ID, overriding
 *     Tailwind classes via higher specificity + !important where needed.
 *   • The browser handles CSS recalculation natively — no React reconciliation
 *     happens inside the resume card at all.
 *
 * useLayoutEffect (vs useEffect):
 *   Runs synchronously after DOM mutations but BEFORE the browser paints,
 *   so there is zero flash of unstyled content even on first render.
 */

const FONT_FAMILY_MAP = {
    serif: '"Times New Roman", Times, serif',
    lora: '"Lora", Georgia, serif',
    sans: '"Inter", "Helvetica Neue", Arial, sans-serif',
    mono: '"Courier New", Courier, monospace',
};

const StyleInjector = () => {
    const { styleConfig } = useStyle();

    useLayoutEffect(() => {
        // Lazily create the style tag on first run, reuse it on updates
        let tag = document.getElementById('resume-dynamic-styles');
        if (!tag) {
            tag = document.createElement('style');
            tag.id = 'resume-dynamic-styles';
            document.head.appendChild(tag);
        }

        const ff = FONT_FAMILY_MAP[styleConfig.fontFamily] ?? FONT_FAMILY_MAP.serif;
        const bold = styleConfig.boldHeaders ? '700' : '500';

        /*
         * All rules are scoped to #resume-preview so they never leak outside the
         * resume card. The !important overrides Tailwind's utility classes which
         * are already compiled into the stylesheet with lower insertion order.
         */
        tag.textContent = `
      /* ── Base container ─────────────────────────────────── */
      #resume-preview {
        font-size:   ${styleConfig.globalFontSize}px !important;
        font-family: ${ff} !important;
        line-height: ${styleConfig.lineHeight} !important;
      }

      /* ── Name heading (h1) ───────────────────────────────── */
      #resume-preview h1 {
        font-size: ${styleConfig.nameSize}px !important;
      }

      /* ── Section headings (h2) ───────────────────────────── */
      #resume-preview .resume-section h2 {
        font-size:   ${styleConfig.headingFontSize}px !important;
        font-weight: ${bold} !important;
      }

      /* ── Links / accent colour ───────────────────────────── */
      #resume-preview a {
        color: ${styleConfig.linkColor} !important;
      }

      /* ── Italic subtitle text (company name, project tech) ─ */
      #resume-preview .text-blue-600 {
        color: ${styleConfig.linkColor} !important;
      }
    `;
    }, [styleConfig]);          // Re-runs only when styleConfig changes

    // Remove the injected tag cleanly when the component unmounts
    useLayoutEffect(() => {
        return () => {
            document.getElementById('resume-dynamic-styles')?.remove();
        };
    }, []);

    return null;   // Renders nothing to the virtual DOM
};

export default StyleInjector;
