import React, { useState } from 'react';
import { useResume } from '../../context/ResumeContext';

/**
 * ResumeManager — shown at the top of the Content tab for logged-in users.
 *
 * Features:
 *  • Shows all saved resumes as compact cards
 *  • Click a card to switch to that resume
 *  • "New Resume" button to start from scratch
 *  • Delete button with confirmation on each card
 *
 * Backend docs have shape: { _id, userId, data: { personalInfo, experience, … } }
 */
const ResumeManager = ({ onSelectResume }) => {
    const {
        resumes,
        currentResumeId,
        createNewResume,
        selectResume,
        deleteResume,
    } = useResume();

    // Use the prop if provided (handles style restore), else fall back to context
    const handleSelect = onSelectResume || selectResume;

    const [deletingId, setDeletingId] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleDelete = async (id) => {
        await deleteResume(id);
        setDeletingId(null);
    };

    /** Extract resume content — backend stores it in doc.data */
    const getData = (doc) => doc?.data || doc || {};

    /** Derive a display title from the resume's personalInfo or fallback. */
    const getTitle = (doc) => {
        const d = getData(doc);
        const name = d.personalInfo?.fullName?.trim();
        if (name && name !== 'FIRSTNAME LASTNAME') return name;
        return 'Untitled Resume';
    };

    /** Derive a subtitle snippet from experience or summary. */
    const getSubtitle = (doc) => {
        const d = getData(doc);
        if (d.experience?.[0]?.role) return d.experience[0].role;
        if (d.summary) return d.summary.slice(0, 60) + (d.summary.length > 60 ? '…' : '');
        return 'No content yet';
    };

    const isActive = (doc) => doc._id === currentResumeId;

    return (
        <div className="rm-container">
            {/* ── Header row ────────────────────────────────────────── */}
            <div className="rm-header" onClick={() => setIsCollapsed(!isCollapsed)}>
                <div className="rm-header-left">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="rm-header-icon">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                    <span className="rm-header-title">My Resumes</span>
                    <span className="rm-header-count">{resumes.length}</span>
                </div>
                <div className="rm-header-right">
                    <button
                        id="new-resume-btn"
                        className="rm-new-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            createNewResume();
                        }}
                        title="Create new resume"
                    >
                        <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }}>
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        New
                    </button>
                    <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className={`rm-collapse-icon ${isCollapsed ? 'rm-collapsed' : ''}`}
                    >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>

            {/* ── Resume list ────────────────────────────────────────── */}
            {!isCollapsed && (
                <div className="rm-list">
                    {resumes.length === 0 ? (
                        <div className="rm-empty">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="rm-empty-icon">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            <p>No saved resumes yet</p>
                            <span>Click the Save button to save your first resume</span>
                        </div>
                    ) : (
                        resumes.map((doc) => {
                            const id = doc._id;
                            const active = isActive(doc);
                            return (
                                <div
                                    key={id}
                                    className={`rm-card ${active ? 'rm-card-active' : ''}`}
                                    onClick={() => !active && handleSelect(id)}
                                >
                                    <div className={`rm-card-dot ${active ? 'rm-dot-active' : ''}`} />

                                    <div className="rm-card-body">
                                        <p className="rm-card-title">{getTitle(doc)}</p>
                                        <p className="rm-card-subtitle">{getSubtitle(doc)}</p>
                                    </div>

                                    <div className="rm-card-actions" onClick={(e) => e.stopPropagation()}>
                                        {active && (
                                            <span className="rm-active-badge">Editing</span>
                                        )}

                                        {deletingId === id ? (
                                            <div className="rm-confirm">
                                                <button
                                                    className="rm-confirm-yes"
                                                    onClick={() => handleDelete(id)}
                                                    title="Confirm delete"
                                                >
                                                    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }}>
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="rm-confirm-no"
                                                    onClick={() => setDeletingId(null)}
                                                    title="Cancel"
                                                >
                                                    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }}>
                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                className="rm-delete-btn"
                                                onClick={() => setDeletingId(id)}
                                                title="Delete resume"
                                            >
                                                <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }}>
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Currently editing a new (unsaved) resume indicator */}
                    {!currentResumeId && resumes.length > 0 && (
                        <div className="rm-card rm-card-active rm-card-new">
                            <div className="rm-card-dot rm-dot-new" />
                            <div className="rm-card-body">
                                <p className="rm-card-title">New Resume</p>
                                <p className="rm-card-subtitle">Not saved yet — click Save</p>
                            </div>
                            <span className="rm-active-badge rm-badge-new">New</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ResumeManager;
