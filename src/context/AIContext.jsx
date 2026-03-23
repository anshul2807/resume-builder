import { createContext, useContext, useState } from 'react';

/**
 * AI provider definitions — id, display name, icon SVG (inline), available models,
 * and an optional note for providers with browser CORS limitations.
 */
export const AI_PROVIDERS = {
    gemini: {
        id: 'gemini',
        name: 'Google Gemini',
        badge: 'Free tier available',
        badgeColor: 'emerald',
        models: [
            { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Most Stable Free Tier) ✅' },
            { id: 'gemini-2.0-flash-lite-preview-02-05', name: 'Gemini 3.1 Flash-Lite (Best for Star icon) ✨' },
            { id: 'gemini-2.0-flash', name: 'Gemini 3.1 Flash' },
            { id: 'gemini-1.5-pro', name: 'Gemini 3.1 Pro' },
        ],
        keyLink: 'https://aistudio.google.com/app/apikey',
        keyLinkLabel: 'aistudio.google.com → Get API key',
        corsNote: null,
    },
    openai: {
        id: 'openai',
        name: 'OpenAI',
        badge: 'GPT-4o family',
        badgeColor: 'teal',
        models: [
            { id: 'gpt-4o-mini', name: 'GPT-4o Mini (fast)' },
            { id: 'gpt-4o', name: 'GPT-4o' },
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
        ],
        keyLink: 'https://platform.openai.com/api-keys',
        keyLinkLabel: 'platform.openai.com → API keys',
        corsNote: null,
    },
    claude: {
        id: 'claude',
        name: 'Anthropic Claude',
        badge: 'Requires proxy',
        badgeColor: 'amber',
        models: [
            { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
            { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
        ],
        keyLink: 'https://console.anthropic.com/settings/keys',
        keyLinkLabel: 'console.anthropic.com → API keys',
        // Anthropic blocks direct browser requests — CORS policy
        corsNote: "Claude's API doesn't allow direct browser calls (CORS). Use Gemini or OpenAI for in-app AI, or run a small backend proxy.",
    },
};

const DEFAULT_CONFIG = {
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-2.0-flash',
};

const AIContext = createContext(null);

export const AIProvider = ({ children }) => {
    const [aiConfig, setAIConfig] = useState(() => {
        try {
            const saved = localStorage.getItem('resume-ai-config');
            if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
        } catch { }
        return DEFAULT_CONFIG;
    });

    const updateAIConfig = (updates) => {
        setAIConfig((prev) => {
            const next = { ...prev, ...updates };
            // Persist to localStorage (key stored locally for UX convenience)
            try { localStorage.setItem('resume-ai-config', JSON.stringify(next)); } catch { }
            return next;
        });
    };

    return (
        <AIContext.Provider value={{ aiConfig, updateAIConfig }}>
            {children}
        </AIContext.Provider>
    );
};

export const useAI = () => {
    const ctx = useContext(AIContext);
    if (!ctx) throw new Error('useAI must be used within <AIProvider>');
    return ctx;
};
