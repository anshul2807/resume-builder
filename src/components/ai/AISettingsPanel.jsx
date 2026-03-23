import React, { useState } from 'react';
import { useAI, AI_PROVIDERS } from '../../context/AIContext';

const BADGE_COLORS = {
    emerald: 'bg-emerald-100 text-emerald-700',
    teal: 'bg-teal-100 text-teal-700',
    amber: 'bg-amber-100 text-amber-700',
};

/* Inline monochrome provider logos (SVG paths) */
const ProviderIcon = ({ id, size = 20 }) => {
    if (id === 'gemini') return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.8 7.2 6.8 16.8 12 22c5.2-5.2 5.2-14.8 0-20Z" fill="currentColor" opacity=".9" />
            <path d="M2 12c5.2-5.2 14.8-5.2 20 0-5.2 5.2-14.8 5.2-20 0Z" fill="currentColor" opacity=".5" />
        </svg>
    );
    if (id === 'openai') return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.985 5.985 0 0 0 .51 4.911 6.046 6.046 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.046 6.046 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.046 6.046 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.677l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.845-3.374L15.112 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.4-.667zm2.010-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
        </svg>
    );
    // Claude — abstract hexagonal icon
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2 2 7v10l10 5 10-5V7L12 2zm0 2.24L20 8.5v7L12 19.76 4 15.5v-7L12 4.24z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
};

const AISettingsPanel = () => {
    const { aiConfig, updateAIConfig } = useAI();
    const [showKey, setShowKey] = useState(false);

    const currentProvider = AI_PROVIDERS[aiConfig.provider];

    const handleProviderSelect = (pid) => {
        updateAIConfig({
            provider: pid,
            model: AI_PROVIDERS[pid].models[0].id,
        });
    };

    return (
        <div className="pb-24 space-y-6">

            {/* Hero card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 p-5 text-white">
                <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
                <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                        </svg>
                        <span className="font-black text-sm tracking-wide">AI Resume Enhancement</span>
                    </div>
                    <p className="text-[11px] leading-snug text-white/80">
                        Click the <strong className="text-white">★ star button</strong> beside any field to
                        instantly rewrite it using AI. Add your API key below to get started — it's stored
                        only in your browser.
                    </p>
                </div>
            </div>

            {/* Provider selection */}
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-3">
                    AI Provider
                </p>
                <div className="space-y-2">
                    {Object.values(AI_PROVIDERS).map((p) => {
                        const isSelected = aiConfig.provider === p.id;
                        return (
                            <button
                                key={p.id}
                                onClick={() => handleProviderSelect(p.id)}
                                className={`
                  w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-left
                  transition-all duration-150
                  ${isSelected
                                        ? 'border-violet-500 bg-violet-50'
                                        : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                                    }
                `}
                            >
                                <span className={`mt-0.5 flex-shrink-0 ${isSelected ? 'text-violet-600' : 'text-slate-400'}`}>
                                    <ProviderIcon id={p.id} size={20} />
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className={`text-sm font-bold ${isSelected ? 'text-violet-700' : 'text-slate-700'}`}>
                                            {p.name}
                                        </p>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${BADGE_COLORS[p.badgeColor]}`}>
                                            {p.badge}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400">
                                        {p.models.map((m) => m.name).join(' · ')}
                                    </p>
                                    {p.corsNote && (
                                        <p className="text-[10px] text-amber-600 mt-1 leading-snug">
                                            ⚠️ {p.corsNote}
                                        </p>
                                    )}
                                </div>
                                {isSelected && (
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center mt-0.5">
                                        <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2 5l2 2 4-4" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Model selector */}
            <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2">
                    Model
                </label>
                <select
                    value={aiConfig.model}
                    onChange={(e) => updateAIConfig({ model: e.target.value })}
                    className="w-full p-2.5 border-2 border-slate-100 rounded-xl text-sm font-medium
                     text-slate-700 bg-white outline-none focus:ring-2 focus:ring-violet-500
                     focus:border-transparent cursor-pointer transition-all"
                >
                    {currentProvider.models.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>
            </div>

            {/* API Key input */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                        API Key
                    </label>
                    <a
                        href={currentProvider.keyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-violet-500 hover:text-violet-700 hover:underline transition-colors"
                    >
                        Get key →
                    </a>
                </div>
                <div className="relative">
                    <input
                        type={showKey ? 'text' : 'password'}
                        value={aiConfig.apiKey}
                        onChange={(e) => updateAIConfig({ apiKey: e.target.value })}
                        placeholder={`Paste your ${currentProvider.name} API key…`}
                        className="w-full p-3 pr-10 border-2 border-slate-200 rounded-xl text-sm font-mono
                       focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none
                       transition-all placeholder-slate-300"
                    />
                    <button
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        title={showKey ? 'Hide key' : 'Show key'}
                    >
                        {showKey ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                    🔒 Stored <strong>only in your browser</strong> (localStorage). Never sent anywhere except
                    directly to {currentProvider.name}'s API.
                </p>
            </div>

            {/* Key link helper */}
            <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[11px] font-bold text-slate-600 mb-1.5">Where to get your key:</p>
                <a
                    href={currentProvider.keyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-violet-600 hover:underline flex items-center gap-1"
                >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                    {currentProvider.keyLinkLabel}
                </a>
            </div>

            {/* Status badge */}
            {aiConfig.apiKey ? (
                <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-semibold
                        bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    API key saved — ✦ star buttons are active!
                </div>
            ) : (
                <div className="flex items-center gap-2 text-[11px] text-amber-600 font-semibold
                        bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    Add an API key to enable AI enhancement.
                </div>
            )}
        </div>
    );
};

export default AISettingsPanel;
