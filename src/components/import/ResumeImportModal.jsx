import React, { useState, useRef, useCallback } from 'react';
import { BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useResume } from '../../context/ResumeContext';
import { initialResumeData } from '../../utils/initialResumeData';

// ─── File reader helpers ──────────────────────────────────────────────────────

/** Read a plain-text or .md file */
const readTextFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });

/**
 * Extract raw text from a PDF using the browser's built-in PDF.js via a
 * simple approach — we base64-encode the file and ask the backend to parse it.
 * For non-PDF text files we just read as plain text.
 */
const readFileAsBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      // e.target.result is like "data:application/pdf;base64,..."
      const base64 = e.target.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

// ─── Accepted file types ──────────────────────────────────────────────────────
const ACCEPTED = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'text/plain': '.txt',
};
const ACCEPTED_ATTR = Object.keys(ACCEPTED).join(',');

// ─── Component ────────────────────────────────────────────────────────────────
const ResumeImportModal = ({ isOpen, onClose }) => {
  const { token, refreshUsage } = useAuth();
  const { updateResumeData } = useResume();

  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | reading | parsing | done | error
  const [errorMsg, setErrorMsg] = useState('');
  const [parsedPreview, setParsedPreview] = useState(null);
  const fileInputRef = useRef(null);

  const reset = () => {
    setFile(null);
    setPhase('idle');
    setErrorMsg('');
    setParsedPreview(null);
    setDragOver(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // ── Drag-and-drop ─────────────────────────────────────────────────────────
  const onDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSetFile(dropped);
  };

  const validateAndSetFile = (f) => {
    if (!ACCEPTED[f.type]) {
      setErrorMsg('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setErrorMsg('File is too large. Maximum size is 5 MB.');
      return;
    }
    setErrorMsg('');
    setFile(f);
    setParsedPreview(null);
    setPhase('idle');
  };

  // ── Parse flow ────────────────────────────────────────────────────────────
  const handleParse = useCallback(async () => {
    if (!file) return;
    setPhase('reading');
    setErrorMsg('');

    try {
      let payload;

      if (file.type === 'text/plain') {
        // Plain text — send as text directly
        const text = await readTextFile(file);
        payload = { text, fileName: file.name };
      } else {
        // PDF / DOCX — send as base64 for server-side extraction
        const base64 = await readFileAsBase64(file);
        payload = { base64, mimeType: file.type, fileName: file.name };
      }

      setPhase('parsing');

      const res = await fetch(`${BASE_URL}/api/ai/import-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || err?.message || `Server error (${res.status})`);
      }

      const data = await res.json();
      // data.parsed is the structured resume JSON
      setParsedPreview(data.parsed);
      setPhase('done');
      refreshUsage(); // update token balance in UI
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      setPhase('error');
    }
  }, [file, token]);

  // ── Apply parsed data to the resume fields ────────────────────────────────
  const handleApply = () => {
    if (!parsedPreview) return;

    const merged = { ...initialResumeData, ...parsedPreview };

    // Apply each section through the context updater
    const sections = [
      'personalInfo', 'summary', 'experience',
      'projects', 'skills', 'education', 'achievements',
    ];
    sections.forEach((section) => {
      if (merged[section] !== undefined) {
        updateResumeData(section, merged[section]);
      }
    });

    handleClose();
  };

  if (!isOpen) return null;

  // ── Render helpers ────────────────────────────────────────────────────────
  const isLoading = phase === 'reading' || phase === 'parsing';

  const phaseLabel = {
    reading: 'Reading file…',
    parsing: 'AI is analysing your resume…',
  }[phase] || '';

  return (
    <div className="import-modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="import-modal">

        {/* ── Header ── */}
        <div className="import-modal-header">
          <div className="import-modal-header-left">
            <div className="import-modal-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M16 12l-4-4m0 0l-4 4m4-4v12" />
              </svg>
            </div>
            <div>
              <h2 className="import-modal-title">Import Resume</h2>
              <p className="import-modal-subtitle">AI will auto-fill all fields from your existing resume</p>
            </div>
          </div>
          <button className="import-modal-close" onClick={handleClose} aria-label="Close">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="import-modal-body">

          {/* Drop zone */}
          {phase !== 'done' && (
            <div
              className={`import-dropzone ${dragOver ? 'import-dropzone-active' : ''} ${file ? 'import-dropzone-has-file' : ''}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => !isLoading && fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_ATTR}
                className="hidden"
                onChange={(e) => e.target.files[0] && validateAndSetFile(e.target.files[0])}
              />

              {isLoading ? (
                /* Loading state */
                <div className="import-loading">
                  <div className="import-spinner-ring" />
                  <p className="import-loading-label">{phaseLabel}</p>
                  <p className="import-loading-sub">This usually takes 5–15 seconds</p>
                </div>
              ) : file ? (
                /* File selected */
                <div className="import-file-selected">
                  <div className="import-file-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="import-file-name">{file.name}</p>
                    <p className="import-file-size">{(file.size / 1024).toFixed(1)} KB • Click to change</p>
                  </div>
                </div>
              ) : (
                /* Empty state */
                <div className="import-empty">
                  <div className="import-upload-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M16 12l-4-4m0 0l-4 4m4-4v12" />
                    </svg>
                  </div>
                  <p className="import-drop-label">Drop your resume here</p>
                  <p className="import-drop-sub">or <span className="import-drop-link">click to browse</span></p>
                  <div className="import-type-badges">
                    {['PDF', 'DOCX', 'TXT'].map((t) => (
                      <span key={t} className="import-type-badge">{t}</span>
                    ))}
                    <span className="import-type-badge">Max 5 MB</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {errorMsg && (
            <div className="import-error">
              <svg viewBox="0 0 20 20" fill="currentColor" className="import-error-icon">
                <path fillRule="evenodd" clipRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ── Done: parsed preview ── */}
          {phase === 'done' && parsedPreview && (
            <div className="import-preview">
              <div className="import-preview-header">
                <div className="import-preview-success-badge">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" clipRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                  Resume parsed successfully
                </div>
                <button className="import-change-file-btn" onClick={() => { reset(); }}>
                  Change file
                </button>
              </div>

              <div className="import-preview-grid">

                {/* Personal Info */}
                {parsedPreview.personalInfo && (
                  <PreviewSection title="Personal Info" icon="👤">
                    <PreviewRow label="Name" value={parsedPreview.personalInfo.fullName} />
                    <PreviewRow label="Email" value={parsedPreview.personalInfo.email} />
                    <PreviewRow label="Phone" value={parsedPreview.personalInfo.phone} />
                    <PreviewRow label="Location" value={parsedPreview.personalInfo.location} />
                  </PreviewSection>
                )}

                {/* Summary */}
                {parsedPreview.summary && (
                  <PreviewSection title="Summary" icon="📝" fullWidth>
                    <p className="import-preview-text">{parsedPreview.summary}</p>
                  </PreviewSection>
                )}

                {/* Experience */}
                {parsedPreview.experience?.length > 0 && (
                  <PreviewSection title={`Experience (${parsedPreview.experience.length})`} icon="💼" fullWidth>
                    {parsedPreview.experience.map((exp, i) => (
                      <div key={i} className="import-preview-entry">
                        <p className="import-preview-entry-title">{exp.role} — {exp.company}</p>
                        <p className="import-preview-entry-sub">{exp.duration}</p>
                      </div>
                    ))}
                  </PreviewSection>
                )}

                {/* Education */}
                {parsedPreview.education?.length > 0 && (
                  <PreviewSection title={`Education (${parsedPreview.education.length})`} icon="🎓">
                    {parsedPreview.education.map((edu, i) => (
                      <div key={i} className="import-preview-entry">
                        <p className="import-preview-entry-title">{edu.degree}</p>
                        <p className="import-preview-entry-sub">{edu.school}</p>
                      </div>
                    ))}
                  </PreviewSection>
                )}

                {/* Skills */}
                {parsedPreview.skills && (
                  <PreviewSection title="Skills" icon="⚡">
                    {Object.entries(parsedPreview.skills).filter(([, v]) => v).map(([k, v]) => (
                      <PreviewRow key={k} label={k} value={typeof v === 'string' ? v : v.join(', ')} />
                    ))}
                  </PreviewSection>
                )}

              </div>

              <p className="import-preview-note">
                ✨ All fields will be replaced with the imported data. You can edit them afterwards.
              </p>
            </div>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="import-modal-footer">
          <button className="import-cancel-btn" onClick={handleClose} disabled={isLoading}>
            Cancel
          </button>
          {phase !== 'done' ? (
            <button
              className="import-parse-btn"
              onClick={handleParse}
              disabled={!file || isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {phaseLabel || 'Analysing…'}
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M12 2C6.8 7.2 6.8 16.8 12 22c5.2-5.2 5.2-14.8 0-20Z" opacity=".9" />
                    <path d="M2 12c5.2-5.2 14.8-5.2 20 0-5.2 5.2-14.8 5.2-20 0Z" opacity=".5" />
                  </svg>
                  Parse with AI
                </>
              )}
            </button>
          ) : (
            <button className="import-apply-btn" onClick={handleApply}>
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" clipRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
              </svg>
              Apply to Resume
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

// ─── Small helper components ──────────────────────────────────────────────────

const PreviewSection = ({ title, icon, children, fullWidth }) => (
  <div className={`import-preview-section ${fullWidth ? 'import-preview-section-full' : ''}`}>
    <p className="import-preview-section-title">
      <span>{icon}</span> {title}
    </p>
    <div className="import-preview-section-body">{children}</div>
  </div>
);

const PreviewRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="import-preview-row">
      <span className="import-preview-row-label">{label}</span>
      <span className="import-preview-row-value">{value}</span>
    </div>
  );
};

export default ResumeImportModal;
