import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { initialResumeData } from '../utils/initialResumeData';

const ResumeContext = createContext();

/**
 * syncStatus values:
 *  'idle'    — no pending save, nothing happened yet
 *  'syncing' — actively saving to backend
 *  'saved'   — last save succeeded (shown briefly then resets to idle)
 *  'error'   — last save failed
 *  'loading' — fetching resume from backend after login
 */

// Debounce delay (ms) before auto-saving to backend after the user stops typing.
const SAVE_DEBOUNCE_MS = 800;

export const ResumeProvider = ({ children }) => {
    const { isLoggedIn, token } = useAuth();

    // ── Local / guest state ────────────────────────────────────────────────
    const [localResumeData, setLocalResumeData] = useState(initialResumeData);

    // ── Sync status (shown in the UI) ──────────────────────────────────────
    const [syncStatus, setSyncStatus] = useState('idle'); // 'idle'|'loading'|'syncing'|'saved'|'error'

    // Whether we've completed the initial backend fetch for this session.
    const hasFetchedRef = useRef(false);

    // Debounce + status refs
    const syncTimeout = useRef(null);
    const savedTimer = useRef(null);

    // Track whether a load is in progress so we don't auto-save the template
    // data that's set before the backend response arrives.
    const isLoadingRef = useRef(false);

    // ── Load resume from backend on login / page refresh ────────────────────
    useEffect(() => {
        // Not logged in — reset fetch flag so we re-fetch if user logs in again.
        if (!isLoggedIn || !token) {
            hasFetchedRef.current = false;
            return;
        }

        // Already fetched this session — skip (prevents duplicate calls on
        // hot-reload or unrelated state changes).
        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;

        const loadFromBackend = async () => {
            setSyncStatus('loading');
            isLoadingRef.current = true;
            try {
                const res = await fetch(`${BASE_URL}/api/resume`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();

                    if (data && Object.keys(data).length > 0 && data.personalInfo) {
                        // Backend has saved resume data — use it
                        // Merge: backend data wins, but fill any missing keys from template
                        setLocalResumeData({ ...initialResumeData, ...data });
                    } else {
                        // No valid resume on backend — show the default template
                        setLocalResumeData(initialResumeData);
                    }
                }
                setSyncStatus('idle');
            } catch {
                setSyncStatus('idle'); // silent — backend might not be up yet
            } finally {
                isLoadingRef.current = false;
            }
        };

        loadFromBackend();
    }, [isLoggedIn, token]);

    // ── Save to backend (debounced) ─────────────────────────────────────────
    const syncToBackend = useCallback(
        (data) => {
            if (!isLoggedIn || !token) return;

            // Don't auto-save while we're still loading from backend
            if (isLoadingRef.current) return;

            // Cancel pending debounce + clear any "saved" reset timer
            clearTimeout(syncTimeout.current);
            clearTimeout(savedTimer.current);

            setSyncStatus('syncing');
            syncTimeout.current = setTimeout(async () => {
                try {
                    const res = await fetch(`${BASE_URL}/api/resume`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(data),
                    });
                    setSyncStatus(res.ok ? 'saved' : 'error');
                } catch {
                    setSyncStatus('error');
                }
                // Reset to idle after 2.5s so the badge disappears
                savedTimer.current = setTimeout(() => setSyncStatus('idle'), 2500);
            }, SAVE_DEBOUNCE_MS);
        },
        [isLoggedIn, token]
    );

    // ── Public update function ──────────────────────────────────────────────
    const updateResumeData = (section, data) => {
        setLocalResumeData((prev) => {
            const next = { ...prev, [section]: data };
            syncToBackend(next);
            return next;
        });
    };

    return (
        <ResumeContext.Provider value={{ resumeData: localResumeData, updateResumeData, syncStatus }}>
            {children}
        </ResumeContext.Provider>
    );
};

export const useResume = () => useContext(ResumeContext);