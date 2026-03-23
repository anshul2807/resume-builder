import { useAI } from '../context/AIContext';

/**
 * Context-aware resume writing prompts.
 * Each prompt instructs the model to return ONLY the improved text so we can
 * inject the result directly into the form field without any post-processing.
 */
const PROMPTS = {
    summary:
        'You are an expert resume writer. Improve the following professional summary to be compelling, specific, and ATS-friendly. Keep it 2–3 concise sentences. Return ONLY the improved text, no preamble:',

    'experience-point':
        'You are an expert resume writer. Rewrite this work experience bullet point using a strong action verb. Make it more impactful and add quantifiable achievements where possible. Return ONLY the improved bullet, no preamble:',

    'project-point':
        'You are an expert resume writer. Improve this project description bullet point to clearly highlight technical impact and skills used. Return ONLY the improved bullet, no preamble:',

    achievement:
        'You are an expert resume writer. Improve this achievement line to be more specific, impressive, and concise. Return ONLY the improved text, no preamble:',

    skills:
        'You are an expert resume writer. Format and improve these technical skills for a modern resume. Return ONLY a clean comma-separated list, no preamble:',

    generic:
        'You are an expert resume writer. Improve the following text for use in a professional resume. Return ONLY the improved text, no preamble:',
};

// ─── Provider-specific API callers ──────────────────────────────────────────

const callGemini = async (apiKey, model, prompt) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
        }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Gemini API error (${res.status})`);
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
};

const callOpenAI = async (apiKey, model, prompt) => {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 512,
            temperature: 0.7,
        }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `OpenAI API error (${res.status})`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() ?? '';
};

const callClaude = async (apiKey, model, prompt) => {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model,
            max_tokens: 512,
            messages: [{ role: 'user', content: prompt }],
        }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Claude API error (${res.status})`);
    }
    const data = await res.json();
    return data.content?.[0]?.text?.trim() ?? '';
};

// ─── Main hook ───────────────────────────────────────────────────────────────
/**
 * Returns an `enhance(text, context)` function.
 *
 * @param {string} text     - Current field value to improve
 * @param {string} context  - One of: 'summary' | 'experience-point' |
 *                            'project-point' | 'achievement' | 'skills' | 'generic'
 * @returns {Promise<string>} The improved text from the AI
 */
const useAIEnhance = () => {
    const { aiConfig } = useAI();

    const enhance = async (text, context = 'generic') => {
        if (!aiConfig.apiKey?.trim()) {
            throw new Error('No API key — add yours in the ✨ AI tab first.');
        }
        if (!text?.trim()) {
            throw new Error('Nothing to enhance. Write some content first.');
        }

        const systemPrompt = PROMPTS[context] ?? PROMPTS.generic;
        const fullPrompt = `${systemPrompt}\n\n"${text.trim()}"`;

        switch (aiConfig.provider) {
            case 'gemini': return callGemini(aiConfig.apiKey, aiConfig.model, fullPrompt);
            case 'openai': return callOpenAI(aiConfig.apiKey, aiConfig.model, fullPrompt);
            case 'claude': return callClaude(aiConfig.apiKey, aiConfig.model, fullPrompt);
            default: throw new Error(`Unknown provider: ${aiConfig.provider}`);
        }
    };

    return enhance;
};

export default useAIEnhance;
