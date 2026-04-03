import React, { useState } from 'react';
import useAIEnhance from '../../hooks/useAIEnhance';
import { useAuth } from '../../context/AuthContext';

/**
 * AIButton — the reusable ✦ star icon button.
 *
 * Auth-gating:
 *  - Guest users see a locked version with a tooltip explaining they must log in.
 *  - Rate-limited users see a disabled button with their limit message.
 *
 * Props:
 *  value       — current field text to improve
 *  onReplace   — callback(improvedText) to update state
 *  context     — passed to useAIEnhance for the correct prompt
 *  size        — 'sm' (icon only) | 'md' (icon + label)
 *  onAuthClick — optional: called when a guest clicks the locked button (open modal)
 */
const AIButton = ({ value, onReplace, context = 'generic', size = 'sm', onAuthClick }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const enhance = useAIEnhance();
    const { isLoggedIn, enhanceLimitReached, enhanceUsageToday, DAILY_ENHANCE_LIMIT } = useAuth();

    const handleClick = async () => {
        // Guest click → open auth modal instead of calling AI
        if (!isLoggedIn) {
            onAuthClick?.();
            return;
        }

        if (enhanceLimitReached) {
            setError(`Daily limit of ${DAILY_ENHANCE_LIMIT} reached. Come back tomorrow!`);
            setTimeout(() => setError(null), 4000);
            return;
        }

        setError(null);
        setSuccess(false);
        setIsLoading(true);
        try {
            const result = await enhance(value, context);
            onReplace(result);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (err) {
            setError(err.message);
            setTimeout(() => setError(null), 5000);
        } finally {
            setIsLoading(false);
        }
    };

    const isEmpty = !value?.trim();
    const isGuest = !isLoggedIn;
    const isDisabled = isLoading || (isEmpty && !isGuest);

    // ── Compact icon-only variant (for inline bullet-point rows) ──────────────
    if (size === 'sm') {
        return (
            <div className="relative flex-shrink-0">
                <button
                    onClick={handleClick}
                    disabled={isDisabled && !isGuest}
                    title={
                        isGuest
                            ? 'Log in to use AI Enhancement'
                            : enhanceLimitReached
                                ? `Daily limit (${DAILY_ENHANCE_LIMIT}) reached`
                                : isEmpty
                                    ? 'Type something first'
                                    : `Enhance with AI ✦ (${enhanceUsageToday}/${DAILY_ENHANCE_LIMIT} today)`
                    }
                    className={`
                        w-7 h-7 rounded-full flex items-center justify-center
                        transition-all duration-200 focus:outline-none relative
                        ${isLoading
                            ? 'bg-purple-100 cursor-not-allowed'
                            : isGuest
                                ? 'bg-slate-100 text-slate-400 cursor-pointer hover:bg-slate-200 hover:scale-110'
                                : enhanceLimitReached
                                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                    : isEmpty
                                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                        : success
                                            ? 'bg-emerald-500 text-white scale-110'
                                            : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white cursor-pointer hover:scale-110 hover:shadow-md hover:shadow-purple-200 active:scale-95'
                        }
                    `}
                >
                    {isLoading ? (
                        <svg className="w-3 h-3 animate-spin text-purple-500" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    ) : success ? (
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    ) : isGuest ? (
                        /* Lock icon for guest */
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                        </svg>
                    )}
                </button>

                {/* Floating error / guest tooltip */}
                {error && (
                    <div className="absolute top-9 right-0 z-50 w-56 bg-red-50 border border-red-200
                                    text-red-700 text-[10px] leading-snug rounded-xl px-3 py-2 shadow-lg">
                        <strong className="block mb-0.5">AI Error</strong>
                        {error}
                    </div>
                )}
            </div>
        );
    }

    // ── Pill variant (for textarea bottom-bar) ────────────────────────────────
    return (
        <div className="relative">
            <button
                onClick={handleClick}
                disabled={isDisabled && !isGuest}
                className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold
                    transition-all duration-200 focus:outline-none select-none
                    ${isLoading
                        ? 'bg-purple-100 text-purple-400 cursor-not-allowed'
                        : isGuest
                            ? 'bg-slate-100 text-slate-500 cursor-pointer hover:bg-slate-200'
                            : enhanceLimitReached
                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                : isEmpty
                                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                    : success
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white cursor-pointer hover:opacity-90 hover:shadow-md hover:shadow-purple-200 active:scale-95'
                    }
                `}
            >
                {isLoading ? (
                    <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                ) : success ? (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                ) : isGuest ? (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                    </svg>
                )}
                {isLoading
                    ? 'Enhancing…'
                    : success
                        ? 'Done!'
                        : isGuest
                            ? '🔒 Log in to Enhance'
                            : enhanceLimitReached
                                ? `Limit reached (${DAILY_ENHANCE_LIMIT}/day)`
                                : `✦ Enhance with AI (${enhanceUsageToday}/${DAILY_ENHANCE_LIMIT})`}
            </button>

            {error && (
                <div className="absolute bottom-10 left-0 z-50 w-64 bg-red-50 border border-red-200
                                text-red-700 text-[10px] leading-snug rounded-xl px-3 py-2 shadow-lg">
                    <strong className="block mb-0.5">AI Error</strong>
                    {error}
                </div>
            )}
        </div>
    );
};

export default AIButton;
