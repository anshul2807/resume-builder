import React, { useState } from 'react';
import useATSScore from '../../hooks/useATSScore';
import { useAuth } from '../../context/AuthContext';

/**
 * ATSScoreModal — Full-screen modal for ATS score checking.
 *
 * Flow:
 *  1. User fills in Work Experience, Job Role, and (optionally) Job Description
 *  2. Clicks "Check ATS Score" → calls backend AI (costs 5 tokens)
 *  3. Displays animated score circle + summary + improvement suggestions
 *
 * Props:
 *  isOpen   — boolean
 *  onClose  — callback to close the modal
 */
const ATSScoreModal = ({ isOpen, onClose }) => {
    const { checkATSScore, TOKEN_COST } = useATSScore();
    const { enhanceUsageToday, DAILY_ENHANCE_LIMIT } = useAuth();

    // ── Form state ──────────────────────────────────────────────────
    const [experienceYears, setExperienceYears] = useState('');
    const [experienceMonths, setExperienceMonths] = useState('');
    const [jobRole, setJobRole] = useState('');
    const [jobDescription, setJobDescription] = useState('');

    // ── Result state ────────────────────────────────────────────────
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);   // { score, summary, suggestions }
    const [error, setError] = useState('');

    const remaining = DAILY_ENHANCE_LIMIT - enhanceUsageToday;
    const canAfford = remaining >= TOKEN_COST;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResult(null);
        setLoading(true);

        try {
            const data = await checkATSScore({
                experienceYears: parseInt(experienceYears, 10) || 0,
                experienceMonths: parseInt(experienceMonths, 10) || 0,
                jobRole,
                jobDescription,
            });
            setResult(data);
        } catch (err) {
            setError(err.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        // Reset state when closing
        setResult(null);
        setError('');
        onClose?.();
    };

    const handleBack = () => {
        setResult(null);
        setError('');
    };

    if (!isOpen) return null;

    // ── Score colour helpers ────────────────────────────────────────
    const getScoreColor = (s) => {
        if (s >= 80) return { ring: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', text: '#059669', label: 'Excellent' };
        if (s >= 60) return { ring: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', text: '#2563eb', label: 'Good' };
        if (s >= 40) return { ring: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', text: '#d97706', label: 'Needs Work' };
        return { ring: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', text: '#dc2626', label: 'Poor' };
    };

    return (
        <div className="ats-modal-overlay" onClick={handleClose}>
            <div className="ats-modal" onClick={(e) => e.stopPropagation()}>

                {/* ── Header ────────────────────────────────────────── */}
                <div className="ats-modal-header">
                    <div className="ats-modal-header-left">
                        <div className="ats-modal-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="ats-modal-title">ATS Score Check</h2>
                            <p className="ats-modal-subtitle">
                                Costs <strong>{TOKEN_COST} tokens</strong> · {remaining} remaining today
                            </p>
                        </div>
                    </div>
                    <button className="ats-modal-close" onClick={handleClose} aria-label="Close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* ── Body ──────────────────────────────────────────── */}
                <div className="ats-modal-body">
                    {!result ? (
                        /* ── FORM VIEW ────────────────────────────────── */
                        <form onSubmit={handleSubmit} className="ats-form">

                            {/* Work Experience */}
                            <div className="ats-field-group">
                                <span className="ats-label">
                                    <span className="ats-label-icon">💼</span>
                                    Total Work Experience
                                </span>
                                <div className="ats-exp-grid">
                                    <div className="ats-input-wrap">
                                        <label htmlFor="ats-exp-years" className="sr-only">Years of experience</label>
                                        <input
                                            id="ats-exp-years"
                                            type="number"
                                            min="0"
                                            max="50"
                                            placeholder="0"
                                            value={experienceYears}
                                            onChange={(e) => setExperienceYears(e.target.value)}
                                            className="ats-input"
                                            required
                                        />
                                        <span className="ats-input-suffix">Years</span>
                                    </div>
                                    <div className="ats-input-wrap">
                                        <label htmlFor="ats-exp-months" className="sr-only">Months of experience</label>
                                        <input
                                            id="ats-exp-months"
                                            type="number"
                                            min="0"
                                            max="11"
                                            placeholder="0"
                                            value={experienceMonths}
                                            onChange={(e) => setExperienceMonths(e.target.value)}
                                            className="ats-input"
                                        />
                                        <span className="ats-input-suffix">Months</span>
                                    </div>
                                </div>
                            </div>

                            {/* Job Role */}
                            <div className="ats-field-group">
                                <label className="ats-label" htmlFor="ats-job-role">
                                    <span className="ats-label-icon">🎯</span>
                                    Target Job Role
                                </label>
                                <input
                                    id="ats-job-role"
                                    type="text"
                                    placeholder="e.g. Senior Frontend Engineer"
                                    value={jobRole}
                                    onChange={(e) => setJobRole(e.target.value)}
                                    className="ats-input"
                                    required
                                />
                            </div>

                            {/* Job Description (optional) */}
                            <div className="ats-field-group">
                                <label className="ats-label" htmlFor="ats-job-desc">
                                    <span className="ats-label-icon">📋</span>
                                    Job Description
                                    <span className="ats-optional-badge">Optional</span>
                                </label>
                                <textarea
                                    id="ats-job-desc"
                                    rows={5}
                                    placeholder="Paste the job description here for a more accurate score..."
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    className="ats-input ats-textarea"
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="ats-error">
                                    <svg viewBox="0 0 20 20" fill="currentColor" className="ats-error-icon">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading || !canAfford}
                                className="ats-submit-btn"
                            >
                                {loading ? (
                                    <>
                                        <svg className="ats-spinner" viewBox="0 0 24 24" fill="none">
                                            <circle className="ats-spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="ats-spinner-head" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Analyzing your resume...
                                    </>
                                ) : !canAfford ? (
                                    <>
                                        <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                        Not enough tokens ({remaining}/{TOKEN_COST})
                                    </>
                                ) : (
                                    <>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 18, height: 18 }}>
                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        Check ATS Score — {TOKEN_COST} Tokens
                                    </>
                                )}
                            </button>

                            {/* Info note */}
                            <p className="ats-info-note">
                                Your resume data is sent securely to our AI for analysis.
                                No data is stored or shared.
                            </p>
                        </form>
                    ) : (
                        /* ── RESULT VIEW ──────────────────────────────── */
                        <div className="ats-result">
                            {/* Score Circle */}
                            <div className="ats-score-section">
                                <div
                                    className="ats-score-circle"
                                    style={{
                                        '--score-color': getScoreColor(result.score).ring,
                                        '--score-bg': getScoreColor(result.score).bg,
                                        '--score-deg': `${(result.score / 100) * 360}deg`,
                                    }}
                                >
                                    <div className="ats-score-inner">
                                        <span className="ats-score-number">{result.score}</span>
                                        <span className="ats-score-out-of">/100</span>
                                    </div>
                                </div>
                                <span
                                    className="ats-score-label"
                                    style={{ color: getScoreColor(result.score).text }}
                                >
                                    {getScoreColor(result.score).label}
                                </span>
                            </div>

                            {/* Summary */}
                            <div className="ats-result-summary">
                                <p>{result.summary}</p>
                            </div>

                            {/* Suggestions */}
                            {result.suggestions?.length > 0 && (
                                <div className="ats-suggestions">
                                    <h3 className="ats-suggestions-title">
                                        <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        Suggestions to Improve
                                    </h3>
                                    <ul className="ats-suggestions-list">
                                        {result.suggestions.map((s, i) => (
                                            <li key={i} className="ats-suggestion-item">
                                                <span className="ats-suggestion-bullet">{i + 1}</span>
                                                <span>{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="ats-result-actions">
                                <button className="ats-back-btn" onClick={handleBack}>
                                    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
                                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                    Try Again
                                </button>
                                <button className="ats-done-btn" onClick={handleClose}>
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ATSScoreModal;
