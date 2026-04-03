import { createContext, useContext } from 'react';

/**
 * AIContext — Gemini-only, no API key management on the frontend.
 * All AI requests are routed through the backend (/api/ai/enhance).
 */
const AIContext = createContext(null);

export const AIProvider = ({ children }) => {
    return (
        <AIContext.Provider value={{}}>
            {children}
        </AIContext.Provider>
    );
};

export const useAI = () => {
    const ctx = useContext(AIContext);
    if (!ctx) throw new Error('useAI must be used within <AIProvider>');
    return ctx;
};
