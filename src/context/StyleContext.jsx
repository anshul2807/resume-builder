import { createContext, useContext, useState } from 'react';

/**
 * Default style configuration.
 * Exported so StyleInjector and the reset button can reference it.
 */
export const defaultStyleConfig = {
    globalFontSize: 13,       // Body text: 10–16 px
    headingFontSize: 11,      // Section h2 labels: 9–16 px
    nameSize: 30,             // Big name h1: 20–48 px
    lineHeight: 1.3,          // Line-height multiplier: 1.0–2.0
    fontFamily: 'serif',      // 'serif' | 'lora' | 'sans' | 'mono'
    linkColor: '#2563eb',     // Hex color for links and accents
    boldHeaders: true,        // Whether section h2 labels are bold
};

const StyleContext = createContext(null);

export const StyleProvider = ({ children }) => {
    const [styleConfig, setStyleConfig] = useState(defaultStyleConfig);

    /** Update a single key in styleConfig */
    const updateStyle = (key, value) =>
        setStyleConfig((prev) => ({ ...prev, [key]: value }));

    /** Restore all values to the shipped defaults */
    const resetStyles = () => setStyleConfig(defaultStyleConfig);

    return (
        <StyleContext.Provider value={{ styleConfig, updateStyle, resetStyles }}>
            {children}
        </StyleContext.Provider>
    );
};

export const useStyle = () => {
    const ctx = useContext(StyleContext);
    if (!ctx) throw new Error('useStyle must be used within a <StyleProvider>');
    return ctx;
};
