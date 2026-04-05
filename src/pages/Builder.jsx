import React, { useState, useEffect } from 'react';

// ── Form components (Content tab) ────────────────────────────────────────────
import PersonalInfoForm from '../components/forms/PersonalInfoForm';
import ProfessionalSummaryForm from '../components/forms/ProfessionalSummaryForm';
import SummaryForm from '../components/forms/SummaryForm';
import ExperienceForm from '../components/forms/ExperienceForm';
import ProjectForm from '../components/forms/ProjectForm';
import SkillsForm from '../components/forms/SkillsForm';
import EducationForm from '../components/forms/EducationForm';

// ── Preview + PDF ─────────────────────────────────────────────────────────────
import ResumeTemplate from '../components/preview/ResumeTemplate';
import usePdfDownload from '../hooks/usePdfDownload';

// ── Style system ──────────────────────────────────────────────────────────────
import StyleSidebar from '../components/style/StyleSidebar';
import StyleInjector from '../components/style/StyleInjector';
import { useStyle } from '../context/StyleContext';
import { defaultStyleConfig } from '../context/StyleContext';

// ── AI system ─────────────────────────────────────────────────────────────────
import AISettingsPanel from '../components/ai/AISettingsPanel';

// ── Auth ──────────────────────────────────────────────────────────────────────
import AuthModal from '../components/auth/AuthModal';
import { useAuth } from '../context/AuthContext';

// ── Resume sync status ────────────────────────────────────────────────────────
import SyncStatusBadge from '../components/common/SyncStatusBadge';
import { useResume } from '../context/ResumeContext';

// ── Admin panel ───────────────────────────────────────────────────────────────
import AdminPanel from '../components/admin/AdminPanel';

// ── Resume manager (multi-resume) ─────────────────────────────────────────────
import ResumeManager from '../components/common/ResumeManager';

// ── Resume importer ───────────────────────────────────────────────────────────
import ResumeImportModal from '../components/import/ResumeImportModal';

const BASE_TABS = [
  { id: 'content', label: 'Content', emoji: '✏️' },
  { id: 'style', label: 'Style', emoji: '🎨' },
  { id: 'ai', label: 'AI', emoji: '✦' },
];

const ADMIN_TAB = { id: 'admin', label: 'Admin', emoji: '⚙️' };

const Builder = () => {
  const [activeTab, setActiveTab] = useState('content');
  const [mobileView, setMobileView] = useState('editor'); // 'editor' | 'preview'
  const { printRef, handleDownload, isPrinting } = usePdfDownload('My_Resume');

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  // Import modal state
  const [importModalOpen, setImportModalOpen] = useState(false);

  const { isLoggedIn, user, token, tokens, refreshUsage, isAdmin } = useAuth();
  const { syncStatus, saveResume, hasUnsavedChanges, selectResume, getResumeStyles, currentResumeId } = useResume();
  const { styleConfig, setStyleConfig } = useStyle();

  /** Save handler — passes current styles along with resume data */
  const handleSave = () => {
    if (!isLoggedIn) return;
    saveResume(styleConfig);
  };

  /** Check tokens and deduct before downloading PDF */
  const handleDownloadClick = async () => {
    if (!isLoggedIn) {
      openAuth('login');
      return;
    }

    if (tokens < 5) {
      alert('Not enough tokens to download. Downloading costs 5 tokens.');
      return;
    }

    // Deduct tokens
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL || 'http://localhost:5001'}/api/ai/deduct-download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to deduct tokens.');
        return;
      }
      refreshUsage(); // update token balance context
      handleDownload(); // trigger actual PDF download
    } catch (err) {
      alert('Network error. Failed to download.');
    }
  };

  /** Select a resume and restore its saved styles */
  const handleSelectResume = (id) => {
    selectResume(id);
    const savedStyles = getResumeStyles(id);
    if (savedStyles) {
      setStyleConfig({ ...defaultStyleConfig, ...savedStyles });
    } else {
      setStyleConfig(defaultStyleConfig);
    }
  };

  // Restore saved styles when a resume is first loaded (e.g. on login)
  useEffect(() => {
    if (!currentResumeId) return;
    const savedStyles = getResumeStyles(currentResumeId);
    if (savedStyles) {
      setStyleConfig({ ...defaultStyleConfig, ...savedStyles });
    }
  }, [currentResumeId]);  // eslint-disable-line react-hooks/exhaustive-deps

  // Build tab list — append Admin tab only for admin users
  const TABS = isAdmin ? [...BASE_TABS, ADMIN_TAB] : BASE_TABS;

  /** Opens the auth modal at a specific tab ('login' | 'signup'). */
  const openAuth = (tab = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  return (
    <div className="builder-root min-h-screen bg-gray-100 flex overflow-hidden">

      {/* StyleInjector syncs styleConfig → <style> in <head> without re-renders */}
      <StyleInjector />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />

      {/* Resume Import Modal */}
      <ResumeImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
      />

      {/* ══════════════════════════════════════════════════════
          MOBILE TOP BAR (hidden on md+)
      ══════════════════════════════════════════════════════ */}
      <div className="no-print mobile-topbar">
        {/* Brand */}
        <h1 className="mobile-brand">Draft2paper</h1>

        {/* Auth chip */}
        <div className="mobile-auth-area">
          {isLoggedIn ? (
            <div className="mobile-avatar-chip">
              <div className="mobile-avatar">
                {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?'}
              </div>
              <SyncStatusBadge status={syncStatus} />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button id="mobile-login-btn" onClick={() => openAuth('login')} className="mobile-auth-btn-ghost">Log in</button>
              <button id="mobile-signup-btn" onClick={() => openAuth('signup')} className="mobile-auth-btn-solid">Sign up</button>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="mobile-actions">
          {isLoggedIn && (
            <button
              id="mobile-save-btn"
              onClick={handleSave}
              disabled={syncStatus === 'saving'}
              className="mobile-save-btn"
            >
              {syncStatus === 'saving' ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                </svg>
              )}
              {hasUnsavedChanges && syncStatus !== 'saving' && (
                <span className="mobile-unsaved-dot" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          DESKTOP LEFT SIDEBAR (hidden on mobile)
      ══════════════════════════════════════════════════════ */}
      <div className="no-print desktop-sidebar">

        {/* Sticky top bar: branding + auth + sync + Download */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 flex-shrink-0 gap-2">
          <h1 className="text-2xl font-black italic tracking-tighter text-blue-600 flex-shrink-0">
            Draft2paper
          </h1>

          {/* Auth chip + sync badge */}
          <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100
                                rounded-full pl-1.5 pr-3 py-1 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-500
                                  flex items-center justify-center text-white font-black text-[10px]">
                    {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 max-w-[80px] truncate">
                    {user?.name ?? user?.email}
                  </span>
                </div>
                <SyncStatusBadge status={syncStatus} />
              </>
            ) : (
              <>
                <button
                  id="open-login-btn"
                  onClick={() => openAuth('login')}
                  className="text-[12px] font-semibold text-slate-500 hover:text-blue-600
                             transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
                >
                  Log in
                </button>
                <button
                  id="open-signup-btn"
                  onClick={() => openAuth('signup')}
                  className="text-[12px] font-bold text-white bg-blue-600 hover:bg-blue-700
                             px-3 py-1.5 rounded-lg transition-colors"
                >
                  Sign up
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isLoggedIn && (
              <button
                id="save-resume-btn"
                onClick={handleSave}
                disabled={syncStatus === 'saving'}
                className={`
                  group relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold text-sm
                  shadow-md transition-all duration-200 select-none
                  ${syncStatus === 'saving'
                    ? 'bg-emerald-400 cursor-not-allowed text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white cursor-pointer'
                  }
                `}
              >
                {syncStatus === 'saving' ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                    </svg>
                    Save
                  </>
                )}
                {hasUnsavedChanges && syncStatus !== 'saving' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400
                                   border-2 border-white animate-pulse" />
                )}
              </button>
            )}

            <button
              id="download-pdf-btn"
              onClick={handleDownloadClick}
              disabled={isPrinting}
              className={`
                group flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm
                shadow-md transition-all duration-200 select-none
                ${isPrinting
                  ? 'bg-blue-400 cursor-not-allowed text-white'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white cursor-pointer'
                }
              `}
            >
              {isPrinting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Preparing…
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  PDF (5 tokens)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-4 pb-0 flex-shrink-0">
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-1.5
                  py-2 px-2 rounded-lg text-xs font-semibold
                  transition-all duration-200
                  ${activeTab === tab.id
                    ? tab.id === 'ai'
                      ? 'bg-white text-violet-600 shadow-sm'
                      : tab.id === 'admin'
                        ? 'bg-white text-rose-600 shadow-sm'
                        : 'tab-active'
                    : 'tab-inactive'
                  }
                `}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable panel area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-8 pt-6">
          <div className={activeTab === 'content' ? 'block' : 'hidden'}>
            {syncStatus === 'loading' && (
              <div className="flex flex-col items-center justify-center py-20 gap-4 animate-pulse">
                <svg className="w-8 h-8 text-blue-500 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm font-semibold text-slate-500">Loading your resume…</p>
              </div>
            )}
            <div className={`space-y-8 pb-24 ${syncStatus === 'loading' ? 'opacity-0 pointer-events-none h-0 overflow-hidden' : ''}`}>
              {isLoggedIn && <ResumeManager onSelectResume={handleSelectResume} />}
              {isLoggedIn && (
                <button
                  id="import-resume-btn"
                  onClick={() => setImportModalOpen(true)}
                  className="import-content-btn"
                >
                  <div className="import-content-btn-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M16 12l-4-4m0 0l-4 4m4-4v12" />
                    </svg>
                  </div>
                  <div className="import-content-btn-text">
                    <span className="import-content-btn-title">Import Existing Resume</span>
                    <span className="import-content-btn-sub">Upload a PDF, DOCX, or TXT — AI will auto-fill all fields</span>
                  </div>
                  <span className="import-content-btn-cost">10 Tokens</span>
                </button>
              )}
              <PersonalInfoForm onAuthClick={() => openAuth('login')} />
              <ProfessionalSummaryForm onAuthClick={() => openAuth('login')} />
              <SummaryForm onAuthClick={() => openAuth('login')} />
              <ExperienceForm onAuthClick={() => openAuth('login')} />
              <ProjectForm onAuthClick={() => openAuth('login')} />
              <SkillsForm onAuthClick={() => openAuth('login')} />
              <EducationForm onAuthClick={() => openAuth('login')} />
            </div>
          </div>
          <div className={activeTab === 'style' ? 'block' : 'hidden'}><StyleSidebar /></div>
          <div className={activeTab === 'ai' ? 'block' : 'hidden'}><AISettingsPanel onOpenAuth={openAuth} /></div>
          {isAdmin && (
            <div className={activeTab === 'admin' ? 'block' : 'hidden'}><AdminPanel /></div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MOBILE EDITOR PANEL (full screen, shown when mobileView==='editor')
      ══════════════════════════════════════════════════════ */}
      <div className={`no-print mobile-editor-panel ${mobileView === 'editor' ? 'mobile-panel-visible' : 'mobile-panel-hidden'}`}>

        {/* Mobile Tab Bar */}
        <div className="mobile-inner-tabs">
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                id={`mobile-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-1
                  py-2 px-1 rounded-lg text-[11px] font-semibold
                  transition-all duration-200
                  ${activeTab === tab.id
                    ? tab.id === 'ai'
                      ? 'bg-white text-violet-600 shadow-sm'
                      : tab.id === 'admin'
                        ? 'bg-white text-rose-600 shadow-sm'
                        : 'tab-active'
                    : 'tab-inactive'
                  }
                `}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pt-4">
          <div className={activeTab === 'content' ? 'block' : 'hidden'}>
            {syncStatus === 'loading' && (
              <div className="flex flex-col items-center justify-center py-16 gap-4 animate-pulse">
                <svg className="w-8 h-8 text-blue-500 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm font-semibold text-slate-500">Loading your resume…</p>
              </div>
            )}
            <div className={`space-y-6 pb-32 ${syncStatus === 'loading' ? 'opacity-0 pointer-events-none h-0 overflow-hidden' : ''}`}>
              {isLoggedIn && <ResumeManager onSelectResume={handleSelectResume} />}
              {isLoggedIn && (
                <button
                  id="mobile-import-resume-btn"
                  onClick={() => setImportModalOpen(true)}
                  className="import-content-btn"
                >
                  <div className="import-content-btn-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M16 12l-4-4m0 0l-4 4m4-4v12" />
                    </svg>
                  </div>
                  <div className="import-content-btn-text">
                    <span className="import-content-btn-title">Import Existing Resume</span>
                    <span className="import-content-btn-sub">Upload PDF, DOCX or TXT — AI auto-fills all fields</span>
                  </div>
                  <span className="import-content-btn-cost">10 Tokens</span>
                </button>
              )}
              <PersonalInfoForm onAuthClick={() => openAuth('login')} />
              <ProfessionalSummaryForm onAuthClick={() => openAuth('login')} />
              <SummaryForm onAuthClick={() => openAuth('login')} />
              <ExperienceForm onAuthClick={() => openAuth('login')} />
              <ProjectForm onAuthClick={() => openAuth('login')} />
              <SkillsForm onAuthClick={() => openAuth('login')} />
              <EducationForm onAuthClick={() => openAuth('login')} />
            </div>
          </div>
          <div className={activeTab === 'style' ? 'block pb-32' : 'hidden'}><StyleSidebar /></div>
          <div className={activeTab === 'ai' ? 'block pb-32' : 'hidden'}><AISettingsPanel onOpenAuth={openAuth} /></div>
          {isAdmin && (
            <div className={activeTab === 'admin' ? 'block pb-32' : 'hidden'}><AdminPanel /></div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MOBILE PREVIEW PANEL (full screen, shown when mobileView==='preview')
      ══════════════════════════════════════════════════════ */}
      <div className={`mobile-preview-panel ${mobileView === 'preview' ? 'mobile-panel-visible' : 'mobile-panel-hidden'}`}>
        <div className="mobile-preview-scroll">
          <div className="mobile-resume-scaler">
            <ResumeTemplate ref={printRef} />
          </div>
        </div>

        {/* Floating Download FAB */}
        <button
          id="mobile-download-fab"
          onClick={handleDownloadClick}
          disabled={isPrinting}
          className="mobile-download-fab"
        >
          {isPrinting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Preparing…</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download PDF</span>
            </>
          )}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════
          DESKTOP PREVIEW (hidden on mobile)
      ══════════════════════════════════════════════════════ */}
      <div className="print-preview-wrapper desktop-preview w-3/5 bg-gray-300 p-12 overflow-y-auto h-screen flex justify-center items-start shadow-inner">
        <div className="sticky top-0 transition-transform duration-300 hover:scale-[1.01]">
          <ResumeTemplate ref={printRef} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MOBILE BOTTOM NAV BAR
      ══════════════════════════════════════════════════════ */}
      <div className="no-print mobile-bottom-nav">
        <button
          id="mobile-nav-editor"
          onClick={() => setMobileView('editor')}
          className={`mobile-nav-btn ${mobileView === 'editor' ? 'mobile-nav-active' : 'mobile-nav-inactive'}`}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Editor</span>
        </button>
        <button
          id="mobile-nav-preview"
          onClick={() => setMobileView('preview')}
          className={`mobile-nav-btn ${mobileView === 'preview' ? 'mobile-nav-active' : 'mobile-nav-inactive'}`}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Preview</span>
        </button>
      </div>

    </div>
  );
};

export default Builder;