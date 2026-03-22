/**
 * usePdfDownload  (react-to-print v3)
 *
 * Provides a high-fidelity, browser-native PDF download of a DOM node.
 *
 * react-to-print v3 automatically copies all global stylesheets from the
 * parent page into the isolated print iframe (ignoreGlobalStyles defaults
 * to false), so Tailwind classes and our index.css rules are preserved
 * without any manual injection.
 *
 * Usage:
 *   const { printRef, handleDownload, isPrinting } = usePdfDownload('My_Resume');
 *   <SomeComponent ref={printRef} />          ← must use React.forwardRef
 *   <button onClick={handleDownload}>Download PDF</button>
 */

import { useRef, useCallback, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

/**
 * Critical overrides injected directly into the print iframe's <head>.
 *
 * These supplement index.css by adding rules with maximum specificity
 * that are guaranteed to apply in the ephemeral print iframe:
 *  - @page → A4 size, zero browser chrome margins
 *  - #resume-preview → exact A4 dimensions, no shadow, no transform
 *  - color-adjust → force exact colour reproduction (no "save ink" greying)
 *  - .resume-section / .resume-entry → page-break rules via both
 *    the old and new CSS specs for maximum browser compatibility
 */
const A4_PRINT_STYLES = `
  @page {
    size: A4 portrait;
    margin: 0;
  }

  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
    width: 210mm !important;
  }

  #resume-preview {
    width: 210mm !important;
    min-height: 297mm !important;
    padding: 15mm 18mm !important;
    margin: 0 !important;
    box-shadow: none !important;
    transform: none !important;
    border: none !important;
    box-sizing: border-box !important;
    font-size: 13px !important;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Page-break rules — both old (page-break-*) and new (break-*) syntax
     for maximum cross-browser compatibility */
  .resume-section {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .resume-entry {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .resume-section > h2 {
    page-break-after: avoid !important;
    break-after: avoid !important;
  }

  /* Keep list bullets visible */
  ul { list-style: disc !important; }

  /* Keep link colours as-is */
  a { text-decoration: none !important; }
`;

const usePdfDownload = (documentTitle = 'Resume') => {
    const printRef = useRef(null);
    const [isPrinting, setIsPrinting] = useState(false);

    const handleDownload = useReactToPrint({
        // ① The DOM node to capture — must be a React.forwardRef component
        contentRef: printRef,

        // ② Filename shown in the browser's "Save as PDF" dialog
        documentTitle,

        // ③ react-to-print v3: copies ALL global stylesheets automatically.
        //    Setting this to false (the default) means Tailwind + index.css
        //    are available in the print iframe without any manual injection.
        ignoreGlobalStyles: false,

        // ④ Additional CSS injected into the print iframe's <head> as a <style>
        //    tag with high specificity — our critical A4 overrides go here.
        pageStyle: A4_PRINT_STYLES,

        // ⑤ Lifecycle: show spinner → open dialog → hide spinner
        onBeforePrint: () => {
            setIsPrinting(true);
            return Promise.resolve();
        },
        onAfterPrint: () => {
            setIsPrinting(false);
        },

        // ⑥ Surface errors to console and reset spinner
        onPrintError: (errorLocation, error) => {
            console.error(`[usePdfDownload] Error at "${errorLocation}":`, error);
            setIsPrinting(false);
        },
    });

    // Stable callback reference across renders
    const triggerDownload = useCallback(() => {
        handleDownload();
    }, [handleDownload]);

    return { printRef, handleDownload: triggerDownload, isPrinting };
};

export default usePdfDownload;
