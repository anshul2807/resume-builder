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

/**
 * Builder — main page
 *
 * Layout
 * ──────────────────────────────────────────────────────────────────────────
 *  LEFT (2/5)   Tabbed sidebar
 *               • "Content" tab → all data-entry forms (existing)
 *               • "Style" tab   → StyleSidebar sliders/pickers
 *
 *  RIGHT (3/5)  Live A4 preview — ResumeTemplate (never re-renders on
 *               style changes thanks to StyleInjector + CSS variables)
 *
 * Style update flow (zero ResumeTemplate re-renders)
 * ──────────────────────────────────────────────────────────────────────────
 *  1. User moves a slider in StyleSidebar
 *  2. updateStyle() updates StyleContext state
 *  3. StyleInjector (tiny, renders-nothing component) re-renders
 *  4. useLayoutEffect writes targeted CSS rules into a <style> tag in <head>
 *  5. Browser recalculates CSS for #resume-preview — instant paint
 *  6. ResumeTemplate is untouched by React reconciliation
 */

const TABS = [
  { id: 'content', label: 'Content', emoji: '✏️' },
  { id: 'style', label: 'Style', emoji: '🎨' },
];

const Builder = () => {
  const [activeTab, setActiveTab] = useState('content');
  const { printRef, handleDownload, isPrinting } = usePdfDownload('My_Resume');

  return (
    <div className="min-h-screen bg-gray-100 flex overflow-hidden">

      {/*
        StyleInjector sits here, outside both sidebars.
        It renders null to the DOM but imperatively syncs styleConfig →
        <style id="resume-dynamic-styles"> in document.head on every
        styleConfig change, before the browser paints.
      */}
      <StyleInjector />

      {/* ── LEFT: Tabbed Sidebar ─────────────────────────────────── */}
      <div className="no-print w-2/5 flex flex-col h-screen border-r bg-white">

        {/* Sticky top bar: branding + Download */}
        <div className="flex justify-between items-center px-8 py-4 border-b border-slate-100 flex-shrink-0">
          <h1 className="text-2xl font-black italic tracking-tighter text-blue-600">
            RESUME.io
          </h1>

          <button
            id="download-pdf-btn"
            onClick={handleDownload}
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
                Download PDF
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
                  py-2 px-3 rounded-lg text-sm font-semibold
                  transition-all duration-200
                  ${activeTab === tab.id ? 'tab-active' : 'tab-inactive'}
                `}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable panel area — swaps between Content and Style */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-8 pt-6">

          {/* CONTENT TAB ── all the resume data-entry forms */}
          <div className={activeTab === 'content' ? 'block' : 'hidden'}>
            <div className="space-y-8 pb-24">
              <PersonalInfoForm />
              <ProfessionalSummaryForm />
              <SummaryForm />
              <ExperienceForm />
              <ProjectForm />
              <SkillsForm />
              <EducationForm />
            </div>
          </div>

          {/* STYLE TAB ── granular visual controls */}
          <div className={activeTab === 'style' ? 'block' : 'hidden'}>
            {/*
              StyleSidebar calls updateStyle() from StyleContext.
              Those updates flow to StyleInjector which writes CSS to a
              <style> tag — ResumeTemplate NEVER re-renders.
            */}
            <StyleSidebar />
          </div>

        </div>
      </div>

      {/* ── RIGHT: Live A4 Preview ───────────────────────────────── */}
      <div className="print-preview-wrapper w-3/5 bg-gray-300 p-12 overflow-y-auto h-screen flex justify-center items-start shadow-inner">
        <div className="sticky top-0 transition-transform duration-300 hover:scale-[1.01]">
          {/*
            printRef targets this exact DOM node — react-to-print captures it.
            ResumeTemplate does NOT consume StyleContext; it only reflects
            the injected <style> tag rules. Zero re-renders on style changes.
          */}
          <ResumeTemplate ref={printRef} />
        </div>
      </div>

    </div>
  );
};

export default Builder;