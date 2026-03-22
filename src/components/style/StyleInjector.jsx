import { useLayoutEffect } from 'react';
import { useStyle } from '../../context/StyleContext';

const FONT_FAMILY_MAP = {
  serif: '"Times New Roman", Times, serif',
  lora: '"Lora", Georgia, serif',
  sans: '"Inter", "Helvetica Neue", Arial, sans-serif',
  mono: '"Courier New", Courier, monospace',
};

const PAPER_COLOR_MAP = {
  white: '#ffffff',
  warm: '#fafaf7',
  cream: '#fdf8f0',
};

/**
 * Generates the CSS for a section heading (h2) based on `headingStyle`.
 *
 * headingStyle options:
 *   'underline' — classic thin rule below the text (original look)
 *   'overline'  — bold rule ABOVE the text + more top spacing
 *   'sidebar'   — a coloured left border + light background pill
 *   'minimal'   — no rule, just slightly larger spaced-out caps
 */
const buildHeadingCSS = (headingStyle, linkColor, dividerThickness) => {
  const weight = 'var(--resume-heading-weight, 700)';
  const size = 'var(--resume-heading-size, 11px)';
  const thick = `${dividerThickness}px`;

  const base = `
    #resume-preview .resume-section h2 {
      font-size:      ${size} !important;
      font-weight:    ${weight} !important;
      text-transform: uppercase !important;
      letter-spacing: 0.08em !important;
      margin-bottom:  6px !important;
  `;

  switch (headingStyle) {
    case 'overline':
      return base + `
        border-top:    ${thick} solid #1a1a1a !important;
        border-bottom: none !important;
        padding-top:   4px !important;
        padding-bottom: 2px !important;
        margin-top: 2px !important;
      }`;

    case 'sidebar':
      return base + `
        border-left:    3px solid ${linkColor} !important;
        border-bottom:  none !important;
        background:     ${linkColor}12 !important;
        padding-left:   8px !important;
        padding-top:    3px !important;
        padding-bottom: 3px !important;
        border-radius:  0 4px 4px 0 !important;
        color: ${linkColor} !important;
      }`;

    case 'minimal':
      return base + `
        border-bottom:  none !important;
        letter-spacing: 0.18em !important;
        color: #6b7280 !important;
      }`;

    case 'underline':
    default:
      return base + `
        border-bottom: ${thick}px solid #1a1a1a !important;
        padding-bottom: 2px !important;
      }`;
  }
};

const StyleInjector = () => {
  const { styleConfig } = useStyle();

  useLayoutEffect(() => {
    let tag = document.getElementById('resume-dynamic-styles');
    if (!tag) {
      tag = document.createElement('style');
      tag.id = 'resume-dynamic-styles';
      document.head.appendChild(tag);
    }

    const ff = FONT_FAMILY_MAP[styleConfig.fontFamily] ?? FONT_FAMILY_MAP.serif;
    const bold = styleConfig.boldHeaders ? '700' : '500';
    const paper = PAPER_COLOR_MAP[styleConfig.paperColor] ?? '#ffffff';
    const gap = `${styleConfig.sectionSpacing}px`;
    const thick = styleConfig.dividerThickness ?? 1;

    tag.textContent = `
      /* ── Base container ──────────────────────────── */
      #resume-preview {
        font-size:   ${styleConfig.globalFontSize}px !important;
        font-family: ${ff} !important;
        line-height: ${styleConfig.lineHeight} !important;
        background:  ${paper} !important;
        --resume-font-size:     ${styleConfig.globalFontSize}px;
        --resume-heading-size:  ${styleConfig.headingFontSize}px;
        --resume-name-size:     ${styleConfig.nameSize}px;
        --resume-line-height:   ${styleConfig.lineHeight};
        --resume-link-color:    ${styleConfig.linkColor};
        --resume-heading-weight:${bold};
      }

      /* ── Name heading ────────────────────────────── */
      #resume-preview h1 {
        font-size: ${styleConfig.nameSize}px !important;
      }

      /* ── Section spacing ─────────────────────────── */
      #resume-preview .resume-section {
        margin-bottom: ${gap} !important;
      }

      /* ── Section headings (heading style variants) ─ */
      ${buildHeadingCSS(styleConfig.headingStyle, styleConfig.linkColor, thick)}

      /* ── Links / accent colour ───────────────────── */
      #resume-preview a {
        color: ${styleConfig.linkColor} !important;
      }
      #resume-preview .text-blue-600 {
        color: ${styleConfig.linkColor} !important;
      }
      #resume-preview .border-black {
        border-color: #1a1a1a !important;
      }
    `;
  }, [styleConfig]);

  useLayoutEffect(() => {
    return () => {
      document.getElementById('resume-dynamic-styles')?.remove();
    };
  }, []);

  return null;
};

export default StyleInjector;
