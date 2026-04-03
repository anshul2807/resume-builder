import React, { useState, useEffect, useCallback } from 'react';
import { BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

/**
 * AdminPanel — visible only to users whose email is in ADMIN_EMAILS.
 *
 * Features:
 *  - List all registered users (GET /api/admin/users)
 *  - Edit any user's daily AI Enhance token limit (PATCH /api/admin/users/:id/limit)
 *  - Search/filter users by name or email
 *
 * Backend endpoints required:
 *  GET  /api/admin/users
 *    → { users: [{ id, name, email, dailyLimit, enhanceUsageToday, createdAt }] }
 *
 *  PATCH /api/admin/users/:id/limit
 *    Body: { dailyLimit: number }
 *    → { message: "Updated", user: { id, dailyLimit } }
 */
const AdminPanel = () => {
    const { token } = useAuth();

    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [search, setSearch] = useState('');

    // Editing state: { userId, value }
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState({ id: null, type: '', text: '' });

    // ── Fetch users ───────────────────────────────────────────────────────
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setFetchError('');
        try {
            const res = await fetch(`${BASE_URL}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.message || `Error ${res.status}`);
            }
            const data = await res.json();
            // console.log(data);
            setUsers(data.length > 0 ? data : []);
        } catch (err) {
            setFetchError(err.message || 'Failed to load users.');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    // ── Save limit ────────────────────────────────────────────────────────
    const saveLimit = async (userId, newLimit) => {
        const parsed = parseInt(newLimit, 10);
        if (isNaN(parsed) || parsed < 0) return;

        setSaving(true);
        setSaveMsg({ id: null, type: '', text: '' });
        try {
            const res = await fetch(`${BASE_URL}/api/admin/users/${userId}/limit`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ dailyLimit: parsed }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);

            // Update local state
            setUsers((prev) =>
                prev.map((u) => u.id === userId ? { ...u, dailyLimit: parsed } : u)
            );
            setSaveMsg({ id: userId, type: 'success', text: `✓ Limit set to ${parsed}` });
            setEditing(null);
        } catch (err) {
            setSaveMsg({ id: userId, type: 'error', text: err.message });
        } finally {
            setSaving(false);
            setTimeout(() => setSaveMsg({ id: null, type: '', text: '' }), 3000);
        }
    };

    // ── Filtered users ────────────────────────────────────────────────────
    const filteredUsers = users.filter((u) => {
        const q = search.toLowerCase();
        return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    });

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div className="pb-24 space-y-5">

            {/* Header card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600 to-orange-500 p-5 text-white">
                <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
                <div className="relative flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-black text-sm tracking-wide">Admin Control Panel</p>
                        <p className="text-[11px] text-white/80 mt-0.5 leading-snug">
                            Manage users and configure their daily AI Enhance token limits.
                        </p>
                    </div>
                </div>
            </div>

            {/* Search + Refresh row */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <svg viewBox="0 0 20 20" fill="currentColor"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or email…"
                        className="w-full pl-9 pr-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm
                                   focus:border-rose-400 focus:ring-0 outline-none transition-colors placeholder-slate-300"
                    />
                </div>
                <button
                    onClick={fetchUsers}
                    disabled={isLoading}
                    title="Refresh"
                    className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-slate-200
                               hover:border-slate-300 transition-colors text-slate-500 hover:text-slate-700 flex-shrink-0"
                >
                    <svg viewBox="0 0 20 20" fill="currentColor"
                        className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}>
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {/* User count badge */}
            {!isLoading && !fetchError && (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                    {search && ` matching "${search}"`}
                </p>
            )}

            {/* States */}
            {isLoading && (
                <div className="flex items-center justify-center py-12 text-slate-400">
                    <svg className="w-5 h-5 animate-spin mr-2" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-sm">Loading users…</span>
                </div>
            )}

            {fetchError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <p className="text-sm font-semibold text-red-700">{fetchError}</p>
                    <button onClick={fetchUsers} className="text-[11px] text-red-500 hover:underline mt-1">
                        Retry
                    </button>
                </div>
            )}

            {/* User list */}
            {!isLoading && !fetchError && filteredUsers.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-sm">
                    No users found.
                </div>
            )}

            <div className="space-y-2">
                {filteredUsers.map((u) => {
                    const isEditing = editing?.userId === u.id;
                    const usagePct = Math.min(((u.usedToday ?? 0) / (u.dailyLimit || 1)) * 100, 100);

                    return (
                        <div key={u.id}
                            className="bg-white border-2 border-slate-100 rounded-2xl p-4 hover:border-slate-200 transition-colors">

                            {/* User info row */}
                            <div className="flex items-center gap-3 mb-3">
                                {/* Avatar */}
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-violet-500
                                                flex items-center justify-center text-white font-black text-[11px] flex-shrink-0">
                                    {u.name?.[0]?.toUpperCase() ?? u.email?.[0]?.toUpperCase() ?? '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-800 truncate">
                                        {u.name || '(no name)'}
                                    </p>
                                    <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                                </div>
                                {/* Joined date */}
                                {u.createdAt && (
                                    <p className="text-[10px] text-slate-300 flex-shrink-0">
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>

                            {/* Token limit section */}
                            <div className="bg-slate-50 rounded-xl p-3">
                                <div className="flex items-center justify-between mb-1.5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Daily AI Token Limit
                                    </p>

                                    <span className="text-[11px] font-bold text-slate-600">
                                        {u.usedToday ?? 0} / {u.dailyLimit ?? '—'} today
                                    </span>
                                </div>

                                {/* Usage bar */}
                                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500
                                            ${usagePct >= 100 ? 'bg-red-400' : usagePct > 70 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                        style={{ width: `${usagePct}%` }}
                                    />
                                </div>

                                {/* Edit limit row */}
                                <div className="flex items-center gap-2">
                                    {isEditing ? (
                                        <>
                                            <input
                                                autoFocus
                                                type="number"
                                                min="0"
                                                max="999"
                                                value={editing.value}
                                                onChange={(e) => setEditing({ userId: u.id, value: e.target.value })}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveLimit(u.id, editing.value);
                                                    if (e.key === 'Escape') setEditing(null);
                                                }}
                                                className="w-20 px-2 py-1.5 border-2 border-rose-300 rounded-lg text-sm font-bold
                                                           text-center outline-none focus:border-rose-500 transition-colors"
                                            />
                                            <button
                                                onClick={() => saveLimit(u.id, editing.value)}
                                                disabled={saving}
                                                className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-[11px]
                                                           font-bold rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {saving ? '…' : 'Save'}
                                            </button>
                                            <button
                                                onClick={() => setEditing(null)}
                                                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-600
                                                           text-[11px] font-bold rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-[12px] font-bold text-slate-700 min-w-[32px]">
                                                {u.dailyLimit ?? '—'}
                                            </span>
                                            <span className="text-[11px] text-slate-400 flex-1">enhancements/day</span>
                                            <button
                                                onClick={() => setEditing({ userId: u.id, value: String(u.dailyLimit ?? 10) })}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold
                                                           text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg
                                                           transition-colors border border-rose-100"
                                            >
                                                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                </svg>
                                                Edit limit
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Save feedback */}
                                {saveMsg.id === u.id && (
                                    <p className={`text-[11px] font-semibold mt-2
                                        ${saveMsg.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {saveMsg.text}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminPanel;
