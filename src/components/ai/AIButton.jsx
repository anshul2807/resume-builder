import React, { useState } from 'react';
import useAIEnhance from '../../hooks/useAIEnhance';

/**
 * AIButton — the reusable ✦ star icon button.
 *
 * Placement:
 *  • Beside a single-line input  → compact square icon (size="sm", default)
 *  • Below a multi-line textarea → wider pill button    (size="md")
 *
 * Props:
 *  value     — current field text to improve
 *  onReplace — callback(improvedText) to update state
 *  context   — passed to useAIEnhance for the correct prompt
 *  size      — 'sm' (icon only) | 'md' (icon + label)
 */
const AIButton = ({ value, onReplace, context = 'generic', size = 'sm' }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const enhance = useAIEnhance();

    const handleClick = async () => {
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
    const isDisabled = isLoading || isEmpty;

    // ── Compact icon-only variant (for inline bullet-point rows) ──────────────
    if (size === 'sm') {
        return (
            <div className="relative flex-shrink-0">
                <button
                    onClick={handleClick}
                    disabled={isDisabled}
                    title={isEmpty ? 'Type something first' : 'Enhance with AI ✦'}
                    className={`
            w-7 h-7 rounded-full flex items-center justify-center
            transition-all duration-200 focus:outline-none
            ${isLoading
                            ? 'bg-purple-100 cursor-not-allowed'
                            : isEmpty
                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                : success
                                    ? 'bg-emerald-500 text-white scale-110'
                                    : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white cursor-pointer hover:scale-110 hover:shadow-md hover:shadow-purple-200 active:scale-95'
                        }
          `}
                >
                    {isLoading ? (
                        /* Spinner */
                        <svg className="w-3 h-3 animate-spin text-purple-500" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    ) : success ? (
                        /* Check */
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        /* Star */
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                        </svg>
                    )}
                </button>

                {/* Floating error badge */}
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
                disabled={isDisabled}
                className={`
          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold
          transition-all duration-200 focus:outline-none select-none
          ${isLoading
                        ? 'bg-purple-100 text-purple-400 cursor-not-allowed'
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
                ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                    </svg>
                )}
                {isLoading ? 'Enhancing…' : success ? 'Done!' : '✦ Enhance with AI'}
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
