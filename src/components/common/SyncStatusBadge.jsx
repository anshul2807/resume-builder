import React from 'react';

/**
 * SyncStatusBadge — a tiny animated badge showing resume save state.
 *
 * Props:
 *  status — 'idle' | 'loading' | 'syncing' | 'saved' | 'error'
 */
const SyncStatusBadge = ({ status }) => {
    if (status === 'idle') return null;

    const configs = {
        loading: {
            bg: 'bg-blue-50 border-blue-100',
            text: 'text-blue-600',
            dot: 'bg-blue-400 animate-pulse',
            label: 'Loading…',
            spin: true,
        },
        syncing: {
            bg: 'bg-amber-50 border-amber-100',
            text: 'text-amber-600',
            dot: 'bg-amber-400 animate-pulse',
            label: 'Saving…',
            spin: true,
        },
        saving: {
            bg: 'bg-amber-50 border-amber-100',
            text: 'text-amber-600',
            dot: 'bg-amber-400 animate-pulse',
            label: 'Saving…',
            spin: true,
        },
        saved: {
            bg: 'bg-emerald-50 border-emerald-100',
            text: 'text-emerald-600',
            dot: 'bg-emerald-500',
            label: 'Saved ✓',
            spin: false,
        },
        error: {
            bg: 'bg-red-50 border-red-100',
            text: 'text-red-500',
            dot: 'bg-red-400',
            label: 'Save failed',
            spin: false,
        },
    };

    const c = configs[status];
    if (!c) return null;

    return (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold
                         transition-all duration-300 ${c.bg} ${c.text}`}>
            {c.spin ? (
                <svg className="w-2.5 h-2.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            ) : (
                <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            )}
            {c.label}
        </div>
    );
};

export default SyncStatusBadge;
