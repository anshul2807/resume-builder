import { createContext, useContext, useState } from 'react';

/**
 * All available section IDs.
 * The order array in defaultStyleConfig controls render order in the resume.
 * 'summary' is always gated by `showSummary` regardless of position.
 */
export const ALL_SECTIONS = [
    { id: 'summary', label: 'Summary', icon: '📋' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'experience', label: 'Work Experience', icon: '💼' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'skills', label: 'Technical Skills', icon: '⚙️' },
    { id: 'education', label: 'Education', icon: '🎓' },
];

export const defaultStyleConfig = {
    // ── Typography ──────────────────────────────────────
    globalFontSize: 13,       // Body text: 10–16 px
    headingFontSize: 11,       // Section h2 labels: 9–16 px
    nameSize: 30,       // Name h1: 20–48 px
    lineHeight: 1.3,      // Line-height: 1.0–2.0
    fontFamily: 'serif',  // 'serif' | 'lora' | 'sans' | 'mono'

    // ── Colors ──────────────────────────────────────────
    linkColor: '#2563eb',  // Links & accent
    paperColor: 'white',    // 'white' | 'warm' | 'cream'

    // ── Formatting ──────────────────────────────────────
    boldHeaders: true,       // Bold section h2 labels
    headingStyle: 'underline',// 'underline' | 'overline' | 'sidebar' | 'minimal'
    sectionSpacing: 16,         // px gap between sections (8–32)
    dividerThickness: 1,          // section rule thickness: 1 | 1.5 | 2

    // ── Sections ────────────────────────────────────────
    showSummary: false,           // toggle the optional Summary section
    sectionOrder: ['summary', 'achievements', 'experience', 'projects', 'skills', 'education'],
};

const StyleContext = createContext(null);

export const StyleProvider = ({ children }) => {
    const [styleConfig, setStyleConfig] = useState(defaultStyleConfig);

    /** Update a single key */
    const updateStyle = (key, value) =>
        setStyleConfig((prev) => ({ ...prev, [key]: value }));

    /** Reorder: move section at `fromIndex` to `toIndex` */
    const reorderSections = (newOrder) =>
        setStyleConfig((prev) => ({ ...prev, sectionOrder: newOrder }));

    /** Hard reset to defaults */
    const resetStyles = () => setStyleConfig(defaultStyleConfig);

    return (
        <StyleContext.Provider value={{ styleConfig, setStyleConfig, updateStyle, reorderSections, resetStyles }}>
            {children}
        </StyleContext.Provider>
    );
};

export const useStyle = () => {
    const ctx = useContext(StyleContext);
    if (!ctx) throw new Error('useStyle must be used within a <StyleProvider>');
    return ctx;
};
