import React, { useState } from 'react';

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

const BASE_TABS = [
  { id: 'content', label: 'Content', emoji: '✏️' },
  { id: 'style', label: 'Style', emoji: '🎨' },
  { id: 'ai', label: 'AI', emoji: '✦' },
];

const ADMIN_TAB = { id: 'admin', label: 'Admin', emoji: '⚙️' };

const Builder = () => {
  const [activeTab, setActiveTab] = useState('content');
  const { printRef, handleDownload, isPrinting } = usePdfDownload('My_Resume');

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  const { isLoggedIn, user, logout, isAdmin } = useAuth();
  const { syncStatus } = useResume();

  // Build tab list — append Admin tab only for admin users
  const TABS = isAdmin ? [...BASE_TABS, ADMIN_TAB] : BASE_TABS;

  /** Opens the auth modal at a specific tab ('login' | 'signup'). */
  const openAuth = (tab = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex overflow-hidden">

      {/* StyleInjector syncs styleConfig → <style> in <head> without re-renders */}
      <StyleInjector />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />

      {/* ── LEFT: Tabbed Sidebar ─────────────────────────────────── */}
      <div className="no-print w-2/5 flex flex-col h-screen border-r bg-white">

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
                {/* Live sync indicator — only shown when not idle */}
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

          <button
            id="download-pdf-btn"
            onClick={handleDownload}
            disabled={isPrinting}
            className={`
              group flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm
              shadow-md transition-all duration-200 select-none flex-shrink-0
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
                PDF
              </>
            )}
          </button>
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

          {/* CONTENT TAB */}
          <div className={activeTab === 'content' ? 'block' : 'hidden'}>
            {/* Loading overlay while fetching resume from backend */}
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
              <PersonalInfoForm onAuthClick={() => openAuth('login')} />
              <ProfessionalSummaryForm onAuthClick={() => openAuth('login')} />
              <SummaryForm onAuthClick={() => openAuth('login')} />
              <ExperienceForm onAuthClick={() => openAuth('login')} />
              <ProjectForm onAuthClick={() => openAuth('login')} />
              <SkillsForm onAuthClick={() => openAuth('login')} />
              <EducationForm onAuthClick={() => openAuth('login')} />
            </div>
          </div>

          {/* STYLE TAB */}
          <div className={activeTab === 'style' ? 'block' : 'hidden'}>
            <StyleSidebar />
          </div>

          {/* AI TAB */}
          <div className={activeTab === 'ai' ? 'block' : 'hidden'}>
            <AISettingsPanel onOpenAuth={openAuth} />
          </div>

          {/* ADMIN TAB — only rendered for admin users */}
          {isAdmin && (
            <div className={activeTab === 'admin' ? 'block' : 'hidden'}>
              <AdminPanel />
            </div>
          )}

        </div>
      </div>

      {/* ── RIGHT: Live A4 Preview ───────────────────────────────── */}
      <div className="print-preview-wrapper w-3/5 bg-gray-300 p-12 overflow-y-auto h-screen flex justify-center items-start shadow-inner">
        <div className="sticky top-0 transition-transform duration-300 hover:scale-[1.01]">
          <ResumeTemplate ref={printRef} />
        </div>
      </div>

    </div>
  );
};

export default Builder;