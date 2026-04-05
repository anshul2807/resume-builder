import { useAuth } from '../context/AuthContext';
import { useResume } from '../context/ResumeContext';
import { BASE_URL } from '../config/api';

/**
 * ATS Score Check hook.
 *
 * Costs 5 tokens per call. Sends the user's resume data along with
 * their work-experience duration, target job role, and an optional
 * job description to the backend AI endpoint. Returns a structured
 * ATS score (0–100) and improvement suggestions.
 */
const useATSScore = () => {
    const { isLoggedIn, token, tokens, refreshUsage } = useAuth();
    const { resumeData } = useResume();

    const TOKEN_COST = 1;

    /**
     * @param {{ experienceYears: number, experienceMonths: number, jobRole: string, jobDescription?: string }} params
     * @returns {Promise<{ score: number, summary: string, suggestions: string[] }>}
     */
    const checkATSScore = async ({ experienceYears, experienceMonths, jobRole, jobDescription }) => {
        // ── Auth gate ──────────────────────────────────────────────────
        if (!isLoggedIn) {
            throw new Error('Please log in to use ATS Score Check.');
        }

        // ── Token gate — need at least 5 remaining ────────────────────
        const remaining = tokens || 0;
        if (remaining < TOKEN_COST) {
            throw new Error(
                `ATS Score Check costs ${TOKEN_COST} tokens. You only have ${remaining} remaining today.`
            );
        }

        if (!jobRole?.trim()) {
            throw new Error('Please provide a target Job Role.');
        }

        // ── Build the prompt from resume data ─────────────────────────
        const resumeText = buildResumeText(resumeData);
        const totalExp = `${experienceYears} year${experienceYears !== 1 ? 's' : ''}${experienceMonths > 0 ? ` ${experienceMonths} month${experienceMonths !== 1 ? 's' : ''}` : ''}`;

        const prompt = `You are an expert ATS (Applicant Tracking System) resume evaluator and career advisor.

Evaluate the following resume for ATS compatibility and provide:
1. An ATS compatibility score from 0 to 100
2. A brief 1-2 sentence summary of the evaluation
3. Specific, actionable suggestions to improve the ATS score (if any)

Consider these factors:
- Keyword optimization for the target role
- Formatting and structure
- Quantifiable achievements
- Skills relevance to the job role
- Experience alignment
- Education relevance
${jobDescription ? '- How well the resume matches the provided job description' : ''}

TARGET JOB ROLE: ${jobRole.trim()}
TOTAL WORK EXPERIENCE: ${totalExp}
${jobDescription?.trim() ? `\nJOB DESCRIPTION:\n${jobDescription.trim()}\n` : ''}
RESUME CONTENT:
${resumeText}

IMPORTANT: Respond ONLY in the following strict JSON format (no markdown, no code blocks):
{"score": <number 0-100>, "summary": "<brief evaluation summary>", "suggestions": ["<suggestion 1>", "<suggestion 2>", ...]}`;

        // ── Backend call ──────────────────────────────────────────────
        const res = await fetch(`${BASE_URL}/api/ai/enhance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ prompt, context: 'ats-score', tokenCost: TOKEN_COST }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err?.message || `ATS Score request failed (${res.status})`);
        }

        const data = await res.json();
        const raw = data?.result?.trim() ?? '';

        // ── Parse the JSON response ──────────────────────────────────
        try {
            // Strip potential markdown code-block wrapper
            const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
            const parsed = JSON.parse(cleaned);

            // Refresh usage from backend (this accounts for the 5-token cost on server)
            refreshUsage();

            return {
                score: Math.min(100, Math.max(0, Number(parsed.score) || 0)),
                summary: parsed.summary || 'Evaluation complete.',
                suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
            };
        } catch {
            // If AI didn't return valid JSON, try to extract what we can
            refreshUsage();
            return {
                score: 0,
                summary: raw.slice(0, 200) || 'Could not parse AI response.',
                suggestions: ['Try again — the AI response was not in the expected format.'],
            };
        }
    };

    return { checkATSScore, TOKEN_COST };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildResumeText(data) {
    const parts = [];

    // Personal info
    if (data.personalInfo) {
        const p = data.personalInfo;
        parts.push(`NAME: ${p.fullName || ''}`);
        parts.push(`CONTACT: ${[p.email, p.phone, p.location].filter(Boolean).join(' | ')}`);
        if (p.linkedin) parts.push(`LinkedIn: ${p.linkedin}`);
        if (p.github) parts.push(`GitHub: ${p.github}`);
        if (p.portfolio) parts.push(`Portfolio: ${p.portfolio}`);
    }

    // Summary
    if (data.summary) {
        parts.push(`\nPROFESSIONAL SUMMARY:\n${data.summary}`);
    }

    // Experience
    if (data.experience?.length) {
        parts.push('\nEXPERIENCE:');
        data.experience.forEach((exp) => {
            parts.push(`${exp.role} at ${exp.company} (${exp.duration})`);
            exp.points?.forEach((pt) => parts.push(`• ${pt}`));
        });
    }

    // Projects
    if (data.projects?.length) {
        parts.push('\nPROJECTS:');
        data.projects.forEach((proj) => {
            parts.push(`${proj.title} — ${proj.tech}`);
            proj.points?.forEach((pt) => parts.push(`• ${pt}`));
        });
    }

    // Skills
    if (data.skills) {
        parts.push('\nSKILLS:');
        Object.entries(data.skills).forEach(([category, value]) => {
            if (value) parts.push(`${category}: ${value}`);
        });
    }

    // Education
    if (data.education?.length) {
        parts.push('\nEDUCATION:');
        data.education.forEach((edu) => {
            parts.push(`${edu.degree} — ${edu.school} (${edu.duration})${edu.score ? ` | ${edu.score}` : ''}`);
        });
    }

    // Achievements
    if (data.achievements?.length) {
        parts.push('\nACHIEVEMENTS:');
        data.achievements.forEach((a) => parts.push(`• ${a}`));
    }

    return parts.join('\n');
}

export default useATSScore;
