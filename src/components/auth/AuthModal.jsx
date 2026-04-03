import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * AuthModal — Login & Sign-up UI.
 *
 * Props:
 *  isOpen    — controls visibility
 *  onClose   — callback to hide the modal
 *  initialTab — 'login' | 'signup' (default 'login')
 */
const AuthModal = ({ isOpen, onClose, initialTab = 'login' }) => {
    const { login, signup } = useAuth();
    const [tab, setTab] = useState(initialTab);
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const firstInputRef = useRef(null);

    // Reset state when modal opens / tab changes
    useEffect(() => {
        if (isOpen) {
            setTab(initialTab);
            setForm({ name: '', email: '', password: '' });
            setError('');
            setSuccess('');
            setTimeout(() => firstInputRef.current?.focus(), 50);
        }
    }, [isOpen, initialTab]);

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Basic client-side validation
        if (!form.email.trim() || !form.password.trim()) {
            setError('Please fill in all required fields.');
            return;
        }
        if (tab === 'signup' && !form.name.trim()) {
            setError('Please enter your name.');
            return;
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setIsLoading(true);
        try {
            if (tab === 'login') {
                await login(form.email.trim(), form.password);
                setSuccess('Welcome back! You\'re now logged in.');
            } else {
                await signup(form.email.trim(), form.password, form.name.trim());
                setSuccess('Account created! You\'re now logged in.');
            }
            setTimeout(onClose, 800);
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const switchTab = (t) => {
        setTab(t);
        setForm({ name: '', email: '', password: '' });
        setError('');
        setSuccess('');
    };

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Modal card */}
            <div
                className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
                style={{ animation: 'modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}
            >
                {/* Gradient header */}
                <div className="relative bg-gradient-to-br from-blue-600 to-violet-700 px-8 pt-8 pb-12">
                    <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-white"
                        style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }} />

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                        aria-label="Close"
                    >
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>

                    <div className="relative">
                        {/* Small Gemini-style icon */}
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                                <path d="M12 2C6.8 7.2 6.8 16.8 12 22c5.2-5.2 5.2-14.8 0-20Z" opacity=".9" />
                                <path d="M2 12c5.2-5.2 14.8-5.2 20 0-5.2 5.2-14.8 5.2-20 0Z" opacity=".5" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-black text-white">
                            {tab === 'login' ? 'Welcome back' : 'Create account'}
                        </h2>
                        <p className="text-sm text-blue-100 mt-0.5">
                            {tab === 'login'
                                ? 'Log in to save your resume & use AI Enhance'
                                : 'Sign up free — your resume is saved securely'}
                        </p>
                    </div>
                </div>

                {/* Tab switcher */}
                <div className="px-8 pt-6">
                    <div className="flex bg-slate-100 rounded-xl p-1 gap-1 mb-6">
                        {[{ id: 'login', label: 'Log in' }, { id: 'signup', label: 'Sign up' }].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => switchTab(t.id)}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-200
                                    ${tab === t.id
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {tab === 'signup' && (
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Full Name
                                </label>
                                <input
                                    ref={tab === 'signup' ? firstInputRef : null}
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Jane Smith"
                                    autoComplete="name"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm
                                               focus:border-blue-500 focus:ring-0 outline-none transition-colors
                                               placeholder-slate-300"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                Email Address
                            </label>
                            <input
                                ref={tab === 'login' ? firstInputRef : null}
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                autoComplete="email"
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm
                                           focus:border-blue-500 focus:ring-0 outline-none transition-colors
                                           placeholder-slate-300"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder={tab === 'signup' ? 'At least 6 characters' : '••••••••'}
                                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm
                                           focus:border-blue-500 focus:ring-0 outline-none transition-colors
                                           placeholder-slate-300"
                            />
                        </div>

                        {/* Error / success feedback */}
                        {error && (
                            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <p className="text-[11px] text-red-700 leading-snug">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                                <p className="text-[11px] text-emerald-700 font-semibold leading-snug">{success}</p>
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200
                                ${isLoading
                                    ? 'bg-blue-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 active:scale-[0.98] shadow-md shadow-blue-200'}`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    {tab === 'login' ? 'Logging in…' : 'Creating account…'}
                                </span>
                            ) : (
                                tab === 'login' ? 'Log in' : 'Create Account'
                            )}
                        </button>
                    </form>
                </div>

                {/* Guest note */}
                <p className="text-center text-[11px] text-slate-400 mt-5 pb-6 px-8">
                    {tab === 'login' ? (
                        <>No account? <button onClick={() => switchTab('signup')} className="text-blue-500 font-semibold hover:underline">Sign up free</button></>
                    ) : (
                        <>Already have an account? <button onClick={() => switchTab('login')} className="text-blue-500 font-semibold hover:underline">Log in</button></>
                    )}
                </p>
            </div>

            <style>{`
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.9) translateY(10px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default AuthModal;
