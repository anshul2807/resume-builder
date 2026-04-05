import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../config/api';

/**
 * Context-aware resume writing prompts.
 *
 * Each prompt instructs Gemini to do exactly three things:
 *  1. Correct all grammatical errors.
 *  2. Complete any fragmented or incomplete sentences.
 *  3. Strictly maintain a word count roughly equal to the original input.
 *
 * All requests are routed through the backend (/api/ai/enhance).
 * The Gemini API key lives only on the server — never in the browser.
 */
const PROMPTS = {
    summary:
        'You are an expert resume writer. Fix all grammatical errors, complete any fragmented or incomplete sentences, and strictly keep the word count roughly equal to the original input. Do NOT add unnecessary content or make the text longer. Return ONLY the corrected text with no preamble:',

    'experience-point':
        'You are an expert resume writer. Fix all grammatical errors, complete any fragmented or incomplete sentences, and strictly keep the word count roughly equal to the original input. Do NOT expand or add new achievements. Return ONLY the corrected bullet with no preamble:',

    'project-point':
        'You are an expert resume writer. Fix all grammatical errors, complete any fragmented or incomplete sentences, and strictly keep the word count roughly equal to the original input. Do NOT expand or add new details. Return ONLY the corrected bullet with no preamble:',

    achievement:
        'You are an expert resume writer. Fix all grammatical errors, complete any fragmented or incomplete sentences, and strictly keep the word count roughly equal to the original input. Return ONLY the corrected text with no preamble:',

    skills:
        'You are an expert resume writer. Fix any formatting or grammatical issues in these technical skills. Keep the comma-separated list format and do NOT add new skills. Return ONLY the corrected list with no preamble:',

    generic:
        'You are an expert resume writer. Fix all grammatical errors, complete any fragmented or incomplete sentences, and strictly keep the word count roughly equal to the original input. Return ONLY the corrected text with no preamble:',
};

// ─── Main hook ───────────────────────────────────────────────────────────────
/**
 * Returns an `enhance(text, context)` function.
 * - Requires the user to be logged in (throws otherwise).
 * - Enforces the daily rate limit (backend is the source of truth).
 * - Routes all Gemini calls through POST /api/ai/enhance.
 *
 * @param {string} text     - Current field value to improve
 * @param {string} context  - One of: 'summary' | 'experience-point' |
 *                            'project-point' | 'achievement' | 'skills' | 'generic'
 * @returns {Promise<string>} The improved text from Gemini
 */
const useAIEnhance = () => {
    const { isLoggedIn, token, hasEnhanceTokens, decrementTokens } = useAuth();

    const enhance = async (text, context = 'generic') => {
        // ── Auth gate ──────────────────────────────────────────────────────
        if (!isLoggedIn) {
            throw new Error('Please log in to use AI Enhancement.');
        }

        // ── Rate limit gate ────────────────────────────────────────────────
        if (!hasEnhanceTokens) {
            throw new Error(
                `You don't have enough tokens to enhance this text. Please get more tokens.`
            );
        }

        if (!text?.trim()) {
            throw new Error('Nothing to enhance. Write some content first.');
        }

        const systemPrompt = PROMPTS[context] ?? PROMPTS.generic;
        const fullPrompt = `${systemPrompt}\n\n"${text.trim()}"`;

        // ── Backend call — Gemini key never leaves the server ──────────────
        const res = await fetch(`${BASE_URL}/api/ai/enhance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ prompt: fullPrompt, context }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err?.message || `AI request failed (${res.status})`);
        }

        const data = await res.json();
        const result = data?.result?.trim() ?? '';

        // Decrement local counter + refresh from backend
        if (result) decrementTokens(1);

        return result;
    };

    return enhance;
};

export default useAIEnhance;
