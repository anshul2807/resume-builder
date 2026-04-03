import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * AISettingsPanel — replaces the old provider/API-key panel.
 *
 * For logged-in users: shows account info, daily Enhance usage, logout.
 * For guests: explains what they're missing and prompts login.
 *
 * Props:
 *  onOpenAuth — callback(tab) — opens the AuthModal with 'login' or 'signup'
 */
const AISettingsPanel = ({ onOpenAuth }) => {
    const {
        isLoggedIn, user, logout,
        enhanceUsageToday, enhanceLimitReached, DAILY_ENHANCE_LIMIT,
    } = useAuth();

    const usagePct = Math.min((enhanceUsageToday / DAILY_ENHANCE_LIMIT) * 100, 100);

    return (
        <div className="pb-24 space-y-6">

            {/* Hero card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 p-5 text-white">
                <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
                <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                        {/* Gemini icon */}
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M12 2C6.8 7.2 6.8 16.8 12 22c5.2-5.2 5.2-14.8 0-20Z" opacity=".9" />
                            <path d="M2 12c5.2-5.2 14.8-5.2 20 0-5.2 5.2-14.8 5.2-20 0Z" opacity=".5" />
                        </svg>
                        <span className="font-black text-sm tracking-wide">AI Resume Enhancement</span>
                    </div>
                    <p className="text-[11px] leading-snug text-white/80">
                        Powered by <strong className="text-white">Google Gemini</strong>.
                        Click the <strong className="text-white">✦ star button</strong> beside any field to
                        instantly fix grammar, complete sentences, and polish your text—without changing your word count.
                    </p>
                </div>
            </div>

            {isLoggedIn ? (
                /* ── LOGGED-IN STATE ─────────────────────────────────────────── */
                <>
                    {/* User card */}
                    <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500
                                        flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                            {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            {user?.name && (
                                <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                            )}
                            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="flex-shrink-0 text-[11px] text-slate-400 hover:text-red-500
                                       font-semibold transition-colors flex items-center gap-1"
                        >
                            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                            </svg>
                            Log out
                        </button>
                    </div>

                    {/* Daily usage meter */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                                Daily AI Enhances
                            </p>
                            <span className={`text-[11px] font-bold ${enhanceLimitReached ? 'text-red-500' : 'text-slate-600'}`}>
                                {enhanceUsageToday} / {DAILY_ENHANCE_LIMIT}
                            </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500
                                    ${enhanceLimitReached
                                        ? 'bg-red-400'
                                        : usagePct > 70
                                            ? 'bg-amber-400'
                                            : 'bg-gradient-to-r from-violet-500 to-purple-500'}`}
                                style={{ width: `${usagePct}%` }}
                            />
                        </div>
                        {enhanceLimitReached ? (
                            <p className="text-[10px] text-red-500 mt-1.5 font-semibold">
                                Daily limit reached — resets at midnight.
                            </p>
                        ) : (
                            <p className="text-[10px] text-slate-400 mt-1.5">
                                Resets daily at midnight. Limit: {DAILY_ENHANCE_LIMIT} enhancements/day.
                            </p>
                        )}
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-semibold
                                    bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        AI Enhancement active — click any ✦ star button
                    </div>

                    {/* What AI does info box */}
                    <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 space-y-2">
                        <p className="text-[11px] font-bold text-violet-700 mb-2">What AI Enhance does:</p>
                        {[
                            '✅  Corrects all grammatical errors',
                            '✅  Completes fragmented sentences',
                            '✅  Preserves your original word count',
                        ].map((item) => (
                            <p key={item} className="text-[11px] text-violet-600 leading-snug">{item}</p>
                        ))}
                    </div>

                    {/* Resume saved badge */}
                    <div className="flex items-center gap-2 text-[11px] text-blue-700 font-semibold
                                    bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
                            <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                        </svg>
                        Your resume is saved to your account
                    </div>
                </>
            ) : (
                /* ── GUEST STATE ─────────────────────────────────────────────── */
                <>
                    {/* Lock callout */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-amber-600">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-amber-800 mb-1">AI Enhance requires login</p>
                                <p className="text-[11px] text-amber-700 leading-relaxed">
                                    Create a free account to unlock AI-powered text enhancement.
                                    You get <strong>{DAILY_ENHANCE_LIMIT} enhancements per day</strong>.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* What you get */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-3">
                            What you unlock
                        </p>
                        <div className="space-y-2.5">
                            {[
                                { icon: '✦', label: 'AI-powered text enhancement', color: 'text-violet-500' },
                                { icon: '✅', label: 'Grammar & sentence correction', color: 'text-emerald-500' },
                                { icon: '💾', label: 'Resume saved to your account', color: 'text-blue-500' },
                                { icon: '🔒', label: 'Your data is private & secure', color: 'text-slate-500' },
                            ].map(({ icon, label, color }) => (
                                <div key={label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <span className={`text-base ${color}`}>{icon}</span>
                                    <p className="text-[12px] font-semibold text-slate-700">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA buttons */}
                    <div className="space-y-2.5 pt-1">
                        <button
                            id="auth-signup-btn"
                            onClick={() => onOpenAuth?.('signup')}
                            className="w-full py-3.5 rounded-xl font-bold text-sm text-white
                                       bg-gradient-to-r from-blue-600 to-violet-600
                                       hover:opacity-90 active:scale-[0.98] shadow-md shadow-blue-200
                                       transition-all duration-200"
                        >
                            Create Free Account
                        </button>
                        <button
                            id="auth-login-btn"
                            onClick={() => onOpenAuth?.('login')}
                            className="w-full py-3 rounded-xl font-bold text-sm text-slate-600
                                       border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50
                                       transition-all duration-200"
                        >
                            Log In
                        </button>
                    </div>

                    {/* Guest note */}
                    <p className="text-center text-[10px] text-slate-400 leading-relaxed">
                        You can still build your resume as a guest.
                        Your data is saved in this browser only.
                    </p>
                </>
            )}
        </div>
    );
};

export default AISettingsPanel;
