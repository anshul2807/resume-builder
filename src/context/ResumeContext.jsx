import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { initialResumeData } from '../utils/initialResumeData';

const ResumeContext = createContext();

/**
 * syncStatus values:
 *  'idle'    — nothing happening
 *  'saving'  — POST/PUT in progress
 *  'saved'   — last save succeeded (shown briefly then resets to idle)
 *  'error'   — last save failed
 *  'loading' — fetching resumes from backend after login
 *
 * Backend API:
 *  GET    /api/resume       → [{ _id, userId, data: { personalInfo, … , styles } }]
 *  POST   /api/resume       → { message, resume }   (create)
 *  PUT    /api/resume/:id   → { message, resume }   (update)
 *  DELETE /api/resume/:id   → { message }
 *
 * The actual resume content (personalInfo, experience, etc.) + styles
 * are stored inside `resume.data`.
 */

export const ResumeProvider = ({ children }) => {
    const { isLoggedIn, token } = useAuth();

    // ── Active resume being edited ──────────────────────────────────────────
    const [localResumeData, setLocalResumeData] = useState(initialResumeData);

    // ── Multiple-resume state (logged-in only) ──────────────────────────────
    const [resumes, setResumes] = useState([]);   // raw backend docs: [{ _id, data, … }]
    const [currentResumeId, setCurrentResumeId] = useState(null);

    // ── Sync status (shown in the UI) ──────────────────────────────────────
    const [syncStatus, setSyncStatus] = useState('idle');

    // Track unsaved changes — true when user has edited since last save/load
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Whether we've completed the initial backend fetch for this session.
    const hasFetchedRef = useRef(false);
    const savedTimer = useRef(null);

    // Guard against interactions while initial load is in progress.
    const isLoadingRef = useRef(false);

    // ── Helper: extract resume content from a backend doc ───────────────────
    const extractData = (doc) => {
        // Backend stores content in `doc.data`
        if (doc?.data && typeof doc.data === 'object') {
            return { ...initialResumeData, ...doc.data };
        }
        // Fallback: if data is at top level (legacy)
        if (doc?.personalInfo) {
            return { ...initialResumeData, ...doc };
        }
        return initialResumeData;
    };

    // ── Fetch all resumes from backend ──────────────────────────────────────
    const loadAllResumes = useCallback(async () => {
        if (!isLoggedIn || !token) return;

        setSyncStatus('loading');
        isLoadingRef.current = true;
        try {
            const res = await fetch(`${BASE_URL}/api/resume`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error();

            const docs = await res.json();

            if (Array.isArray(docs) && docs.length > 0) {
                setResumes(docs);
                // Load the first resume into the editor
                const first = docs[0];
                setLocalResumeData(extractData(first));
                setCurrentResumeId(first._id);
                setHasUnsavedChanges(false);
            } else {
                setResumes([]);
                setLocalResumeData(initialResumeData);
                setCurrentResumeId(null);
                setHasUnsavedChanges(false);
            }

            setSyncStatus('idle');
        } catch {
            setSyncStatus('idle');
        } finally {
            isLoadingRef.current = false;
        }
    }, [isLoggedIn, token]);

    // Trigger initial fetch on login / page refresh
    useEffect(() => {
        if (!isLoggedIn || !token) {
            hasFetchedRef.current = false;
            setResumes([]);
            setLocalResumeData(initialResumeData);
            setCurrentResumeId(null);
            setHasUnsavedChanges(false);
            return;
        }

        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;
        loadAllResumes();
    }, [isLoggedIn, token, loadAllResumes]);

    // ── Manual save (no auto-save) ──────────────────────────────────────────
    /**
     * Save the current resume to backend.
     * @param {object} styleConfig — current style configuration to persist
     */
    const saveResume = useCallback(async (styleConfig) => {
        if (!isLoggedIn || !token) return;

        clearTimeout(savedTimer.current);
        setSyncStatus('saving');

        // Build payload: resume content + styles
        // Strip any MongoDB / backend fields that might have leaked into local state
        const { _id, __v, userId, createdAt, updatedAt, ...cleanData } = localResumeData;
        const payload = { ...cleanData };
        if (styleConfig) {
            payload.styles = styleConfig;
        }


        try {
            let res;

            if (currentResumeId) {
                // ── UPDATE existing resume ───────────────────────────────────
                res = await fetch(`${BASE_URL}/api/resume/${currentResumeId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                });
            } else {
                // ── CREATE new resume ────────────────────────────────────────
                res = await fetch(`${BASE_URL}/api/resume`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                });
            }

            if (res.ok) {
                const body = await res.json();
                // Response: { message, resume }
                const savedDoc = body.resume || body;
                const savedId = savedDoc._id || savedDoc.id;

                if (!currentResumeId && savedId) {
                    setCurrentResumeId(savedId);
                }

                // Update the resumes list
                setResumes((prev) => {
                    const idx = prev.findIndex((r) => r._id === savedId);
                    if (idx >= 0) {
                        const copy = [...prev];
                        copy[idx] = savedDoc;
                        return copy;
                    }
                    return [...prev, savedDoc];
                });

                setSyncStatus('saved');
                setHasUnsavedChanges(false);
            } else {
                setSyncStatus('error');
            }
        } catch {
            setSyncStatus('error');
        }

        // Reset to idle after a bit
        savedTimer.current = setTimeout(() => setSyncStatus('idle'), 2500);
    }, [isLoggedIn, token, localResumeData, currentResumeId]);

    // ── Public helpers ──────────────────────────────────────────────────────

    /** Update a single section of the active resume (local only, no auto-save). */
    const updateResumeData = (section, data) => {
        setLocalResumeData((prev) => ({ ...prev, [section]: data }));
        setHasUnsavedChanges(true);
    };

    /** Create a brand new resume (starts from template). */
    const createNewResume = () => {
        setLocalResumeData(initialResumeData);
        setCurrentResumeId(null);
        setHasUnsavedChanges(false);
        setSyncStatus('idle');
    };

    /** Switch the editor to an existing resume. */
    const selectResume = (id) => {
        const found = resumes.find((r) => r._id === id);
        if (found) {
            setLocalResumeData(extractData(found));
            setCurrentResumeId(id);
            setHasUnsavedChanges(false);
            setSyncStatus('idle');
        }
    };

    /** Get the styles saved with a resume (for restoring on select). */
    const getResumeStyles = (id) => {
        const found = resumes.find((r) => r._id === id);
        if (found?.data?.styles) return found.data.styles;
        return null;
    };

    /** Delete a resume by id. */
    const deleteResume = async (id) => {
        if (!isLoggedIn || !token) return;

        try {
            const res = await fetch(`${BASE_URL}/api/resume/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                setResumes((prev) => prev.filter((r) => r._id !== id));

                if (currentResumeId === id) {
                    const remaining = resumes.filter((r) => r._id !== id);
                    if (remaining.length > 0) {
                        const next = remaining[0];
                        setLocalResumeData(extractData(next));
                        setCurrentResumeId(next._id);
                    } else {
                        setLocalResumeData(initialResumeData);
                        setCurrentResumeId(null);
                    }
                    setHasUnsavedChanges(false);
                }
            }
        } catch (err) {
            console.error('Delete resume failed:', err);
        }
    };

    return (
        <ResumeContext.Provider
            value={{
                resumeData: localResumeData,
                updateResumeData,
                syncStatus,
                hasUnsavedChanges,
                // Manual save
                saveResume,
                // Multi-resume API
                resumes,
                currentResumeId,
                createNewResume,
                selectResume,
                deleteResume,
                refreshResumes: loadAllResumes,
                getResumeStyles,
            }}
        >
            {children}
        </ResumeContext.Provider>
    );
};

export const useResume = () => useContext(ResumeContext);